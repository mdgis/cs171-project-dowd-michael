var gradient = golden;
var currentAsset = null;

//TODO allow user to turn off the water layer
//TDOD try to get the asset layer above the water or make the water layer not cliablce
assetsGlobals = {
    assetMap : null,
    classify: null,
    assetStyle: undefined,
    "highlightSlrFeatures" : function(level){
        var check = asset_map_viz.Assets.selected;
        if (check === "Roads" ){
            asset_map_viz.Assets.roads.eachLayer(function(layer){
                if (level === 0 ){
                    layer.setStyle({color :'gray', weight: 1})
                } else if (layer.feature.properties.slr_lvl <= level && layer.feature.properties.slr_lvl !== 0){
                    layer.setStyle({color :'red', weight: 1});
                }
            })
        } else if (check === "Highway Exits" || check === "Bus Stops" || "Bus Lines" || "T-Stops"){
            var asset = check === "Highway Exits" ? "exits" : check === "Bus Stops" ? "busStops" :
                    check === "T-Stops" ? "T_Stops" : check === "Bus Lines" ?  "busLines" : undefined;
            if (asset !== undefined){
                asset_map_viz.Assets[asset].eachLayer(function(layer){
                    if (level === 0 ){
                        layer.setStyle({color :'black', weight: 1})
                    } else if (layer.feature.properties.slr_lvl <= level && layer.feature.properties.slr_lvl !== 0){
                        layer.setStyle({color :'red', weight: 7})
                    } else {
                        layer.setStyle({color :'black', weight: 1});

                    }
                })
            }
        }
    },

    "getColor" : function(d, colorObject) {
        d = assetsGlobals.assetMap.get(d);
        return d > assetsGlobals.classify[7] ? colorObject[1] :
            d > assetsGlobals.classify[6]  ? colorObject[2] :
                d > assetsGlobals.classify[5]  ? colorObject[3] :
                    d > assetsGlobals.classify[4]  ? colorObject[4] :
                        d > assetsGlobals.classify[3]   ? colorObject[5] :
                            d > assetsGlobals.classify[2]   ? colorObject[6] :
                                d > assetsGlobals.classify[1]   ?colorObject[7] :
                                    'none';
    },

    "onEachFeature": function(feature, layer) {
    // does this feature have a property named popupContent?
        if (feature.properties && feature.properties["STATION"]) {
            layer.bindPopup(feature.properties["STATION"]);
        } else if (feature.properties && feature.properties["STOP_NAME"]) {
            layer.bindPopup(feature.properties["STOP_NAME"]);
        } else if (feature.properties && feature.properties["ROUTEKEY"]) {
            layer.bindPopup(feature.properties["ROUTEKEY"]);
        } else if (feature.properties && feature.properties["LINE"]) {
            layer.bindPopup(feature.properties["LINE"]);
        } else if (feature.properties && feature.properties["NAME"]) {
            layer.bindPopup(feature.properties["NAME"]);
        }
    },

    "roadStyle": function(feature) {
            return {
                weight: 0.5,
                opacity: 1,
                color: "gray",
                fillOpacity: 0.7
            };
        }


};
///////Exiting Viz Object Global///////


AssetMapVis = function() {
    this.asset_viz = null;
    this.Features = new L.LayerGroup();
    this.initViz("Demographics")
};

AssetMapVis.prototype.initViz = function(selected){
    var that = this;
    currentAsset = selected;

    that.Assets = {
        "lookUp":{
            "Roads"         : "Highway",
            "Highway Exits" : "Highway",
            "Bus Stops"     : "Transit",
            "Bus Lines"     : "Transit",
            "T-Stops"       : "Transit",
            "T-Lines"       : "Transit",
            "Demographics"  : "Demographics"
        },
        "selected": "Demographics",
        "demoDim" : "jobs",
        "roads": L.geoJson(indRoads, {style: assetsGlobals.roadStyle}),
        "taz"  : L.geoJson(rawTaz, {}),
        "exits" : L.geoJson(exits, {style: function(feature) {
            return {color: "black"};}, pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {radius: 5, fillOpacity: 0.85});
        }, onEachFeature: assetsGlobals.onEachFeature}),
        "busStops": L.geoJson(busStops, {style: function(feature) {
            return {color: "black"};}, pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {radius: 4, fillOpacity: 0.85});
        }, onEachFeature: assetsGlobals.onEachFeature}),
        "T_Lines":L.geoJson(mbtaArc, {style: styles.transitStyle, onEachFeature: assetsGlobals.onEachFeature}),
        "T_Stops": L.geoJson(T_Stops, {style: function(feature) {
            return {color: "steelBlue"};}, pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {radius: 4, fillOpacity: 0.85});
        }, onEachFeature: assetsGlobals.onEachFeature}),
        "busLines":L.geoJson(transitLines, {onEachFeature: assetsGlobals.onEachFeature})

    };
    that.wrangleDemData(Demographics.jobs, "jobs", 1);

};

AssetMapVis.prototype.updateVis = function() {
    var that = this;
    that.Assets.taz.setStyle(assetsGlobals.assetStyle);
    that.Features.addTo(map3)
};

AssetMapVis.prototype.wrangleDemData = function(dim, label, level){
    var that = this;

    gradient = label.toLocaleLowerCase() === "jobs" ? golden : label.toLocaleLowerCase() === "pop" ? bluish:
        label.toLocaleLowerCase() === "hh" ? redish : golden;
    this.classMap = d3.map();
    Demographics[label.toLowerCase()].forEach(function(d){
        that.classMap.set(d.TAZ, d[label.toUpperCase() +"_" + 6 + "ft"])
    });

    assetsGlobals.assetMap = d3.map();
    dim.forEach(function(d) {
        assetsGlobals.assetMap.set(d.TAZ, d[label.toUpperCase()+"_"+level+"ft"]);
    });


    if (that.asset_viz === null) {
        that.asset_viz = new AssetVis(d3.select("#chart"), Demographics.jobs,  "Jobs");
        that.asset_viz2 = new AssetVis(d3.select("#chart1"), Demographics.pop,  "Pop");
        that.asset_viz3 = new AssetVis(d3.select("#chart2"), Demographics.hh, "hh");
        that.asset_viz4 = new AssetVis(d3.select("#chart3"), Demographics.tazarea, "Taz Area Meters Sq.");
    }

    assetsGlobals.classify = chloroQuantile(this.classMap.values(), 8, "jenks");
    assetsGlobals.assetStyle = function(feature) {
        return {
            fillColor: assetsGlobals.getColor(feature.properties.TAZ, gradient),
            weight: 0.5,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
        };
    };
    that.updateLayers("taz")


};

AssetMapVis.prototype.updateLayers = function(layer){
    var that = this;
    that.Features.clearLayers();
    that.Features.addLayer(that.Assets[layer]);
    that.updateVis();
};

