import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { code, name, type, hargaModal, hargaJual } = body

    const hm = parseFloat(hargaModal)
    const hj = parseFloat(hargaJual)

    if (hm < 0 || hj < 0) {
      return NextResponse.json({ error: 'Harga harus >= 0' }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: { code, name, type, hargaModal: hm, hargaJual: hj }
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui produk' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Soft delete per AC-3.5
    await prisma.product.update({
      where: { id: params.id },
      data: { isDeleted: true }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 })
  }
}
