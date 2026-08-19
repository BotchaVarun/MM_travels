import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Mapbox, { Camera, MapView } from '@rnmapbox/maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserLocation } from '../hooks/useUserLocation';
import { formatAddress, reverseGeocode } from '../services/location/geocodingService';
import { Address, Coordinate } from '../types/location';

export default function SelectDropMapScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ pickupLat?: string, pickupLng?: string }>();
    const { currentUserLocation } = useUserLocation();

    // Map references
    const mapRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);

    const [mapReady, setMapReady] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Core drop location state decoupled from Home
    const [selectedDropCoord, setSelectedDropCoord] = useState<Coordinate | null>(null);
    const [selectedDropAddress, setSelectedDropAddress] = useState<Address | null>(null);

    // Initial setup: Focus on the previously typed location, or User GPS, or fallback
    const initRef = useRef(false);

    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        let initialCoord: Coordinate = { latitude: 17.6868, longitude: 83.2185 }; // Default Vizag fallback

        if (params.pickupLat && params.pickupLng) {
            initialCoord = { latitude: parseFloat(params.pickupLat), longitude: parseFloat(params.pickupLng) };
        } else if (currentUserLocation) {
            initialCoord = currentUserLocation;
        }

        setSelectedDropCoord(initialCoord);

        if (cameraRef.current?.setCamera) {
            cameraRef.current.setCamera({
                centerCoordinate: [initialCoord.longitude, initialCoord.latitude],
                zoomLevel: 15,
                animationDuration: 1000,
            });
        }
    }, [params.pickupLat, params.pickupLng, currentUserLocation]);

    // Handle Map Center settling
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const reverseGeocodeCoordinates = async (lat: number, lng: number) => {
        try {
            const coord = { latitude: lat, longitude: lng };
            setSelectedDropCoord(coord);
            const addressData = await reverseGeocode(coord);
            setSelectedDropAddress(addressData);
        } catch (e) {
            console.error("Geocoding failed", e);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleCameraChanged = (state: any) => {
        if (!isGeocoding) setIsGeocoding(true);

        const propertiesCenter = state?.properties?.center;
        const geometryCoords = state?.geometry?.coordinates;

        let longitude: number | undefined;
        let latitude: number | undefined;

        if (propertiesCenter && Array.isArray(propertiesCenter) && propertiesCenter.length >= 2) {
            [longitude, latitude] = propertiesCenter;
        } else if (geometryCoords && Array.isArray(geometryCoords) && geometryCoords.length >= 2) {
            [longitude, latitude] = geometryCoords;
        }

        if (longitude !== undefined && latitude !== undefined && !isNaN(longitude) && !isNaN(latitude)) {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                reverseGeocodeCoordinates(latitude!, longitude!);
            }, 600);
        }
    };

    const handleSelectDrop = () => {
        if (!selectedDropCoord) return;

        if (!params.pickupLat || !params.pickupLng) {
            console.warn("Cannot proceed: Missing Pickup Coordinates");
            router.back();
            return;
        }

        // Fulfill PDF Spec: IMMEDIATELY proceed to Ride Selection / Route Generation
        router.push({
            pathname: '/ride-selection',
            params: {
                pickupLat: params.pickupLat,
                pickupLng: params.pickupLng,
                dropLat: selectedDropCoord.latitude.toString(),
                dropLng: selectedDropCoord.longitude.toString()
            }
        });
    };

    const jumpToCurrentLocation = () => {
        if (currentUserLocation && cameraRef.current?.setCamera) {
            cameraRef.current.setCamera({
                centerCoordinate: [currentUserLocation.longitude, currentUserLocation.latitude],
                zoomLevel: 15,
                animationDuration: 1000,
            });
        }
    };

    // Format display string
    let displayTitle = 'Selected Location';
    let displaySubtitle = 'Locating...';

    if (!isGeocoding && selectedDropAddress) {
        const fmt = formatAddress(selectedDropAddress);
        displayTitle = fmt.title;
        displaySubtitle = fmt.subtitle;
    } else if (isGeocoding) {
        displayTitle = 'Locating...';
        displaySubtitle = 'Fetching address details';
    }

    return (
        <View style={styles.container}>
            {/* FULL SCREEN MAP */}
            {Platform.OS !== 'web' && (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    styleURL={Mapbox.StyleURL.Street}
                    logoEnabled={false}
                    attributionEnabled={false}
                    compassEnabled={false}
                    onCameraChanged={handleCameraChanged}
                >
                    <Camera
                        ref={cameraRef}
                        defaultSettings={{
                            centerCoordinate: [(selectedDropCoord || { longitude: 83.2185 }).longitude, (selectedDropCoord || { latitude: 17.6868 }).latitude],
                            zoomLevel: 15,
                        }}
                    />
                </MapView>
            )}

            {/* FIXED CENTER OVERLAY (DROP MARKER) */}
            <View style={styles.fixedCenterOverlay} pointerEvents="none">
                <View style={styles.dropMarkerContainer}>
                    <View style={styles.dropOuterCircle}>
                        <View style={styles.dropInnerCircle} />
                    </View>
                    <View style={styles.dropStem} />
                </View>
            </View>

            {/* ROUNDED BACK BUTTON (FLOATING TOP LEFT) */}
            <TouchableOpacity
                style={[styles.floatingBackBtn, { top: Math.max(insets.top + 10, 20) }]}
                onPress={() => router.back()}
                activeOpacity={0.8}
            >
                <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </TouchableOpacity>

            {/* FLOATING GPS BUTTON */}
            <TouchableOpacity style={styles.gpsButton} onPress={jumpToCurrentLocation} activeOpacity={0.8}>
                <Ionicons name="locate" size={24} color={colors.ink} />
            </TouchableOpacity>

            {/* BOTTOM LOCATION PANEL */}
            <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom + 20, 30) }]}>
                {/* Panel Header */}
                <View style={styles.panelHeader}>
                    <Text style={styles.panelTitle}>Select your location</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.changeActionText}>Change</Text>
                    </TouchableOpacity>
                </View>

                {/* Location Display Card */}
                <View style={styles.locationCard}>
                    <View style={styles.cardIconWrapper}>
                        <Ionicons name="location" size={22} color="#EF4444" />
                    </View>
                    <View style={styles.cardTextWrapper}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{displayTitle}</Text>
                        <Text style={styles.cardSubtitle} numberOfLines={1}>{displaySubtitle}</Text>
                    </View>
                </View>

                {/* ACTION BUTTON */}
                <TouchableOpacity
                    style={[styles.primaryButton, isGeocoding && styles.primaryButtonDisabled]}
                    activeOpacity={0.9}
                    onPress={handleSelectDrop}
                    disabled={isGeocoding}
                >
                    <Text style={styles.primaryButtonText}>Select Drop</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%', // Ensures map drops all the way behind the panel for seamless dragging
    },
    fixedCenterOverlay: {
        ...StyleSheet.absoluteFill,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 220, // Offset precisely to visually center above the bottom panel
    },
    dropMarkerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 50,
        transform: [{ translateY: -25 }], // Anchor tooltip precisely at the bottom tip 
    },
    dropOuterCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        zIndex: 2,
    },
    dropInnerCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.white,
    },
    dropStem: {
        width: 3,
        height: 14,
        backgroundColor: '#EF4444',
        marginTop: -2,
        zIndex: 1,
    },
    floatingBackBtn: {
        position: 'absolute',
        left: 20,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    gpsButton: {
        position: 'absolute',
        right: 20,
        bottom: 240, // Hovers cleanly just above the bottom panel
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bottomPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 24,
        elevation: 20, // Strict Material elevation hierarchy over MapLibre gl surface
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    panelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    panelTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.ink,
    },
    changeActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#EA580C', // Deep contextual orange for Drop UI accent
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        marginBottom: 24,
    },
    cardIconWrapper: {
        marginRight: 12,
    },
    cardTextWrapper: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.ink,
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 13,
        color: colors.inkSoft,
    },
    primaryButton: {
        width: '100%',
        backgroundColor: colors.gold,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonDisabled: {
        opacity: 0.6,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.ink,
    },
});
