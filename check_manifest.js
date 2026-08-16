const fs = require('fs');
const manifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
if (manifest.includes('com.google.android.geo.API_KEY')) {
    const start = manifest.indexOf('com.google.android.geo.API_KEY');
    console.log("FOUND:");
    console.log(manifest.substring(start - 40, start + 80).replace(/\n/g, ' '));
} else {
    console.log('NOT FOUND in AndroidManifest.xml');
}
