<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SessionBootstrapTest extends TestCase
{
    use RefreshDatabase;

    public function test_session_returns_null_when_guest(): void
    {
        $this->withHeader('origin', 'http://localhost:5173')
            ->getJson('/api/session')
            ->assertOk()
            ->assertJsonPath('data', null);
    }

    public function test_session_returns_user_when_authenticated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/session')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);
    }
}
