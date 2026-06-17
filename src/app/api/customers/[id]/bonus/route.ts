import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        bons: {
          include: { items: true }
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    let accumulatedPaidOmzet = 0
    let totalBonusesGranted = 0

    for (const bon of customer.bons) {
      if (bon.isBonus) {
        totalBonusesGranted += bon.consumedBonus
      } else if (bon.status === 'Lunas') {
        const subtotalProduk = bon.items.reduce((sum, item) => sum + (item.hargaSetelahDiskon * item.qty), 0)
        accumulatedPaidOmzet += subtotalProduk
      }
    }

    let bonusesEarned = 0
    if (customer.bonusThreshold > 0) {
      bonusesEarned = Math.floor(accumulatedPaidOmzet / customer.bonusThreshold)
    }

    const availableBonuses = Math.max(0, bonusesEarned - totalBonusesGranted)
    const carryOver = customer.bonusThreshold > 0 ? (accumulatedPaidOmzet % customer.bonusThreshold) : 0

    return NextResponse.json({
      accumulatedPaidOmzet,
      threshold: customer.bonusThreshold,
      totalBonusesGranted,
      bonusesEarned,
      availableBonuses,
      carryOver
    })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghitung bonus' }, { status: 500 })
  }
}
