'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'
import { Icons } from '@/components/icons'

type BonItem = { id: string, qty: number, hargaSetelahDiskon: number }
type Customer = { name: string }
type Transaction = { id: string, nomorBon: string, date: string, status: string, ongkir: number, customer: Customer, items: BonItem[], isBonus: boolean }

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'Piutang' | 'Lunas'>('all')

  useEffect(() => { fetchTransactions() }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    const res = await fetch('/api/transactions')
    setTransactions(await res.json())
    setLoading(false)
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Piutang' ? 'Lunas' : 'Piutang'
    if (confirm(`Change status to ${newStatus === 'Lunas' ? 'Paid (Lunas)' : 'Unpaid (Piutang)'}?`)) {
      const res = await fetch(`/api/transactions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
      if (res.ok) fetchTransactions()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this invoice?')) {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (res.ok) fetchTransactions()
    }
  }

  const calculateTotal = (t: Transaction) => t.items.reduce((sum, item) => sum + (item.hargaSetelahDiskon * item.qty), 0) + t.ongkir

  const filtered = filterStatus === 'all' ? transactions : transactions.filter(t => t.status === filterStatus)

  const piutangCount = transactions.filter(t => t.status === 'Piutang').length
  const lunasCount = transactions.filter(t => t.status === 'Lunas').length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p style={{ marginTop: 4, fontSize: 14, color: 'var(--color-steel)' }}>Sales invoice history & receivables status</p>
        </div>
        <Link href="/transactions/new" className="btn-primary">
          + Create New Invoice
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { val: 'all', label: `All (${transactions.length})` },
          { val: 'Piutang', label: `Unpaid (${piutangCount})` },
          { val: 'Lunas', label: `Paid (${lunasCount})` },
        ].map(({ val, label }) => (
          <button
            key={val}
            onClick={() => setFilterStatus(val as 'all' | 'Piutang' | 'Lunas')}
            className={`nav-link ${filterStatus === val ? 'active' : ''}`}
            style={{ cursor: 'pointer', background: filterStatus === val ? undefined : 'none', border: filterStatus === val ? undefined : '1px solid var(--color-hairline)' }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-stone)' }}>Loading data...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="empty-state">
                  <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-stone)' }}>
                    <Icons.Receipt width="48" height="48" />
                  </div>
                  <h3>No transactions</h3>
                  <p>Create a new invoice to get started</p>
                </div>
              </td></tr>
            ) : filtered.map(t => (
              <tr key={t.id}>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--color-ink-deep)' }}>{t.nomorBon}</div>
                  {t.isBonus && <span className="badge badge-bonus" style={{ marginTop: 4, display: 'inline-block' }}>BONUS</span>}
                </td>
                <td style={{ color: 'var(--color-charcoal)', fontSize: 14 }}>
                  {new Date(t.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ fontWeight: 500 }}>{t.customer?.name || '—'}</td>
                <td style={{ fontWeight: 700, color: t.isBonus ? 'var(--color-success)' : 'var(--color-ink-deep)' }}>
                  {t.isBonus ? 'FREE' : formatRupiah(calculateTotal(t))}
                </td>
                <td>
                  <span
                    className={`badge ${t.status === 'Lunas' ? 'badge-lunas' : 'badge-piutang'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleStatus(t.id, t.status)}
                    title="Click to toggle status"
                  >
                    {t.status === 'Lunas' ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/transactions/${t.id}/edit`}>
                      <button className="btn-action btn-sm">Edit</button>
                    </Link>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
