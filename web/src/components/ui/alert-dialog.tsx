'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';

interface AlertDialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextType | undefined>(undefined);

function useAlertDialog() {
  const context = React.useContext(AlertDialogContext);
  if (!context) {
    throw new Error('AlertDialog components must be used within an AlertDialog');
  }
  return context;
}

interface AlertDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

function AlertDialog({ children, open: controlledOpen, onOpenChange, defaultOpen = false }: AlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

function AlertDialogTrigger({ children, asChild, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { setOpen } = useAlertDialog();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<{ onClick?: React.MouseEventHandler }>).props.onClick?.(e);
        setOpen(true);
      },
    });
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => setOpen(true)}
      {...props}
    >
      {children}
    </button>
  );
}

function AlertDialogContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = useAlertDialog();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out"
        onClick={() => setOpen(false)}
      />
      {/* Dialog Box */}
      <div
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
          className
        )}
        role="alertdialog"
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />;
}

function AlertDialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold', className)} {...props} />;
}

function AlertDialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />;
}

function AlertDialogAction({
  className,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useAlertDialog();
  return (
    <button
      className={cn(buttonVariants(), className)}
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useAlertDialog();
  return (
    <button
      className={cn(buttonVariants({ variant: 'outline' }), 'mt-2 sm:mt-0', className)}
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
};
