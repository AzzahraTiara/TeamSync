const { ASPEK, THRESHOLD } = require('../config');

const DAY = 24 * 60 * 60 * 1000;
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
const round = (n) => (n == null ? null : Math.round(n * 100) / 100);

// Periode survei ke-berapa untuk tanggal tertentu. null = di luar periode monitoring.
function periodeKe(project, now = new Date()) {
  const start = new Date(project.periodeMulai).getTime();
  const end = new Date(project.periodeSelesai).getTime() + DAY - 1; // akhir hari
  const t = now.getTime();
  if (t < start || t > end) return null;
  return Math.floor((t - start) / (project.intervalHari * DAY)) + 1;
}

// Rata-rata skor per periode (agregat, tanpa identitas pengisi)
function ringkasPerPeriode(surveys) {
  const byPeriode = new Map();
  for (const s of surveys) {
    if (!byPeriode.has(s.periodeKe)) byPeriode.set(s.periodeKe, []);
    byPeriode.get(s.periodeKe).push(s);
  }
  return [...byPeriode.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([ke, list]) => {
      const rata = {};
      for (const a of ASPEK) rata[a] = round(avg(list.map((s) => s[a])));
      return {
        periodeKe: ke,
        responden: list.length,
        rata,
        skorTotal: round(avg(ASPEK.map((a) => rata[a]))),
      };
    });
}

// Perbedaan persepsi kontribusi antaranggota (hanya penilaian dari anggota lain).
// Ini sinyal untuk diklarifikasi, bukan kesimpulan bahwa seseorang tidak bekerja.
function perbedaanPersepsi(surveysPeriode, members) {
  const nama = new Map(members.map((m) => [m.user.id, m.user.nama]));
  const skorPerTarget = new Map();
  for (const s of surveysPeriode) {
    for (const r of s.ratings) {
      if (r.targetUserId === s.userId) continue;
      if (!skorPerTarget.has(r.targetUserId)) skorPerTarget.set(r.targetUserId, []);
      skorPerTarget.get(r.targetUserId).push(r.skor);
    }
  }
  const anggota = [...skorPerTarget.entries()].map(([userId, skor]) => ({
    userId,
    nama: nama.get(userId) || `User ${userId}`,
    rata: round(avg(skor)),
    jumlahPenilai: skor.length,
  }));
  const rataList = anggota.map((a) => a.rata);
  const selisih = rataList.length >= 2 ? round(Math.max(...rataList) - Math.min(...rataList)) : null;
  return { anggota, selisih };
}

// Status = indikator awal, bukan keputusan otomatis (dokumen 5.1)
function hitungStatus({ skorTotal, selisih, kendalaAktif }) {
  if (skorTotal == null) return { status: 'Belum Ada Data', alasan: [] };
  let level = 0;
  const alasan = [];
  const naik = (l, teks) => { level = Math.max(level, l); alasan.push(teks); };

  if (skorTotal < THRESHOLD.skorFasilitasi) naik(2, `Skor kolaborasi rendah (${skorTotal})`);
  else if (skorTotal < THRESHOLD.skorBaik) naik(1, `Skor kolaborasi perlu dipantau (${skorTotal})`);

  if (selisih != null) {
    if (selisih >= THRESHOLD.selisihFasilitasi) naik(2, `Persepsi kontribusi antaranggota berbeda jauh (selisih ${selisih})`);
    else if (selisih >= THRESHOLD.selisihPantau) naik(1, `Persepsi kontribusi antaranggota agak berbeda (selisih ${selisih})`);
  }

  if (kendalaAktif >= THRESHOLD.kendalaFasilitasi) naik(2, `${kendalaAktif} kendala masih aktif`);
  else if (kendalaAktif >= THRESHOLD.kendalaPantau) naik(1, `${kendalaAktif} kendala masih aktif`);

  return { status: ['Baik', 'Perlu Dipantau', 'Perlu Fasilitasi'][level], alasan };
}

// Gabungan analitik satu project. `project` harus include members.user, surveys.ratings, issues.
function analitikProject(project) {
  const tren = ringkasPerPeriode(project.surveys);
  const terakhir = tren[tren.length - 1] || null;
  const persepsi = terakhir
    ? perbedaanPersepsi(project.surveys.filter((s) => s.periodeKe === terakhir.periodeKe), project.members)
    : null;
  const kendalaAktif = project.issues.filter((i) => i.masihBerlangsung && i.status !== 'Selesai').length;
  const { status, alasan } = hitungStatus({
    skorTotal: terakhir ? terakhir.skorTotal : null,
    selisih: persepsi ? persepsi.selisih : null,
    kendalaAktif,
  });
  return { tren, terakhir, persepsi, kendalaAktif, status, alasan };
}

module.exports = { periodeKe, ringkasPerPeriode, perbedaanPersepsi, hitungStatus, analitikProject };