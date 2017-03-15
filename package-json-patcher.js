const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ORIGINAL_PATH = path.join(__dirname, 'package.json');
assert.ok(fs.existsSync(ORIGINAL_PATH), 'Missing ' + ORIGINAL_PATH);
const original = require(ORIGINAL_PATH);

const ENV = process.env.NODE_ENV;

if(!ENV) {
  console.log('Ignoring the', path.basename(__filename), '(no NODE_ENV)');
} else {
  console.log('Merging in', ENV, 'package.json into the project');
  const specializedPath = path.join(
    __dirname,
    'config',
    'package.json',
    ENV + '.json'
  );
  assert.ok(fs.existsSync(specializedPath), 'Missing ' + specializedPath);

  const specialized = require(specializedPath);
  // Set the merge object to the specialized and override with original
  const merged = Object.assign({}, original);
  // Merge in the specialized dependencies
  Object.assign(merged.dependencies, specialized.dependencies);
  // Merge in the specialized devDependencies
  Object.assign(merged.devDependencies, specialized.devDependencies);
  // Write the new package.json to the original file path
  fs.writeFileSync(ORIGINAL_PATH, JSON.stringify(merged, null, 2) + '\n');
}
