<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RegistrosScrap;
use Illuminate\Support\Facades\Auth;

class RegistrosScrapController extends Controller
{
    // Se obtienen los registros del usuario actual

    public function index()
    {
        $user = Auth::user();

        // Si es admin, puede ver todos los registros
        // Si es operador, puede ver solo sus registros
        if ($user->role === 'admin') {
            $registros = RegistrosScrap::with('operador')
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $registros = RegistrosScrap::with('operador')
                ->where('operador_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($registros);
    }

    // Se crea un nuevo registro de scrap

    public function store(Request $request)
    {
        
        $validated = $request->validate([
            'peso_kg' => 'required|numeric|min:0.1',
            'tipo_material' => 'required|in:cobre,aluminio,mixto',
            'origen' => 'required|string|max:100',
        ]);

        $registro = RegistrosScrap::create([
            'peso_kg' => $validated['peso_kg'],
            'tipo_material' => $validated['tipo_material'],
            'origen' => $validated['origen'],
            'operador_id' => Auth::user()->id,
            'estado' => 'pendiente',
        ]);

        return response()->json([
            'message' => 'Registro de scrap creado correctamente',
            'registro' => $registro->load('operador')
        ], 201);
    }

    // Se obtiene un registro especifico
    public function show($id)
    {
        $registro = RegistrosScrap::with('operador')->findOrFail($id);

        // Se verifican permisos (solo admin o el operador que lo creo)
        $user = Auth::user();
        if ($user->role !== 'admin' && $registro->operador_id !== $user->id) {
            return response()->json([
                'message' => 'No tienes permiso para ver este registro'
            ], 403);
        }

        return response()->json($registro);
    }

    // Se obtienen las estadisticas para el dashboard del operador
    public function stats()
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            $totalRegistros = RegistrosScrap::count();
            $totalPeso = RegistrosScrap::sum('peso_kg');
            $pendientes = RegistrosScrap::where('estado', 'pendiente')->count();
        } else {
            $totalRegistros = RegistrosScrap::where('operador_id', $user->id)->count();
            $totalPeso = RegistrosScrap::where('operador_id', $user->id)->sum('peso_kg');
            $pendientes = RegistrosScrap::where('operador_id', $user->id)
                ->where('estado', 'pendiente')
                ->count();
        }

        return response()->json([
            'total_registros' => $totalRegistros,
            'total_peso_kg' => $totalPeso,
            'pendientes' => $pendientes,
        ]);
    }
    
}
