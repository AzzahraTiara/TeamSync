'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Layers, User as UserIcon } from 'lucide-react';
import { getUser, clearSession } from '@/lib/api';

// Pembungkus halaman: cek login + role, tampilkan navbar
export default function Shell({ role, children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = getUser();
    if (!u) return router.replace('/login');
    if (u.role !== role) return router.replace(u.role === 'dosen' ? '/dosen' : '/mahasiswa');
    setUser(u);
  }, [role, router]);

  if (!user) {
    return (
      <div className="center">
        <p className="muted">Memuat…</p>
      </div>
    );
  }

  // Ambil inisial nama untuk avatar profil
  const initials = (user.nama || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const handleLogout = () => {
    clearSession();
    // Gunakan window.location.href untuk pembersihan total memori/cache halaman saat keluar
    window.location.href = '/login';
  };

  return (
    <>
      <header className="nav">
        <Link href={`/${role}`} className="brand-wrapper">
          <div className="brand-icon">
            <Layers size={20} />
          </div>
          <span className="brand">
            Team<span>Sync</span>
          </span>
        </Link>
        <div className="nav-right">
          <div className="user-profile-badge">
            <div className="user-avatar">{initials}</div>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>{user.nama}</span>
            <span className={`role-tag ${role}`}>
              {role === 'dosen' ? 'Dosen' : 'Mahasiswa'}
            </span>
          </div>
          <button
            className="btn small ghost"
            onClick={handleLogout}
            title="Keluar"
          >
            <LogOut size={14} />
            <span>Keluar</span>
          </button>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}
