<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

pest()->extend(TestCase::class)->use(RefreshDatabase::class);

it('logs out the app by deleting its token', function () {
    $user = User::factory()->create();
    $token = $user->createToken('Test Phone')->plainTextToken;

    $this->withToken($token)
        ->postJson('/api/v1/auth/logout')
        ->assertOk()
        ->assertJsonPath('success', true);

    expect($user->tokens()->count())->toBe(0);
});

it('logs out the web session', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'web')
        ->withHeaders(spaHeaders())
        ->postJson('/api/v1/auth/logout')
        ->assertOk();

    $this->assertGuest('web');
});

it('returns 401 in the standard format for guests', function () {
    $this->postJson('/api/v1/auth/logout')
        ->assertUnauthorized()
        ->assertJson([
            'success' => false,
            'message' => 'Please log in to continue.',
            'data' => null,
            'errors' => null,
            'meta' => null,
        ]);

    $this->getJson('/api/v1/auth/me')->assertUnauthorized();
});

it('returns the logged-in user with roles and permissions', function () {
    $user = User::factory()->create();
    Permission::create(['name' => 'hr.employees.view', 'guard_name' => 'web']);
    Role::create(['name' => 'manager', 'guard_name' => 'web'])->givePermissionTo('hr.employees.view');
    $user->assignRole('manager');

    Sanctum::actingAs($user);

    $this->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.roles', ['manager'])
        ->assertJsonPath('data.permissions', ['hr.employees.view']);
});
