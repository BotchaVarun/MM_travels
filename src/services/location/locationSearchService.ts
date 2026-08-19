import { Coordinate } from '../../types/location';

export interface LocationSearchResult {
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    subtitle: string;
    formattedAddress: string;
}

// In-memory cache to prevent duplicate HTTP requests
const searchCache = new Map<string, LocationSearchResult[]>();
let lastQueryTime = 0;

export async function searchLocations(query: string, focusCoordinate?: Coordinate): Promise<LocationSearchResult[]> {
    if (!query || query.length < 3) return [];

    const cacheKey = query.toLowerCase().trim();
    if (searchCache.has(cacheKey)) {
        return searchCache.get(cacheKey)!;
    }

    try {
        // Obey 1 request/sec limit for public nominatim during development
        const now = Date.now();
        const timeSinceLastQuery = now - lastQueryTime;
        if (timeSinceLastQuery < 1000) {
            await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastQuery));
        }
        lastQueryTime = Date.now();

        // If we have a focus coordinate, we can bias the results (Nominatim supports viewbox)
        let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&addressdetails=1&limit=10`;

        if (focusCoordinate) {
            // Very loose viewbox around the pickup coordinate (approx 50km box)
            const lat = focusCoordinate.latitude;
            const lon = focusCoordinate.longitude;
            const viewbox = `${lon - 0.5},${lat + 0.5},${lon + 0.5},${lat - 0.5}`;
            url += `&viewbox=${viewbox}&bounded=0`; // bounded=0 biases but doesn't hard-restrict
        }

        const response = await fetch(url, {
            headers: {
                'Accept-Language': 'en',
                'User-Agent': 'MM_Travels_Dev_App/1.0 (Development; +https://example.com)'
            }
        });

        const data = await response.json();

        if (Array.isArray(data)) {
            const results: LocationSearchResult[] = data.map((item: any) => {
                const addr = item.address || {};

                // Formulate a primary title using the most logical granular property
                const name = item.name || addr.suburb || addr.neighbourhood || addr.road || "Unknown Location";

                // Formulate a subtitle from broader regional properties
                const subtitleParts = [addr.suburb, addr.city || addr.town || addr.village, addr.state].filter(Boolean);
                // Remove duplicates if name is the same as suburb
                const filteredSubtitle = subtitleParts.filter(part => part !== name).join(', ');

                return {
                    id: item.place_id ? item.place_id.toString() : Math.random().toString(),
                    latitude: parseFloat(item.lat),
                    longitude: parseFloat(item.lon),
                    title: name,
                    subtitle: filteredSubtitle,
                    formattedAddress: item.display_name,
                };
            });

            searchCache.set(cacheKey, results);
            return results;
        }

        return [];
    } catch (error) {
        console.warn('Network or search failure:', error);
        return [];
    }
}
