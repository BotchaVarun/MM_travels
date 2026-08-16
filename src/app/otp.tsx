import { BackHeader } from '@/components/ui/BackHeader';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
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
    const [code, setCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(RESEND_COOLDOWN);
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

    const handleResend = () => {
        if (timeLeft > 0) return;
        // Trigger API resend here
        setTimeLeft(RESEND_COOLDOWN);
        inputRef.current?.focus();
    };

    const handleVerify = () => {
        // Complete onboarding / verify OTP
        // Navigate to A5 Profile Registration Screen
        router.replace('/profile-registration');
    };

    const isComplete = code.length === OTP_LENGTH;

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
                    {/* Subcopy Section */}
                    <View style={styles.subcopyContainer}>
                        <Text style={styles.subcopyText}>
                            Enter the {OTP_LENGTH}-digit code sent to
                        </Text>
                        <View style={styles.phoneRow}>
                            <Text style={styles.phoneText}>+91 98765 43210</Text>
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
        paddingTop: 32,
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
