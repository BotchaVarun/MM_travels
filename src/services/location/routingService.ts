import { Coordinate } from '../../types/location';

export interface RouteResult {
    coordinates: Coordinate[];
    distanceMeters: number;
    durationSeconds: number;
}

/**
 * Service to fetch driving directions between two or more coordinates.
 * Defaults to OSRM Public API for development.
 */
export async function getRoute(pickup: Coordinate, drop: Coordinate, stops: Coordinate[] = []): Promise<RouteResult | null> {
    try {
        const waypoints = [
            pickup,
            ...stops,
            drop
        ];

        const coordinatesString = waypoints.map(c => `${c.longitude},${c.latitude}`).join(';');

        // OSRM Driving Route API (Development limits apply)
        const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`;

        const response = await fetch(url);
        const data = await response.json();

        if (data && data.routes && data.routes.length > 0) {
            const route = data.routes[0];

            // Map GeoJSON [lon, lat] array to our Coordinate {latitude, longitude} interface
            const coords: Coordinate[] = route.geometry.coordinates.map((point: number[]) => ({
                latitude: point[1],
                longitude: point[0]
            }));

            return {
                coordinates: coords,
                distanceMeters: route.distance,
                durationSeconds: route.duration,
            };
        }

        return null; // Route failed to parse
    } catch (error) {
        console.warn("Routing Service Error:", error);

        // As a fallback for development if OSRM is blocked, return a straight line
        return {
            coordinates: [pickup, drop],
            distanceMeters: getStraightLineDistance(pickup, drop),
            durationSeconds: 600, // Dummy 10 mins
        };
    }
}

// Distance fallback utility (Haversine formula in meters)
function getStraightLineDistance(coord1: Coordinate, coord2: Coordinate) {
    const R = 6371e3; // metres
    const φ1 = coord1.latitude * Math.PI / 180;
    const φ2 = coord2.latitude * Math.PI / 180;
    const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}
