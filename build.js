(async () => {
  console.time('Build time');
  let esbuild = require('esbuild');
  const result = await esbuild
    .build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      target: ['chrome58', 'firefox57', 'safari11', 'edge18'],
      globalName: 'arcana.auth',
      inject: ['config/esbuild.inject.js'],
      define: {
        global: 'window',
      },
      format: 'iife',
      outfile: 'dist/standalone/auth.min.js',
      minify: true,
    })
    .catch((e) => {
      console.log({ error: e });
      process.exit(0);
    });
  console.timeEnd('Build time');
  if (result.errors && result.errors.length) {
    console.log({ errors: result.errors });
  } else {
    console.info('Compiled successfully!');
  }
  if (result.warnings && result.warnings.length) {
    console.log({ warnings: result.warnings });
  }
})();
