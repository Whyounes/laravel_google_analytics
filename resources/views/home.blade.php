  <!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Google Analytics</title>
  <!-- Latest compiled and minified CSS -->
  <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
  <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap-theme.min.css">
  <link rel="stylesheet" href="css/daterangepicker-bs2.css"/>

  <script type="text/javascript" src="http://code.jquery.com/jquery-2.1.1.min.js"></script>
  <script type="text/javascript" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>
  <script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.0/moment.min.js"></script>
  <script type="text/javascript" src="js/daterangepicker.js"></script>


  <style>
    select[multiple] {
      height: 130px;
    }

    ul{
        list-style: none;
    }

    .chart_filter li{
        margin-top: 10px;
    }

    .metric_filters .chart_filter>li:first-child .del, .dimension_filters .chart_filter>li:first-child .del{
        display: none;
    }

    .nopadding {
       padding: 0 2px 0 0 !important;
       margin: 0 !important;
    }
  </style>
  <script type="text/javascript">
    function loadAccounts( ){
      var account = $("#account");
      account.html("<option value='0'>Loading accounts</option>");

      $.ajax({
        url: '/accounts',
        type: 'GET',
        data: {},
        dataType: 'json',
        success: function( data ){
          var options = "";

          for( var i=0; i < data.length; i++ ){
            options += "<option value='" + data[i].id + "'>" + data[i].name + "</option>";
          }//for

          account.html( options );
          account.change();
        },
        error: function(){
          alert("Error while getting the list of accounts");
        }
      });
    }//loadAccount

    function loadProperties( account_id ){
      var property = $("#property");
      property.html("<option value='0'>Loading properties</option>");

      $.ajax({
        url: '/properties/' + account_id,
        type: 'GET',
        data: {},
        dataType: 'json',
        success: function( data ){
          var options = "";

          for( var i=0; i < data.length; i++ ){
            options += "<option value='" + data[i].id + "'>" + data[i].name + "</option>";
          }//for

          property.html( options );
          property.change();
        },
        error: function(){
          alert("Error while getting the list of accounts");
        }
      });
    }//loadProperty

    function loadViews( account_id, property_id ){
      var view = $("#view");
      view.html("<option value='0'>Loading views</option>");

      $.ajax({
        url: '/views/' + account_id + '/' + property_id,
        type: 'GET',
        data: {},
        dataType: 'json',
        success: function( data ){
          var options = "";

          for( var i=0; i < data.length; i++ ){
            options += "<option value='" + data[i].id + "'>" + data[i].name + "</option>";
          }//for

          view.html( options );
        },
        error: function(){
          alert("Error while getting the list of accounts");
        }
      });
    }//loadViews

    $(function(){
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

      $('input[name="daterange"]').daterangepicker({
          format: 'YYYY-MM-DD',
          startDate: '2013-01-01',
          endDate: '2013-12-31'
      });

      $('body').on('click', '.filter_remove', function(e){
        $( e.target ).parents('.filter').remove();
      });

      $('#add_dimension_filter').click(function(e){
        var dimension_filter = $('.dimension_filters .chart_filter'),
            filter = dimension_filter.find('.filter:eq(0)');

        dimension_filter.append( filter.clone() );
      });

      $('#add_metric_filter').click(function(e){
          var metric_filter = $('.metric_filters .chart_filter'),
              filter = metric_filter.find('.filter:eq(0)');

          metric_filter.append( filter.clone() );
      });

      $('#add_order').click(function(e){
          var orderby_html, orderby = $('.orderby .chart_filter');

          orderby_html = '<li class="filter row"><div class="col-md-7 nopadding"><select class="filter_columns form-control" name="orderbys[]">' +
                                     @foreach( $dimensions as $key => $group )
                                       '<optgroup label="{{ $key }}" >'+
                                       @foreach( $group as $dimension )
                                         '<option value="{{ $dimension->id }}">{{ $dimension->attributes->uiName }}</option>'+
                                       @endforeach
                                       '</optgroup>'+
                                     @endforeach
                                     @foreach( $metrics as $key => $group )
                                       '<optgroup label="{{ $key }}" >'+
                                       @foreach( $group as $metric )
                                         '<option value="{{ $metric->id }}">{{ $metric->attributes->uiName }}</option>'+
                                       @endforeach
                                       '</optgroup>'+
                                     @endforeach
                                 '</select>'+
                             '</div>'+
                             '<div class="col-md-4 nopadding">'+
                                 '<select class="form-control" name="orderby_rules[]">'+
                                     '<option value="">ASC</option>'+
                                     '<option value="-">DESC</option>'+
                                 '</select>'+
                             '</div>'+
                             '<div class="col-md-1 del">'+
                                 '<span class="glyphicon glyphicon-remove filter_remove"></span>'+
                             '</div>'+
                         '</li>';
          orderby.append( orderby_html );
      });
    });
  </script>
