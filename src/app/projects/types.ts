export type Subtask = {
    id: number;
    text: string;
    completed: boolean;
};

export type Project = {
    id: string;
    title: string;
    details?: string;
    dueDate: string; // YYYY-MM-DD
    completed: boolean;
    subtasks?: Subtask[];
    userId: string;
};

export type Note = {
    id: string;
    title: string;
    content: string;
    color: string;
    tags?: string[];
    userId: string;
    createdAt: any; // Can be string or Firestore Timestamp
};

export type Event = {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time?: string; // HH:mm
    location?: string;
    description?: string;
    userId: string;
};
