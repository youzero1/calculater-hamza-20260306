'use client';

import { useState } from 'react';
import type { TaxResult } from '@/types';

interface Props {
  onCalculation: () => void;
}

export default function TaxCalculator({ onCalculation }: Props) {
  const defaultTax =
    typeof process !== 'undefined'
      ? (parseFloat(process.env.DEFAULT_TAX_RATE || '0.08') * 100).toString()
      : '8';

  const [price, setPrice] = useState('');
  const [taxRate, setTaxRate] = useState(defaultTax);
  const [includingTax, setIncludingTax] = useState(false);
  const [result, setResult] = useState<TaxResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCalculate() {
    setError('');
    const p = parseFloat(price);
    const t = parseFloat(taxRate);
    if (isNaN(p) || p < 0) { setError('Enter a valid price.'); return; }
    if (isNaN(t) || t < 0 || t > 100) { setError('Enter a valid tax rate (0-100).'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tax',
          input: { price: p, taxRate: t, includingTax },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Calculation failed');
      setResult(data.data as TaxResult);
      onCalculation();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setPrice('');
    setTaxRate(defaultTax);
    setIncludingTax(false);
    setResult(null);
    setError('');
  }

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Tax / VAT Calculator</h2>
        <p className="text-sm text-gray-500 mt-1">
          Compute sales tax or VAT on product prices.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="calc-label">Price ($)</label>
          <input
            type="number"
            className="calc-input"
            placeholder="e.g. 149.99"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="calc-label">Tax Rate (%)</label>
          <input
            type="number"
            className="calc-input"
            placeholder="e.g. 8"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            min="0"
            max="100"
            step="0.1"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setIncludingTax(!includingTax)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              includingTax ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                includingTax ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            Price already includes tax (extract tax)
          </span>
        </label>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <button className="calc-btn" onClick={handleCalculate} disabled={loading}>
          {loading ? 'Calculating…' : 'Calculate Tax'}
        </button>
        <button className="calc-btn-secondary" onClick={handleReset}>
          Reset
        </button>
      </div>

      {result && (
        <div className="result-card">
          <p className="text-sm text-blue-700 font-medium mb-3">Tax Breakdown</p>
          <div className="space-y-1">
            <div className="result-row">
              <span className="text-gray-600">Price Before Tax</span>
              <span className="font-medium">{fmt(result.priceBeforeTax)}</span>
            </div>
            <div className="result-row">
              <span className="text-gray-600">Tax Rate</span>
              <span className="font-medium">{result.taxRate}%</span>
            </div>
            <div className="result-row">
              <span className="text-gray-600">Tax Amount</span>
              <span className="font-medium text-orange-600">+ {fmt(result.taxAmount)}</span>
            </div>
          </div>
          <div className="result-total">
            <span className="text-gray-900">Price After Tax</span>
            <span className="text-blue-700 text-xl">{fmt(result.priceAfterTax)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
