'use server';
/**
 * @fileOverview Um agente de IA para dividir tarefas.
 *
 * - breakdownTask - Uma função que divide uma tarefa complexa em subtarefas.
 * - BreakdownTaskInput - O tipo de entrada para a função breakdownTask.
 * - BreakdownTaskOutput - O tipo de retorno para a função breakdownTask.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BreakdownTaskInputSchema = z.object({
  taskText: z
    .string()
    .describe('O texto da tarefa a ser dividida em subtarefas.'),
});
export type BreakdownTaskInput = z.infer<typeof BreakdownTaskInputSchema>;

const BreakdownTaskOutputSchema = z.object({
  subtasks: z
    .array(z.string())
    .describe('Uma lista de strings representando as subtarefas.'),
});
export type BreakdownTaskOutput = z.infer<typeof BreakdownTaskOutputSchema>;

export async function breakdownTask(input: BreakdownTaskInput): Promise<BreakdownTaskOutput> {
  return breakdownTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'breakdownTaskPrompt',
  input: {schema: BreakdownTaskInputSchema},
  output: {schema: BreakdownTaskOutputSchema},
  prompt: `Você é um assistente de produtividade. Sua tarefa é dividir uma tarefa complexa em uma lista de subtarefas menores e acionáveis. A tarefa é: "{{taskText}}"`,
});

const breakdownTaskFlow = ai.defineFlow(
  {
    name: 'breakdownTaskFlow',
    inputSchema: BreakdownTaskInputSchema,
    outputSchema: BreakdownTaskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
