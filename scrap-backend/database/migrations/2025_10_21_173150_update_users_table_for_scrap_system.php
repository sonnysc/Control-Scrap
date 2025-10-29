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
        Schema::table('users', function (Blueprint $table) {
            // Elimina columnas por defecto de laravel que no se usaran
            $table->dropColumn(['email', 'email_verified_at', 'name']);

            // Se agragan las nuevas columnas
            $table->string('username')->unique()->after('id');
            $table->string('name')->after('username');
            $table->enum('role', ['admin', 'operador', 'receptor'])->default('operador')->after('name');
            $table->boolean('activo')->default(true)->after('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Revierte los cambios si son necesarios
            $table->dropColumn(['username', 'name', 'role', 'activo']);
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
        });
    }
};
