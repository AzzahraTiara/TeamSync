'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Users, AlertTriangle, CheckCircle, Calendar, ChevronRight, Activity } from 'lucide-react';
import Shell from '@/components/Shell';
import StatusBadge from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { tanggal } from '@/lib/constants';

export default function DashboardDosen() {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/projects')
      .then(setProjects)
      .catch((e) => setError(e.message));
  }, []);

  const perluTinjau = (projects || []).filter(
    (p) => p.status === 'Perlu Fasilitasi' || p.status === 'Perlu Dipantau'
  );
  const kondisiBaik = (projects || []).filter((p) => p.status === 'Baik');

  return (
    <Shell role="dosen">
      <div className="row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Dashboard Supervisi Dosen</h1>
          <p className="muted" style={{ marginTop: '0.2rem' }}>
            Pantau dinamika kolaborasi kelompok secara berkala. Status adalah indikator awal fasilitasi.
          </p>
        </div>
        <Link href="/dosen/projects/new" className="btn">
          <Plus size={16} />
          <span>Buat Project Baru</span>
        </Link>
      </div>

      {error && <div className="error">{error}</div>}

      {!projects && !error && (
        <div className="card center">
          <p className="muted">Memuat data kelompok...</p>
        </div>
      )}

      {projects && (
        <>
          {/* Stat Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <div className="muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Total Kelompok</div>
                <h1>{projects.length}</h1>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon warning">
                <AlertTriangle size={24} />
              </div>
              <div className="stat-info">
                <div className="muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Perlu Ditinjau</div>
                <h1 style={{ color: perluTinjau.length > 0 ? '#d97706' : 'inherit' }}>
                  {perluTinjau.length}
                </h1>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon success">
                <CheckCircle size={24} />
              </div>
              <div className="stat-info">
                <div className="muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Kondisi Baik</div>
                <h1 style={{ color: '#059669' }}>{kondisiBaik.length}</h1>
              </div>
            </div>
          </div>

          {projects.length === 0 && (
            <div className="card center" style={{ padding: '3rem 1.5rem' }}>
              <Users size={40} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
              <h3>Belum ada kelompok</h3>
              <p className="muted" style={{ maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
                Mulai buat kelompok dan jadwalkan pengisian survei berkala mahasiswa sekarang.
              </p>
              <Link href="/dosen/projects/new" className="btn">
                <Plus size={16} />
                <span>Buat Project Pertama</span>
              </Link>
            </div>
          )}

          {projects.map((p) => (
            <div className="card card-interactive" key={p.id} style={{ position: 'relative' }}>
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0 }}>
                      <Link href={`/dosen/projects/${p.id}`} style={{ color: '#0f172a' }}>
                        {p.nama}
                      </Link>
                    </h2>
                    <StatusBadge status={p.status} />
                  </div>

                  <div
                    className="muted"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      marginTop: '0.45rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Users size={14} style={{ color: 'var(--primary)' }} />
                      {p.jumlahAnggota} anggota
                    </span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} />
                      {tanggal(p.periodeMulai)} – {tanggal(p.periodeSelesai)}
                    </span>
                    <span>•</span>
                    <span className="badge blue" style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem' }}>
                      {p.periodeKeSekarang ? `Periode ke-${p.periodeKeSekarang}` : 'Di luar periode'}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/dosen/projects/${p.id}`}
                  className="btn small ghost"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Detail & Supervisi
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginTop: '0.9rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.86rem',
                  color: '#334155',
                }}
              >
                <div>
                  <span className="muted">Skor terakhir: </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: p.skorTerakhir ? 'var(--primary)' : 'inherit',
                      background: p.skorTerakhir ? 'var(--primary-light)' : 'transparent',
                      padding: p.skorTerakhir ? '0.15rem 0.45rem' : '0',
                      borderRadius: '4px',
                    }}
                  >
                    {p.skorTerakhir ? `${Number(p.skorTerakhir).toFixed(1)} / 5.0` : '-'}
                  </span>
                </div>
                <div>
                  <span className="muted">Kendala aktif: </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: p.kendalaAktif > 0 ? '#e11d48' : '#10b981',
                    }}
                  >
                    {p.kendalaAktif} masalah
                  </span>
                </div>
              </div>

              {p.alasan.length > 0 && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem 0.85rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      color: '#991b1b',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <AlertTriangle size={14} />
                    Catatan Indikator:
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '1.25rem',
                      fontSize: '0.82rem',
                      color: '#7f1d1d',
                    }}
                  >
                    {p.alasan.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </Shell>
  );
}
