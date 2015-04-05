/* Accessibility Map Visualization */
var test;
AccessVis = function(_parentElement){
    this.parentElement = _parentElement
    this.width = 1060;
    this.height = 900;
    this.columns = [];
    this.rateByTAZ = d3.map();
    this.max = 0;

    this.projection = d3.geo.mercator()
        .center([-71.1603, 42.305])
        .rotate([0, 0, 0])
        .scale(25000)
        .translate([this.width / 2, this.height / 2]);

    this.initVis();
};


AccessVis.prototype.initVis = function() {
    that = this;



// find the top left and bottom right of current projection

    this.path = d3.geo.path()
        .projection(this.projection);

    this.zoom = d3.behavior.zoom()
        .translate(that.projection.translate())
        .scale(that.projection.scale())
        .scaleExtent([that.height * 25, 500 * that.height])
        .on("zoom", that.zoomed);

    this.svg = this.parentElement.append("svg")
        .attr("width", this.width)
        .attr("height", this.height);

    this.g = this.svg.append("g")
        .call(this.zoom);

};


AccessVis.prototype.zoomed = function() {
    that = access_viz;
    console.log(that.projection);
    that.projection.translate(d3.event.translate).scale(d3.event.scale);
    that.g.selectAll("path").attr("d", that.path);
};

AccessVis.prototype.showValue = function(val){
    document.getElementById("range").innerHTML= val + "ft";
    this.wrangleData(access, val);
};


AccessVis.prototype.updateVis = function(){
    console.log("In Update Viz", access);
    that = this;
    function manualColor(val) {
        out =
            val < 0.001358 ? 0 :
                val < 0.002183 ? 1 :
                    val < 0.005146 ? 2 :
                        val < 0.010408 ? 3 :
                            val < 0.022089 ? 4 :
                                val < 0.033631 ? 5 :
                                    val < 0.051477 ? 6 :
                                        val < 0.078315 ? 7 :
                                            val < 0.146280 ? 8 : 0;
        return "a" + out + "-9"
    }

    var check = Object.keys(access[0])[1];
    //Is it transit, auto, or walk
    var q =  check.indexOf("Dta") >= 0 ? "a" : check.indexOf("transit") >= 0 ? "t" : "w";
    var quantize = d3.scale.quantile()
        .domain([0.0, max])
        .range(d3.range(9).map(function(i) { return q + i + "-9"; }));

    var tpath = this.svg.select("g")
        .attr("class", "taz")
        .selectAll("path")
        .data(topojson.feature(data, data.objects.taz).features);

    tpath.enter().append("path");
    tpath.attr("class", function(d) {
        return manualColor(that.rateByTAZ.get(d.properties.TAZ))})
        .attr("d", that.path);

    tpath.exit().remove()
};

AccessVis.prototype.wrangleData = function(access, level){
    that = this;
    if (Object.keys(current[0])[1] !== Object.keys(access[0])[1]){
        that.max = 0;
        that.current = access
    }
    that.columns = Object.keys(access[0]);
    console.log(that.columns)
    that.columns.splice(that.columns.indexOf("Z"),1);

    level = that.columns[level];
    access.forEach(function(d) {
        if (d[level] > that.max) that.max = +d[level];
        that.rateByTAZ.set(d.Z, + d[level]); });

    that.updateVis()
};




