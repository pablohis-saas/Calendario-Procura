import { PrismaClient } from '@prisma/client';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
  private readonly MAX_CACHE_SIZE = 1000;

  constructor(private prisma: PrismaClient) {
    // Limpiar caché expirado cada minuto
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  private generateKey(prefix: string, params: any): string {
    return `${prefix}:${JSON.stringify(params)}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    // Limpiar caché si está muy lleno
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Métodos específicos para el dominio
  async getCobrosByOrganizacion(organizacionId: string): Promise<any[] | null> {
    const key = this.generateKey('cobros', { organizacionId });
    return this.get<any[]>(key);
  }

  setCobrosByOrganizacion(organizacionId: string, data: any[]): void {
    const key = this.generateKey('cobros', { organizacionId });
    this.set(key, data, 2 * 60 * 1000); // 2 minutos para cobros
  }

  async getPacientesByOrganizacion(organizacionId: string): Promise<any[] | null> {
    const key = this.generateKey('pacientes', { organizacionId });
    return this.get<any[]>(key);
  }

  setPacientesByOrganizacion(organizacionId: string, data: any[]): void {
    const key = this.generateKey('pacientes', { organizacionId });
    this.set(key, data, 10 * 60 * 1000); // 10 minutos para pacientes
  }

  async getUsuariosByOrganizacion(organizacionId: string): Promise<any[] | null> {
    const key = this.generateKey('usuarios', { organizacionId });
    return this.get<any[]>(key);
  }

  setUsuariosByOrganizacion(organizacionId: string, data: any[]): void {
    const key = this.generateKey('usuarios', { organizacionId });
    this.set(key, data, 10 * 60 * 1000); // 10 minutos para usuarios
  }

  async getConsultoriosByOrganizacion(organizacionId: string): Promise<any[] | null> {
    const key = this.generateKey('consultorios', { organizacionId });
    return this.get<any[]>(key);
  }

  setConsultoriosByOrganizacion(organizacionId: string, data: any[]): void {
    const key = this.generateKey('consultorios', { organizacionId });
    this.set(key, data, 10 * 60 * 1000); // 10 minutos para consultorios
  }

  // Invalidar caché cuando se modifica un cobro
  invalidateCobros(organizacionId: string): void {
    const key = this.generateKey('cobros', { organizacionId });
    this.delete(key);
  }

  // Invalidar caché cuando se modifica un paciente
  invalidatePacientes(organizacionId: string): void {
    const key = this.generateKey('pacientes', { organizacionId });
    this.delete(key);
  }

  // Invalidar caché cuando se modifica un usuario
  invalidateUsuarios(organizacionId: string): void {
    const key = this.generateKey('usuarios', { organizacionId });
    this.delete(key);
  }

  // Invalidar caché cuando se modifica un consultorio
  invalidateConsultorios(organizacionId: string): void {
    const key = this.generateKey('consultorios', { organizacionId });
    this.delete(key);
  }

  // Estadísticas del caché
  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // TODO: Implementar tracking de hit rate
    };
  }
}

export default CacheService; 