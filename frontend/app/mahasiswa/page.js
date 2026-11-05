'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Calendar, CheckCircle2, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { tanggal } from '@/lib/constants';

export default function DashboardMahasiswa() {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/projects')
      .then(setProjects)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <Shell role="mahasiswa">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>Kelompok Project Saya</h1>
        <p className="muted" style={{ marginTop: '0.2rem' }}>
          Pantau progres kolaborasi, isi survei berkala, dan laporkan kendala kerja tim Anda.
        </p>
      </div>

      {error && <div className="error">{error}</div>}

      {!projects && !error && (
        <div className="card center">
          <p className="muted">Memuat data kelompok...</p>
        </div>
      )}

      {projects && projects.length === 0 && (
        <div className="card center" style={{ padding: '3rem 1.5rem' }}>
          <Users size={40} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3>Belum Terdaftar di Kelompok</h3>
          <p className="muted" style={{ maxWidth: '420px', margin: '0.5rem auto 0' }}>
            Anda belum dimasukkan ke dalam kelompok project oleh dosen pembimbing. Silakan hubungi dosen Anda jika ada kendala.
          </p>
        </div>
      )}

      {(projects || []).map((p) => {
        const isSurveyReady = p.periodeKeSekarang != null && !p.sudahIsiSurvei;
        return (
          <div
            className="card card-interactive"
            key={p.id}
            style={{
              borderLeft: isSurveyReady ? '4px solid #f59e0b' : '4px solid #2563eb',
            }}
          >
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: '1 1 300px' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                  <Link href={`/mahasiswa/projects/${p.id}`} style={{ color: '#0f172a' }}>
                    {p.nama}
                  </Link>
                </h2>
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
                </div>
              </div>

              <div>
                {p.periodeKeSekarang == null ? (
                  <span className="badge gray">
                    <Clock size={13} />
                    Di luar periode survei
                  </span>
                ) : p.sudahIsiSurvei ? (
                  <span className="badge green">
                    <CheckCircle2 size={13} />
                    Survei Periode {p.periodeKeSekarang} Sudah Diisi
                  </span>
                ) : (
                  <span className="badge amber">
                    <AlertCircle size={13} />
                    Survei Periode {p.periodeKeSekarang} Wajib Diisi
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <Link
                href={`/mahasiswa/projects/${p.id}`}
                className={`btn small ${isSurveyReady ? '' : 'ghost'}`}
              >
                <span>{isSurveyReady ? 'Isi Survei Sekarang' : 'Buka Halaman Kelompok'}</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        );
      })}
    </Shell>
  );
}
