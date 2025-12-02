import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { verifyOTP } from '../services/api';
import { saveToken } from '../services/storage';

export default function VerifyOTPScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const phoneNumber = params.phoneNumber as string;
    const receivedOtp = params.otp as string;
    const mockOtp = params.mockOtp === 'true';

    // Auto-fill OTP if it's a mock OTP
    useEffect(() => {
        if (mockOtp && receivedOtp) {
            setOtp(receivedOtp);
        }
    }, [mockOtp, receivedOtp]);

    const handleVerify = async () => {
        if (otp.length !== 4 || !/^\d+$/.test(otp)) {
            Alert.alert('Invalid OTP', 'Please enter a valid 4-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const response = await verifyOTP(phoneNumber, otp);

            if (response.is_success && response.jwt_token) {
                // Save JWT token to AsyncStorage
                await saveToken(response.jwt_token);

                // Navigate to main app (tabs)
                router.replace('/(tabs)');
            } else {
                Alert.alert('Verification Failed', 'Invalid OTP. Please try again.');
            }
        } catch (error: any) {
            Alert.alert(
                'Verification Failed',
                error.response?.data?.detail || 'Failed to verify OTP. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Verify OTP</Text>
                <Text style={styles.subtitle}>
                    Enter the OTP sent to {phoneNumber}
                </Text>

                {mockOtp && receivedOtp && (
                    <View style={styles.mockOtpContainer}>
                        <Text style={styles.mockOtpLabel}>Development Mode - OTP:</Text>
                        <Text style={styles.mockOtpText}>{receivedOtp}</Text>
                    </View>
                )}

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>OTP</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter 4-digit OTP"
                        keyboardType="number-pad"
                        maxLength={4}
                        value={otp}
                        onChangeText={setOtp}
                        editable={!loading}
                        returnKeyType="done"
                        onSubmitEditing={handleVerify}
                        autoFocus={!mockOtp}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Verify OTP</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    disabled={loading}
                >
                    <Text style={styles.backButtonText}>Back to Login</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
    },
    mockOtpContainer: {
        backgroundColor: '#fff3cd',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#ffc107',
    },
    mockOtpLabel: {
        fontSize: 12,
        color: '#856404',
        marginBottom: 4,
        fontWeight: '600',
    },
    mockOtpText: {
        fontSize: 24,
        color: '#856404',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 24,
        borderWidth: 1,
        borderColor: '#ddd',
        textAlign: 'center',
        letterSpacing: 8,
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
        marginBottom: 16,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        padding: 16,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#007AFF',
        fontSize: 16,
    },
});
