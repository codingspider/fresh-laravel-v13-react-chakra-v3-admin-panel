<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)->use(RefreshDatabase::class);

const LOGIN_URL = '/api/v1/auth/login';

it('logs in from the app with email and returns a token', function () {
    $user = User::factory()->create();

    $response = $this->postJson(LOGIN_URL, [
        'login' => $user->email,
        'password' => 'password',
        'device_name' => 'Test Phone',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'success',
            'message',
            'data' => ['user' => ['id', 'name', 'email', 'phone', 'is_active', 'roles', 'permissions'], 'token', 'token_type'],
            'errors',
            'meta',
        ]);

    expect($user->tokens()->count())->toBe(1);
});

it('logs in from the app with phone number', function () {
    $user = User::factory()->create(['phone' => '01712345678']);

    $this->postJson(LOGIN_URL, [
        'login' => '01712345678',
        'password' => 'password',
        'device_name' => 'Test Phone',
    ])->assertOk()->assertJsonPath('data.user.id', $user->id);
});

it('logs in from the web with a session cookie and no token', function () {
    $user = User::factory()->create();

    $this->withHeaders(spaHeaders())
        ->postJson(LOGIN_URL, ['login' => $user->email, 'password' => 'password'])
        ->assertOk()
        ->assertJsonPath('data.user.id', $user->id)
        ->assertJsonMissingPath('data.token');

    $this->assertAuthenticatedAs($user, 'web');
    expect($user->tokens()->count())->toBe(0);
});

it('rejects a wrong password', function () {
    $user = User::factory()->create();

    $this->postJson(LOGIN_URL, [
        'login' => $user->email,
        'password' => 'wrong-password',
        'device_name' => 'Test Phone',
    ])->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonValidationErrors(['login']);

    $this->assertGuest('web');
    expect($user->tokens()->count())->toBe(0);
});

it('blocks an inactive user', function () {
    $user = User::factory()->inactive()->create();

    $this->postJson(LOGIN_URL, [
        'login' => $user->email,
        'password' => 'password',
        'device_name' => 'Test Phone',
    ])->assertForbidden()
        ->assertJsonPath('success', false);

    expect($user->tokens()->count())->toBe(0);
});

it('asks for device_name when an app logs in without it', function () {
    $user = User::factory()->create();

    // No SPA headers -> no session -> must be an app
    $this->postJson(LOGIN_URL, ['login' => $user->email, 'password' => 'password'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['device_name']);
});

it('validates required fields', function () {
    $this->postJson(LOGIN_URL, [])
        ->assertStatus(422)
        ->assertJsonPath('message', 'Validation failed.')
        ->assertJsonValidationErrors(['login', 'password']);
});
