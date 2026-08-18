import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUserLocation } from '../../hooks/useUserLocation';
import { formatAddress, reverseGeocode } from '../../services/location/geocodingService';
import { Address, Coordinate } from '../../types/location';

// Default fallback region (Visakhapatnam) — used only until real GPS arrives
const DEFAULT_COORD: Coordinate = {
    latitude: 17.6868,
    longitude: 83.2185,
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

export interface DriverLocation {
    driverId: string;
    latitude: number;
    longitude: number;
    heading?: number;
}

interface HomeMapProps {
    onPickupLocationChange: (coordinate: Coordinate, address: Address | null) => void;
    driverLocations?: DriverLocation[]; // Future Phase Integration
}

// Initialize Mapbox with the public client token configured by EAS or Local .env
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '');

// Leaflet HTML source document for web rendering
const leafletHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map {
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
    }
    .leaflet-control-attribution {
      display: none !important;
    }
    .leaflet-bar {
      border: none !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
      border-radius: 8px !important;
      overflow: hidden;
    }
    .leaflet-bar a {
      background-color: #ffffff !important;
      color: #1e293b !important;
      border: none !important;
      border-bottom: 1px solid #f1f5f9 !important;
      width: 32px !important;
      height: 32px !important;
      line-height: 32px !important;
      font-size: 16px !important;
      transition: background-color 0.2s;
    }
    .leaflet-bar a:hover {
      background-color: #f8fafc !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', {
      zoomControl: true,
      attributionControl: false
    }).setView([17.6868, 83.2185], 15);

    L.tileLayer('https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    map.on('moveend', function() {
      var center = map.getCenter();
      window.parent.postMessage({
        type: 'MAP_MOVE_END',
        latitude: center.lat,
        longitude: center.lng
      }, '*');
    });

    window.addEventListener('message', function(event) {
      if (!event.data) return;
      if (event.data.type === 'SET_CENTER') {
        map.setView([event.data.latitude, event.data.longitude], event.data.zoom || map.getZoom());
      }
    });
  </script>
