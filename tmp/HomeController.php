<?php

session_start();

class HomeController extends BaseController {
	private $client;

	public function __construct( Google_Client $client ){
		$this->client = $client;
		$this->init();
	}

	private function init(){
		$url = Config::get('app.site_url');

		$this->client->setClientId( Config::get('analytics.client_id') );
		$this->client->setClientSecret( Config::get('analytics.client_secret') );
		$this->client->setDeveloperKey( Config::get('analytics.developer_key') );
		$this->client->setRedirectUri( $url . '/login');
		$this->client->setScopes( array('https://www.googleapis.com/auth/analytics') );
		//$this->client->setUseObjects(true);
	}

	public function test(){
		$this->authenticate();
		$analytics = new Google_AnalyticsService( $this->client );
		//82671392 - 87860855
		$data = $analytics->data_ga->get( 'ga:82671392', '2013-01-01', '2014-08-31', 'ga:Pageviews, ga:pageviewsPerSession', [ 'dimensions' => 'ga:country' ] );
		//$service = new Google_AnalyticsService($this->client);

		// echo "<pre>"; //44493085
		// var_dump($analytics->metadata_columns->listMetadataColumns('ga'));
		// echo "</pre>";die();

		// echo "<pre>";
		// var_dump( $analytics->management_segments->listManagementSegments() );
		// echo "</pre>";
		return $data;
	}

	public function home(){
		if( !$this->authenticate() ){
			$authUrl = $this->client->createAuthUrl();
			return "<a class='login' href='{$authUrl}'>Login</a>";
		}

		return View::make("hello");
	}//home

	public function compare(){
		return View::make("compare");
	}//compare

	public function authenticate(){
		if (isset($_SESSION['token'])) {
		  $this->client->setAccessToken($_SESSION['token']);
		  return true;
		}

		if ( !$this->client->getAccessToken() ) {//null
			return false;
		} else {
			return true;
		}//else

	}//authenticate

	public function login(){
		@session_start();
		if ( Input::has('code') ) {
			$code = Input::get('code');
		 	$this->client->authenticate($code);
		  	$_SESSION['token'] = $this->client->getAccessToken();
			$url = Config::get('app.site_url');
		  	header('Location: '.$url);exit();
		}
		else{
			$authUrl = $this->client->createAuthUrl();
			return "<a class='login' href='{$authUrl}'>Login</a>";
		}
		return $code;
	}//login

	public function metadata(){
		//google api has a method for that, but i can't find it $analytics->metadata_columns
		$curl = new Google_CurlIO;
		$response = $curl->makeRequest( 
			new Google_HttpRequest( "https://www.googleapis.com/analytics/v3/metadata/ga/columns" ) 
		);
		
		//verify returned data
		$data = json_decode($response);
		
		$items = $data->items;
		$data_items = [];
		$dimensions_data = [];
		$metrics_data = [];

		foreach( $items as $item ){
			if( $item->attributes->status == 'DEPRECATED' )
				continue;

			if( $item->attributes->type == 'DIMENSION' )
				$dimensions_data[ $item->attributes->group ][] = $item;

			if( $item->attributes->type == 'METRIC' )
				$metrics_data[ $item->attributes->group ][] = $item;
		}//foreach

		$data_items['dimensions'] = $dimensions_data;
		$data_items['metrics'] = $metrics_data;

		return $data_items;
	}//metadata

	public function report(){
		if( !Input::has('dimensions') || !Input::has('metrics') || !Input::has('date') || !Input::has('max_results') || !Input::has('view') )
			return Response::json([
				'status'	=> 0,
				'code'		=> 1,
				'message'	=> 'Invalid request parametter'
			]);

		if( !$this->authenticate() )
			Redirect::to('/login');


		$dimensions = Input::get('dimensions');
		$metrics = Input::get('metrics');
		$filters = Input::get( 'filters', [ 'dimensions' => [], 'metrics' => [] ] );
		$max_results = Input::get('max_results');
		$max_results = is_numeric($max_results) ? $max_results : 5;
		$view = 'ga:' . Input::get('view');

		//more test pls
		$daterange = explode( ' - ', Input::get('date') );
		$start_date = $daterange[0];
		$end_date = $daterange[1];

		//because we mostly use only one dimension
		if( !is_array( $dimensions ) )
			$dimensions = array( $dimensions );

		$count_dimensions = count($dimensions);
		$count_metrics = count($metrics);

		$dimensions = implode( ",", $dimensions );
		$metrics = implode( ",", $metrics );


		$tmp_filters = [];
		if( isset( $filters['dimensions'] ) && count($filters['dimensions']) > 0 ){
			$tmp_filters[] = $this->encodeFilters( $filters['dimensions'] );
		}

		if( isset( $filters['metrics'] ) && count($filters['metrics']) > 0 ){
			$tmp_filters[] = $this->encodeFilters( $filters['metrics'] );
		}

		//dimension and filters cannot be combined using the OR operator (,)
		$filter = implode(';', $tmp_filters);


		try{
			$analytics = new Google_AnalyticsService($this->client);
			$options = [];

			$options['dimensions'] = $dimensions;
			$options['max-results'] = $max_results;
			//test if null or str.length
			if( $filter && strlen($filter) > 0 )
				$options['filters'] = $filter;

			if( Input::has('orderby') )
					$options['sort'] = $this->encodeOrderby( Input::get('orderby') );

			//82671392 - 87860855
			$data = $analytics->data_ga->get( $view, $start_date, $end_date, $metrics,
				$options
			);

			$res = [
				'items'			=> isset($data['rows']) ? $data['rows'] : [],
				'totalResults'	 => $data['totalResults'],
				'dimensions'	   => $count_dimensions,
				'metrics'	  	=> $count_metrics,
				'filter'	   	=> $tmp_filters
			];

		}catch( Google_ServiceException $ex ){
			return Response::json([
				'status'	=> 0,
				'code'		=> 2,
				'message'	=> 'Google analytics internal server error: (Technical details) ' . $ex->getErrors()[0]['message']
			]);
		}//catch

		//verify if $data has some errors

		return $res;
	}//report

