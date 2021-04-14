var create_bh_tdps = function(){
	var g01_bh = JSON.parse(tdps01_bh)[0];
    console.log(g01_bh);
    var graph_bh_tdps = document.getElementById("create_bh_tdps");
    
    var d01_bh_pp = {
        label: "PP",
        data: g01_bh["pp_month"],
        backgroundColor: '#F9B90AFF',
        fill: false,
        hidden: true
    };

    var d01_bh_etr = {
        label: "ETR",
        data: g01_bh["etr_month"],
        backgroundColor: '#34A74BFF',
        fill: false,
        hidden: true
    };

    var d01_bh_wyld = {
        label: "WYLD",
        data: g01_bh["wyld_clima"],
        backgroundColor: '#34A74BFF',
        fill: false,
        hidden: true
    };

    var d01_data = {
      // labels: ["PP","ETR","WYLD"],
      labels: [1,2,3,4,5,6,7,8,9,10,11,12],
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
