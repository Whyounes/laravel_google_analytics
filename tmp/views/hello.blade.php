<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Analytics</title>
	<style>

	</style>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
	<script src="//code.jquery.com/ui/1.11.0/jquery-ui.js"></script>
	<script type="text/javascript" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>
	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.7.0/moment.min.js"></script>
	<script type="text/javascript" src="js/daterangepicker.js"></script>


	<script src="js/highcharts.js"></script>

	<script src="js/components/ChartDrawer.js"></script>
	<script src="js/components/ChartFilter.js"></script>
	<script src="js/components/OrderbyFilter.js"></script>
	<script src="js/components/WidgetsViewer.js"></script>
	<script src="js/main_highchart.js"></script>

	<script type="text/javascript" src="js/global.js"></script>
	<script type="text/javascript" src="js/home.js"></script>

	<link rel="stylesheet" type="text/css" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
	<link rel="stylesheet" type="text/css" href="css/daterangepicker-bs3.css">
	<link rel="stylesheet" type="text/css" href="css/main.css">
	<link rel="stylesheet" href="//code.jquery.com/ui/1.11.0/themes/smoothness/jquery-ui.css">

</head>
<body>
	<h2>Analytics charts</h2>
	<div class="container-full container well">
		<div class="row">
			<div class="col-md-4 container">

				<div class="row" style="display:none">
					<form action="/chart_type" method="get">
						<div class="col-md-6">
							<input type="submit" class="form-control" value="ChartJS" name="type" @if( Session::get('type', 'HighChartJS') == 'ChartJS' ) style="background-color:#f67c72;" @endif />
						</div>
						<div class="col-md-6">
							<input type="submit" class="form-control" value="HighChartJS" name="type"  @if( Session::get('type', 'HighChartJS') == 'HighChartJS' ) style="background-color:#f67c72;" @endif />
						</div>
					</form>
				</div> <!-- .row -->

				<div class="row">
					<div class="col-md-12">
						<h4>Account</h4>
						<select class="form-control" id="account">
							<option value='0'>Loading accounts...</option>
						</select>
					</div>
				</div>
				<div class="row">
					<div class="col-md-12">
						<h4>Property</h4>
						<select class="form-control" id="property">
							<option value='0'>Select an account</option>
						</select>
					</div>
				</div>
				<div class="row">
					<div class="col-md-12">
						<h4>View</h4>
						<select class="form-control" id="view">
							<option value="0">Select a view</option>
						</select>
					</div>
				</div>

				<div class="row">
					<div class="daterange col-md-6">
						<input name="daterange" class="form-control" value="2013-01-01 - 2014-12-30">
					</div>
					<div class="col-md-6">
						<input type="button" class="form-control btn btn-primary" id="generate_chart" value="Draw" />
						<span class="spinner"></span>
					</div>
				</div> <!-- .row -->



			</div> <!-- .col-md-5 -->

			<div class="col-md-4 container">

				<div class="row">
					<div class="col-md-6">
						<h4>Dimensions</h4>
						<div class="dimensions">
							<div class="loading"></div>
						</div>
					</div>
					<div class="col-md-6">
						<h4>Metrics</h4>
						<div class="metrics">
							<div class="loading"></div>
						</div>
					</div>

				</div> <!-- .row -->

				<div class="row">
					<div class="col-md-6">
						<h4>Chart type</h4>
						<div class="chart_type">
							<select class="form-control">
								<option value="pie">Pie</option>
								<option value="doghnut">Doghnut</option>
								<option value="bars">Bars</option>
								<option value="lines">Lines</option>
								<option value="table">Table</option>
							</select>
						</div> <!-- .chart_type -->
					</div>

					<div class="col-md-6">
						<h4>Max results</h4>
						<input id="max_results" type="text" class="form-control" value="5">
					</div>
				</div>	<!-- .row -->

				<div class="row">
					<div class="col-md-6">

					</div>
				</div> <!-- .row -->

			</div> <!-- .col-md-5 -->

			<div class="col-md-4 container">
				<div class="row">
					<h4>Dimensions Filter</h4>
					<div class="dimension_filters">
						<!-- .filter -->
						<input class="form-control" type="button" value="Add filter" id="add_dimension_filter" style="margin-top: 10px;" />
					</div> <!-- .filters -->

				</div> <!-- .row -->

				<div class="row">

					<h4>Metrics Filter</h4>
					<div class="metric_filters">
						<!-- .filter -->
						<input class="form-control" type="button" value="Add filter" id="add_metric_filter" style="margin-top: 10px;" />
					</div> <!-- .filters -->

				</div> <!-- .row -->

				<div class="row">

					<h4>Order By</h4>
					<div class="orderbys">
						<input class="form-control" type="button" value="Add Order" id="add_orderby" style="margin-top: 10px;" />
					</div> <!-- .filters -->

				</div> <!-- .row -->
			</div>
		</div> <!-- .row -->

		<!-- row of widgets -->
		<div class="row well widgets">

		</div> <!-- .row widget -->

	</div> <!-- .container -->

</body>
</html>
