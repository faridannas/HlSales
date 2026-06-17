import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { transactionIds, lunasDate } = body

    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return NextResponse.json({ error: 'Tidak ada transaksi yang dipilih' }, { status: 400 })
    }

    await prisma.bon.updateMany({
      where: { 
        id: { in: transactionIds },
        status: 'Piutang' // Hanya bisa melunasi yang masih piutang
      },
      data: {
        status: 'Lunas',
        lunasDate: new Date(lunasDate)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal melakukan pelunasan' }, { status: 500 })
  }
}
