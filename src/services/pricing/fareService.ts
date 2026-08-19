export interface RideService {
    id: string;
    name: string;
    description: string;
    vehicleType: string;
    icon: string;
    estimatedPickupMinutes: number;
    estimatedDurationMinutes: number;
    estimatedFare: number;
    capacity?: number;
    badge?: string;
    available: boolean;
}

export interface FareEstimate {
    serviceId: string;
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    taxes: number;
    discount: number;
    totalFare: number;
    currency: "INR";
}

/**
 * DEMO ONLY - Replace with backend fare calculation later.
 * Given a route's distance and duration, calculates realistic prices for MM Travels services.
 */
export async function getServiceEstimates(distanceMeters: number, durationSeconds: number): Promise<RideService[]> {
    const distanceKm = distanceMeters / 1000;
    const durationMinutes = Math.ceil(durationSeconds / 60);

    // Simulated network delay
    await new Promise(res => setTimeout(res, 600));

    // Base fare calculations (DUMMY logic mapped roughly to the reference values)
    const calculateFare = (baseRate: number, perKm: number, perMin: number, minFare: number) => {
        const fare = baseRate + (distanceKm * perKm) + (durationMinutes * perMin);
        return Math.floor(Math.max(fare, minFare));
    };

    const services: RideService[] = [
        {
            id: 'bike',
            name: 'Bike',
            description: 'Quick Bike rides',
            vehicleType: 'bike',
            icon: 'bicycle',
            estimatedPickupMinutes: 3,
            estimatedDurationMinutes: durationMinutes,
            estimatedFare: calculateFare(20, 10, 1.5, 93),
            capacity: 1,
            available: true,
        },
        {
            id: 'auto',
            name: 'Auto',
            description: 'Affordable auto rides',
            vehicleType: 'auto',
            icon: 'car-sport',
            estimatedPickupMinutes: 2,
            estimatedDurationMinutes: durationMinutes + 1,
            estimatedFare: calculateFare(40, 15, 2, 157),
            badge: 'FASTEST', // Determined by estPickupTime naturally
            capacity: 3,
            available: true,
        },
        {
            id: 'cab_economy',
            name: 'Cab Economy',
            description: 'Everyday comfortable rides',
            vehicleType: 'cab',
            icon: 'car',
            estimatedPickupMinutes: 4,
            estimatedDurationMinutes: durationMinutes + 2,
            estimatedFare: calculateFare(60, 20, 2.5, 230),
            capacity: 4,
            available: true,
        },
        {
            id: 'cab_premium',
            name: 'Cab Premium',
            description: 'Luxury rides with top drivers',
            vehicleType: 'cab',
            icon: 'car',
            estimatedPickupMinutes: 4,
            estimatedDurationMinutes: durationMinutes + 2,
            estimatedFare: calculateFare(80, 25, 3, 283),
            capacity: 4,
            available: true,
        },
        {
            id: 'cab_xl',
            name: 'Cab XL',
            description: 'Spacious for groups',
            vehicleType: 'cab',
            icon: 'car',
            estimatedPickupMinutes: 4,
            estimatedDurationMinutes: durationMinutes + 4,
            estimatedFare: calculateFare(100, 30, 4, 401),
            capacity: 6,
            available: true,
        },
    ];

    // Dynamic sort by pickup time to programmatically assign the 'FASTEST' badge.
    const sorted = [...services].sort((a, b) => a.estimatedPickupMinutes - b.estimatedPickupMinutes);
    const fastestId = sorted[0].id;

    return services.map(srv => {
        if (srv.id === fastestId) {
            srv.badge = 'FASTEST';
        } else {
            delete srv.badge;
        }
        return srv;
    });
}
