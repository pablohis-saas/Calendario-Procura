"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchDashboardMetrics = fetchDashboardMetrics;
async function fetchDashboardMetrics({ sedeId, from, to }) {
    const searchParams = new URLSearchParams();
    if (sedeId)
        searchParams.append('sedeId', sedeId);
    if (from)
        searchParams.append('from', from);
    if (to)
        searchParams.append('to', to);
    const url = searchParams.toString()
        ? `/api/dashboard?${searchParams.toString()}`
        : '/api/dashboard';
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics');
    }
    return response.json();
}
//# sourceMappingURL=dashboard.js.map