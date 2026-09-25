import sharp from 'sharp'

const out = process.argv[2]
const W = 1080, H = 1920

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" x2="1">
      <stop offset="0" stop-color="#00b4ff"/>
      <stop offset="0.5" stop-color="#7b2fff"/>
      <stop offset="1" stop-color="#e040fb"/>
    </linearGradient>
  </defs>
  <text x="540" y="400" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="66" fill="#ffffff">SEU WHATSAPP VENDE</text>
  <text x="540" y="490" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="66" fill="url(#g)">ENQUANTO VOCÊ DORME</text>
  <rect x="440" y="540" width="200" height="6" rx="3" fill="url(#g)"/>
  <text x="540" y="1400" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="44" fill="#ffffff">Comente <tspan fill="#e040fb">KAIROS</tspan></text>
  <text x="540" y="1460" text-anchor="middle" font-family="DejaVu Sans" font-size="34" fill="#c9c9d6">e veja o time de IA no seu negócio</text>
</svg>`

await sharp(Buffer.from(svg)).png().toFile(out)
console.log('overlay:', out)
