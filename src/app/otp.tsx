import { BackHeader } from '@/components/ui/BackHeader';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 45;

export default function OTPScreen() {
    const router = useRouter();
    // Retrieve phone dynamically from previous screen
    const { phone } = useLocalSearchParams<{ phone: string }>();

    const [code, setCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(RESEND_COOLDOWN);
    const [isVerifying, setIsVerifying] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Focus the hidden input automatically
    useEffect(() => {
        // slight delay ensures keyboard opens smoothly after transition
        const timeout = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timeout);
    }, []);

    // Countdown timer logic
    useEffect(() => {
        if (timeLeft <= 0) return;
        const intervalId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft]);

    const handleResend = async () => {
        if (timeLeft > 0) return;

        try {
            const baseUrl = 'http://10.200.240.210:5000';
            await fetch(`${baseUrl}/api/auth/send-whatsapp-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            setTimeLeft(RESEND_COOLDOWN);
            inputRef.current?.focus();
        } catch (e) {
            alert('Failed to resend WhatsApp OTP');
        }
    };

    const handleVerify = async () => {
        setIsVerifying(true);
        try {
            const baseUrl = 'http://10.200.240.210:5000';
            const response = await fetch(`${baseUrl}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, code }),
            });

            const data = await response.json();
            setIsVerifying(false);

            if (response.ok) {
                // Securely save the session token so they don't have to login tomorrow
                await AsyncStorage.setItem('userToken', data.token);

                // Dynamically route: If new user -> profile-reg, else -> home (mocked logic)
                if (data.isNewUser) {
                    router.replace({
                        pathname: '/profile-registration',
                        params: { phone }
                    });
                } else {
                    router.replace('/(tabs)');
                }
            } else {
                alert(data.error || 'Invalid OTP');
                setCode('');
                inputRef.current?.focus();
            }
        } catch (error) {
            setIsVerifying(false);
            console.log(error);
            alert('Cannot connect to validation server');
        }
    };

    const isComplete = code.length === OTP_LENGTH && !isVerifying;

    // The hidden input handler
    const renderOTPBoxes = () => {
        const boxes = [];
        for (let i = 0; i < OTP_LENGTH; i++) {
            const char = code[i] || '';
            const isCurrentDigit = i === code.length;
            const isActive = isCurrentDigit || (i === OTP_LENGTH - 1 && code.length === OTP_LENGTH);

            boxes.push(
                <View
                    key={i}
                    style={[
                        styles.otpBox,
                        isActive ? styles.otpBoxActive : null,
                    ]}
                >
                    <Text style={styles.otpText}>{char}</Text>
                    {/* Mock cursor blink on the active empty box */}
                    {isActive && !char && (
                        <View style={styles.cursor} />
                    )}
                </View>
            );
        }
        return boxes;
    };

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <BackHeader title="Verify your number" />

                <View style={styles.content}>
                    {/* Illustration Zone added from splash style request */}
                    <View style={styles.centerStage}>
                        <Image
                            source={require('../../assets/images/icon.png')}
                            style={styles.logoImage}
                            resizeMode="cover"
                        />
                    </View>

                    {/* Subcopy Section */}
                    <View style={styles.subcopyContainer}>
                        <Text style={styles.subcopyText}>
                            Enter the {OTP_LENGTH}-digit code sent via WhatsApp to
                        </Text>
                        <View style={styles.phoneRow}>
                            <Text style={styles.phoneText}>+91 {phone || '...'} </Text>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* OTP Input Section */}
                    <Pressable
                        style={styles.otpInteractionZone}
                        onPress={() => inputRef.current?.focus()}
                    >
                        <View style={styles.otpBoxesContainer}>
                            {renderOTPBoxes()}
                        </View>

                        {/* Absolute Hidden Input to capture reliable layout events and pastes */}
                        <TextInput
                            ref={inputRef}
                            style={styles.hiddenInput}
                            value={code}
                            onChangeText={(text) => {
                                const numericText = text.replace(/[^0-9]/g, '');
                                setCode(numericText.slice(0, OTP_LENGTH));
                            }}
                            keyboardType="number-pad"
                            textContentType="oneTimeCode"
                            autoComplete="sms-otp"
                            maxLength={OTP_LENGTH}
                            caretHidden
                        />
                    </Pressable>

                    {/* Resend Section */}
                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>Didn't get it? </Text>
                        {timeLeft > 0 ? (
                            <Text style={styles.timerText}>
                                Resend in 0:{timeLeft.toString().padStart(2, '0')}
                            </Text>
                        ) : (
                            <TouchableOpacity onPress={handleResend}>
                                <Text style={styles.resendLink}>Resend now</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Floating CTA Footer */}
                <View style={styles.footer}>
                    <Button
                        label="Verify & Continue"
                        variant="gold"
                        disabled={!isComplete}
                        onPress={handleVerify}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    keyboardAvoid: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.screenPadX,
        paddingTop: 16,
    },
    centerStage: {
        alignItems: 'center',
        marginVertical: 24,
    },
    logoImage: {
        width: 200,
        height: 200,
        borderRadius: 100,
        overflow: 'hidden',
    },
    subcopyContainer: {
        marginBottom: 32,
    },
    subcopyText: {
        fontSize: 14,
        color: colors.inkSoft,
        fontWeight: '500',
        marginBottom: 4,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    phoneText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.ink,
    },
    editText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.goldDark, // matches the visual 'Edit' string color in spec
    },
    otpInteractionZone: {
        position: 'relative',
        marginBottom: 24,
    },
    otpBoxesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    otpBox: {
        width: 44,
        height: 52,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.line,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    otpBoxActive: {
        borderColor: colors.gold,
    },
    otpText: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.ink,
    },
    hiddenInput: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0,
        // Invisible but overlays the boxes to catch all taps easily
    },
    cursor: {
        width: 1.5,
        height: 24,
        backgroundColor: colors.ink,
        opacity: 0.6,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resendText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.inkSoft,
    },
    timerText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.ink,
    },
    resendLink: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.goldDark,
    },
    footer: {
        paddingHorizontal: spacing.screenPadX,
        paddingBottom: 24, // extra bottom padding for the safe area visually
        paddingTop: 12,
        backgroundColor: colors.white,
    },
});
