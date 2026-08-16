import { colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: colors.ink,
                tabBarInactiveTintColor: colors.inkFaint,
                tabBarStyle: [
                    styles.tabBar,
                    { height: Platform.OS === 'ios' ? 70 : 64, paddingBottom: Platform.OS === 'ios' ? 10 : 8 },
                ],
                tabBarLabelStyle: styles.tabBarLabel,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }: { color: any; focused: boolean }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="services"
                options={{
                    title: 'Services',
                    tabBarIcon: ({ color, focused }: { color: any; focused: boolean }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="activity"
                options={{
                    title: 'Activity',
                    tabBarIcon: ({ color, focused }: { color: any; focused: boolean }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={24} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: 'Account',
                    tabBarIcon: ({ color, focused }: { color: any; focused: boolean }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: colors.white,
        borderRadius: 30, // heavy pill radius
        // Drop shadow
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
        borderTopWidth: 0,
        paddingTop: 8,
    },
    tabBarLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
    },
    iconContainer: {
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 20,
    },
    iconContainerActive: {
        backgroundColor: colors.surface, // light grey highlight behind active icon matching image
    }
});
