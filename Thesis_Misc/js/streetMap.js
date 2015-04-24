var StreetMapGlobals ={
    "rootNodes": {},
    "gainScale": null,
    "lossScale": null,
    "selectTransitLine" : function(lineName){
        street_viz.TransitLines.eachLayer(function(layer){
            if (lookUp[layer.feature.properties.NAME] === lineName){
                layer.setStyle({color :'yellow', weight: 15})
            } else {
                layer.setStyle(styles.transitStyle(layer.feature))
            }
        })
     },
    "updateThePoints" : function(route){
        console.log("in the update points", route+"_");
        route = route.trim();
        d3.selectAll(".transitChange")
            .transition()
            .duration(2000)
            .attr("r", function(d) {
                if (Object.keys(StreetMapGlobals.rootNodes[d.properties.A_1].Lines).indexOf(route) > -1){
                    if (StreetMapGlobals.rootNodes[d.properties["A_1"]] !== undefined){
                        if (map.getZoom() <= 13){
                            var check = StreetMapGlobals.rootNodes[d.properties["A_1"]].Total;
                        } else {
                            check = StreetMapGlobals.rootNodes[d.properties["A_1"]].Total
                        }
                        return check > 200 ? StreetMapGlobals.gainScale(check) * 2:
                            check < -50 ? StreetMapGlobals.lossScale(Math.abs(check)) *2 :
                                check === 0 ? 0 : 0}
                } else {
                    if (StreetMapGlobals.rootNodes[d.properties["A_1"]] !== undefined){
                        if (map.getZoom() <= 13){
                            check = StreetMapGlobals.rootNodes[d.properties["A_1"]].Total;
                        } else {
                            check = StreetMapGlobals.rootNodes[d.properties["A_1"]].Total
                        }
                        return check > 200 ? StreetMapGlobals.gainScale(check) :
                            check < -50 ? StreetMapGlobals.lossScale(Math.abs(check))/4 :
                                check === 0 ? 0 : 0}
                }
            })
    }
};

//Node Processing - Outputs Nested JSON saying which transit line is at which Transit Stop
d3.tsv("RawData/PtOnOff.csv", function(data){
    //First Determine all Unique Nodes
    data.forEach(function(d){
        if (!StreetMapGlobals.rootNodes[d.A]) {
            var check = d.A;
            StreetMapGlobals.rootNodes[check] = {Lines: {}, Total: 0
            }
        }
    });

    data.forEach(function(d){
        StreetMapGlobals.rootNodes[d.A].Lines[d.Name] = +d.DiffB4ft;
        StreetMapGlobals.rootNodes[d.A].Total += +d.DiffB4ft;
    });
});



StreetMapVis = function(){
    this.initVis();

    this.canvas = d3.select("#DataSelection").append("svg")
        .attr("width", 750)
        .attr("height", 650);

    d3.json("scratch/transit.json", function(tdata){
        console.log(tdata)
        that = street_viz;
        that.treemap = d3.layout.treemap().sticky(true)
            .padding(6)
            .sort(function(a,b){
                if(a.Name){
                    return b.Name.toLocaleLowerCase() - a.Name.toLowerCase()}
                else return true
            })
            .size([750,650])
            .nodes(tdata);

        that.cells = that.canvas.selectAll(".cell")
            .data(that.treemap)
            .enter()
            .append("g")
            .attr("class", "cell");

        that.cells.append("rect")
            .attr("class", function(d){ return "treeMap"})
            .on("click",function(d){
                StreetMapGlobals.selectTransitLine(d.Name);
                StreetMapGlobals.updateThePoints(d.Name);})
            .attr("x",function (d) { return d.x })
            .attr("y", function (d) { return d.y })
            .attr("width", function (d) { return d.dx })
            .attr("height", function (d) { return d.dy })
            .attr("fill", function (d) { return d.children ? "white" :  styles.colorLines(d)})
            .style("stroke", "white");

        that.cells.append("text")
            .attr("x", function (d) { return d.x + d.dx /10})
            .attr("y", function (d) { return d.y + d.dy / 2})
            .text(function (d) {
                return d.Name === undefined? null: cleanText(d.Name)})
            .attr("class", "boxText")
            .style("fill", function(d){
                if (d.Mode === 1){
                    return "black"
                }
            });

        function cleanText(d){
            if (!isNaN(d.slice(0,1))){
                return Math.floor(d)
            } else {
                return d
            }
        }
    })
};




StreetMapVis.prototype.initVis = function(){
    that = this;
    this.TransitLines = L.geoJson(transitLines, {
        style: styles.transitStyle,
        onEachFeature: null
    }).addTo(map);

    map._initPathRoot();

    //We pick up the SVG from the map object
    this.svg = d3.select("#map").select("svg");
    this.g = this.svg.append("g").attr("class","displayed");

    // D3 Overlay Stuff
    d3.json("data/transitNodes4ft.json", function(collection) {
        that = street_viz;
        //Only draw circles of nodes that actually changed
        collection.features = collection.features.filter(function(d){
            if (StreetMapGlobals.rootNodes[d.properties["A_1"]] !== undefined){
                return true}
        });

        that.extent = d3.extent(collection.features.map(function(d){
            if (StreetMapGlobals.rootNodes[d.properties["A_1"]] !== undefined){
                return StreetMapGlobals.rootNodes[d.properties["A_1"]].Total}
        }));

        StreetMapGlobals.gainScale = d3.scale.sqrt()
                .domain([0,that.extent[1]])
                .range([1,20]);

        StreetMapGlobals.lossScale = d3.scale.sqrt()
            .domain([0, Math.abs(that.extent[0])])
            .range([1,20]);

        collection.features.forEach(function(d) {
            d.LatLng = new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0])
        });

        that.feature = that.g.selectAll("circle")
            .data(collection.features)
            .enter().append("circle")
            .attr("class", "transitChange")
            .style("fill", function(d){
                if (StreetMapGlobals.rootNodes[d.properties["A_1"]] !== undefined) {
                    var check = StreetMapGlobals.rootNodes[d.properties["A_1"]].Total;
                    return check < 0 ? "orange": check > 0 ? "blue": null}
            })
            .attr("r", function(d) {
                if (StreetMapGlobals.rootNodes[d.properties["A_1"]] !== undefined){
                if (map.getZoom() <= 13){
                    var check = StreetMapGlobals.rootNodes[d.properties["A_1"]].Total;
                } else {
                    check = StreetMapGlobals.rootNodes[d.properties["A_1"]].Total
                }
                return check > 200 ? StreetMapGlobals.gainScale(check) :
                            check < -50 ? StreetMapGlobals.lossScale(Math.abs(check)) :
                                check === 0 ? 0 : 0}
            })
            .style("opacity", 0.3)
            .style("stroke", "black")
            .on("click", function(){console.log("Loss #", JSON.stringify(StreetMapGlobals.rootNodes[this.__data__.properties["A_1"]].Lines, "trips"))});

        map.on("viewreset", reset);
        reset();

        // Reposition the SVG to cover the features.
        function reset() {
            that = street_viz;
            that.
                feature.attr("transform",
                function(d) {
                    return "translate("+
                        map.latLngToLayerPoint(d.LatLng).x +","+
                        map.latLngToLayerPoint(d.LatLng).y +")";}
            )
        }

        function projectPoint(x, y) {
            var point = map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }

    });
};







