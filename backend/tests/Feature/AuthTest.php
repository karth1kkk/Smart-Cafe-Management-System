<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_upgrades_plaintext_pin_in_database_to_bcrypt(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Barista,
            'password' => 'password',
            'pin' => '123456',
        ]);

        DB::table('users')->where('id', $user->id)->update(['pin' => '123456']);

        $this->withHeader('origin', 'http://localhost:5173')->postJson('/api/login', [
            'user_id' => $user->id,
            'pin' => '123456',
        ])->assertOk();

        $this->assertTrue(Hash::isHashed(DB::table('users')->where('id', $user->id)->value('pin')));
    }

    public function test_user_can_log_in_fetch_profile_and_log_out(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Admin,
            'password' => 'password',
            'pin' => '123456',
        ]);

        $this->withHeader('origin', 'http://localhost:5173')->postJson('/api/login', [
            'user_id' => $user->id,
            'pin' => '123456',
        ])->assertOk()
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonPath('data.role', UserRole::Admin->value);

        $this->withHeader('origin', 'http://localhost:5173')->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);

        $this->withHeader('origin', 'http://localhost:5173')->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out successfully.');
    }
}
