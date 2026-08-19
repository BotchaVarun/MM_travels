import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocationSearchResult, searchLocations } from '../services/location/locationSearchService';
import { Coordinate } from '../types/location';

export interface SavedLocation {
    id: string;
    title: string;
    subtitle: string;
    latitude: number;
    longitude: number;
    type: 'recent' | 'favorite' | 'work' | 'home';
    isFavorite: boolean;
}

// Mock initial history array
const INITIAL_RECENT_LOCATIONS: SavedLocation[] = [
    {
        id: '1', title: 'Work', subtitle: 'Cyber Towers, Hitech City, Hyderabad',
        latitude: 17.4504, longitude: 78.3808, type: 'work', isFavorite: true
    },
    {
        id: '2', title: 'Home', subtitle: 'Gopalapatnam, Visakhapatnam',
        latitude: 17.7471, longitude: 83.2198, type: 'home', isFavorite: true
    },
    {
        id: '3', title: 'NAD Junction', subtitle: 'Shanti Nagar, NSTL, Visakhapatnam',
        latitude: 17.7425, longitude: 83.2201, type: 'recent', isFavorite: false
    },
    {
        id: '4', title: 'VMR Central Mall', subtitle: 'Aganampudi, Visakhapatnam',
        latitude: 17.6896, longitude: 83.1666, type: 'recent', isFavorite: false
    }
];

