<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('orders', 'payment_intent_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropForeign(['payment_intent_id']);
            });
            Schema::table('orders', function (Blueprint $table) {
                // SQLite requires the unique index removed before DROP COLUMN (orders_payment_intent_id_unique).
                $table->dropUnique(['payment_intent_id']);
            });
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('payment_intent_id');
            });
        }

        Schema::dropIfExists('payment_intents');

        Schema::create('stripe_checkouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('stripe_session_id')->nullable()->unique();
            $table->json('items_json');
            $table->text('notes')->nullable();
            $table->unsignedInteger('amount_cents');
            $table->char('currency', 3)->default('usd');
            $table->string('status')->index();
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('stripe_checkout_id')
                ->nullable()
                ->after('user_id')
                ->constrained('stripe_checkouts')
                ->restrictOnDelete();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unique('stripe_checkout_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['stripe_checkout_id']);
            $table->dropConstrainedForeignId('stripe_checkout_id');
        });

        Schema::dropIfExists('stripe_checkouts');

        Schema::create('payment_intents', function (Blueprint $table) {
            $table->id();
            $table->string('public_id')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('amount_cents');
            $table->char('currency', 3)->default('usd');
            $table->string('status')->index();
            $table->string('client_secret');
            $table->string('payment_method_id')->nullable();
            $table->json('items_json');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

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
};
