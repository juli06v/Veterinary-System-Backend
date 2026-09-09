import { applyDecorators, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/*
 * REFACTORIZACIÓN 2 - DAJUMA
 * -----------------------------------------
 * Se creó un decorador personalizado para centralizar
 * la configuración de seguridad utilizada por los
 * endpoints que solamente pueden ser utilizados por
 * usuarios con rol ADMIN.
 *
 * Antes era necesario repetir:
 *
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('ADMIN')
 *
 * en cada método del controlador.
 *
 * Ahora ambas configuraciones se pueden reemplazar
 * por:
 *
 * @AdminOnly()
 *
 * Esto reduce la duplicación y facilita el mantenimiento
 * de las reglas de autorización.
 */

export function AdminOnly() {
    return applyDecorators(
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('ADMIN'),
    );
}