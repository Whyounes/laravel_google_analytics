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

Route::get('/', 'HomeController@index');
Route::get('/login', 'HomeController@login');

//management
Route::get('/accounts', 'HomeController@accounts');
Route::get( '/properties/{account_id}', [ 'uses' => 'HomeController@properties' ] )->where('account_id', '\d+');
Route::get( '/views/{account_id}/{property_id}', [ 'uses' => 'HomeController@views' ] )->where([ 'account_id', '\d+', 'property_id', '\d+' ]);

//metadata
Route::get('/metadata', 'HomeController@metadata');

//reporting
Route::post('/report', 'HomeController@report');