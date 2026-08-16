import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HomeMap from '../../components/map/HomeMap';
import { Address, Coordinate } from '../../types/location';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const bottomSheetRef = useRef<BottomSheet>(null);

    // Track selections for future booking flows
    const [selectedCoord, setSelectedCoord] = useState<Coordinate | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

    // Initial snap point leaves map visible. Expanded fills the screen to the top notch.
    const snapPoints = useMemo(() => ['48%', '94%'], []);

    const handlePickupChange = (coord: Coordinate, location: Address | null) => {
        setSelectedCoord(coord);
        setSelectedAddress(location);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* --- MAP LAYER --- */}
            <View style={{ flex: 1 }}>
                <HomeMap onPickupLocationChange={handlePickupChange} />
            </View>
            {/* --- END MAP LAYER --- */}



            {/* --- BOTTOM SHEET LAYER --- */}
            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                handleIndicatorStyle={styles.sheetHandle}
                backgroundStyle={styles.sheetBackground}
                style={{ zIndex: 100, elevation: 20 }} // Crucial: forces sheet above everything in the Map Layer!
            >
                <BottomSheetScrollView
                    contentContainerStyle={styles.sheetScrollContent}
                    showsVerticalScrollIndicator={false}
                >

                    {/* Destination Search Bar */}
                    <TouchableOpacity activeOpacity={0.9} style={styles.searchBar}>
                        <Ionicons name="location-outline" size={22} color={colors.ink} style={{ marginRight: 12 }} />
                        <Text style={styles.searchPlaceholderText}>Where do you want to go?</Text>
                    </TouchableOpacity>

                    {/* Explore Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Explore</Text>
                        <TouchableOpacity activeOpacity={0.7} style={styles.viewAllBtn}>
                            <Text style={styles.viewAllText}>View All</Text>
                            <Ionicons name="chevron-forward" size={14} color={colors.inkSoft} />
                        </TouchableOpacity>
                    </View>

                    {/* Service Cards Carousel */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.svcRow}
                    >
                        {/* Shared Auto */}
                        <TouchableOpacity activeOpacity={0.7} style={styles.svcCard}>
                            <View style={[styles.svcIconBlock, { backgroundColor: '#F0FDF4' }]}>
                                {/* Illustration approximation */}
                                <LinearGradient colors={['#4ADE80', '#22C55E']} style={styles.vehicleIllustBackground} />
                                <Ionicons name="car-sport" size={28} color="#064E3B" style={{ marginTop: 6 }} />
                            </View>
                            <Text style={styles.svcName} numberOfLines={2}>Shared{'\n'}Auto</Text>
                        </TouchableOpacity>

                        {/* Parcel on Bike */}
                        <TouchableOpacity activeOpacity={0.7} style={styles.svcCard}>
                            <View style={[styles.svcIconBlock, { backgroundColor: '#FFFBEB' }]}>
                                <LinearGradient colors={['#FDE047', '#EAB308']} style={styles.vehicleIllustBackground} />
                                <Ionicons name="bicycle" size={28} color="#713F12" style={{ marginTop: 6 }} />
                                <Ionicons name="cube" size={14} color="#713F12" style={{ position: 'absolute', top: 10, right: 10 }} />
                            </View>
                            <Text style={styles.svcName} numberOfLines={2}>Parcel on{'\n'}Bike</Text>
                        </TouchableOpacity>

                        {/* Auto */}
                        <TouchableOpacity activeOpacity={0.7} style={styles.svcCard}>
                            <View style={[styles.svcIconBlock, { backgroundColor: '#F0FDF4' }]}>
                                <LinearGradient colors={['#4ADE80', '#22C55E']} style={styles.vehicleIllustBackground} />
                                <Ionicons name="car-sport" size={28} color="#064E3B" style={{ marginTop: 6 }} />
                            </View>
                            <Text style={styles.svcName} numberOfLines={2}>Auto</Text>
                        </TouchableOpacity>

                        {/* Cab Economy */}
                        <TouchableOpacity activeOpacity={0.7} style={styles.svcCard}>
                            <View style={[styles.svcIconBlock, { backgroundColor: '#F8FAFC' }]}>
                                <LinearGradient colors={['#E2E8F0', '#CBD5E1']} style={styles.vehicleIllustBackground} />
                                <Ionicons name="car" size={28} color="#0F172A" style={{ marginTop: 6 }} />
                            </View>
                            <Text style={styles.svcName} numberOfLines={2}>Cab{'\n'}Economy</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Promotional Banner */}
                    <TouchableOpacity activeOpacity={0.9} style={styles.primaryPromoBanner}>
                        <LinearGradient colors={['#0F172A', '#1E293B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={styles.promoHeadline}>FIRST AUTO RIDE FREE</Text>
                            <Text style={styles.promoSub}>offer has been detected.</Text>
                            <View style={styles.promoCtaBubble}>
                                <Text style={styles.promoCtaText}>Tap here to apply</Text>
                            </View>
                        </View>
                        <Ionicons name="globe-outline" size={80} color="rgba(255,255,255,0.03)" style={{ position: 'absolute', right: -20, bottom: -20 }} />
                    </TouchableOpacity>

                    {/* Go Places Section */}
                    <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>Go Places with MM Travels</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.placesRow}>

                        {/* International Airport */}
                        <TouchableOpacity activeOpacity={0.9} style={styles.placeCard}>
                            <View style={styles.placeImgZone}>
                                <LinearGradient colors={['#FCD34D', '#F59E0B']} style={StyleSheet.absoluteFill} />
                                <Ionicons name="airplane" size={44} color="#FFF" style={styles.placeIconMock} />
                            </View>
                            <View style={styles.placeTextZone}>
                                <Text style={styles.placeTitle} numberOfLines={2}>Visakhapatnam{'\n'}International...</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Junction */}
                        <TouchableOpacity activeOpacity={0.9} style={styles.placeCard}>
                            <View style={styles.placeImgZone}>
                                <LinearGradient colors={['#FCA5A5', '#EF4444']} style={StyleSheet.absoluteFill} />
                                <Ionicons name="train" size={44} color="#FFF" style={styles.placeIconMock} />
                            </View>
                            <View style={styles.placeTextZone}>
                                <Text style={styles.placeTitle} numberOfLines={2}>Visakhapatnam{'\n'}Junction</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Bus Stand */}
                        <TouchableOpacity activeOpacity={0.9} style={styles.placeCard}>
                            <View style={styles.placeImgZone}>
                                <LinearGradient colors={['#93C5FD', '#3B82F6']} style={StyleSheet.absoluteFill} />
                                <Ionicons name="bus" size={44} color="#FFF" style={styles.placeIconMock} />
                            </View>
                            <View style={styles.placeTextZone}>
                                <Text style={styles.placeTitle} numberOfLines={2}>Visakhapatnam{'\n'}Bus Stand</Text>
                            </View>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Secondary Large Campaign Card */}
                    <TouchableOpacity activeOpacity={0.9} style={styles.campaignCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.campaignHeader}>Three wheels.{'\n'}Free wheels.</Text>
                            <Text style={styles.campaignSubText}>
                                Use coupon: <Text style={{ fontWeight: '800' }}>FREERIDE</Text>{'\n'}on first Auto ride.
                            </Text>
                            <View style={styles.campaignButton}>
                                <Text style={styles.campaignButtonText}>Try Our Auto</Text>
                            </View>
                        </View>
                        <View style={styles.campaignIllustration}>
                            <Ionicons name="car-sport" size={70} color="#166534" />
                        </View>
                    </TouchableOpacity>

                    {/* Massive padding buffer to prevent bottom navigation overlap */}
                    {/* Bottom nav height + safety margin */}
                    <View style={{ height: Platform.OS === 'ios' ? 120 : 100 }} />

                </BottomSheetScrollView>
            </BottomSheet>
            {/* --- END BOTTOM SHEET LAYER --- */}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    sheetBackground: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        elevation: 20, // Forces sheet ABOVE the map elements!
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
    },
    sheetHandle: {
        width: 34,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginTop: 10,
    },
    sheetScrollContent: {
        paddingTop: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 28,
        marginHorizontal: 16,
        paddingHorizontal: 16,
        height: 52, // Exact spec height
        marginBottom: 18,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
    },
    searchPlaceholderText: {
        fontSize: 15, // spec
        fontWeight: '600', // spec
        color: colors.ink,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.ink,
    },
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewAllText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.inkSoft,
        marginRight: 2,
    },
    svcRow: {
        paddingLeft: 16, // Matching safe horizontal margin
        paddingRight: 6,
        gap: 12,
        marginBottom: 20,
    },
    svcCard: {
        width: 76,  // spec width (68-76dp)
        alignItems: 'center',
    },
    svcIconBlock: {
        width: 62,  // spec container (56-64dp)
        height: 62,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        position: 'relative',
        overflow: 'hidden',
    },
    vehicleIllustBackground: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        opacity: 0.15,
    },
    svcName: {
        fontSize: 12, // spec
        fontWeight: '600',
        color: colors.ink,
        textAlign: 'center',
        lineHeight: 14,
    },
    primaryPromoBanner: {
        width: width - 32,
        marginHorizontal: 16,
        height: 76, // Compact height per spec
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    promoHeadline: {
        fontSize: 14,
        fontWeight: '900',
        color: colors.gold,
        letterSpacing: 0.2,
    },
    promoSub: {
        fontSize: 11,
        color: '#E2E8F0',
        marginTop: 2,
        marginBottom: 8,
    },
    promoCtaBubble: {
        backgroundColor: colors.white,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    promoCtaText: {
        fontSize: 9,
        fontWeight: '800',
        color: colors.ink,
    },
    placesRow: {
        paddingLeft: 16,
        paddingRight: 6,
        gap: 12,
        marginBottom: 28,
    },
    placeCard: {
        width: 118, // spec width
        height: 148, // spec height
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        overflow: 'hidden',
    },
    placeImgZone: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeIconMock: {
        opacity: 0.9,
    },
    placeTextZone: {
        backgroundColor: colors.white,
        paddingHorizontal: 10,
        paddingVertical: 8,
        height: 52, // 2 lines explicitly
        justifyContent: 'center',
    },
    placeTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.ink,
        lineHeight: 14,
    },
    campaignCard: {
        backgroundColor: '#FFF8F0',
        borderWidth: 1,
        borderColor: '#FEF0DA',
        borderRadius: 16, // Spec radius
        marginHorizontal: 16,
        padding: 20,
        flexDirection: 'row',
    },
    campaignHeader: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.ink,
        lineHeight: 22,
        marginBottom: 8,
    },
    campaignSubText: {
        fontSize: 12,
        color: colors.inkSoft,
        lineHeight: 16,
        marginBottom: 16,
    },
    campaignButton: {
        backgroundColor: '#FDE68A',
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    campaignButtonText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#B45309',
    },
    campaignIllustration: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        flex: 0.5,
    }
});