export default function DestinationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ lat?: string, lng?: string, pickupTitle?: string, pickupSubtitle?: string, action?: string, dropLat?: string, dropLng?: string, dropTitle?: string, dropSubtitle?: string }>();

    const [pickupQuery, setPickupQuery] = useState(params.pickupTitle || 'Current Location');
    const [dropQuery, setDropQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);

    const [recentLocations, setRecentLocations] = useState<SavedLocation[]>(INITIAL_RECENT_LOCATIONS);
    const [stops, setStops] = useState<{ id: string, title?: string, subtitle?: string, latitude?: number, longitude?: number }[]>([]);

    // Automatically check if returning from Map Selection
    useEffect(() => {
        if (params.action === 'mapSelected' && params.dropTitle && params.dropLat && params.dropLng) {
            setDropQuery(params.dropTitle);
            Keyboard.dismiss();

            // Advance directly to Ride Selection!
            proceedToRideSelection(
                params.dropLat, params.dropLng,
                params.dropTitle, params.dropSubtitle
            );
        }
    }, [params]);

    // Handle Drop location search input with debounce effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (dropQuery.trim().length > 2 && params.action !== 'mapSelected') {
                performSearch(dropQuery);
            } else if (dropQuery.trim().length === 0) {
                setSearchResults([]);
            }
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [dropQuery]);

    const performSearch = async (query: string) => {
        setIsSearching(true);
        const focusCoord: Coordinate | undefined = (params.lat && params.lng)
            ? { latitude: parseFloat(params.lat), longitude: parseFloat(params.lng) }
            : undefined;

        const results = await searchLocations(query, focusCoord);
        setSearchResults(results);
        setIsSearching(false);
    };

    const proceedToRideSelection = (dLat: string, dLng: string, dTitle: string, dSub?: string) => {
        if (!params.lat || !params.lng) {
            console.warn("Cannot proceed: Missing Pickup Coordinates");
            return;
        }

        router.push({
            pathname: '/ride-selection',
            params: {
                pickupLat: params.lat,
                pickupLng: params.lng,
                dropLat: dLat,
                dropLng: dLng
            }
        });
    };

    const handleSelectResult = (result: LocationSearchResult) => {
        setDropQuery(result.title);
        Keyboard.dismiss();
        setSearchResults([]);

        proceedToRideSelection(result.latitude.toString(), result.longitude.toString(), result.title, result.subtitle);
    };

    const handleSelectRecent = (recent: SavedLocation) => {
        setDropQuery(recent.title);
        Keyboard.dismiss();

        proceedToRideSelection(recent.latitude.toString(), recent.longitude.toString(), recent.title, recent.subtitle);
    };

    const toggleFavorite = (id: string) => {
        setRecentLocations(prev => prev.map(loc => loc.id === id ? { ...loc, isFavorite: !loc.isFavorite } : loc));
    };

    const navToMapSelection = () => {
        // Forward the captured Home pickup coordinates into the Map state unconditionally
        let queryParams: any = {};
        if (params.lat && params.lng) {
            queryParams.pickupLat = params.lat;
            queryParams.pickupLng = params.lng;
        }
        router.push({ pathname: '/select-drop-map', params: queryParams });
    };

    const addStop = () => {
        setStops([...stops, { id: Math.random().toString() }]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Drop</Text>

                <TouchableOpacity style={styles.forMeButton}>
                    <Text style={styles.forMeText}>For me</Text>
                    <Ionicons name="chevron-down" size={14} color={colors.ink} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={styles.contentArea}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    {/* INPUT CARD */}
                    <View style={styles.inputCard}>
                        {/* Pickup Row */}
                        <View style={styles.inputRow}>
                            <View style={[styles.markerRing, { borderColor: colors.green }]}>
                                <View style={[styles.markerDot, { backgroundColor: colors.green }]} />
                            </View>
                            <TextInput
                                style={[styles.inputField, { color: colors.inkSoft }]}
                                value={pickupQuery}
                                onChangeText={setPickupQuery}
                                placeholder="Pickup location"
                            />
                        </View>

                        {/* Visual Connector */}
                        <View style={styles.visualConnector} />

                        {/* Middle Stops (Dynamic) */}
                        {stops.map((stop, index) => (
                            <View key={stop.id}>
                                <View style={styles.inputRow}>
                                    <View style={[styles.markerRing, { borderColor: colors.inkSoft }]}>
                                        <View style={[styles.markerDot, { backgroundColor: colors.inkSoft }]} />
                                    </View>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder={`Stop ${index + 1}`}
                                    />
                                    <TouchableOpacity onPress={() => setStops(stops.filter(s => s.id !== stop.id))}>
                                        <Ionicons name="close" size={20} color={colors.inkSoft} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.visualConnector} />
                            </View>
                        ))}

                        {/* Drop Row */}
                        <View style={styles.inputRow}>
                            <View style={[styles.markerRing, { borderColor: '#EAB308' }]}>
                                <View style={[styles.markerDot, { backgroundColor: '#EAB308' }]} />
                            </View>
                            <TextInput
                                style={styles.inputField}
                                value={dropQuery}
                                onChangeText={setDropQuery}
                                placeholder="Drop location"
                                autoFocus={true}
                            />
                        </View>
                    </View>

                    {/* ACTION PILLS */}
                    <View style={styles.actionPillsContainer}>
                        <TouchableOpacity style={styles.actionPill} onPress={navToMapSelection}>
                            <Ionicons name="location" size={16} color={colors.ink} />
                            <Text style={styles.actionPillText}>Select on map</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionPill} onPress={addStop}>
                            <Ionicons name="add" size={16} color={colors.ink} />
                            <Text style={styles.actionPillText}>Add stops</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* SEARCH RESULTS OR RECENT */}
                    <View style={styles.listContainer}>
                        {isSearching ? (
                            <View style={styles.centerLoading}>
                                <ActivityIndicator size="small" color={colors.ink} />
                                <Text style={styles.loadingText}>Searching locations...</Text>
                            </View>
                        ) : dropQuery.trim().length > 0 && searchResults.length === 0 ? (
                            <View style={styles.centerLoading}>
                                <Text style={styles.loadingText}>No locations found.</Text>
                            </View>
                        ) : searchResults.length > 0 ? (
                            // Render Search Results
                            searchResults.map((result) => (
                                <TouchableOpacity
                                    key={result.id}
                                    style={styles.historyRow}
                                    onPress={() => handleSelectResult(result)}
                                >
                                    <View style={styles.historyIconWrapper}>
                                        <Ionicons name="location-outline" size={22} color={colors.inkSoft} />
                                    </View>
                                    <View style={styles.historyTextWrapper}>
                                        <Text style={styles.historyTitle} numberOfLines={1}>{result.title}</Text>
                                        <Text style={styles.historySubtitle} numberOfLines={1}>{result.subtitle || result.formattedAddress}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            // Render Recent Locations
                            recentLocations.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.historyRow}
                                    onPress={() => handleSelectRecent(item)}
                                >
                                    <View style={styles.historyIconWrapper}>
                                        <Ionicons name={item.type === 'home' ? 'home' : item.type === 'work' ? 'briefcase' : 'time-outline'} size={22} color={colors.inkSoft} />
                                    </View>
                                    <View style={styles.historyTextWrapper}>
                                        <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                                        <Text style={styles.historySubtitle} numberOfLines={1}>{item.subtitle}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.heartButton} onPress={() => toggleFavorite(item.id)}>
                                        <Ionicons name={item.isFavorite ? 'heart' : 'heart-outline'} size={22} color={item.isFavorite ? '#EF4444' : colors.inkSoft} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.ink,
        flex: 1,
    },
    forMeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    forMeText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.ink,
        marginRight: 4,
    },
    contentArea: {
        flex: 1,
    },
    inputCard: {
        marginHorizontal: 16,
        marginTop: 10,
        backgroundColor: colors.white,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 40,
    },
    markerRing: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    markerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    visualConnector: {
        width: 2,
        height: 24,
        backgroundColor: '#E2E8F0',
        marginLeft: 6, // Centers between the 14px ring
        marginVertical: 4,
        borderStyle: 'dashed',
    },
    inputField: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: colors.ink,
        paddingVertical: 8,
    },
    actionPillsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 20,
        gap: 12,
    },
    actionPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    actionPillText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.ink,
        marginLeft: 6,
    },
    divider: {
        height: 6,
        backgroundColor: '#F1F5F9',
        marginTop: 24,
        marginBottom: 8,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    historyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    historyIconWrapper: {
        width: 36,
        alignItems: 'center',
        marginRight: 10,
    },
    historyTextWrapper: {
        flex: 1,
    },
    historyTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.ink,
        marginBottom: 4,
    },
    historySubtitle: {
        fontSize: 13,
        color: colors.inkSoft,
    },
    heartButton: {
        padding: 4,
    },
    centerLoading: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: colors.inkSoft,
        fontWeight: '500',
    }
});
