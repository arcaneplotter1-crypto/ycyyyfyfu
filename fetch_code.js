const https = require('https');
const fs = require('fs');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        fs.writeFileSync(dest, data);
        resolve();
      });
    }).on('error', reject);
  })
}

async function main() {
  await download('https://raw.githubusercontent.com/JatinChopra/emissive-dissolve-effect/main/src/main.ts', '/github_code.ts');
  console.log('done');
}
main();
