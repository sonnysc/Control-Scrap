<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('recepciones_scrap', function (Blueprint $table) {
            $table->id();
            $table->string('numero_hu')->unique();
            $table->decimal('peso_kg', 8, 2);
            $table->string('tipo_material');
            $table->enum('origen_tipo', ['interna', 'externa']);
            $table->string('origen_especifico');
            $table->foreignId('registro_scrap_id')->nullable()->constrained('registros_scrap');
            $table->foreignId('receptor_id')->constrained('users');
            $table->enum('destino', ['reciclaje', 'venta', 'almacenamiento']);
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recepciones_scrap');
    }
};
