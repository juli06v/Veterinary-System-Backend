import {
  IsOptional,
  IsString,
  IsUUID,
  IsIn,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AUDIT_ACTIONS,
  AuditAction,
  AUDIT_ENTITY_TYPES,
  AuditEntityType,
  USER_ROLES,
  UserRole,
} from '../audit.constants';

export class GetAuditEventsFilterDto {
  @IsOptional()
  @IsString()
  @IsIn(AUDIT_ACTIONS)
  action?: AuditAction;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  @IsIn(USER_ROLES)
  userRole?: UserRole;

  @IsOptional()
  @IsString()
  @IsIn(AUDIT_ENTITY_TYPES)
  entityType?: AuditEntityType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}