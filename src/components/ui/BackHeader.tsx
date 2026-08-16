import { colors, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BackHeaderProps {
    title: string;
}

export const BackHeader: React.FC<BackHeaderProps> = ({ title }) => {
    const router = useRouter();

    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
            >
                <Ionicons name="chevron-back" size={24} color={colors.ink} />
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 16,
        paddingHorizontal: spacing.screenPadX,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
        backgroundColor: colors.white,
    },
    backButton: {
        paddingRight: 10,
        marginLeft: -4, // Adjust for native icon padding
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.ink,
    },
});
