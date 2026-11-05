// Aspek survei (skala 1-5) sesuai dokumen konsep bagian 5.3
const ASPEK = ['komunikasi', 'keterbukaan', 'koordinasi', 'bantuan', 'diskusi', 'keseimbangan'];

const KATEGORI_KENDALA = [
  'Miskomunikasi',
  'Informasi tidak tersampaikan',
  'Perbedaan pendapat',
  'Kesulitan menyampaikan pendapat',
  'Koordinasi kurang baik',
];

const STATUS_KENDALA = ['Baru', 'Ditangani', 'Selesai'];
const STATUS_TINDAK_LANJUT = ['Direncanakan', 'Berjalan', 'Selesai'];

// Batas status. Dokumen menyebut batas ini perlu ditetapkan bersama dosen,
// jadi cukup ubah angka di sini kalau sudah ada kesepakatan.
const THRESHOLD = {
  skorBaik: 3.8,          // skor rata-rata >= ini dianggap aman
  skorFasilitasi: 3.0,    // skor rata-rata < ini -> Perlu Fasilitasi
  selisihPantau: 1.0,     // selisih rata-rata persepsi kontribusi antaranggota
  selisihFasilitasi: 1.5,
  kendalaPantau: 1,       // jumlah kendala aktif
  kendalaFasilitasi: 3,
};

module.exports = { ASPEK, KATEGORI_KENDALA, STATUS_KENDALA, STATUS_TINDAK_LANJUT, THRESHOLD };