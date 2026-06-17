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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, phone, address, bonusThreshold, discounts } = body

    if (!validateDiscounts(discounts)) {
      return NextResponse.json({ error: 'Nilai diskon tidak valid. Harus berupa angka antara 0 dan 100.' }, { status: 400 })
    }

    await prisma.customerDiscount.deleteMany({
      where: { customerId: params.id }
    })

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name,
        phone,
        address,
        bonusThreshold: parseFloat(bonusThreshold) || 0,
        discounts: { create: discounts }
      },
      include: { discounts: true }
    })

    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui pelanggan' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Soft delete per AC-2.3
    await prisma.customer.update({
      where: { id: params.id },
      data: { isDeleted: true }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus pelanggan' }, { status: 500 })
  }
}
