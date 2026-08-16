const fs = require('fs');

if (fs.existsSync('app.json')) {
    const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));

    // Inject Google Maps configuration inside Android config
    if (!appJson.expo.android.config) {
        appJson.expo.android.config = {};
    }
    appJson.expo.android.config.googleMaps = {
        apiKey: "PROCESS_ENV_EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"
    };

    // Inject react-native-maps plugin
    const mapsPlugin = appJson.expo.plugins.find(p => Array.isArray(p) ? p[0] === 'react-native-maps' : p === 'react-native-maps');
    if (!mapsPlugin) {
        appJson.expo.plugins.push([
            "react-native-maps",
            {
                "androidGoogleMapsApiKey": "PROCESS_ENV_EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"
            }
        ]);
    }

    // Ensure expo-location plugin is present for Android manifest permissions
    const locationPlugin = appJson.expo.plugins.find(p => Array.isArray(p) ? p[0] === 'expo-location' : p === 'expo-location');
    if (!locationPlugin) {
        appJson.expo.plugins.push([
            "expo-location",
            {
                "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
            }
        ]);
    }

    let configString = JSON.stringify(appJson, null, 2);
    // Replace the placeholders with actual dynamic process.env calls
    configString = configString.replace(/"PROCESS_ENV_EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"/g, "process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ''");

    const appConfigJsContent = `import 'dotenv/config';\n\nexport default ${configString};\n`;

    fs.writeFileSync('app.config.js', appConfigJsContent);
    fs.unlinkSync('app.json');
}

// Create .env template if not exists
if (!fs.existsSync('.env')) {
    fs.writeFileSync('.env', 'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE\n');
}
