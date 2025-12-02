// Checklist Types

export interface ChecklistItem {
    heading: string;
    items: string[];
}

export interface ChecklistResponse {
    checklist: ChecklistItem[];
}

export interface SavedChecklist {
    title: string;
    data: ChecklistItem[];
    savedAt: string;
}
