'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { formatRupiah } from '@/lib/utils'
import { Icons } from '@/components/icons'
import Link from 'next/link'

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const router = useRouter()
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Date filtering
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Settlement Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().split('T')[0])
  const [settlingIds, setSettlingIds] = useState<string[]>([]) // Array of Bon IDs to settle
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchCustomer = async () => {
    setLoading(true)
    const res = await fetch(`/api/customers/${id}/details`)
    if (res.ok) {
      setCustomer(await res.json())
    } else {
      alert('Gagal memuat detail pelanggan')
    }
    setLoading(false)
  }

  useEffect(() => { fetchCustomer() }, [id])

  if (loading) return <div style={{padding: '4rem', textAlign: 'center'}}>Memuat data pelanggan...</div>
  if (!customer) return <div style={{padding: '4rem', textAlign: 'center'}}>Pelanggan tidak ditemukan.</div>

  // Filter Bons by Month/Year
  const filteredBons = customer.bons.filter((b: any) => {
    const d = new Date(b.date)
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
  })

  // Calculations for the selected month
  let totalPiutang = 0
  let totalDibayar = 0
  let omzetLM = 0
  let omzetBR = 0
  let totalLabaHL = 0

  filteredBons.forEach((bon: any) => {
    let bonSubtotal = 0 // Excluding ongkir, before applying bonus rule
    let bonOmzetLM = 0
    let bonOmzetBR = 0
    let bonLaba = 0

    bon.items.forEach((item: any) => {
      const lineTotal = item.hargaSetelahDiskon * item.qty
      bonSubtotal += lineTotal
      
      if (!bon.isBonus) {
        if (item.product.type === 'LM') bonOmzetLM += lineTotal
        if (item.product.type === 'BR') bonOmzetBR += lineTotal
        bonLaba += (item.hargaSetelahDiskon - item.hargaModal) * item.qty
      }
    })

    const totalTagihan = bonSubtotal + bon.ongkir

    if (bon.status === 'Piutang') {
      totalPiutang += totalTagihan
    } else if (bon.status === 'Lunas') {
      totalDibayar += totalTagihan
      if (!bon.isBonus) {
        omzetLM += bonOmzetLM
        omzetBR += bonOmzetBR
        totalLabaHL += bonLaba
      }
    }
  })

  const totalOmzet = omzetLM + omzetBR
  const piutangIds = filteredBons.filter((b: any) => b.status === 'Piutang').map((b: any) => b.id)

  const handleSettleMonth = () => {
    if (piutangIds.length === 0) return alert('Tidak ada bon berstatus piutang di bulan ini.')
    setSettlingIds(piutangIds)
    setIsModalOpen(true)
  }

  const handleSettleSingle = (bonId: string) => {
    setSettlingIds([bonId])
    setIsModalOpen(true)
  }

  const confirmSettlement = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const res = await fetch('/api/transactions/settle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionIds: settlingIds, lunasDate: settlementDate })
    })

    if (res.ok) {
      setIsModalOpen(false)
      fetchCustomer() // Refresh calculations instantly (AC-6.7)
    } else {
      alert('Gagal melunasi tagihan.')
    }
    setIsSubmitting(false)
  }

  const handlePrint = () => window.print()

  return (
    <div className="main-content printable-area">
      <div className="page-header no-print">
        <div>
          <h2>Detail Pelanggan: {customer.name}</h2>
          <p style={{ color: 'var(--text-muted)' }}>Ambang Bonus: {formatRupiah(customer.bonusThreshold)}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={handlePrint} style={{ width: 'auto' }}>🖨️ Cetak PDF</button>
          <Link href="/customers"><button className="btn-secondary" style={{ width: 'auto' }}>Kembali</button></Link>
        </div>
      </div>

      <div className="print-only" style={{ display: 'none', marginBottom: '2rem' }}>
        <h2>Laporan Transaksi: {customer.name}</h2>
        <p>Bulan: {selectedMonth + 1} / {selectedYear}</p>
        <hr style={{ borderColor: '#334155' }} />
      </div>

      {/* Month/Year Filter */}
      <div className="glass-panel no-print" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
          <label className="input-label">Pilih Bulan</label>
          <select className="input-field" value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} style={{ appearance: 'auto', backgroundColor: '#1e293b' }}>
            {Array.from({length: 12}).map((_, i) => <option key={i} value={i}>{new Date(0, i).toLocaleString('id-ID', {month: 'long'})}</option>)}
          </select>
        </div>
        <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
          <label className="input-label">Pilih Tahun</label>
          <select className="input-field" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} style={{ appearance: 'auto', backgroundColor: '#1e293b' }}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ color: '#fcd34d', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Piutang Bulan Ini</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatRupiah(totalPiutang)}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ color: '#6ee7b7', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Sudah Dibayar</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatRupiah(totalDibayar)}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ color: '#93c5fd', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Omzet Lunas (LM / BR)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>{formatRupiah(totalOmzet)}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>LM: {formatRupiah(omzetLM)} | BR: {formatRupiah(omzetBR)}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ color: '#c4b5fd', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Laba Bersih HL</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatRupiah(totalLabaHL)}</div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Daftar Transaksi (Bulan Ini)</h3>
          {piutangIds.length > 0 && (
            <button className="btn-success no-print" onClick={handleSettleMonth} style={{ width: 'auto', padding: '0.5rem 1rem' }}>
              ✅ Lunasi Seluruh Piutang Bulan Ini
            </button>
          )}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nomor Bon</th>
                <th>Tanggal Bon</th>
                <th>Tipe</th>
                <th>Total Tagihan</th>
                <th>Status</th>
                <th className="no-print">Aksi Pelunasan</th>
              </tr>
            </thead>
            <tbody>
              {filteredBons.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>Tidak ada transaksi di bulan ini.</td></tr>
              ) : (
                filteredBons.map((b: any) => {
                  const tagihan = b.items.reduce((sum: number, i: any) => sum + (i.hargaSetelahDiskon * i.qty), 0) + b.ongkir
                  return (
                    <tr key={b.id} style={{ opacity: b.status === 'Lunas' ? 0.7 : 1 }}>
                      <td style={{fontWeight: 600}}>
                        <Link href={`/transactions/${b.id}/edit`} className="no-print" style={{ color: '#3b82f6', textDecoration: 'underline' }}>{b.nomorBon}</Link>
                        <span className="print-only" style={{display: 'none'}}>{b.nomorBon}</span>
                        {b.isBonus && <span className="badge success" style={{marginLeft: '0.5rem'}}>BONUS</span>}
                      </td>
                      <td>{new Date(b.date).toLocaleDateString('id-ID')}</td>
                      <td>
                        {b.isBonus ? <span style={{color: '#10b981'}}>Gratis</span> : <span>Reguler</span>}
                      </td>
                      <td style={{fontWeight: 600}}>{formatRupiah(tagihan)}</td>
                      <td>
                        {b.status === 'Lunas' ? (
                          <span className="badge success">LUNAS {b.lunasDate ? `(${new Date(b.lunasDate).toLocaleDateString('id-ID')})` : ''}</span>
                        ) : (
                          <span className="badge" style={{background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d'}}>PIUTANG</span>
                        )}
                      </td>
                      <td className="no-print">
                        {b.status === 'Piutang' && (
                          <button className="btn-success" onClick={() => handleSettleSingle(b.id)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Lunasi Bon Ini</button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settlement Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Konfirmasi Pelunasan (Settlement)</h3>
              <button onClick={() => setIsModalOpen(false)} style={{background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer'}}>&times;</button>
            </div>
            <form onSubmit={confirmSettlement}>
              <div className="modal-body">
                <p style={{marginBottom: '1rem', color: 'var(--text-muted)'}}>
                  Anda akan melunasi <strong>{settlingIds.length}</strong> transaksi. Omzet dan Laba dari transaksi ini akan langsung diakui dalam laporan Cash Basis.
                </p>
                <div className="input-group">
                  <label className="input-label">Tanggal Pembayaran (Pelunasan) *</label>
                  <input type="date" required className="input-field" value={settlementDate} onChange={e => setSettlementDate(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} style={{width: 'auto'}}>Batal</button>
                <button type="submit" className="btn-success" style={{width: 'auto'}} disabled={isSubmitting}>
                  {isSubmitting ? 'Memproses...' : 'Konfirmasi Pelunasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: #fff !important; color: #000 !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .glass-panel { border: none !important; box-shadow: none !important; padding: 0 !important; background: transparent !important; margin-bottom: 20px !important; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc !important; padding: 8px !important; color: #000 !important; }
          th { background: #f0f0f0 !important; }
          .badge { border: 1px solid #000; color: #000; background: transparent !important; }
          * { text-shadow: none !important; }
        }
      `}} />
    </div>
  )
}
