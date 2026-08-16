const fs = require('fs');
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));

// Inject Google Maps configuration inside Android config
if (!appJson.expo.android.config) {
    appJson.expo.android.config = {};
}
appJson.expo.android.config.googleMaps = {
    apiKey: "YOUR_GOOGLE_MAPS_API_KEY_HERE"
};

// Inject react-native-maps plugin
const mapsPlugin = appJson.expo.plugins.find(p => Array.isArray(p) ? p[0] === 'react-native-maps' : p === 'react-native-maps');
if (!mapsPlugin) {
    appJson.expo.plugins.push([
        "react-native-maps",
        {
            "androidGoogleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
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

fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));

// Create .env template if not exists
if (!fs.existsSync('.env')) {
    fs.writeFileSync('.env', 'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE\n');
}
