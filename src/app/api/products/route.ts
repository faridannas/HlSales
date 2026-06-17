import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data produk' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, name, type, hargaModal, hargaJual } = body

    const hm = parseFloat(hargaModal)
    const hj = parseFloat(hargaJual)

    if (hm < 0 || hj < 0) {
      return NextResponse.json({ error: 'Harga harus >= 0' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        code,
        name,
        type,
        hargaModal: hm,
        hargaJual: hj
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat produk. Pastikan kode unik.' }, { status: 500 })
  }
}
