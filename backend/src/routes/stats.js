import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const router = Router()

router.post('/', async (req, res) => {
  const { fechaNac, genero } = req.body
  if (!fechaNac || !genero) {
    return res.status(400).json({ error: 'Faltan datos' })
  }
  try {
    const stat = await prisma.anonUserStats.create({
      data: { fechaNac: new Date(fechaNac), genero }
    })
    res.json(stat)
  } catch (e) {
    res.status(500).json({ error: 'Error al guardar estadísticas' })
  }
})

export default router