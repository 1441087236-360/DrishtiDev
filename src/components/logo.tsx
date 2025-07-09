
import React from 'react';
import { cn } from '@/lib/utils';

export const Logo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 36"
    className={cn("h-7 w-7", className)}
    fill="none"
  >
    <circle cx="18" cy="18" r="3" className="fill-primary"/>
    <path
        d="M11 25C4 22 4 14 11 11"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-foreground"
    />
    <path
        d="M25 11C32 14 32 22 25 25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-foreground"
    />
  </svg>
);
