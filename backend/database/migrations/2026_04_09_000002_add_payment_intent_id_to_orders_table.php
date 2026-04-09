<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('payment_intent_id')
                ->nullable()
                ->after('user_id')
                ->constrained('payment_intents')
                ->restrictOnDelete();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unique('payment_intent_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['payment_intent_id']);
            $table->dropConstrainedForeignId('payment_intent_id');
        });
    }
};
