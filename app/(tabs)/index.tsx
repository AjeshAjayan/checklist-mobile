import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

    const abortControllerRef = useRef<AbortController | null>(null);
    const params = useLocalSearchParams();

    useEffect(() => {
        if (params.checklistData) {
            try {
                const savedChecklist = JSON.parse(params.checklistData as string);
                setPrompt(savedChecklist.title);
                setChecklist(savedChecklist.data);
            } catch (error) {
                console.error('Error parsing checklist data:', error);
            }
        }
    }, [params.checklistData]);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            Alert.alert('Empty Prompt', 'Please enter a prompt to generate a checklist');
            return;
        }

        setLoading(true);
        setChecklist(null);

        // Create a new AbortController for this request
        abortControllerRef.current = new AbortController();

        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('Authentication Error', 'Please log in again');
                return;
            }

            const response = await generateChecklist(prompt.trim(), token, abortControllerRef.current.signal);
            setChecklist(response.checklist);
        } catch (error: any) {
            // Don't show error if request was aborted
            if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
                console.log('Request was canceled');
            } else {
                Alert.alert(
                    'Generation Failed',
                    error.response?.data?.detail || 'Failed to generate checklist. Please try again.'
                );
            }
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setLoading(false);
            abortControllerRef.current = null;
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

    const toggleItem = async (sectionIndex: number, itemIndex: number) => {
        if (!checklist) return;
        const newChecklist = checklist.map((section, sIdx) => {
            if (sIdx === sectionIndex) {
                return {
                    ...section,
                    items: section.items.map((item, iIdx) => {
                        if (iIdx === itemIndex) {
                            return { ...item, checked: !item.checked };
                        }
                        return item;
                    })
                };
            }
            return section;
        });
        setChecklist(newChecklist);

        // Auto-save the checklist after toggling
        if (prompt.trim()) {
            try {
                await saveChecklist(prompt.trim(), newChecklist);
            } catch (error) {
                console.error('Auto-save failed:', error);
                // Silently fail - user can still manually save
            }
        }
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
                        style={[styles.generateButton, loading && styles.stopButton]}
                        onPress={loading ? handleStop : handleGenerate}
                    >
                        {loading ? (
                            <>
                                <Ionicons name="stop-circle" size={20} color="#fff" style={styles.buttonIcon} />
                                <Text style={styles.generateButtonText}>Stop</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="sparkles" size={20} color="#fff" style={styles.buttonIcon} />
                                <Text style={styles.generateButtonText}>Generate</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Thinking...</Text>
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
                            <View key={'generated-checklist-' + index} style={styles.section}>
                                <Text style={styles.sectionHeading}>{section.heading}</Text>
                                {section.items.map((item, itemIndex) => (
                                    <TouchableOpacity
                                        key={'generated-checklist-item-' + itemIndex}
                                        style={styles.item}
                                        onPress={() => toggleItem(index, itemIndex)}
                                    >
                                        <Ionicons
                                            name={item.checked ? "checkmark-circle" : "ellipse-outline"}
                                            size={24}
                                            color={item.checked ? "#999" : "#007AFF"}
                                        />
                                        <Text style={[
                                            styles.itemText,
                                            item.checked && styles.itemTextChecked
                                        ]}>
                                            {item.text}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
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
    stopButton: {
        backgroundColor: '#FF3B30',
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
    itemTextChecked: {
        textDecorationLine: 'line-through',
        color: '#999',
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
