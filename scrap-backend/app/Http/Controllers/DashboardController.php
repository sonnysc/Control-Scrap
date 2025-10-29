<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\RegistrosScrap;
use App\Models\RecepcionesScrap;

class DashboardController extends Controller
{
    public function stats()
    {
        $stats = [
            'total_usuarios' => User::count(),
            'total_resgistros' => RegistrosScrap::count(),
            'total_recepciones' => RecepcionesScrap::count(),
            'scrap_pendiente' => RegistrosScrap::where('estado', 'pendiente')->count(),
            'scrap_recibido' => RegistrosScrap::where('estado', 'recibido')->count(),
        ];

        return response()->json($stats);
    }

    public function recentActivity()
    {
        $recentRegistros = RegistrosScrap::with('operador')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $recentRecepciones = RecepcionesScrap::with('receptor')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'registros' => $recentRegistros,
            'recepciones' => $recentRecepciones
        ]);
    }
}