	public function accounts(){
		$this->authenticate();
		$service = new Google_AnalyticsService($this->client);
		$man_accounts = $service->management_accounts->listManagementAccounts();
		$accounts = [];

		foreach ($man_accounts['items'] as $account) {
			$accounts[] = [ 'id' => $account['id'], 'name' => $account['name'] ];
		}

		return json_encode($accounts);
	}//accounts

	public function properties( $account_id ){
		$this->authenticate();
		try {
			$service = new Google_AnalyticsService($this->client);
			$man_properties = $service->management_webproperties->listManagementWebproperties($account_id);
			$properties = [];

			foreach ($man_properties['items'] as $property) {
				$properties[] = [ 'id' => $property['id'], 'name' => $property['name'] ];
			}//foreach

			return json_encode($properties);
		} catch (Google_ServiceException $e) {
			return Response::json([
				'status'	=> 0,
				'code'		=> 3,
				'message'	=> $e->getMessage()
			]);
		}//catch

	}//properties

	public function views( $account_id, $property_id ){
		$this->authenticate();
		try {
			$service = new Google_AnalyticsService($this->client);
			$man_views = $service->management_profiles->listManagementProfiles( $account_id, $property_id );
			$views = [];

			foreach ($man_views['items'] as $view) {
				$views[] = [ 'id' => $view['id'], 'name' => $view['name'] ];
			}//foreach

			return json_encode($views);
		} catch (Google_ServiceException $e) {
			return Response::json([
				'status'	=> 0,
				'code'		=> 3,
				'message'	=> $e->getMessage()
			]);
		}//catch
	}//views

	private function encodeFilters( $filters ){
		$url = [];

		foreach ($filters as $filter) {
			$operator ="";
			if( $filter['rule'] == "contain" ){
				if( $filter['show'] == "show" )
					$operator = '=@';
				else
					$operator = '!@';
			}
			else if( $filter['rule'] == "exact" ){
				if( $filter['show'] == "show" )
					$operator = '==';
				else
				$operator = '!=';
			}
			else if( $filter['rule'] == "regexp" ){
				if( $filter['show'] == "show" )
					$operator = '=~';
				else
					$operator = '!~';
			}

			//metric rules
			if( $filter['rule'] == "eq" ){
				if( $filter['show'] == "show" )
					$operator = '==';
				else
					$operator = '!=';
			}
			else if( $filter['rule'] == "gt" ){
				if( $filter['show'] == "show" )
					$operator = '>';
				else
					$operator = '<';
			}
			else if( $filter['rule'] == "lt" ){
				if( $filter['show'] == "show" )
					$operator = '<';
				else
					$operator = '>';
			}
			else if( $filter['rule'] == "gteq" ){
				if( $filter['show'] == "show" )
					$operator = '>=';
				else
					$operator = '<=';
			}
			else if( $filter['rule'] == "lteq" ){
				if( $filter['show'] == "show" )
					$operator = '<=';
				else
					$operator = '>=';
			}


			$url[] = "{$filter['column']}{$operator}{$filter['val']}";
		}//foreach


		$uri = implode( ";", $url );
		//$uri = urlencode($uri);

		return $uri;
	}//encodeFilters

	private function encodeOrderby( $orderbys ){
		$res = [];

		foreach( $orderbys as $orderby ){
			$res[] = $orderby['order'] . $orderby['column'];
		}//foreach

		return implode( ',', $res );
	}//encodeOrderby

	public function chart_type(){
		$type = Input::get('type', 'HighChartJS');
		Session::put('type', $type);

		return Redirect::to("/");
	}//chart_type

}//class
