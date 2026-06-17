import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const month = parseInt(searchParams.get('month') || '-1')
  const year = parseInt(searchParams.get('year') || '-1')

  try {
    const transactions = await prisma.bon.findMany({
      include: {
        customer: true,
        items: { include: { product: true } }
      }
    })

    const filtered = transactions.filter(t => {
      if (month === -1 || year === -1) return true
      const d = new Date(t.date)
      return d.getMonth() === month && d.getFullYear() === year
    })

    return NextResponse.json(filtered)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
