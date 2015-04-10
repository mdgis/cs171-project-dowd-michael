var r;
r = roads;
StreetMapVis = function(_parentElement){
    this.parentElement = _parentElement;
    this.width = 1060;
    this.height = 900;

    this.initVis()
};


StreetMapVis.prototype.initVis = function(){
    this.map = L.map(this.parentElement).setView([42.3596, -71.0561], 12);
    this.map.attributionControl.addAttribution('Dowd Model Output');
    that = this;


    function transitStyle(feature) {
        return {
            weight: setWeight(feature.properties["MODE"]),
           // opacity: setOpacity(feature.properties["NAME"]),
            color: setColor(feature.properties["MODE"], feature.properties["NAME"])
        };
    }

    var vMax = d3.max(r.features, function(d) {return d.properties["VSMP_2"]});
    var vScale = d3.scale.linear()
        .domain([100,vMax])
        .range([1,20]);

    function roadStyle(feature) {
        return {
            weight: setRoadWeight(feature.properties["VSMP_2"]),
            // opacity: setOpacity(feature.properties["NAME"]),
            color: "black"
        };
    }



    console.log(vScale(3420.2))


    function setRoadWeight(vol){
        return Math.round(vScale(vol))
    }

    function setWeight(mode){
        return (mode === 1) || (mode === 2) ? 1 :
            (mode === 3) || (mode === 4) ? 7:
                (mode === 5) ? 3: null
    }

    function setColor(mode, name){
        /*Color the subways by their name */
        name = name.toLowerCase();
        if ((mode === 1) || (mode === 2)){
            return "yellow"
        }
        else if ( (mode === 3) || (mode === 4) ) {
            if (name.indexOf("red") > -1){
                return "red"
            }
            else if (name.indexOf("green") > -1){
                return "green"
            }
            else if (name.indexOf("blue") > -1) {
                return "blue"
            }
            else if (name.indexOf("orange") > -1) {
                return "orange"
            }
        }
        else if (mode === 5){
            return "gray"
        }
        else {return null}
    }

    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 9,
        id: 'examples.map-20v6611k'
    }).addTo(this.map);

    TransitLines = L.geoJson(transitLines, {
        style: transitStyle,
        onEachFeature: null
    }).addTo(this.map);

    //roads = L.geoJson(roads, {
    //    style: roadStyle,
    //    onEachFeature: null
    //}).addTo(this.map);
    //


    //this.svg = d3.select(that.map.getPanes().overlayPane).append("svg"),
    //    this.g = this.svg.append("g").attr("class", "leaflet-zoom-hide");

    that.map._initPathRoot()

    // We pick up the SVG from the map object
    var svg = d3.select("#map").select("svg"),
        g = svg.append("g");
    //D3 Overlay Stuff

    d3.json("data/transitNodes4ft.json", function(collection) {
        that = street_viz;

        var extent = d3.extent(collection.features.map(function(d){return d.properties["diff"]}));
        console.log("extent", extent)

        var gainScale = d3.scale.sqrt()
                .domain([0,extent[1]])
                .range([1,20])

        var lossScale = d3.scale.sqrt()
            .domain([0, Math.abs(extent[0])])
            .range([1,20]);

        collection.features.forEach(function(d) {
            d.LatLng = new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0])
        });

        var feature = g.selectAll("circle")
            .data(collection.features)
            .enter().append("circle")
            .style("fill", function(d){
                var check = d.properties["diff"];
                return check < 0 ? "#003333": check > 0 ? "blue": null
            })
            .attr("r", function(d) {
                if (that.map.getZoom() <= 13){
                    var check = d.properties["diff"];
                } else {
                    check = d.properties["diff"]
                }
                return check > 200 ? gainScale(check) :
                            check < -50 ? lossScale(Math.abs(check)) :
                                check === 0 ? 0 : 0
            })
            .style("opacity", 0.3)
            .style("stroke", "black")
            .on("click", function(){console.log("Loss #", this.__data__.properties["diff"], "trips")});

        that.map.on("viewreset", reset);
        reset();

        // Reposition the SVG to cover the features.
        function reset() {
            feature.attr("transform",
                function(d) {
                    return "translate("+
                        that.map.latLngToLayerPoint(d.LatLng).x +","+
                        that.map.latLngToLayerPoint(d.LatLng).y +")";}

            )
        }


    });
};








