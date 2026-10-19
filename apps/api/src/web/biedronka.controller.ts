import { Controller, Get, Logger, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { DuplicateError, InvalidStoreError, InvalidUnitError } from '../domain/errors.js';
import { billFromBiedronka, type BiedronkaTx } from '../imports/biedronka.js';
import { biedronkaReceipt } from '../imports/biedronka.schema.js';
import { marshalBill } from '../ocr/types.js';
import { AliasesRepository } from '#app/store/aliases';
import { LocationsRepository } from '#app/store/locations';
import { ProductsRepository } from '#app/store/products';
import { RECEIPT_SOURCE_BIEDRONKA, ReceiptsRepository } from '#app/store/receipts';
import { UnitsRepository } from '#app/store/units';
import { billToImport, hydrateBill, matchStore, storeChainID } from './receipt-form.js';
import { biedronkaImportBody } from './schema.js';

@Controller()
export class BiedronkaController {
  private readonly log = new Logger('Biedronka');

  constructor(
    private readonly receipts: ReceiptsRepository,
    private readonly products: ProductsRepository,
    private readonly aliases: AliasesRepository,
    private readonly locations: LocationsRepository,
    private readonly units: UnitsRepository,
  ) {}

  @Get('api/biedronka/imported')
  biedronkaImported(@Res() res: Response): void {
    res.json(this.biedronkaImportedState());
  }

  @Post('api/biedronka/import')
  biedronkaImport(@Req() req: Request, @Res() res: Response): void {
    const parsed = biedronkaImportBody.safeParse(req.body);
    if (!parsed.success) {
      const idIssue = parsed.error.issues.some((issue) => issue.path[0] === 'id');
      res.status(400).json({ error: idIssue ? 'invalid id' : 'invalid bill' });
      return;
    }
    const body = parsed.data;
    const id = body.id;
    const tx: BiedronkaTx = {
      id,
      date: body.date,
      store_name: body.store_name,
      receipt_num: body.receipt_num,
      total_price: body.total_price,
    };
    const kind = receiptKind(body.receipt);
    this.log.log(`import ${id}: ${tx.date} ${tx.store_name} ${tx.total_price} kind=${kind}`);
    let bill;
    try {
      bill = billFromBiedronka(body.receipt, tx);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log.warn(`import ${id}: bill failed (${kind}): ${msg}`);
      res.status(422).json({ error: msg, id });
      return;
    }
    this.log.log(`import ${id}: ${bill.lines.length} lines`);
    try {
      const products = this.products.listProducts('');
      const stores = this.locations.listStores();
      const aliases = this.aliases.listAliases();
      const defaults = this.units.unitDefaults();
      if (bill.storeId === 0) bill.storeId = matchStore(bill, stores);
      bill = hydrateBill(bill, products, aliases, storeChainID(bill.storeId, stores), defaults.pieceId, defaults.weightId);
    } catch (err) {
      this.log.warn(`import ${id}: catalog failed: ${err instanceof Error ? err.message : String(err)}`);
      res.status(500).json({ error: 'could not load the catalog', id });
      return;
    }
    let inn;
    try {
      inn = billToImport(bill);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log.warn(`import ${id}: import lines failed: ${msg}`);
      res.status(422).json({ error: msg, id });
      return;
    }
    if (inn.lines.length === 0) {
      this.log.warn(`import ${id}: no product lines`);
      res.status(422).json({ error: 'no products found on this bill', id });
      return;
    }
    let rawJSON: string;
    try {
      rawJSON = marshalBill(bill);
    } catch {
      this.log.warn(`import ${id}: could not marshal bill`);
      res.status(500).json({ error: 'could not save the bill' });
      return;
    }
    let receipt;
    let purchases = 0;
    try {
      const out = this.receipts.importTrustedReceipt(null, RECEIPT_SOURCE_BIEDRONKA, id, inn, rawJSON);
      receipt = out.receipt;
      purchases = out.result.purchases;
    } catch (err) {
      if (err instanceof DuplicateError) {
        if (this.receipts.listReceiptExternalIDs(RECEIPT_SOURCE_BIEDRONKA).includes(id)) {
          this.log.log(`import ${id}: skipped duplicate`);
          res.status(200).json({ status: 'skipped', id });
          return;
        }
        this.log.warn(`import ${id}: catalog clash`);
        res.status(422).json({ error: 'could not save this bill', id });
        return;
      }
      const msg = err instanceof Error ? err.message : String(err);
      if (err instanceof InvalidUnitError) {
        this.log.warn(`import ${id}: missing unit defaults`);
        res.status(422).json({ error: 'Set piece and weight units under Settings, then import again.', id });
        return;
      }
      if (err instanceof InvalidStoreError) {
        this.log.warn(`import ${id}: store failed: ${msg}`);
        res.status(422).json({ error: 'could not save the store', id });
        return;
      }
      this.log.warn(`import ${id}: could not save the receipt: ${msg}`);
      res.status(500).json({ error: 'could not save the receipt' });
      return;
    }
    this.log.log(`import ${id}: imported receipt_id=${receipt.id} purchases=${purchases}`);
    res.status(200).json({ status: 'imported', id, receipt_id: receipt.id, purchases });
  }

  private biedronkaImportedState(): { ids: string[]; since: string } {
    let ids: string[];
    try {
      ids = this.receipts.listReceiptExternalIDs(RECEIPT_SOURCE_BIEDRONKA);
    } catch {
      ids = [];
    }
    if (!ids) ids = [];
    const since = this.receipts.latestSourcedBoughtOn(RECEIPT_SOURCE_BIEDRONKA);
    return { ids, since };
  }
}

function receiptKind(receipt: unknown): string {
  if (biedronkaReceipt.safeParse(receipt).success) return 'details';
  if (Array.isArray(receipt)) return 'till';
  return 'other';
}


