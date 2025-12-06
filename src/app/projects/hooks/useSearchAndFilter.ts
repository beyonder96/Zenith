'use client';

import { useState, useMemo } from 'react';
import type { Project, Note, Event } from '../types';

interface UseSearchAndFilterProps {
    projects: Project[];
    notes: Note[];
    events: Event[];
}

export function useSearchAndFilter({ projects, notes, events }: UseSearchAndFilterProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProjects = useMemo(() => {
        if (!searchTerm) return projects;
        return projects.filter(p =>
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.subtasks?.some(s => s.text.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [projects, searchTerm]);

    const filteredNotes = useMemo(() => {
        if (!searchTerm) return notes;
        return notes.filter(n =>
            n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [notes, searchTerm]);

    const filteredEvents = useMemo(() => {
        if (!searchTerm) return events;
        return events.filter(e =>
            e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [events, searchTerm]);

    return {
        searchTerm,
        setSearchTerm,
        filteredProjects,
        filteredNotes,
        filteredEvents,
    };
}
