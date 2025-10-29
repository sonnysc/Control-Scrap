<?php
/* routes/api.php */

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RecepcionScrapController;
use App\Http\Controllers\RegistrosScrapController;
use App\Http\Controllers\UserController;

// Grupo con middleware API (sin CSRF)
Route::middleware('api')->group(function () {

    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/user', function (Request $request) {
        try {
            $user = Auth::guard('sanctum')->user();
            
            if (!$user) {
                return response()->json(['message' => 'No autenticado'], 401);
            }
            
            return response()->json([
                'user' => $user,
                'message' => 'Usuario autenticado'
            ]);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Ruta del Dashboard
    Route::middleware('auth:sanctum')->group(function() {
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('dashboard/recent-activity', [DashboardController::class, 'recentActivity']);
    });

    Route::middleware('auth:sanctum')->prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
        Route::patch('/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    });

    Route::middleware('auth:sanctum')->prefix('registros-scrap')->group(function () {
        Route::get('/', [RegistrosScrapController::class, 'index']);
        Route::post('/', [RegistrosScrapController::class, 'store']);
        Route::get('/stats', [RegistrosScrapController::class, 'stats']);
        Route::get('/{id}', [RegistrosScrapController::class, 'show']);
    });

    // Rutas para recepciones de scrap
    Route::middleware('auth:sanctum')->prefix('recepciones-scrap')->group(function () {
        Route::get('/', [RecepcionScrapController::class, 'index']);
        Route::get('/registros-pendientes', [RecepcionScrapController::class, 'registrosPendientes']);
        Route::post('/', [RecepcionScrapController::class, 'store']);
        Route::get('/stats', [RecepcionScrapController::class, 'stats']);
        Route::get('/{id}', [RecepcionScrapController::class, 'show']);
    });
    
});