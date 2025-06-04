// scripts/svg2png.js
import { promises as fs } from 'fs'
import path from 'path'
import fg from 'fast-glob'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

/* ───────────── Helpers de path absolutos ───────────── */
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

/* Directorios fuente/destino RESUELTOS,
   así da igual si lo llamas desde “rol/”, “E:/Desktop/…”, etc. */
const SRC_DIR = path.resolve(__dirname, '../src/cards')
const OUT_DIR = path.resolve(__dirname, '../src/cards-png')
const PATTERN = '**/*.svg'          // todos los .svg en subcarpetas

async function convert() {
  console.log('🔍  Buscando SVGs en:', path.join(SRC_DIR, PATTERN))

  const svgs = await fg(PATTERN, { cwd: SRC_DIR, onlyFiles: true })

  if (svgs.length === 0) {
    console.warn('⚠️  No se encontró ningún SVG. ¿Ruta bien puesta?')
    return
  }

  console.log(`🚀  Convirtiendo ${svgs.length} archivos…`)

  await Promise.all(
    svgs.map(async (relPath) => {
      const inFile  = path.join(SRC_DIR, relPath)
      const outFile = path
        .join(OUT_DIR, relPath)
        .replace(/\.svg$/i, '.png')   // i = case-insensitive

      await fs.mkdir(path.dirname(outFile), { recursive: true })
      const svgBuffer = await fs.readFile(inFile)

      await sharp(svgBuffer)
        // .resize({ width: 512 })     // ← descomenta si quieres tamaño fijo
        .png({ quality: 90 })
        .toFile(outFile)

      console.log(`   ✅  ${relPath} → PNG`)
    })
  )

  console.log('🏁  Conversión terminada, todo nice.')
}

convert().catch((err) => {
  console.error('💥  Falló la conversión:\n', err)
  process.exit(1)
})
