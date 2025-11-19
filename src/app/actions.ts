"use server";

import { suggestDailyTasks } from "@/ai/flows/suggest-daily-tasks";

export async function getTaskSuggestions(historicalTasks: string, numberOfSuggestions: number) {
  try {
    const result = await suggestDailyTasks({
      historicalTasks,
      numberOfSuggestions,
    });
    return { success: true, tasks: result.suggestedTasks };
  } catch (error) {
    console.error("Error getting task suggestions:", error);
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: "An unknown error occurred." };
  }
}
