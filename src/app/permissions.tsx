import { Button } from '@/components/ui/Button';
import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Premium Pulsing Animation Component ---
const PulsingPin = () => {
    const pulseLoop = useSharedValue(0);

    useEffect(() => {
        pulseLoop.value = withRepeat(
            withTiming(1, { duration: 2500, easing: Easing.out(Easing.ease) }),
            -1, // infinite
            false // do not reverse, just loop 0->1
        );
    }, []);

    const animatedRingStyle1 = useAnimatedStyle(() => {
        return {
            transform: [{ scale: interpolate(pulseLoop.value, [0, 1], [0.8, 2.5]) }],
            opacity: interpolate(pulseLoop.value, [0, 0.5, 1], [0.8, 0.2, 0], Extrapolation.CLAMP),
        };
    });

    const animatedRingStyle2 = useAnimatedStyle(() => {
        // Offset phase for double ripple effect
        const phase2 = (pulseLoop.value + 0.5) % 1;
        return {
            transform: [{ scale: interpolate(phase2, [0, 1], [0.8, 2.5]) }],
            opacity: interpolate(phase2, [0, 0.5, 1], [0.8, 0.2, 0], Extrapolation.CLAMP),
        };
    });

    return (
        <View style={styles.pinContainer}>
            <Animated.View style={[styles.ring, animatedRingStyle1, { borderColor: colors.gold }]} />
            <Animated.View style={[styles.ring, animatedRingStyle2, { borderColor: colors.blue }]} />

            {/* Center Pin Graphic */}
            <View style={styles.pinCore}>
                <Ionicons name="location" size={32} color={colors.white} />
            </View>
        </View>
    );
};

export default function PermissionsScreen() {
    const router = useRouter();

    const handleAllow = async () => {
        try {
            // Physically invoke the native OS Dialog requesting foreground location permissions
            const { status } = await Location.requestForegroundPermissionsAsync();

            // Whether they accepted or logically hit deny on the OS prompt, we continue the flow gracefully. 
            // In a real Redux/Zustand store, we would save the 'status' boolean here.
            if (status === 'granted') {
                console.log('Location permission granted by user.');
            } else {
                console.log('Location permission denied by user.');
            }

            router.replace('/(tabs)' as any);
        } catch (error) {
            console.warn('Error requesting location permissions:', error);
            router.replace('/(tabs)' as any);
        }
    };

    const handleSkip = () => {
        // Log skip event, move to home without permissions
        router.replace('/(tabs)' as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Graphic Area (Flex 1 for centering) */}
            <View style={styles.graphicZone}>
                <PulsingPin />
            </View>

            {/* Copy & CTA Bottom Area */}
            <View style={styles.bottomZone}>
                <Text style={styles.title}>Enable Location</Text>
                <Text style={styles.body}>
                    We need your location to show available rides nearby, track your journey properly, and ensure your safety.
                </Text>

                <View style={styles.actionBlock}>
                    <Button
                        label="Allow Access"
                        variant="gold"
                        onPress={handleAllow}
                    />

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleSkip}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.secondaryText}>Maybe Later</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.navy900,
    },
    graphicZone: {
        flex: 1.2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinContainer: {
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ring: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        borderWidth: 2,
        borderRadius: 64, // ensures perfect circle
    },
    pinCore: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.gold,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, // Bring above the rings
        // Subtle shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    bottomZone: {
        flex: 1,
        paddingHorizontal: spacing.screenPadX,
        justifyContent: 'flex-end',
        paddingBottom: 24, // extra bottom pad
    },
    title: {
        fontSize: 24, // slightly larger for prominent dark screen copy
        fontWeight: '800',
        color: colors.white,
        textAlign: 'center',
        marginBottom: 12,
    },
    body: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '500',
        color: '#B9C2D4',
        textAlign: 'center',
        marginBottom: 40,
        paddingHorizontal: 16,
    },
    actionBlock: {
        width: '100%',
        gap: 16,
    },
    secondaryButton: {
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: radius.button,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    secondaryText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#B9C2D4',
    }
});
