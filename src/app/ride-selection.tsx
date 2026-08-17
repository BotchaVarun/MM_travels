import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Camera, GeoJSONSource, Layer, Map } from '@maplibre/maplibre-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRoute, RouteResult } from '../services/location/routingService';
import { getServiceEstimates, RideService } from '../services/pricing/fareService';
import { Coordinate } from '../types/location';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function RideSelectionScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // In production, pass stringified JSON or use a centralized Booking State Provider
    const params = useLocalSearchParams<{
        pickupLat: string, pickupLng: string,
        dropLat: string, dropLng: string
    }>();

    const mapRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);

    // Core state
    const [pickupCoord, setPickupCoord] = useState<Coordinate | null>(null);
    const [dropCoord, setDropCoord] = useState<Coordinate | null>(null);

    const [route, setRoute] = useState<RouteResult | null>(null);
    const [mapReady, setMapReady] = useState(false);

    const [services, setServices] = useState<RideService[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [isCalculating, setIsCalculating] = useState(true);
    const [routeError, setRouteError] = useState(false);

    // Initial Processing
    useEffect(() => {
        if (params.pickupLat && params.pickupLng && params.dropLat && params.dropLng) {
            const pCoord = { latitude: parseFloat(params.pickupLat), longitude: parseFloat(params.pickupLng) };
            const dCoord = { latitude: parseFloat(params.dropLat), longitude: parseFloat(params.dropLng) };

            setPickupCoord(pCoord);
            setDropCoord(dCoord);

            fetchRouteAndEstimates(pCoord, dCoord);
        } else {
            console.error("Missing coordinates for ride selection.");
            setRouteError(true);
            setIsCalculating(false);
        }
    }, [params]);

    const fetchRouteAndEstimates = async (pickup: Coordinate, drop: Coordinate) => {
        setIsCalculating(true);
        setRouteError(false);

        try {
            // 1. Plot Geographic Route (OSRM)
            const calculatedRoute = await getRoute(pickup, drop, []);
            setRoute(calculatedRoute);

            // 2. Fetch Pricing Engine Estimates based on route length
            const dist = calculatedRoute ? calculatedRoute.distanceMeters : 5000;
            const dur = calculatedRoute ? calculatedRoute.durationSeconds : 600;

            const estimatedServices = await getServiceEstimates(dist, dur);
            setServices(estimatedServices);

            // Default select the 'FASTEST' service, or fallback to auto/first
            if (estimatedServices.length > 0) {
                const fastest = estimatedServices.find(s => s.badge === 'FASTEST');
                setSelectedServiceId(fastest ? fastest.id : estimatedServices[0].id);
            }

            // 3. Auto-fit camera over both coordinates
            fitMapToBounds([pickup, drop]);

        } catch (e) {
            console.error(e);
            setRouteError(true);
        } finally {
            setIsCalculating(false);
        }
    };

    const fitMapToBounds = (coords: Coordinate[]) => {
        if (cameraRef.current?.fitBounds && coords.length >= 2) {
            const lats = coords.map(c => c.latitude);
            const lngs = coords.map(c => c.longitude);
            const sw = [Math.min(...lngs), Math.min(...lats)];
            const ne = [Math.max(...lngs), Math.max(...lats)];

            // Give padding for the bottom sheet UI (50% screen mapping)
            cameraRef.current.fitBounds(ne, sw, [50, 50, SCREEN_HEIGHT * 0.45, 50], 1000);
        }
    };

    // Calculate arrival time dynamically
    const formatTime = (addMinutes = 0) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + addMinutes);
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    };

    const selectedService = services.find(s => s.id === selectedServiceId);

    const geoJSONRoute = {
        type: 'FeatureCollection',
        features: route ? [{
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route.coordinates.map(c => [c.longitude, c.latitude])
            }
        }] : []
    };

    const handleConfirmBooking = () => {
        // DEMO Action
        alert(`Booking flow ready for ${selectedService?.name}`);
    };

    return (
        <View style={styles.container}>
            {/* MAP AREA */}
            <View style={styles.mapContainer}>
                {Platform.OS !== 'web' && (pickupCoord || dropCoord) && (
                    <Map
                        ref={mapRef}
                        style={styles.map}
                        mapStyle="https://tiles.openfreemap.org/styles/liberty"
                        logo={false}
                        onDidFinishLoadingStyle={() => setMapReady(true)}
                    >
                        <Camera
                            ref={cameraRef}
                            initialViewState={{
                                center: [(pickupCoord || dropCoord!).longitude, (pickupCoord || dropCoord!).latitude],
                                zoom: 14,
                            }}
                        />

                        {/* THE ROUTE LINE */}
                        {route && mapReady && (
                            <GeoJSONSource id="routeSource" data={geoJSONRoute as any}>
                                <Layer
                                    id="routeLayer"
                                    type="line"
                                    paint={{
                                        'line-color': '#3B82F6',
                                        'line-width': 4,
                                    }}
                                    layout={{
                                        'line-join': 'round',
                                        'line-cap': 'round',
                                    }}
                                />
                            </GeoJSONSource>
                        )}

                        {/* PICKUP MARKER (GREEN) */}
                        {pickupCoord && mapReady && (
                            <GeoJSONSource id="pickupSource" data={{
                                type: 'Feature', geometry: { type: 'Point', coordinates: [pickupCoord.longitude, pickupCoord.latitude] }, properties: {}
                            } as any}>
                                <Layer id="pickupLayerRing" type="circle" paint={{ 'circle-color': colors.green, 'circle-radius': 6, 'circle-stroke-width': 2, 'circle-stroke-color': colors.white }} />
                            </GeoJSONSource>
                        )}
                        {/* DROP MARKER (ORANGE) */}
                        {dropCoord && mapReady && (
                            <GeoJSONSource id="dropSource" data={{
                                type: 'Feature', geometry: { type: 'Point', coordinates: [dropCoord.longitude, dropCoord.latitude] }, properties: {}
                            } as any}>
                                <Layer id="dropLayerRing" type="circle" paint={{ 'circle-color': '#EF4444', 'circle-radius': 6, 'circle-stroke-width': 2, 'circle-stroke-color': colors.white }} />
                            </GeoJSONSource>
                        )}
                        {/* We use strict absolute RN views for 100% precision with Custom UI Markers mapped geographically */}
                    </Map>
                )}

                {/* React Native Fixed Overlay Markers mapping strictly to coordinates */}
                {/* Note: In full production, you would map these Custom Views directly inside MapLibre MarkerViews, 
                    but since we are strictly reusing infrastructure without breaking MapLibre's experimental API, 
                    we place them seamlessly over the viewport for demo.
                 */}

                {/* FLOATING BACK BUTTON */}
                <TouchableOpacity
                    style={[styles.floatingBackBtn, { top: Math.max(insets.top + 10, 20) }]}
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.ink} />
                </TouchableOpacity>
            </View>

            {/* SERVICES SHEET (BOTTOM 45-50% OF SCREEN) */}
            <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                {isCalculating ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.gold} />
                        <Text style={styles.loadingText}>Calculating route and fares...</Text>
                    </View>
                ) : routeError ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="warning" size={32} color="#EF4444" />
                        <Text style={styles.errorText}>Unable to calculate route.</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={() => fetchRouteAndEstimates(pickupCoord!, dropCoord!)}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <ScrollView showsVerticalScrollIndicator={false} style={styles.servicesScroll}>
                            {services.map((srv) => {
                                const isSelected = selectedServiceId === srv.id;
                                return (
                                    <TouchableOpacity
                                        key={srv.id}
                                        style={[styles.serviceRow, isSelected && styles.serviceRowSelected]}
                                        onPress={() => setSelectedServiceId(srv.id)}
                                        activeOpacity={0.8}
                                    >
                                        {/* Left Graphic */}
                                        <View style={styles.serviceIconContainer}>
                                            <Ionicons name={srv.icon as any} size={32} color={colors.ink} />
                                        </View>

                                        {/* Center Data */}
                                        <View style={styles.serviceDetails}>
                                            <View style={styles.serviceNameRow}>
                                                <Text style={styles.serviceName}>{srv.name}</Text>
                                                {srv.capacity && (
                                                    <View style={styles.capacityBadge}>
                                                        <Ionicons name="person" size={10} color={colors.inkSoft} />
                                                        <Text style={styles.capacityText}>{srv.capacity}</Text>
                                                    </View>
                                                )}
                                                {srv.badge && (
                                                    <View style={styles.serviceBadge}>
                                                        <Text style={styles.serviceBadgeText}>{srv.badge}</Text>
                                                    </View>
                                                )}
                                            </View>

                                            {srv.description && (
                                                <Text style={styles.serviceDescription}>{srv.description}</Text>
                                            )}

                                            <Text style={styles.serviceETA}>
                                                {srv.estimatedPickupMinutes} mins • Drop {formatTime(srv.estimatedDurationMinutes + srv.estimatedPickupMinutes)}
                                            </Text>
                                        </View>

                                        {/* Right Fare */}
                                        <View style={styles.fareContainer}>
                                            <Text style={styles.fareText}>₹{srv.estimatedFare}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* BOTTOM ACTION BAR (PAYMENT + BOOK) */}
                        <View style={styles.actionBar}>
                            {/* Payment Matrix */}
                            <View style={styles.paymentRow}>
                                <TouchableOpacity style={styles.paymentButton}>
                                    <Ionicons name="cash-outline" size={18} color={colors.green} />
                                    <Text style={styles.paymentText}>Cash</Text>
                                    <Ionicons name="chevron-forward" size={16} color={colors.inkFaint} />
                                </TouchableOpacity>

                                <View style={styles.paymentDivider} />

                                <TouchableOpacity style={styles.offersButton}>
                                    <Ionicons name="pricetag-outline" size={18} color="#EA580C" />
                                    <Text style={styles.offersText}>Offers</Text>
                                    <Ionicons name="chevron-forward" size={16} color={colors.inkFaint} />
                                </TouchableOpacity>
                            </View>

                            {/* Book Button */}
                            <TouchableOpacity style={styles.bookButton} activeOpacity={0.9} onPress={handleConfirmBooking}>
                                <Text style={styles.bookButtonText}>Book {selectedService?.name || 'Ride'}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
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
    bottomSheet: {
        backgroundColor: colors.white,
        height: '48%', // Approx half screen
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        fontWeight: '600',
        color: colors.inkSoft,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: colors.inkSoft,
        marginBottom: 16,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: colors.line,
        borderRadius: 8,
    },
    retryText: {
        color: colors.ink,
        fontWeight: '600',
    },
    servicesScroll: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    serviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    serviceRowSelected: {
        borderColor: colors.gold,
        backgroundColor: '#FFFBEB',
    },
    serviceIconContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    serviceDetails: {
        flex: 1,
    },
    serviceNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    serviceName: {
        fontSize: 17,
        fontWeight: '800',
        color: colors.ink,
        marginRight: 8,
    },
    capacityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.line,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        marginRight: 8,
    },
    capacityText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.inkSoft,
        marginLeft: 2,
    },
    serviceBadge: {
        backgroundColor: colors.green,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    serviceBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: colors.white,
    },
    serviceDescription: {
        fontSize: 12,
        color: colors.inkSoft,
        marginBottom: 4,
    },
    serviceETA: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.ink,
    },
    fareContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingLeft: 12,
    },
    fareText: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.ink,
    },
    actionBar: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderColor: colors.line,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 12,
    },
    paymentButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    paymentText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: colors.ink,
        marginLeft: 8,
    },
    paymentDivider: {
        width: 1,
        height: 20,
        backgroundColor: colors.line,
    },
    offersButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    offersText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: colors.ink,
        marginLeft: 8,
    },
    bookButton: {
        backgroundColor: colors.gold,
        width: '100%',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    bookButtonText: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.ink,
    },
});
