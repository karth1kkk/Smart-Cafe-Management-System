<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\StaffProfileResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function staffProfiles(): AnonymousResourceCollection
    {
        return StaffProfileResource::collection(
            User::query()->orderBy('name')->get()
        );
    }

    public function session(Request $request): JsonResponse
    {
        $user = Auth::guard('web')->user();

        return response()->json([
            'data' => $user ? UserResource::make($user)->resolve() : null,
        ]);
    }

    public function login(LoginRequest $request): UserResource
    {
        $data = $request->validated();
        $user = User::query()->findOrFail($data['user_id']);

        // Read directly from the database so the hashed cast / model state cannot skew verification.
        $storedPin = DB::table('users')->where('id', $user->id)->value('pin');

        if ($storedPin === null || $storedPin === '') {
            throw ValidationException::withMessages([
                'pin' => ['No PIN is set for this profile. Run database seeders or set a PIN in the admin.'],
            ]);
        }

        $plain = $data['pin'];
        $stored = (string) $storedPin;

        // PINs from the "hashed" cast are bcrypt/argon. Hash::check() throws on non-hash strings.
        $pinValid = false;
        if ($stored !== '' && str_starts_with($stored, '$')) {
            $pinValid = Hash::check($plain, $stored);
        }

        if (! $pinValid) {
            $pinValid = password_verify($plain, $stored);
        }

        if (! $pinValid && hash_equals($stored, $plain)) {
            // Plaintext PIN in DB — migrate to bcrypt via the model cast.
            $pinValid = true;
            $user->pin = $plain;
            $user->saveQuietly();
        }

        if (! $pinValid) {
            throw ValidationException::withMessages([
                'pin' => ['Invalid PIN.'],
            ])->status(401);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return UserResource::make($request->user());
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    public function user(Request $request): UserResource
    {
        return UserResource::make($request->user());
    }
}
