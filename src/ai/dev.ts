'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-daily-tasks.ts';
import '@/ai/flows/breakdown-task.ts';
import '@/ai/flows/extract-product-info';
