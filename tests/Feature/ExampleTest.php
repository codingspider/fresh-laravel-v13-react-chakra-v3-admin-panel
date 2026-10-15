<?php

test('the React app page loads for any non-API URL', function () {
    $this->withoutVite()
        ->get('/login')
        ->assertOk()
        ->assertSee('<div id="root"></div>', false);
});
