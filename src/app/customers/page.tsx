'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Icons } from '@/components/icons'

type Discount = { id?: string, type: string, discount: string }
type Customer = { id: string, name: string, phone: string | null, address: string | null, bonusThreshold: number, discounts: Discount[] }

const formatRupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', bonusThreshold: '0' })
  const [discountsData, setDiscountsData] = useState<{ LM: string, BR: string }>({ LM: '', BR: '' })
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => { fetchCustomers() }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    const res = await fetch('/api/customers')
    setCustomers(await res.json())
    setLoading(false)
  }

  const openModal = (customer?: Customer) => {
    setErrorMsg('')
    if (customer) {
      setEditingCustomer(customer)
      setFormData({ name: customer.name, phone: customer.phone || '', address: customer.address || '', bonusThreshold: customer.bonusThreshold?.toString() || '0' })
      setDiscountsData({ LM: customer.discounts.find(d => d.type === 'LM')?.discount || '', BR: customer.discounts.find(d => d.type === 'BR')?.discount || '' })
    } else {
      setEditingCustomer(null)
      setFormData({ name: '', phone: '', address: '', bonusThreshold: '0' })
      setDiscountsData({ LM: '', BR: '' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => setIsModalOpen(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    const payload = { ...formData, discounts: [{ type: 'LM', discount: discountsData.LM }, { type: 'BR', discount: discountsData.BR }].filter(d => d.discount.trim() !== '') }
    const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers'
    const method = editingCustomer ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) { fetchCustomers(); closeModal() }
    else { const d = await res.json(); setErrorMsg(d.error || 'Gagal menyimpan') }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Yakin hapus pelanggan ini? Riwayat transaksi tetap terjaga (Soft Delete).')) {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' })
      fetchCustomers()
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p style={{ marginTop: 4, fontSize: 14, color: 'var(--color-steel)' }}>Manage client data and discount settings</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>+ Add Customer</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Contact</th>
              <th>Bonus Threshold</th>
              <th>LM Discount</th>
              <th>BR Discount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-stone)' }}>Loading data...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="empty-state">
                  <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-stone)' }}>
                    <Icons.Users width="48" height="48" />
                  </div>
                  <h3>No customers yet</h3>
                  <p>Add your first customer</p>
                </div>
              </td></tr>
            ) : customers.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 700, color: 'var(--color-ink-deep)' }}>{c.name}</td>
                <td>
                  <div style={{ fontSize: 14 }}>{c.phone || '-'}</div>
                  {c.address && <div style={{ fontSize: 12, color: 'var(--color-stone)', marginTop: 2 }}>{c.address}</div>}
                </td>
                <td style={{ fontWeight: 500 }}>{formatRupiah(c.bonusThreshold)}</td>
                <td>
                  {c.discounts.find(d => d.type === 'LM')?.discount
                    ? <span className="badge badge-primary">{c.discounts.find(d => d.type === 'LM')?.discount}%</span>
                    : <span style={{ color: 'var(--color-stone)' }}>—</span>}
                </td>
                <td>
                  {c.discounts.find(d => d.type === 'BR')?.discount
                    ? <span className="badge badge-success">{c.discounts.find(d => d.type === 'BR')?.discount}%</span>
                    : <span style={{ color: 'var(--color-stone)' }}>—</span>}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/customers/${c.id}`}><button className="btn-ghost btn-sm">Details</button></Link>
                    <button className="btn-action btn-sm" onClick={() => openModal(c)}>Edit</button>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button className="modal-close-btn" onClick={closeModal}>
                <Icons.X width="20" height="20" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
                <div className="input-group">
                  <label className="input-label">Customer Name *</label>
                  <input required className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Full name or company" />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Phone Number</label>
                    <input className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="e.g. 08123456789" />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Bonus Threshold (Rp)</label>
                    <input type="number" min="0" className="input-field" value={formData.bonusThreshold} onChange={e => setFormData({ ...formData, bonusThreshold: e.target.value })} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Full Address</label>
                  <input className="input-field" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Customer address" />
                </div>
                <hr className="divider" />
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink-deep)', marginBottom: 4 }}>Cascading Discounts</p>
                <p style={{ fontSize: 12, color: 'var(--color-steel)', marginBottom: 12 }}>
                  Separate with commas. Example: <code style={{ background: 'var(--color-surface-soft)', padding: '1px 4px', borderRadius: 4 }}>10,5</code> = 10% then 5% discount.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label" style={{ color: 'var(--color-primary)' }}>LM Discount</label>
                    <input className="input-field" placeholder="e.g., 10,2.5" value={discountsData.LM} onChange={e => setDiscountsData({ ...discountsData, LM: e.target.value })} />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label" style={{ color: 'var(--color-success)' }}>BR Discount</label>
                    <input className="input-field" placeholder="e.g., 5" value={discountsData.BR} onChange={e => setDiscountsData({ ...discountsData, BR: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
