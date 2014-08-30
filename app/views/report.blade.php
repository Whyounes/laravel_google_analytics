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
			</div><!-- /.row -->
		</div>
	</body>
</html>