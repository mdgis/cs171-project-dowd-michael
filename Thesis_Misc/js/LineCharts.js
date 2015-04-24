/**
 * Created by mdowd on 4/24/15.
 */
/**
 * LineVis object for HW3 of CS171
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @constructor
 */

LineVis = function(_parentElement, _data, _label){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.normal = false;
    this.label = _label;
    this.totalAssets = 0;
    this.denominator = 1;
    this.baseTicks = [];

    // define all constants here
    this.margin = {top: 30, right: 50, bottom: 30, left: 80};
    this.width = 340 - this.margin.left - this.margin.right;
    this.height = 200 - this.margin.top - this.margin.bottom;
    this.initVis();
};


/**
 * Method that sets up the SVG and the variables
 */
LineVis.prototype.initVis = function() {
    var that = this; // read about the this
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.svg.append("text")
        .attr("x", (this.width / 2))
        .attr("y", 0 - (this.margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(that.label);

    // creates axis and scales
    this.y = d3.scale.linear().range([that.height, 0]);

    this.x = d3.scale.ordinal()
        .rangeRoundBands([0, that.width], .1);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom");

    this.xAxis.tickFormat(function (d, i) {
        return String(i + 1) + "ft."
    });

    that = this;
    var line = d3.svg.line()
        .x(function(d) { return that.x(d[0]); })
        .y(function(d) { return that.y(d[1]); });

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left");

    slrCounts = [0,0,0,0,0,0,0];

    //Count the features that are inundated and populate slrCounts
    //Function should work on any data set passed for a line chart
    this.data.features.forEach(function(d){
        var check = +d.properties.slr_lvl;
        if (check === 1) {
            slrCounts[0] +=1;
            slrCounts[1] +=1;
            slrCounts[2] +=1;
            slrCounts[3] +=1;
            slrCounts[4] +=1;
            slrCounts[5] +=1;
        } else if (check === 2){
            slrCounts[1] +=1;
            slrCounts[2] +=1;
            slrCounts[3] +=1;
            slrCounts[4] +=1;
            slrCounts[5] +=1;
        } else if (check ===3 ){
            slrCounts[2] +=1;
            slrCounts[3] +=1;
            slrCounts[4] +=1;
            slrCounts[5] +=1;
        }else if (check === 4 ){
            slrCounts[3] +=1;
            slrCounts[4] +=1;
            slrCounts[5] +=1;
        }else if (check === 5 ){
            slrCounts[4] +=1;
            slrCounts[5] +=1;
        } else if (check === 6 ){
            slrCounts[5] +=1;
        }
        slrCounts[6] +=1
    });
    console.log("SLRCOUNTS", slrCounts);

    this.displayData = d3.zip(d3.range(6), slrCounts);
    this.x.domain(d3.range(6));
    this.y.domain([0,d3.max(slrCounts.slice(0,6))]);

    this.svg.append("path")
        .attr("class", "line")
        .attr("d", line(this.displayData))


    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")");

    this.svg.append("g")
        .attr("class", "y axis");

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left");

    this.svg.select(".y.axis").call(this.yAxis);
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

};