const prisma = require('../db');

// Memuat project dari :id dan memastikan user berhak mengaksesnya.
// Dosen: harus pemilik project. Mahasiswa: harus anggota.
async function loadProject(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'ID project tidak valid' });

  const project = await prisma.project.findUnique({
    where: { id },
    include: { members: { include: { user: { select: { id: true, nama: true, email: true } } } } },
  });
  if (!project) return res.status(404).json({ error: 'Project tidak ditemukan' });

  const boleh =
    req.user.role === 'dosen'
      ? project.dosenId === req.user.id
      : project.members.some((m) => m.userId === req.user.id);
  if (!boleh) return res.status(403).json({ error: 'Tidak punya akses ke project ini' });

  req.project = project;
  next();
}

module.exports = { loadProject };