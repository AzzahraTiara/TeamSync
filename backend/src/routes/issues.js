const router = require('express').Router({ mergeParams: true });
const prisma = require('../db');
const { onlyRole } = require('../middleware/auth');
const { loadProject } = require('../middleware/project');
const { KATEGORI_KENDALA, STATUS_KENDALA } = require('../config');

router.use(loadProject);

// Dosen: semua kendala. Mahasiswa: hanya kendala yang dia laporkan sendiri (privasi).
router.get('/', async (req, res) => {
  const where = { projectId: req.project.id };
  if (req.user.role === 'mahasiswa') where.reporterId = req.user.id;
  const issues = await prisma.issue.findMany({
    where,
    include: { reporter: { select: { nama: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(
    issues.map((i) => ({
      id: i.id,
      kategori: i.kategori,
      deskripsi: i.deskripsi,
      dampak: i.dampak,
      masihBerlangsung: i.masihBerlangsung,
      status: i.status,
      pelapor: req.user.role === 'dosen' ? i.reporter.nama : undefined,
      createdAt: i.createdAt,
    }))
  );
});

router.post('/', onlyRole('mahasiswa'), async (req, res) => {
  const { kategori, deskripsi, dampak, masihBerlangsung } = req.body || {};
  if (!KATEGORI_KENDALA.includes(kategori)) return res.status(400).json({ error: 'Kategori kendala tidak valid' });
  if (!deskripsi || !deskripsi.trim()) return res.status(400).json({ error: 'Deskripsi kendala wajib diisi' });

  const issue = await prisma.issue.create({
    data: {
      projectId: req.project.id,
      reporterId: req.user.id,
      kategori,
      deskripsi: deskripsi.trim(),
      dampak: dampak ? dampak.trim() : null,
      masihBerlangsung: masihBerlangsung !== false,
    },
  });
  res.status(201).json(issue);
});

// Dosen mengubah status penanganan kendala
router.patch('/:issueId', onlyRole('dosen'), async (req, res) => {
  const { status } = req.body || {};
  if (!STATUS_KENDALA.includes(status)) return res.status(400).json({ error: 'Status tidak valid' });

  const issue = await prisma.issue.findUnique({ where: { id: Number(req.params.issueId) } });
  if (!issue || issue.projectId !== req.project.id) return res.status(404).json({ error: 'Kendala tidak ditemukan' });

  res.json(await prisma.issue.update({ where: { id: issue.id }, data: { status } }));
});

module.exports = router;