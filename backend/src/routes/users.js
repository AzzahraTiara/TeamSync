const router = require('express').Router();
const bcrypt = require('bcryptjs');
const prisma = require('../db');
const { authRequired, onlyRole } = require('../middleware/auth');

router.use(authRequired, onlyRole('dosen'));

// Daftar mahasiswa (untuk memilih anggota kelompok)
router.get('/mahasiswa', async (req, res) => {
  const list = await prisma.user.findMany({
    where: { role: 'mahasiswa' },
    select: { id: true, nama: true, email: true },
    orderBy: { nama: 'asc' },
  });
  res.json(list);
});

// Dosen membuatkan akun mahasiswa
router.post('/mahasiswa', async (req, res) => {
  const { nama, email, password } = req.body || {};
  if (!nama || !email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Nama, email, dan password (min. 6 karakter) wajib diisi' });
  }
  const sudahAda = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (sudahAda) return res.status(409).json({ error: 'Email sudah terdaftar' });

  const user = await prisma.user.create({
    data: { nama, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 10), role: 'mahasiswa' },
    select: { id: true, nama: true, email: true },
  });
  res.status(201).json(user);
});

module.exports = router;