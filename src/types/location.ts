import * as Location from 'expo-location';

export interface Coordinate {
    latitude: number;
    longitude: number;
}

export interface MapRegion extends Coordinate {
    latitudeDelta: number;
    longitudeDelta: number;
}

export interface Address {
    streetNumber: string | null;
    street: string | null;
    district: string | null;
    city: string | null;
    region: string | null;
    postalCode: string | null;
    country: string | null;
    name: string | null;
    formattedAddress: string | null;
}

export interface LocationState {
    currentUserLocation: Coordinate | null;
    permissionStatus: Location.PermissionStatus | null;
    locationServicesEnabled: boolean;
    isLoading: boolean;
    error: string | null;
}
