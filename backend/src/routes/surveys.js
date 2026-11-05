const router = require('express').Router({ mergeParams: true });
const prisma = require('../db');
const { onlyRole } = require('../middleware/auth');
const { loadProject } = require('../middleware/project');
const { ASPEK } = require('../config');
const { periodeKe } = require('../utils/analytics');

router.use(onlyRole('mahasiswa'), loadProject);

const skorValid = (n) => Number.isInteger(n) && n >= 1 && n <= 5;

// Status survei periode ini + daftar anggota lain yang harus dinilai
router.get('/status', async (req, res) => {
  const pk = periodeKe(req.project);
  const sudahIsi =
    pk != null &&
    (await prisma.survey.count({
      where: { projectId: req.project.id, userId: req.user.id, periodeKe: pk },
    })) > 0;
  res.json({
    periodeKe: pk,
    sudahIsi,
    anggotaLain: req.project.members
      .filter((m) => m.userId !== req.user.id)
      .map((m) => ({ id: m.user.id, nama: m.user.nama })),
  });
});

// Isi survei periode berjalan (satu kali per periode)
router.post('/', async (req, res) => {
  const pk = periodeKe(req.project);
  if (pk == null) return res.status(400).json({ error: 'Saat ini di luar periode monitoring' });

  const body = req.body || {};
  for (const a of ASPEK) {
    if (!skorValid(Number(body[a]))) return res.status(400).json({ error: `Skor "${a}" harus 1-5` });
  }

  const lain = req.project.members.filter((m) => m.userId !== req.user.id).map((m) => m.userId);
  const kontribusi = Array.isArray(body.kontribusi) ? body.kontribusi : [];
  const targetIds = kontribusi.map((k) => Number(k.userId));
  const lengkap =
    targetIds.length === lain.length && lain.every((id) => targetIds.includes(id)) &&
    kontribusi.every((k) => skorValid(Number(k.skor)));
  if (!lengkap) return res.status(400).json({ error: 'Nilai kontribusi semua anggota lain (1-5) wajib diisi' });

  try {
    const survey = await prisma.survey.create({
      data: {
        projectId: req.project.id,
        userId: req.user.id,
        periodeKe: pk,
        komunikasi: Number(body.komunikasi),
        keterbukaan: Number(body.keterbukaan),
        koordinasi: Number(body.koordinasi),
        bantuan: Number(body.bantuan),
        diskusi: Number(body.diskusi),
        keseimbangan: Number(body.keseimbangan),
        komentar: body.komentar || null,
        ratings: { create: kontribusi.map((k) => ({ targetUserId: Number(k.userId), skor: Number(k.skor) })) },
      },
    });
    res.status(201).json({ id: survey.id, periodeKe: pk });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Kamu sudah mengisi survei periode ini' });
    throw err;
  }
});

module.exports = router;