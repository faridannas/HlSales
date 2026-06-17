'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Icons } from '@/components/icons'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const confirmLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/', label: 'Dashboard', icon: <Icons.BarChart width="18" height="18" />, match: (p: string) => p === '/' },
    { href: '/customers', label: 'Customers', icon: <Icons.Users width="18" height="18" />, match: (p: string) => p.startsWith('/customers') },
    { href: '/products', label: 'Products', icon: <Icons.Box width="18" height="18" />, match: (p: string) => p.startsWith('/products') },
    { href: '/transactions', label: 'Transactions', icon: <Icons.Receipt width="18" height="18" />, match: (p: string) => p.startsWith('/transactions') },
    { href: '/reports', label: 'Reports', icon: <Icons.Wallet width="18" height="18" />, match: (p: string) => p.startsWith('/reports') },
  ]

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <Icons.Activity width="18" height="18" />
            </div>
            <div className="sidebar-title">
              <span className="brand-name">HL Finance</span>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>Overview Business</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Main Menu</div>
          {links.map(({ href, label, icon, match }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${match(pathname) ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => setShowLogoutModal(true)} className="btn-logout-sidebar">
            <Icons.Activity width="18" height="18" style={{ transform: 'rotate(90deg)' }} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Confirm Logout</h2>
              <button className="modal-close-btn" onClick={() => setShowLogoutModal(false)}>
                <Icons.X width="20" height="20" />
              </button>
            </div>
            <div className="modal-body" style={{ color: 'var(--color-ink)' }}>
              <p>Are you sure you want to log out of HL Finance?</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ background: 'var(--color-critical)', borderColor: 'var(--color-critical)', color: 'white' }} onClick={confirmLogout}>Yes, Log out</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
