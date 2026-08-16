import { BackHeader } from '@/components/ui/BackHeader';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { colors, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type GenderOption = 'Male' | 'Female' | 'Other' | null;

export default function ProfileRegistrationScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState<GenderOption>(null);

    const [emergencyName, setEmergencyName] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');

    // Validate required fields (Full name, emergency contact details are mandatory as per spec)
    const isFormValid =
        name.trim().length > 0 &&
        emergencyName.trim().length > 0 &&
        emergencyPhone.trim().length === 10;

    const handleSave = () => {
        // Save profile to API, route to KYC
        router.push('/kyc');
    };

    const renderGenderSegment = (label: GenderOption) => {
        const isSelected = gender === label;
        return (
            <TouchableOpacity
                key={label}
                activeOpacity={0.7}
                onPress={() => setGender(label)}
                style={[
                    styles.genderSegment,
                    isSelected && styles.genderSegmentActive,
                ]}
            >
                <Text
                    style={[
                        styles.genderSegmentText,
                        isSelected && styles.genderSegmentTextActive,
                    ]}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <BackHeader title="Tell us about you" />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.subcopyText}>
                        Please provide your details to complete your MM Travels profile.
                    </Text>

                    {/* Personal Info */}
                    <InputField
                        placeholder="Full Name"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />

                    <InputField
                        placeholder="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    {/* Gender Selection */}
                    <Text style={styles.sectionLabel}>Gender</Text>
                    <View style={styles.genderContainer}>
                        {renderGenderSegment('Male')}
                        {renderGenderSegment('Female')}
                        {renderGenderSegment('Other')}
                    </View>

                    <View style={styles.divider} />

                    {/* Emergency Contact */}
                    <Text style={styles.sectionLabel}>Emergency Contact</Text>
                    <InputField
                        placeholder="Contact Name"
                        value={emergencyName}
                        onChangeText={setEmergencyName}
                        autoCapitalize="words"
                    />
                    <InputField
                        placeholder="Phone Number"
                        value={emergencyPhone}
                        onChangeText={setEmergencyPhone}
                        keyboardType="number-pad"
                        maxLength={10}
                    />
                </ScrollView>

                {/* Floating CTA Footer */}
                <View style={styles.footer}>
                    <Button
                        label="Save & Continue"
                        variant="gold"
                        disabled={!isFormValid}
                        onPress={handleSave}
                        icon={<Ionicons name="arrow-forward" size={18} color="#3A2405" style={{ marginLeft: 8 }} />}
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.screenPadX,
        paddingTop: 24,
        paddingBottom: 40,
    },
    subcopyText: {
        fontSize: 14,
        color: colors.inkSoft,
        fontWeight: '500',
        lineHeight: 20,
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 15,
        fontWeight: '800',
        color: colors.ink,
        marginTop: 8,
        marginBottom: 12,
    },
    genderContainer: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 12,
        padding: 2,
        marginBottom: 24,
    },
    genderSegment: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    genderSegmentActive: {
        backgroundColor: colors.white,
        // Add subtle shadow for active pill exactly like the visual spec language
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    genderSegmentText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.inkSoft,
    },
    genderSegmentTextActive: {
        color: colors.ink,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: colors.line,
        marginBottom: 24,
        width: '100%',
    },
    footer: {
        paddingHorizontal: spacing.screenPadX,
        paddingBottom: 24, // Safe area padding
        paddingTop: 16,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.line, // Optional subtle separator
    },
});
