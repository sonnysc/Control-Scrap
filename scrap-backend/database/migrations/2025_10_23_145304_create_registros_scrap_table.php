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
        Schema::create('registros_scrap', function (Blueprint $table) {
            $table->id();
            $table->decimal('peso_kg', 8, 2);
            $table->string('tipo_material');
            $table->string('origen');
            $table->foreignId('operador_id')->constrained('users');
            $table->enum('estado', ['pendiente', 'recibido'])->default('pendiente');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registros_scrap');
    }
};
