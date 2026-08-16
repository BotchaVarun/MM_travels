import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AllServicesModalProps {
    onDismiss?: () => void;
}

const ALL_SERVICES = [
    { id: 'shared_auto', name: 'Shared\nAuto', icon: 'car-sport', iconColor: '#064E3B', bg: '#F0FDF4', gradient: ['#4ADE80', '#22C55E'], isNew: false },
    { id: 'parcel_bike', name: 'Parcel on\nBike', icon: 'bicycle', badge: 'cube', iconColor: '#713F12', bg: '#FFFBEB', gradient: ['#FDE047', '#EAB308'], isNew: false },
    { id: 'auto', name: 'Auto', icon: 'car-sport', iconColor: '#064E3B', bg: '#F0FDF4', gradient: ['#4ADE80', '#22C55E'], isNew: false },
    { id: 'cab_economy', name: 'Cab\nEconomy', icon: 'car', iconColor: '#0F172A', bg: '#F8FAFC', gradient: ['#E2E8F0', '#CBD5E1'], isNew: false },
    { id: 'bike', name: 'Bike', icon: 'bicycle', iconColor: '#1E293B', bg: '#F1F5F9', gradient: ['#CBD5E1', '#94A3B8'], isNew: false },
    { id: 'bike_lite', name: 'Bike Lite', icon: 'bicycle', badge: 'pricetag', iconColor: '#14532D', bg: '#DCFCE7', gradient: ['#86EFAC', '#4ADE80'], isNew: false },
    { id: 'cab_premium', name: 'Cab\nPremium', icon: 'car', iconColor: '#854D0E', bg: '#FEF9C3', gradient: ['#FDE047', '#EAB308'], isNew: true },
    { id: 'travel', name: 'Travel', icon: 'bus', iconColor: '#1E3A8A', bg: '#DBEAFE', gradient: ['#93C5FD', '#60A5FA'], isNew: false },
];

export const AllServicesModal = forwardRef<BottomSheet, AllServicesModalProps>(({ onDismiss }, ref) => {
    // Snap points for the modal. We use fixed percentages relative to the screen.
    const snapPoints = useMemo(() => ['70%'], []);

    // Renders the dimmed background behind the modal.
    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                opacity={0.6}
            />
        ),
        []
    );

    return (
        <BottomSheet
            ref={ref}
            index={-1} // IMPORTANT: Start closed
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            onClose={onDismiss} // Maps onClose to onDismiss for standard BottomSheet
            handleIndicatorStyle={styles.sheetHandle}
            backgroundStyle={styles.sheetBackground}
            enablePanDownToClose={true}
            style={styles.sheetWrapper}
        >
            {/* Extremely precise floating X button */}
            <TouchableOpacity
                style={styles.floatingCloseBtn}
                activeOpacity={0.8}
                onPress={() => {
                    if (ref && 'current' in ref && ref.current) {
                        ref.current.close();
                    }
                }}
            >
                <Ionicons name="close" size={20} color={colors.ink} />
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={styles.title}>All services</Text>
            </View>
            <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContainer}>
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
            </BottomSheetScrollView>
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    floatingCloseBtn: {
        position: 'absolute',
        top: -50,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        zIndex: 999, // ensures it sits above the wrapper
    },
    sheetBackground: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
    },
    sheetWrapper: {
        zIndex: 100, // Forces the modal sheet above the underlying navigation and primary sheet
        elevation: 20,
    },
    sheetHandle: {
        width: 34,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginTop: 10,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    title: {
        fontSize: 22,
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
        width: '25%', // 4 items per row
        alignItems: 'center',
        marginBottom: 24,
    },
    svcIconBlock: {
        width: 65,
        height: 65,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        overflow: 'hidden', // to bound the background gradient
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
