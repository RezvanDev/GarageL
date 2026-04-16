const fs = require('fs');
const path = require('path');
const https = require('https');

const brands = [
  { url: "https://logo-teka.com/mg-motor/", name: "MG", models: ["ZS", "CYBERSTER", "HS", "7"] },
  { url: "https://logo-teka.com/polestar/", name: "Polestar", models: ["POLESTAR 2", "POLESTAR 4"] },
  { url: "https://logo-teka.com/porsche/", name: "Porsche", models: ["911", "MACAN", "CAYENNE", "PANAMERA", "TAYCAN"] },
  { url: "https://logo-teka.com/skoda/", name: "Skoda", models: ["KODIAQ", "OCTAVIA", "SUPERB"] },
  { url: "https://logo-teka.com/tank/", name: "Tank", models: ["TANK 300"] },
  { url: "https://logo-teka.com/tesla/", name: "Tesla", models: ["MODEL 3", "MODEL Y", "MODEL S", "MODEL X", "MODEL S PLAID"] },
  { url: "https://logo-teka.com/toyota/", name: "Toyota", models: ["LC 120", "LC 150", "LC 200", "LC 300", "PRADO 250", "CAMRY", "AVALON", "CROWN", "COROLLA", "SEQUIOA", "RAV 4", "HIGHLANDER"] },
  { url: "https://logo-teka.com/volkswagen/", name: "Volkswagen", models: ["ID 4", "ID 6", "CADDY", "ARTEON", "PASSAT SS"] },
  { url: "https://logo-teka.com/volvo/", name: "Volvo", models: ["XC 60", "XC 90", "T60"] },
  { url: "https://logo-teka.com/xiaomi/", name: "Xiaomi", models: ["SU 7", "SU7 ULTRA", "YU 7", "YU 7 MAX"] },
  { url: "https://logo-teka.com/xpeng/", name: "Xpeng", models: ["XPENG G9", "XPENG MONA M03", "XPENG P7+", "XPENG G3I"] }
];

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchHTML(res.headers.location).then(resolve).catch(reject);
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function fetchSVG(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchSVG(res.headers.location).then(resolve).catch(reject);
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function processBrand(brand) {
  let finalHtml = await fetchHTML(brand.url).catch(() => '');
  let svgLink = null;
  const match = finalHtml.match(/href="([^"]+\/svg\/)"/);
  if (match) {
    svgLink = match[1];
  }

  let svgContent = null;
  if (svgLink) {
    svgContent = await fetchSVG(svgLink).catch(() => null);
  }

  return { ...brand, svgContent };
}

function cleanSVGToReact(svgString, componentName) {
  if (!svgString) return null;
  
  let content = svgString.replace(/<\?xml.*\?>/g, '');
  content = content.replace(/<!--.*-->/g, '');
  
  let svgMatch = content.match(/<svg([^>]*)>([\s\S]*)<\/svg>/i);
  if (!svgMatch) return null;

  let attrs = svgMatch[1];
  let inner = svgMatch[2];

  let vbMatch = attrs.match(/viewBox="([^"]*)"/);
  let vb = vbMatch ? vbMatch[1] : `0 0 512 512`;

  inner = inner.replace(/class=/g, 'className=')
               .replace(/fill-rule=/g, 'fillRule=')
               .replace(/clip-rule=/g, 'clipRule=')
               .replace(/strke-width=/g, 'strokeWidth=')
               .replace(/style="([^"]*)"/g, '') 
               .replace(/enable-background/g, 'enableBackground')
               .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') 
               .replace(/fill="[^"]*"/g, 'fill="currentColor"');

  return `import React from 'react';

export const ${componentName} = ({ color = 'currentColor', size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="${vb}"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    ${inner}
  </svg>
);
`;
}

async function run() {
  const componentsDir = path.join(__dirname, 'frontend/src/components/common/icons');
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }

  const results = [];
  for (let b of brands) {
    console.log(`Processing ${b.name}...`);
    let data = await processBrand(b);
    let componentName = b.name.replace(/[^a-zA-Z0-9]/g, '') + 'Icon';
    let id = b.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    let compCode = cleanSVGToReact(data.svgContent, componentName);
    if (!compCode) {
      console.log(`Failed to process SVG for ${b.name}, using fallback.`);
      compCode = `import React from 'react';
export const ${componentName} = ({ color = 'currentColor', size = 24, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="10" />
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10">${b.name.charAt(0)}</text>
  </svg>
);`;
    }

    fs.writeFileSync(path.join(componentsDir, `${componentName}.jsx`), compCode);
    
    results.push({
      id,
      name: b.name,
      componentName,
      models: b.models
    });
  }

  fs.writeFileSync(path.join(__dirname, 'sync_results2.json'), JSON.stringify(results, null, 2));
  console.log('Done mapping.');
}

run();
