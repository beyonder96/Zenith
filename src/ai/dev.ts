'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-daily-tasks.ts';
import '@/ai/flows/breakdown-task.ts';
