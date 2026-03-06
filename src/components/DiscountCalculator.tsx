'use client';

import { useState } from 'react';
import type { DiscountResult } from '@/types';

interface Props {
  onCalculation: () => void;
}

export default function DiscountCalculator({ onCalculation }: Props) {
  const [price, setPrice] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    'percentage'
  );
  const [discountValue, setDiscountValue] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [result, setResult] = useState<DiscountResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCalculate() {
    setError('');
    const p = parseFloat(price);
    const d = parseFloat(discountValue);
    const q = parseInt(quantity) || 1;

    if (isNaN(p) || p < 0) { setError('Enter a valid price.'); return; }
    if (isNaN(d) || d < 0) { setError('Enter a valid discount value.'); return; }
    if (discountType === 'percentage' && d > 100) {
      setError('Percentage discount cannot exceed 100%.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'discount',
          input: {
            originalPrice: p,
            discountType,
            discountValue: d,
            quantity: q,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Calculation failed');
      setResult(data.data as DiscountResult);
      onCalculation();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setPrice('');
    setDiscountValue('');
    setQuantity('1');
    setResult(null);
    setError('');
  }

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Discount Calculator</h2>
        <p className="text-sm text-gray-500 mt-1">
          Calculate percentage or fixed discounts on product prices.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="calc-label">Original Price ($)</label>
          <input
            type="number"
            className="calc-input"
            placeholder="e.g. 99.99"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="calc-label">Quantity</label>
          <input
            type="number"
            className="calc-input"
            placeholder="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            step="1"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="calc-label">Discount Type</label>
        <div className="flex gap-3">
          {(['percentage', 'fixed'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setDiscountType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                discountType === t
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t === 'percentage' ? '% Percentage' : '$ Fixed Amount'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="calc-label">
          Discount Value ({discountType === 'percentage' ? '%' : '$'})
        </label>
        <input
          type="number"
          className="calc-input"
          placeholder={discountType === 'percentage' ? 'e.g. 20' : 'e.g. 15.00'}
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          min="0"
          max={discountType === 'percentage' ? 100 : undefined}
          step={discountType === 'percentage' ? '1' : '0.01'}
        />
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <button className="calc-btn" onClick={handleCalculate} disabled={loading}>
          {loading ? 'Calculating…' : 'Calculate Discount'}
        </button>
        <button className="calc-btn-secondary" onClick={handleReset}>
          Reset
        </button>
      </div>

      {result && (
        <div className="result-card">
          <p className="text-sm text-blue-700 font-medium mb-3">Discount Breakdown</p>
          <div className="space-y-1">
            <div className="result-row">
              <span className="text-gray-600">Original Price</span>
              <span className="font-medium">{fmt(result.originalPrice)}</span>
            </div>
            <div className="result-row">
              <span className="text-gray-600">Discount Amount</span>
              <span className="font-medium text-red-600">− {fmt(result.discountAmount)}</span>
            </div>
            <div className="result-row">
              <span className="text-gray-600">Savings</span>
              <span className="font-medium text-green-600">
                {result.savingsPercentage.toFixed(1)}% off
              </span>
            </div>
          </div>
          <div className="result-total">
            <span className="text-gray-900">Final Price</span>
            <span className="text-blue-700 text-xl">{fmt(result.finalPrice)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
