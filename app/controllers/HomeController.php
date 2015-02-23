<?php

use Illuminate\Support\Facades\Input;

class HomeController extends BaseController
{
  private $ga;

  public function __construct(GA_Service $ga)
  {
    $this->ga = $ga;
  }

  public function index()
  {
    if ($this->ga->isLoggedIn()) {
      $metadata = $this->metadata();
      $dimensions = $metadata['dimensions'];
      $metrics = $metadata['metrics'];

      return View::make('home', [
          'dimensions' => $dimensions,
          'metrics'    => $metrics
      ]);
    }//if
    else {
      $url = $this->ga->getLoginUrl();

      return View::make('login', ['url' => $url]);
    }
  }//index

  public function login()
  {
    if (Input::has('code')) {
      $code = Input::get('code');

      $this->ga->login($code);

      return "Go to the home <a href='/'>page</a>";
    } else {
      return "Invalide request parameters";
    }//else
  }//login

  public function segments()
  {
    $segments = $this->ga->segments();

    return $segments;
  }//segments

  public function accounts()
  {
    $accounts = $this->ga->accounts();

    return $accounts;
  }//accounts

  public function properties($account_id)
  {
    $properties = $this->ga->properties($account_id);

    return $properties;
  }//properties

  public function views($account_id, $property_id)
  {
    $views = $this->ga->views($account_id, $property_id);

    return $views;
  }//views

  public function metadata()
  {
    $metadata = $this->ga->metadata();

    return $metadata;
  }//metadata

  public function report()
  {
    if (!$this->ga->isLoggedIn()) {
      return Response::json([
                                'status'  => 0,
                                'code'    => 1,
                                'message' => 'Login required'
                            ]);
    }

    if (!Input::has('dimensions') || !Input::has('metrics') || !Input::has('view')) {
      return Response::json([
                                'status'  => 0,
                                'code'    => 1,
                                'message' => 'Invalid request parametter'
                            ]);
    }

    $view = 'ga:' . Input::get('view');
    $dimensions = Input::get('dimensions');
    $metrics = Input::get('metrics');

    $daterange = explode(' - ', Input::get('daterange'));
    $start_date = $daterange[0];
    $end_date = $daterange[1];

    $max_results = intval(Input::get('max_results'));


    $filters = [];
    $group_filters = [];
    $group_filters['dimensions'] = GA_Utils::groupFilters(
        Input::get('dimension_filter_show'),
        Input::get('dimension_filters'),
        Input::get('dimension_filter_rules'),
        Input::get('dimension_filter_values')
    );
    $tmp = GA_Utils::encodeDimensionFilters($group_filters['dimensions']);

    if (!empty($tmp)) {
      $filters[] = $tmp;
    }


    $group_filters['metrics'] = GA_Utils::groupFilters(
        Input::get('metric_filter_show'),
        Input::get('metric_filters'),
        Input::get('metric_filter_rules'),
        Input::get('metric_filter_values')
    );

    $tmp = GA_Utils::encodeMetricFilters($group_filters['metrics']);

    if (!empty($tmp)) {
      $filters[] = $tmp;
    }

    //dimension and filters cannot be combined using the OR operator (,)
    $filters = implode(';', $filters);
    $orderbys = null;

    if (Input::has('orderbys')) {
      $orderbys = GA_Utils::encodeOrderby(GA_Utils::groupOrderby(Input::get('orderbys'), Input::get('orderby_rules')));
    }


    $report = $this->ga->report($view, $start_date, $end_date, $max_results, $dimensions, $metrics, $filters,
                                $orderbys);

    $json_data = [];
    foreach ($report['items'] as $item) {
      $json_data[] = [
          'name' => $item[0],
          'y'    => (int)$item[1]
      ];
    }//foreach

    return View::make('report', [
        'columns'      => $report['columnHeaders'],
        'items'        => $report['items'],
        'totalResults' => $report['totalResults'],
        'report_json'  => json_encode($json_data),
        'chart_type'   => Input::get('chart_type')
    ]);
  }//report

}//class