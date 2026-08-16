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
                tabBarInactiveTintColor: colors.inkSoft,
                tabBarStyle: [
                    styles.tabBar,
                    {
                        height: Platform.OS === 'ios' ? 76 : 60,
                        paddingBottom: Platform.OS === 'ios' ? 24 : 6,
                        paddingTop: 8,
                    }
                ],
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Ride',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer]}>
                            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
                        </View>
                    ),
                }}
            />
            {/* Using services.tsx for All Services */}
            <Tabs.Screen
                name="services"
                options={{
                    title: 'All Services',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer]}>
                            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
                        </View>
                    ),
                }}
            />
            {/* Using explore.tsx for Travel */}
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Travel',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer]}>
                            <Ionicons name={focused ? 'rocket' : 'rocket-outline'} size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer]}>
                            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
                        </View>
                    ),
                }}
            />

            {/* Hide all other files in (tabs) directory from rendering in the bottom nav */}
            <Tabs.Screen name="activity" options={{ href: null }} />
            <Tabs.Screen name="account" options={{ href: null }} />
            <Tabs.Screen name="help" options={{ href: null }} />
            <Tabs.Screen name="trips" options={{ href: null }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9', // Subtle top shadow/border per spec
        elevation: 16, // strong shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    tabBarLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
