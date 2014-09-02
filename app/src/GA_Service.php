<?php
// i have a permission problem :/
session_save_path("/tmp");


session_start();

class GA_Service{
 	private $client;

	public function __construct( Google_Client $client ){
		$this->client = $client;
		$this->init();
	}

	private function init(){
		$this->client->setClientId( Config::get('analytics.client_id') );
		$this->client->setClientSecret( Config::get('analytics.client_secret') );
		$this->client->setDeveloperKey( Config::get('analytics.api_key') );
		$this->client->setRedirectUri( 'http://localhost:8000/login');
		$this->client->setScopes( array('https://www.googleapis.com/auth/analytics') );
		//$this->client->setUseObjects(true);
	}

	public function isLoggedIn(){
		
		if (isset($_SESSION['token'])) {
		  $this->client->setAccessToken($_SESSION['token']);
		}

		if ( !$this->client->getAccessToken() ) {//null
			return false;
		} else {
			return true;
		}//else

	}//authenticate

	public function login( $code ){
		
	 	$this->client->authenticate($code);
	 	$token = $this->client->getAccessToken();
	  	$_SESSION['token'] = $token;

		return $token;
	}//login

	public function getLoginUrl(){
		$authUrl = $this->client->createAuthUrl();
		return $authUrl;
	}//getLoginUrl

	public function segments(){
		if( !$this->isLoggedIn() ){
			//login
		}

		$service = new Google_AnalyticsService($this->client);
		$segments = $service->management_segments->listManagementSegments();

		return $segments;
	}//segments

	public function accounts(){
		if( !$this->isLoggedIn() ){
			//login
		}

		$service = new Google_AnalyticsService($this->client);

		$man_accounts = $service->management_accounts->listManagementAccounts();
		$accounts = [];

		foreach ($man_accounts['items'] as $account) {
			$accounts[] = [ 'id' => $account['id'], 'name' => $account['name'] ];
		}

		return $accounts;
	}//accounts

	public function properties( $account_id ){
		if( !$this->isLoggedIn() ){
			//login
		}

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
		if( !$this->isLoggedIn() ){
			//login
		}
		
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

	public function metadata(){
		$gcurl = new Google_CurlIO;
		$response = $gcurl->makeRequest( 
			new Google_HttpRequest( "https://www.googleapis.com/analytics/v3/metadata/ga/columns" ) 
		);

		//verify returned data
		$data = json_decode($response->getResponseBody());
		
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

	public function report( $view, $dimensions, $metrics ){
		// to make the request quicker
		$max_results = 10;
		
		// query the last month analytics
		$now = new DateTime();
		$end_date = $now->format('Y-m-d');
		$start_date = $now->modify('-1 month')->format('Y-m-d');

		// if( !is_array( $dimensions ) )
		// 	$dimensions = array( $dimensions );

		$dimensions = implode( ",", $dimensions );
		$metrics = implode( ",", $metrics );

		try{
			$analytics = new Google_AnalyticsService($this->client);
			$options = [];

			$options['dimensions'] = $dimensions;
			$options['max-results'] = $max_results;

			$data = $analytics->data_ga->get( $view, $start_date, $end_date, $metrics,
				$options
			);

			$res = [
				'items'			=> isset($data['rows']) ? $data['rows'] : [],
				'columnHeaders'	=> $data['columnHeaders'],
				'totalResults'	=> $data['totalResults']
			];

		}catch( Google_ServiceException $ex ){
			return Response::json([
				'status'	=> 0,
				'code'		=> 2,
				'message'	=> 'Google analytics internal server error: (Technical details) ' . $ex->getErrors()[0]['message']
			]);
		}//catch

		return $res;
	}//report
}//class
