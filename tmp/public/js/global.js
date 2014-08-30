/*
*	Generalfunctions
*/

function errorHandler( message ){
	alert(message);
}

function randomColor( colors ){
	if ( !colors )
		return '#'+('00000'+(Math.random()*16777216<<0).toString(16)).substr(-6);

	colors = colors || [];
	color = "";
	do{
		color = '#'+('00000'+(Math.random()*16777216<<0).toString(16)).substr(-6);
	} while( colors.indexOf( color ) != -1 );

	return color;
}//randomColor

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    // return result ? {
    //     r: parseInt(result[1], 16),
    //     g: parseInt(result[2], 16),
    //     b: parseInt(result[3], 16)
    // } : null;
    return "rgba(" + parseInt(result[1], 16) + ", " + parseInt(result[2], 16) + ", " + parseInt(result[3], 16) + ", 0.2)";
}//hexToRgb

function addLegend( chart_elem ){
	var helpers = Chart.helpers;

	var legendHolder = document.createElement('div');
	legendHolder.innerHTML = chart_elem.generateLegend();
	// Include a html legend template after the module doughnut itself
	helpers.each(legendHolder.firstChild.childNodes, function(legendNode, index){
		helpers.addEvent(legendNode, 'mouseover', function(){
			var activeSegment = chart_elem.segments[index];
			activeSegment.save();
			activeSegment.fillColor = activeSegment.highlightColor;
			chart_elem.showTooltip([activeSegment]);
			activeSegment.restore();
		});
	});
	helpers.addEvent(legendHolder.firstChild, 'mouseout', function(){
		chart_elem.draw();
	});
	$(".legend_div").html( legendHolder.innerHTML );
}//addLegend

function getReport( dimensions, metrics, filters, orderby, daterange, max_results, view ){
	$.ajax({
		url : "ga/report",
		type: "POST",
		data: {
			metrics: metrics,
			dimensions: dimensions,
			filters: filters,
			date: daterange,
			max_results: max_results,
			orderby: orderby,
			view: view
		},
		dataType: "json",
		async: false,
		success: function( data ){
			ret = data;
		},
		error: function( ){
			console.log("Error AJAX");
		}
	});

	return ret;
}//getReport

function escapeRegExp(string){
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

/*
	value: the value to be selected by default
	done_calback: callback when the request is done
*/
function loadAccounts( value, done_callback ){
	var account = $("#account");
	account.html("<option value='0'>Loading accounts</option>");

	$.ajax({
		url: 'ga/accounts',
		type: 'GET',
		data: {},
		dataType: 'json',
		success: function( data ){
			var options = "";

			for( var i=0; i < data.length; i++ ){
				options += "<option value='" + data[i].id + "'>" + data[i].name + "</option>";
			}//for

			account.html( options );

			if( value )
				account.val( value );
			if( !done_callback )
				account.change();
		},
		error: function(){
			alert("Error while getting the list of accounts");
		}
	}).done( done_callback );
}//loadAccount

/*
	account_id:
	value: the value to be selected by default
	done_calback: callback when the request is done
*/
function loadProperties( account_id, value, done_callback ){
	var property = $("#property");
	property.html("<option value='0'>Loading properties</option>");

	$.ajax({
		url: 'ga/properties/' + account_id,
		type: 'GET',
		data: {},
		dataType: 'json',
		success: function( data ){
			var options = "";

			for( var i=0; i < data.length; i++ ){
				options += "<option value='" + data[i].id + "'>" + data[i].name + "</option>";
			}//for

			property.html( options );
			if( value )
				property.val( value );

			if( !done_callback )
				property.change();
		},
		error: function(){
			alert("Error while getting the list of accounts");
		}
	}).done( done_callback );
}//loadProperty

/*
	account_id:
	property_id:
	value: the value to be selected by default
	done_calback: callback when the request is done
*/
function loadViews( account_id, property_id, value, done_callback ){
	var view = $("#view");
	view.html("<option value='0'>Loading views</option>");

	$.ajax({
		url: 'ga/views/' + account_id + '/' + property_id,
		type: 'GET',
		data: {},
		dataType: 'json',
		success: function( data ){
			var options = "";

			for( var i=0; i < data.length; i++ ){
				options += "<option value='" + data[i].id + "'>" + data[i].name + "</option>";
			}//for

			view.html( options );

			if( value )
				view.val( value );
		},
		error: function(){
			alert("Error while getting the list of accounts");
		}
}).done( done_callback );
}//loadViews

function formatFloat( num, precision ){
	if (!isNaN(num) && num.toString().indexOf('.') != -1)
		return parseFloat( num ).toFixed(precision);
	else
		return num;
}//formatFloat

/*
*	end general functions
*/

$(function(){

	$('input[name="daterange"], input[name="daterange1"], input[name="daterange2"]').daterangepicker({
	    format: 'YYYY-MM-DD',
	    startDate: '2013-01-01',
		endDate: '2013-12-31',
		showDropdowns: true
	});

	loadAccounts();

	$("#account").change(function(){
		$this = $(this);
		if( !$this.val() || $this.val() == 0 ){
			alert("No account loaded");
			return;
		}//if

		loadProperties( $this.val() );
	});

	$("#property").change(function(){
		$this = $(this);
		if( !$this.val() || $this.val() == 0 ){
			alert("No property loaded");
			return;
		}//if

		loadViews( $("#account").val(), $this.val() );
	});

});

/* TODO

	Modify the multiple select to show options depending on the chart type
	add filters for metrics too
	Bar chart can only accept two dimensions
	add max result option
*/