</body>
</html>
`;

export default function HomeMap({ onPickupLocationChange }: HomeMapProps) {
    const mapRef = useRef<any>(null); // MapLibre General Ref
    const cameraRef = useRef<any>(null); // MapLibre Camera Ref
    const iframeRef = useRef<any>(null);
    const { currentUserLocation } = useUserLocation();

    const [mapReady, setMapReady] = useState(false);
    const [pickupCoord, setPickupCoord] = useState<Coordinate | null>(null);
    const [pickupAddress, setPickupAddress] = useState<Address | null>(null);
    const [initialRegionSet, setInitialRegionSet] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);

    const geocodeRequestId = useRef(0);

    // Set mapReady to true immediately on mount for web platform
    useEffect(() => {
        if (Platform.OS === 'web') {
            setMapReady(true);
        }
    }, []);

    // ---- Web postMessage listener ----
    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const handleWebMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'MAP_MOVE_END') {
                const { latitude, longitude } = event.data;
                handleSettledCoord({ latitude, longitude });
            }
        };

        window.addEventListener('message', handleWebMessage);
        return () => {
            window.removeEventListener('message', handleWebMessage);
        };
    }, []);

    // ---- Centering when real GPS arrives ----
    useEffect(() => {
        if (currentUserLocation && mapReady) {
            if (!initialRegionSet) {
                if (Platform.OS === 'web') {
                    iframeRef.current?.contentWindow?.postMessage({
                        type: 'SET_CENTER',
                        latitude: currentUserLocation.latitude,
                        longitude: currentUserLocation.longitude,
                        zoom: 15
                    }, '*');
                } else {
                    cameraRef.current?.setCamera({
                        centerCoordinate: [currentUserLocation.longitude, currentUserLocation.latitude],
                        zoomLevel: 14,
                        animationDuration: 1000,
                    });
                }
                setInitialRegionSet(true);
                handleSettledCoord(currentUserLocation);
            }
        }
    }, [currentUserLocation, mapReady, initialRegionSet]);

    // ---- Fallback initialization when map is ready and GPS is slow/unavailable ----
    useEffect(() => {
        if (mapReady && !initialRegionSet && !currentUserLocation && !pickupCoord) {
            handleSettledCoord(DEFAULT_COORD);
        }
    }, [mapReady, initialRegionSet, currentUserLocation, pickupCoord]);

    // ---- Reverse-geocode the settled coordinate ----
    const handleSettledCoord = async (coord: Coordinate) => {
        setPickupCoord(coord);
        setIsGeocoding(true);
        const currentReqId = ++geocodeRequestId.current;
        const addressData = await reverseGeocode(coord);
        if (currentReqId === geocodeRequestId.current) {
            setPickupAddress(addressData);
            setIsGeocoding(false);
            onPickupLocationChange(coord, addressData);
        }
    };

    // ---- Mapbox native gesture callbacks ----
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const reverseGeocodeCoordinates = async (lat: number, lng: number) => {
        try {
            const coord = { latitude: lat, longitude: lng };
            const currentReqId = ++geocodeRequestId.current;
            const addressData = await reverseGeocode(coord);
            if (currentReqId === geocodeRequestId.current) {
                setPickupCoord(coord);
                setPickupAddress(addressData);
                onPickupLocationChange(coord, addressData);
            }
        } catch (error) {
            console.error("Reverse geocoding error:", error);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleCameraChanged = (state: any) => {
        // Only mark moving visually if actually dragged
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
            }, 600); // Wait until dragging has definitively stopped
        }
    };

    // ---- Current-location button ----
    const handleCurrentLocationTap = () => {
        if (!currentUserLocation) return;
        if (Platform.OS === 'web') {
            iframeRef.current?.contentWindow?.postMessage({
                type: 'SET_CENTER',
                latitude: currentUserLocation.latitude,
                longitude: currentUserLocation.longitude,
                zoom: 15
            }, '*');
            handleSettledCoord(currentUserLocation);
        } else {
            cameraRef.current?.setCamera({
                centerCoordinate: [currentUserLocation.longitude, currentUserLocation.latitude],
                zoomLevel: 14,
                animationDuration: 1000,
            });
            handleSettledCoord(currentUserLocation);
        }
    };

    const { title, subtitle } = formatAddress(pickupAddress);

    // Calculate dynamic display text for the precise address card bar based on user specs
    let addressBarText = 'Unknown Location';
    if (isGeocoding) {
        addressBarText = 'Locating...';
    } else if (pickupCoord) {
        const lat = pickupCoord.latitude.toFixed(5);
        const lng = pickupCoord.longitude.toFixed(5);

        const fullAddress = pickupAddress
            ? ((pickupAddress as any).formatted_address || (pickupAddress as any).display_name || subtitle || title)
            : 'Unknown Location';

        addressBarText = `${lat}, ${lng} - ${fullAddress}`;
    }

    return (
        <View style={styles.container}>

            {/* ===================== MAP VIEWPORT ENCLOSURE ===================== */}
            <View style={styles.mapWrapper}>
                {/* --- Map Layer --- */}
                {Platform.OS === 'web' ? (
                    <iframe
                        ref={iframeRef}
                        srcDoc={leafletHtml}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                        }}
                    />
                ) : (
                    <View style={StyleSheet.absoluteFill}>
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            styleURL={Mapbox.StyleURL.Street}
                            logoEnabled={false}
                            attributionEnabled={false}
                            compassEnabled={false}
                            onCameraChanged={handleCameraChanged}
                            onDidFinishLoadingMap={() => setMapReady(true)}
                        >
                            <Camera
                                ref={cameraRef}
                                defaultSettings={{
                                    centerCoordinate: [DEFAULT_COORD.longitude, DEFAULT_COORD.latitude],
                                    zoomLevel: 15,
                                }}
                            />
                            {/* Native pulsing blue GPS indicator for Mapbox */}
                            <LocationPuck
                                puckBearingEnabled
                                puckBearing="heading"
                                pulsing={{ isEnabled: true }}
                            />
                        </MapView>
                    </View>
                )}

                {/* --- POINTER UI OVERLAY (Center of top half) --- */}
                <View style={styles.pickupMarkerContainer} pointerEvents="none">
                    {/* The pointer pin (above the center point) */}
                    <View style={styles.pointerPin}>
                        <View style={styles.pickupPill}>
                            <Text style={styles.pickupPillText}>Pickup Point</Text>
                        </View>
                        <View style={styles.pickupStem} />
                    </View>

                    {/* The dot (exactly at the center point) */}
                    <View style={styles.pickupDot}>
                        <View style={styles.pickupDotInner} />
                    </View>
                </View>
            </View>

            {/* ============= ADDRESS CARD + GPS BUTTON (ABOVE BOTTOM SHEET) ============= */}
            <View style={styles.currentAddressCard}>
                <View style={styles.addressLeft}>
                    <View style={styles.greenRing}>
                        <View style={styles.greenDot} />
                    </View>
                    <Text style={styles.addressText} numberOfLines={1}>
                        {addressBarText}
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
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    mapWrapper: {
        width: '100%',
        height: '62%', // Leaves bottom 38% for sheet, overlapping safely under the 40-45% snap bounds
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    pickupMarkerContainer: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pointerPin: {
        position: 'absolute',
        bottom: 6,
        alignItems: 'center',
    },
    pickupPill: {
        backgroundColor: colors.green,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    pickupPillText: {
        color: colors.white,
        fontWeight: '700',
        fontSize: 11,
        letterSpacing: 0.3,
    },
    pickupStem: {
        width: 2,
        height: 10,
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
        marginTop: -6, // Centers the dot's midpoint exactly at top: '50%'
    },
    pickupDotInner: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.green,
    },
    currentAddressCard: {
        position: 'absolute',
        bottom: '45%', // Rests safely 2% above the 43% bottom sheet snap point
        left: 16,
        right: 16,
        backgroundColor: colors.white,
        borderRadius: 28,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 4,
        shadowColor: "rgba(0,0,0,0.1)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
    },
    addressLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    greenRing: {
        width: 14,
        height: 14,
        borderRadius: 7,
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
        fontSize: 14,
        fontWeight: '600',
        color: colors.ink,
        flex: 1,
        marginRight: 8,
    },
    gpsButton: {
        padding: 6,
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
    },
});
