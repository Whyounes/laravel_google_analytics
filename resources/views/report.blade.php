  <!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>Google Analytics</title>
		<!-- Latest compiled and minified CSS -->
		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap-theme.min.css">
		<script src="//code.jquery.com/jquery-2.1.1.min.js"></script>
	</head>
	<body>
		<div class="container">
			<br/>

	  		<div class="row">
	  			<h3>total results: {{ $totalResults }}</h3>
	  			@if( $chart_type == 'pie' )
	  			    <div class="pie">
	  			        <div id="pie_canvas"></div>
	  			    </div>
                    <script src="http://code.highcharts.com/highcharts.js"></script>
	  			    <script>
	  			        $(function(){
	  			            var el = $("#pie_canvas"),
	  			                serie_data = {{ $report_json }};

                            el.highcharts({
                                chart: {
                                    plotBackgroundColor: null,
                                    plotBorderWidth: 1,
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
                                series: [{
                                            type: 'pie',
                                            name: '',
                                            data: serie_data
                                        }]
                            });//highchart

	  			        });
	  			    </script>
	  			@else
	  			    <table class="table">
                        <tr>
                            @foreach ($columns as $column)
                                <th> {{ $column['name'] }} </th>
                            @endforeach
                        </tr>
                        @foreach ($items as $item)
                            <tr>
                            @foreach ($item as $it)
                                <td> {{ $it }} </td>
                            @endforeach
                            </tr>
                        @endforeach
                    </table>
	  			@endif

			</div><!-- /.row -->

		</div>
	</body>
</html>