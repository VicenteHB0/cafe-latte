const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('node_modules/react-resizable-panels/package.json', 'utf8'));
console.log('Main:', pkg.main);
console.log('Module:', pkg.module);
console.log('Exports:', JSON.stringify(pkg.exports, null, 2));
