import { colors, radius, typography } from '@/constants/theme';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle
} from 'react-native';

export type ButtonVariant = 'gold' | 'black';

interface ButtonProps {
    label: string;
    variant?: ButtonVariant;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    label,
    variant = 'gold',
    onPress,
    disabled = false,
    loading = false,
    style,
    icon,
}) => {
    const isGold = variant === 'gold';

    const backgroundColor = isGold ? colors.gold : colors.ink;
    const textColor = isGold ? '#3A2405' : colors.white;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                { backgroundColor },
                disabled && { opacity: 0.4 },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <>
                    <Text style={[styles.label, { color: textColor }]}>{label}</Text>
                    {icon && icon}
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 52, // Derived from padding 15px + font size
        borderRadius: radius.button,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
    },
    label: {
        fontSize: typography.bodyStrong.fontSize,
        fontWeight: typography.bodyStrong.fontWeight,
        textAlign: 'center',
        // margin right if icon exists might be needed, but flex handles it if placed side-by-side cleanly
    },
});
