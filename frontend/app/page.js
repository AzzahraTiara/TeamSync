'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/api';

// Halaman awal: arahkan sesuai status login dan role
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const u = getUser();
    router.replace(!u ? '/login' : u.role === 'dosen' ? '/dosen' : '/mahasiswa');
  }, [router]);

  return (
    <div className="center" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p className="muted">Memuat TeamSync…</p>
    </div>
  );
}
