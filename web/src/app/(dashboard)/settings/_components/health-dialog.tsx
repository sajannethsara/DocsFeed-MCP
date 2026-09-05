'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { HealthCheckResult } from '../_models/health.model';

interface HealthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: HealthCheckResult | null;
}

export function HealthDialog({ open, onOpenChange, result }: HealthDialogProps) {
  const [showRawPayload, setShowRawPayload] = React.useState(false);

  if (!result || !result.data) return null;

  const { data, latencyMs } = result;
  const statusString = (data?.status || (result.error ? 'error' : 'error')).toString();
  const isSuccess = statusString.toLowerCase() === 'ok';

  const errorMessage =
    data.message
      ? Array.isArray(data.message)
        ? data.message.join(', ')
        : String(data.message)
      : result.error || null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center justify-between gap-4">
            <AlertDialogTitle>Server Diagnostics & Health</AlertDialogTitle>
            <Badge variant={isSuccess ? 'default' : 'destructive'} className="uppercase">
              {statusString}
            </Badge>
          </div>
          <AlertDialogDescription>
            {isSuccess
              ? 'Connected to DocsFeed MCP service successfully.'
              : 'Backend service returned an error or is unreachable.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Diagnostic Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-card p-3">
              <span className="text-xs text-muted-foreground block">Response Latency</span>
              <span className="text-base font-semibold font-mono">
                {latencyMs !== null ? `${latencyMs} ms` : '--'}
              </span>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <span className="text-xs text-muted-foreground block">Server Status</span>
              <span className="text-base font-semibold capitalize">
                {statusString}
              </span>
            </div>
          </div>

          {/* Database Entities Count (if present) */}
          {data.stats && (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Database Records</span>
                <span className="text-primary font-mono">PostgreSQL</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-md bg-muted/60 border">
                  <span className="text-xs text-muted-foreground block">Users</span>
                  <span className="text-base font-bold font-mono">{data.stats.users ?? 0}</span>
                </div>
                <div className="p-2 rounded-md bg-muted/60 border">
                  <span className="text-xs text-muted-foreground block">MCP Servers</span>
                  <span className="text-base font-bold font-mono text-primary">{data.stats.mcpServers ?? 0}</span>
                </div>
                <div className="p-2 rounded-md bg-muted/60 border">
                  <span className="text-xs text-muted-foreground block">Pages</span>
                  <span className="text-base font-bold font-mono">{data.stats.pages ?? 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Details */}
          {errorMessage && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              <span className="font-semibold block mb-1">Error Message:</span>
              {errorMessage}
            </div>
          )}

          {/* Raw JSON Accordion */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowRawPayload(!showRawPayload)}
              className="text-xs text-primary underline-offset-4 hover:underline font-medium focus:outline-none"
            >
              {showRawPayload ? 'Hide raw JSON response' : 'View raw JSON response'}
            </button>
            {showRawPayload && (
              <pre className="mt-2 p-3 rounded-md bg-muted text-xs font-mono overflow-x-auto max-h-40 border">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction>Done</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
