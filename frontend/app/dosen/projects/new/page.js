'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FolderPlus,
  Users,
  Calendar,
  Clock,
  UserPlus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';

export default function ProjectBaru() {
  const router = useRouter();
  const [mahasiswa, setMahasiswa] = useState([]);
  const [form, setForm] = useState({
    nama: '',
    deskripsi: '',
    periodeMulai: '',
    periodeSelesai: '',
    intervalHari: 7,
  });
  const [dipilih, setDipilih] = useState([]);
  const [akun, setAkun] = useState({ nama: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [infoAkun, setInfoAkun] = useState('');
  const [loading, setLoading] = useState(false);

  const muatMahasiswa = () =>
    api('/users/mahasiswa').then(setMahasiswa).catch((e) => setError(e.message));

  useEffect(() => {
    muatMahasiswa();
    setForm((f) => ({ ...f, periodeMulai: new Date().toISOString().slice(0, 10) }));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggle = (id) =>
    setDipilih((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  async function buatAkun(e) {
    e.preventDefault();
    setError('');
    setInfoAkun('');
    try {
      const baru = await api('/users/mahasiswa', { method: 'POST', body: akun });
      setInfoAkun(`Akun mahasiswa "${baru.nama}" berhasil dibuat dan ditambahkan ke daftar.`);
      setAkun({ nama: '', email: '', password: '' });
      await muatMahasiswa();
      setDipilih((d) => [...d, baru.id]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (dipilih.length < 2) {
      return setError('Silakan pilih minimal 2 mahasiswa sebagai anggota kelompok.');
    }
    setLoading(true);
    try {
      const p = await api('/projects', {
        method: 'POST',
        body: { ...form, intervalHari: Number(form.intervalHari), anggotaIds: dipilih },
      });
      router.replace(`/dosen/projects/${p.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <Shell role="dosen">
      <Link href="/dosen" className="back-link">
        <ArrowLeft size={16} />
        Kembali ke Dashboard Dosen
      </Link>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1>Buat Project & Kelompok Baru</h1>
        <p className="muted" style={{ marginTop: '0.2rem' }}>
          Tentukan periode pemantauan dan pilih mahasiswa anggota tim.
        </p>
      </div>

      {error && (
        <div className="error">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={submit} className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <FolderPlus size={20} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0 }}>Informasi Kelompok & Jadwal</h2>
        </div>

        <label className="field">
          Nama Project / Kelompok
          <input
            type="text"
            value={form.nama}
            onChange={set('nama')}
            placeholder="Contoh: Kelompok 1 - Sistem Informasi Rumah Sakit"
            required
          />
        </label>

        <label className="field">
          Deskripsi Project (opsional)
          <textarea
            value={form.deskripsi}
            onChange={set('deskripsi')}
            placeholder="Deskripsi singkat mengenai lingkup tugas project..."
          />
        </label>

        <div className="grid2">
          <label className="field">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} style={{ color: 'var(--primary)' }} />
              Periode Monitoring: Mulai
            </span>
            <input type="date" value={form.periodeMulai} onChange={set('periodeMulai')} required />
          </label>
          <label className="field">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} style={{ color: 'var(--primary)' }} />
              Periode Monitoring: Selesai
            </span>
            <input type="date" value={form.periodeSelesai} onChange={set('periodeSelesai')} required />
          </label>
        </div>

        <label className="field">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={14} style={{ color: 'var(--primary)' }} />
            Frekuensi Pengisian Survei
          </span>
          <select value={form.intervalHari} onChange={set('intervalHari')}>
            <option value={7}>Setiap 1 Minggu (7 Hari)</option>
            <option value={14}>Setiap 2 Minggu (14 Hari)</option>
          </select>
        </label>

        <div style={{ marginTop: '1.5rem', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
              Pilih Anggota Kelompok
            </span>
            <span className="badge blue">{dipilih.length} mahasiswa terpilih</span>
          </div>
          <p className="muted" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
            Pilih minimal 2 mahasiswa untuk membentuk kelompok kolaboratif.
          </p>

          {mahasiswa.length === 0 ? (
            <p className="muted" style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
              Belum ada data mahasiswa terdaftar. Silakan tambahkan akun mahasiswa di form bawah.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '0.65rem',
                maxHeight: '300px',
                overflowY: 'auto',
                padding: '0.25rem',
              }}
            >
              {mahasiswa.map((m) => {
                const isSelected = dipilih.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => toggle(m.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.7rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                      background: isSelected ? 'var(--primary-light)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ pointerEvents: 'none', accentColor: 'var(--primary)' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.nama}
                      </div>
                      <div className="muted" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.email}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn"
          disabled={loading}
          style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem' }}
        >
          {loading ? 'Menyimpan Project...' : 'Simpan & Buka Project'}
        </button>
      </form>

      {/* Tambah Akun Mahasiswa Card */}
      <form onSubmit={buatAkun} className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <UserPlus size={18} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Tambah Akun Mahasiswa Baru</h2>
        </div>
        <p className="muted" style={{ marginBottom: '1rem', fontSize: '0.82rem' }}>
          Jika mahasiswa belum memiliki akun, buatkan akun secara instan di sini.
        </p>

        {infoAkun && (
          <div className="ok">
            <CheckCircle2 size={16} />
            <span>{infoAkun}</span>
          </div>
        )}

        <div className="grid2">
          <label className="field">
            Nama Lengkap
            <input
              type="text"
              value={akun.nama}
              onChange={(e) => setAkun({ ...akun, nama: e.target.value })}
              placeholder="Contoh: Budi Santoso"
              required
            />
          </label>
          <label className="field">
            Email Mahasiswa
            <input
              type="email"
              value={akun.email}
              onChange={(e) => setAkun({ ...akun, email: e.target.value })}
              placeholder="budi@teamsync.test"
              required
            />
          </label>
        </div>

        <label className="field">
          Password Sementara (min. 6 karakter)
          <input
            type="text"
            value={akun.password}
            onChange={(e) => setAkun({ ...akun, password: e.target.value })}
            placeholder="misal: mhs123"
            required
          />
        </label>

        <button type="submit" className="btn ghost" style={{ marginTop: '0.25rem' }}>
          <UserPlus size={15} />
          <span>Buat & Daftarkan Mahasiswa</span>
        </button>
      </form>
    </Shell>
  );
}
