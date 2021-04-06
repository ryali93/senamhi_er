var map = L.map('map');
map.setView([-10, -82], 6);
var marker = null;
var host = "http://192.168.1.62:8080/"
var source_url = host + "geoserver/dhi/wms";
var markerIcon = L.icon({
    iconUrl: 'assets/img/marker.png',
    iconAnchor:   [0.5, 1]
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
    console.log(evt.latlng);
    var url = getFeatureInfoUrl(evt.latlng, lyr);
    if(url){
        fetch(url)
            .then(response => response.json())
            .then(data => {
                info_data = data["features"][0]["properties"];
                if(info_data["subregion"] != undefined){
                    document.getElementById('infoRegion').innerHTML = '<p id="infoRegion"><b>Región: '+info_data["subregion"]+'</b></p>'
                }
                else{
                    console.log("Crear Tabla aqui");
                    generar_tb_pp(info_data);
                    changeVisibility();
                }
            });

    }

};

var showDisclaimer = function() {
    var div = document.getElementById("info legend")
    div.innerHTML = "<b>Índice de avenidas:</b><br>";
    div.innerHTML += '<img src="'+host+'geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.3.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&STRICT=false&style=raster_style">';
}

var hideDisclaimer = function() {
    var div = document.getElementById("info legend")
    div.innerHTML = "<b>Leyenda:</b><br>";
}

var extraerData_click = function (evt) {
    if (marker !== null) {
        map.removeLayer(marker);
    }
    marker = L.marker(evt.latlng, {icon: markerIcon}).addTo(map);
    map.setView([evt.latlng["lat"], evt.latlng["lng"]-0.05], 11);
    console.log(evt.latlng);
    document.getElementById("coord_x").value = evt.latlng["lng"].toFixed(3);
    document.getElementById("coord_y").value = evt.latlng["lat"].toFixed(3);
    getFeatureInfo(evt, "dhi:gpo_regiones_pp");
    getFeatureInfo(evt, "dhi:q_pp")
    
}

var bm_stamen = function() {
    var attr = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.';
    return L.tileLayer("http://tile.stamen.com/toner-background/{z}/{x}/{y}.png", {
        opacity: 0.3,
        attribution: attr
    });
}

var bm_openstreetmap = function() {
    var attr = 'OpenStreetMap';
    return L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: attr
    });
}

var bm_opentopomap = function(){
    var attr = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';
    return L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: attr
    });
}
    
