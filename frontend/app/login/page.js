'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, AlertCircle, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { api, setSession } from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pastikan state loading selalu bersih setiap kali halaman login dibuka
  useEffect(() => {
    setLoading(false);
    setError('');
  }, []);

  async function submit(e) {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      setSession(token, user);
      router.replace(user.role === 'dosen' ? '/dosen' : '/mahasiswa');
    } catch (err) {
      setError(err.message || 'Gagal masuk. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  }

  const isiDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(false);
  };

  return (
    <div className="login-box">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand-icon">
            <Layers size={28} />
          </div>
          <h1>
            Team<span style={{ color: 'var(--primary)' }}>Sync</span>
          </h1>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            Monitoring & supervisi kolaborasi project kelompok
          </p>
        </div>

        {error && (
          <div className="error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit}>
          <label className="field">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@teamsync.test"
              required
            />
          </label>
          <label className="field">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem 1rem' }}
          >
            {loading ? 'Memproses...' : 'Masuk ke Sistem'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="demo-account-box">
          <p className="muted" style={{ fontSize: '0.8rem', textAlign: 'center' }}>
            Klik akun demo di bawah untuk mengisi cepat:
          </p>
          <div className="demo-pills">
            <button
              type="button"
              className="demo-btn"
              onClick={() => isiDemo('dosen@teamsync.test', 'dosen123')}
            >
              <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#2563eb' }} />
              Dosen
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => isiDemo('mhs1@teamsync.test', 'mhs123')}
            >
              <UserCheck size={14} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#10b981' }} />
              Mahasiswa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
