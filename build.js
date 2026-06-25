import * as esbuild from 'esbuild';

const args = process.argv.slice(2);
const targetFormat = (args[0] || '').toLowerCase(); // 'esm', 'umd', or empty for both

if (!targetFormat) {
  // Build both formats when no argument is given — do it in a single esbuild call to avoid worker pool issues.
  await Promise.all([
    esbuild.build({
      entryPoints: ['src/index.js'],
      bundle: true,
      format: 'esm',
      outfile: 'dist/wave-particles.esm.js',
      sourcemap: true,
      minify: true
    }),
    esbuild.build({
      entryPoints: ['src/browser.js'],
      bundle: true,
      format: 'iife',
      outfile: 'dist/wave-particles.iife.js',
      sourcemap: true,
      minify: true
    })
  ]);

  console.log('ESM build complete → dist/wave-particles.esm.js');
  console.log('IIFE (UMD-compatible) build complete → dist/wave-particles.iife.js');
} else if (targetFormat === 'esm') {
  await esbuild.build({
    entryPoints: ['src/index.js'],
    bundle: true,
    format: 'esm',
    outfile: 'dist/wave-particles.esm.js',
    sourcemap: true,
    minify: true
  });
  console.log('ESM build complete → dist/wave-particles.esm.js');
} else if (targetFormat === 'umd') {
  await esbuild.build({
    entryPoints: ['src/browser.js'],
    bundle: true,
    format: 'iife',
    outfile: 'dist/wave-particles.iife.js',
    sourcemap: true,
    minify: true
  });
  console.log('IIFE (UMD-compatible) build complete → dist/wave-particles.iife.js');
} else {
  console.error(`Unknown build target "${args[0]}". Use "esm", "umd", or omit for both.`);
  process.exit(1);
}

console.log('All builds finished.');
