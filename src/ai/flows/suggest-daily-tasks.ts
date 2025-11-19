'use server';

/**
 * @fileOverview A daily task suggestion AI agent.
 *
 * - suggestDailyTasks - A function that suggests daily tasks based on historical data.
 * - SuggestDailyTasksInput - The input type for the suggestDailyTasks function.
 * - SuggestDailyTasksOutput - The return type for the suggestDailyTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDailyTasksInputSchema = z.object({
  historicalTasks: z
    .string()
    .describe(
      'A stringified JSON array containing historical task completion data. Each object should have a date and a list of completed tasks for that date.'
    ),
  numberOfSuggestions: z
    .number()
    .default(3)
    .describe('The number of task suggestions to generate.'),
});
export type SuggestDailyTasksInput = z.infer<typeof SuggestDailyTasksInputSchema>;

const SuggestDailyTasksOutputSchema = z.object({
  suggestedTasks: z
    .array(z.string())
    .describe('A list of suggested daily tasks based on historical data.'),
});
export type SuggestDailyTasksOutput = z.infer<typeof SuggestDailyTasksOutputSchema>;

export async function suggestDailyTasks(input: SuggestDailyTasksInput): Promise<SuggestDailyTasksOutput> {
  return suggestDailyTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDailyTasksPrompt',
  input: {schema: SuggestDailyTasksInputSchema},
  output: {schema: SuggestDailyTasksOutputSchema},
  prompt: `You are a personal task management assistant. You will suggest daily tasks to the user based on their historical task completion data.

  Here is the historical task completion data:
  {{historicalTasks}}

  Suggest {{numberOfSuggestions}} tasks that the user should do today based on their historical data. Do not suggest tasks that are already completed. Only provide the task names, one task per line.
  `,
});

const suggestDailyTasksFlow = ai.defineFlow(
  {
    name: 'suggestDailyTasksFlow',
    inputSchema: SuggestDailyTasksInputSchema,
    outputSchema: SuggestDailyTasksOutputSchema,
  },
  async input => {
    try {
      JSON.parse(input.historicalTasks);
    } catch (e) {
      throw new Error('historicalTasks must be a valid JSON string.');
    }
    const {output} = await prompt(input);
    return output!;
  }
);
