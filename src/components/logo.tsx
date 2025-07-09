
import React from 'react';
import { cn } from '@/lib/utils';

export const Logo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 36"
    className={cn("h-6 w-6", className)}
  >
    <g fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Octagon border */}
      <polygon
        points="28,5 8,5 3,10 3,26 8,31 28,31 33,26 33,10"
        className="stroke-primary"
      />
      {/* First 'd' */}
      <g className="stroke-foreground">
        <circle cx="12" cy="20" r="4" />
        <path d="M 16 10 V 26" />
      </g>
      {/* Second 'd' */}
      <g className="stroke-foreground">
        <circle cx="20" cy="20" r="4" />
        <path d="M 24 10 V 26" />
      </g>
    </g>
  </svg>
);
