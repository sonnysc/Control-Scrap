<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrosScrap extends Model
{
    protected $table = 'registros_scrap';
    
    protected $fillable = [
        'peso_kg', 'tipo_material', 'origen', 'operador_id', 'estado'
    ];

    public function operador()
    {

        return $this->belongsTo(User::class, 'operador_id');
    
    }

    public function recepcion()
    {

        return $this->hasOne(RecepcionesScrap::class, 'registro_scrap_id');
        
    }
}
