'use client';

import { z } from 'zod';

// Schema for Subtask
export const SubtaskSchema = z.object({
    id: z.number(),
    text: z.string(),
    completed: z.boolean(),
});
export type Subtask = z.infer<typeof SubtaskSchema>;

// Schema for Project
export const ProjectSchema = z.object({
    id: z.string(),
    title: z.string().min(1, { message: "Title is required" }),
    details: z.string().optional(),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format" }),
    completed: z.boolean(),
    subtasks: z.array(SubtaskSchema).optional(),
    userId: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;


// Schema for Note
export const NoteSchema = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    color: z.string(),
    tags: z.array(z.string()).optional(),
    userId: z.string(),
    createdAt: z.any().transform((val) => {
        if (typeof val === 'string') return val;
        if (val && typeof val.toDate === 'function') return val.toDate().toISOString();
        return new Date().toISOString();
    }),
});
export type Note = z.infer<typeof NoteSchema>;


// Schema for Event
export const EventSchema = z.object({
    id: z.string(),
    title: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    userId: z.string(),
});
export type Event = z.infer<typeof EventSchema>;