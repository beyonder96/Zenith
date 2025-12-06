export type Note = {
    id: string;
    title: string;
    content: string;
    color: string;
    tags?: string[];
    userId: string;
    createdAt: any; // Can be string or Firestore Timestamp
};
