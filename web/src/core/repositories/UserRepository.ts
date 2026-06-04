import { BaseRepository } from './BaseRepository';

export interface PanelUser {
    id:        string;
    username:  string;
    role:      'SUPER_ADMIN' | 'ADMIN' | 'USER';
    createdAt: string;
    updatedAt: string;
}

export class UserRepository extends BaseRepository<PanelUser> {
    protected readonly basePath = '/api/users';

    async listAll(): Promise<PanelUser[]> {
        return this.fetchAll();
    }

    async create(username: string, password: string, role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'): Promise<PanelUser> {
        return this.client.post<PanelUser>(this.basePath, { username, password, role });
    }

    async remove(id: string): Promise<void> {
        await this.client.delete(`${this.basePath}/${id}`);
    }
}
