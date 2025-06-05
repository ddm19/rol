import { promises as fs } from 'fs'
import path from 'path'
import fg from 'fast-glob'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SRC_DIR = path.resolve(__dirname, '../src/cards')
const OUT_DIR = path.resolve(__dirname, '../src/cards-png')
const FONT_DIR = path.resolve(__dirname, '../src/fonts')
const PATTERN = '**/*.svg'

const FONT_FILES = [
  {
    name: 'Quintessential',
    files: [
      {
        path: 'Quintessential.ttf',
        weight: '400',
        style: 'normal',
      },
    ],
  },
  {
    name: 'Titillium Web',
    files: [
      { path: 'TitilliumWeb-Light.ttf', weight: '300', style: 'normal' },
      { path: 'TitilliumWeb-LightItalic.ttf', weight: '300', style: 'italic' },
      { path: 'TitilliumWeb-Regular.ttf', weight: '400', style: 'normal' },
      { path: 'TitilliumWeb-Bold.ttf', weight: '700', style: 'normal' },
      { path: 'TitilliumWeb-Black.ttf', weight: '700', style: 'italic' },
      { path: 'TitilliumWeb-BoldItalic.ttf', weight: '700', style: 'italic' },
      { path: 'TitilliumWeb-ExtraLight.ttf', weight: '700', style: 'italic' },
      { path: 'TitilliumWeb-ExtraLightItalic.ttf', weight: '700', style: 'italic' },
      { path: 'TitilliumWeb-Italic.ttf', weight: '700', style: 'italic' },
      { path: 'TitilliumWeb-Light.ttf', weight: '700', style: 'italic' },
      { path: 'TitilliumWeb-LightItalic.ttf', weight: '700', style: 'italic' },
      { path: 'TitilliumWeb-Regular.ttf', weight: '700', style: 'italic' },
      { path: 'TitilliumWeb-SemiBold.ttf', weight: '700', style: 'italic' },
      { path: 'TitilliumWeb-SemiBoldItalic.ttf', weight: '700', style: 'italic' },



    ],
  },
]

async function embedFonts() {
  let style = `<style>`

  for (const font of FONT_FILES) {
    for (const variant of font.files) {
      const fullPath = path.join(FONT_DIR, variant.path)
      const buffer = await fs.readFile(fullPath)
      style += `
@font-face {
  font-family: '${font.name}';
  font-style: ${variant.style};
  font-weight: ${variant.weight};
  src: url('data:font/ttf;base64,${buffer.toString('base64')}') format('truetype');
}
`
    }
  }

  style += `
text {
  font-family: 'Titillium Web', 'Quintessential', sans-serif;
}
</style>
`

  return style
}

async function convert() {
  const svgs = await fg(PATTERN, { cwd: SRC_DIR, onlyFiles: true })

  if (svgs.length === 0) {
    console.warn('⚠️  No se encontró ningún SVG')
    return
  }

  const fontStyle = await embedFonts()

  await Promise.all(
    svgs.map(async (relPath) => {
      const inFile = path.join(SRC_DIR, relPath)
      const outFile = path.join(OUT_DIR, relPath).replace(/\.svg$/i, '.png')

      await fs.mkdir(path.dirname(outFile), { recursive: true })
      let svgContent = await fs.readFile(inFile, 'utf8')

      svgContent = svgContent.replace(
        /<svg([^>]+?)>/,
        `<svg$1>${fontStyle}`
      )

      await sharp(Buffer.from(svgContent))
        .png({ quality: 90 })
        .toFile(outFile)

      console.log(`   ✅  ${relPath} → PNG`)
    })
  )

  console.log('🏁  Conversión terminada con fuentes TTF.')
}

convert().catch((err) => {
  console.error('💥  Falló la conversión:\n', err)
  process.exit(1)
})
