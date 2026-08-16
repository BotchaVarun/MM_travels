import { colors } from '@/constants/theme';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

const Dot = ({ delay }: { delay: number }) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: 400 }),
                    withTiming(0.3, { duration: 400 })
                ),
                -1, // infinite
                false
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    return <Animated.View style={[styles.dot, animatedStyle]} />;
};

export function ThreeDotPulse() {
    return (
        <View style={styles.container}>
            <Dot delay={0} />
            <Dot delay={200} />
            <Dot delay={400} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.gold,
    },
});
