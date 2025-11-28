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
  imageUrl: z.string().url().describe('The absolute URL of a representative product image.'),
});
export type ProductInfoOutput = z.infer<typeof ProductInfoOutputSchema>;

export async function extractProductInfo(input: ProductInfoInput): Promise<ProductInfoOutput> {
  return extractProductInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractProductInfoPrompt',
  input: { schema: ProductInfoInputSchema },
  output: { schema: ProductInfoOutputSchema },
  prompt: `You are an expert at identifying products from web links. Based on the following URL, identify the product and return its name, its approximate price as a number, and a publicly accessible, representative image URL for it.

URL: {{{productUrl}}}

Extract the following information:
1.  **Product Name**: The main title or name of the product.
2.  **Price**: The current price of the product. Extract only the numbers, converting comma to dot for decimals. Find the most representative price.
3.  **Image URL**: A valid, absolute URL (starting with http or https) of a high-quality, representative image for this product.

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
