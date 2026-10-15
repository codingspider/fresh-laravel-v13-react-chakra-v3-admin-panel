<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

pest()->extend(TestCase::class)->use(RefreshDatabase::class);

$allRolePermissions = ['access.roles.view', 'access.roles.create', 'access.roles.update', 'access.roles.delete'];

it('needs the roles permission', function () {
    Sanctum::actingAs(userWithPermissions([]));

    $this->getJson('/api/v1/access/roles')->assertForbidden();
    $this->getJson('/api/v1/access/permissions')->assertForbidden();
});

it('lists roles with counts', function () use ($allRolePermissions) {
    Sanctum::actingAs(userWithPermissions($allRolePermissions));
    $role = Role::create(['name' => 'manager', 'guard_name' => 'web']);
    User::factory()->create()->assignRole($role);

    $this->getJson('/api/v1/access/roles?search=man')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'manager')
        ->assertJsonPath('data.0.users_count', 1)
        ->assertJsonPath('data.0.is_protected', false);
});

it('returns permissions grouped by module and resource', function () use ($allRolePermissions) {
    Sanctum::actingAs(userWithPermissions($allRolePermissions));
    Permission::findOrCreate('access.users.update', 'web');

    $response = $this->getJson('/api/v1/access/permissions')->assertOk();

    $access = collect($response->json('data'))->firstWhere('module', 'access');
    $roles = collect($access['groups'])->firstWhere('key', 'access.roles');

    expect($access['label'])->toBe('Access')
        ->and($roles['label'])->toBe('Roles')
        // actions come in a fixed order: view, create, update (Edit), delete
        ->and(collect($roles['permissions'])->pluck('action')->all())->toBe(['view', 'create', 'update', 'delete'])
        ->and($roles['permissions'][2]['label'])->toBe('Edit');
});

it('creates a role with permissions', function () use ($allRolePermissions) {
    Sanctum::actingAs(userWithPermissions($allRolePermissions));

    $this->postJson('/api/v1/access/roles', [
        'name' => 'Field Manager',
        'permissions' => ['access.roles.view'],
    ])->assertCreated()
        ->assertJsonPath('data.permissions', ['access.roles.view']);

    expect(Role::findByName('Field Manager', 'web')->hasPermissionTo('access.roles.view'))->toBeTrue();
});

it('rejects unknown permissions and duplicate names', function () use ($allRolePermissions) {
    Sanctum::actingAs(userWithPermissions($allRolePermissions));
    Role::create(['name' => 'manager', 'guard_name' => 'web']);

    $this->postJson('/api/v1/access/roles', [
        'name' => 'manager',
        'permissions' => ['does.not.exist'],
    ])->assertStatus(422)->assertJsonValidationErrors(['name', 'permissions.0']);
});

it('updates a role and replaces its permissions', function () use ($allRolePermissions) {
    Sanctum::actingAs(userWithPermissions($allRolePermissions));
    $role = Role::create(['name' => 'manager', 'guard_name' => 'web']);
    $role->givePermissionTo('access.roles.view');

    $this->putJson("/api/v1/access/roles/{$role->id}", [
        'name' => 'Senior Manager',
        'permissions' => ['access.roles.create'],
    ])->assertOk()->assertJsonPath('data.permissions', ['access.roles.create']);

    $role->refresh();
    expect($role->name)->toBe('Senior Manager')
        ->and($role->hasPermissionTo('access.roles.view'))->toBeFalse();
});

it('protects the super-admin role', function () use ($allRolePermissions) {
    Sanctum::actingAs(userWithPermissions($allRolePermissions));
    $superAdmin = Role::create(['name' => 'super-admin', 'guard_name' => 'web']);

    $this->putJson("/api/v1/access/roles/{$superAdmin->id}", ['name' => 'hacked'])->assertForbidden();
    $this->deleteJson("/api/v1/access/roles/{$superAdmin->id}")->assertForbidden();

    expect(Role::where('name', 'super-admin')->exists())->toBeTrue();
});

it('does not delete a role that users still have', function () use ($allRolePermissions) {
    Sanctum::actingAs(userWithPermissions($allRolePermissions));
    $role = Role::create(['name' => 'manager', 'guard_name' => 'web']);
    User::factory()->create()->assignRole($role);

    $this->deleteJson("/api/v1/access/roles/{$role->id}")
        ->assertStatus(422)
        ->assertJsonPath('success', false);

    $role->users()->detach();
    $this->deleteJson("/api/v1/access/roles/{$role->id}")->assertOk();
    expect(Role::where('name', 'manager')->exists())->toBeFalse();
});

it('gives role options to people who manage users', function () {
    Sanctum::actingAs(userWithPermissions(['access.users.create']));
    Role::create(['name' => 'manager', 'guard_name' => 'web']);

    $this->getJson('/api/v1/access/roles/options')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'manager');
});
