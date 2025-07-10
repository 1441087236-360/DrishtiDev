
'use server';
/**
 * @fileOverview An AI flow for refactoring Next.js component code.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RefactorCodeInputSchema = z.object({
  code: z.string().describe('The Next.js component code to refactor.'),
  instructions: z.string().describe('Specific instructions or goals for the refactoring (e.g., "Improve performance", "Make it more readable", "Convert to use shadcn/ui components").'),
});
export type RefactorCodeInput = z.infer<typeof RefactorCodeInputSchema>;

const RefactorCodeOutputSchema = z.object({
  refactoredCode: z.string().describe('The refactored Next.js component code as a string.'),
  explanation: z.string().describe('A brief explanation of the changes made and why they improve the code.'),
});
export type RefactorCodeOutput = z.infer<typeof RefactorCodeOutputSchema>;


export async function refactorCode(input: RefactorCodeInput): Promise<RefactorCodeOutput> {
  return refactorCodeFlow(input);
}

const refactorPrompt = ai.definePrompt({
  name: 'refactorWebComponentPrompt',
  input: { schema: RefactorCodeInputSchema },
  output: { schema: RefactorCodeOutputSchema },
  prompt: `You are an expert Next.js developer specializing in writing clean, performant, and maintainable code. Your task is to refactor the provided component code based on the user's instructions.

  USER'S REFACTORING GOALS:
  {{{instructions}}}

  ORIGINAL CODE TO REFACTOR:
  \`\`\`tsx
  {{{code}}}
  \`\`\`

  IMPORTANT INSTRUCTIONS:
  1.  Adhere strictly to the user's refactoring goals. This includes stylistic changes like colors and sizes.
  2.  The output must be a single, complete, and valid Next.js component file.
  3.  Use TypeScript, Tailwind CSS, and shadcn/ui components where appropriate to improve the code.
  4.  If the original code uses hooks like \`useState\` or event handlers, ensure the refactored component includes the \`'use client';\` directive at the top.
  5.  Provide a concise but clear explanation of the key changes you made and the reasoning behind them (e.g., "Replaced custom button with shadcn/ui <Button> for consistency," "Extracted logic into a custom hook for reusability," "Added memoization to prevent unnecessary re-renders.").
  `,
});

const refactorCodeFlow = ai.defineFlow(
  {
    name: 'refactorCodeFlow',
    inputSchema: RefactorCodeInputSchema,
    outputSchema: RefactorCodeOutputSchema,
  },
  async (input) => {
    const { output } = await refactorPrompt(input);
    return output!;
  }
);
