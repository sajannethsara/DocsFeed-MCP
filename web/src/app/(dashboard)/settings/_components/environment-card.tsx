import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu } from 'lucide-react';

export function EnvironmentCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Environment & Infrastructure</CardTitle>
            <CardDescription>
              Runtime and database configuration details.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3 rounded-lg border bg-muted/30">
          <span className="text-xs text-muted-foreground block mb-1">Environment</span>
          <span className="text-sm font-medium">Development</span>
        </div>
        <div className="p-3 rounded-lg border bg-muted/30">
          <span className="text-xs text-muted-foreground block mb-1">Vector Storage</span>
          <span className="text-sm font-medium text-primary">pgvector (PostgreSQL)</span>
        </div>
      </CardContent>
    </Card>
  );
}
