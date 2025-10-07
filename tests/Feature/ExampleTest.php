<?php

it('returns a successful response', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
})->skip('Skipping due to CI environment issues');
