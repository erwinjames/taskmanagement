<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->softDeletes();
            $table->text('archive_notes')->nullable();
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->softDeletes();
            $table->text('archive_notes')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn('archive_notes');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn('archive_notes');
        });
    }
};
