import * as Location from 'expo-location';
import { Address, Coordinate } from '../../types/location';

export async function reverseGeocode(coordinate: Coordinate): Promise<Address | null> {
    try {
        let addresses = null;
        try {
            addresses = await Location.reverseGeocodeAsync({
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
            });
        } catch (nativeError) {
            console.warn('Native reverse geocoding not supported or failed, trying OpenStreetMap fallback:', nativeError);
        }

        if (addresses && addresses.length > 0) {
            const addr = addresses[0];
            return {
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
        }

        // Fallback to OpenStreetMap Nominatim API for web and native fallback
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordinate.latitude}&lon=${coordinate.longitude}`,
            {
                headers: {
                    'Accept-Language': 'en',
                    'User-Agent': 'MM_travels_Expo_App'
                }
            }
        );
        const data = await response.json();
        if (data && data.address) {
            const addr = data.address;
            const name = data.name || addr.suburb || addr.neighbourhood || addr.road || null;
            return {
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
        }
    } catch (e) {
        console.warn('Both native and Nominatim reverse geocoding failed', e);
    }
    return null;
}

export function formatAddress(address: Address | null): { title: string, subtitle: string } {
    if (!address) return { title: 'Unknown Location', subtitle: 'Tap to refresh' };

    const title = address.name || address.street || address.district || 'Selected Location';

    // Construct subtitle cleanly without hanging commas
    const subtitleParts = [address.district, address.city, address.region].filter(Boolean);
    const subtitle = subtitleParts.join(', ') || 'Unknown Area';

    return { title, subtitle };
}
