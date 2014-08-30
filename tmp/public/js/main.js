/*
*	end general functions
*/

function Charting(){
	this.canvas = undefined;
	this.ctx = undefined;
	this.chart_type = $(".chart_type:eq(0) > select");
	this.chartjs = undefined;
	this.data = undefined;
	this.daterange = $('[name="daterange"]');
	this.max_results = $('#max_results');
	this.dimension_filters_div = $(".dimension_filters");
	this.metric_filters_div = $(".metric_filters");

	this.filter_dimension = $('<div class="filter row">' +
						'<div class="col-md-2">' +
							'<select class="show form-control">' +
								'<option value="show">Only show</option>' +
								'<option value="dshow">Don\'t show</option>' +
							'</select>' +
						'</div>' +
						'<div class="col-md-3">' +
							'<select class="dimension form-control">' +
							'</select>' +
						'</div>' +
						'<div class="col-md-3">' +
							'<select class="rule form-control">' +
								'<option value="contain">Containing</option>' +
								'<option value="exact">Exactly</option>' +
								'<option value="regexp">Regular Expression</option>' +
							'</select>' +
						'</div>' +
						'<div class="col-md-3">' +
							'<input type="text" class="form-control val" />' +
						'</div>' +
						'<div class="col-md-1 del">' +
							'<span class="glyphicon glyphicon-remove remove_filter"></span>' +
						'</div>' +
					'</div>');

	this.filter_metric = $('<div class="filter row">' +
					'<div class="col-md-2">' +
						'<select class="show form-control">' +
							'<option value="show">Only show</option>' +
							'<option value="dshow">Don\'t show</option>' +
						'</select>' +
					'</div>' +
					'<div class="col-md-3">' +
						'<select class="metric form-control">' +
						'</select>' +
					'</div>' +
					'<div class="col-md-3">' +
						'<select class="rule form-control">' +
							'<option value="eq">Equal</option>' +
							'<option value="gt">Greater than</option>' +
							'<option value="lt">Less than</option>' +
							'<option value="gteq">Greater than or equal</option>' +
							'<option value="lteq">Less than or equal</option>' +
						'</select>' +
					'</div>' +
					'<div class="col-md-3">' +
						'<input type="text" class="form-control val" />' +
					'</div>' +
					'<div class="col-md-1 del">' +
						'<span class="glyphicon glyphicon-remove remove_filter"></span>' +
					'</div>' +
				'</div>');

	this.dimension_filter_div = this.filter_dimension.clone();
	this.metric_filter_div = this.filter_metric.clone();

	this.add_filter_btn = undefined;

	//metadata div's
	this.$dimensions = $(".dimensions:eq(0)");
	this.$metrics = $(".metrics:eq(0)");

	this.init = function(){
		$("#add_dimension_filter").bind("click", { "this": this }, function( e ){
			e.data.this.addFilterDimension();
		});

		$("#add_metric_filter").bind("click", { "this": this }, function( e ){
			e.data.this.addFilterMetric();
		});

		$(document).on('click', ".remove_filter", this.removeFilter);

		this.getMetadata();
	}//init

	this.generateChart = function(){
		this.clearCanvas();

		var dimensions = $("#dimensions").val(),
			metrics = $("#metrics").val(),
			view = $("#view").val();

		$('.legend_div').html('');
		$(".graph").append(this.canvas);

		if( !view || view.length == 0 ){
			alert("You need to enter to specify a view ID");
			return;
		}

		if( !dimensions || !metrics ){
			alert("You have to choose at least one metric and one dimension");
			return;
		}

		if( this.chart_type.val() == "pie" || this.chart_type.val() == "doghnut" ){
			if( dimensions.length != 1 || metrics.length != 1 ){
				alert("Pie chart accept only one metric and one dimension");
				return;
			}
		}//if
		else if( this.chart_type.val() == "bars" ){

		}
		else if( this.chart_type.val() == "lines" ){
			//verify: one dimension and multiple metrics
			if( dimensions.length != 1 || metrics.length == 0 ){
				alert("Lines chart accept only one dimension and at least one metric");
				return;
			}
		}//else

		filters = this.getFilters();
		//change all the parametters to an object pls
		this.data = getReport( dimensions, metrics, filters, this.daterange.val(), this.max_results.val(), view );

		if( this.data.hasOwnProperty('status') || this.data.status == 0 ){
			errorHandler(this.data.message);
			return;
		}//if

		if( !this.data.hasOwnProperty('items') || this.data.items.length == 0 ){
			alert("No data to display");
			return;
		}//if

		if( !this.data ){
			alert("Something wrong happened while getting the data, try again");
			return;
		}//if

		if( this.chart_type.val() == "pie" )
			this.pie();
		else if( this.chart_type.val() == "doghnut" )
			this.doghnut();
		else if( this.chart_type.val() == "bars" )
			this.bars();
		else if( this.chart_type.val() == "lines" )
			this.lines();
		else if( this.chart_type.val() == "table" )
			this.table();
		else
			alert("you did something wrong");
	}//generateChart

	this.clearCanvas = function(){
		$("#chart_canvas").remove();
		this.canvas = $('<canvas id="chart_canvas" width="600" height="300"></canvas>')[0];
		this.ctx = this.canvas.getContext("2d");
		this.chartjs = new Chart(this.ctx);
	}//clearCanvas

	this.pie = function( doghnut ){
		var colors = [],
			chart_data = [],
			chart_dimesions = [],
			chart_metrics = [];

		chart_dimesions = this.data.items.slice( this.data.dimensions, this.data.items.length );

		for( var i = 0; i < this.data.items.length; i++ ){
			tmp_color = randomColor( colors );
			colors.push(tmp_color);

			chart_data.push( {
				value: parseInt( this.data.items[i][1] ),
				color: tmp_color,
				highlight: tmp_color.substr(1, tmp_color.length),
				label: this.data.items[i][0]
			} );
		}//for

		var options = {
			segmentStrokeWidth : 0,
			tooltipTemplate: "<%if(label){%><%=label%>: <%}%><%=value%>",
			legendTemplate : "<ul class=\"legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%> (<%=segments[i].value%>)</li><%}%></ul>"
		};

		if( !doghnut ){
			var pie = this.chartjs.Pie( chart_data, options );
			addLegend( pie );
		}
		else{
			var doughnut = this.chartjs.Doughnut( chart_data, options );
			addLegend( doughnut );
		}
	}//pie

	this.doghnut = function(){
		this.pie( true );
	}//doghnut

	this.bars = function( line ){
		var	colors = [],
			chart_data_values = [],
			chart_data_labels = [],
			chart_dataset = [],
			legend = [],
			metrics = $("#metrics option:selected");

		for( var i = 0; i < this.data.items.length; i++ ){
			chart_data_labels.push( this.data.items[i][0] );

			for( var j = 1; j < this.data.items[i].length; j++ ){
				if( Object.prototype.toString.call( chart_data_values[j-1] ) !== '[object Array]' )
					chart_data_values[j-1] = [];

				chart_data_values[j-1].push( this.data.items[ i ][ j ] );
			}//for
		}//for

		for( var i = 0; i < chart_data_values.length; i++ ){
			tmp_color = randomColor( colors );
			colors.push(tmp_color);
			tmp_hex = hexToRgb( tmp_color );

			// tmp_color
			chart_dataset.push({
				label: $(metrics[i]).text(),
				fillColor : tmp_hex,
				strokeColor : tmp_hex,
				data : chart_data_values[i]
			});
		}//for

		chart_data = {
			legendTemplate : "<ul class=\"legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%> (<%=segments[i].value%>)</li><%}%></ul>",
			labels: chart_data_labels,
			datasets : chart_dataset
		}//chart_data

		var options = {
		};

		if ( !line )
			var chart = this.chartjs.Bar( chart_data, options );
		else
			var chart = this.chartjs.Line( chart_data, options );

		addLegend( chart );
	}//bars

	this.lines = function(){
		this.bars( true );
		//addLegend( bars );
	}//Lines

	this.table = function(){
		var metrics = $("#metrics option:selected"),
			chart_data_values = [],
			chart_data_labels = [],
			chart_dataset = [],
			metrics = $("#metrics option:selected").toArray(),
			dimension = $("#dimensions option:selected").toArray(),
			table_headers = dimension.concat( metrics ) ,
			table = "";


		//metrics.unshift( dimension );

		table = "<table class='table table-hover table-bordered'>";
		table += "<tr>";
		for( var i = 0; i < table_headers.length; i++ ){
			table += "<th>" + $(table_headers[i]).text() + "</th>";
		}//for
		table += "</tr>";

		for( var i = 0; i < this.data.items.length; i++ ){
			table += "<tr>";
			for( var j = 0; j < this.data.items[i].length; j++ ){
				table += "<td>" + this.data.items[i][j] + "</td>";
			}//for
			table += "</tr>";
		}//for
		table += "</table>";

		$(".graph").html( table );
	}//table

	this.addLegendMetrics = function( data ){
		var list = "<ul class='legend'>";

		for( var i = 0; i < data.length; i++ ){
			list += "<li><span style='background-color:" + data[i].color + "'></span> " + data[i].label + "</li>";
		}//for

		list += "</ul>";

		$(".legend_div").html( list );
	}//addLegendMetrics

	this.addFilterDimension = function(){
		var filter = this.dimension_filter_div.clone();
		filter.insertBefore("#add_dimension_filter");
	}//addFilterDimension

	this.addFilterMetric = function(){
		var filter = this.metric_filter_div.clone();
		filter.insertBefore("#add_metric_filter");
	}//addFilterDimension

	this.removeFilter = function(){
		$(this).parents('.filter').remove();
	}//removeFilter

	this.getFilters = function(){
		var filters_dimesions = [];
		var filters_metrics = [];

		this.dimension_filters_div.find(".filter").each(function(i, el){
			el = $(el);

			filters_dimesions.push({
				show : el.find(".show").val(),
				dimension : el.find(".dimension").val(),
				rule : el.find(".rule").val(),
				val : el.find(".val").val()
			});
		});

		this.metric_filters_div.find(".filter").each(function(i, el){
			el = $(el);

			filters_metrics.push({
				show : el.find(".show").val(),
				metric : el.find(".metric").val(),
				rule : el.find(".rule").val(),
				val : el.find(".val").val()
			});
		});

		return { 'dimensions': filters_dimesions, 'metrics': filters_metrics };
	}//getFilters

	//metadata part
	this.getMetadata = function(){
		var $this = this;
		$.ajax({
			url: "ga/metadata",
			type: "GET",
			dataType: "json",
			success: function( data ){
				if( data.hasOwnProperty('items') ){
					$this.setMetadata( data.items );
					$this.dimension_filter_div = $this.filter_dimension.clone();
					$this.metric_filter_div = $this.filter_metric.clone();
				}
				else
					errorHandler('AJAX response error "hasOwnProperty"');
			},
			error: function( ex, xhr, message ){
				errorHandler(message);
			}
		});
	}//getMetadata

	this.setMetadata = function( items ){
		var dimensionsHtml = "", metricsHtml = "", tmp;
		items = this.prepareMetadata( items );

		for( var k in items ){
			tmp = items[k];
			if( tmp.status == "DEPRECATED" ){
				delete items[k];
				continue;

				// if( tmp.attributes.hasOwnProperty('replacedBy') ){
				// 	if( items.hasOwnProperty( items[k.attributes.replacedBy] ) )
				// 		items[k] = items
				// }//if
			}//if

			if( tmp.type == "DIMENSION" )
				dimensionsHtml += "<option value='"+ k +"'>"+ tmp.uiName +"</option>";
			else if( tmp.type == "METRIC" )
				metricsHtml += "<option value='"+ k +"'>"+ tmp.uiName +"</option>";
		}//for

		this.filter_dimension.find(".dimension").html( dimensionsHtml );
		this.filter_metric.find(".metric").html( metricsHtml );

		metricsHtml = "<select multiple id='metrics' class='form-control'>" + metricsHtml + "</select>";
		dimensionsHtml = "<select multiple id='dimensions' class='form-control'>" + dimensionsHtml + "</select>";

		$(".dimensions").html( dimensionsHtml );
		$(".metrics").html( metricsHtml );
	}//setMetadata

	this.prepareMetadata = function( items ){
		var ret = {};

		for (var i = items.length - 1; i >= 0; i--) {
			tmp = items[i];
			ret[ tmp.id ] = tmp.attributes;
		}

		return ret;
	}//prepareMetadata

}//Charting
