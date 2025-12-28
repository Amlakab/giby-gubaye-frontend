'use client';

import Calculator from '@/components/Calculator'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scientific Calculator | Tepi Giby Gubaye',
  description: 'Advanced scientific calculator with mathematical functions',
}

export default function CalculatorPage() {
  return <Calculator />
}