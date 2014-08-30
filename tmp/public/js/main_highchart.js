function Charting( chartDrawer, dimensionFilter, metricFilter, orderbyFilter, widgetsViewer ){
	this.chart_type = $(".chart_type:eq(0) > select");
	this.data = undefined;
	this.daterange = $('[name="daterange"]');
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


		//$(document).on('click', '.widget_edit', { '$this': this }, this.loadData );
		//$(document).on('click', '.widget_close', this.removeWidget );

		this.widgetsViewer.init();

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

	this.validateInputs = function( view, dimensions, metrics, chartType ){
		if( !view || view.length == 0 ){
			alert("You need to enter to specify a view ID");
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
		var dimensions = $("#dimensions").val(),
			metrics = $("#metrics").val(),
			view = $("#view").val();

		var passed = this.validateInputs( view, dimensions, metrics, this.chart_type.val() );
		if( !passed )
			return;

		filters = {
			'metrics': this.metricFilter.getFilters(),
			'dimensions': this.dimensionFilter.getFilters()
		}
		orderby = this.orderbyFilter.getFilters();

		//change all the parametters to an object pls
		this.data = getReport( dimensions, metrics, filters, orderby, this.daterange.val(), this.max_results.val(), view );
		if( !this.data ){
			alert("Something wrong happened while getting the data, try again");
			return;
		}//if

		if( this.data.hasOwnProperty('status') || this.data.status == 0 ){
			errorHandler(this.data.message);
			return;
		}//if

		if( !this.data.hasOwnProperty('items') || this.data.items.length == 0 ){
			alert("No data to display");
			return;
		}//if

		//draw shape
		var chartShape = $( "<div></div>");

		if( this.chart_type.val() == "pie" )
			this.chartDrawer.pie( chartShape, false, this.data );

		else if( this.chart_type.val() == "doghnut" )
			this.chartDrawer.doghnut( chartShape, this.data );

		else if( this.chart_type.val() == "bars" )
			this.chartDrawer.bars( chartShape, this.data, $("#metrics option:selected"), $("#dimensions option:selected") );

		else if( this.chart_type.val() == "lines" )
			this.chartDrawer.lines( chartShape, this.data, $("#metrics option:selected") );

		else if( this.chart_type.val() == "table" )
			this.chartDrawer.table( chartShape, this.data, $("#metrics option:selected").toArray(), $("#dimensions option:selected").toArray() );

		//if there is a current chart to update, else we create a new chart
		elw = $(".chart_current");
		if( elw.length > 0 ){
			elw.find('.widget_content').html('').append(chartShape);
			elw.removeClass('chart_current');
		}
		else{
			//make it a widget
			this.widgetize( chartShape );
		}


		//$(".chart_current").removeClass("chart_current");
	}//generateChart

	this.getChartData = function() {
		// account, property, view
		var account = $("#account").val(),
			property = $("#property").val(),
			view = $("#view").val();

		// date
		var daterange = $("[name='daterange']").val();

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
			daterange: daterange,
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

	this.widgetize = function( body ){
		var metrics = [];
		var data = this.getChartData();

		$("#metrics option:selected").each(function(i,el){
			metrics.push($(el).text());
		});

		var title = $("#dimensions option:selected").text() + " by " + metrics.join(' and ');

		this.widgetsViewer.addWidget( title, body, 0, data, this.loadData );
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


/*
	Class responsable of loading Metadata
*/
function Metaadata( filter, dimension ){
	//need to move metadata to here
}//Metadata
