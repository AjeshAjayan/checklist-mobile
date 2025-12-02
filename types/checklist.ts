// Checklist Types

export interface ChecklistItem {
    heading: string;
    items: { text: string; checked: boolean }[];
}

export interface ChecklistResponse {
    checklist: ChecklistItem[];
}

export interface SavedChecklist {
    title: string;
    data: ChecklistItem[];
    savedAt: string;
}
