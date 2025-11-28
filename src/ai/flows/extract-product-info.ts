'use server';
/**
 * @fileOverview An AI agent to extract product information from a URL.
 *
 * - extractProductInfo - A function that takes a URL and returns structured product data.
 * - ProductInfoInput - The input type for the extractProductInfo function.
 * - ProductInfoOutput - The return type for the extractProductInfo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProductInfoInputSchema = z.object({
  productUrl: z.string().url().describe('The URL of the product page.'),
});
export type ProductInfoInput = z.infer<typeof ProductInfoInputSchema>;

const ProductInfoOutputSchema = z.object({
  name: z.string().describe('The name of the product.'),
  price: z.number().describe('The price of the product as a number.'),
  imageUrl: z.string().url().describe('The absolute URL of the main product image.'),
});
export type ProductInfoOutput = z.infer<typeof ProductInfoOutputSchema>;

export async function extractProductInfo(input: ProductInfoInput): Promise<ProductInfoOutput> {
  return extractProductInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractProductInfoPrompt',
  input: { schema: ProductInfoInputSchema },
  output: { schema: ProductInfoOutputSchema },
  prompt: `You are an expert web scraper and data extractor. Your task is to extract product information from the content of the provided URL.

Please analyze the content of the following product page: {{{productUrl}}}

Extract the following information:
1.  **Product Name**: The main title or name of the product.
2.  **Price**: The current price of the product. Extract only the numbers, converting comma to dot for decimals. If there are multiple prices (e.g., discounted, installment), extract the main, most prominent price.
3.  **Image URL**: The absolute URL (starting with http or https) of the main, high-resolution product image.

Return the data in the specified JSON format.`,
});

const extractProductInfoFlow = ai.defineFlow(
  {
    name: 'extractProductInfoFlow',
    inputSchema: ProductInfoInputSchema,
    outputSchema: ProductInfoOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
