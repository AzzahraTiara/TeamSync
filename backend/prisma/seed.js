require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upsertUser(nama, email, password, role) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { nama, email, passwordHash: await bcrypt.hash(password, 10), role },
  });
}

async function main() {
  const dosen = await upsertUser('Dosen Pembimbing', 'dosen@teamsync.test', 'dosen123', 'dosen');
  const mhs = [];
  for (const [i, nama] of ['Andi', 'Budi', 'Citra', 'Dina'].entries()) {
    mhs.push(await upsertUser(nama, `mhs${i + 1}@teamsync.test`, 'mhs123', 'mahasiswa'));
  }

  const ada = await prisma.project.findFirst({ where: { dosenId: dosen.id } });
  if (!ada) {
    const hariIni = new Date();
    const mulai = new Date(hariIni.getTime() - 7 * 86400000);
    const selesai = new Date(hariIni.getTime() + 60 * 86400000);
    await prisma.project.create({
      data: {
        nama: 'Aplikasi Peminjaman Barang',
        deskripsi: 'Contoh kelompok untuk demo TeamSync',
        dosenId: dosen.id,
        periodeMulai: mulai,
        periodeSelesai: selesai,
        intervalHari: 7,
        members: { create: mhs.map((m) => ({ userId: m.id })) },
      },
    });
  }
  console.log('Seed selesai. Login: dosen@teamsync.test / dosen123, mhs1..mhs4@teamsync.test / mhs123');
}

main().finally(() => prisma.$disconnect());