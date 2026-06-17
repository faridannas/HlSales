import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function validateDiscounts(discounts: { type: string, discount: string }[]) {
  for (const d of discounts) {
    if (!d.discount) continue
    const parts = d.discount.split(',')
    for (const p of parts) {
      const val = parseFloat(p.trim())
      if (isNaN(val) || val < 0 || val > 100) {
        return false
      }
    }
  }
  return true
}

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      where: { isDeleted: false },
      include: { discounts: true },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(customers)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data pelanggan' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, address, bonusThreshold, discounts } = body

    if (!validateDiscounts(discounts)) {
      return NextResponse.json({ error: 'Nilai diskon tidak valid. Harus berupa angka antara 0 dan 100.' }, { status: 400 })
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        address,
        bonusThreshold: parseFloat(bonusThreshold) || 0,
        discounts: {
          create: discounts // Array of { type: 'LM', discount: '10,5' }
        }
      },
      include: { discounts: true }
    })

    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat pelanggan. Pastikan nama unik.' }, { status: 500 })
  }
}
