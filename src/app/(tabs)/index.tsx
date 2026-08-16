import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_REGION = {
    latitude: 17.6868,
    longitude: 83.2185,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            {/* Background Map */}
            <MapView
                style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                initialRegion={MOCK_REGION}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass={false}
            />

            {/* Top Floating Target Location Search */}
            <SafeAreaView pointerEvents="box-none" style={styles.topFloatingZone}>
                <View style={styles.topSearchCard}>
                    <View style={styles.greenRing}>
                        <View style={styles.greenDot} />
                    </View>
                    <Text style={styles.topSearchText}>Your Current Location</Text>
                    <TouchableOpacity activeOpacity={0.7} style={styles.gpsButton}>
                        <Ionicons name="locate" size={20} color={colors.ink} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Interactive Bottom Sheet overlay */}
            <View style={styles.bottomSheet} pointerEvents="box-none">
                <View style={styles.sheetContainer}>
                    <View style={styles.dragHandle} />

                    {/* Search Input Box */}
                    <TouchableOpacity activeOpacity={0.8} style={styles.searchInputCard}>
                        <Ionicons name="search" size={20} color={colors.ink} style={styles.searchIcon} />
                        <Text style={styles.searchPlaceholderText}>Where do you want to go?</Text>
                    </TouchableOpacity>

                    {/* Current Address Sub-row */}
                    <View style={styles.addressRow}>
                        <View style={styles.greenDotSmall} />
                        <Text style={styles.addressText} numberOfLines={1}>
                            M3VW+289, Mantripalem Colony, Andhra Prad...
                        </Text>
                    </View>

                    {/* Services Grid */}
                    <Text style={styles.sectionTitle}>Our Services</Text>

                    <View style={styles.gridContainer}>
                        {/* Service 1 */}
                        <TouchableOpacity activeOpacity={0.7} style={styles.serviceBox}>
                            <Text style={styles.serviceEmoji}>🛺</Text>
                            <Text style={styles.serviceTitle}>Quick Rides</Text>
                        </TouchableOpacity>

                        {/* Service 2 */}
                        <TouchableOpacity activeOpacity={0.7} style={styles.serviceBox}>
                            <Text style={styles.serviceEmoji}>🚕</Text>
                            <Text style={styles.serviceTitle}>Cabs</Text>
                        </TouchableOpacity>

                        {/* Service 3 */}
                        <TouchableOpacity activeOpacity={0.7} style={styles.serviceBox}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
                                <Text style={styles.serviceEmoji}>🚕</Text>
                                <Text style={{ fontSize: 20 }}>🧳</Text>
                            </View>
                            <Text style={styles.serviceTitle}>Airport Cabs</Text>
                        </TouchableOpacity>

                        {/* Service 4 */}
                        <TouchableOpacity activeOpacity={0.7} style={styles.serviceBox}>
                            <Text style={styles.serviceEmoji}>📦</Text>
                            <Text style={styles.serviceTitle}>More Services</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    topFloatingZone: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 10,
        zIndex: 10,
    },
    topSearchCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 30, // tall pill
        height: 52,
        paddingHorizontal: 16,
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    greenRing: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: colors.greenInk,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    greenDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.greenInk,
    },
    topSearchText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        color: colors.inkSoft,
    },
    gpsButton: {
        padding: 8,
        marginRight: -8, // absorb padding for tighter native alignment
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'flex-end',
        // Push the sheet content upwards so it doesn't collide with the pill tab bar natively
        paddingBottom: Platform.OS === 'ios' ? 110 : 100,
    },
    sheetContainer: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        // Soft shadow casting upward onto the map
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 10,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.ink,
        alignSelf: 'center',
        marginBottom: 20,
    },
    searchInputCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.line,
        borderRadius: 24,
        height: 48,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchPlaceholderText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.inkSoft,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        marginBottom: 24,
    },
    greenDotSmall: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.greenInk,
        marginRight: 10,
    },
    addressText: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.inkSoft,
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.ink,
        marginBottom: 16,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    serviceBox: {
        width: '48%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        height: 100, // Fixed height for visual consistency
        justifyContent: 'flex-end', // pushes title to bottom
    },
    serviceEmoji: {
        fontSize: 32,
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: [{ translateX: -16 }],
        textAlign: 'center',
    },
    serviceTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.ink,
        textAlign: 'center',
    },
});
