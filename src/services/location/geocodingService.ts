import * as Location from 'expo-location';
import { Address, Coordinate } from '../../types/location';

export async function reverseGeocode(coordinate: Coordinate): Promise<Address | null> {
    try {
        const addresses = await Location.reverseGeocodeAsync({
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
        });

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
    } catch (e) {
        console.warn('Reverse geocoding failed', e);
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
