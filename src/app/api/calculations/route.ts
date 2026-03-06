import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Calculation } from '@/entities/Calculation';
import {
  calculateDiscount,
  calculateTax,
  calculateShipping,
  calculateOrder,
  basicCalculate,
} from '@/lib/calculations';
import type {
  DiscountInput,
  TaxInput,
  ShippingInput,
  OrderInput,
  BasicCalcInput,
} from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, input } = body as { type: string; input: unknown };

    if (!type || !input) {
      return NextResponse.json(
        { error: 'Missing type or input' },
        { status: 400 }
      );
    }

    let result: number;
    let resultData: unknown;

    switch (type) {
      case 'basic': {
        const r = basicCalculate(input as BasicCalcInput);
        result = r;
        resultData = { result: r };
        break;
      }
      case 'discount': {
        const r = calculateDiscount(input as DiscountInput);
        result = r.finalPrice;
        resultData = r;
        break;
      }
      case 'tax': {
        const r = calculateTax(input as TaxInput);
        result = r.priceAfterTax;
        resultData = r;
        break;
      }
      case 'shipping': {
        const r = calculateShipping(input as ShippingInput);
        result = r.totalCost;
        resultData = r;
        break;
      }
      case 'order': {
        const r = calculateOrder(input as OrderInput);
        result = r.total;
        resultData = r;
        break;
      }
      default:
        return NextResponse.json(
          { error: 'Unknown calculation type' },
          { status: 400 }
        );
    }

    // Persist to DB
    const ds = await getDataSource();
    const repo = ds.getRepository(Calculation);
    const calc = repo.create({
      type,
      input: JSON.stringify(input),
      result,
    });
    await repo.save(calc);

    return NextResponse.json({ success: true, data: resultData, id: calc.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
