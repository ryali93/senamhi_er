var map = L.map('map');
map.setView([-10, -82], 6);
var marker = null;
var host = "http://192.168.1.62:8080/"
var source_url = host + "geoserver/dhi/wms";
var markerIcon = L.icon({
    iconUrl: 'assets/img/marker.png',
    iconAnchor:   [0.5, 1]
});
var escenarios = {
    "ESC_HST" : "dhi:dhi_pp_q",
    "ESC_ACCESS" : "dhi:dhi_pp_access",
    "ESC_HADGEM" : "dhi:dhi_pp_hadgem",
    "ESC_MPI" : "dhi:dhi_pp_mpi",
    "ESC_MED" :"dhi:dhi_pp_med"
};

var first_window = function(){
    var win =  L.control.window(map,{title:'<h3 style="text-align:center">Herramienta Web para el desarrollo de Curvas de Intensidad - Duración - Frecuencia</h3>',maxWidth:600,minWidth:400,modal: true})
            .content('La presente herramienta basada en la web integra una interfaz de usuario con sistemas de Información Geográfica (GIS). A la vez, muestra un conjunto de datos basados en precipitaciones extremas, y a partir de ello, se construyen tormentas de diseño para ser aplicados en diversos campos de la ingeniería, como la hidrología urbana, diseño de infraestructura y estudios de evaluación de riesgos, entre otros.')
            .show()
};

first_window();


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
                if(info_data["subregion"] != undefined){
                    document.getElementById('infoRegion').innerHTML = '<p id="infoRegion"><b>Región: '+info_data["subregion"]+'</b></p>'
                }
                else{
                    generar_tb_pp(info_data);
                    changeVisibility();
                }
            });
    }
};

var showDisclaimer = function() {
    var div = document.getElementById("info legend")
    div.innerHTML = "<b>Índice de avenidas:</b><br>";
    div.innerHTML += '<img src="'+host+'geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.3.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&STRICT=false&style=style_pp_max_monthly_opc3">';
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
    document.getElementById("coord_x").value = evt.latlng["lng"].toFixed(3);
    document.getElementById("coord_y").value = evt.latlng["lat"].toFixed(3);
    var escenario = document.getElementById('select_escenario').value;
    getFeatureInfo(evt, "dhi:gpo_regiones_pp");
    getFeatureInfo(evt, escenarios[escenario])
    
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
    });
}

var changeVisibility = function() {
    document.getElementById("exportar_tabla").style.visibility = "visible";
}

