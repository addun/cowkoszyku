import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UploadedFiles, UseInterceptors, SerializeOptions } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import type { z } from 'zod';
import {
  ReceiptId,
  ReceiptFormRequest,
  ReceiptsListRequest,
  ReceiptVisitRequest,
  AdminReceiptConfirmedResponse,
  AdminReceiptDeletedResponse,
  AdminReceiptDetailResponse,
  AdminReceiptDuplicatesResponse,
  AdminReceiptEditResponse,
  AdminReceiptIdResponse,
  AdminReceiptsResponse,
} from '@cowkoszyku/contract/admin/receipts';
import { AdminReceiptsHandler } from './receipts.handler.js';

@Controller()
export class AdminReceiptsController {
  constructor(private readonly handler: AdminReceiptsHandler) {}

  @Get('/api/admin/receipts')
  @SerializeOptions({ schema: AdminReceiptsResponse })
  list(@Query({ schema: ReceiptsListRequest }) query: z.infer<typeof ReceiptsListRequest>) {
    return this.handler.list(query);
  }

  @Get('/api/admin/receipts/duplicates')
  @SerializeOptions({ schema: AdminReceiptDuplicatesResponse })
  duplicates() {
    return this.handler.duplicates();
  }

  @Post('/api/admin/receipts')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'bill', maxCount: 1 },
        { name: 'bill_camera', maxCount: 1 },
      ],
      { storage: memoryStorage(), limits: { fileSize: 12 << 20 } },
    ),
  )
  @SerializeOptions({ schema: AdminReceiptIdResponse })
  upload(
    @UploadedFiles() files: { bill?: Express.Multer.File[]; bill_camera?: Express.Multer.File[] },
  ) {
    return this.handler.upload(files);
  }

  @Get('/api/admin/receipts/:id/preview')
  preview(@Param('id', { schema: ReceiptId }) receiptId: number, @Res() res: Response): void {
    const path = this.handler.previewPath(receiptId);
    if (!path) {
      res.status(404).end();
      return;
    }
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.sendFile(path);
  }

  @Get('/api/admin/receipts/:id')
  @SerializeOptions({ schema: AdminReceiptDetailResponse })
  show(@Param('id', { schema: ReceiptId }) receiptId: number) {
    return this.handler.show(receiptId);
  }

  @Get('/api/admin/receipts/:id/edit')
  @SerializeOptions({ schema: AdminReceiptEditResponse })
  edit(@Param('id', { schema: ReceiptId }) receiptId: number) {
    return this.handler.edit(receiptId);
  }

  @Patch('/api/admin/receipts/:id')
  @SerializeOptions({ schema: AdminReceiptIdResponse })
  updateVisit(
    @Param('id', { schema: ReceiptId }) receiptId: number,
    @Body({ schema: ReceiptVisitRequest }) body: z.infer<typeof ReceiptVisitRequest>,
  ) {
    return this.handler.updateVisit(receiptId, body);
  }

  @Post('/api/admin/receipts/:id/retry')
  @SerializeOptions({ schema: AdminReceiptIdResponse })
  retry(@Param('id', { schema: ReceiptId }) receiptId: number) {
    return this.handler.retry(receiptId);
  }

  @Post('/api/admin/receipts/:id/confirm')
  @SerializeOptions({ schema: AdminReceiptConfirmedResponse })
  confirm(
    @Param('id', { schema: ReceiptId }) receiptId: number,
    @Body({ schema: ReceiptFormRequest }) body: Record<string, string>,
  ) {
    return this.handler.confirm(receiptId, body);
  }

  @Delete('/api/admin/receipts/:id')
  @SerializeOptions({ schema: AdminReceiptDeletedResponse })
  remove(@Param('id', { schema: ReceiptId }) receiptId: number) {
    return this.handler.remove(receiptId);
  }
}