var bm_satellite = function(){
    var attr = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    return L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
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

var changeVisibility = function() {
    document.getElementById("exportar_tabla").style.visibility = "visible";
}

var generar_tb_pp = function(trs_tr) {
    var data_regiones = JSON.parse(datos_regiones)[0];

    var tr_anos = ["TR2","TR5","TR10","TR30","TR50","TR75","TR100","TR200","TR500","TR1000"];
    var region = document.getElementById("infoRegion").innerText.replace("Región: ","");
    var quartil = document.getElementById('select_quartil').value;
    // var trs_tr = 100;
    var val_temp;

    console.log(quartil);

    var tabla_datos = "<table id='dtHorizontal' class='table table-striped' width=100%>";
    tabla_datos += "<thead><tr><th colspan='11' align=center style='font-size:14px;'>Intensidades de precipitación, para diferentes duraciones y periodos de retorno<br>con intervalos de confianza del 90%.</th>";
    tabla_datos += "<tr><th align=center>Duración</th>";

    var datos_hietograma = {};
    var datos_idf = {};
    for(cab=0;cab<=9;cab++){
        tabla_datos+="<th>"+tr_anos[cab]+"</th>";
        datos_hietograma[tr_anos[cab]] = [];
        datos_idf[tr_anos[cab]] = [];
    };

    tabla_datos += "</tr></thead><tbody>";
    for(j=0;j<=23;j++){
        var n = j+1

        var val_pp_mn = data_regiones[region][quartil]["P10"];
        var val_pp_me = data_regiones[region][quartil]["P50"];
        var val_pp_mx = data_regiones[region][quartil]["P90"];

        tabla_datos += "<tr><td align=center>"+n+"-hr";

        for(m=0;m<=9;m++){
            var val_hiet_mn = val_pp_mn[j]*trs_tr["LI_"+tr_anos[m]];
            var val_hiet_me = val_pp_me[j]*trs_tr["LM_"+tr_anos[m]];
            var val_hiet_mx = val_pp_mx[j]*trs_tr["LS_"+tr_anos[m]];

            // datos_idf[tr_anos[m]].push(parseFloat(val_temp_me));
            // if(n==1){
            //     val_temp_me = val_hiet_me;
            // }else{
            //     val_temp_me = val_pp_me[j]*trs_tr["LM_"+tr_anos[m]] - val_pp_me[j-1]*trs_tr["LM_"+tr_anos[m]];
            // };

            if(n==1){
                val_temp_me_graf = val_hiet_me;
            }else{
                val_temp_me_graf = val_pp_me[j]*trs_tr["LM_"+tr_anos[m]] - val_pp_me[j-1]*trs_tr["LM_"+tr_anos[m]];
            };
            datos_idf[tr_anos[m]].push(parseFloat(val_temp_me_graf*1/n).toFixed(2));
            datos_hietograma[tr_anos[m]].push(parseFloat(val_temp_me_graf).toFixed(2));

            tabla_datos += "</td><td align=center style='padding: 0px;'>";
            tabla_datos += "<strong>"+parseFloat(val_hiet_me).toFixed(1)+"</strong>";
            tabla_datos += "("+parseFloat(val_hiet_mn).toFixed(1)+"-"+parseFloat(val_hiet_mx).toFixed(1)+")";
            tabla_datos += "</td>";
        }
        tabla_datos += "</tr>"
    }
    tabla_datos += "</tbody></table>";

    tabla_datos += '<br><br><button onclick="exportTableToExcel(';
    tabla_datos += "'tabla_datos'";
    tabla_datos += ')>Exportar a Excel</button>';
    document.getElementById("tabla_datos").innerHTML = tabla_datos;
    create_graph(datos_idf);
    create_graph2(datos_hietograma)

}

var create_graph2 = function(datos){
    var graph_ddf = document.getElementById("graph_ddf2");
    var graph_TR2 = {
        label: "TR2",
        data: datos["TR2"],
        backgroundColor: 'red',
        hidden: true
    };

    var graph_TR5 = {
        label: "TR5",
        data: datos["TR5"],
        backgroundColor: 'blue',
        fill: false,
        hidden: true
    };

    var graph_TR10 = {
        label: "TR10",
        data: datos["TR10"],
        backgroundColor: 'pink',
        fill: false
    };

    var graph_TR30 = {
        label: "TR30",
        data: datos["TR30"],
        backgroundColor: 'black',
        fill: false,
        hidden: true
    };

    var graph_TR50 = {
        label: "TR50",
        data: datos["TR50"],
        backgroundColor: '#98B9AB',
        fill: false,
        hidden: true
    };

    var graph_TR100 = {
        label: "TR100",
        data: datos["TR100"],
        backgroundColor: '#F9B90AFF',
        fill: false,
        hidden: true
    };

    var graph_TR500 = {
        label: "TR500",
        data: datos["TR500"],
        backgroundColor: '#34A74BFF',
        fill: false,
        hidden: true
    };

    var graph_TR1000 = {
        label: "TR1000",
        data: datos["TR1000"],
        backgroundColor: '#AFA100',
        fill: false,
        hidden: true
    };

    var TR_data = {
      labels: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
      datasets: [graph_TR2, graph_TR5, graph_TR10, graph_TR30, graph_TR50, graph_TR100, graph_TR500, graph_TR1000]
    };

    var chartOptionsBar = {
      fontSize:10,
      title: {
        display: true,
        text: 'HIETOGRAMA DE TORMENTA PLUVIOMÉTRICA',
        fontColor: "black",
        fontSize: 14,
        fontStyle: "bold"
      },
      scales:{
        yAxes: [{
                scaleLabel: {
                display: true,
                labelString: 'Precipitación [mm]',
                fontColor: "black",
                fontSize:12,
                fontStyle: "bold"
            }
        }],
        xAxes: [{
                ticks: {
                    autoSkip: false,
                    maxRotation: 90,
                    minRotation: 90
                },
                scaleLabel: {
                display: true,
                labelString: 'Duración [hr]',
                fontColor: "black",
                fontSize:12,
                fontStyle: "bold"
            }
            }]
      },
      legend: {
        display: true,
        position: 'right',
        align: 'center',
        labels: {
          fontColor: 'black',
          fontSize: 10,
          usePointStyle: true
        }
      }
    };

    var lineChart = new Chart(graph_ddf, {
      type: 'bar',
      data: TR_data,
      options: chartOptionsBar
    });

}

var create_graph = function(datos){
    var graph_ddf = document.getElementById("graph_ddf");
    var graph_TR2 = {
        label: "TR2",
        data: datos["TR2"],
        borderColor: 'red',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR5 = {
        label: "TR5",
        data: datos["TR5"],
        borderColor: 'blue',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR10 = {
        label: "TR10",
        data: datos["TR10"],
        borderColor: 'pink',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR30 = {
        label: "TR30",
        data: datos["TR30"],
        borderColor: 'black',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR50 = {
        label: "TR50",
        data: datos["TR50"],
        borderColor: '#98B9AB',
        fill: false,
        pointStyle: 'line',
        hidden: true
    };

    var graph_TR100 = {
        label: "TR100",
        data: datos["TR100"],
        borderColor: '#F9B90AFF',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR500 = {
        label: "TR500",
        data: datos["TR500"],
        borderColor: '#34A74BFF',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR1000 = {
        label: "TR1000",
        data: datos["TR1000"],
        borderColor: '#AFA100',
        fill: false,
        pointStyle: 'line'
    };

    var TR_data = {
      labels: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
      datasets: [graph_TR2, graph_TR5, graph_TR10, graph_TR30, graph_TR50, graph_TR100, graph_TR500, graph_TR1000]
    };

    var chartOptionsLine = {
      responsive: true,
      fontSize:10,
      title: {
        display: true,
        text: 'CURVAS INTENSIDAD, DURACIÓN Y FRECUENCIA - IDF',
        fontColor: "black",
        fontSize:14,
        fontStyle: "bold"
      },
      scales:{
        yAxes: [{
                scaleLabel: {
                display: true,
                labelString: 'Intensidad [mm/hr]',
                fontColor: "black",
                fontSize:12,
                fontStyle: "bold"
            }
        }],
        xAxes: [{
                ticks: {
                    autoSkip: false,
                    maxRotation: 90,
                    minRotation: 90
                },
                scaleLabel: {
                display: true,
                labelString: 'Duración [hr]',
                fontColor: "black",
                fontSize:12,
                fontStyle: "bold"
            }
            }]
      },
      legend: {
        display: true,
        position: 'right',
        align: 'center',
        // verticalAlign: "center",
        // horizontalAlign: "center",
        labels: {
          fontColor: 'black',
          fontSize: 10,
          usePointStyle: true
        }
      }
    };

    var lineChart = new Chart(graph_ddf, {
      type: 'line',
      data: TR_data,
      options: chartOptionsLine
    });

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
    // Capas principales
    var cuencas = L.tileLayer.wms(host + "geoserver/dhi/wms", {
      layers: "dhi:gpo_regiones_hidrograficas",
      format: 'image/png',
      transparent: true
    });

    var departamentos = L.tileLayer.wms(host + "geoserver/dhi/wms", {
       layers: "dhi:gpo_departamentos",
       format: 'image/png',
       transparent: true
    });

    var provincias = L.tileLayer.wms(host + "geoserver/dhi/wms", {
       layers: "dhi:gpo_provincias",
       format: 'image/png',
       transparent: true
    });

    var regionespp = L.tileLayer.wms(host + "geoserver/dhi/wms", {
       layers: "dhi:gpo_regiones_pp",
       format: 'image/png',
       transparent: true
    });

    var indice_avenidas = L.tileLayer.wms(host + "geoserver/dhi/wms", {
       // opacity: 0.8,
       layers: "dhi:gpo_indice_avenida",
       format: 'image/png',
       transparent: true,
       version: "1.3.0"
    });

    // Mapas base
    var basemaps = {
        'Stamen': bm_stamen(),
        'OpenStreetMap': bm_openstreetmap(),
        'OpenTopoMap': bm_opentopomap(),
        'Satellite': bm_satellite().addTo(map),
        'Blank': blank()
    };

    var layers = {
        'Indice de avenidas': indice_avenidas.addTo(map),
        'Regiones pp máxima': regionespp.addTo(map),
        'Departamentos': departamentos,
        'Provincias': provincias,
        'Cuencas Hidrograficas': cuencas,
    };

    L.control.layers(basemaps, layers, {collapsed: true}).addTo(map);
    L.control.betterscale({metric: true, imperial: false}).addTo(map);

    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML += "<b>Leyenda:</b><br>";
            // div.innerHTML += '<img src="'+host+'geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.3.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&STRICT=false&style=raster_style">';
            div.setAttribute("onmouseenter", "showDisclaimer()");
            div.setAttribute("onmouseleave", "hideDisclaimer()");
            div.id = "info legend"
        return div;
    };
    legend.addTo(map);

    var sidebar = L.control.sidebar('sidebar_leaflet').addTo(map);
    sidebar.open('principal');
    
    map.on('click', function (evt) { extraerData_click(evt) });
}

funcion_inicial()

var extraerData_button = function () {
    if (marker !== null) {
        map.removeLayer(marker);
    }
    var coord_x = document.getElementById("coord_x").value;
    var coord_y = document.getElementById("coord_y").value;
    var coord = [parseFloat(coord_y), parseFloat(coord_x)]
    marker = L.marker(coord, {icon: markerIcon}).addTo(map);
    map.setView([coord[0], coord[1]-0.05], 11);
    console.log(coord);
    var coord_evt = {"latlng": {"lat": coord[0], "lng": coord[1]}}
    console.log(coord_evt);
    getFeatureInfo(coord_evt, "dhi:gpo_regiones_pp");
    getFeatureInfo(coord_evt, "dhi:q_pp")
}


//////////////////////////////////////////////////////////////////////////////////////////////


var create_bh_tdps = function(){
    var g01_bh = JSON.parse(tdps01_bh);
    var graph_bh_tdps = document.getElementById("create_bh_tdps");
    console.log(g01_bh["0001"]["pp_month"].split(",").map(Number));

    var d01_bh_pp = {
        label: "PP",
        data: g01_bh["0001"]["pp_month"].split(",").map(Number),
        backgroundColor: '#F9B90AFF',
        fill: false
    };

    var d01_bh_etr = {
        label: "ETR",
        data: g01_bh["0001"]["etr_month"].split(",").map(Number),
        backgroundColor: '#34A74BFF',
        fill: false
    };

    var d01_bh_wyld = {
        label: "WYLD",
        data: g01_bh["0001"]["wyld_clima"].split(",").map(Number),
        backgroundColor: '#34A74BFF',
        fill: false
    };

    var d01_data = {
      labels: ["PP","ETR","WYLD"],
      datasets: [d01_bh_pp, d01_bh_etr, d01_bh_wyld]
    };

    var chartOptionsBar = {
      fontSize:10,
      title: {
        display: true,
        text: 'HIETOGRAMA DE TORMENTA PLUVIOMÉTRICA',
        fontColor: "black",
        fontSize: 14,
        fontStyle: "bold"
      },
      scales:{
        yAxes: [{
                scaleLabel: {
                display: true,
                labelString: 'Precipitación [mm]',
                fontColor: "black",
                fontSize:12,
                fontStyle: "bold"
            }
        }],
        xAxes: [{
                ticks: {
                    autoSkip: false,
                    maxRotation: 90,
                    minRotation: 90
                },
                scaleLabel: {
                display: true,
                labelString: 'Duración [hr]',
                fontColor: "black",
                fontSize:12,
                fontStyle: "bold"
            }
            }]
      },
      legend: {
        display: true,
        position: 'right',
        align: 'center',
        labels: {
          fontColor: 'black',
          fontSize: 10,
          usePointStyle: true
        }
      }
    };

    var barChart = new Chart(graph_bh_tdps, {
      type: 'bar',
      data: d01_data,
      options: chartOptionsBar
    });

}

create_bh_tdps()


//////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("download").addEventListener('click', function(){
  var url_base64jp = document.getElementById("graph_ddf").toDataURL("image/jpg");
  var a =  document.getElementById("download");
  a.href = url_base64jp;
});

