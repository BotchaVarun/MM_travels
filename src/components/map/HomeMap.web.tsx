import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUserLocation } from '../../hooks/useUserLocation';
import { formatAddress, reverseGeocode } from '../../services/location/geocodingService';
import { Address, Coordinate } from '../../types/location';

const DEFAULT_REGION: Coordinate = {
    latitude: 17.6868,
    longitude: 83.2185,
};

interface HomeMapProps {
    onPickupLocationChange: (coordinate: Coordinate, address: Address | null) => void;
}

const leafletHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background-color: #f3f4f6; }
    .leaflet-control-attribution { display: none !important; }
    .leaflet-bar { border: none !important; box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; border-radius: 8px !important; overflow: hidden; }
    .leaflet-bar a { background-color: #ffffff !important; color: #1e293b !important; border: none !important; border-bottom: 1px solid #f1f5f9 !important; width: 32px !important; height: 32px !important; line-height: 32px !important; font-size: 16px !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: true, attributionControl: false }).setView([17.6868, 83.2185], 15);
    L.tileLayer('https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    map.on('moveend', function() {
      var center = map.getCenter();
      window.parent.postMessage({ type: 'MAP_MOVE_END', latitude: center.lat, longitude: center.lng }, '*');
    });
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'SET_CENTER') {
        map.setView([event.data.latitude, event.data.longitude], event.data.zoom || map.getZoom());
      }
    });
  </script>
</body>
</html>
`;

export default function HomeMap({ onPickupLocationChange }: HomeMapProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { currentUserLocation } = useUserLocation();
    const [pickupCoord, setPickupCoord] = useState<Coordinate | null>(null);
    const [pickupAddress, setPickupAddress] = useState<Address | null>(null);
    const geocodeRequestId = useRef(0);

    const handleSettledCoord = async (coord: Coordinate) => {
        setPickupCoord(coord);
        const currentReqId = ++geocodeRequestId.current;
        const addressData = await reverseGeocode(coord);
        if (currentReqId === geocodeRequestId.current) {
            setPickupAddress(addressData);
            onPickupLocationChange(coord, addressData);
        }
    };

    useEffect(() => {
        const handleWebMessage = (event: MessageEvent) => {
            if (event.data?.type === 'MAP_MOVE_END') {
                handleSettledCoord({ latitude: event.data.latitude, longitude: event.data.longitude });
            }
        };
        window.addEventListener('message', handleWebMessage);
        handleSettledCoord(currentUserLocation ?? DEFAULT_REGION);
        return () => window.removeEventListener('message', handleWebMessage);
    }, []);

    useEffect(() => {
        if (currentUserLocation) {
            iframeRef.current?.contentWindow?.postMessage({
                type: 'SET_CENTER',
                latitude: currentUserLocation.latitude,
                longitude: currentUserLocation.longitude,
                zoom: 15,
            }, '*');
            handleSettledCoord(currentUserLocation);
        }
    }, [currentUserLocation]);

    const handleCurrentLocationTap = () => {
        if (!currentUserLocation) return;
        iframeRef.current?.contentWindow?.postMessage({
            type: 'SET_CENTER',
            latitude: currentUserLocation.latitude,
            longitude: currentUserLocation.longitude,
            zoom: 15,
        }, '*');
        handleSettledCoord(currentUserLocation);
    };

    const { title, subtitle } = formatAddress(pickupAddress);

    return (
        <View style={styles.container}>
            <iframe ref={iframeRef} srcDoc={leafletHtml} style={styles.iframe} />

            <View style={styles.pickupMarkerContainer} pointerEvents="none">
                <View style={styles.pointerPin}>
                    <View style={styles.pickupPill}>
                        <Text style={styles.pickupPillText}>Pickup Point</Text>
                    </View>
                    <View style={styles.pickupStem} />
                </View>
                <View style={styles.pickupDot}>
                    <View style={styles.pickupDotInner} />
                </View>
                <View style={styles.pickupTextContainer}>
                    <Text style={styles.pickupTitle} numberOfLines={1}>{pickupCoord ? title : 'Finding Location...'}</Text>
                    <Text style={styles.pickupSubtitle} numberOfLines={1}>{subtitle}</Text>
                </View>
            </View>

            <View style={styles.currentAddressCard}>
                <View style={styles.addressLeft}>
                    <View style={styles.greenRing}><View style={styles.greenDot} /></View>
                    <Text style={styles.addressText} numberOfLines={1}>{pickupCoord ? (pickupAddress?.name || title) : 'Locating...'}</Text>
                </View>
                <TouchableOpacity activeOpacity={0.7} style={styles.gpsButton} onPress={handleCurrentLocationTap}>
                    <Ionicons name="locate" size={20} color={colors.ink} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    iframe: { width: '100%', height: '100%', borderWidth: 0 },
    pickupMarkerContainer: { position: 'absolute', top: '50%', left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
    pointerPin: { position: 'absolute', bottom: 6, alignItems: 'center' },
    pickupPill: { backgroundColor: colors.green, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3 },
    pickupPillText: { color: colors.white, fontWeight: '700', fontSize: 13 },
    pickupStem: { width: 1.5, height: 12, backgroundColor: colors.green },
    pickupDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.green, justifyContent: 'center', alignItems: 'center', marginTop: -6 },
    pickupDotInner: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.green },
    pickupTextContainer: { alignItems: 'center', marginTop: 6 },
    pickupTitle: { fontSize: 16, fontWeight: '700', color: colors.ink, textShadowColor: 'rgba(255,255,255,1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3, textAlign: 'center', width: 150 },
    pickupSubtitle: { fontSize: 12, fontWeight: '600', color: colors.inkSoft, textShadowColor: 'rgba(255,255,255,1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2, textAlign: 'center', width: 150 },
    currentAddressCard: { position: 'absolute', bottom: '53%', left: 20, right: 20, backgroundColor: colors.white, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 4, shadowColor: colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
    addressLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    greenRing: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.green, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    greenDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.green },
    addressText: { fontSize: 13, fontWeight: '600', color: colors.ink, flex: 1, marginRight: 8 },
    gpsButton: { padding: 4 },
});
