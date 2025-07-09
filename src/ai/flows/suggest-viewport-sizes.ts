'use server';
/**
 * @fileOverview An AI flow for generating Next.js component code.
 *
 * - generateCode - A function that generates a Next.js component based on a prompt.
 * - GenerateCodeInput - The input type for the generateCode function.
 * - GenerateCodeOutput - The return type for the generateCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the Next.js component to generate.'),
});
export type GenerateCodeInput = z.infer<typeof GenerateCodeInputSchema>;

const GenerateCodeOutputSchema = z.object({
  componentName: z.string().describe('The name of the generated component, in PascalCase. e.g., "UserProfileCard".'),
  code: z.string().describe('The generated Next.js component code as a string. The code should use TypeScript, Tailwind CSS, and shadcn/ui components. It should be a single file component.'),
  explanation: z.string().describe('A brief explanation of the generated code, including the components used and their roles.'),
});
export type GenerateCodeOutput = z.infer<typeof GenerateCodeOutputSchema>;

export async function generateCode(input: GenerateCodeInput): Promise<GenerateCodeOutput> {
  return generateCodeFlow(input);
}

const generationPrompt = ai.definePrompt({
  name: 'generateWebComponentPrompt',
  input: {schema: GenerateCodeInputSchema},
  output: {schema: GenerateCodeOutputSchema},
  prompt: `You are an expert Next.js developer specializing in creating clean, functional, and reusable components using TypeScript, Tailwind CSS, and shadcn/ui.

  Your task is to generate the code for a single React component based on the user's prompt.

  IMPORTANT INSTRUCTIONS:
  1.  The component MUST be a single file.
  2.  Use TypeScript for all code.
  3.  Use functional components with React Hooks.
  4.  Use shadcn/ui components where appropriate (e.g., "<Button>", "<Card>", "<Input>"). You can assume they are available via "@/components/ui/...".
  5.  Use icons from 'lucide-react'. You can assume this package is installed.
  6.  Use Tailwind CSS for styling. Do not use inline styles or the \`StyleSheet\` API.
  7.  For placeholder images, use 'https://placehold.co/<width>x<height>.png'.
  8.  The generated code should be clean, readable, and ready to be dropped into a Next.js project.
  9.  Provide a concise explanation of the component, its props, and its structure.
  10. The component name should be in PascalCase.
  11. Add \`'use client';\` at the top of the component if it uses any hooks like \`useState\` or event handlers.


  User Prompt:
  {{{prompt}}}
  `,
});

const generateCodeFlow = ai.defineFlow(
  {
    name: 'generateCodeFlow',
    inputSchema: GenerateCodeInputSchema,
    outputSchema: GenerateCodeOutputSchema,
  },
  async (input) => {
    const {output} = await generationPrompt(input);
    return output!;
  }
);
