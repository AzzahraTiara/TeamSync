'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  ClipboardList,
  MessageSquareWarning,
  Send,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import Shell from '@/components/Shell';
import ScoreInput from '@/components/ScoreInput';
import TrendChart from '@/components/TrendChart';
import { api } from '@/lib/api';
import { ASPEK, KATEGORI_KENDALA, tanggal } from '@/lib/constants';

function HalamanKelompokIsi() {
  const { id } = useParams();
  const [tab, setTab] = useState('survei');
  const [ringkasan, setRingkasan] = useState(null);
  const [status, setStatus] = useState(null);
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState('');
  const [pesan, setPesan] = useState('');

  const [skor, setSkor] = useState({});
  const [kontribusi, setKontribusi] = useState({});
  const [komentar, setKomentar] = useState('');
  const [kendala, setKendala] = useState({
    kategori: KATEGORI_KENDALA[0],
    deskripsi: '',
    dampak: '',
    masihBerlangsung: true,
  });

  const muat = useCallback(async () => {
    try {
      const [r, s, i] = await Promise.all([
        api(`/projects/${id}/ringkasan`),
        api(`/projects/${id}/surveys/status`),
        api(`/projects/${id}/issues`),
      ]);
      setRingkasan(r);
      setStatus(s);
      setIssues(i);
    } catch (e) {
      setError(e.message);
    }
  }, [id]);

  useEffect(() => {
    muat();
  }, [muat]);

  async function kirimSurvei(e) {
    e.preventDefault();
    setError('');
    setPesan('');
    const belumAspek = ASPEK.some((a) => !skor[a.key]);
    const belumKontribusi = status.anggotaLain.some((m) => !kontribusi[m.id]);
    if (belumAspek || belumKontribusi) {
      return setError('Mohon lengkapi seluruh pertanyaan aspek kolaborasi dan penilaian kontribusi rekan tim.');
    }
    try {
      await api(`/projects/${id}/surveys`, {
        method: 'POST',
        body: {
          ...skor,
          komentar,
          kontribusi: status.anggotaLain.map((m) => ({ userId: m.id, skor: kontribusi[m.id] })),
        },
      });
      setPesan('Terima kasih! Survei periode ini telah berhasil dikirim ke dosen pembimbing.');
      setSkor({});
      setKontribusi({});
      setKomentar('');
      await muat();
    } catch (err) {
      setError(err.message);
    }
  }

  async function kirimKendala(e) {
    e.preventDefault();
    setError('');
    setPesan('');
    try {
      await api(`/projects/${id}/issues`, { method: 'POST', body: kendala });
      setPesan('Laporan kendala komunikasi berhasil disimpan.');
      setKendala({
        kategori: KATEGORI_KENDALA[0],
        deskripsi: '',
        dampak: '',
        masihBerlangsung: true,
      });
      await muat();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !ringkasan) {
    return (
      <Shell role="mahasiswa">
        <div className="error">{error}</div>
      </Shell>
    );
  }

  if (!ringkasan || !status) {
    return (
      <Shell role="mahasiswa">
        <div className="card center">
          <p className="muted">Memuat data kelompok...</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell role="mahasiswa">
      <Link href="/mahasiswa" className="back-link">
        <ArrowLeft size={16} />
        Kembali ke Kelompok Saya
      </Link>

      <div className="card" style={{ borderLeft: '4px solid var(--primary)', marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{ringkasan.project.nama}</h1>
        <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <Users size={15} style={{ color: 'var(--primary)' }} />
          <span>
            Anggota Tim: <strong>{ringkasan.anggota.map((a) => a.nama).join(', ')}</strong>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={tab === 'survei' ? 'on' : ''}
          onClick={() => {
            setTab('survei');
            setError('');
            setPesan('');
          }}
        >
          <ClipboardList size={15} />
          Survei Kolaborasi
        </button>
        <button
          className={tab === 'kendala' ? 'on' : ''}
          onClick={() => {
            setTab('kendala');
            setError('');
            setPesan('');
          }}
        >
          <MessageSquareWarning size={15} />
          Lapor Kendala
        </button>
        <button
          className={tab === 'ringkasan' ? 'on' : ''}
          onClick={() => {
            setTab('ringkasan');
            setError('');
            setPesan('');
          }}
        >
          <BarChart2 size={15} />
          Ringkasan Kelompok
        </button>
      </div>

      {error && (
        <div className="error">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {pesan && (
        <div className="ok">
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{pesan}</span>
        </div>
      )}

      {/* TAB 1: SURVEI */}
      {tab === 'survei' && (
        <div className="card">
          {status.periodeKe == null ? (
            <div className="center" style={{ padding: '2rem 1rem' }}>
              <Calendar size={36} style={{ color: '#94a3b8', margin: '0 auto 0.75rem' }} />
              <h3>Di Luar Periode Survei</h3>
              <p className="muted" style={{ maxWidth: '420px', margin: '0.4rem auto 0' }}>
                Saat ini jadwal survei belum dibuka atau periode monitoring project belum dimulai.
              </p>
            </div>
          ) : status.sudahIsi ? (
            <div className="center" style={{ padding: '2.5rem 1rem' }}>
              <CheckCircle2 size={44} style={{ color: '#10b981', margin: '0 auto 0.75rem' }} />
              <h2>Survei Periode {status.periodeKe} Selesai</h2>
              <p className="muted" style={{ maxWidth: '440px', margin: '0.4rem auto 0' }}>
                Anda telah menyelesaikan survei pada periode ini. Jawaban Anda telah direkam untuk membantu dosen memfasilitasi kerja sama tim. Survei berikutnya akan otomatis dibuka pada periode mendatang.
              </p>
            </div>
          ) : (
            <form onSubmit={kirimSurvei}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>Survei Kolaborasi · Periode ke-{status.periodeKe}</h2>
                <span className="badge blue">Wajib Diisi</span>
              </div>

              <div className="note">
                <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Privasi & Keterbukaan:</strong> Jawaban Anda dapat dilihat oleh dosen pembimbing guna supervisi dan fasilitasi tim. Anggota kelompok lain tidak dapat melihat rincian jawaban persepsi individumu.
                </div>
              </div>

              <div className="scale-hint">
                Keterangan skala: <strong>1</strong> = Sangat Tidak Setuju &nbsp;•&nbsp; <strong>5</strong> = Sangat Setuju
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {ASPEK.map((a, idx) => (
                  <div className="q" key={a.key}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.5rem' }}>
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '0.94rem', color: '#1e293b' }}>{a.label}</span>
                    </div>
                    <ScoreInput
                      name={a.key}
                      value={skor[a.key]}
                      onChange={(n) => setSkor({ ...skor, [a.key]: n })}
                    />
                  </div>
                ))}
              </div>

              <h2 style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>
                Persepsi Kontribusi Rekan Satu Tim
              </h2>
              <div className="scale-hint">
                Keterangan skala: <strong>1</strong> = Sangat kurang kontribusi &nbsp;•&nbsp; <strong>5</strong> = Sangat aktif berkontribusi
              </div>

              {status.anggotaLain.map((m) => (
                <div className="q" key={m.id}>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
                    {m.nama}
                  </div>
                  <ScoreInput
                    name={`k${m.id}`}
                    value={kontribusi[m.id]}
                    onChange={(n) => setKontribusi({ ...kontribusi, [m.id]: n })}
                  />
                </div>
              ))}

              <label className="field" style={{ marginTop: '1.25rem' }}>
                Komentar / Saran Tambahan untuk Tim (Opsional)
                <textarea
                  value={komentar}
                  onChange={(e) => setKomentar(e.target.value)}
                  placeholder="Ceritakan dinamika kerja kelompok, kesepakatan, atau apresiasi rekan tim..."
                />
              </label>

              <button
                type="submit"
                className="btn"
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              >
                <Send size={16} />
                <span>Kirim Jawaban Survei Periode {status.periodeKe}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: LAPOR KENDALA */}
      {tab === 'kendala' && (
        <>
          <form className="card" onSubmit={kirimKendala}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <MessageSquareWarning size={20} style={{ color: 'var(--primary)' }} />
              <h2 style={{ margin: 0 }}>Laporkan Kendala Komunikasi & Kerja Sama</h2>
            </div>
            <p className="muted" style={{ marginBottom: '1.25rem' }}>
              Informasikan hambatan komunikasi tim secara konstruktif agar dosen dapat memberikan pendampingan yang tepat.
            </p>

            <label className="field">
              Kategori Hambatan
              <select
                value={kendala.kategori}
                onChange={(e) => setKendala({ ...kendala, kategori: e.target.value })}
              >
                {KATEGORI_KENDALA.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </label>

            <label className="field">
              Deskripsi Kendala
              <textarea
                value={kendala.deskripsi}
                onChange={(e) => setKendala({ ...kendala, deskripsi: e.target.value })}
                placeholder="Jelaskan kendala apa yang sedang dihadapi tim secara spesifik..."
                required
              />
            </label>

            <label className="field">
              Dampak terhadap Pengerjaan Tugas
              <textarea
                value={kendala.dampak}
                onChange={(e) => setKendala({ ...kendala, dampak: e.target.value })}
                placeholder="Bagaimana kendala ini mempengaruhi progres atau target kelompok?"
              />
            </label>

            <label className="check" style={{ margin: '1rem 0 1.25rem' }}>
              <input
                type="checkbox"
                checked={kendala.masihBerlangsung}
                onChange={(e) =>
                  setKendala({ ...kendala, masihBerlangsung: e.target.checked })
                }
              />
              <span>Kendala ini saat ini masih berlangsung</span>
            </label>

            <button type="submit" className="btn">
              <Send size={15} />
              <span>Kirim Laporan Kendala</span>
            </button>
          </form>

          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Riwayat Kendala yang Kamu Laporkan</h2>
            {issues.length === 0 && (
              <p className="muted">Belum ada laporan kendala yang dikirimkan.</p>
            )}

            {issues.map((k) => (
              <div className="item" key={k.id}>
                <div className="row" style={{ marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge blue">{k.kategori}</span>
                    {k.masihBerlangsung ? (
                      <span className="badge red" style={{ fontSize: '0.72rem' }}>Masih Berlangsung</span>
                    ) : (
                      <span className="badge gray" style={{ fontSize: '0.72rem' }}>Terselesaikan</span>
                    )}
                  </div>
                  <span className="badge gray" style={{ fontSize: '0.78rem' }}>
                    Status: {k.status}
                  </span>
                </div>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.92rem' }}>
                  {k.deskripsi}
                </div>
                {k.dampak && (
                  <div className="muted" style={{ marginTop: '0.25rem' }}>
                    <strong>Dampak:</strong> {k.dampak}
                  </div>
                )}
                <div className="muted" style={{ fontSize: '0.78rem', marginTop: '0.45rem' }}>
                  Dilaporkan pada {tanggal(k.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* TAB 3: RINGKASAN KELOMPOK */}
      {tab === 'ringkasan' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <BarChart2 size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ margin: 0 }}>Tren Skor Kolaborasi Kelompok</h2>
          </div>
          <p className="muted" style={{ marginBottom: '1.25rem' }}>
            Grafik ini menyajikan rata-rata agregat kesehatan kerja sama tim dari seluruh anggota per periode.
          </p>
          <TrendChart data={ringkasan.tren} />
        </div>
      )}
    </Shell>
  );
}

export default function HalamanKelompok() {
  return (
    <Suspense
      fallback={
        <div className="center">
          <p className="muted">Memuat data kelompok...</p>
        </div>
      }
    >
      <HalamanKelompokIsi />
    </Suspense>
  );
}
