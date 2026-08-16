import { colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

export const InputField: React.FC<TextInputProps> = ({ style, ...rest }) => {
    return (
        <TextInput
            style={[styles.input, style]}
            placeholderTextColor={colors.inkFaint}
            {...rest}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 12, // From visual spec
        paddingHorizontal: 16,
        paddingVertical: 16, // tall fields as per design
        fontSize: 14,
        fontWeight: '500',
        color: colors.ink,
        marginBottom: 16,
    },
});
