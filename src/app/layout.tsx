import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Calculater – E-Commerce Calculator',
  description:
    'Calculate product prices, discounts, taxes, shipping costs, and order totals for e-commerce.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100">{children}</body>
    </html>
  );
}
