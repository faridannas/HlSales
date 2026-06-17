'use client'

import { useState, useEffect } from 'react'
import { Icons } from '@/components/icons'

type Product = { id: string, code: string, name: string, type: string, hargaModal: number, hargaJual: number }

const formatRupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({ code: '', name: '', type: 'LM', hargaModal: '', hargaJual: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const res = await fetch('/api/products')
    setProducts(await res.json())
    setLoading(false)
  }

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({ code: product.code, name: product.name, type: product.type, hargaModal: product.hargaModal.toString(), hargaJual: product.hargaJual.toString() })
    } else {
      setEditingProduct(null)
      setFormData({ code: '', name: '', type: 'LM', hargaModal: '', hargaJual: '' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => setIsModalOpen(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
    const method = editingProduct ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
    if (res.ok) { fetchProducts(); closeModal() }
    else alert('Gagal menyimpan produk')
  }

  const handleDelete = async (id: string) => {
    if (confirm('Yakin hapus produk ini? Transaksi yang memakai produk ini mungkin terpengaruh!')) {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      fetchProducts()
    }
  }

  // Calculate margin
  const margin = (p: Product) => p.hargaModal > 0 ? (((p.hargaJual - p.hargaModal) / p.hargaModal) * 100).toFixed(1) : '0'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p style={{ marginTop: 4, fontSize: 14, color: 'var(--color-steel)' }}>Manage Precious Metals (LM) & Jewelry (BR) catalog</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>+ Add Product</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Code / SKU</th>
              <th>Product Name</th>
              <th>Type</th>
              <th>Base Cost</th>
              <th>Selling Price</th>
              <th>Margin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-stone)' }}>Loading data...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="empty-state">
                  <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-stone)' }}>
                    <Icons.Box width="48" height="48" />
                  </div>
                  <h3>No products yet</h3>
                  <p>Add your first product</p>
                </div>
              </td></tr>
            ) : products.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--color-charcoal)', fontWeight: 500 }}>{p.code}</td>
                <td style={{ fontWeight: 700, color: 'var(--color-ink-deep)' }}>{p.name}</td>
                <td>
                  <span className={`badge ${p.type === 'LM' ? 'badge-primary' : 'badge-success'}`}>{p.type}</span>
                </td>
                <td style={{ color: 'var(--color-charcoal)' }}>{formatRupiah(p.hargaModal)}</td>
                <td style={{ fontWeight: 700, color: 'var(--color-ink-deep)' }}>{formatRupiah(p.hargaJual)}</td>
                <td>
                  <span className={`badge ${parseFloat(margin(p)) >= 0 ? 'badge-success' : 'badge-critical'}`}>
                    {margin(p)}%
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-action btn-sm" onClick={() => openModal(p)}>Edit</button>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
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
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close-btn" onClick={closeModal}>
                <Icons.X width="20" height="20" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Code / SKU *</label>
                    <input required className="input-field" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="e.g., LM-001" />
                  </div>
                  <div className="input-group" style={{ flex: 2 }}>
                    <label className="input-label">Product Name *</label>
                    <input required className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Product name" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Product Type *</label>
                  <select required className="input-field" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                    <option value="LM">Precious Metals (LM)</option>
                    <option value="BR">Jewelry (BR)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Base Cost (Rp) *</label>
                    <input required type="number" min="0" className="input-field" value={formData.hargaModal} onChange={e => setFormData({ ...formData, hargaModal: e.target.value })} placeholder="1000000" />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Selling Price (Rp) *</label>
                    <input required type="number" min="0" className="input-field" value={formData.hargaJual} onChange={e => setFormData({ ...formData, hargaJual: e.target.value })} placeholder="1200000" />
                  </div>
                </div>
                {formData.hargaModal && formData.hargaJual && (
                  <div className="alert alert-success" style={{ marginTop: 8 }}>
                    💰 Estimated margin: {(((parseFloat(formData.hargaJual) - parseFloat(formData.hargaModal)) / parseFloat(formData.hargaModal)) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
