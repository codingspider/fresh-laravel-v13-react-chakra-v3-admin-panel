<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

pest()->extend(TestCase::class)->use(RefreshDatabase::class);

$allUserPermissions = ['access.users.view', 'access.users.create', 'access.users.update', 'access.users.delete'];

it('needs login and permission', function () {
    $this->getJson('/api/v1/access/users')->assertUnauthorized();

    Sanctum::actingAs(userWithPermissions([]));
    $this->getJson('/api/v1/access/users')
        ->assertForbidden()
        ->assertJsonPath('success', false);
});

it('lists users with search, role filter and pagination', function () use ($allUserPermissions) {
    Sanctum::actingAs(userWithPermissions($allUserPermissions));
    Role::create(['name' => 'manager', 'guard_name' => 'web']);
    User::factory()->create(['name' => 'Rahim Uddin'])->assignRole('manager');
    User::factory()->create(['name' => 'Karim Hasan']);

    $this->getJson('/api/v1/access/users?search=Rahim')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Rahim Uddin')
        ->assertJsonPath('data.0.roles.0.name', 'manager')
        ->assertJsonStructure(['success', 'message', 'data', 'errors', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);

    $this->getJson('/api/v1/access/users?role=manager')->assertJsonCount(1, 'data');

    $this->getJson('/api/v1/access/users?per_page=1&sort_by=name&sort_dir=asc')
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('meta.total', 3);
});

it('rejects a column that cannot be sorted', function () use ($allUserPermissions) {
    Sanctum::actingAs(userWithPermissions($allUserPermissions));

    $this->getJson('/api/v1/access/users?sort_by=password')
        ->assertStatus(422)
        ->assertJsonValidationErrors(['sort_by']);
});

it('creates a user with roles', function () use ($allUserPermissions) {
    Sanctum::actingAs(userWithPermissions($allUserPermissions));
    Role::create(['name' => 'manager', 'guard_name' => 'web']);

    $this->postJson('/api/v1/access/users', [
        'name' => 'Karim Hasan',
        'email' => 'karim@example.com',
        'phone' => '01812345678',
        'password' => 'secret-pass-1',
        'password_confirmation' => 'secret-pass-1',
        'is_active' => true,
        'roles' => ['manager'],
    ])->assertCreated()
        ->assertJsonPath('data.roles.0.name', 'manager');

    $user = User::where('email', 'karim@example.com')->first();
    expect($user->hasRole('manager'))->toBeTrue()
        ->and(Hash::check('secret-pass-1', $user->password))->toBeTrue();
});

it('validates the user form', function () use ($allUserPermissions) {
    Sanctum::actingAs(userWithPermissions($allUserPermissions));

    $this->postJson('/api/v1/access/users', ['phone' => '123'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'email', 'phone', 'password', 'is_active']);
});

it('lets only a super admin give the super-admin role', function () use ($allUserPermissions) {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Sanctum::actingAs(userWithPermissions($allUserPermissions));

    $this->postJson('/api/v1/access/users', [
        'name' => 'Sneaky',
        'email' => 'sneaky@example.com',
        'password' => 'secret-pass-1',
        'password_confirmation' => 'secret-pass-1',
        'is_active' => true,
        'roles' => ['super-admin'],
    ])->assertStatus(422)->assertJsonValidationErrors(['roles.0']);
});

it('updates a user and keeps the password when it is empty', function () use ($allUserPermissions) {
    Sanctum::actingAs(userWithPermissions($allUserPermissions));
    $user = User::factory()->create();
    $oldPassword = $user->password;

    $this->putJson("/api/v1/access/users/{$user->id}", [
        'name' => 'New Name',
        'email' => $user->email,
        'phone' => null,
        'password' => '',
        'is_active' => true,
        'roles' => [],
    ])->assertOk()->assertJsonPath('data.name', 'New Name');

    expect($user->refresh()->password)->toBe($oldPassword);
});

it('logs a user out everywhere when the account is turned off', function () use ($allUserPermissions) {
    Sanctum::actingAs(userWithPermissions($allUserPermissions));
    $user = User::factory()->create();
    $user->createToken('Phone');

    $this->putJson("/api/v1/access/users/{$user->id}", [
        'name' => $user->name,
        'email' => $user->email,
        'is_active' => false,
    ])->assertOk()->assertJsonPath('data.is_active', false);

    expect($user->tokens()->count())->toBe(0);
});

it('does not let you turn off or delete your own account', function () use ($allUserPermissions) {
    $me = userWithPermissions($allUserPermissions);
    Sanctum::actingAs($me);

    $this->putJson("/api/v1/access/users/{$me->id}", [
        'name' => $me->name,
        'email' => $me->email,
        'is_active' => false,
    ])->assertStatus(422)->assertJsonPath('message', 'You cannot turn off your own account.');

    $this->deleteJson("/api/v1/access/users/{$me->id}")
        ->assertStatus(422)
        ->assertJsonPath('message', 'You cannot delete your own account.');
});

it('does not let a normal admin change a super admin', function () use ($allUserPermissions) {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    $boss = User::factory()->create();
    $boss->assignRole('super-admin');
    Sanctum::actingAs(userWithPermissions($allUserPermissions));

    $this->deleteJson("/api/v1/access/users/{$boss->id}")->assertForbidden();
    expect(User::find($boss->id))->not->toBeNull();
});

it('deletes a user', function () use ($allUserPermissions) {
    Sanctum::actingAs(userWithPermissions($allUserPermissions));
    $user = User::factory()->create();

    $this->deleteJson("/api/v1/access/users/{$user->id}")->assertOk();

    expect(User::find($user->id))->toBeNull();
});
