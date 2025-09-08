import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ className, children, ...props }: CardProps) => (
  <div
    className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ className, children }: CardProps) => (
  <div className={cn('p-6 border-b border-gray-200', className)}>
    {children}
  </div>
);

export const CardContent = ({ className, children }: CardProps) => (
  <div className={cn('p-6', className)}>{children}</div>
);

export const CardFooter = ({ className, children }: CardProps) => (
  <div className={cn('p-6 border-t border-gray-200', className)}>
    {children}
  </div>
);
