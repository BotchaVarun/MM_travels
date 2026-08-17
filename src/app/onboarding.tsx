import { Button } from '@/components/ui/Button';
import { colors, radius, spacing, typography } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SLIDES = [
    {
        id: '1',
        title: 'Discover',
        subtitle: 'Find the best routes and vehicle options for your journey.',
        illustrationType: 'map',
        image: require('../../assets/images/onboarding_1.png'),
    },
    {
        id: '2',
        title: 'Compare Verified Fleets',
        subtitle: 'Choose from a variety of trusted and verified vehicles.',
        illustrationType: 'car',
        image: require('../../assets/images/onboarding_2.png'),
    },
    {
        id: '3',
        title: 'Book With Confidence',
        subtitle: 'Secure payments, live tracking, and dedicated support.',
        illustrationType: 'shield',
        image: require('../../assets/images/onboarding_3.png'),
    },
];

const IllustrationPlaceholder = ({ slide }: { slide: typeof SLIDES[0] }) => {
    return (
        <View style={styles.illustrationWrapper}>
            <Image
                source={slide.image}
                style={styles.illustrationImage}
                resizeMode="contain"
            />
        </View>
    );
};

export default function OnboardingScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleSkip = async () => {
        // Navigate to Mobile Number Entry and persist completed onboarding flag
        try {
            await AsyncStorage.setItem('hasOnboarded', 'true');
        } catch (e) {
            console.warn('Failed to save onboarding status', e);
        }
        router.replace('/mobile-number');
    };

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            handleSkip();
        }
    };

    const onMomentumScrollEnd = (e: any) => {
        const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
        setCurrentIndex(newIndex);
    };

    const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
        return (
            <View style={[styles.slide, { width }]}>
                <IllustrationPlaceholder slide={item} />
            </View>
        );
    };

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            {/* Top Utility */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            {/* Illustration & Progress Zone */}
            <View style={styles.stageZone}>
                <FlatList
                    ref={flatListRef}
                    data={SLIDES}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    renderItem={renderItem}
                />

                {/* Progress Dots */}
                <View style={styles.paginationContainer}>
                    {SLIDES.map((_, index) => (
                        <TouchableOpacity
                            key={index.toString()}
                            onPress={() => flatListRef.current?.scrollToIndex({ index })}
                            style={[
                                styles.dot,
                                currentIndex === index ? styles.activeDot : styles.inactiveDot
                            ]}
                        />
                    ))}
                </View>
            </View>

            {/* Copy Sheet */}
            <View style={styles.copySheet}>
                <Text style={styles.titleText}>{SLIDES[currentIndex].title}</Text>
                <Text style={styles.subtitleText}>{SLIDES[currentIndex].subtitle}</Text>

                <View style={styles.ctaContainer}>
                    <Button
                        label={currentIndex === SLIDES.length - 1 ? "Get Started" : "Continue"}
                        onPress={handleNext}
                        variant="gold"
                    />
                </View>
            </View>
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
        justifyContent: 'flex-end',
        paddingHorizontal: spacing.screenPadX,
        paddingTop: 10,
    },
    skipButton: {
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    skipText: {
        color: colors.inkSoft,
        fontSize: 12,
        fontWeight: '600',
    },
    stageZone: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    illustrationWrapper: {
        width: 340,
        height: 340,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    illustrationImage: {
        width: '100%',
        height: '100%',
    },
    paginationContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 30, // Just above the sheet
        gap: 5,
    },
    dot: {
        height: 4,
        borderRadius: 2,
    },
    activeDot: {
        width: 16,
        backgroundColor: colors.gold,
    },
    inactiveDot: {
        width: 6,
        backgroundColor: '#E2E8F0',
    },
    copySheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: radius.sheetTop,
        borderTopRightRadius: radius.sheetTop,
        paddingTop: 26,
        paddingHorizontal: 22,
        paddingBottom: 40, // Expanded safe area pad at bottom
    },
    titleText: {
        fontSize: typography.display.fontSize,
        fontWeight: typography.display.fontWeight,
        color: colors.ink,
        marginBottom: 8,
    },
    subtitleText: {
        fontSize: 12.5,
        color: colors.inkSoft,
        lineHeight: 12.5 * 1.5,
        marginBottom: 18,
    },
    ctaContainer: {
        marginTop: 18,
    }
});
