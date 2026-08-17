import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ALL_SERVICES = [
    { id: 'shared_auto', name: 'Shared\nAuto', icon: 'car-sport', iconColor: '#064E3B', bg: '#F0FDF4', gradient: ['#4ADE80', '#22C55E'], isNew: false },
    { id: 'parcel_bike', name: 'Parcel on\nBike', icon: 'bicycle', badge: 'cube', iconColor: '#713F12', bg: '#FFFBEB', gradient: ['#FDE047', '#EAB308'], isNew: false },
    { id: 'auto', name: 'Auto', icon: 'car-sport', iconColor: '#064E3B', bg: '#F0FDF4', gradient: ['#4ADE80', '#22C55E'], isNew: false },
    { id: 'cab_economy', name: 'Cab\nEconomy', icon: 'car', iconColor: '#0F172A', bg: '#F8FAFC', gradient: ['#E2E8F0', '#CBD5E1'], isNew: false },
    { id: 'bike', name: 'Bike', icon: 'bicycle', iconColor: '#1E293B', bg: '#F1F5F9', gradient: ['#CBD5E1', '#94A3B8'], isNew: false },
    { id: 'bike_lite', name: 'Bike Lite', icon: 'bicycle', badge: 'pricetag', iconColor: '#14532D', bg: '#DCFCE7', gradient: ['#86EFAC', '#4ADE80'], isNew: false },
    { id: 'cab_premium', name: 'Cab\nPremium', icon: 'car', iconColor: '#854D0E', bg: '#FEF9C3', gradient: ['#FDE047', '#EAB308'], isNew: true },
    { id: 'travel', name: 'Travel', icon: 'bus', iconColor: '#1E3A8A', bg: '#DBEAFE', gradient: ['#93C5FD', '#60A5FA'], isNew: false },
];

export default function ServicesScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>All services</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContainer}>
                {ALL_SERVICES.map((svc) => (
                    <TouchableOpacity key={svc.id} activeOpacity={0.7} style={styles.serviceItem}>
                        <View style={[styles.svcIconBlock, { backgroundColor: svc.bg }]}>
                            <LinearGradient colors={svc.gradient as [string, string]} style={styles.vehicleIllustBackground} />
                            <Ionicons name={svc.icon as any} size={28} color={svc.iconColor} style={{ marginTop: 6 }} />
                            {svc.badge && (
                                <Ionicons name={svc.badge as any} size={14} color={svc.iconColor} style={{ position: 'absolute', top: 10, right: 10 }} />
                            )}
                            {svc.isNew && (
                                <Ionicons name="sparkles" size={16} color="#EAB308" style={{ position: 'absolute', top: -5, right: -5 }} />
                            )}
                        </View>
                        <Text style={styles.svcName} numberOfLines={2}>{svc.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: colors.ink,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 10,
        paddingBottom: 40,
    },
    serviceItem: {
        width: '25%', // 4 items per row exactly mimicking Rapido's dense layout
        alignItems: 'center',
        marginBottom: 28,
    },
    svcIconBlock: {
        width: 70,
        height: 70,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',
    },
    vehicleIllustBackground: {
        position: 'absolute',
        bottom: -20,
        right: -20,
        width: 50,
        height: 50,
        borderRadius: 25,
        opacity: 0.15,
    },
    svcName: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.ink,
        textAlign: 'center',
        lineHeight: 16,
    },
});