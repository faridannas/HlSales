import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const transactions = await prisma.bon.findMany({
      include: { items: true }
    })

    let totalPiutang = 0
    let totalOmzetLunas = 0
    let totalLabaLunas = 0
    let pendingTransactionsCount = 0
    let completedTransactionsCount = 0

    for (const bon of transactions) {
      // Subtotal produk tanpa ongkir
      const subtotalProduk = bon.items.reduce((sum, item) => sum + (item.hargaSetelahDiskon * item.qty), 0)
      // Total piutang yang harus dibayar customer termasuk ongkir
      const totalTagihan = subtotalProduk + bon.ongkir
      // Laba kotor (harga jual akhir - harga modal) dikali qty
      const laba = bon.items.reduce((sum, item) => sum + ((item.hargaSetelahDiskon - item.hargaModal) * item.qty), 0)

      if (bon.status === 'Piutang') {
        totalPiutang += totalTagihan
        pendingTransactionsCount++
      } else if (bon.status === 'Lunas') {
        totalOmzetLunas += subtotalProduk // Omzet = total produk terjual (tanpa ongkir)
        totalLabaLunas += laba // Laba bersih dari selisih modal
        completedTransactionsCount++
      }
    }

    return NextResponse.json({
      totalPiutang,
      totalOmzetLunas,
      totalLabaLunas,
      pendingTransactionsCount,
      completedTransactionsCount
    })

  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat statistik dashboard' }, { status: 500 })
  }
}
