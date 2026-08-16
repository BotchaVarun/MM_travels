import { ThreeDotPulse } from '@/components/ThreeDotPulse';
import { colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplashScreenComponent() {
  const router = useRouter();
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in animation
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });

    // Simulate < 1.8s cold launch budget and route
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 1800);

    return () => clearTimeout(timer);
  }, [router]);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: opacity.value * 0.1 + 0.9 }], // Subtle scale pop-in
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerStage}>
        {/* Animated Image replacing the old text logo */}
        <Animated.View style={animatedLogoStyle}>
          <Image
            source={require('../../assets/images/splash-icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={styles.pulseContainer}>
          <ThreeDotPulse />
        </View>
      </View>

      <Text style={styles.versionText}>v1.0.0</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy900,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerStage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 140, // Adjust this baseline size based on the asset actual bounds
    height: 140,
  },
  pulseContainer: {
    marginTop: 24,
  },
  versionText: {
    color: '#B9C2D4',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 24, // 24px from bottom safe-area
  },
});
