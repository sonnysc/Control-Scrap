<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecepcionesScrap extends Model
{
    protected $table = 'recepciones_scrap';
    
    protected $fillable =[
        'numero_hu', 'peso_kg', 'tipo_materia', 'origen_tipo', 'origen_especifico',
        'registro_scrap_id', 'receptor_id', 'destino', 'observaciones'
    ];

    public function receptor()
    {

        return $this->belongsTo(User::class, 'receptor_id');

    }

    public function registro()
    {

        return $this->belongsTo(RegistrosScrap::class, 'registro_scrap_id');

    }
}
