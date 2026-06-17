'use client'

import { useState, useEffect } from 'react'
import { formatRupiah } from '@/lib/utils'
import { Icons } from '@/components/icons'

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<number>(-1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  useEffect(() => { fetchReports() }, [selectedMonth, selectedYear])

  const fetchReports = async () => {
    setLoading(true)
    const res = await fetch(`/api/reports?month=${selectedMonth}&year=${selectedYear}`)
    if (res.ok) setTransactions(await res.json())
    setLoading(false)
  }

  // Calculations
  let totalOmzetLM = 0, totalOmzetBR = 0, totalLabaHL = 0, totalPiutang = 0, totalDibayar = 0, bonusGivenCount = 0
  const customerRecap: Record<string, any> = {}

  transactions.forEach(bon => {
    const custId = bon.customerId
    const custName = bon.customer?.name || 'Unknown'
    if (!customerRecap[custId]) customerRecap[custId] = { name: custName, omzetLM: 0, omzetBR: 0, laba: 0, piutang: 0, dibayar: 0 }

    let bonSubtotal = 0, bonOmzetLM = 0, bonOmzetBR = 0, bonLaba = 0

    bon.items.forEach((item: any) => {
      const lineTotal = item.hargaSetelahDiskon * item.qty
      bonSubtotal += lineTotal
      if (!bon.isBonus) {
        if (item.product.type === 'LM') bonOmzetLM += lineTotal
        if (item.product.type === 'BR') bonOmzetBR += lineTotal
        bonLaba += (item.hargaSetelahDiskon - item.hargaModal) * item.qty
      }
    })

    const tagihan = bonSubtotal + bon.ongkir
    if (bon.status === 'Piutang') { totalPiutang += tagihan; customerRecap[custId].piutang += tagihan }
    else if (bon.status === 'Lunas') {
      totalDibayar += tagihan; customerRecap[custId].dibayar += tagihan
      if (!bon.isBonus) {
        totalOmzetLM += bonOmzetLM; totalOmzetBR += bonOmzetBR; totalLabaHL += bonLaba
        customerRecap[custId].omzetLM += bonOmzetLM; customerRecap[custId].omzetBR += bonOmzetBR; customerRecap[custId].laba += bonLaba
      }
    }
    if (bon.isBonus) bonusGivenCount += bon.consumedBonus
  })

  const totalOmzet = totalOmzetLM + totalOmzetBR
  const handlePrint = () => window.print()

  return (
    <div className="printable-area">
      {/* Header */}
      <div className="page-header no-print">
        <div>
          <h1>Financial Reports</h1>
          <p style={{ marginTop: 4, fontSize: 14 }}>Overview of revenue, profit, & receivables (Cash Basis)</p>
        </div>
        <button className="btn-secondary no-print" onClick={handlePrint}>🖨️ Print / PDF</button>
      </div>

      {/* Print Header */}
      <div className="print-only" style={{ display: 'none', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20 }}>HL Internal Financial Report</h2>
        <p>Period: {selectedMonth === -1 ? 'All Time' : `${new Date(0, selectedMonth).toLocaleString('en-US', { month: 'long' })} ${selectedYear}`}</p>
        <hr style={{ margin: '12px 0', borderColor: '#ccc' }} />
      </div>

      {/* Filter Bar */}
      <div className="card no-print" style={{ marginBottom: 32, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', padding: 24 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink-deep)', marginBottom: 4 }}>Report Filter</h2>
          <p style={{ fontSize: 14, color: 'var(--color-slate)' }}>Adjust the period to view the financial summary.</p>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <div className="input-group" style={{ marginBottom: 0, minWidth: 180 }}>
            <label className="input-label">Month</label>
            <select className="input-field" value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
              <option value="-1">All Months</option>
              {Array.from({ length: 12 }).map((_, i) => <option key={i} value={i}>{new Date(0, i).toLocaleString('en-US', { month: 'long' })}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: 0, minWidth: 120 }}>
            <label className="input-label">Year</label>
            <select className="input-field" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading report data...</p></div>
      ) : (
        <>
          {/* KPI Summary */}
          <div className="stats-grid" style={{ marginBottom: 48 }}>
            <div className="stat-card" style={{ borderRadius: '24px', padding: '24px' }}>
              <div className="stat-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="stat-card-icon" style={{ background: '#f1f5f9', color: '#64748b' }}><Icons.Wallet width="16" height="16" /></span>
                  <span className="stat-card-label" style={{ textTransform: 'capitalize', letterSpacing: '0', fontSize: '14px', color: '#64748b' }}>Net Revenue</span>
                </div>
                <div style={{ color: '#cbd5e1', letterSpacing: '2px', fontWeight: 900, marginBottom: '8px' }}>...</div>
              </div>
              <span className="stat-card-value" style={{ marginTop: '8px' }}>{formatRupiah(totalOmzet)}</span>
              <span className="stat-card-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6' }}>
                <Icons.Activity width="14" height="14" /> LM + BR (Paid only)
              </span>
            </div>
            
            <div className="stat-card" style={{ borderRadius: '24px', padding: '24px' }}>
              <div className="stat-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="stat-card-icon" style={{ background: '#f1f5f9', color: '#64748b' }}><Icons.BarChart width="16" height="16" /></span>
                  <span className="stat-card-label" style={{ textTransform: 'capitalize', letterSpacing: '0', fontSize: '14px', color: '#64748b' }}>Net Profit</span>
                </div>
                <div style={{ color: '#cbd5e1', letterSpacing: '2px', fontWeight: 900, marginBottom: '8px' }}>...</div>
              </div>
              <span className="stat-card-value" style={{ marginTop: '8px' }}>{formatRupiah(totalLabaHL)}</span>
              <span className="stat-card-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                <Icons.Activity width="14" height="14" /> After discounts & costs
              </span>
            </div>

            <div className="stat-card" style={{ borderRadius: '24px', padding: '24px' }}>
              <div className="stat-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="stat-card-icon" style={{ background: '#f1f5f9', color: '#64748b' }}><Icons.Receipt width="16" height="16" /></span>
                  <span className="stat-card-label" style={{ textTransform: 'capitalize', letterSpacing: '0', fontSize: '14px', color: '#64748b' }}>Active Receivables</span>
                </div>
                <div style={{ color: '#cbd5e1', letterSpacing: '2px', fontWeight: 900, marginBottom: '8px' }}>...</div>
              </div>
              <span className="stat-card-value" style={{ marginTop: '8px' }}>{formatRupiah(totalPiutang)}</span>
              <span className="stat-card-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
                <Icons.Activity width="14" height="14" /> Unpaid by customers
              </span>
            </div>

            <div className="stat-card" style={{ borderRadius: '24px', padding: '24px' }}>
              <div className="stat-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="stat-card-icon" style={{ background: '#f1f5f9', color: '#64748b' }}><Icons.Ticket width="16" height="16" /></span>
                  <span className="stat-card-label" style={{ textTransform: 'capitalize', letterSpacing: '0', fontSize: '14px', color: '#64748b' }}>Bonuses Given</span>
                </div>
                <div style={{ color: '#cbd5e1', letterSpacing: '2px', fontWeight: 900, marginBottom: '8px' }}>...</div>
              </div>
              <span className="stat-card-value" style={{ marginTop: '8px' }}>{bonusGivenCount}</span>
              <span className="stat-card-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8b5cf6' }}>
                <Icons.Activity width="14" height="14" /> Claimed bonus tickets
              </span>
            </div>
          </div>

          {/* By Product Type */}
          <h2 className="section-title" style={{ fontSize: 20 }}>Overview by Product Type</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 48 }}>
            <div className="card" style={{ padding: 24, borderTop: '4px solid #f59e0b', borderRadius: '12px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Precious Metals (LM)</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-ink-deep)' }}>{formatRupiah(totalOmzetLM)}</div>
              <div style={{ fontSize: 14, color: 'var(--color-stone)', marginTop: 8 }}>Total Revenue (Paid)</div>
            </div>
            <div className="card" style={{ padding: 24, borderTop: '4px solid #8b5cf6', borderRadius: '12px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Jewelry (BR)</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-ink-deep)' }}>{formatRupiah(totalOmzetBR)}</div>
              <div style={{ fontSize: 14, color: 'var(--color-stone)', marginTop: 8 }}>Total Revenue (Paid)</div>
            </div>
            <div className="card" style={{ padding: 24, borderTop: '4px solid #10b981', borderRadius: '12px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>TOTAL COLLECTED</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-ink-deep)' }}>{formatRupiah(totalDibayar)}</div>
              <div style={{ fontSize: 14, color: 'var(--color-stone)', marginTop: 8 }}>Including shipping (Paid)</div>
            </div>
          </div>

          {/* Per Customer Table */}
          <h2 className="section-title" style={{ fontSize: 20 }}>Overview by Customer</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Active Receivables</th>
                  <th>Total Paid</th>
                  <th>Revenue LM</th>
                  <th>Revenue BR</th>
                  <th>Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(customerRecap).length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-stone)' }}>No transaction data available.</td></tr>
                ) : Object.values(customerRecap).map((c: any, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: 'var(--color-ink-deep)' }}>{c.name}</td>
                    <td><span style={{ color: c.piutang > 0 ? 'var(--color-attention)' : 'var(--color-stone)' }}>{formatRupiah(c.piutang)}</span></td>
                    <td><span style={{ color: 'var(--color-success)', fontWeight: 500 }}>{formatRupiah(c.dibayar)}</span></td>
                    <td>{formatRupiah(c.omzetLM)}</td>
                    <td>{formatRupiah(c.omzetBR)}</td>
                    <td style={{ fontWeight: 700, color: c.laba >= 0 ? 'var(--color-ink-deep)' : 'var(--color-critical)' }}>{formatRupiah(c.laba)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: #fff !important; color: #000 !important; font-family: Arial, sans-serif !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .main-content { padding: 0 !important; }
          .stat-card, .card-feature, .table-container { border: 1px solid #ccc !important; box-shadow: none !important; border-radius: 4px !important; }
          table { border-collapse: collapse; width: 100%; margin-top: 8px; }
          th, td { border: 1px solid #ccc !important; padding: 6px 8px !important; color: #000 !important; }
          th { background: #f5f5f5 !important; font-weight: bold; }
          .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}} />
    </div>
  )
}
