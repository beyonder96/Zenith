export type Goal = {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string; // YYYY-MM-DD
    userId: string;
};
