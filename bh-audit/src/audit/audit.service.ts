import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditEventDto } from './dto/create-audit-event.dto';
import { GetAuditEventsFilterDto } from './dto/get-audit-events-filter.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async createEvent(createDto: CreateAuditEventDto) {
    return this.prisma.auditEvent.create({
      data: {
        action: createDto.action,
        userId: createDto.userId,
        userRole: createDto.userRole,
        entityType: createDto.entityType,
        entityId: createDto.entityId,
        details: createDto.details || {},
        ipAddress: createDto.ipAddress,
        timestamp: new Date(createDto.timestamp),
      },
    });
  }

  async getEvents(filters: GetAuditEventsFilterDto) {
    const { page = 1, limit = 20, sortOrder = 'desc' } = filters;

    const where = this.buildWhereClause(filters);
    const { skip, take } = this.buildPagination(page, limit);

    const [total, data] = await Promise.all([
      this.prisma.auditEvent.count({ where }),
      this.prisma.auditEvent.findMany({
        where,
        skip,
        take,
        orderBy: { timestamp: sortOrder },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Solo arma el filtro de búsqueda a partir de lo que mandó el usuario.
   * No sabe nada de paginación ni de cómo se consulta la base de datos.
   */
  private buildWhereClause(
    filters: GetAuditEventsFilterDto,
  ): Prisma.AuditEventWhereInput {
    const { action, userId, userRole, entityType, startDate, endDate } =
      filters;

    const where: Prisma.AuditEventWhereInput = {};

    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (userRole) where.userRole = userRole;
    if (entityType) where.entityType = entityType;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    return where;
  }

  /**
   * Solo calcula cuántos registros saltar y cuántos traer.
   * No sabe nada de filtros ni de la base de datos.
   */
  private buildPagination(page: number, limit: number) {
    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }
}