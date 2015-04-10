/**
 * AssetVis object for HW3 of CS171
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @constructor
 */
var t;
AssetVis = function(_parentElement, _data,_MyClickHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.normal = false;
    this.allvotes = 0;
    this.baseTicks = [];

    // define all constants here
    this.margin = {top: 30, right: 20, bottom: 30, left: 50},
        this.width = 400 - this.margin.left - this.margin.right,
        this.height = 200 - this.margin.top - this.margin.bottom;

    this.initVis();

};


/**
 * Method that sets up the SVG and the variables
 */
AssetVis.prototype.initVis = function(){

    var that = this; // read about the this

    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");



    // creates axis and scales
    this.y = d3.scale.linear().range([that.height, 0]);

    this.x = d3.scale.ordinal()
        .rangeRoundBands([0, that.width], .1);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom")


    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left");


    this.svg.append("g")
        .attr("class", "bars")
        .attr("transform", "translate(0," + 0 + ")");

    this.bargroup = this.svg.select(".bars");

    this.bars = that.bargroup
        .selectAll(".rect")
        .data(d3.range(6))
        .enter()
        .append("rect")
        .attr("class","priosbar")
        .style("fill", function(d,i){
            return d3.rgb(153,155,255).darker(i);
        })
        .style("stroke", "white")
        .style("stroke-width", 1)
        .attr("x", function(d,i){ return that.x(i); })
        //.on("click", function(d,i){
        //    that.indicateSelected(this)
        //    $(that.MyClickHandler).trigger("click",i);
        //});

    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")");

    this.svg.append("g")
        .attr("class", "y axis");

    // filter, aggregate, modify data
    this.wrangleData(null);

    // call the update method
    this.updateVis(true);
};


/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
AssetVis.prototype.wrangleData= function(_filterFunction){
    // displayData should hold the data which is visualized
    //this.displayData = this.filterAndAggregate(_filterFunction);

    var totals = {};
    for (key in this.data[0]){
        totals[key] = 0
    }

    this.data.forEach(function(d){
        for (key in d){
        totals[key] += d[key]}
        });

    delete totals["TAZ"]
    this.displayData = [];
    for (key in totals){this.displayData.push(totals[key])}
    this.displayData = this.displayData.slice(0,6)

};


/**
 * the drawing function - should use the D3 selection, enter, exit
 */
AssetVis.prototype.updateVis = function(first){

    var that = this;

    //Get the Sum of all votes
    if (first){
        this.all_votes = this.displayData.reduce(function(pv, cv) {
            return pv + cv;
        });
        this.max = d3.max(this.displayData, function(d) { return d; });
        this.y.domain([0, d3.max(this.displayData, function(d) { return d })]);
        this.baseTicks = this.y.ticks();
        this.alldata = this.displayData;
        this.fixedTotal = this.displayData.reduce(function(pv, cv) {return pv + cv;});
        that = this
    }



    var total = this.displayData.reduce(function(pv, cv) {return pv + cv;});
    var num_votes = this.normal ? this.all_votes : 1.0;

    d3.select('#normalSpan').text(String(((total/that.all_votes)*100).toFixed(2)) + "%");


    this.x.domain(this.displayData.map(function(d,i) {return i; }));

    if (this.normal){
        this.y.domain([0,that.max])
    } else {
        this.y.domain([0, d3.max(this.displayData, function(d) { return d })]);}

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left");

    //this.xAxis.tickFormat(function(d){
    //    return that.metaData[d].name;});

    //if (this.normal){
    //    this.yAxis.tickFormat(function(d, i){
    //        return String(((that.baseTicks[i]/that.fixedTotal)*100).toFixed(2)) + "%"
    //    })
    //}

    // updates axis
    this.svg.select(".x.axis").call(this.xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d){
            "use strict";
            return "rotate(-65)";
        });


    this.svg.select(".y.axis").call(this.yAxis);

    this.bars = this.svg.selectAll(".priosbar")
        .data(this.displayData);

    if (first) {
        this.bars
            .attr("x", function (d, i) {
                return that.x(i);
            })
            .attr("y", function (d) {
                return that.y(d);
            })
            .attr("width", that.x.rangeBand());
    }

    this.bars.transition()
        .attr("height", function(d) {
            var pad = num_votes > 1 ? 275 : 0;
            return   (that.y(0) - (that.y(d)))})
        .attr("y", function (d) {
            return that.y(d);
        });

};


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
//AssetVis.prototype.onSelectionChange = function (selectionStart, selectionEnd){
//
//    if (String(selectionStart) === String(selectionEnd)){
//        this.wrangleData(null);
//    }
//    else {
//        this.wrangleData(function(d) {
//            return ((d.time >= selectionStart) && (d.time <= selectionEnd));});
//    }
//    this.updateVis(false);
//
//};

AssetVis.prototype.normalize = function(){
    this.normal = !this.normal;
    this.updateVis(false)
};

/*
 *
 * ==================================
 * From here on only HELPER functions
 * ==================================
 *
 * */


function mySumArray(a,b) {
    var summed = [];
    if (a.length !== b.length){
        return null;
    } else {
        a.forEach(function(d,i) {
            var val_d;
            var val_bi;
            if (+d > 0){
                val_d = +d;
            } else {
                val_d = 0;
            }
            if (+b[i] > 0){
                val_bi = +b[i];
            } else {
                val_bi = 0;
            }
            summed.push(val_d + val_bi);
        });
    }
    return summed;
}


/**
 * The aggregate function that creates the counts for each age for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
AssetVis.prototype.filterAndAggregate = function(_filter){

    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    //var filter = _filter || function(){return true;};
    //
    //if (_filter !== null){
    //    filter = _filter;
    //}
    //var that = this;
    //
    //// create an array of values for age 0-100
    //var res = d3.range(16).map(function () {
    //    return 0;
    //});
    //
    //// accumulate all values that fulfill the filter criterion
    //this.data.filter(filter).forEach(function(d){
    //    "use strict";
    //    res = mySumArray(res, d.prios);
    //});
    //
    //return res;

};
//Below changes the bar border to black when a bar is selected & then back to white when unselected
AssetVis.prototype.indicateSelected = function(theBar){
    var bar = d3.select(theBar);
    var selectColor = bar.style("stroke") === "rgb(0, 0, 0)" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)";

    bar.style("stroke",selectColor)

};


/**
 * Created by mdowd on 4/7/15.
 */
