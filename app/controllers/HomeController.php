<?php

class HomeController extends BaseController {
	private $ga;

	public function __construct( GA_Service $ga ){
		$this->ga = $ga;
	}

	public function index(){
		if( $this->ga->isLoggedIn() ){
			$metadata = $this->metadata();
			$dimensions = $metadata['dimensions'];
			$metrics = $metadata['metrics'];
			
			return View::make('home', [ 'dimensions' => $dimensions, 'metrics' => $metrics ]);
		}//if
		else{
			$url = $this->ga->getLoginUrl();
			return View::make('login', [ 'url' => $url ]);
		}
	}//index

	public function login(){
		if( Input::has('code') ){
			$code = Input::get('code');

			$this->ga->login($code);

			return "Go to the home <a href='/'>page</a>";
		}
		else{
			return "Invalide request parameters";
		}//else
	}//login

	public function accounts(){
		$accounts = $this->ga->accounts();

		return $accounts;
	}//accounts

	public function properties( $account_id ){
		$properties = $this->ga->properties( $account_id );

		return $properties;
	}//properties

	public function views( $account_id, $property_id ){
		$views = $this->ga->views( $account_id ,$property_id );

		return $views;
	}//properties

	public function metadata(){
		$metadata = $this->ga->metadata();

		return $metadata;
	}//metadata

	public function report(){
		if( !$this->ga->isLoggedIn() )
			return Response::json([
				'status'	=> 0,
				'code'		=> 1,
				'message'	=> 'Login required'
			]);

		if( !Input::has('dimensions') || !Input::has('metrics') || !Input::has('view') )
			return Response::json([
				'status'	=> 0,
				'code'		=> 1,
				'message'	=> 'Invalid request parametter'
			]);

		$view = 'ga:' . Input::get('view');
		$dimensions = Input::get('dimensions');
		$metrics = Input::get('metrics');

		$report = $this->ga->report( $view, $dimensions, $metrics );

		return View::make('report', [ 'columns' => $report['columnHeaders'], 'items' => $report['items'], 'totalResults' => $report['totalResults' ] ]);
	}//metadata

}//class