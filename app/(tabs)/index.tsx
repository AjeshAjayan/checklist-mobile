import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { generateChecklist } from '../../services/api';
import { getToken, saveChecklist } from '../../services/storage';
import { ChecklistItem } from '../../types/checklist';

export default function GenerateChecklistScreen() {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [checklist, setChecklist] = useState<ChecklistItem[] | null>(null);
    const [saving, setSaving] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            Alert.alert('Empty Prompt', 'Please enter a prompt to generate a checklist');
            return;
        }

        setLoading(true);
        setChecklist(null);

        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('Authentication Error', 'Please log in again');
                return;
            }

            const response = await generateChecklist(prompt.trim(), token);
            setChecklist(response.checklist);
        } catch (error: any) {
            Alert.alert(
                'Generation Failed',
                error.response?.data?.detail || 'Failed to generate checklist. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!checklist || !prompt.trim()) return;

        setSaving(true);
        try {
            await saveChecklist(prompt.trim(), checklist);
            Alert.alert('Success', 'Checklist saved successfully!');
        } catch (error) {
            Alert.alert('Save Failed', 'Failed to save checklist. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setPrompt('');
        setChecklist(null);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.inputSection}>
                    <Text style={styles.label}>What do you need a checklist for?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Vacation to Goa"
                        value={prompt}
                        onChangeText={setPrompt}
                        editable={!loading}
                        returnKeyType="done"
                        onSubmitEditing={handleGenerate}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.generateButton, loading && styles.buttonDisabled]}
                        onPress={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="sparkles" size={20} color="#fff" style={styles.buttonIcon} />
                                <Text style={styles.generateButtonText}>Generate Checklist</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Generating your checklist...</Text>
                    </View>
                )}

                {checklist && !loading && (
                    <View style={styles.checklistContainer}>
                        <View style={styles.checklistHeader}>
                            <Text style={styles.checklistTitle}>{prompt}</Text>
                            <TouchableOpacity onPress={handleReset}>
                                <Ionicons name="close-circle" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {checklist.map((section, index) => (
                            <View key={index} style={styles.section}>
                                <Text style={styles.sectionHeading}>{section.heading}</Text>
                                {section.items.map((item, itemIndex) => (
                                    <View key={itemIndex} style={styles.item}>
                                        <Ionicons name="checkmark-circle-outline" size={20} color="#007AFF" />
                                        <Text style={styles.itemText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}

                        <TouchableOpacity
                            style={[styles.saveButton, saving && styles.buttonDisabled]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="bookmark" size={20} color="#fff" style={styles.buttonIcon} />
                                    <Text style={styles.saveButtonText}>Save Checklist</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    inputSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 16,
        minHeight: 50,
    },
    generateButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonIcon: {
        marginRight: 8,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    checklistContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    checklistHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#007AFF',
    },
    checklistTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: '700',
        color: '#007AFF',
        marginBottom: 12,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        paddingLeft: 8,
    },
    itemText: {
        fontSize: 15,
        color: '#333',
        marginLeft: 10,
        flex: 1,
        lineHeight: 22,
    },
    saveButton: {
        backgroundColor: '#34C759',
        borderRadius: 8,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
