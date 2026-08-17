import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Camera, Map } from '@maplibre/maplibre-react-native';
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
    const params = useLocalSearchParams<{ lat?: string, lng?: string }>();
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
    useEffect(() => {
        let initialCoord: Coordinate = { latitude: 17.6868, longitude: 83.2185 }; // Default Vizag fallback

        if (params.lat && params.lng) {
            initialCoord = { latitude: parseFloat(params.lat), longitude: parseFloat(params.lng) };
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
    }, [params, currentUserLocation]);

    // Handle Map Center settling
    const handleRegionDidChange = async (event: any) => {
        let longitude: number | undefined;
        let latitude: number | undefined;

        const syncNativeCenter = event?.nativeEvent?.center;
        const syncGeometryCoords = event?.geometry?.coordinates;

        if (Platform.OS !== 'web' && mapRef.current) {
            try {
                const center = await mapRef.current.getCenter();
                if (center && Array.isArray(center)) {
                    [longitude, latitude] = center;
                }
            } catch (e) {
                console.warn("Could not retrieve center directly from MapLibre", e);
            }
        }

        if (!longitude || !latitude) {
            if (syncNativeCenter && Array.isArray(syncNativeCenter)) {
                [longitude, latitude] = syncNativeCenter;
            } else if (syncGeometryCoords) {
                [longitude, latitude] = syncGeometryCoords;
            }
        }

        if (longitude && latitude) {
            const coord = { latitude, longitude };
            setSelectedDropCoord(coord);
            setIsGeocoding(true);

            // Wait for 1 second throttle safely
            const addressData = await reverseGeocode(coord);
            setSelectedDropAddress(addressData);
            setIsGeocoding(false);
        }
    };

    const handleSelectDrop = () => {
        if (!selectedDropCoord) return;

        let title = 'Selected Map Location';
        let subtitle = 'Unknown area';
        let formattedStr = '';

        if (selectedDropAddress) {
            const formatted = formatAddress(selectedDropAddress);
            title = formatted.title;
            subtitle = formatted.subtitle;
            formattedStr = selectedDropAddress.formattedAddress || `${title}, ${subtitle}`;
        }

        // Return exactly to the destination configuration
        router.navigate({
            pathname: '/destination',
            params: {
                action: 'mapSelected',
                dropLat: selectedDropCoord.latitude.toString(),
                dropLng: selectedDropCoord.longitude.toString(),
                dropTitle: title,
                dropSubtitle: subtitle,
                dropAddress: formattedStr
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
                <Map
                    ref={mapRef}
                    style={styles.map}
                    mapStyle="https://tiles.openfreemap.org/styles/liberty"
                    logo={false}
                    onRegionDidChange={handleRegionDidChange}
                >
                    <Camera
                        ref={cameraRef}
                        initialViewState={{
                            center: [(selectedDropCoord || { longitude: 83.2185 }).longitude, (selectedDropCoord || { latitude: 17.6868 }).latitude],
                            zoom: 15,
                        }}
                    />
                </Map>
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
