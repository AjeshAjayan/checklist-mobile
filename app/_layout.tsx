import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getToken } from '../services/storage';

export default function RootLayout() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = await getToken();
        setIsAuthenticated(!!token);
    };

    useEffect(() => {
        if (isAuthenticated === null) return;

        const inAuthGroup = segments[0] === '(tabs)';

        if (isAuthenticated && !inAuthGroup) {
            // User is authenticated but not in tabs, redirect to tabs
            router.replace('/(tabs)');
        } else if (!isAuthenticated && inAuthGroup) {
            // User is not authenticated but in tabs, redirect to login
            router.replace('/login');
        } else if (!isAuthenticated) {
            // User is not authenticated, ensure they're on login or verify-otp
            const currentScreen = segments[0];
            if (currentScreen !== 'login' && currentScreen !== 'verify-otp') {
                router.replace('/login');
            }
        }
    }, [isAuthenticated, segments]);

    if (isAuthenticated === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="verify-otp" />
            <Stack.Screen name="(tabs)" />
        </Stack>
    );
}
