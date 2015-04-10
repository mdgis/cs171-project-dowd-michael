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



    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 9,
        id: 'examples.map-20v6611k'
    }).addTo(this.map);



   svg = d3.select(that.map.getPanes().overlayPane).append("svg"),
       g = svg.append("g").attr("class", "leaflet-zoom-hide");

    //that.map._initPathRoot()
    //
    //// We pick up the SVG from the map object
    //var svg = d3.select("#map").select("svg"),
    //    g = svg.append("g");
    ////D3 Overlay Stuff

    d3.json("data/TdtaVp.json", function(collection) {
        that = street_viz;
        console.log(collection)
        var transform = d3.geo.transform({point: projectPoint}),
            path = d3.geo.path().projection(transform);


        var vMax = d3.max(collection.objects['dtaV'].geometries, function(d) {return d.properties["VSMP_2"]});
        var vScale = d3.scale.linear()
            .domain([100,vMax])
            .range([1,25]);

        var feature = g.selectAll("path")
            .data(topojson.feature(collection, collection.objects['dtaV']).features)
            .enter().append("path");

        feature.style("stroke-width", function(d){
            return vScale(d.properties["VSMP_2"])

        });

        console.log(collection)


        console.log("VMAX", vMax)

        that.map.on("viewreset", reset);
        reset();
        // Reposition the SVG to cover the features.
        function reset() {
            var bounds = path.bounds(topojson.feature(collection, collection.objects['dtaV'])),
                topLeft = bounds[0],
                bottomRight = bounds[1];

            console.log(bounds)

            svg.attr("width", bottomRight[0] - topLeft[0])
                .attr("height", bottomRight[1] - topLeft[1])
                .style("left", topLeft[0] + "px")
                .style("top", topLeft[1] + "px");

            g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

            feature.attr("d", path);
        }

        function projectPoint(x, y) {
            var point = that.map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }


    });
};








