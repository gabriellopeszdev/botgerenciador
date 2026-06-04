import { ApiClient } from '../http/ApiClient';

/**
 * Template Method: define o esqueleto das operações CRUD.
 * Subclasses fornecem basePath e podem sobrescrever transform().
 */
export abstract class BaseRepository<TRaw, TDomain = TRaw> {
    protected abstract readonly basePath: string;
    protected readonly client: ApiClient;

    constructor() {
        this.client = ApiClient.getInstance();
    }

    /** Hook — subclasses sobrescrevem para converter raw → domínio. */
    protected transform(raw: TRaw): TDomain {
        return raw as unknown as TDomain;
    }

    protected async fetchAll(): Promise<TDomain[]> {
        const raws = await this.client.get<TRaw[]>(this.basePath);
        return raws.map(r => this.transform(r));
    }

    protected async fetchOne(id: string): Promise<TDomain> {
        const raw = await this.client.get<TRaw>(`${this.basePath}/${id}`);
        return this.transform(raw);
    }
}
