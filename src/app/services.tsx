import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ServicesScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.ink} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.title}>Our services</Text>
                    <Text style={styles.subtitle}>Choose how you want to travel</Text>
                </View>
            </View>

            <View style={styles.body}>
                <Text style={styles.sectionLabel}>Book a ride</Text>
                <View style={styles.grid}>
                    {/* City Ride */}
                    <TouchableOpacity style={styles.card}>
                        <View style={[styles.iconSq, { backgroundColor: '#FDF0DA' }]}>
                            <Ionicons name="car" size={20} color="#DD9424" />
                        </View>
                        <Text style={styles.cardTitle}>City Ride</Text>
                        <Text style={styles.cardCaption}>Fast, on-demand</Text>
                    </TouchableOpacity>

                    {/* Outstation */}
                    <TouchableOpacity style={styles.card}>
                        <View style={[styles.iconSq, { backgroundColor: '#E9EEF7' }]}>
                            <Ionicons name="map" size={20} color="#3B5A8A" />
                        </View>
                        <Text style={styles.cardTitle}>Outstation</Text>
                        <Text style={styles.cardCaption}>One-way & round trip</Text>
                    </TouchableOpacity>

                    {/* Local Hourly */}
                    <TouchableOpacity style={styles.card}>
                        <View style={[styles.iconSq, { backgroundColor: '#E9F4EC' }]}>
                            <Ionicons name="time" size={20} color="#2E8B57" />
                        </View>
                        <Text style={styles.cardTitle}>Local Hourly</Text>
                        <Text style={styles.cardCaption}>8 hrs / 80 km & more</Text>
                    </TouchableOpacity>

                    {/* Self-Drive */}
                    <TouchableOpacity style={styles.card}>
                        <View style={[styles.iconSq, { backgroundColor: '#F3E9F5' }]}>
                            <Ionicons name="key" size={20} color="#8B4A9C" />
                        </View>
                        <Text style={styles.cardTitle}>Self-Drive</Text>
                        <Text style={styles.cardCaption}>You drive, we deliver</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Shared & pooling</Text>
                <TouchableOpacity style={[styles.card, styles.fullWidthCard]}>
                    <View style={styles.poolRow}>
                        <View style={[styles.iconSq, { backgroundColor: '#FDEAEF', marginBottom: 0 }]}>
                            <Ionicons name="people" size={20} color="#C24B6E" />
                        </View>
                        <View style={styles.poolContent}>
                            <Text style={styles.cardTitle}>Vehicle Pooling</Text>
                            <Text style={styles.cardCaption}>Book a single seat, by the segment</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>From ₹129</Text>
                        </View>
                    </View>
                </TouchableOpacity>
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
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 4,
        alignItems: 'center',
    },
    backButton: {
        marginRight: 10,
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.ink,
    },
    subtitle: {
        fontSize: 12,
        color: colors.inkFaint,
        marginTop: 2,
    },
    body: {
        paddingHorizontal: 18,
        paddingTop: 24,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.ink,
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    card: {
        width: '48%',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 16,
        padding: 14,
    },
    fullWidthCard: {
        width: '100%',
        paddingVertical: 14,
    },
    poolRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    poolContent: {
        flex: 1,
        paddingHorizontal: 12,
    },
    iconSq: {
        width: 34,
        height: 34,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 12.5,
        fontWeight: '700',
        color: colors.ink,
        marginBottom: 2,
    },
    cardCaption: {
        fontSize: 10,
        color: colors.inkFaint,
    },
    tag: {
        backgroundColor: '#FDEAEF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 9.5,
        fontWeight: '700',
        color: '#C24B6E',
    }
});
