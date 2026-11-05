'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Info,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  MessageCircle,
  FileText,
  Send,
  HelpCircle,
} from 'lucide-react';
import Shell from '@/components/Shell';
import StatusBadge from '@/components/StatusBadge';
import TrendChart from '@/components/TrendChart';
import { api } from '@/lib/api';
import { ASPEK, STATUS_KENDALA, STATUS_TINDAK_LANJUT, tanggal } from '@/lib/constants';

function DetailKelompokIsi() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const [periodeLihat, setPeriodeLihat] = useState(null);
  const [fu, setFu] = useState({ catatanDiskusi: '', tindakan: '', status: 'Direncanakan' });

  const muat = useCallback(async () => {
    try {
      setD(await api(`/projects/${id}`));
    } catch (e) {
      setError(e.message);
    }
  }, [id]);

  useEffect(() => {
    muat();
  }, [muat]);

  async function ubahStatus(path, status) {
    try {
      await api(path, { method: 'PATCH', body: { status } });
      await muat();
    } catch (e) {
      setError(e.message);
    }
  }

  async function simpanTindakLanjut(e) {
    e.preventDefault();
    setError('');
    try {
      await api(`/projects/${id}/followups`, { method: 'POST', body: fu });
      setFu({ catatanDiskusi: '', tindakan: '', status: 'Direncanakan' });
      await muat();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !d) {
    return (
      <Shell role="dosen">
        <div className="error">{error}</div>
      </Shell>
    );
  }

  if (!d) {
    return (
      <Shell role="dosen">
        <div className="card center">
          <p className="muted">Memuat detail kelompok...</p>
        </div>
      </Shell>
    );
  }

  const terakhir = d.tren[d.tren.length - 1];
  const periodeAktif = periodeLihat ?? terakhir?.periodeKe;
  const jawabanPeriode = d.jawaban.filter((j) => j.periodeKe === periodeAktif);

  return (
    <Shell role="dosen">
      <Link href="/dosen" className="back-link">
        <ArrowLeft size={16} />
        Kembali ke Dashboard Dosen
      </Link>

      {/* Header Info */}
      <div
        className="card"
        style={{
          borderLeft: '4px solid var(--primary)',
          marginBottom: '1.25rem',
        }}
      >
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{d.project.nama}</h1>
            <div
              className="muted"
              style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                fontSize: '0.86rem',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} style={{ color: 'var(--primary)' }} />
                {tanggal(d.project.periodeMulai)} – {tanggal(d.project.periodeSelesai)}
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} />
                Survei tiap {d.project.intervalHari} hari
              </span>
              <span>•</span>
              <span className="badge blue" style={{ fontSize: '0.75rem' }}>
                {d.project.periodeKeSekarang
                  ? `Sekarang Periode ke-${d.project.periodeKeSekarang}`
                  : 'Di luar periode survei'}
              </span>
            </div>
          </div>
          <StatusBadge status={d.status} />
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="note">
        <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Pedoman Supervisi:</strong> Status dan skor merupakan indikator awal deteksi dini.
          Selalu klarifikasi konteks secara langsung dengan kelompok sebelum mengambil keputusan, dan jangan
          gunakan skor survei ini sebagai satu-satunya dasar penilaian akademik mahasiswa.
        </div>
      </div>

      {d.alasan.length > 0 && (
        <div
          className="card"
          style={{
            borderLeft: '4px solid #f59e0b',
            background: '#fffdfa',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={17} style={{ color: '#d97706' }} />
            <h2 style={{ margin: 0, fontSize: '1.05rem', color: '#92400e' }}>Indikator Catatan Khusus</h2>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#78350f', fontSize: '0.9rem' }}>
            {d.alasan.map((a) => (
              <li key={a} style={{ marginBottom: '0.25rem' }}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Grid: Trend & Aspek */}
      <div className="grid2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
            <h2 style={{ margin: 0 }}>Tren Skor Kolaborasi</h2>
          </div>
          <TrendChart data={d.tren} />
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
              <h2 style={{ margin: 0 }}>
                Skor per Aspek {terakhir ? `(P${terakhir.periodeKe})` : ''}
              </h2>
            </div>
            {terakhir && (
              <span className="badge blue" style={{ fontSize: '0.72rem' }}>
                {terakhir.responden} dari {d.anggota.length} mengisi
              </span>
            )}
          </div>

          {!terakhir && <p className="muted">Belum ada data survei.</p>}

          {terakhir && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {ASPEK.map((a) => {
                const nilai = terakhir.rata[a.key] || 0;
                const pct = (nilai / 5) * 100;
                return (
                  <div key={a.key}>
                    <div className="row" style={{ fontSize: '0.86rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 500, color: '#334155' }}>{a.pendek}</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {Number(nilai).toFixed(1)} <span className="muted" style={{ fontWeight: 400 }}>/ 5.0</span>
                      </span>
                    </div>
                    <div className="bar">
                      <div style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Persepsi Kontribusi */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
          <Users size={18} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0 }}>Persepsi Kontribusi Antaranggota</h2>
        </div>
        {!d.persepsi && <p className="muted">Belum ada data survei kontribusi.</p>}
        {d.persepsi && (
          <>
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>Nama Anggota</th>
                    <th>Rata-rata Skor dari Rekan</th>
                    <th>Jumlah Penilai</th>
                  </tr>
                </thead>
                <tbody>
                  {d.persepsi.anggota.map((a) => (
                    <tr key={a.userId}>
                      <td>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{a.nama}</span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: a.rata != null && a.rata < 3 ? '#e11d48' : '#2563eb',
                            background: '#eff6ff',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            display: 'inline-block',
                          }}
                        >
                          {a.rata != null ? `${Number(a.rata).toFixed(1)} / 5.0` : '-'}
                        </span>
                      </td>
                      <td>{a.jumlahPenilai} orang</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted" style={{ marginTop: '0.75rem', fontSize: '0.82rem' }}>
              Rentang selisih tertinggi – terendah:{' '}
              <b style={{ color: '#1e293b' }}>{d.persepsi.selisih != null ? d.persepsi.selisih.toFixed(1) : '-'}</b>.
              Gunakan informasi ini sebagai bahan klarifikasi pembagian beban kerja secara kekeluargaan.
            </p>
          </>
        )}
      </div>

      {/* Jawaban Survei Detil */}
      <div className="card">
        <div className="row" style={{ marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <FileText size={18} style={{ color: 'var(--primary)' }} />
            <h2 style={{ margin: 0 }}>Rincian Jawaban Survei Mahasiswa</h2>
          </div>
          {d.tren.length > 0 && (
            <select
              style={{ width: 'auto', marginTop: 0, padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
              value={periodeAktif}
              onChange={(e) => setPeriodeLihat(Number(e.target.value))}
            >
              {d.tren.map((t) => (
                <option key={t.periodeKe} value={t.periodeKe}>
                  Tampilkan Periode {t.periodeKe}
                </option>
              ))}
            </select>
          )}
        </div>

        {jawabanPeriode.length === 0 && (
          <p className="muted">Belum ada jawaban pada periode ini.</p>
        )}

        {jawabanPeriode.length > 0 && (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Mahasiswa</th>
                  {ASPEK.map((a) => (
                    <th key={a.key} title={a.label}>
                      {a.pendek}
                    </th>
                  ))}
                  <th>Komentar Tambahan</th>
                </tr>
              </thead>
              <tbody>
                {jawabanPeriode.map((j) => (
                  <tr key={j.nama + j.createdAt}>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{j.nama}</td>
                    {ASPEK.map((a) => (
                      <td key={a.key}>
                        <span
                          style={{
                            fontWeight: 600,
                            color: j[a.key] <= 2 ? '#e11d48' : '#334155',
                          }}
                        >
                          {j[a.key]}
                        </span>
                      </td>
                    ))}
                    <td style={{ color: j.komentar ? '#1e293b' : '#94a3b8', fontStyle: j.komentar ? 'normal' : 'italic' }}>
                      {j.komentar || 'Tidak ada komentar'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Kendala Komunikasi */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <MessageCircle size={18} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0 }}>
            Laporan Kendala Komunikasi ({d.kendalaAktif} masalah aktif)
          </h2>
        </div>

        {d.kendala.length === 0 && (
          <p className="muted">Tidak ada kendala komunikasi yang dilaporkan oleh mahasiswa.</p>
        )}

        {d.kendala.map((k) => (
          <div className="item" key={k.id}>
            <div className="row" style={{ marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge blue">{k.kategori}</span>
                {k.masihBerlangsung ? (
                  <span className="badge red" style={{ fontSize: '0.72rem' }}>Masih Berlangsung</span>
                ) : (
                  <span className="badge gray" style={{ fontSize: '0.72rem' }}>Sudah Berhenti</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="muted" style={{ fontSize: '0.8rem' }}>Status:</span>
                <select
                  style={{ width: 'auto', marginTop: 0, padding: '0.25rem 0.6rem', fontSize: '0.82rem' }}
                  value={k.status}
                  onChange={(e) => ubahStatus(`/projects/${id}/issues/${k.id}`, e.target.value)}
                >
                  {STATUS_KENDALA.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.92rem', marginTop: '0.3rem' }}>
              {k.deskripsi}
            </div>

            {k.dampak && (
              <div className="muted" style={{ marginTop: '0.25rem' }}>
                <strong style={{ color: '#475569' }}>Dampak:</strong> {k.dampak}
              </div>
            )}

            <div className="muted" style={{ fontSize: '0.78rem', marginTop: '0.45rem' }}>
              Dilaporkan oleh <b>{k.pelapor}</b> pada {tanggal(k.createdAt)}
            </div>
          </div>
        ))}
      </div>

      {/* Catatan Fasilitasi Dosen */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <HelpCircle size={18} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0 }}>Catatan Fasilitasi & Rencana Tindak Lanjut Dosen</h2>
        </div>

        <form
          onSubmit={simpanTindakLanjut}
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: '#1e293b' }}>
            + Buat Catatan Fasilitasi Baru
          </div>
          <label className="field">
            Catatan Diskusi / Klarifikasi
            <textarea
              value={fu.catatanDiskusi}
              onChange={(e) => setFu({ ...fu, catatanDiskusi: e.target.value })}
              placeholder="Contoh: Diskusi dengan ketua kelompok mengenai pembagian tugas modul autentikasi..."
              required
            />
          </label>
          <label className="field">
            Rencana Tindakan / Solusi
            <textarea
              value={fu.tindakan}
              onChange={(e) => setFu({ ...fu, tindakan: e.target.value })}
              placeholder="Contoh: Mengatur sesi sinkronisasi ulang dan penyesuaian deadline sub-tugas..."
              required
            />
          </label>
          <div className="row" style={{ alignItems: 'flex-end' }}>
            <label className="field" style={{ flex: '1 1 200px', margin: 0 }}>
              Status Pelaksanaan
              <select
                value={fu.status}
                onChange={(e) => setFu({ ...fu, status: e.target.value })}
              >
                {STATUS_TINDAK_LANJUT.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn">
              <Send size={15} />
              <span>Simpan Catatan</span>
            </button>
          </div>
        </form>

        <h3 style={{ marginBottom: '0.75rem' }}>Riwayat Tindak Lanjut</h3>
        {d.tindakLanjut.length === 0 && (
          <p className="muted">Belum ada catatan tindak lanjut yang disimpan.</p>
        )}

        {d.tindakLanjut.map((f) => (
          <div className="item" key={f.id}>
            <div className="row" style={{ marginBottom: '0.4rem' }}>
              <span className="muted" style={{ fontSize: '0.82rem' }}>
                Oleh <b>{f.dosen}</b> • {tanggal(f.createdAt)}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="muted" style={{ fontSize: '0.8rem' }}>Ubah status:</span>
                <select
                  style={{ width: 'auto', marginTop: 0, padding: '0.25rem 0.6rem', fontSize: '0.82rem' }}
                  value={f.status}
                  onChange={(e) => ubahStatus(`/projects/${id}/followups/${f.id}`, e.target.value)}
                >
                  {STATUS_TINDAK_LANJUT.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>
              <strong style={{ color: '#1e293b' }}>Hasil Diskusi:</strong> {f.catatanDiskusi}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#1d4ed8', background: '#eff6ff', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
              <strong>Tindakan:</strong> {f.tindakan}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export default function DetailKelompok() {
  return (
    <Suspense
      fallback={
        <div className="center">
          <p className="muted">Memuat data kelompok...</p>
        </div>
      }
    >
      <DetailKelompokIsi />
    </Suspense>
  );
}
