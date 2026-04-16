const fs = require('fs');
const path = require('path');

const syncResults1 = require('./sync_results.json');
const syncResults2 = require('./sync_results2.json');

const syncResults = [...syncResults1, ...syncResults2];

// We also have LiXiang from earlier
syncResults.unshift({
  id: 'lixiang',
  name: 'LiXiang',
  componentName: 'LixiangIcon',
  models: ['L9', 'L7', 'L6', 'MEGA', 'I8']
});

// Since Toyota is duplicated (once from the admin list sync where user didn't specify models initially, 
// and second time from the new list where user specified models LC120...), we need to deduplicate them.
// We'll keep the latter one because it has the user-defined models.
const uniqueMap = new Map();
syncResults.forEach(r => {
  uniqueMap.set(r.id, r);
});
const uniqueResults = Array.from(uniqueMap.values());

// 1. Path admin constants
const adminConstantsPath = path.join(__dirname, 'management-portal/src/constants/carBrands.js');
let adminConstants = 'export const CAR_BRANDS = {\n';
uniqueResults.forEach(r => {
  adminConstants += `    '${r.name}': ${JSON.stringify(r.models)},\n`;
});
adminConstants += '};\n';
fs.writeFileSync(adminConstantsPath, adminConstants);

// 2. Patch frontend constants
const frontendConstantsPath = path.join(__dirname, 'frontend/src/data/constants.js');
let frontendConstants = `export const brands = [\n`;
uniqueResults.forEach(r => {
  frontendConstants += `    { id: '${r.id}', name: '${r.name}', color: '#ffffff' },\n`;
});
frontendConstants += `];\n\n`;

frontendConstants += `export const brandModels = {\n`;
uniqueResults.forEach(r => {
  frontendConstants += `    '${r.id}': ${JSON.stringify(r.models)},\n`;
});
frontendConstants += `};\n\n`;

// Keeping mockCatalog as is
frontendConstants += `export const mockCatalog = [];\n`;
fs.writeFileSync(frontendConstantsPath, frontendConstants);

// 3. Patch Catalog.jsx imports AND map
const catalogPath = path.join(__dirname, 'frontend/src/views/Catalog/Catalog.jsx');
let catalogText = fs.readFileSync(catalogPath, 'utf-8');

// Find imports insertion point
let importsText = '';
uniqueResults.forEach(r => {
  importsText += `import { ${r.componentName} } from '../../components/common/icons/${r.componentName}';\n`;
});

// Remove old imports to prevent duplicates
catalogText = catalogText.replace(/import { [a-zA-Z]+Icon } from '\.\.\/\.\.\/components\/common\/icons\/.*Icon';\n?/g, '');

catalogText = catalogText.replace(/(import { ImageCarousel } from '\.\.\/\.\.\/components\/common\/ImageCarousel';\n)/, `$1${importsText}\n`);

// Replace BrandIconMap
let mapText = 'const BrandIconMap = {\n';
uniqueResults.forEach(r => {
  mapText += `    '${r.id}': ${r.componentName},\n`;
});
mapText += '};\n';

catalogText = catalogText.replace(/const BrandIconMap = \{[\s\S]*?\};\n/, mapText);

fs.writeFileSync(catalogPath, catalogText);
console.log('Files repatched successfully.');
