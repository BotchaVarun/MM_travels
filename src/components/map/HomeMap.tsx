import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useUserLocation } from '../../hooks/useUserLocation';
import { formatAddress, reverseGeocode } from '../../services/location/geocodingService';
import { Address, Coordinate } from '../../types/location';

interface HomeMapProps {
    onPickupLocationChange: (coordinate: Coordinate, address: Address | null) => void;
}

export default function HomeMap({ onPickupLocationChange }: HomeMapProps) {
    const mapRef = useRef<MapView>(null);
    const { currentUserLocation, locationServicesEnabled, permissionStatus } = useUserLocation();

    const [isMapMoving, setIsMapMoving] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [pickupCoord, setPickupCoord] = useState<Coordinate | null>(null);
    const [pickupAddress, setPickupAddress] = useState<Address | null>(null);
    const [initialRegionSet, setInitialRegionSet] = useState(false);

    const geocodeRequestId = useRef(0);
    const { height } = Dimensions.get('window');

    // Initial centering when user location is first found
    useEffect(() => {
        if (currentUserLocation && mapReady && !initialRegionSet) {
            mapRef.current?.animateToRegion({
                latitude: currentUserLocation.latitude,
                longitude: currentUserLocation.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            }, 1000);
            setInitialRegionSet(true);

            // Set initial pickup identical to current location
            handleSettledCoord(currentUserLocation);
        }
    }, [currentUserLocation, mapReady, initialRegionSet]);

    const handleSettledCoord = async (coord: Coordinate) => {
        setPickupCoord(coord);

        const currentReqId = ++geocodeRequestId.current;
        const addressData = await reverseGeocode(coord);

        if (currentReqId === geocodeRequestId.current) {
            setPickupAddress(addressData);
            onPickupLocationChange(coord, addressData);
        }
    };

    const handleRegionChangeComplete = async (region: Region, details: { isGesture?: boolean }) => {
        setIsMapMoving(false);
        if (details.isGesture) {
            handleSettledCoord({
                latitude: region.latitude,
                longitude: region.longitude
            });
        }
    };

    const handleRegionChangeStart = () => {
        setIsMapMoving(true);
    };

    const handleCurrentLocationTap = () => {
        if (!currentUserLocation) return;

        mapRef.current?.animateToRegion({
            latitude: currentUserLocation.latitude,
            longitude: currentUserLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }, 1000);

        handleSettledCoord(currentUserLocation);
    };

    const { title, subtitle } = formatAddress(pickupAddress);

    return (
        <View style={StyleSheet.absoluteFill}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                provider={PROVIDER_GOOGLE}
                mapPadding={{ top: 0, left: 0, right: 0, bottom: height * 0.48 }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={false}
                onMapReady={() => setMapReady(true)}
                onRegionChangeComplete={handleRegionChangeComplete}
                onRegionChange={handleRegionChangeStart}
            />

            {/* Fixed Center Pickup Marker */}
            {/* Hides gently or visually adjusts if needed, but per spec remains visually fixed */}
            <View style={styles.pickupMarkerContainer}>
                <View style={styles.pickupPill}>
                    <Text style={styles.pickupPillText}>Pickup Point</Text>
                </View>
                <View style={styles.pickupStem} />
                <View style={styles.pickupDot}>
                    <View style={styles.pickupDotInner} />
                </View>

                {/* Dynamically display reverse-geocoded title! */}
                {pickupCoord ? (
                    <Text style={styles.pickupTitle} numberOfLines={1}>{title}</Text>
                ) : (
                    <Text style={styles.pickupTitle} numberOfLines={1}>Finding Location...</Text>
                )}
                <Text style={styles.pickupSubtitle} numberOfLines={1}>{subtitle}</Text>
            </View>

            {/* Current Address P33W+PG3... style floating card */}
            <View style={styles.currentAddressCard}>
                <View style={styles.addressLeft}>
                    <View style={styles.greenRing}>
                        <View style={styles.greenDot} />
                    </View>
                    <Text style={styles.addressText} numberOfLines={1}>
                        {pickupCoord ? (pickupAddress?.name || title) : 'Locating...'}
                    </Text>
                </View>
                <TouchableOpacity activeOpacity={0.7} style={styles.gpsButton} onPress={handleCurrentLocationTap}>
                    <Ionicons name="locate" size={20} color={colors.ink} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    pickupMarkerContainer: {
        position: 'absolute',
        top: '25%', // Carefully balanced above the 48% sheet
        left: '50%',
        transform: [{ translateX: -60 }],
        alignItems: 'center',
        elevation: 1,
        // pointerEvents none so users can pan the map *through* this overlay UI
        pointerEvents: 'none',
    },
    pickupPill: {
        backgroundColor: colors.green,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    pickupPillText: {
        color: colors.white,
        fontWeight: '700',
        fontSize: 13,
    },
    pickupStem: {
        width: 1.5,
        height: 12, // Ensure same stem height as original design
        backgroundColor: colors.green,
    },
    pickupDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.green,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    pickupDotInner: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.green,
    },
    pickupTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.ink,
        textShadowColor: 'rgba(255,255,255,1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
        textAlign: 'center',
        width: 150, // bounding width for dynamic text
    },
    pickupSubtitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.inkSoft,
        textShadowColor: 'rgba(255,255,255,1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        textAlign: 'center',
        width: 150,
    },
    currentAddressCard: {
        position: 'absolute',
        bottom: '53%',
        left: 20,
        right: 20,
        backgroundColor: colors.white,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 2,
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    addressLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    greenRing: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.green,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    greenDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.green,
    },
    addressText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.ink,
        flex: 1,
        marginRight: 8,
    },
    gpsButton: {
        padding: 4,
    },
});
