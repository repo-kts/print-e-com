/**
 * Alert Components
 * Reusable alert/notification components
 */

import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', onClose, children, ...props }, ref) => {
    const variants = {
      default: 'bg-background border-border',
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    const icons = {
      default: null,
      success: <CheckCircle2 className="h-4 w-4" />,
      error: <AlertCircle className="h-4 w-4" />,
      warning: <AlertCircle className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />,
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full rounded-lg border p-4',
          variants[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          {icons[variant] && <div className="mt-0.5">{icons[variant]}</div>}
          <div className="flex-1">{children}</div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-auto rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export { Alert };

