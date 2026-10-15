<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add phone (for login by phone) and is_active (to turn accounts off) to users.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 11)->nullable()->unique()->after('email'); // login + exact search
            $table->boolean('is_active')->default(true)->index()->after('password'); // filter
        });
    }

    /**
     * Undo the migration.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['phone']);
            $table->dropIndex(['is_active']);
            $table->dropColumn(['phone', 'is_active']);
        });
    }
};
