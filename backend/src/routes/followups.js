const router = require('express').Router({ mergeParams: true });
const prisma = require('../db');
const { onlyRole } = require('../middleware/auth');
const { loadProject } = require('../middleware/project');
const { STATUS_TINDAK_LANJUT } = require('../config');

router.use(onlyRole('dosen'), loadProject);

router.get('/', async (req, res) => {
  const list = await prisma.followUp.findMany({
    where: { projectId: req.project.id },
    include: { dosen: { select: { nama: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(list);
});

// Catatan diskusi + tindakan fasilitasi
router.post('/', async (req, res) => {
  const { catatanDiskusi, tindakan, status } = req.body || {};
  if (!catatanDiskusi?.trim() || !tindakan?.trim()) {
    return res.status(400).json({ error: 'Catatan diskusi dan tindakan wajib diisi' });
  }
  const st = status || 'Direncanakan';
  if (!STATUS_TINDAK_LANJUT.includes(st)) return res.status(400).json({ error: 'Status tidak valid' });

  const f = await prisma.followUp.create({
    data: {
      projectId: req.project.id,
      dosenId: req.user.id,
      catatanDiskusi: catatanDiskusi.trim(),
      tindakan: tindakan.trim(),
      status: st,
    },
  });
  res.status(201).json(f);
});

router.patch('/:fid', async (req, res) => {
  const { status } = req.body || {};
  if (!STATUS_TINDAK_LANJUT.includes(status)) return res.status(400).json({ error: 'Status tidak valid' });
  const f = await prisma.followUp.findUnique({ where: { id: Number(req.params.fid) } });
  if (!f || f.projectId !== req.project.id) return res.status(404).json({ error: 'Tindak lanjut tidak ditemukan' });
  res.json(await prisma.followUp.update({ where: { id: f.id }, data: { status } }));
});

module.exports = router;