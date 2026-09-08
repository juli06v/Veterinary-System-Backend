import {
  IsString,
  IsOptional,
  IsUUID,
  IsIn,
  IsObject,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import {
  AUDIT_ACTIONS,
  AuditAction,
  AUDIT_ENTITY_TYPES,
  AuditEntityType,
  USER_ROLES,
  UserRole,
} from '../audit.constants';

export class CreateAuditEventDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(AUDIT_ACTIONS)
  action: AuditAction;

  @IsOptional()
  @IsUUID()
  userId?: string | null;

  @IsOptional()
  @IsString()
  @IsIn(USER_ROLES)
  userRole?: UserRole | null;

  @IsString()
  @IsNotEmpty()
  @IsIn(AUDIT_ENTITY_TYPES)
  entityType: AuditEntityType;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsObject()
  @IsNotEmpty()
  details: Record<string, any>;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ipAddress?: string;

  @IsDateString()
  timestamp: string;
}