  <!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Google Analytics</title>
  <!-- Latest compiled and minified CSS -->
  <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
  <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap-theme.min.css">
  <script src="//code.jquery.com/jquery-2.1.1.min.js"></script>
  <style>
    select[multiple] {
      height: 130px;
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