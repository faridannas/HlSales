import { NextResponse } from 'next/server'
import { logout } from '@/lib/session'

export async function POST() {
  try {
    await logout()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
