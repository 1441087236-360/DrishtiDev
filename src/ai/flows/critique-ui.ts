'use server';
/**
 * @fileOverview An AI flow for critiquing a URL's UI/UX based on its HTML structure.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CritiqueUiInputSchema = z.object({
  url: z.string().url().optional().describe('The URL of the page to critique. Used for context.'),
  htmlContent: z.string().optional().describe('The HTML content of the page to critique. This takes precedence for the analysis if provided.'),
});
export type CritiqueUiInput = z.infer<typeof CritiqueUiInputSchema>;

const UiIssueSchema = z.object({
    title: z.string().describe('A short, descriptive title for the UI/UX issue.'),
    description: z.string().describe('A detailed explanation of the issue and why it impacts user experience or design principles.'),
    suggestion: z.string().describe('A concrete suggestion on how to fix the issue, referencing semantic HTML or CSS adjustments.'),
});

const CritiqueUiOutputSchema = z.object({
  uiIssues: z.array(UiIssueSchema).describe('An array of UI/UX issues found on the page.'),
});
export type CritiqueUiOutput = z.infer<typeof CritiqueUiOutputSchema>;


export async function critiqueUi(input: CritiqueUiInput): Promise<CritiqueUiOutput> {
  return critiqueUiFlow(input);
}

const critiquePrompt = ai.definePrompt({
  name: 'critiqueUiPrompt',
  input: { schema: CritiqueUiInputSchema },
  output: { schema: CritiqueUiOutputSchema },
  prompt: `You are a world-class UI/UX design expert. Your task is to analyze the provided HTML of a web page and identify potential design and user experience issues. You can only analyze the code; you cannot see the rendered page. Make intelligent inferences from the HTML structure, element tags, and Tailwind CSS classes.

  {{#if htmlContent}}
  Analyze the following HTML content. The original URL for context (if available) is {{{url}}}.
  \`\`\`html
  {{{htmlContent}}}
  \`\`\`
  {{else}}
  Analyze the page at the following URL: {{{url}}}
  {{/if}}

  IMPORTANT INSTRUCTIONS:
  1.  **Analyze Structure and Semantics:** Look for poor semantic HTML usage (e.g., using divs for everything), incorrect heading hierarchy (multiple H1s, skipping levels), or overly complex nested structures that might indicate a confusing layout.
  2.  **Infer from CSS Classes:** Examine Tailwind CSS classes to critique spacing, typography, and color usage. For example, identify inconsistent padding/margin (e.g., 'p-2' next to 'p-5'), potentially poor typography choices (e.g., very small text for body content like 'text-xs'), or lack of visual hierarchy in class usage.
  3.  **Focus on User Experience:** Identify potential UX friction points. Are forms missing clear labels? Is there a lack of interactive feedback suggested by the element types? Are there long lists of items without clear separation?
  4.  **Provide Actionable Feedback:** For each issue, provide a clear title, a description of why it's a problem based on design principles, and a specific, actionable suggestion for how to improve it in the code.
  5.  **Be Concise:** Focus on the most impactful problems. If you find no major issues, return an empty array.
`,
});

const critiqueUiFlow = ai.defineFlow(
  {
    name: 'critiqueUiFlow',
    inputSchema: CritiqueUiInputSchema,
    outputSchema: CritiqueUiOutputSchema,
  },
  async (input) => {
     if (!input.url && !input.htmlContent) {
        throw new Error("Either 'url' or 'htmlContent' must be provided.");
    }
    const { output } = await critiquePrompt(input);
    return output!;
  }
);
