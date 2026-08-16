const fs = require('fs');
const env = JSON.parse(fs.readFileSync('env_dump.json', 'utf8'));
let found = false;
for (const key in env) {
    if (key.toUpperCase().includes('MAP') || key.toUpperCase().includes('API') || key.toUpperCase().includes('GOOGLE') || env[key].includes('AIzaSy')) {
        console.log(`Found ${key}: ${env[key].substring(0, 15)}...`);
        found = true;
    }
}
if (!found) console.log("No API keys found in system env.");
