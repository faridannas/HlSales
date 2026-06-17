'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'
import { Icons } from '@/components/icons'

type DashboardStats = {
  totalPiutang: number
  totalOmzetLunas: number
  totalLabaLunas: number
  pendingTransactionsCount: number
  completedTransactionsCount: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard')
        const data = await res.json()
        setStats(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div>
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: '32px', letterSpacing: '-0.02em', marginBottom: '8px' }}>Hello, Admin!</h1>
          <p style={{ fontSize: '15px', color: 'var(--color-slate)' }}>
            Here's your overview of your business
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/transactions/new" className="btn-primary btn-sm">
            + Buat Bon Baru
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="empty-state">
          <p>Loading financial summary...</p>
        </div>
      ) : stats ? (
        <>
          {/* KPI Cards */}
          <div className="stats-grid">
            <div className="stat-card" style={{ borderRadius: '24px', padding: '24px' }}>
              <div className="stat-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="stat-card-icon" style={{ background: '#f1f5f9', color: '#64748b' }}><Icons.Receipt width="16" height="16" /></span>
                  <span className="stat-card-label" style={{ textTransform: 'capitalize', letterSpacing: '0', fontSize: '14px', color: '#64748b' }}>Accounts Receivable</span>
                </div>
                <div style={{ color: '#cbd5e1', letterSpacing: '2px', fontWeight: 900, marginBottom: '8px' }}>...</div>
              </div>
              <span className="stat-card-value" style={{ marginTop: '8px' }}>{formatRupiah(stats.totalPiutang)}</span>
              <span className="stat-card-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
                <Icons.Activity width="14" height="14" /> {stats.pendingTransactionsCount} active invoices
              </span>
            </div>

            <div className="stat-card" style={{ borderRadius: '24px', padding: '24px' }}>
              <div className="stat-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="stat-card-icon" style={{ background: '#f1f5f9', color: '#64748b' }}><Icons.Wallet width="16" height="16" /></span>
                  <span className="stat-card-label" style={{ textTransform: 'capitalize', letterSpacing: '0', fontSize: '14px', color: '#64748b' }}>Net Revenue</span>
                </div>
                <div style={{ color: '#cbd5e1', letterSpacing: '2px', fontWeight: 900, marginBottom: '8px' }}>...</div>
              </div>
              <span className="stat-card-value" style={{ marginTop: '8px' }}>{formatRupiah(stats.totalOmzetLunas)}</span>
              <span className="stat-card-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                <Icons.Activity width="14" height="14" /> Bonus calculation base
              </span>
            </div>

            <div className="stat-card" style={{ borderRadius: '24px', padding: '24px' }}>
              <div className="stat-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="stat-card-icon" style={{ background: '#f1f5f9', color: '#64748b' }}><Icons.BarChart width="16" height="16" /></span>
                  <span className="stat-card-label" style={{ textTransform: 'capitalize', letterSpacing: '0', fontSize: '14px', color: '#64748b' }}>Company Profit</span>
                </div>
                <div style={{ color: '#cbd5e1', letterSpacing: '2px', fontWeight: 900, marginBottom: '8px' }}>...</div>
              </div>
              <span className="stat-card-value" style={{ marginTop: '8px' }}>{formatRupiah(stats.totalLabaLunas)}</span>
              <span className="stat-card-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                <Icons.Activity width="14" height="14" /> Net profit (paid)
              </span>
            </div>

            <div className="stat-card" style={{ borderRadius: '24px', padding: '24px' }}>
              <div className="stat-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="stat-card-icon" style={{ background: '#f1f5f9', color: '#64748b' }}><Icons.Activity width="16" height="16" /></span>
                  <span className="stat-card-label" style={{ textTransform: 'capitalize', letterSpacing: '0', fontSize: '14px', color: '#64748b' }}>Total Transactions</span>
                </div>
                <div style={{ color: '#cbd5e1', letterSpacing: '2px', fontWeight: 900, marginBottom: '8px' }}>...</div>
              </div>
              <span className="stat-card-value" style={{ marginTop: '8px' }}>{stats.pendingTransactionsCount + stats.completedTransactionsCount}</span>
              <span className="stat-card-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                <Icons.Activity width="14" height="14" /> Total sales volume
              </span>
            </div>
          </div>

          {/* Chart Section */}
          <div className="card" style={{ marginTop: '32px', marginBottom: '32px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-ink-deep)', margin: 0 }}>Financial Overview Chart</h2>
              <span className="badge badge-primary">Real-time</span>
            </div>
            
            {stats.totalPiutang === 0 && stats.totalOmzetLunas === 0 && stats.totalLabaLunas === 0 ? (
              <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-slate)', background: 'var(--color-surface-soft)', borderRadius: '12px' }}>
                No transaction data available to display in the chart.
              </div>
            ) : (
              <div style={{ display: 'flex', height: '240px', alignItems: 'flex-end', gap: '16px', padding: '0 16px', position: 'relative' }}>
                {/* Background grid lines */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderBottom: '1px solid var(--color-hairline)', zIndex: 0 }}>
                  <div style={{ borderTop: '1px dashed var(--color-hairline)', height: 0, opacity: 0.5 }}></div>
                  <div style={{ borderTop: '1px dashed var(--color-hairline)', height: 0, opacity: 0.5 }}></div>
                  <div style={{ borderTop: '1px dashed var(--color-hairline)', height: 0, opacity: 0.5 }}></div>
                  <div style={{ borderTop: '1px dashed var(--color-hairline)', height: 0, opacity: 0.5 }}></div>
                </div>

                {(() => {
                  const maxVal = Math.max(stats.totalPiutang, stats.totalOmzetLunas, stats.totalLabaLunas, 1);
                  return (
                    <>
                      {/* Bar 1: Piutang */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', zIndex: 1 }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%', maxWidth: '120px', paddingBottom: '16px' }}>
                          <div style={{ width: '100%', backgroundColor: '#ef4444', borderRadius: '6px 6px 0 0', transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)', height: `${Math.max((stats.totalPiutang / maxVal) * 100, 2)}%`, minHeight: '4px', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)' }}></div>
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-ink-deep)' }}>Receivables</div>
                        <div style={{ fontSize: '13px', color: 'var(--color-slate)', marginTop: '4px' }}>{formatRupiah(stats.totalPiutang)}</div>
                      </div>
                      
                      {/* Bar 2: Omzet */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', zIndex: 1 }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%', maxWidth: '120px', paddingBottom: '16px' }}>
                          <div style={{ width: '100%', backgroundColor: '#3b82f6', borderRadius: '6px 6px 0 0', transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)', height: `${Math.max((stats.totalOmzetLunas / maxVal) * 100, 2)}%`, minHeight: '4px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)' }}></div>
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-ink-deep)' }}>Net Revenue</div>
                        <div style={{ fontSize: '13px', color: 'var(--color-slate)', marginTop: '4px' }}>{formatRupiah(stats.totalOmzetLunas)}</div>
                      </div>

                      {/* Bar 3: Laba */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', zIndex: 1 }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%', maxWidth: '120px', paddingBottom: '16px' }}>
                          <div style={{ width: '100%', backgroundColor: '#10b981', borderRadius: '6px 6px 0 0', transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)', height: `${Math.max((stats.totalLabaLunas / maxVal) * 100, 2)}%`, minHeight: '4px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}></div>
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-ink-deep)' }}>Profit</div>
                        <div style={{ fontSize: '13px', color: 'var(--color-slate)', marginTop: '4px' }}>{formatRupiah(stats.totalLabaLunas)}</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: 'var(--space-xxl)' }}>
            <h2 className="section-title">Management Modules</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { href: '/customers', icon: <Icons.Users width="24" height="24" />, title: 'Clients & Discounts', desc: 'Manage CRM and discount tiers' },
                { href: '/products', icon: <Icons.Box width="24" height="24" />, title: 'Product Catalog', desc: 'Set costs & base margins' },
                { href: '/transactions', icon: <Icons.Receipt width="24" height="24" />, title: 'Transactions', desc: 'Monitor receivables & invoices' },
                { href: '/reports', icon: <Icons.BarChart width="24" height="24" />, title: 'Financial Reports', desc: 'Periodic business summaries' },
              ].map(({ href, icon, title, desc }) => (
                <Link
                  key={href}
                  href={href}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.2s, border-color 0.2s' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-hairline)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-hairline-soft)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ color: 'var(--color-ink-button)', marginBottom: '16px' }}>{icon}</div>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-ink-deep)', marginBottom: '4px' }}>{title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-slate)' }}>{desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div className="card" style={{ background: 'var(--color-surface-soft)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink-deep)', marginBottom: '16px' }}>
              ℹ️ System Rules — Cash Basis
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                ['Revenue & Profit', 'Only calculated from invoices with Paid (Lunas) status.'],
                ['Shipping Fee', 'Pass-through funds — added to receivables, excluded from net revenue/profit.'],
                ['Tiered Discounts', 'Cost & discount snapshots are permanently saved per transaction.'],
                ['Bonus Items', 'Calculated by floor(net_revenue / threshold). Bonus items = 0 revenue, 0 profit.'],
              ].map(([key, val]) => (
                <div key={key} style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-ink-deep)', minWidth: '180px', flexShrink: 0 }}>{key}</span>
                  <span style={{ color: 'var(--color-steel)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-error">Gagal memuat data dashboard.</div>
      )}
    </div>
  )
}
