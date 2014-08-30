<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/



Route::get( '/', [ 'uses' => 'HomeController@home' ] );
Route::get( '/login', [ 'uses' => 'HomeController@login' ] );

Route::get( '/ga/accounts', [ 'uses' => 'HomeController@accounts' ] );
Route::get( '/ga/properties/{account_id}', [ 'uses' => 'HomeController@properties' ] )->where('account_id', '[0-9]*');
Route::get( '/ga/views/{account_id}/{property_id}', [ 'uses' => 'HomeController@views' ] )->where( [ 'account_id' => '[0-9]*', 'property_id' => '^UA-[0-9\-]+' ] );

Route::get( '/ga/metadata', [ 'uses' => 'HomeController@metadata' ] );
Route::post('/ga/report', [ 'uses' => 'HomeController@report' ] );

Route::get('/compare', [ 'uses' => 'HomeController@compare' ] );

Route::get( '/chart_type', [ 'uses' => 'HomeController@chart_type' ] );

Route::get( '/test', [ 'uses' => 'HomeController@test' ] );

?>
