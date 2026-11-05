// Pertanyaan survei (skala 1-5). Key harus sama dengan di backend (config.js).
export const ASPEK = [
  { key: 'komunikasi', label: 'Informasi di tim disampaikan dengan jelas', pendek: 'Komunikasi' },
  { key: 'keterbukaan', label: 'Saya nyaman menyampaikan pendapat dan masalah di tim', pendek: 'Keterbukaan' },
  { key: 'koordinasi', label: 'Koordinasi pekerjaan antaranggota berjalan baik', pendek: 'Koordinasi' },
  { key: 'bantuan', label: 'Anggota bersedia saling membantu', pendek: 'Saling membantu' },
  { key: 'diskusi', label: 'Semua anggota terlibat dalam diskusi', pendek: 'Keterlibatan' },
  { key: 'keseimbangan', label: 'Pembagian kontribusi terasa seimbang', pendek: 'Keseimbangan' },
];

// Harus sama dengan KATEGORI_KENDALA di backend
export const KATEGORI_KENDALA = [
  'Miskomunikasi',
  'Informasi tidak tersampaikan',
  'Perbedaan pendapat',
  'Kesulitan menyampaikan pendapat',
  'Koordinasi kurang baik',
];

export const STATUS_KENDALA = ['Baru', 'Ditangani', 'Selesai'];
export const STATUS_TINDAK_LANJUT = ['Direncanakan', 'Berjalan', 'Selesai'];

export const tanggal = (d) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });