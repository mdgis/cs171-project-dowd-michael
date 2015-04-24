TopoStreetMapVis = function(_map){
    this.map = _map
    this.initVis()
};


///Probably need to fix some of the This & That things

TopoStreetMapVis.prototype.initVis = function(){
    var that = this;
    that.svg = d3.select(that.map.getPanes().overlayPane).append("svg");
    that.g = that.svg.append("g").attr("class", "leaflet-zoom-hide");

    gTopoMap = that.g.append("g").attr("class", "gTopoMap displayed");

    d3.json("data/TdtaVp.json", function(collection) {
        var that = traffic_map;
        var transform = d3.geo.transform({point: projectPoint}),
            path = d3.geo.path().projection(transform);

        var vMax = d3.max(collection.objects['dtaV'].geometries, function(d) {return d.properties["VSMP_2"]});
        var vScale = d3.scale.linear()
            .domain([100,vMax])
            .range([1,25]);

        var feature = gTopoMap.selectAll("path")
            .data(topojson.feature(collection, collection.objects['dtaV']).features)
            .enter().append("path");

        feature.attr("class","RoadPath").style("stroke-width", function(d){
            return vScale(d.properties["VSMP_2"])

        });

        that.map.on("viewreset", reset);
        reset();
        // Reposition the SVG to cover the features.
        function reset() {
            var that = traffic_map;
            var bounds = path.bounds(topojson.feature(collection, collection.objects['dtaV'])),
                topLeft = bounds[0],
                bottomRight = bounds[1];

            that.svg.attr("width", bottomRight[0] - topLeft[0])
                .attr("height", bottomRight[1] - topLeft[1])
                .style("left", topLeft[0] + "px")
                .style("top", topLeft[1] + "px");

            gTopoMap.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

            feature.attr("d", path);
        }

        function projectPoint(x, y) {
            var point = that.map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }

    });
};








