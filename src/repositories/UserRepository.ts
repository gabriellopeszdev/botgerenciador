import { PrismaClient, User, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export type SafeUser = Omit<User, 'passwordHash'>;

export class UserRepository {
    constructor(private readonly prisma: PrismaClient) {}

    private static toSafe(user: User): SafeUser {
        const { passwordHash: _ph, ...safe } = user;
        return safe;
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { username } });
    }

    async findById(id: string): Promise<SafeUser | null> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        return user ? UserRepository.toSafe(user) : null;
    }

    private static validatePassword(plainPassword: string): void {
        if (!plainPassword || plainPassword.length < 4) {
            throw new Error('A senha deve ter no mínimo 4 caracteres.');
        }
    }

    async create(username: string, plainPassword: string, role: UserRole = 'USER'): Promise<SafeUser> {
        UserRepository.validatePassword(plainPassword);
        const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
        const created = await this.prisma.user.create({
            data: { username, passwordHash, role },
        });
        return UserRepository.toSafe(created);
    }

    async verifyCredentials(username: string, plainPassword: string): Promise<SafeUser | null> {
        const user = await this.findByUsername(username);
        if (!user) return null;

        const ok = await bcrypt.compare(plainPassword, user.passwordHash);
        return ok ? UserRepository.toSafe(user) : null;
    }

    async setPassword(id: string, plainPassword: string): Promise<void> {
        UserRepository.validatePassword(plainPassword);
        const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
        await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    }

    async setRole(id: string, role: UserRole): Promise<void> {
        await this.prisma.user.update({ where: { id }, data: { role } });
    }

    async list(): Promise<SafeUser[]> {
        const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
        return users.map(UserRepository.toSafe);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({ where: { id } });
    }
}
