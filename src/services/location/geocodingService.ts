import * as Location from 'expo-location';
import { Address, Coordinate } from '../../types/location';

// Cache to prevent duplicate requests and spam
const gcCache = new Map<string, Address>();
let lastGcTimestamp = 0;

// Session flag to gracefully abandon the native OS geocoder proxy if it is structurally offline
let nativeGeocoderUnavailable = false;

export async function reverseGeocode(coordinate: Coordinate): Promise<Address | null> {
    const cacheKey = `${coordinate.latitude.toFixed(4)},${coordinate.longitude.toFixed(4)}`;
    if (gcCache.has(cacheKey)) {
        return gcCache.get(cacheKey)!;
    }

    try {
        let addresses = null;

        // Attempt Native Geocoder unless blacklisted this session
        if (!nativeGeocoderUnavailable) {
            try {
                addresses = await Location.reverseGeocodeAsync({
                    latitude: coordinate.latitude,
                    longitude: coordinate.longitude,
                });
            } catch (nativeError) {
                console.log('Native geocoder unavailable. Blacklisting native geocoder for the rest of this session.');
                nativeGeocoderUnavailable = true;
            }
        }

        if (addresses && addresses.length > 0) {
            const addr = addresses[0];
            const result = {
                streetNumber: addr.streetNumber,
                street: addr.street,
                district: addr.district,
                city: addr.city,
                region: addr.region,
                postalCode: addr.postalCode,
                country: addr.country,
                name: addr.name,
                formattedAddress: addr.formattedAddress,
            };
            gcCache.set(cacheKey, result);
            return result;
        }

        // --- HTTP FALLBACK (Nominatim OpenStreetMap) ---
        // Respect public rate limits: 1 request per second max
        const now = Date.now();
        const timeSinceLastReq = now - lastGcTimestamp;
        if (timeSinceLastReq < 1000) {
            // Wait out the throttling limit
            await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastReq));
        }
        lastGcTimestamp = Date.now();

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordinate.latitude}&lon=${coordinate.longitude}`,
            {
                headers: {
                    'Accept-Language': 'en',
                    'User-Agent': 'MM_Travels_Dev_App/1.0 (Development; +https://example.com)'
                }
            }
        );
        const data = await response.json();

        if (data && data.address) {
            const addr = data.address;
            const name = data.name || addr.suburb || addr.neighbourhood || addr.road || null;
            const result = {
                streetNumber: addr.house_number || null,
                street: addr.road || null,
                district: addr.suburb || addr.neighbourhood || addr.district || null,
                city: addr.city || addr.town || addr.village || null,
                region: addr.state || null,
                postalCode: addr.postcode || null,
                country: addr.country || null,
                name: name,
                formattedAddress: data.display_name || null,
            };

            // Cache successful result
            gcCache.set(cacheKey, result);

            console.log(`\nREVERSE_GEOCODE:\ncoordinates = [${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}]\nprovider = Nominatim\nstatus = success\naddress = ${result.formattedAddress}`);

            return result;
        }
    } catch (e) {
        console.warn('Network or Geocoding failure:', e);
    }

    // --- GRACEFUL OFFLINE FALLBACK ---
    // If both Native and HTTP boundaries fail (e.g. no internet/limits), synthesize an address object
    // out of the raw coordinates to prevent app logic or UI component failure.
    const fallbackCoordStr = `${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`;
    const fallbackResult = {
        streetNumber: null,
        street: null,
        district: null,
        city: null,
        region: null,
        postalCode: null,
        country: null,
        name: `Lat: ${coordinate.latitude.toFixed(3)} Lng: ${coordinate.longitude.toFixed(3)}`,
        formattedAddress: `Dropped Pin (${fallbackCoordStr})`,
    };

    console.log(`\nREVERSE_GEOCODE:\ncoordinates = [${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}]\nprovider = None/Fallback\nstatus = failure\naddress = ${fallbackResult.formattedAddress}`);

    return fallbackResult;
}

export function formatAddress(address: Address | null): { title: string, subtitle: string } {
    if (!address) return { title: 'Unknown Location', subtitle: 'Tap to refresh' };

    const title = address.name || address.street || address.district || 'Selected Location';

    // Construct subtitle cleanly without hanging commas
    const subtitleParts = [address.district, address.city, address.region].filter(Boolean);
    const subtitle = subtitleParts.join(', ') || 'Unknown Area';

    return { title, subtitle };
}
