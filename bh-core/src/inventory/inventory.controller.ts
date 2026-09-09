import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { Request } from 'express';

import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { InventoryService } from './inventory.service';
import {
  CreateProductDto,
  ProductType,
} from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

const VALID_TYPES = Object.values(ProductType) as string[];

interface AuthenticatedRequest extends Request {
  user?: {
    codigo?: string;
    rol?: string;
  };
}

interface RequestContext {
  codigo?: string;
  rol?: string;
  ip: string;
}

@Controller('inventory')
export class InventoryController {
  constructor(
      private readonly inventoryService: InventoryService,
  ) {}

  @Post('products')
  @AdminOnly()
  async createProduct(
      @Body() body: CreateProductDto,
      @Req() req: AuthenticatedRequest,
  ) {
    /*
     * REFACTORIZACIÓN 1 - DAJUMA
     * -----------------------------------------
     * Se eliminó la construcción manual del objeto
     * que repetía los mismos atributos de CreateProductDto.
     *
     * Como 'body' ya tiene el tipo CreateProductDto,
     * no es necesario crear nuevamente el objeto.
     */

    this.validateCreatePayload(body);

    const context = this.getRequestContext(req);

    return this.inventoryService.createProduct(
        body,
        context.codigo,
        context.rol,
        context.ip,
    );
  }

  // Legacy alias kept for backwards compatibility with the previous controller
  // contract (POST /inventory). New consumers MUST use POST /inventory/products.
  @Post()
  @AdminOnly()
  async createLegacy(
      @Body() body: Record<string, any>,
      @Req() req: AuthenticatedRequest,
  ) {
    const type = (body.type ?? body.category) as string | undefined;

    /*
     * REFACTORIZACIÓN 1 - DAJUMA
     * -----------------------------------------
     * Se utiliza un método independiente para
     * construir el payload del producto.
     *
     * Esto mantiene separada la transformación
     * de los datos de la lógica principal.
     */

    const payload = this.buildCreateProductPayload({
      name: body.name,
      type: type as ProductType,
      stock: body.stock,
      minStock: body.minStock,
      price: body.price,
      expirationDate: body.expirationDate,
    });

    this.validateCreatePayload(payload);

    const context = this.getRequestContext(req);

    return this.inventoryService.createProduct(
        payload,
        context.codigo,
        context.rol,
        context.ip,
    );
  }

  @Get('products')
  @AdminOnly()
  async listProducts(@Query('type') type?: string) {
    this.validateOptionalType(type);

    return this.inventoryService.findAll(type);
  }

  @Get()
  @AdminOnly()
  async findAll(
      @Query('type') type?: string,
      @Query('category') category?: string,
  ) {
    const effective = type ?? category;

    this.validateOptionalType(effective);

    return this.inventoryService.findAll(effective);
  }

  @Get('low-stock')
  @AdminOnly()
  async getLowStock(@Query('type') type?: string) {
    this.validateOptionalType(type);

    return this.inventoryService.getLowStock(type);
  }

  @Get('expiring')
  @AdminOnly()
  async getExpiring(@Query('type') type?: string) {
    this.validateOptionalType(type);

    return this.inventoryService.getExpiringSoon(30, type);
  }

  @Get('alerts')
  @AdminOnly()
  async getAlerts() {
    return this.inventoryService.getAlerts();
  }

