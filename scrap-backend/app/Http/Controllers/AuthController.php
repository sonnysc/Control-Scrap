<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Validar las credenciales del usuario
        if (!$request->username || !$request->password) {
            return response()->json([
                'message' => 'Username y password requeridos'
            ], 400);
        }

        // Autenticacion manual
        $user = User::where('username', $request->username)->first();

        if ($user && password_verify($request->password, $user->password)) {
            $token = $user->createToken('scrap-system')->plainTextToken;
            return response()->json([
                'message' => 'Login exitoso',
                'user' => $user,
                'token' => $token
            ]);
        }

        return response()->json([
            'message' => 'Credenciales incorrectas'
        ], 401);
    }

    public function logout(Request $request)
    {
        try {
            // Verifica autenticacion manualmente
            if (!$request->bearerToken()) {
                return response()->json([
                    'message' => 'Token no proporcionado'
                ], 401);
            }

            // Obtiene usuario del token
            $user = Auth::guard('sanctum')->user();

            if ($user) {
                $user->tokens()->delete();
                return response()->json([
                    'message' => 'Logout exitoso'
                ]);
            }

            return response()->json([
                'message' => 'Usuario no encontrado'
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
