var data_regiones = JSON.parse(datos_regiones)[0];
console.log(data_regiones);

var q_pp = JSON.parse(quartiles_pp);
var trs = q_pp["features"][0]["properties"];
console.log(trs);

var generar_tb_pp = function() {
    var tr_anos = ["TR_2","TR_5","TR_10","TR_30","TR_50","TR_75","TR_100","TR_200","TR_500","TR_1000"];
    // var region = "A1";//document.getElementById('select_quartil').value;
    var region = document.getElementById("infoRegion").innerText.replace("Subregión: ","");
    var trs_tr = parseFloat(document.getElementById("infoRaster").innerText.replace("PP Máxima: ", ""));
    var quartil = document.getElementById('select_quartil').value;
    var percentil = document.getElementById('select_percentil').value;
    var tr = document.getElementById('select_tr').value;
    var val_temp;

    console.log(trs_tr);
    console.log(data_regiones[region][quartil][percentil]);

    var tabla_datos = "<table id='dtHorizontal' class='table table-striped' width=100%>";
    // tabla_datos += "<tr><th align=center>Horas</th><th align=center>"+percentil+"</th><th align=center>PP</th><th align=center>"+trs_tr.toFixed(2)+"</th></tr>";
    tabla_datos += "<thead><tr><th align=center>Duración</th>";

    for(cab=0;cab<=9;cab++){
        tabla_datos+="<th>"+tr_anos[cab]+"</th>";
    };

    tabla_datos += "</tr></thead><tbody>";
    for(j=0;j<=23;j++){
        var n = j+1
        // console.log(q_pp[tr])

        var val_pp_mn = data_regiones[region][quartil]["P10"];
        var val_pp_me = data_regiones[region][quartil]["P50"];
        var val_pp_mx = data_regiones[region][quartil]["P90"];

        var val_hiet_mn = (val_pp_mn[j]*trs_tr).toFixed(2);
        var val_hiet_me = (val_pp_me[j]*trs_tr).toFixed(2);
        var val_hiet_mx = (val_pp_mx[j]*trs_tr).toFixed(2);

        // var val_pp = data_regiones[region][quartil][percentil];
        // var val_hiet = (val_pp[j]*trs_tr).toFixed(2);

        if(n==1){
            val_temp_mn = val_hiet_mn;
            val_temp_me = val_hiet_me;
            val_temp_mx = val_hiet_mx;
        }else{
            val_temp_mn = val_pp_mn[j]*trs_tr - val_pp_mn[j-1]*trs_tr;
            val_temp_me = val_pp_me[j]*trs_tr - val_pp_me[j-1]*trs_tr;
            val_temp_mx = val_pp_mx[j]*trs_tr - val_pp_mx[j-1]*trs_tr;
        };
        console.log(val_temp_me);
        tabla_datos += "<tr><td align=center>"+n+"-hr";
        tabla_datos += "</td><td align=center>"+val_pp_me[j];
        tabla_datos += "</td><td align=center>"+val_hiet_me;
        tabla_datos += "</td><td align=center style='padding: 0px;'>";
        tabla_datos += "<strong>"+parseFloat(val_temp_me).toFixed(2)+"</strong>";
        tabla_datos += "("+parseFloat(val_temp_mn).toFixed(2)+"-"+parseFloat(val_temp_mx).toFixed(2)+")";
        tabla_datos += "</td></tr>";
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
