<?php
/* app/Http/Controllers/RecepcionScrapController.php */
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RecepcionesScrap;
use App\Models\RegistroScrap;
use App\Models\RegistrosScrap;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class RecepcionScrapController extends Controller
{
    // Se obtienen todas las cecepciones
    public function index() {
        $user = Auth::user();

        if ($user->role === 'admin') {
            $recepciones = RecepcionesScrap::with(['receptor', 'registro.operador'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $recepciones = RecepcionesScrap::with(['receptor', 'registro.operador'])
                ->where('receptor_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($recepciones);
    }

    // Se obitienen rehistros pendientes para recepcion

    public function registrosPendientes()
    {
        $registros = RegistrosScrap::with('operador')
            ->where('estado', 'pendiente')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($registros);
    }

    // Se crea una nueva recepcion
    public function store(Request $request)
    {
        $validated = $request->validate([
            'registro_scrap_id' => 'required|exists:registros_scrap,id',
            'peso_kg' => 'required|numeric|min:0.1',
            'tipo_material' => 'required|in:cobre,aluminio,mixto',
            'origen_tipo' => 'required|in:interna,externa',
            'origen_especifico' => 'required|string|max:150',
            'destino' => 'required|in:reciclaje,venta,almacenamiento',
            'observaciones' => 'nullable|string',
        ]);

        // Se genera el HU único
        $numeroHU = 'HU-' .strtoupper(Str::random(3)) .'-'.date('Ymd-His');

        $recepcion = RecepcionesScrap::create([
            'numero_hu' => $numeroHU,
            'peso_kg' => $validated['peso_kg'],
            'tipo_material' => $validated['tipo_material'],
            'origen_tipo' => $validated['origen_tipo'],
            'origen_especifico' => $validated['origen_especifico'],
            'registro_scrap_id' => $validated['registro_scrap_id'],
            'receptor_id' => Auth::id(),
            'destino' => $validated['destino'],
            'observaciones' => $validated['observaciones'] ?? null, 
        ]);

        // Actualizar el estado del registro original
        $registro = RegistrosScrap::find($validated['registro_scrap_id']);
        $registro->estado = 'recibido';
        $registro->save();

        return response()->json([
            'message' => 'Recepcion de scrap creada correctamente',
            'recepcion' => $recepcion->load(['receptor', 'registro.operador']),
            'numero_hu' => $numeroHU
        ], 201);
    }

    // Obtener estadisticas para el dashboard del receptor
    public function stats()
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            $totalRecepciones = RecepcionesScrap::count();
            $totalPeso = RecepcionesScrap::sum('peso_kg');
            $registrosPendientes = RecepcionesScrap::where('estado', 'pendiente')->count();
        } else {
            $totalRecepciones = RecepcionesScrap::where('receptor_id', $user->id)->count();
            $totalPeso = RecepcionesScrap::where('receptor_id', $user->id)->sum('peso_kg');
            $registrosPendientes = RegistrosScrap::where('estado', 'pendiente')->count();
        }

        // Distribucion por destino
        $destinos = RecepcionesScrap::when($user->role !== 'admin', function ($query) use ($user) {
            return $query->where('receptor_id', $user->id);
        })
        ->selectRaw('destino, COUNT(*) as count, SUM(peso_kg) as peso_total')
        ->groupBy('destino')
        ->get();

        return response()->json([
            'total_recepciones' => $totalRecepciones,
            'total_peso_kg' => $totalPeso,
            'registros_pendientes' => $registrosPendientes,
            'destinos' => $destinos,
        ]);
    }
    
    // Se obtiene una recepcion especifica
    public function show($id)
    {
        $recepcion = RecepcionesScrap::with(['receptor', 'registro.operador'])->findOrFail($id);

        // Se verifican los permisos
        $user = Auth::user();
        if ($user->role !== 'admin' && $recepcion->receptor_id !== $user->id) {
            return response()->json([
                'message' => ' No tienes permiso para ver esta recepcion'
            ],403);
        }

        return response()->json($recepcion);

    }
}
