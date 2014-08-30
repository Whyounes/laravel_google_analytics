$(function(){
    window.chart = new Charting(
                        new ChartDrawer(),
                        new ChartFilter('.dimension_filters'),
                        new ChartFilter('.metric_filters'),
                        new OrderbyFilter('.orderbys'),
                        new WidgetsViewer( '.widgets', [ 'col-md-6', 'col-md-6' ], false, true, true ),
                        new SortableList('.charts_list')
                    );
    chart.init();

    $("#generate_chart").click(function(){
        var spinner = $(this).closest('div').find('.spinner');
        spinner.css('opacity', 1);
        chart.generateChart();
        spinner.css('opacity', 0);
    });
});
