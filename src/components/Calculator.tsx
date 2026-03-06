'use client';

import { useState } from 'react';
import type { BasicCalcInput } from '@/types';

interface Props {
  onCalculation: () => void;
}

export default function Calculator({ onCalculation }: Props) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [operation, setOperation] = useState<BasicCalcInput['operation']>('add');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const operationLabels: Record<BasicCalcInput['operation'], string> = {
    add: 'Addition (+)',
    subtract: 'Subtraction (−)',
    multiply: 'Multiplication (×)',
    divide: 'Division (÷)',
  };

  const operationSymbols: Record<BasicCalcInput['operation'], string> = {
    add: '+',
    subtract: '−',
    multiply: '×',
    divide: '÷',
  };

  async function handleCalculate() {
    setError('');
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (isNaN(numA) || isNaN(numB)) {
      setError('Please enter valid numbers.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'basic',
          input: { a: numA, b: numB, operation },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Calculation failed');
      setResult(data.data.result);
      onCalculation();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setA('');
    setB('');
    setOperation('add');
    setResult(null);
    setError('');
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Basic Calculator</h2>
        <p className="text-sm text-gray-500 mt-1">
          Perform quick arithmetic operations on prices and values.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="calc-label">First Value (A)</label>
          <input
            type="number"
            className="calc-input"
            placeholder="e.g. 100.00"
            value={a}
            onChange={(e) => setA(e.target.value)}
          />
        </div>
        <div>
          <label className="calc-label">Second Value (B)</label>
          <input
            type="number"
            className="calc-input"
            placeholder="e.g. 25.00"
            value={b}
            onChange={(e) => setB(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="calc-label">Operation</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(operationLabels) as BasicCalcInput['operation'][]).map(
            (op) => (
              <button
                key={op}
                onClick={() => setOperation(op)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  operation === op
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {operationLabels[op]}
              </button>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <button
          className="calc-btn"
          onClick={handleCalculate}
          disabled={loading}
        >
          {loading ? 'Calculating…' : 'Calculate'}
        </button>
        <button className="calc-btn-secondary" onClick={handleReset}>
          Reset
        </button>
      </div>

      {result !== null && (
        <div className="result-card">
          <p className="text-sm text-blue-700 font-medium mb-2">Result</p>
          <div className="text-3xl font-bold text-blue-900">
            {a} {operationSymbols[operation]} {b} ={' '}
            <span className="text-blue-600">{result}</span>
          </div>
        </div>
      )}
    </div>
  );
}
