import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { LocationState } from '../types/location';

export function useUserLocation(): LocationState {
    const [state, setState] = useState<LocationState>({
        currentUserLocation: null,
        permissionStatus: null,
        locationServicesEnabled: false,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;
        let isMounted = true;

        async function initLocation() {
            try {
                // Check if device location services are globally enabled
                const servicesEnabled = await Location.hasServicesEnabledAsync();
                if (!servicesEnabled) {
                    if (isMounted) setState(s => ({ ...s, locationServicesEnabled: false, isLoading: false, error: 'Location services disabled' }));
                    return;
                }

                // Request foreground permission
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    if (isMounted) setState(s => ({ ...s, permissionStatus: status, locationServicesEnabled: true, isLoading: false, error: 'Permission denied' }));
                    return;
                }

                if (isMounted) setState(s => ({ ...s, permissionStatus: status, locationServicesEnabled: true }));

                // Try last known for instant render
                const lastKnown = await Location.getLastKnownPositionAsync();
                if (lastKnown && isMounted) {
                    setState(s => ({
                        ...s,
                        currentUserLocation: { latitude: lastKnown.coords.latitude, longitude: lastKnown.coords.longitude },
                        isLoading: false
                    }));
                }

                // Get true current position if last known is missing
                if (!lastKnown) {
                    const currentPos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    if (isMounted) {
                        setState(s => ({
                            ...s,
                            currentUserLocation: { latitude: currentPos.coords.latitude, longitude: currentPos.coords.longitude },
                            isLoading: false
                        }));
                    }
                }

                // Watch foreground
                subscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 5000,
                        distanceInterval: 10,
                    },
                    (locationUpdate) => {
                        if (isMounted) {
                            setState(s => ({
                                ...s,
                                currentUserLocation: {
                                    latitude: locationUpdate.coords.latitude,
                                    longitude: locationUpdate.coords.longitude,
                                }
                            }));
                        }
                    }
                );
            } catch (error: any) {
                if (isMounted) setState(s => ({ ...s, isLoading: false, error: error.message || 'Unknown error' }));
            }
        }

        initLocation();

        return () => {
            isMounted = false;
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);

    return state;
}
