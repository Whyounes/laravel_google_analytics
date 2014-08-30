function Charting( chartDrawer, dimensionFilter, metricFilter, orderbyFilter, widgetsViewer, sortableList ){
    this.chart_type = $(".chart_type:eq(0) > select");
    this.data = undefined;
    this.daterange1 = $('[name="daterange1"]');
    this.daterange2 = $('[name="daterange2"]');
    this.max_results = $('#max_results');
    this.dimension_filters_div = $(".dimension_filters");
    this.metric_filters_div = $(".metric_filters");
    this.orderbys = $(".orderbys");

    //components
    this.chartDrawer = chartDrawer;
    this.dimensionFilter = dimensionFilter;
    this.metricFilter = metricFilter;
    this.orderbyFilter = orderbyFilter;
    this.widgetsViewer = widgetsViewer;
    this.sortableList = sortableList;

    // this.dimension_filter_div = this.filter_dimension.clone();
    // this.metric_filter_div = this.filter_metric.clone();
    // this.orderby_div = this.orderby.clone();
    this.add_filter_btn = undefined;

    this.init = function(){
        //init components
        $("#add_dimension_filter").bind("click", { "this": this }, function( e ){
            e.data.this.dimensionFilter.addFilter();
        });

        $("#add_metric_filter").bind("click", { "this": this }, function( e ){
            e.data.this.metricFilter.addFilter();
        });

        $("#add_orderby").bind("click", { "this": this }, function( e ){
            e.data.this.orderbyFilter.addFilter();
        });

        $("#add_chart").click({ "this": this }, function( e ){
            var data = e.data.this.getChartData();
            if( e.data.this.validateInputs( data.user.view, data.dimensions, data.metrics, data.chartType, data.title ) )
                e.data.this.sortableList.addListItem( data.title, data );
        });

        $("#reset_chart").click({ "this": this }, function( e ){
            e.data.this.sortableList.getListItems().remove();
            e.data.this.widgetsViewer.getWidgets().remove();
        });

        //$(document).on('click', '.widget_edit', { '$this': this }, this.loadData );
        //$(document).on('click', '.widget_close', this.removeWidget );

        this.widgetsViewer.init();
        this.sortableList.init();

        this.getMetadata();
    }//init

    this.initFilters = function( dimensionFilterData, metricFilterData ){
        //init components
        this.dimensionFilter.init(
            dimensionFilterData,
            [
                {
                    name: 'Containing',
                    value: 'contain'
                },
                {
                    name: 'Exactly',
                    value: 'exact'
                },
                {
                    name: 'Regular Expression',
                    value: 'regexp'
                }
            ]
        );

        this.metricFilter.init(
            metricFilterData,
            [
                {
                    name: 'Equal',
                    value: 'eq'
                },
                {
                    name: 'Greater than',
                    value: 'gt'
                },
                {
                    name: 'Less than',
                    value: 'lt'
                },
                {
                    name: 'Greater than or equal',
                    value: 'gteq'
                },
                {
                    name: 'Less than or equal',
                    value: 'lteq'
                }
            ]
        );

        this.orderbyFilter.init( dimensionFilterData.concat( metricFilterData ) );
    }//initFilters

    this.validateInputs = function( view, dimensions, metrics, chartType, title ){
        if( !view || view.length == 0 ){
            alert("You need to enter to specify a view ID");
            return;
        }

        if( !title || view.length == 0 ){
            alert("You need to enter a title for the chart");
            return;
        }

        if( !dimensions || !metrics ){
            alert("You have to choose at least one metric and one dimension");
            return;
        }

        if( chartType == "pie" || chartType == "doghnut" ){
            if( dimensions.length != 1 || metrics.length != 1 ){
                alert("Pie chart accept only one metric and one dimension");
                return;
            }
        }//if
        else if( chartType == "bars" ){

        }
        else if( chartType == "lines" ){
            //verify: one dimension and multiple metrics
            if( dimensions.length != 1 || metrics.length == 0 ){
                alert("Lines chart accept only one dimension and at least one metric");
                return;
            }
        }//else

        return true;
    }//validateData

    /*
        elw: element to update in case on update chart
    */
    this.generateChart = function( ){
        var list = this.sortableList.getListItems();

        for( var i = 0; i < list.length; i++ ){
            var data = $( list[i] ).data('widget-data');
            //minimize the two to one request
            var report1 = getReport(
                                data.dimensions,
                                data.metrics,
                                data.filters,
                                data.orderby,
                                data.daterange1,
                                data.maxResults,
                                data.user.view
                            );
            var report2 = getReport(
                                data.dimensions,
                                data.metrics,
                                data.filters,
                                data.orderby,
                                data.daterange2,
                                data.maxResults,
                                data.user.view
                            );
            if( !report1 || !report2 ){
                alert("Something wrong happened while getting the data, try again");
                return;
            }//if

            if( report1.hasOwnProperty('status') || report1.status == 0 || report2.hasOwnProperty('status') || report2.status == 0 ){
                errorHandler(report1.message || report2.message);
                return;
            }//if

            // if( !report1.hasOwnProperty('items') || this.data.items.length == 0 ){
            //     continue;
            // }//if


            //draw shape
            var chartShape1 = $( "<div></div>"),
                chartShape2 = $( "<div></div>");

            if( data.chartType == "pie" ){
                this.chartDrawer.pie( chartShape1, false, report1 );
                this.chartDrawer.pie( chartShape2, false, report2 );
            }
            else if( data.chartType == "doghnut" ){
                this.chartDrawer.doghnut( chartShape1, report1 );
                this.chartDrawer.doghnut( chartShape2, report2 );
            }
            else if( data.chartType == "bars" ){
                this.chartDrawer.bars( chartShape1, report1, $("#metrics option:selected"), $("#dimensions option:selected") );
                this.chartDrawer.bars( chartShape2, report2, $("#metrics option:selected"), $("#dimensions option:selected") );
            }
            else if( data.chartType == "lines" ){
                this.chartDrawer.lines( chartShape1, report1, $("#metrics option:selected") );
                this.chartDrawer.lines( chartShape2, report2, $("#metrics option:selected") );
            }
            else if( data.chartType == "table" ){
                this.chartDrawer.table( chartShape1, report1, $("#metrics option:selected").toArray(), $("#dimensions option:selected").toArray() );
                this.chartDrawer.table( chartShape2, report2, $("#metrics option:selected").toArray(), $("#dimensions option:selected").toArray() );
            }

            this.widgetize( chartShape1, data, 0 );
            this.widgetize( chartShape2, data, 1 );
        }//for

    }//generateChart

    this.getChartData = function() {
        // account, property, view
        var account = $("#account").val(),
            property = $("#property").val(),
            view = $("#view").val(),
            title =$("#chart_title").val();

        // date
        var daterange1 = $("[name='daterange1']").val(),
            daterange2 = $("[name='daterange2']").val();

        // dimenions, metrics
        var dimensionsList = $("#dimensions").val(),
            metricsList = $("#metrics").val();

        // dimension_filters, metric_filters
        var dimension_filters = [],
            metric_filters = [];

        dimension_filters = this.dimensionFilter.getFilters();
        metric_filters = this.metricFilter.getFilters();
        orderbys = this.orderbyFilter.getFilters();

        // max_results
        var max_results = $("#max_results").val();
        // chart_type
        var chartType = $(".chart_type select").val();

        var data = {
            user: {
                account: account,
                property: property,
                view: view
            },
            title: title,
            daterange1: daterange1,
            daterange2: daterange2,
            dimensions: dimensionsList,
            metrics: metricsList,
            filters: {
                dimensions: dimension_filters,
                metrics: metric_filters
            },
            orderbys: orderbys,
            maxResults: max_results,
            chartType: chartType
        };

        return data;
    }//getChartData

    this.loadData = function( e, widget ){
        widget.addClass("chart_current");

        //need to be passed
        e.data = {
            '$this': chart
        }

        e.data.$this.dimensionFilter.resetFilter();
        e.data.$this.metricFilter.resetFilter();
        e.data.$this.orderbyFilter.resetFilter();

        var data = widget.data("widget-data");

        //request has no meaning
        loadAccounts( data.user.account, function(){
            loadProperties( data.user.account, data.user.property, function(){
                loadViews( data.user.account, data.user.property, data.user.view);
            } );
        });

        $("[name='daterange']").val( data.daterange );

        var dimensions = $(".dimensions");
        dimensions.find("option:selected").attr("selected", false);

        for(var i = 0; i < data.dimensions.length; i++ ){
            dimensions.find("option[value='" + data.dimensions[i] + "']" ).attr( "selected", true );
        }//for

        var metrics = $(".metrics");
        metrics.find("option:selected").attr("selected", false);

        for(var i = 0; i < data.metrics.length; i++ ){
            metrics.find("option[value='" + data.metrics[i] + "']" ).attr( "selected", true );
        }//for

        for( var i = 0; i < data.filters.dimensions.length; i++ ){
            e.data.$this.dimensionFilter.addFilter( data.filters.dimensions[i] );
        }//for

        for( var i = 0; i < data.filters.metrics.length; i++ ){
            e.data.$this.metricFilter.addFilter( data.filters.metrics[i] );
        }//for

        for( var i = 0; i < data.orderbys.length; i++ ){
            e.data.$this.orderbyFilter.addFilter( data.orderbys[i] );
        }//for

        $("#max_results").val( data.maxResults );
        $(".chart_type select").val( data.chartType );
    }//loadData

    this.widgetize = function( body, data, pos ){
        var metrics = [];
        pos = pos || 0;

        $("#metrics option:selected").each(function(i,el){
            metrics.push($(el).text());
        });

        this.widgetsViewer.addWidget( data.title, body, pos, data,
            function( e, widget ){
                widget.find('.widget_edit').remove();
            }
        );
    }//widgetize

    //metadata part
    this.getMetadata = function(){
        var $this = this;
        $.ajax({
            url: "ga/metadata",
            type: "GET",
            dataType: "json",
            success: function( data ){
                $this.setMetadata( data );
            },
            error: function( ex, xhr, message ){
                errorHandler(message);
            }
        });
    }//getMetadata

    this.setMetadata = function( items ){
        var dimensionsHtml = "", metricsHtml = "", tmp, dimensions, metrics;

        var dimensionFilterData = [], metricFilterData = [];

        dimensions = items['dimensions'];
        metrics = items['metrics'];

        for( var k in dimensions ){
            tmp = [];
            dimensionsHtml += "<optgroup label='"+ k +"'>";
            for( var v in dimensions[k] ){
                tmp.push({
                    name: dimensions[k][v].attributes.uiName,
                    value: dimensions[k][v].id
                });
                dimensionsHtml += "<option value='"+ dimensions[k][v].id +"'>"+ dimensions[k][v].attributes.uiName +"</option>";
            }
            dimensionFilterData.push({
                name: k,
                value: tmp
            });
            dimensionsHtml += "</optgroup>";
        }//for

        for( var k in metrics ){
            tmp = [];
            metricsHtml += "<optgroup label='"+ k +"'>";
            for( var v in metrics[k] ){
                tmp.push({
                    name: metrics[k][v].attributes.uiName,
                    value: metrics[k][v].id
                });
                metricsHtml += "<option value='"+ metrics[k][v].id +"'>"+ metrics[k][v].attributes.uiName +"</option>";
            }
            metricFilterData.push({
                name: k,
                value: tmp
            });
            metricsHtml += "</optgroup>";
        }//for

        $(".dimensions").html( "<select multiple id='dimensions' class='form-control'>" + dimensionsHtml + "</select>" );
        $(".metrics").html( "<select multiple id='metrics' class='form-control'>" + metricsHtml + "</select>" );

        this.initFilters( dimensionFilterData, metricFilterData )
    }//setMetadata

}//Charting
