
export const AUDIT_ACTIONS = [
  'REGISTRO_USUARIO',
  'VERIFICACION_CORREO',
  'REENVIO_CODIGO_VERIFICACION',
  'APROBACION_CUENTA',
  'RECHAZO_CUENTA',
  'LOGIN_EXITOSO',
  'LOGIN_FALLIDO',
  'CREACION_CITA',
  'CAMBIO_ESTADO_CITA',
  'CANCELACION_CITA',
  'FINALIZACION_CITA',
  'CREACION_HISTORIAL_MEDICO',
  'EDICION_HISTORIAL_MEDICO',
  'REGISTRO_VACUNA',
  'INICIO_HOSPITALIZACION',
  'ALTA_HOSPITALIZACION',
  'CREACION_FACTURA',
  'ANULACION_FACTURA',
  'AJUSTE_INVENTARIO',
  'CREACION_INVENTARIO',
  'ACTUALIZACION_INVENTARIO',
  'DEDUCCION_STOCK_PRESCRIPCION',
  'CREACION_SERVICIO',
  'EDICION_SERVICIO',
  'ACTUALIZACION_PRECIO_SERVICIO',
  'DESACTIVACION_SERVICIO',
  'ACTIVACION_SERVICIO',
  'PAGO_CITA_REGISTRADO',
  'SUSPENSION_USUARIO',
  'REGISTRO_CLIENTE',
  'ACTUALIZACION_CLIENTE',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

/**
 * Lista de tipos de entidad válidos sobre los que puede ocurrir un evento.
 */
export const AUDIT_ENTITY_TYPES = [
  'User',
  'Appointment',
  'MedicalRecord',
  'Vaccination',
  'Hospitalization',
  'Invoice',
  'InventoryProduct',
  'Service',
  'Pet',
  'Payment',
  'Client',
] as const;

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

/**
 * Lista de roles de usuario válidos en el sistema.
 */
export const USER_ROLES = [
  'cliente',
  'recepcionista',
  'veterinario',
  'administrador',
] as const;

export type UserRole = (typeof USER_ROLES)[number];