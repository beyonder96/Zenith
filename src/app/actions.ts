"use server";

import { suggestDailyTasks } from "@/ai/flows/suggest-daily-tasks";
import { breakdownTask } from "@/ai/flows/breakdown-task";
import { extractProductInfo } from "@/ai/flows/extract-product-info";

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

export async function getTaskBreakdown(taskText: string) {
    try {
        const result = await breakdownTask({ taskText });
        return { success: true, subtasks: result.subtasks };
    } catch (error) {
        console.error("Error getting task breakdown:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "An unknown error occurred." };
    }
}

export async function getProductInfoFromUrl(productUrl: string) {
    try {
        const result = await extractProductInfo({ productUrl });
        return { success: true, productInfo: result };
    } catch (error) {
        console.error("Error extracting product info:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "An unknown error occurred." };
    }
}
