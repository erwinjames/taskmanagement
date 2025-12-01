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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('admin_id')->nullable()->after('role')->constrained('users')->onDelete('set null');
            $table->string('department')->nullable()->after('admin_id');
            $table->string('status')->default('active')->after('department'); // active, away, offline
            $table->timestamp('last_active_at')->nullable()->after('status');
            $table->json('skills')->nullable()->after('last_active_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['admin_id']);
            $table->dropColumn(['admin_id', 'department', 'status', 'last_active_at', 'skills']);
        });
    }
};
