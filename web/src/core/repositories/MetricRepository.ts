import { BaseRepository } from './BaseRepository';
import type { CurrentMetrics, MetricPoint } from '@/types/api';

export class MetricRepository extends BaseRepository<MetricPoint> {
    protected readonly basePath = '/api/metrics';

    async getCurrent(): Promise<CurrentMetrics> {
        return this.client.get<CurrentMetrics>(this.basePath);
    }

    async getHistory(limit = 60): Promise<MetricPoint[]> {
        return this.client.get<MetricPoint[]>(`${this.basePath}/history?limit=${limit}`);
    }
}
