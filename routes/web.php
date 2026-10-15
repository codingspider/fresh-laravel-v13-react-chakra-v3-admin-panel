<?php

use Illuminate\Support\Facades\Route;

/*
| Every URL that is not an API / Sanctum / docs URL returns the React app.
| React Router then shows the right page.
*/
Route::view('/{any?}', 'app')
    ->where('any', '^(?!(api|sanctum|docs|up)(/|$)).*$')
    ->name('spa');
