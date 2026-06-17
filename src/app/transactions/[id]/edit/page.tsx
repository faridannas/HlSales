'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { calculateCascadingDiscount, formatRupiah } from '@/lib/utils'
import { Icons } from '@/components/icons'

type Customer = { id: string, name: string, discounts: { type: string, discount: string }[] }
type Product = { id: string, name: string, type: string, hargaModal: number, hargaJual: number }
type CartItem = { product: Product, qty: number }

export default function EditTransactionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [nomorBon, setNomorBon] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [ongkir, setOngkir] = useState<number>(0)
  
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [qty, setQty] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  // Bonus State
  const [isBonusBon, setIsBonusBon] = useState(false)
  const [consumedBonus, setConsumedBonus] = useState<number>(1)
  const [bonusInfo, setBonusInfo] = useState<{ availableBonuses: number, carryOver: number } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
      fetch('/api/transactions').then(r => r.json()) // Get all transactions and filter
    ]).then(([custData, prodData, txData]) => {
      setCustomers(custData)
      setProducts(prodData)
      
      const transaction = txData.find((t: any) => t.id === params.id)
      if (transaction) {
        setNomorBon(transaction.nomorBon)
        setDate(new Date(transaction.date).toISOString().split('T')[0])
        setDescription(transaction.description || '')
        setOngkir(transaction.ongkir)
        setSelectedCustomer(transaction.customerId)
        setIsBonusBon(transaction.isBonus)
        setConsumedBonus(transaction.consumedBonus)
        
        // Map saved items back to cart
        const mappedCart = transaction.items.map((item: any) => {
          // If the product was deleted, it still has its raw data here ideally, but for editing we rely on the product catalog relation.
          // In a perfect world, we'd have a snapshot product, but here we just try to find it in the catalog.
          const prod = prodData.find((p: Product) => p.id === item.productId)
          return {
            product: prod || item.product,
            qty: item.qty
          }
        })
        setCart(mappedCart)
      }
      setPageLoading(false)
    })
  }, [params.id])

  useEffect(() => {
    if (selectedCustomer) {
      fetch(`/api/customers/${selectedCustomer}/bonus`)
        .then(res => res.json())
        .then(data => {
          setBonusInfo(data)
        })
    } else {
      setBonusInfo(null)
    }
  }, [selectedCustomer])

  const currentCustomer = customers.find(c => c.id === selectedCustomer)

  const handleAddToCart = () => {
    const product = products.find(p => p.id === selectedProduct)
    if (!product || qty < 1) return
    setCart([...cart, { product, qty }])
    setSelectedProduct('')
    setQty(1)
  }

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const getDiscountString = (type: string) => {
    if (!currentCustomer || isBonusBon) return ''
    const d = currentCustomer.discounts.find(d => d.type === type)
    return d ? d.discount : ''
  }

  const calculateItemTotal = (item: CartItem) => {
    if (isBonusBon) return 0 // AC-5.7
    const discString = getDiscountString(item.product.type)
    const finalPrice = calculateCascadingDiscount(item.product.hargaJual, discString)
    return finalPrice * item.qty
  }

  const grandTotal = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0) + (ongkir || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer || cart.length === 0) {
      alert('Pilih pelanggan dan minimal satu produk.')
      return
    }

    setLoading(true)
    const payload = {
      nomorBon,
      date,
      description,
      customerId: selectedCustomer,
      ongkir,
      isBonus: isBonusBon,
      consumedBonus: isBonusBon ? consumedBonus : 0,
      items: cart.map(item => {
        const discString = getDiscountString(item.product.type)
        const finalPrice = isBonusBon ? 0 : calculateCascadingDiscount(item.product.hargaJual, discString)
        return {
          productId: item.product.id,
          qty: item.qty,
          hargaModal: item.product.hargaModal,
          hargaJual: item.product.hargaJual,
          diskonCascading: discString,
          hargaSetelahDiskon: finalPrice
        }
      })
    }

    const res = await fetch(`/api/transactions/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      router.push('/transactions')
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to save transaction.')
      setLoading(false)
    }
  }

  if (pageLoading) return <div style={{padding: '4rem', textAlign: 'center'}}>Loading transaction data...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Edit Invoice {isBonusBon && <span className="badge badge-bonus">BONUS</span>}</h1>
        </div>
        <button 
          type="button" 
          onClick={() => router.push('/transactions')} 
          style={{ 
            width: '40px', height: '40px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-surface)', border: '1px solid var(--color-hairline)',
            borderRadius: '50%', color: 'var(--color-slate)', cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.color = 'var(--color-slate)'; e.currentTarget.style.borderColor = 'var(--color-hairline)'; }}
          title="Close & Return"
        >
          <Icons.X width="20" height="20" />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Kolom Kiri: Input Data Bon */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h3 style={{ marginBottom: '16px', color: 'var(--color-primary)' }}>Transaction Details</h3>
            
            <div style={{display: 'flex', gap: '16px'}}>
              <div className="input-group" style={{flex: 1}}>
                <label className="input-label">Invoice No *</label>
                <input required className="input-field" value={nomorBon} onChange={e => setNomorBon(e.target.value)} />
              </div>
              <div className="input-group" style={{flex: 1}}>
                <label className="input-label">Date *</label>
                <input type="date" required className="input-field" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Customer *</label>
              <select required className="input-field" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
                <option value="" disabled>-- Select Customer --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input-field" value={description} onChange={e => setDescription(e.target.value)} placeholder="Additional notes (optional)" rows={2} />
            </div>

            {bonusInfo && bonusInfo.availableBonuses > 0 && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: '#059669', margin: 0 }}>🎉 Bonuses Available: {bonusInfo.availableBonuses}</h4>
                    <p style={{ fontSize: '13px', color: '#10b981', margin: '4px 0 0 0' }}>This customer can claim free bonus items!</p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--color-ink-deep)' }}>
                    <input type="checkbox" checked={isBonusBon} onChange={e => setIsBonusBon(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                    Mark as Bonus Invoice
                  </label>
                </div>
                
                {isBonusBon && (
                  <div className="input-group" style={{ marginTop: '16px', marginBottom: 0 }}>
                    <label className="input-label" style={{ color: '#059669' }}>How many bonus quotas to claim?</label>
                    <input type="number" min="1" max={bonusInfo.availableBonuses} className="input-field" value={consumedBonus} onChange={e => setConsumedBonus(parseInt(e.target.value) || 1)} style={{ borderColor: '#10b981' }} />
                  </div>
                )}
              </div>
            )}

            {!isBonusBon && currentCustomer && (
              <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                <strong style={{ color: '#1e40af' }}>Active Discounts:</strong>
                <ul style={{ paddingLeft: '24px', marginTop: '8px', color: '#1d4ed8' }}>
                  <li>Precious Metals (LM): {getDiscountString('LM') || 'None'}</li>
                  <li>Jewelry (BR): {getDiscountString('BR') || 'None'}</li>
                </ul>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Shipping Fee (Rp)</label>
              <input type="number" min="0" className="input-field" value={ongkir || ''} onChange={e => setOngkir(parseInt(e.target.value) || 0)} placeholder="0" />
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px', color: 'var(--color-success)' }}>Add Product</h3>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
              <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
                <label className="input-label">Select Product</label>
                <select className="input-field" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                  <option value="" disabled>-- Select Product --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
                </select>
              </div>
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="input-label">Qty</label>
                <input type="number" min="1" className="input-field" value={qty} onChange={e => setQty(parseInt(e.target.value))} />
              </div>
              <button type="button" className="btn-secondary" style={{ width: 'auto' }} onClick={handleAddToCart}>Add</button>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Rincian Keranjang */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '16px' }}>
            Invoice Details {isBonusBon && '(FREE)'}
          </h3>
          
          <div style={{ flex: 1, overflowY: 'auto', minHeight: '300px' }}>
            {cart.length === 0 ? (
              <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--color-slate)' }}>No products added yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {cart.map((item, idx) => {
                  const discStr = getDiscountString(item.product.type);
                  const finalPrice = isBonusBon ? 0 : calculateCascadingDiscount(item.product.hargaJual, discStr);
                  return (
                    <li key={idx} style={{ padding: '16px 0', borderBottom: '1px solid var(--color-hairline)', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-ink-deep)' }}>{item.product.name} <span className="badge badge-neutral" style={{marginLeft: 8}}>{item.product.type}</span></div>
                        <div style={{ fontSize: '14px', color: 'var(--color-slate)', marginTop: 4 }}>
                          {item.qty} x {isBonusBon ? 'Rp 0 (Bonus)' : formatRupiah(item.product.hargaJual)}
                          {!isBonusBon && discStr && <span style={{ color: '#059669', marginLeft: '8px', fontWeight: 500 }}>(Disc: {discStr}%)</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: isBonusBon ? '#10b981' : 'var(--color-ink-deep)' }}>
                          {isBonusBon ? 'FREE' : formatRupiah(finalPrice * item.qty)}
                        </div>
                        <button type="button" onClick={() => removeFromCart(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-critical)', fontSize: '13px', cursor: 'pointer', marginTop: '8px', fontWeight: 500 }}>Remove</button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div style={{ marginTop: '32px', borderTop: '1px solid var(--color-hairline)', paddingTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--color-slate)' }}>
              <span>Subtotal</span>
              <span style={{ color: isBonusBon ? '#10b981' : 'inherit', fontWeight: 500 }}>{isBonusBon ? 'Rp 0' : formatRupiah(grandTotal - ongkir)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--color-slate)' }}>
              <span>Shipping Fee</span>
              <span style={{ fontWeight: 500 }}>{formatRupiah(ongkir)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: 700, color: 'var(--color-ink-deep)', marginBottom: '32px' }}>
              <span>Total Amount</span>
              <span>{formatRupiah(grandTotal)}</span>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px' }} disabled={loading || cart.length === 0 || !selectedCustomer}>
              {loading ? 'Saving...' : 'Update Invoice'}
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}
