import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    
    // If it's just a status update (from the list page)
    if (Object.keys(body).length === 1 && body.status) {
      const { status } = body
      const data: any = { status }
      if (status === 'Lunas') {
        data.lunasDate = new Date()
      } else {
        data.lunasDate = null
      }
      const transaction = await prisma.bon.update({
        where: { id: params.id },
        data,
      })
      return NextResponse.json(transaction)
    }

    // Full edit (from the edit page)
    const { nomorBon, date, description, customerId, ongkir, items, isBonus, consumedBonus } = body

    // We must use a transaction to delete old items and create new ones safely
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // 1. Delete all existing items
      await tx.bonItem.deleteMany({
        where: { bonId: params.id }
      })

      // 2. Update bon and create new items
      return await tx.bon.update({
        where: { id: params.id },
        data: {
          nomorBon,
          date: date ? new Date(date) : undefined,
          description,
          customerId,
          ongkir: parseFloat(ongkir) || 0,
          isBonus: isBonus || false,
          consumedBonus: parseInt(consumedBonus) || 0,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              qty: parseInt(item.qty),
              hargaModal: isBonus ? 0 : parseFloat(item.hargaModal),
              hargaJual: parseFloat(item.hargaJual),
              diskonCascading: isBonus ? 'BONUS' : (item.diskonCascading || ''),
              hargaSetelahDiskon: isBonus ? 0 : parseFloat(item.hargaSetelahDiskon)
            }))
          }
        },
        include: {
          customer: true,
          items: true
        }
      })
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui transaksi' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.bon.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus transaksi' }, { status: 500 })
  }
}
