
'use server';
/**
 * @fileOverview An AI flow for auditing a URL or HTML content for accessibility and performance.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AuditUrlInputSchema = z.object({
  url: z.string().url().optional().describe('The URL of the page to audit. Used for public sites or as context for HTML content.'),
  htmlContent: z.string().optional().describe('The HTML content of the page to audit. This takes precedence for the analysis if provided.'),
});
export type AuditUrlInput = z.infer<typeof AuditUrlInputSchema>;

const IssueSchema = z.object({
    title: z.string().describe('A short, descriptive title for the issue.'),
    description: z.string().describe('A detailed explanation of the issue and why it matters.'),
    suggestion: z.string().describe('A concrete suggestion on how to fix the issue.'),
});

const AuditUrlOutputSchema = z.object({
  accessibilityIssues: z.array(IssueSchema).describe('An array of accessibility issues found on the page.'),
  performanceIssues: z.array(IssueSchema).describe('An array of performance issues found on the page.'),
});
export type AuditUrlOutput = z.infer<typeof AuditUrlOutputSchema>;


export async function auditUrl(input: AuditUrlInput): Promise<AuditUrlOutput> {
  return auditUrlFlow(input);
}

const auditPrompt = ai.definePrompt({
  name: 'auditUrlPrompt',
  input: { schema: AuditUrlInputSchema },
  output: { schema: AuditUrlOutputSchema },
  prompt: `You are a world-class web performance and accessibility expert. Your task is to analyze the provided web page and identify critical issues.

  {{#if htmlContent}}
  Analyze the following HTML content. The original URL for context (if available) is {{{url}}}.
  \`\`\`html
  {{{htmlContent}}}
  \`\`\`
  {{else}}
  Analyze the page at the following URL: {{{url}}}
  {{/if}}

  IMPORTANT INSTRUCTIONS:
  1.  **Accessibility:** Focus on major WCAG 2.1 AA violations. Identify issues like missing alt text for images, poor color contrast, missing form labels, non-descriptive links, and improper heading structure. For each issue, provide a clear title, a description of why it's a problem, and a specific, actionable suggestion for how to fix it in code (e.g., "Add an \`aria-label\` attribute...").
  2.  **Performance:** Focus on key web vitals and common performance bottlenecks. Identify issues like large, unoptimized images, render-blocking resources (CSS/JS), slow server response times, and inefficient use of fonts. For each issue, provide a clear title, a description of the impact, and a concrete suggestion for improvement (e.g., "Compress images using a tool like Squoosh," "Defer loading of non-critical CSS," "Enable server-side compression like Gzip or Brotli.").
  3.  **Be Concise:** Do not report on minor or purely stylistic issues. Focus on the most impactful problems. If you find no major issues in a category, return an empty array for it.
  4.  **If a URL is provided without HTML, analyze the live, rendered page content. If raw HTML is provided, analyze that content directly.**
`,
});

const auditUrlFlow = ai.defineFlow(
  {
    name: 'auditUrlFlow',
    inputSchema: AuditUrlInputSchema,
    outputSchema: AuditUrlOutputSchema,
  },
  async (input) => {
     if (!input.url && !input.htmlContent) {
        throw new Error("Either 'url' or 'htmlContent' must be provided.");
    }
    const { output } = await auditPrompt(input);
    return output!;
  }
);
