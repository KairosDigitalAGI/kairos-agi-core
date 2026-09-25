// Cria collage 1920x1080 com Matheus (esq) + Vilson (dir) para cena 2
import sharp from 'sharp'
import { resolve } from 'node:path'

const root = resolve(process.cwd(), 'public/references')
const matheus = resolve(root, 'matheus/matheus-04-homeoffice-laptop-night.webp')
const vilson  = resolve(root, 'vilson/vilson-01-studio-navy.jpg')
const out     = resolve(root, 'ep00-scenes/cena2-founders-collage.jpg')

const W = 1920, H = 1080, half = W / 2

const [mBuf, vBuf] = await Promise.all([
  sharp(matheus).resize(half, H, { fit: 'cover', position: 'centre' }).toBuffer(),
  sharp(vilson).resize(half, H, { fit: 'cover', position: 'centre' }).toBuffer(),
])

await sharp({ create: { width: W, height: H, channels: 3, background: '#040409' } })
  .composite([
    { input: mBuf, left: 0,    top: 0 },
    { input: vBuf, left: half, top: 0 },
  ])
  .jpeg({ quality: 92 })
  .toFile(out)

console.log('Collage salvo:', out)
