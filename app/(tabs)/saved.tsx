import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { clearToken, deleteChecklist, getAllChecklists } from '../../services/storage';
import { SavedChecklist } from '../../types/checklist';

export default function SavedChecklistsScreen() {
    const router = useRouter();
    const [checklists, setChecklists] = useState<SavedChecklist[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadChecklists = async () => {
        const savedChecklists = await getAllChecklists();
        setChecklists(savedChecklists);
    };

    useFocusEffect(
        useCallback(() => {
            loadChecklists();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadChecklists();
        setRefreshing(false);
    };

    const handleDelete = (title: string) => {
        Alert.alert(
            'Delete Checklist',
            `Are you sure you want to delete "${title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteChecklist(title);
                            await loadChecklists();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete checklist');
                        }
                    },
                },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearToken();
                            router.replace('/login');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to logout');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {checklists.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="bookmark-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No saved checklists yet</Text>
                        <Text style={styles.emptySubtext}>
                            Generate and save checklists to see them here
                        </Text>
                    </View>
                ) : (
                    checklists.map((checklist, index) => (
                        <TouchableOpacity
                            key={'saved-checklist-' + index}
                            style={styles.checklistCard}
                            onPress={() => {
                                router.push({
                                    pathname: '/(tabs)',
                                    params: {
                                        checklistData: JSON.stringify(checklist)
                                    }
                                });
                            }}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.cardTitleContainer}>
                                    <Ionicons name="bookmark" size={20} color="#007AFF" />
                                    <Text style={styles.cardTitle}>{checklist.title}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleDelete(checklist.title)}
                                    style={styles.deleteButton}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.cardDate}>
                                Saved on {new Date(checklist.savedAt).toLocaleDateString()}
                            </Text>

                            <View style={styles.cardContent}>
                                {checklist.data.slice(0, 2).map((section, sectionIndex) => (
                                    <View key={'saved-checklist-section-' + sectionIndex} style={styles.section}>
                                        <Text style={styles.sectionHeading}>{section.heading}</Text>
                                        {section.items.slice(0, 3).map((item, itemIndex) => {
                                            const text = typeof item === 'string' ? item : item.text;
                                            const isChecked = typeof item === 'string' ? false : item.checked;
                                            return (
                                                <View key={'saved-checklist-item-' + itemIndex} style={styles.item}>
                                                    <Ionicons
                                                        name={isChecked ? "checkmark-circle" : "ellipse-outline"}
                                                        size={16}
                                                        color={isChecked ? "#999" : "#007AFF"}
                                                    />
                                                    <Text
                                                        style={[
                                                            styles.itemText,
                                                            isChecked && styles.itemTextChecked
                                                        ]}
                                                        numberOfLines={1}
                                                    >
                                                        {text}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                        {section.items.length > 3 && (
                                            <Text style={styles.moreText}>
                                                +{section.items.length - 3} more items
                                            </Text>
                                        )}
                                    </View>
                                ))}
                                {checklist.data.length > 2 && (
                                    <Text style={styles.moreSections}>
                                        +{checklist.data.length - 2} more sections
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
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
        paddingBottom: 80,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
    checklistCard: {
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    deleteButton: {
        padding: 4,
    },
    cardDate: {
        fontSize: 12,
        color: '#999',
        marginBottom: 12,
    },
    cardContent: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12,
    },
    section: {
        marginBottom: 12,
    },
    sectionHeading: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 6,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
        flex: 1,
    },
    itemTextChecked: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    moreText: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        marginLeft: 22,
        marginTop: 4,
    },
    moreSections: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        marginTop: 8,
    },
    logoutButton: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    logoutButtonText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
