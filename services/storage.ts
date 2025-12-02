import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChecklistItem, SavedChecklist } from '../types/checklist';

// Storage Keys
const TOKEN_KEY = 'jwt_token';
const CHECKLISTS_PREFIX = 'checklist_';

// Auth Storage
export const saveToken = async (token: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
        console.error('Error saving token:', error);
        throw error;
    }
};

export const getToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

export const clearToken = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        console.error('Error clearing token:', error);
        throw error;
    }
};

// Checklist Storage
export const saveChecklist = async (
    title: string,
    data: ChecklistItem[]
): Promise<void> => {
    try {
        const checklist: SavedChecklist = {
            title,
            data,
            savedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(
            `${CHECKLISTS_PREFIX}${title}`,
            JSON.stringify(checklist)
        );
    } catch (error) {
        console.error('Error saving checklist:', error);
        throw error;
    }
};

export const getAllChecklists = async (): Promise<SavedChecklist[]> => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const checklistKeys = keys.filter((key) => key.startsWith(CHECKLISTS_PREFIX));

        const checklists = await AsyncStorage.multiGet(checklistKeys);

        return checklists
            .map(([_, value]) => {
                if (value) {
                    return JSON.parse(value) as SavedChecklist;
                }
                return null;
            })
            .filter((item): item is SavedChecklist => item !== null)
            .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    } catch (error) {
        console.error('Error getting checklists:', error);
        return [];
    }
};

export const deleteChecklist = async (title: string): Promise<void> => {
    try {
        await AsyncStorage.removeItem(`${CHECKLISTS_PREFIX}${title}`);
    } catch (error) {
        console.error('Error deleting checklist:', error);
        throw error;
    }
};