var generar_tb_pp = function(trs_tr) {
    var data_regiones = JSON.parse(datos_regiones);
    console.log(data_regiones);

    var tr_anos = ["TR2","TR5","TR10","TR30","TR50","TR75","TR100","TR200","TR500","TR1000"];
    var region = document.getElementById("infoRegion").innerText.replace("Región: ","");
    // var quartil = document.getElementById('select_quartil').value;
    var val_temp;
    var intensidades;

    var tabla_datos = "<table id='dtHorizontal' class='table table-striped' width=100%>";
    tabla_datos += "<thead><tr><th colspan='11' align=center style='font-size:14px;'>Intensidades de precipitación, para diferentes duraciones y periodos de retorno.</th>";
    tabla_datos += "<tr><th align=center>Duración</th>";

    var datos_cldf = {};
    var datos_hietograma = {};
    var datos_hietograma_mn = {};
    var datos_hietograma_mx = {};
    var datos_idf = {};
    for(cab=0;cab<=9;cab++){
        tabla_datos+="<th>"+tr_anos[cab]+"</th>";
        datos_hietograma[tr_anos[cab]] = [];
        datos_hietograma_mn[tr_anos[cab]] = [];
        datos_hietograma_mx[tr_anos[cab]] = [];
        datos_cldf[tr_anos[cab]] = [];
    };

    tabla_datos += "</tr></thead><tbody>";
    for(j=0;j<=23;j++){
        var n = j+1

        var val_pp_mn = data_regiones[region];
        var val_pp_me = data_regiones[region];
        var val_pp_mx = data_regiones[region];

        // tabla_datos += "<tr><td align=center>"+n+"-hr";

        for(m=0;m<=9;m++){
            var val_hiet_mn = val_pp_mn[j]*trs_tr["LI_"+tr_anos[m]];
            var val_hiet_me = val_pp_me[j]*trs_tr["LM_"+tr_anos[m]];
            var val_hiet_mx = val_pp_mx[j]*trs_tr["LS_"+tr_anos[m]];

            datos_cldf[tr_anos[m]].push(parseFloat(val_hiet_me).toFixed(2))

            if(n==1){
                val_temp_mn_graf = val_hiet_mn;
                val_temp_me_graf = val_hiet_me;
                val_temp_mx_graf = val_hiet_mx;
            }else{
                val_temp_mn_graf = val_pp_mn[j]*trs_tr["LI_"+tr_anos[m]] - val_pp_mn[j-1]*trs_tr["LI_"+tr_anos[m]];
                val_temp_me_graf = val_pp_me[j]*trs_tr["LM_"+tr_anos[m]] - val_pp_me[j-1]*trs_tr["LM_"+tr_anos[m]];
                val_temp_mx_graf = val_pp_mx[j]*trs_tr["LS_"+tr_anos[m]] - val_pp_mx[j-1]*trs_tr["LS_"+tr_anos[m]];
            };
            datos_hietograma[tr_anos[m]].push(parseFloat(val_temp_me_graf).toFixed(2));
            datos_hietograma_mn[tr_anos[m]].push(parseFloat(val_temp_mn_graf).toFixed(2));
            datos_hietograma_mx[tr_anos[m]].push(parseFloat(val_temp_mx_graf).toFixed(2));

            // tabla_datos += "</td><td align=center style='padding: 0px;'>";
            // tabla_datos += "<strong>"+parseFloat(val_hiet_me).toFixed(1)+"</strong>";
            // tabla_datos += "("+parseFloat(val_hiet_mn).toFixed(1)+"-"+parseFloat(val_hiet_mx).toFixed(1)+")";
            // tabla_datos += "</td>";
        }
        // tabla_datos += "</tr>"
    }
    // datos_idf = datos_idf.sort(function(a, b) { return a - b }).reverse()
    // datos_hietograma = datos_hietograma.sort(function(a, b) { return a - b }).reverse()
    // console.log(datos_hietograma["TR2"].map(parseFloat).sort(function(a, b) { return a - b }).reverse());
    var h;
    for(H in datos_hietograma){
        h = datos_hietograma[H].map(parseFloat).sort(function(a, b) { return a - b }).reverse();
        datos_hietograma[H] = [h[22],h[20],h[18],h[16],h[14],h[12],h[10],h[8],h[6],h[4],h[2],h[0],h[1],h[3],h[5],h[7],h[9],h[11],h[13],h[15],h[17],h[19],h[21],h[23]]
    };
    for(H in datos_hietograma_mn){
        h = datos_hietograma_mn[H].map(parseFloat).sort(function(a, b) { return a - b }).reverse();
        datos_hietograma_mn[H] = [h[22],h[20],h[18],h[16],h[14],h[12],h[10],h[8],h[6],h[4],h[2],h[0],h[1],h[3],h[5],h[7],h[9],h[11],h[13],h[15],h[17],h[19],h[21],h[23]]
    };
    for(H in datos_hietograma_mx){
        h = datos_hietograma_mx[H].map(parseFloat).sort(function(a, b) { return a - b }).reverse();
        datos_hietograma_mx[H] = [h[22],h[20],h[18],h[16],h[14],h[12],h[10],h[8],h[6],h[4],h[2],h[0],h[1],h[3],h[5],h[7],h[9],h[11],h[13],h[15],h[17],h[19],h[21],h[23]]
    };

    create_graph_cldf(datos_cldf)
    // create_graph_hietograma(datos_hietograma)
    intensidades = mean_intensity(datos_hietograma)
    datos_idf = datos_idf_update(intensidades)
    create_graph_idf(datos_idf)

    intensidades_mn = mean_intensity(datos_hietograma_mn)
    datos_idf_mn = datos_idf_update(intensidades_mn)
    intensidades_mx = mean_intensity(datos_hietograma_mx)
    datos_idf_mx = datos_idf_update(intensidades_mx)

    for(j=0;j<=23;j++){
        var n = j+1
        tabla_datos += "<tr><td align=center>"+n+"-hr";
        for(m=0;m<=9;m++){
            tabla_datos += "</td><td align=center style='padding: 0px;'>";
            tabla_datos += "<strong>"+parseFloat(datos_idf[tr_anos[m]][j]).toFixed(1)+"</strong>";
            tabla_datos += "("+parseFloat(datos_idf_mn[tr_anos[m]][j]).toFixed(1)+"-"+parseFloat(datos_idf_mx[tr_anos[m]][j]).toFixed(1)+")";
            tabla_datos += "</td>";
        }
        tabla_datos += "</tr>"
    }

    tabla_datos += "</tbody></table>";

    tabla_datos += '<br><br><button onclick="exportTableToExcel(';
    tabla_datos += "'tabla_datos'";
    tabla_datos += ')>Exportar a Excel</button>';
    document.getElementById("tabla_datos").innerHTML = tabla_datos;

}