</head>
<body>
<div class="container">
  <br/>
  <div class="row">
    <div class="col-md-6 col-md-offset-3">
      <form class="form-horizontal" role="form" action="/report" method="POST">
        <fieldset>
          <!-- Form Name -->
          <legend>Google Analytics explorer</legend>
          
          <div class="form-group">
            <label class="col-sm-3 control-label" for="textinput">Account</label>
            <div class="col-sm-9">
              <select id="account" name="account" class="form-control">
                  <option value="0">Loading accounts...</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="col-sm-3 control-label" for="textinput">Property</label>
            <div class="col-sm-9">
              <select id="property" name="property" class="form-control">
                
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label class="col-sm-3 control-label" for="textinput">View</label>
            <div class="col-sm-9">
              <select id="view" name="view" class="form-control">
                
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label class="col-sm-3 control-label" for="textinput">Dimensions</label>
            <div class="col-sm-9">
              <select id="dimensions" name="dimensions[]" id="dimensions" class="form-control" multiple>
                @foreach( $dimensions as $key => $group )
                  <optgroup label="{{ $key }}" >
                  @foreach( $group as $dimension )
                    <option value="{{ $dimension->id }}">{{ $dimension->attributes->uiName }}</option>
                  @endforeach
                  </optgroup>
                @endforeach
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label class="col-sm-3 control-label" for="textinput">Metrics</label>
            <div class="col-sm-9">
              <select id="metrics" name="metrics[]" id="metrics" class="form-control" multiple>
                @foreach( $metrics as $key => $group )
                  <optgroup label="{{ $key }}" >
                  @foreach( $group as $metric )
                    <option value="{{ $metric->id }}">{{ $metric->attributes->uiName }}</option>
                  @endforeach
                  </optgroup>
                @endforeach
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="col-sm-3 control-label" for="">Date range</label>
            <div class="daterange col-md-9">
              <input name="daterange" class="form-control" value="2013-01-01 - 2014-12-30">
            </div>
          </div>

          <div class="form-group">
              <label class="col-sm-3 control-label" for="">Max results</label>
              <div class="col-md-9">
                  <input name="max_results" id="max_results" type="text" class="form-control" value="10">
              </div>
          </div>

          <div class="form-group">
            <label class="col-sm-3 control-label" for="">Chart Type</label>
            <div class="col-md-9">
                <select class="form-control" name="chart_type" id="">
                    <option value="table">Table</option>
                    <option value="pie">Pie</option>
                </select>
            </div>
          </div>

          <div class="form-group panel panel-default">
            <div class="panel-heading clearfix">
                <h5 class="pull-left">Dimensions Filter</h5>
                <input class="btn btn-primary pull-right" type="button" value="Add filter" id="add_dimension_filter" />
            </div>

            <div class="dimension_filters">

                <ul class="chart_filter">
                    <li class="filter row">
                        <div class="col-md-2 nopadding">
                            <select class="form-control" name="dimension_filter_show[]">
                                <option value="show">Only show</option>
                                <option value="dshow">Don't show</option>
                            </select>
                        </div>
                        <div class="col-md-3 nopadding">
                            <select class="filter_columns form-control" name="dimension_filters[]">
                                @foreach( $dimensions as $key => $group )
                                  <optgroup label="{{ $key }}" >
                                  @foreach( $group as $dimension )
                                    <option value="{{ $dimension->id }}">{{ $dimension->attributes->uiName }}</option>
                                  @endforeach
                                  </optgroup>
                                @endforeach
                            </select>
                        </div>

                        <div class="col-md-3 nopadding">
                            <select class="form-control" name="dimension_filter_rules[]">
                                <option value="contain">Containing</option>
                                <option value="exact">Exactly</option>
                                <option value="regexp">Regular Expression</option>
                            </select>
                        </div>

                        <div class="col-md-3 nopadding">
                            <input type="text" class="form-control"  name="dimension_filter_values[]">
                        </div>

                        <div class="col-md-1 del">
                            <span class="glyphicon glyphicon-remove filter_remove"></span>
                        </div>
                    </li>
                </ul>

            </div>
            </div>

          <div class="form-group panel panel-default">
              <div class="panel-heading clearfix">
                  <h5 class="pull-left">Metrics Filter</h5>
                  <input class="btn btn-primary pull-right" type="button" value="Add filter" id="add_metric_filter" />
              </div>
               <div class="metric_filters">

                   <ul class="chart_filter">
                       <li class="filter row">
                           <div class="col-md-2 nopadding">
                               <select class="form-control" name="metric_filter_show[]">
                                   <option value="show">Only show</option>
                                   <option value="dshow">Don't show</option>
                               </select>
                           </div>

                           <div class="col-md-3 nopadding">
                               <select class="filter_columns form-control" name="metric_filters[]">
                                   @foreach( $metrics as $key => $group )
                                     <optgroup label="{{ $key }}" >
                                     @foreach( $group as $metric )
                                       <option value="{{ $metric->id }}">{{ $metric->attributes->uiName }}</option>
                                     @endforeach
                                     </optgroup>
                                   @endforeach
                               </select>
                           </div>

                           <div class="col-md-3 nopadding">
                               <select class="form-control" name="metric_filter_rules[]">
                                   <option value="eq">Equal</option>
                                   <option value="gt">Greater than</option>
                                   <option value="lt">Less than</option>
                                   <option value="gteq">Greater than or equal</option>
                                   <option value="lteq">Less than or equal</option>
                               </select>
                           </div>

                           <div class="col-md-3 nopadding">
                               <input type="text" class="form-control"  name="metric_filter_values[]">
                           </div>

                           <div class="col-md-1 del">
                               <span class="glyphicon glyphicon-remove filter_remove"></span>
                           </div>
                       </li>
                   </ul>

               </div>
          </div>

          <div class="form-group panel panel-default">
                <div class="panel-heading clearfix">
                    <h5 class="pull-left">Order By</h5>
                    <input class="btn btn-primary pull-right" type="button" value="Add order" id="add_order" />
                </div>
                 <div class="orderby">

                     <ul class="chart_filter">

                     </ul>

                 </div>
            </div>

          <div class="form-group">
            <div class="col-sm-offset-2 col-sm-10">
              <div class="pull-right">
                <button type="submit" class="btn btn-primary">Get report</button>
              </div>
            </div>
          </div>

        </fieldset>
      </form>
    </div><!-- /.col-lg-12 -->
</div><!-- /.row -->
</div>
</body>
</html>