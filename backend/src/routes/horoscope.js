import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import dayjs from 'dayjs'

const prisma = new PrismaClient()
const router = Router()

// Función simple para calcular signo zodiacal
function getZodiac(fecha) {
  const m = fecha.month() + 1, d = fecha.date()
  if ((m==1&&d>=20)||(m==2&&d<=18)) return 'Acuario'
  if ((m==2&&d>=19)||(m==3&&d<=20)) return 'Piscis'
  if ((m==3&&d>=21)||(m==4&&d<=19)) return 'Aries'
  if ((m==4&&d>=20)||(m==5&&d<=20)) return 'Tauro'
  if ((m==5&&d>=21)||(m==6&&d<=20)) return 'Géminis'
  if ((m==6&&d>=21)||(m==7&&d<=22)) return 'Cáncer'
  if ((m==7&&d>=23)||(m==8&&d<=22)) return 'Leo'
  if ((m==8&&d>=23)||(m==9&&d<=22)) return 'Virgo'
  if ((m==9&&d>=23)||(m==10&&d<=22)) return 'Libra'
  if ((m==10&&d>=23)||(m==11&&d<=21)) return 'Escorpio'
  if ((m==11&&d>=22)||(m==12&&d<=21)) return 'Sagitario'
  return 'Capricornio'
}

// GET /api/horoscope?fechaNac=YYYY-MM-DD&genero=M|F
router.get('/', async (req, res) => {
  const { fechaNac, genero } = req.query
  if (!fechaNac || !genero) {
    return res.status(400).json({ error: 'fechaNac y genero son obligatorios' })
  }
  try {
    // Guardar estadística anónima
    await prisma.anonUserStats.create({
      data: { fechaNac: new Date(fechaNac), genero }
    })
    // Determinar signo
    const fecha = dayjs(fechaNac)
    const signo = getZodiac(fecha)
    // Generar horóscopo (puedes integrar aquí tu LLM o reglas fijas)
    const mensaje = `Hoy, como ${signo}, tu energía estará alta. Aprovecha para conectar con tu intuición y tomar decisiones importantes.`
    res.json({ signo, mensaje })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error generando horóscopo' })
  }
})

export default router
