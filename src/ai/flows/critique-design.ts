'use server';
/**
 * @fileOverview An AI flow for critiquing a UI design from a screenshot.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CritiqueDesignInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A screenshot of a user interface, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('The user\'s specific question or area of focus for the design critique (e.g., "Critique the color palette", "Is the layout intuitive?").'),
});
export type CritiqueDesignInput = z.infer<typeof CritiqueDesignInputSchema>;

const CritiqueDesignOutputSchema = z.object({
  critique: z.string().describe('The detailed design critique and suggestions, formatted as markdown.'),
});
export type CritiqueDesignOutput = z.infer<typeof CritiqueDesignOutputSchema>;

export async function critiqueDesign(input: CritiqueDesignInput): Promise<CritiqueDesignOutput> {
  return critiqueDesignFlow(input);
}

const critiquePrompt = ai.definePrompt({
  name: 'critiqueDesignPrompt',
  input: { schema: CritiqueDesignInputSchema },
  output: { schema: CritiqueDesignOutputSchema },
  prompt: `You are a world-class UI/UX design expert with a keen eye for detail, aesthetics, and user-centered design principles. Your task is to analyze the provided screenshot of a user interface and provide a constructive, actionable critique based on the user's request.

  USER'S REQUEST:
  {{{prompt}}}

  Analyze the following screenshot:
  {{media url=imageDataUri}}

  IMPORTANT INSTRUCTIONS:
  1.  **Be Specific:** Don't just say "it looks bad." Explain *why*. Refer to specific elements in the screenshot.
  2.  **Provide Actionable Suggestions:** For every issue you identify, propose a concrete solution. For example, instead of "improve spacing," suggest "increase the margin between the button and the input field to 16px."
  3.  **Reference Design Principles:** Ground your feedback in established UI/UX principles (e.g., hierarchy, contrast, consistency, Fitt's Law, Hick's Law).
  4.  **Maintain a Positive and Encouraging Tone:** The goal is to help the user improve, not to discourage them. Start with what's working well before diving into areas for improvement.
  5.  **Format as Markdown:** Use headings, bullet points, and bold text to structure your critique for easy readability.
`,
});

const critiqueDesignFlow = ai.defineFlow(
  {
    name: 'critiqueDesignFlow',
    inputSchema: CritiqueDesignInputSchema,
    outputSchema: CritiqueDesignOutputSchema,
  },
  async (input) => {
    const { output } = await critiquePrompt(input);
    return output!;
  }
);
