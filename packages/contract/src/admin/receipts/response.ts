import { z } from 'zod';
import { decimalString } from '../../decimal-string.js';

export const AdminReceiptListItemResponse = z.object({
  id: z.number().int(),
  imagePath: z.string().nullable(),
  status: z.string(),
  errorMessage: z.string(),
  createdAt: z.string(),
  boughtOn: z.string(),
  shopName: z.string(),
  statusLabel: z.string(),
  displayDate: z.string(),
});

export const AdminReceiptResponse = z.object({
  id: z.number().int(),
  imagePath: z.string().nullable(),
  status: z.string(),
  errorMessage: z.string(),
  createdAt: z.string(),
  statusLabel: z.string(),
  reading: z.boolean(),
});

export const AdminReceiptsResponse = z.object({
  configured: z.boolean(),
  model: z.string(),
  store: z.number().int().nonnegative().default(0),
  storeName: z.string().default(''),
  receipts: z.array(AdminReceiptListItemResponse),
});
export type AdminReceiptsResponse = z.infer<typeof AdminReceiptsResponse>;

export const AdminReceiptDuplicatesResponse = z.object({
  groups: z.array(
    z.object({
      shopName: z.string(),
      boughtOn: z.string(),
      count: z.number().int(),
      receipts: z.array(AdminReceiptListItemResponse),
    }),
  ),
});
export type AdminReceiptDuplicatesResponse = z.infer<typeof AdminReceiptDuplicatesResponse>;

export const AdminReceiptIdResponse = z.object({
  id: z.number().int(),
});
export type AdminReceiptIdResponse = z.infer<typeof AdminReceiptIdResponse>;

const store = z.object({
  id: z.number().int(),
  name: z.string(),
  label: z.string(),
});

const receiptLine = z.object({
  include: z.boolean(),
  productId: z.number().int(),
  productName: z.string(),
  unitId: z.number().int(),
  quantity: z.string(),
  amount: z.string(),
  receiptName: z.string(),
  vatType: z.string(),
  unitPrice: z.string(),
  discount: z.string(),
  ean: z.string(),
});

const receiptView = z.object({
  receiptId: z.number().int(),
  imagePath: z.string(),
  status: z.string(),
  boughtOn: z.string(),
  boughtAt: z.string(),
  notes: z.string(),
  storeId: z.number().int(),
  storeName: z.string(),
  externalId: z.string(),
  streetName: z.string(),
  buildingNumber: z.string(),
  apartmentNumber: z.string(),
  postalCode: z.string(),
  city: z.string(),
  lines: z.array(receiptLine),
  migrated: z.boolean(),
  addressLine: z.string(),
  createStoreUrl: z.string(),
});

export const AdminReceiptStatusResponse = z.object({
  kind: z.literal('status'),
  receipt: AdminReceiptResponse,
});

export const AdminReceiptShowResponse = z.object({
  kind: z.literal('show'),
  receipt: AdminReceiptResponse,
  purchases: z.array(
    z.object({
      id: z.number().int(),
      productId: z.number().int(),
      quantity: decimalString,
      amount: decimalString,
      productName: z.string(),
      unitName: z.string(),
      imagePath: z.string().nullable(),
    }),
  ),
  boughtOn: z.string(),
  notes: z.string(),
  store,
  symbol: z.string(),
});

export const AdminReceiptReviewResponse = z.object({
  kind: z.literal('review'),
  view: receiptView,
  products: z.array(z.object({ id: z.number().int(), name: z.string(), unitName: z.string() })),
  units: z.array(z.object({ id: z.number().int(), name: z.string() })),
  stores: z.array(store),
  symbol: z.string(),
  currency: z.string(),
});

export const AdminReceiptDetailResponse = z.discriminatedUnion('kind', [
  AdminReceiptStatusResponse,
  AdminReceiptShowResponse,
  AdminReceiptReviewResponse,
]);
export type AdminReceiptDetailResponse = z.infer<typeof AdminReceiptDetailResponse>;

export const AdminReceiptEditResponse = z.object({
  receipt: AdminReceiptResponse,
  boughtOn: z.string(),
  store,
  stores: z.array(store),
});
export type AdminReceiptEditResponse = z.infer<typeof AdminReceiptEditResponse>;

export const AdminReceiptConfirmedResponse = z.object({
  id: z.number().int(),
  imported: z.number().int(),
});
export type AdminReceiptConfirmedResponse = z.infer<typeof AdminReceiptConfirmedResponse>;

export const AdminReceiptDeletedResponse = z.object({
  ok: z.literal(true),
});
export type AdminReceiptDeletedResponse = z.infer<typeof AdminReceiptDeletedResponse>;
