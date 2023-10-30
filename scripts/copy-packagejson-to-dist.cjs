/**
 * Copy package.json to dist folders.
 * This way we can publish /dist to npm and use it as a
 * package.
 * Called in npm 'version' script, when version is changed
 * e.g. by 'npm version patch' command.
 */

const fs = require('fs');
const exec = require('child_process').exec; 

let package = {};
 
// Get package.json and remove unnecessary elements
try {
  let rawdata = fs.readFileSync('package.json', 'utf8');
  package = JSON.parse(rawdata);
  delete package['scripts'];
} catch (error) {
  console.log('Error reading "package.json"', error);
  return;
}

// Copy package.json for esm variant
try {
  const packageForEsm = JSON.stringify(package, null, '  ').replace(/\n/g, '\r\n').concat('\r\n');
  fs.writeFileSync('./dist/esm/package.json', packageForEsm);
  console.log('package.json copied to "/dist/esm/"');
} catch (err) {
  console.log('Error saving "package.json" to "/dist/esm/"', err);
}

// Copy package.json for umd variant
try {
  delete package['type'];
  const packageForUmd = JSON.stringify(package, null, '  ').replace(/\n/g, '\r\n').concat('\r\n');
  fs.writeFileSync('./dist/package.json', packageForUmd);
  console.log('package.json copied to "/dist/"');
} catch (err) {
  console.log('Error saving "package.json" to "/dist/"', err);
}

// Copy README.md
try {
  const readme = fs.readFileSync('README.md', 'utf8');
  fs.writeFileSync('./dist/README.md', readme);
  console.log('README.md copied to "/dist/"');
} catch (err) {
  console.log('Error copying "README.md" to "/dist/"', err);
}

// Commit modified files to git
try {
  exec(`"${process.env['npm_config_git']}" add .`, function(err, stdout, stderr){
    if (err) {
      console.log('Error executing "git add ."', err);
      return;
    } else if (typeof(stderr) != 'string') {
      console.log(stderr);
    }
    console.log(stdout);
  });

  console.log('Committed changes to git repository');
} catch (err) {
  console.log('Error committing changed files to GIT', err);
}
