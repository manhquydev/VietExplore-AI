const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'src', 'app', 'favicon.png');
const outputPath = path.join(__dirname, 'src', 'app', 'favicon.ico');

pngToIco(inputPath)
  .then(buf => {
    fs.writeFileSync(outputPath, buf);
    console.log('✓ Favicon converted successfully to ICO format!');
    // Clean up temporary PNG file
    fs.unlinkSync(inputPath);
    console.log('✓ Temporary PNG file removed');
  })
  .catch(err => {
    console.error('Error converting favicon:', err);
    process.exit(1);
  });