var create_graph_hietograma = function(datos){
    // HIETOGRAMA DE DISEÑO
    var graph_TR2 = {
        label: "TR2",
        data: datos["TR2"],
        backgroundColor: 'red',
        hidden: false
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
        fill: false,
        hidden: true
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

    var graph_TR75 = {
        label: "TR75",
        data: datos["TR75"],
        backgroundColor: 'green',
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

    var graph_TR200 = {
        label: "TR200",
        data: datos["TR200"],
        backgroundColor: 'brown',
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
      labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
      datasets: [graph_TR2, graph_TR5, graph_TR10, graph_TR30, graph_TR50, graph_TR75, graph_TR100, graph_TR200, graph_TR500, graph_TR1000]
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
        position: 'bottom',
        align: 'center',
        labels: {
          fontColor: 'black',
          fontSize: 10,
          usePointStyle: true
        }
      }
    };

    var graph_ddf = document.getElementById("graph_ddf2");
    var barChart = new Chart(graph_ddf, {
      type: 'bar',
      data: TR_data,
      options: chartOptionsBar
    });

}

var create_graph_idf = function(datos){
    var graph_ddf = document.getElementById("graph_ddf");
    var graph_TR2 = {
        label: "TR2",
        data: datos["TR2"].sort(function(a, b) { return a - b }).reverse(),
        borderColor: 'red',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR5 = {
        label: "TR5",
        data: datos["TR5"].sort(function(a, b) { return a - b }).reverse(),
        borderColor: 'blue',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR10 = {
        label: "TR10",
        data: datos["TR10"].sort(function(a, b) { return a - b }).reverse(),
        borderColor: 'pink',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR30 = {
        label: "TR30",
        data: datos["TR30"].sort(function(a, b) { return a - b }).reverse(),
        borderColor: 'black',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR50 = {
        label: "TR50",
        data: datos["TR50"].sort(function(a, b) { return a - b }).reverse(),
        borderColor: '#98B9AB',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR75 = {
        label: "TR75",
        data: datos["TR75"].sort(function(a, b) { return a - b }).reverse(),
        borderColor: 'green',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR100 = {
        label: "TR100",
        data: datos["TR100"].sort(function(a, b) { return a - b }).reverse(),
        borderColor: '#F9B90AFF',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR200 = {
        label: "TR200",
        data: datos["TR200"].sort(function(a, b) { return a - b }).reverse(),
        borderColor: 'brown',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR500 = {
        label: "TR500",
        data: datos["TR500"].sort(function(a, b) { return a - b }).reverse(),
        borderColor: '#34A74BFF',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR1000 = {
        label: "TR1000",
        data: datos["TR1000"].sort(function(a, b) { return a - b }).reverse(),
        borderColor: '#AFA100',
        fill: false,
        pointStyle: 'line'
    };

    var TR_data = {
      labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
      datasets: [graph_TR2, graph_TR5, graph_TR10, graph_TR30, graph_TR50, graph_TR75, graph_TR100, graph_TR200, graph_TR500, graph_TR1000]
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
        position: 'bottom',
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

var create_graph_cldf = function(datos){
    console.log(datos);
    var graph_ddf = document.getElementById("graph_cldf");
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
        pointStyle: 'line'
    };

    var graph_TR75 = {
        label: "TR75",
        data: datos["TR75"],
        borderColor: 'green',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR100 = {
        label: "TR100",
        data: datos["TR100"],
        borderColor: '#F9B90AFF',
        fill: false,
        pointStyle: 'line'
    };

    var graph_TR200 = {
        label: "TR200",
        data: datos["TR200"],
        borderColor: 'brown',
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
      labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
      datasets: [graph_TR2, graph_TR5, graph_TR10, graph_TR30, graph_TR50, graph_TR75, graph_TR100, graph_TR200, graph_TR500, graph_TR1000]
    };

    var chartOptionsLine = {
      responsive: true,
      fontSize:10,
      title: {
        display: true,
        text: 'CURVAS LÁMINA-DURACIÓN-FRECUENCIA',
        fontColor: "black",
        fontSize:14,
        fontStyle: "bold"
      },
      scales:{
        yAxes: [{
                scaleLabel: {
                display: true,
                labelString: 'Precipitación máxima [mm]',
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
        position: 'bottom',
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
    lineChart.update();

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
       opacity: 0.8,
       layers: "dhi:gpo_pp_max_monthly",
       format: 'image/png',
       transparent: true,
       version: "1.3.0"
    });

    var indice_avenidas = L.tileLayer.wms(host + "geoserver/dhi/wms", {
       opacity: 0.8,
       layers: "dhi:gpo_pp_max_monthly",
       format: 'image/png',
       transparent: true,
       version: "1.3.0"
    });

    // Mapas base
    var basemaps = {
        'Stamen': bm_stamen(),
        'OpenStreetMap': bm_openstreetmap().addTo(map),
        'OpenTopoMap': bm_opentopomap(),
        'Satellite': bm_satellite(),
        'Blank': blank()
    };

    var layers = {
        // 'Indice de avenidas': indice_avenidas,
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
            div.setAttribute("onmouseenter", "showDisclaimer()");
            div.setAttribute("onmouseleave", "hideDisclaimer()");
            div.id = "info legend"
        return div;
    };
    // legend.addTo(map);

    var sidebar = L.control.sidebar('sidebar_leaflet').addTo(map);
    sidebar.open('lluvias');
    
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
    var coord_evt = {"latlng": {"lat": coord[0], "lng": coord[1]}}
    var escenario = document.getElementById('select_escenario').value;
    getFeatureInfo(coord_evt, "dhi:gpo_regiones_pp");
    getFeatureInfo(coord_evt, escenarios[escenario])
}


var power_regression = function(x,y){
    var n = x.length;
    var lr = {};
    var sumX = 0;
    var sumX2 = 0;
    var sumY = 0;
    var sumXY = 0
    for(i=0;i<=n-1;i++){
        sumX = sumX + Math.log(x[i]);
        sumX2 = sumX2 + Math.log(x[i])*Math.log(x[i]);
        sumY = sumY + Math.log(y[i]);
        sumXY = sumXY + Math.log(y[i])*Math.log(x[i]);
    }
    var b = (n*sumXY - sumX*sumY)/(n*sumX2 - sumX*sumX);
    var A = (sumY - b*sumX)/n
    var a = Math.exp(A);
    lr["a"] = a;
    lr["b"] = b;
    return(lr)
}

var create_intensity = function(T,d,k,m,n){
    var I = k*(T**m)/(d**n)
    return(I)
}

var mean_intensity = function(datos){
    var x = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
    var trs = [2,5,10,30,50,75,100,200,500,1000];
    var pp_dec = {}
    var intens = {};
    var d;
    for(T in trs){
        pp_dec["TR"+trs[T]] = []
        intens["TR"+trs[T]] = []
    }
    for(T in trs){
        pp_dec["TR"+trs[T]] = datos["TR"+trs[T]].map(parseFloat).sort(function(a, b) { return a - b }).reverse()
    }
    for(T in trs){
        for(i=1;i<=24;i++){
            intens["TR"+trs[T]].push(pp_dec["TR"+trs[T]].slice(0,i).reduce((a, b) => a + b, 0)/i)
        }
    }
    return(intens)
}


var datos_idf_update = function(datos){
    var x = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
    var trs = [2,5,10,30,50,75,100,200,500,1000];

    var lr;
    var coef = [];
    var expon = [];
    var lr_pr;
    var k,T,m,d,n;
    for(m in datos){
        lr = power_regression(x, datos[m].map(parseFloat))
        coef.push(lr["a"]);
        expon.push(lr["b"]);
    }
    lr_pr = power_regression(trs, coef);
    k = lr_pr["a"];
    m = lr_pr["b"];
    n = -1*expon.reduce((a,v,i)=>(a*i+v)/(i+1));

    var intens = {};
    for(T in trs){
        intens["TR"+trs[T]] = [];
        for(d=1;d<=24;d++){
            intens["TR"+trs[T]].push(create_intensity(trs[T],d,k,m,n));
        }
    }
    return(intens);
}
