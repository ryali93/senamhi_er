var basemap1 = function() {
    var attr = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.';
    return L.tileLayer("http://tile.stamen.com/toner-background/{z}/{x}/{y}.png", {
        opacity: 0.3,
        attribution: attr
    });
}

var basemap2 = function() {
    var attr = 'openlayers';
    return L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: attr
    });
}

var blank = function() {
    var layer = new L.Layer();
    layer.onAdd = layer.onRemove = function() {};
    return layer;
}


var create_point = function(){
    map.on("click", function(e){
        var mp = new L.Marker([e.latlng.lat, e.latlng.lng]).addTo(map);
        console.log(mp.getLatLng());
    });
}


var funcion_inicial = function(){
    // Configuracion inicial
    var map = L.map('map');
    map.setView([-10, -82], 6);

    // Capas principales
    var regiones = L.tileLayer.wms("http://localhost:8080/geoserver/senamhi_v1/wms", {
      layers: "senamhi_v1:gpo_regiones_pp_max",
      format: 'image/png',
      transparent: true
    });

    var departamentos = L.tileLayer.wms("http://localhost:8080/geoserver/bd/wms", {
       layers: "bd:gpo_departamentos",
       format: 'image/png',
       transparent: true
    });

    var quartiles = L.tileLayer.wms("http://localhost:8080/geoserver/senamhi_v1/wms", {
       layers: "senamhi_v1:q_pp",
       format: 'image/png',
       transparent: true
    });

    var basemaps = {
        'Stamen': basemap1().addTo(map),
        'OpenStreetMap': basemap2().addTo(map),
        'Blank': blank()
    };

    var layers = {
        'Quartiles': quartiles.addTo(map),
        'Departamentos': departamentos.addTo(map),
        'Regiones': regiones.addTo(map),
    };

    L.control.layers(basemaps, layers, {collapsed: false}).addTo(map);

    var sidebar = L.control.sidebar('sidebar_leaflet').addTo(map);
    sidebar.open('lluvias');

    /////// CON <script src="assets/js/leaflet.wms.js"></script> //////
    var source = L.WMS.source("http://localhost:8080/geoserver/senamhi_v1/wms?service=WMS&", {
          opacity: 0.1,
    });
    source.getLayer("q_pp").addTo(map);
    ///////////////////////////////////////////////////////////////////

    var source_url = "http://localhost:8080/geoserver/senamhi_v1/wms";

    map.on('click', function (evt) {
        document.getElementById('coord_x').innerHTML = "<b>X (wgs84): </b>" + evt.latlng["lng"].toFixed(3) + "°";
        document.getElementById('coord_y').innerHTML = "<b>Y (wgs84): </b>" + evt.latlng["lat"].toFixed(3) + "°";
        getFeatureInfo(evt, "senamhi_v1:gpo_regiones_pp_max"),
        getFeatureInfo(evt, "senamhi_v1:q_pp")
    });







    

    // var parser = new ol.format.WMSCapabilities();

    // var current_wms = [
    //     new ol.layer.Tile({
    //         title: layerCurrentTitle,
    //         visible: true,
    //         source: new ol.source.TileWMS({
    //             url: wmsCurrent,
    //             params: {'LAYERS': layerCurrent},
    //             serverType: 'geoserver'
    //         })
    //     })
    // ];
    // /*Fin: Cartografia Tematica*/

    // /*Inicio: Union de Capas o Layers*/
    // if (layerCurrentTitle === 'g_00_02:00_02_002_03_000_000_0000_00_00') {
    //     layers = [
    //         new ol.layer.Group({'title': 'Mapa Base', layers: layersMapaBase}),
    //         new ol.layer.Group({title: 'CARTOGRAFIA BASE', layers: layersCartografiaBase})
    //     ];
    // } else {
    //     layers = [
    //         new ol.layer.Group({'title': 'Mapa Base', layers: layersMapaBase}),
    //         //overlayGroupPP,
    //         new ol.layer.Group({title: "Cartograf\xeda Tem\xe1tica", layers: current_wms}),
    //         new ol.layer.Group({title: 'CARTOGRAFIA BASE', layers: layersCartografiaBase})
    //     ];
    // }
    // /*Fin: Union de Capas o Layers*/

    // /*Inicio: Mapa*/
    // var map = new ol.Map({
    //     target: document.getElementById('map'),
    //     renderer: 'canvas',
    //     layers: layers,
    //     view: view,
    //     controls: controls,
    //     interactions: interactions,

    //     loadTilesWhileAnimating: true,
    //     loadTilesWhileInteracting: true,

    //     controls: ol.control.defaults({
    //         attribution: false,
    //         attributionOptions: ({
    //             collapsible: true
    //         })
    //     }).extend([
    //         new ol.control.FullScreen(),
    //         new ol.control.ZoomSlider(),
    //         new ol.control.CanvasScaleLine()
    //     ])
    // });

    // // var layerSwitcher = new ol.control.LayerSwitcher({
    // //     tipLabel: 'Arbol de Capas'
    // // });
    // // map.addControl(layerSwitcher);


    // /*Fin: Mapa*/

    // /*Inicio: Controles*/
    // //...i
    // var dragdrop = new ol.interaction.DragAndDrop({formatConstructors: [ol.format.GPX, ol.format.KML, ol.format.GeoJSON]});
    // map.addInteraction(dragdrop);

    // dragdrop.on("addfeatures", function (a) {
    //     a = new ol.source.Vector({features: a.features, projection: a.projection});
    //     map.getLayers().push(new ol.layer.Vector({source: a}));
    //     map.getView().fitExtent(a.getExtent(), map.getSize())
    // });
    // //...f

    // //...i
    // var zoom_to_extent = new ol.control.ZoomToExtent({ extent: extent });
    // map.addControl(zoom_to_extent);

    // var sidebar = new ol.control.Sidebar({ element: 'sidebar_ol'});
    // map.addControl(sidebar);
    // sidebar.isVisible();

    // var switcher = new ol.control.LayerSwitcher({ target: $("#capas_switcher > div").get(0)});
    // map.addControl(switcher);
    // //...f

    // //...i
    // var popup = new ol.Overlay.Popup();
    // popup.setOffset([0, 0]);
    // map.addOverlay(popup);


    // // var wmsSource = new ol.source.TileWMS({
    // //   url: 'https://ahocevar.com/geoserver/wms',
    // //   params: {'LAYERS': 'ne:ne', 'TILED': true},
    // //   serverType: 'geoserver',
    // //   crossOrigin: 'anonymous',
    // // });

    // // var wmsLayer = new ol.layer.Image({
    // //   source: wmsSource,
    // // });

    // var wmsSource = new ol.source.ImageWMS({
    //   url: 'http://localhost:8080/geoserver/senamhi_v1/wms',
    //   params: {"LAYERS": 'senamhi_v1:q_pp'},
    //   serverType: 'geoserver'
    // });

    // var wmsLayer = new ol.layer.Image({
    //   source: wmsSource,
    // });

    // var wmsLayerVector = new ol.layer.Tile({
    //     title: 'Regiones2',
    //     visible: false,
    //     source: new ol.source.TileWMS({
    //         url: 'http://localhost:8080/geoserver/senamhi_v1/wms',
    //         params: {'LAYERS': 'senamhi_v1:gpo_regiones_pp_max'},
    //         serverType: 'geoserver'
    //     })
    // });

    // var infoRaster;
    // var infoVector;
    // var periodoRetorno;

    // map.on('singleclick', function(evt) {
    //     document.getElementById('coord_x').innerHTML = "<b>X (wgs84): </b>" + evt.coordinate[0].toFixed(3) + "°";
    //     document.getElementById('coord_y').innerHTML = "<b>Y (wgs84): </b>" + evt.coordinate[1].toFixed(3) + "°";
    //     getInfoRaster(evt, wmsLayer);
    //     getInfoVector(evt, wmsLayerVector);
    // });

    // function getInfoRaster(evt, layer) {
    //     var resolution = map.getView().getResolution();
    //     var coordinate = evt.coordinate;
        
    //     console.log(resolution);
    //     console.log(coordinate);

    //     var url = layer.getSource().getGetFeatureInfoUrl(evt.coordinate,
    //         resolution, 'EPSG:4326', {'INFO_FORMAT': 'application/json', 'FEATURE_COUNT': 50 });

    //     console.log(url);

    //     if (url){
    //         fetch(url)
    //             .then(response => response.json())
    //             .then(data => {
    //                 console.log(data["features"][0]["properties"]);
    //                 infoRaster = data["features"][0]["properties"];
    //                 periodoRetorno = document.getElementById('select_tr').value;
    //                 // document.getElementById('infoRaster').innerHTML = infoRaster[periodoRetorno]
    //                 document.getElementById('infoRaster').innerHTML = "<b>PP Máxima: </b>" + infoRaster[periodoRetorno].toFixed(2);
    //             });
    //     }
    // };

    // function getInfoVector(evt, layer){
    //     var resolution = map.getView().getResolution();
    //     var coordinate = evt.coordinate;
        
    //     console.log(resolution);
    //     console.log(coordinate);

    //     var url = layer.getSource().getGetFeatureInfoUrl(evt.coordinate,
    //         resolution, 'EPSG:4326', {'INFO_FORMAT': 'application/json', 'FEATURE_COUNT': 50 });

    //     console.log(url);

    //     if (url){
    //         fetch(url)
    //             .then(response => response.json())
    //             .then(data => {
    //                 console.log(data["features"][0]["properties"]["sub_regi_1"]);
    //                 infoVector = data["features"][0]["properties"]["sub_regi_1"];
    //                 // document.getElementById('infoVector').innerHTML = infoVector;
    //                 document.getElementById('infoVector').innerHTML = "<b>Subregión: </b>" + infoVector;
    //             });
    //     }

    // };

    // // Agregando punto que se borre luego
    // var vectorSource = new ol.source.Vector();
    // map.on('click', function (evt) {
    //     vectorSource.clear();
    //     var feature = new ol.Feature({
    //             geometry: new ol.geom.Point(evt.coordinate),
    //         name: 'PUNTO'
    //     });
    //     vectorSource = new ol.source.Vector({
    //         features: [feature]
    //     });
    //     var iconLayer = new ol.layer.Vector({
    //         source: vectorSource,
    //         style: new ol.style.Style({
    //             image: new ol.style.Icon({
    //                 src:'assets/img/marker.png',
    //                 anchor: [0.5, 1],
    //                 scale: 1
    //             })
                    
    //             })
    //     });
    //     map.addLayer(iconLayer); 
    // });
    // //...f
    // /*Fin: Controles*/

    // /*Inicio: Show Mapa*/
    // map.getView().fit(extent, map.getSize());
    // /*Fin: Show Mapa*/
    var getFeatureInfoUrl = function (latlng, lyr) {
        var point = map.latLngToContainerPoint(latlng, map.getZoom());
        var size = map.getSize();
        var defaultParameters = {
                service:"WMS",
                request:"GetFeatureInfo",
                version:"1.1.1",
                layers:lyr,
                query_layers:lyr,
                srs:"EPSG:4326",
                bbox: map.getBounds().toBBoxString(),
                width: size.x,
                height: size.y,
                X: point.x,
                Y: point.y,
                info_format:"application/json"
        };

        var parameters = L.Util.extend(defaultParameters);
        var URL = source_url + L.Util.getParamString(parameters);
        console.log(URL);
        return(URL)
    };

    var getFeatureInfo = function(evt, lyr){
        var url = getFeatureInfoUrl(evt.latlng, lyr);
        if (url){
        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log(data["features"][0]["properties"]);
                infoRaster = data["features"][0]["properties"];
                periodoRetorno = document.getElementById('select_tr').value;
                // document.getElementById('infoRegion').innerHTML = infoRaster[periodoRetorno]
                document.getElementById('infoRaster').innerHTML = "<b>PP Máxima: </b>" + infoRaster[periodoRetorno].toFixed(2);
            });
        }
    };


    map.on('singleclick', function(evt) {
        document.getElementById('coord_x').innerHTML = "<b>X (wgs84): </b>" + evt.coordinate[0].toFixed(3) + "°";
        document.getElementById('coord_y').innerHTML = "<b>Y (wgs84): </b>" + evt.coordinate[1].toFixed(3) + "°";
        getInfoRaster(evt, wmsLayer);
        getInfoVector(evt, wmsLayerVector);
    });

    function getInfoRaster(evt, layer) {
        var resolution = map.getView().getResolution();
        var coordinate = evt.coordinate;
        
        console.log(resolution);
        console.log(coordinate);

        var url = layer.getSource().getGetFeatureInfoUrl(evt.coordinate,
            resolution, 'EPSG:4326', {'INFO_FORMAT': 'application/json', 'FEATURE_COUNT': 50 });

        console.log(url);

        if (url){
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log(data["features"][0]["properties"]);
                    infoRaster = data["features"][0]["properties"];
                    periodoRetorno = document.getElementById('select_tr').value;
                    // document.getElementById('infoRaster').innerHTML = infoRaster[periodoRetorno]
                    document.getElementById('infoRaster').innerHTML = "<b>PP Máxima: </b>" + infoRaster[periodoRetorno].toFixed(2);
                });
        }
    };

    var markerIcon = L.icon({
        iconUrl: 'assets/img/marker.png',
        iconAnchor:   [0.5, 1]
    });
    var marker = null;
    map.on('click', function (e) {
        if (marker !== null) {
            map.removeLayer(marker);
        }
        marker = L.marker(e.latlng, {icon: markerIcon}).addTo(map);
    });
}

funcion_inicial()
create_point()
