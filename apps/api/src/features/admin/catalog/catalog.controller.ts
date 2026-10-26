import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors, SerializeOptions } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { z } from 'zod';
import { AdminCatalogHandler } from './catalog.handler.js';
import {
  ProductId,
  PurchaseId,
  MergeRequest,
  ProductRequest,
  PurchaseRequest,
  UnitIdRequest,
  AdminCatalogBlankResponse,
  AdminCatalogChangeUnitResponse,
  AdminCatalogIdResponse,
  AdminCatalogMergeOptionsResponse,
  AdminCatalogMergePlanResponse,
  AdminCatalogOkResponse,
  AdminCatalogPurchaseDeletedResponse,
  AdminCatalogPurchaseFormResponse,
  AdminCatalogPurchaseResponse,
  AdminCatalogPurchaseUpdatedResponse,
  AdminCatalogShowResponse,
} from '@cowkoszyku/contract/admin/catalog';

@Controller()
export class AdminCatalogController {
  constructor(private readonly handler: AdminCatalogHandler) {}

  @Get('/api/admin/products/new')
  @SerializeOptions({ schema: AdminCatalogBlankResponse })
  blank() {
    return this.handler.blank();
  }

  @Get('/api/admin/products/:id')
  @SerializeOptions({ schema: AdminCatalogShowResponse })
  show(@Param('id', { schema: ProductId }) productId: number) {
    return this.handler.show(productId);
  }

  @Get('/api/admin/products/:id/edit')
  @SerializeOptions({ schema: AdminCatalogBlankResponse })
  edit(@Param('id', { schema: ProductId }) productId: number) {
    return this.handler.edit(productId);
  }

  @Post('/api/admin/products')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage(), limits: { fileSize: 6 << 20 } }))
  @SerializeOptions({ schema: AdminCatalogIdResponse })
  create(
    @Body({ schema: ProductRequest }) body: z.infer<typeof ProductRequest>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.handler.create(body, file);
  }

  @Patch('/api/admin/products/:id')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage(), limits: { fileSize: 6 << 20 } }))
  @SerializeOptions({ schema: AdminCatalogIdResponse })
  update(
    @Param('id', { schema: ProductId }) productId: number,
    @Body({ schema: ProductRequest }) body: z.infer<typeof ProductRequest>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.handler.update(productId, body, file);
  }

  @Delete('/api/admin/products/:id')
  @SerializeOptions({ schema: AdminCatalogOkResponse })
  remove(@Param('id', { schema: ProductId }) productId: number) {
    return this.handler.remove(productId);
  }

  @Get('/api/admin/products/:id/change-unit')
  @SerializeOptions({ schema: AdminCatalogChangeUnitResponse })
  changeUnitForm(@Param('id', { schema: ProductId }) productId: number) {
    return this.handler.changeUnitForm(productId);
  }

  @Post('/api/admin/products/:id/change-unit')
  @SerializeOptions({ schema: AdminCatalogIdResponse })
  changeUnit(
    @Param('id', { schema: ProductId }) productId: number,
    @Body({ schema: UnitIdRequest }) body: z.infer<typeof UnitIdRequest>,
  ) {
    return this.handler.changeUnit(productId, body);
  }

  @Get('/api/admin/products/:id/merge')
  @SerializeOptions({ schema: AdminCatalogMergeOptionsResponse })
  mergeOptions(@Param('id', { schema: ProductId }) productId: number) {
    return this.handler.mergeOptions(productId);
  }

  @Get('/api/admin/products/:id/merge/:into')
  @SerializeOptions({ schema: AdminCatalogMergePlanResponse })
  mergePlan(
    @Param('id', { schema: ProductId }) productId: number,
    @Param('into', { schema: ProductId }) intoId: number,
  ) {
    return this.handler.mergePlan(productId, intoId);
  }

  @Post('/api/admin/products/:id/merge')
  @SerializeOptions({ schema: AdminCatalogIdResponse })
  merge(
    @Param('id', { schema: ProductId }) productId: number,
    @Body({ schema: MergeRequest }) body: z.infer<typeof MergeRequest>,
  ) {
    return this.handler.merge(productId, body);
  }

  @Get('/api/admin/products/:id/purchases/new')
  @SerializeOptions({ schema: AdminCatalogPurchaseFormResponse })
  newPurchase(@Param('id', { schema: ProductId }) productId: number) {
    return this.handler.newPurchase(productId);
  }

  @Post('/api/admin/products/:id/purchases')
  @SerializeOptions({ schema: AdminCatalogPurchaseResponse })
  createPurchase(
    @Param('id', { schema: ProductId }) productId: number,
    @Body({ schema: PurchaseRequest }) body: z.infer<typeof PurchaseRequest>,
  ) {
    return this.handler.createPurchase(productId, body);
  }

  @Get('/api/admin/purchases/:id')
  @SerializeOptions({ schema: AdminCatalogPurchaseFormResponse })
  purchase(@Param('id', { schema: PurchaseId }) purchaseId: number) {
    return this.handler.purchase(purchaseId);
  }

  @Patch('/api/admin/purchases/:id')
  @SerializeOptions({ schema: AdminCatalogPurchaseUpdatedResponse })
  updatePurchase(
    @Param('id', { schema: PurchaseId }) purchaseId: number,
    @Body({ schema: PurchaseRequest }) body: z.infer<typeof PurchaseRequest>,
  ) {
    return this.handler.updatePurchase(purchaseId, body);
  }

  @Delete('/api/admin/purchases/:id')
  @SerializeOptions({ schema: AdminCatalogPurchaseDeletedResponse })
  removePurchase(@Param('id', { schema: PurchaseId }) purchaseId: number) {
    return this.handler.removePurchase(purchaseId);
  }
}
