<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

pest()->extend(TestCase::class)->use(RefreshDatabase::class);

it('updates the profile', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->putJson('/api/v1/auth/profile', [
        'name' => 'Rahim Uddin',
        'email' => 'rahim@example.com',
        'phone' => '01812345678',
    ])->assertOk()
        ->assertJsonPath('data.name', 'Rahim Uddin')
        ->assertJsonPath('data.phone', '01812345678');

    expect($user->refresh()->email)->toBe('rahim@example.com');
});

it('rejects a phone number that is already used or invalid', function () {
    User::factory()->create(['phone' => '01812345678']);
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->putJson('/api/v1/auth/profile', ['name' => 'A', 'email' => $user->email, 'phone' => '01812345678'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['phone']);

    $this->putJson('/api/v1/auth/profile', ['name' => 'A', 'email' => $user->email, 'phone' => '12345'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['phone']);
});

it('changes the password and logs out other apps', function () {
    $user = User::factory()->create();
    $user->createToken('Old Phone');
    Sanctum::actingAs($user);

    $this->putJson('/api/v1/auth/change-password', [
        'current_password' => 'password',
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ])->assertOk();

    expect(Hash::check('new-password-123', $user->refresh()->password))->toBeTrue()
        ->and($user->tokens()->count())->toBe(0);
});

it('rejects a wrong current password', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->putJson('/api/v1/auth/change-password', [
        'current_password' => 'wrong',
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['current_password']);
});
