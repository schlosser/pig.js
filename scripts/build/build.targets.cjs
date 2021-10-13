const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const builds = {
  'esm-bundle': {
    entryPoints: ['src/pig.js'],
    bundle: true,
    target: 'es2020',
    platform: 'browser',
    format: 'esm',
    metafile: false,
    write: false,
    outfile: 'dist/esm/pig.js'
  },
  'minify-esm': {
    entryPoints: ['dist/esm/pig.js'],
    bundle: false,
    target: 'es2020',
    platform: 'browser',
    format: 'esm',
    metafile: false,
    write: false,
    minify: true,
    outfile: 'dist/esm/pig.min.js'
  },
  'umd-bundle': {
    entryPoints: ['scripts/build/pig.source.umd.js'],
    bundle: true,
    target: 'es2020',
    platform: 'neutral',
    format: 'cjs',
    banner: {
      js: `(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define([], factory());
  } else if (typeof module === 'object' && module.exports) {
      // CommonJS.
      module.exports = factory();
    } else {
      // Browser globals (root is window)
      root.Pig = factory().Pig;
      root.ProgressiveImage = factory().ProgressiveImage;
}
}(typeof self !== 'undefined' ? self : this, function() {`
    },
    footer: {
      js: `
  // Just return an object to define the module export.
  return {
    Pig: Pig,
    ProgressiveImage: ProgressiveImage
  };
}));`
    },
    metafile: false,
    write: false,
    outfile: 'dist/pig.js'
  },
  'minify-umd': {
    entryPoints: ['dist/pig.js'],
    bundle: false,
    target: 'es2020',
    platform: 'neutral',
    format: 'cjs',
    metafile: false,
    write: false,
    minify: true,
    outfile: 'dist/pig.min.js'
  }
};

/**
 * Build target files in /dist directory.
 * Call on cli like this:
 *   'node scripts/build/build.targets esm'
 * Calling without option will throw.
 *
 * Cli param {string} Type of output to create ('umd' or 'esm').
 */
(async () => {
  const outputType = process.argv[2];
  switch (outputType) {
    case 'umd':
      await buildStep('umd-bundle');
      await buildStep('minify-umd');
      break;
    case 'esm':
      await buildStep('esm-bundle');
      await buildStep('minify-esm');
      break;
    default:
      console.error(`the configuration '${outputType}' does not exist`);
      process.exit(1);
  }
})();

async function buildStep(configName) {
  const config = builds[configName];
  if (config === undefined) {
    console.error(`the configuration '${configName}' does not exist`);
    process.exit(1);
  }

  const result = await esbuild.build(config)
    .catch(() => process.exit(1));

  if (config.metafile) {
    fs.mkdirSync('artifacts', { recursive: true });
    fs.writeFileSync('artifacts/build-results.json', JSON.stringify(result.metafile));
  }

  if (config.write === false) {
    if (result.outputFiles !== undefined) {
      if (result.outputFiles.length === 1) {
        const contentRows = result.outputFiles[0].text.split('\n');

        // Remove unnecessary parts of generated code
        let rowsToRemove = [];
        if (configName === 'umd-bundle') {
          rowsToRemove = umdRemoveUnnecessaryRows(contentRows);
        } else if (configName === 'esm-bundle') {
          rowsToRemove = esmRemoveUnnecessaryRows(contentRows);
        }

        // Remove rows needed to trigger output generation
        let filteredContent = result.outputFiles[0].text;
        if (rowsToRemove.length > 0) {
          for (let i = 0; i < rowsToRemove.length; i++) {
            contentRows.splice(rowsToRemove[i].start, rowsToRemove[i].length);
          }
        }

        // write output to file
        filteredContent = contentRows.join('\n');
        const outdir = path.dirname(config.outfile);
        fs.mkdirSync(outdir, { recursive: true });
        fs.writeFileSync(config.outfile, filteredContent);
      } else {
        console.log('too many file generated for umd bundle');
      }
    }
  }
}

function umdRemoveUnnecessaryRows(contentRows) {
  const rowsToRemove = [];
  for (let i = contentRows.length - 1; i >= 0; i--) {
    if (contentRows[i] === '// scripts/build/pig.source.umd.js') {
      // remove dummy rows from 'entrypoint', required by esbuild to generate a result
      rowsToRemove.push({ start: i, length: 3 });
    }
  }
  return rowsToRemove;
}

function esmRemoveUnnecessaryRows(contentRows) {
  const searchVarForDefault = new RegExp('^var .+_default = .+;$');
  const rowsToRemove = [];
  for (let i = contentRows.length - 1; i >= 0; i--) {
    // remove dummy entry required by source to generate a result
    if (searchVarForDefault.test(contentRows[i])) {
      rowsToRemove.push({ start: i, length: 1 });
    } else {
      contentRows[i] = contentRows[i].replace('progressive_image_default', 'ProgressiveImage');
      contentRows[i] = contentRows[i].replace('optimized_resize_default', 'OptimizedResize');
      contentRows[i] = contentRows[i].replace('pig_settings_default', 'PigSettings');
    }
  }
  return rowsToRemove;
}