  @Get('products/:id')
  @AdminOnly()
  async findProduct(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Get(':id')
  @AdminOnly()
  async findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch('products/:id/stock')
  @AdminOnly()
  async adjustStockNew(
      @Param('id') id: string,
      @Body() body: AdjustStockDto,
      @Req() req: AuthenticatedRequest,
  ) {
    this.validateAdjustStockPayload(body);

    const context = this.getRequestContext(req);

    return this.inventoryService.adjustStock(
        id,
        body.quantity,
        body.reason,
        context.codigo,
        context.rol,
        context.ip,
    );
  }

  @Patch('products/:id')
  @AdminOnly()
  async updateProduct(
      @Param('id') id: string,
      @Body() body: UpdateProductDto,
      @Req() req: AuthenticatedRequest,
  ) {
    this.validateUpdatePayload(body);

    const context = this.getRequestContext(req);

    return this.inventoryService.updateProduct(
        id,
        body,
        context.codigo,
        context.rol,
        context.ip,
    );
  }

  @Patch(':id/adjust-stock')
  @AdminOnly()
  async adjustStockLegacy(
      @Param('id') id: string,
      @Body() body: AdjustStockDto,
      @Req() req: AuthenticatedRequest,
  ) {
    this.validateAdjustStockPayload(body);

    const context = this.getRequestContext(req);

    return this.inventoryService.adjustStock(
        id,
        body.quantity,
        body.reason,
        context.codigo,
        context.rol,
        context.ip,
    );
  }

  @Patch(':id')
  @AdminOnly()
  async updateLegacy(
      @Param('id') id: string,
      @Body() body: UpdateProductDto,
      @Req() req: AuthenticatedRequest,
  ) {
    this.validateUpdatePayload(body);

    const context = this.getRequestContext(req);

    return this.inventoryService.updateProduct(
        id,
        body,
        context.codigo,
        context.rol,
        context.ip,
    );
  }

  /*
   * REFACTORIZACIÓN 1 - DAJUMA
   * -----------------------------------------
   * Método extraído para centralizar la construcción
   * del payload utilizado para crear productos.
   *
   * Se separa esta responsabilidad del método
   * createLegacy() para mantenerlo más organizado.
   */
  private buildCreateProductPayload(
      body: CreateProductDto,
  ): CreateProductDto {
    return {
      name: body.name,
      type: body.type,
      stock: body.stock,
      minStock: body.minStock,
      price: body.price,
      expirationDate: body.expirationDate,
    };
  }

  /*
   * REFACTORIZACIÓN 3 - DAJUMA
   * -----------------------------------------
   * Se creó este método para centralizar la obtención
   * de la información del usuario autenticado y de la
   * dirección IP de la petición.
   *
   * Antes se repetía en varios métodos:
   *
   * req.user?.codigo
   * req.user?.rol
   * req.ip
   *
   * Ahora se obtiene una sola estructura mediante
   * getRequestContext().
   *
   * Esto reduce la repetición y hace que los métodos
   * del controlador sean más fáciles de leer.
   */
  private getRequestContext(
      req: AuthenticatedRequest,
  ): RequestContext {
    return {
      codigo: req.user?.codigo,
      rol: req.user?.rol,
      ip: req.ip,
    };
  }

  /*
   * REFACTORIZACIÓN 5 - DAJUMA
   * -----------------------------------------
   * Se centralizó la validación del tipo de producto.
   *
   * Antes la comprobación de VALID_TYPES se realizaba
   * directamente en diferentes métodos de validación.
   *
   * Ahora todos los métodos pueden utilizar
   * validateProductType() para realizar la misma
   * validación desde un único lugar.
   */
  private validateProductType(type: string) {
    if (!VALID_TYPES.includes(type)) {
      throw new BadRequestException(
          `type debe ser uno de: ${VALID_TYPES.join(', ')}`,
      );
    }
  }

  private validateOptionalType(type?: string) {
    if (type !== undefined) {
      this.validateProductType(type);
    }
  }

  /*
   * REFACTORIZACIÓN 4 - DAJUMA
   * -----------------------------------------
   * Se crearon métodos auxiliares para centralizar
   * las validaciones numéricas.
   *
   * Esto evita repetir las mismas comprobaciones
   * de tipo, enteros y valores negativos en diferentes
   * partes del controlador.
   *
   * validateNonNegativeNumber() se utiliza para
   * valores como price.
   *
   * validateNonNegativeInteger() se utiliza para
   * valores como stock y minStock.
   */

  private validateNonNegativeNumber(
      value: unknown,
      fieldName: string,
  ) {
    if (
        typeof value !== 'number' ||
        value < 0
    ) {
      throw new BadRequestException(
          `${fieldName} debe ser un número no negativo`,
      );
    }
  }

  private validateNonNegativeInteger(
      value: unknown,
      fieldName: string,
  ) {
    if (
        typeof value !== 'number' ||
        !Number.isInteger(value) ||
        value < 0
    ) {
      throw new BadRequestException(
          `${fieldName} debe ser un entero no negativo`,
      );
    }
  }

  private validateCreatePayload(body: CreateProductDto) {
    if (
        !body.name ||
        typeof body.name !== 'string' ||
        body.name.trim() === ''
    ) {
      throw new BadRequestException(
          'name debe ser un texto no vacío',
      );
    }

    /*
     * REFACTORIZACIÓN 5 - DAJUMA
     * Se reutiliza la validación centralizada del tipo.
     */
    this.validateProductType(body.type);

    /*
     * REFACTORIZACIÓN 4 - DAJUMA
     * Se reutilizan los métodos auxiliares para
     * validar los valores numéricos.
     */
    this.validateNonNegativeInteger(
        body.stock,
        'stock',
    );

    this.validateNonNegativeInteger(
        body.minStock,
        'minStock',
    );

    this.validateNonNegativeNumber(
        body.price,
        'price',
    );
  }

  private validateUpdatePayload(body: UpdateProductDto) {
    /*
     * REFACTORIZACIÓN 4 - DAJUMA
     * Se reutiliza el método de validación numérica
     * para evitar repetir la misma condición.
     */
    if (body.price !== undefined) {
      this.validateNonNegativeNumber(
          body.price,
          'price',
      );
    }

    /*
     * REFACTORIZACIÓN 4 - DAJUMA
     * Se reutiliza la validación para enteros
     * no negativos.
     */
    if (body.minStock !== undefined) {
      this.validateNonNegativeInteger(
          body.minStock,
          'minStock',
      );
    }

    /*
     * REFACTORIZACIÓN 5 - DAJUMA
     * Se reutiliza la validación centralizada
     * del tipo de producto.
     */
    if (body.type !== undefined) {
      this.validateProductType(body.type);
    }
  }

  private validateAdjustStockPayload(
      body: AdjustStockDto,
  ) {
    if (
        body?.quantity === undefined ||
        typeof body.quantity !== 'number' ||
        !Number.isInteger(body.quantity)
    ) {
      throw new BadRequestException(
          'quantity debe ser un número entero',
      );
    }

    if (
        body.reason !== undefined &&
        typeof body.reason !== 'string'
    ) {
      throw new BadRequestException(
          'reason debe ser un texto',
      );
    }
  }
}