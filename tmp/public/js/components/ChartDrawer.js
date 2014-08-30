/*
    Class Responsable of drawing the necessary shapes on a specific element
*/
function ChartDrawer(){

    this.barsAndLinesData = function ( data, metrics ) {
        var chart_data_values = [],
            chart_data_labels = [],
            chart_dataset = [],
            categories = [];

        for( var i = 0; i < data.items.length; i++ ){
            chart_data_labels.push( data.items[i][0] );

            for( var j = 1; j < data.items[i].length; j++ ){
                if( Object.prototype.toString.call( chart_data_values[j-1] ) !== '[object Array]' )
                    chart_data_values[j-1] = [];

                chart_data_values[j-1].push( parseFloat( data.items[ i ][ j ] ) );
            }//for
        }//for

        for( var i = 0; i < metrics.length; i++ )
            categories.push( $(metrics[i]).text() );

        for( var i = 0; i < categories.length; i++ ){
            chart_dataset.push({
                name: categories[i],
                data: chart_data_values[i]
            });
        }//for

        return {
            'categories': categories,
            'labels': chart_data_labels,
            'dataset': chart_dataset
        };
    }//barsAndLinesData

    /*
        el: element to draw the shape on
        doughnut: true, if you want a doughnut
        data: list of data
    */
    this.pie = function( el, doghnut, data ){
        var colors = [],
            chart_data = [],
            chart_metrics = [];

        for( var i = 0; i < data.items.length; i++ ){
            chart_data.push({
                name: data.items[i][0],
                y: parseInt( data.items[i][1] )
            });
        }//for

        var series = [{
                type: 'pie',
                name: '',
                data: chart_data
            }];

        if( doghnut )
            series[0].innerSize = '50%';


        el.highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: 1,//null,
                plotShadow: false
            },
            title: {
                text: ''
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    },
                    showInLegend: true
                }
            },
            series: series
        });//highchart
    }//pie

    /*
        el: element to draw the shape on
        data: list of data
    */
    this.doghnut = function( el, data ){
        this.pie( el, true, data );
    }//doghnut

    /*
        el: element to draw the shape on
        data: list of data
        metrics: Y axis values
    */
    this.lines = function( el, data, metrics ){
        var linesData = this.barsAndLinesData( data, metrics );

        el.highcharts({
            title: {
                text: "",
                x: -20 //center
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: linesData.labels
            },
            yAxis: {
                title: {
                    text: linesData.categories.join(' and ')
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                headerFormat: '<table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:.1f}	</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
                borderWidth: 0
            },
            series: linesData.dataset
        });
    }//Lines


    this.bars = function( el, data, metrics, dimension ){
        var barsData = this.barsAndLinesData( data, metrics );

        el.highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: ""
            },
            subtitle: {
                text: '',
                x: -20 //center
            },
            xAxis: {
                categories: barsData.labels
            },
            yAxis: {
                min: 0,
                title: {
                    text: ''
                }
            },
            tooltip: {
                headerFormat: '<table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:.1f}	</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: barsData.dataset
        });
    }//bars


    this.table = function( el, data, metrics, dimensions ){
        var chart_data_values = [],
            chart_data_labels = [],
            chart_dataset = [],
            table_headers = dimensions.concat( metrics ) ,
            table = "";

        table = "<table class='table table-hover table-bordered'>";
        table += "<tr>";
        for( var i = 0; i < table_headers.length; i++ ){
            table += "<th>" + $(table_headers[i]).text() + "</th>";
        }//for
        table += "</tr>";

        for( var i = 0; i < data.items.length; i++ ){
            table += "<tr>";
            for( var j = 0; j < data.items[i].length; j++ ){
                table += "<td>" + formatFloat( data.items[i][j], 2 ) + "</td>";
            }//for
            table += "</tr>";
        }//for
        table += "</table>";

        el.html( table );
    }//table

}//ChartDrawer
