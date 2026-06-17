import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const transactions = await prisma.bon.findMany({
      include: {
        customer: true,
        items: {
          include: { product: true }
        }
      },
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data transaksi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nomorBon, date, description, customerId, ongkir, items, isBonus, consumedBonus } = body

    // items contains: [{ productId, qty, hargaModal, hargaJual, diskonCascading, hargaSetelahDiskon }]
    const transaction = await prisma.bon.create({
      data: {
        nomorBon,
        date: date ? new Date(date) : new Date(),
        description,
        customerId,
        ongkir: parseFloat(ongkir) || 0,
        status: isBonus ? 'Lunas' : 'Piutang', // Bonus is automatically "Lunas" (or doesn't matter)
        isBonus: isBonus || false,
        consumedBonus: parseInt(consumedBonus) || 0,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            qty: parseInt(item.qty),
            hargaModal: isBonus ? 0 : parseFloat(item.hargaModal), // AC-5.7 cost ignored in profit
            hargaJual: parseFloat(item.hargaJual),
            diskonCascading: isBonus ? 'BONUS' : (item.diskonCascading || ''),
            hargaSetelahDiskon: isBonus ? 0 : parseFloat(item.hargaSetelahDiskon) // AC-5.7 free products
          }))
        }
      },
      include: {
        customer: true,
        items: true
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Gagal membuat transaksi. Nomor Bon mungkin sudah dipakai.' }, { status: 500 })
  }
}
