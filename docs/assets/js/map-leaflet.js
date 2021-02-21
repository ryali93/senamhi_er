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

var generar_tb_pp = function(trs_tr) {
    var data_regiones = JSON.parse(datos_regiones)[0];
    console.log(data_regiones);
    console.log(trs_tr);

    var tr_anos = ["TR2","TR5","TR10","TR30","TR50","TR75","TR100","TR200","TR500","TR1000"];
    var region = document.getElementById("infoRegion").innerText.replace("Subregión: ","");
    var quartil = document.getElementById('select_quartil').value;
    // var trs_tr = 100;
    var val_temp;

    console.log(quartil);

    var tabla_datos = "<table id='dtHorizontal' class='table table-striped' width=100%>";
    tabla_datos += "<thead><tr><th align=center>Duración</th>";

    for(cab=0;cab<=9;cab++){
        tabla_datos+="<th>"+tr_anos[cab]+"</th>";
    };

    tabla_datos += "</tr></thead><tbody>";
    for(j=0;j<=23;j++){
        var n = j+1

        var val_pp_mn = data_regiones[region][quartil]["P10"];
        var val_pp_me = data_regiones[region][quartil]["P50"];
        var val_pp_mx = data_regiones[region][quartil]["P90"];

        tabla_datos += "<tr><td align=center>"+n+"-hr";

        for(m=0;m<=9;m++){
            var val_hiet_mn = (val_pp_mn[j]*trs_tr["LI_"+tr_anos[m]]).toFixed(2);
            var val_hiet_me = (val_pp_me[j]*trs_tr["LM_"+tr_anos[m]]).toFixed(2);
            var val_hiet_mx = (val_pp_mx[j]*trs_tr["LS_"+tr_anos[m]]).toFixed(2);

            console.log(val_hiet_me);

            val_temp_mn = val_hiet_mn;
            val_temp_me = val_hiet_me;
            val_temp_mx = val_hiet_mx;
            // if(n==1){
            //     val_temp_mn = val_hiet_mn;
            //     val_temp_me = val_hiet_me;
            //     val_temp_mx = val_hiet_mx;
            // }else{
            //     val_temp_mn = val_pp_mn[j]*trs_tr["LI_"+tr_anos[m]] - val_pp_mn[j-1]*trs_tr["LI_"+tr_anos[m]];
            //     val_temp_me = val_pp_me[j]*trs_tr["LM_"+tr_anos[m]] - val_pp_me[j-1]*trs_tr["LM_"+tr_anos[m]];
            //     val_temp_mx = val_pp_mx[j]*trs_tr["LS_"+tr_anos[m]] - val_pp_mx[j-1]*trs_tr["LS_"+tr_anos[m]];
            // };
            console.log(val_temp_me);

            tabla_datos += "</td><td align=center style='padding: 0px;'>";
            tabla_datos += "<strong>"+parseFloat(val_temp_me).toFixed(2)+"</strong>";
            tabla_datos += "("+parseFloat(val_temp_mn).toFixed(2)+"-"+parseFloat(val_temp_mx).toFixed(2)+")";
            tabla_datos += "</td>";
        }
        tabla_datos += "</tr>"

        // var val_hiet_mn = (val_pp_mn[j]*trs_tr).toFixed(2);
        // var val_hiet_me = (val_pp_me[j]*trs_tr).toFixed(2);
        // var val_hiet_mx = (val_pp_mx[j]*trs_tr).toFixed(2);

        // if(n==1){
        //     val_temp_mn = val_hiet_mn;
        //     val_temp_me = val_hiet_me;
        //     val_temp_mx = val_hiet_mx;
        // }else{
        //     val_temp_mn = val_pp_mn[j]*trs_tr - val_pp_mn[j-1]*trs_tr;
        //     val_temp_me = val_pp_me[j]*trs_tr - val_pp_me[j-1]*trs_tr;
        //     val_temp_mx = val_pp_mx[j]*trs_tr - val_pp_mx[j-1]*trs_tr;
        // };
        // console.log(val_temp_me);
        // tabla_datos += "</td><td align=center>"+val_pp_me[j];
        // tabla_datos += "</td><td align=center>"+val_hiet_me;
        // tabla_datos += "</td><td align=center style='padding: 0px;'>";
        // tabla_datos += "<strong>"+parseFloat(val_temp_me).toFixed(2)+"</strong>";
        // tabla_datos += "("+parseFloat(val_temp_mn).toFixed(2)+"-"+parseFloat(val_temp_mx).toFixed(2)+")";
        // tabla_datos += "</td></tr>";
        // val_temp = parseFloat(val_hiet) - val_temp
    }
    tabla_datos += "</tbody></table>";
    document.getElementById("tabla_datos").innerHTML = tabla_datos;

}

var exportTableToExcel = function(tableID, filename = ''){
    var downloadLink;
    var dataType = 'application/vnd.ms-excel';
    var tableSelect = document.getElementById(tableID);
    var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
    
    filename = filename?filename+'.xls':'excel_data.xls';
    downloadLink = document.createElement("a");
    
    document.body.appendChild(downloadLink);
    
    if(navigator.msSaveOrOpenBlob){
        var blob = new Blob(['\ufeff', tableHTML], {
            type: dataType
        });
        navigator.msSaveOrOpenBlob( blob, filename);
    }else{
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
        downloadLink.download = filename;
        downloadLink.click();
    }
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

    // Mapas base
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

    var source_url = "http://localhost:8080/geoserver/senamhi_v1/wms";
    map.on('click', function (evt) {
        document.getElementById('coord_x').innerHTML = "<b>X (wgs84): </b>" + evt.latlng["lng"].toFixed(3) + "°";
        document.getElementById('coord_y').innerHTML = "<b>Y (wgs84): </b>" + evt.latlng["lat"].toFixed(3) + "°";
        getFeatureInfo(evt, "senamhi_v1:gpo_regiones_pp_max");
        getFeatureInfo(evt, "senamhi_v1:q_pp")
        
    });

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
        var infoRaster;
        var InfoVector;
        var url = getFeatureInfoUrl(evt.latlng, lyr);
        if(url){
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    info_data = data["features"][0]["properties"];
                    if(Object.keys(info_data).length == 1){
                        document.getElementById('infoRegion').innerHTML = '<p id="infoRegion"><b>Subregión: '+info_data["sub_regi_1"]+'</b></p>'
                    }
                    else{
                        console.log("Crear Tabla aqui");
                        generar_tb_pp(info_data);
                    }
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
