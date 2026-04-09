<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnalyticsSummaryResource;
use App\Services\AnalyticsService;

class AnalyticsController extends Controller
{
    public function __construct(
        private readonly AnalyticsService $analyticsService,
    ) {}

    public function summary(): AnalyticsSummaryResource
    {
        return AnalyticsSummaryResource::make($this->analyticsService->summary());
    }
}
