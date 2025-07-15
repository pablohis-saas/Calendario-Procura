import { DashboardResponseDto } from '@/types/dashboard';

interface DashboardQueryParams {
  sedeId?: string;
  from?: string;
  to?: string;
}

export declare function getDashboardMetrics(params?: DashboardQueryParams): Promise<DashboardResponseDto>;
