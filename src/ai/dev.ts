'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-viewport-sizes.ts';
import '@/ai/flows/audit-url.ts';
import '@/ai/flows/refactor-code.ts';
import '@/ai/flows/critique-ui.ts';
