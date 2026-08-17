import { Button } from '@/components/ui/Button';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MobileNumberScreen() {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = async () => {
        setIsLoading(true);
        try {
            // Force URL based on loopback or local ip. React Native uses 10.0.2.2 for Android local host
            const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

            const response = await fetch(`${baseUrl}/api/auth/send-whatsapp-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phoneNumber }),
            });

            const data = await response.json();

            setIsLoading(false);
            if (response.ok) {
                // Pass phone dynamically so OTP knows who to verify
                router.push({ pathname: '/otp', params: { phone: phoneNumber } });
            } else {
                alert(data.error || 'Failed to send OTP via WhatsApp');
            }
        } catch (error) {
            setIsLoading(false);
            alert('Cannot connect to backend server. Make sure it is running!');
            console.log(error);
        }
    };

    const handleSkip = async () => {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status === 'granted') {
                router.replace('/(tabs)');
            } else {
                router.replace('/permissions');
            }
        } catch (error) {
            router.replace('/permissions');
        }
    };

    const isButtonDisabled = phoneNumber.length < 10 || isLoading;

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Top Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                </View>

                {/* Illustration Zone */}
                <View style={styles.illustrationZone}>
                    <View style={styles.circleBackground}>
                        <Image
                            source={require('../../assets/images/icon.png')}
                            style={{ width: 200, height: 200, borderRadius: 100, overflow: 'hidden' }}
                            resizeMode="cover"
                        />
                    </View>
                </View>

                {/* White Bottom Sheet */}
                <View style={styles.bottomSheet}>
                    <View style={styles.sheetContent}>
                        {/* Progress Dots */}
                        <View style={styles.dotsContainer}>
                            <View style={[styles.dot, styles.dotActive]} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                        </View>

                        <Text style={styles.titleText}>Welcome to MM Travels</Text>

                        {/* Input Row */}
                        <View style={styles.inputContainer}>
                            <TouchableOpacity style={styles.countryCodeSelector} activeOpacity={0.7}>
                                <Text style={styles.countryCodeText}>+91</Text>
                                <Ionicons name="caret-down" size={12} color={colors.ink} style={styles.caret} />
                            </TouchableOpacity>

                            <View style={styles.verticalDivider} />

                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter mobile number"
                                placeholderTextColor={colors.inkFaint}
                                keyboardType="numeric"
                                maxLength={10}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                            />
                        </View>

                        <Text style={styles.helperText}>
                            We'll send an OTP for verification
                        </Text>

                        <View style={styles.buttonContainer}>
                            <Button
                                label="Continue"
                                variant="gold"
                                disabled={isButtonDisabled}
                                onPress={handleContinue}
                                icon={<Ionicons name="arrow-forward" size={18} color="#3A2405" style={{ marginLeft: 8 }} />}
                            />
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.navy900,
    },
    keyboardAvoid: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: spacing.screenPadX,
        paddingTop: 10,
    },
    skipButton: {
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    skipText: {
        color: '#B9C2D4',
        fontSize: 14,
        fontWeight: '500',
    },
    illustrationZone: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleBackground: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    carIcon: {
        marginLeft: -20,
        marginBottom: -10,
    },
    luggageIcon: {
        position: 'absolute',
        bottom: 50,
        right: 40,
    },
    bottomSheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: radius.sheetTop,
        borderTopRightRadius: radius.sheetTop,
        paddingTop: 24,
        paddingBottom: 40, // pad for safe area
    },
    sheetContent: {
        paddingHorizontal: 22,
        alignItems: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB',
    },
    dotActive: {
        backgroundColor: colors.gold,
    },
    titleText: {
        fontSize: typography.display.fontSize,
        fontWeight: typography.display.fontWeight,
        color: colors.ink,
        marginBottom: 32,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: '#D1D5DB',
        paddingBottom: 8,
        width: '100%',
        marginBottom: 16,
    },
    countryCodeSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 8,
    },
    countryCodeText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.ink,
    },
    caret: {
        marginLeft: 4,
    },
    verticalDivider: {
        width: 1,
        height: 20,
        backgroundColor: '#D1D5DB',
        marginHorizontal: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: colors.ink,
        paddingVertical: 0,
    },
    helperText: {
        fontSize: 12,
        color: colors.inkSoft,
        fontWeight: '600',
        marginBottom: 32,
    },
    buttonContainer: {
        width: '100%',
    },
});
