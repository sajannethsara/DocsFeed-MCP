'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw } from 'lucide-react';

interface HealthCheckCardProps {
  onCheck: () => Promise<void>;
  loading: boolean;
}

export function HealthCheckCard({ onCheck, loading }: HealthCheckCardProps) {
  const serverEndpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/health`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted text-primary">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Server Diagnostics & Health</CardTitle>
            <CardDescription>
              Check backend service status, database connectivity, and entity counts.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border bg-muted/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
          <span className="font-medium text-muted-foreground">Endpoint:</span>
          <code className="font-mono text-xs bg-muted px-2 py-1 rounded border">
            {serverEndpoint}
          </code>
        </div>
        <p className="text-xs text-muted-foreground">
          Sends a direct GET request to the NestJS application to verify system health and database accessibility.
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <span className="text-xs text-muted-foreground">
          Click button to run test
        </span>
        <Button onClick={onCheck} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Activity className="h-4 w-4" />
              Check Server Health
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
