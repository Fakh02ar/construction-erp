import fs from 'node:fs'

const layoutCandidates = [
  'app/layout.tsx',
  'app/layout.jsx',
  'app/layout.js',
  'src/app/layout.tsx',
  'src/app/layout.jsx',
  'src/app/layout.js',
]

const layoutPath = layoutCandidates.find((candidate) =>
  fs.existsSync(candidate)
)

if (!layoutPath) {
  console.warn('[remove-v0] Could not find a Next.js root layout')
  process.exit(0)
}

const content = fs.readFileSync(layoutPath, 'utf8')

// Remove all v0 branding references
const cleanedContent = content
  .replace(/generator:\s*['"]v0\.app['"],?/g, '')
  .replace(/Built with v0/gi, '')
  .replace(/v0\.app/gi, '')

fs.writeFileSync(layoutPath, cleanedContent)

console.log('[remove-v0] v0 branding removed successfully')