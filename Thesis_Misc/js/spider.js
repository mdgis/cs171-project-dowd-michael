/**
 * Created by mdowd on 4/10/15.
 */
var spider_viz = null;
SpiderViz = function(_parentElement){
    this.parentElement = _parentElement;
    this.Mtaz = null;
    this.links = [];


    queue().defer(d3.json, "RawData/tazCtopo.json")
        .defer(d3.csv, "RawData/autoDiff.csv")
        .await(this.loaded);
};

SpiderViz.prototype.initVis = function(){
    that = this;
    console.log("mtaz", that.Mtaz)

    that.vMax = d3.max(that.links, function(d) {return Math.abs(d.val)});
    that.vScale = d3.scale.linear()
        .domain([10,that.vMax])
        .range([1,15]);

    that.oScale = d3.scale.linear()
        .domain([10,that.vMax])
        .range([.1,.8]);

    that.color = d3.scale.ordinal()
        .domain([10,200,450,700,that.vMax])
        .range(["#000329","#29022C","#530230", "#7D0133", "yellow"]);


    that.featureCentroid = that.g.attr("class","centroids").attr("class", "leaflet-zoom-hide").selectAll("path")
        .data(topojson.feature(that.Mtaz, that.Mtaz.objects.tazCenter).features)
        .enter().append("path").attr("class", "centroids");

    that.featureCentroid
        .attr("id", function(d) {return d.id;});

    that.featureLine = that.g.append("g").attr("class","spiderLines").attr("class", "leaflet-zoom-hide")
        .selectAll("path")
        .data(that.links)
        .enter().append("path");

    that.featureLine
        .attr("opacity",function(d) {return that.oScale(Math.abs(d.val))})
        .style("stroke-width", function(d){
            return that.vScale(Math.abs(d.val))
        })
        .attr("stroke", function(d){return that.color(d.val)});


    that.parentElement.on("viewreset", reset);
    reset();
    // Reposition the SVG to cover the features.
    function reset() {
        var bounds = that.path.bounds(topojson.feature(that.Mtaz, that.Mtaz.objects.tazCenter)),
            topLeft = bounds[0],
            bottomRight = bounds[1];

        that.svg.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

        that.g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

        that.featureCentroid.attr("d", that.path);
        that.featureLine.attr("d", that.path);
    }
};

SpiderViz.prototype.projectPoint = function (x, y) {
    that = spider_viz;
    var point = that.parentElement.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
};

SpiderViz.prototype.loaded = function(error, taz, spider) {

    that = spider_viz;
    that.Mtaz = taz;


    that.links.push(9)
    tazById = d3.map();

    that.svg = d3.select(that.parentElement.getPanes().overlayPane).append("svg");
    that.g = that.svg.append("g");
    console.log("Created the g in spider");
    that.transform = d3.geo.transform({point: that.projectPoint});

    that.path = d3.geo
        .path()
        .projection(that.transform);

    topojson.feature(that.Mtaz, taz.objects.tazCenter).features.forEach(function(d) {
        tazById.set(d.properties.TAZ, d.geometry.coordinates);
    });


    spider.forEach(function(d) {
        that.links.push({
            type: "LineString",
            coordinates: [tazById.get(d.O)
                ,tazById.get(d.D)],
            val: d.Diff
        })
    });

    that.initVis()

};


