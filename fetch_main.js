const https = require('https');
https.get('https://raw.githubusercontent.com/JatinChopra/emissive-dissolve-effect/main/src/main.ts', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
