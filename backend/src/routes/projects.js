const router = require('express').Router();
const prisma = require('../db');
const { authRequired, onlyRole } = require('../middleware/auth');
const { loadProject } = require('../middleware/project');
const { periodeKe, ringkasPerPeriode, analitikProject } = require('../utils/analytics');

router.use(authRequired);

// Daftar project
// - dosen: semua project miliknya + status kolaborasi
// - mahasiswa: project yang dia ikuti + info sudah/belum isi survei periode ini
router.get('/', async (req, res) => {
  if (req.user.role === 'dosen') {
    const projects = await prisma.project.findMany({
      where: { dosenId: req.user.id },
      include: {
        members: { include: { user: { select: { id: true, nama: true } } } },
        surveys: { include: { ratings: true } },
        issues: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(
      projects.map((p) => {
        const a = analitikProject(p);
        return {
          id: p.id,
          nama: p.nama,
          periodeMulai: p.periodeMulai,
          periodeSelesai: p.periodeSelesai,
          jumlahAnggota: p.members.length,
          periodeKeSekarang: periodeKe(p),
          status: a.status,
          alasan: a.alasan,
          skorTerakhir: a.terakhir ? a.terakhir.skorTotal : null,
          kendalaAktif: a.kendalaAktif,
        };
      })
    );
  }

  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: req.user.id } } },
    include: {
      members: { include: { user: { select: { id: true, nama: true } } } },
      surveys: { where: { userId: req.user.id } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(
    projects.map((p) => {
      const pk = periodeKe(p);
      return {
        id: p.id,
        nama: p.nama,
        periodeMulai: p.periodeMulai,
        periodeSelesai: p.periodeSelesai,
        jumlahAnggota: p.members.length,
        periodeKeSekarang: pk,
        sudahIsiSurvei: pk != null && p.surveys.some((s) => s.periodeKe === pk),
      };
    })
  );
});

// Dosen membuat project + kelompok
router.post('/', onlyRole('dosen'), async (req, res) => {
  const { nama, deskripsi, periodeMulai, periodeSelesai, intervalHari, anggotaIds } = req.body || {};
  const mulai = new Date(periodeMulai);
  const selesai = new Date(periodeSelesai);

  if (!nama || isNaN(mulai) || isNaN(selesai) || selesai <= mulai) {
    return res.status(400).json({ error: 'Nama dan periode monitoring (mulai < selesai) wajib diisi dengan benar' });
  }
  if (![7, 14].includes(Number(intervalHari))) {
    return res.status(400).json({ error: 'Interval survei harus 7 atau 14 hari' });
  }
  if (!Array.isArray(anggotaIds) || anggotaIds.length < 2) {
    return res.status(400).json({ error: 'Pilih minimal 2 anggota kelompok' });
  }

  const ids = [...new Set(anggotaIds.map(Number))];
  const valid = await prisma.user.count({ where: { id: { in: ids }, role: 'mahasiswa' } });
  if (valid !== ids.length) return res.status(400).json({ error: 'Ada anggota yang bukan mahasiswa terdaftar' });

  const project = await prisma.project.create({
    data: {
      nama,
      deskripsi: deskripsi || null,
      dosenId: req.user.id,
      periodeMulai: mulai,
      periodeSelesai: selesai,
      intervalHari: Number(intervalHari),
      members: { create: ids.map((userId) => ({ userId })) },
    },
  });
  res.status(201).json(project);
});

// Detail lengkap untuk dosen (hasil survei, persepsi, kendala, tindak lanjut)
router.get('/:id', onlyRole('dosen'), loadProject, async (req, res) => {
  const p = await prisma.project.findUnique({
    where: { id: req.project.id },
    include: {
      members: { include: { user: { select: { id: true, nama: true, email: true } } } },
      surveys: { include: { ratings: true, user: { select: { nama: true } } }, orderBy: { createdAt: 'asc' } },
      issues: { include: { reporter: { select: { nama: true } } }, orderBy: { createdAt: 'desc' } },
      followUps: { include: { dosen: { select: { nama: true } } }, orderBy: { createdAt: 'desc' } },
    },
  });
  const a = analitikProject(p);

  res.json({
    project: {
      id: p.id,
      nama: p.nama,
      deskripsi: p.deskripsi,
      periodeMulai: p.periodeMulai,
      periodeSelesai: p.periodeSelesai,
      intervalHari: p.intervalHari,
      periodeKeSekarang: periodeKe(p),
    },
    anggota: p.members.map((m) => m.user),
    status: a.status,
    alasan: a.alasan,
    tren: a.tren,
    persepsi: a.persepsi,
    kendalaAktif: a.kendalaAktif,
    jawaban: p.surveys.map((s) => ({
      periodeKe: s.periodeKe,
      nama: s.user.nama,
      komunikasi: s.komunikasi,
      keterbukaan: s.keterbukaan,
      koordinasi: s.koordinasi,
      bantuan: s.bantuan,
      diskusi: s.diskusi,
      keseimbangan: s.keseimbangan,
      komentar: s.komentar,
      createdAt: s.createdAt,
    })),
    kendala: p.issues.map((i) => ({
      id: i.id,
      kategori: i.kategori,
      deskripsi: i.deskripsi,
      dampak: i.dampak,
      masihBerlangsung: i.masihBerlangsung,
      status: i.status,
      pelapor: i.reporter.nama,
      createdAt: i.createdAt,
    })),
    tindakLanjut: p.followUps.map((f) => ({
      id: f.id,
      catatanDiskusi: f.catatanDiskusi,
      tindakan: f.tindakan,
      status: f.status,
      dosen: f.dosen.nama,
      createdAt: f.createdAt,
    })),
  });
});

// Ringkasan untuk mahasiswa: hanya agregat kelompok, tanpa jawaban individu
// dan tanpa status/persepsi per anggota (privasi, dokumen bagian 13)
router.get('/:id/ringkasan', onlyRole('mahasiswa'), loadProject, async (req, res) => {
  const surveys = await prisma.survey.findMany({ where: { projectId: req.project.id } });
  res.json({
    project: {
      id: req.project.id,
      nama: req.project.nama,
      periodeMulai: req.project.periodeMulai,
      periodeSelesai: req.project.periodeSelesai,
      periodeKeSekarang: periodeKe(req.project),
    },
    anggota: req.project.members.map((m) => ({ id: m.user.id, nama: m.user.nama })),
    tren: ringkasPerPeriode(surveys),
  });
});

router.use('/:id/surveys', require('./surveys'));
router.use('/:id/issues', require('./issues'));
router.use('/:id/followups', require('./followups'));

module.exports = router;