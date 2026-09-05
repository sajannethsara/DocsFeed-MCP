'use client';

import * as React from 'react';
import { HealthCheckResult } from './_models/health.model';
import { checkServerHealth } from './_services/health.service';
import { HealthCheckCard } from './_components/health-check-card';
import { HealthDialog } from './_components/health-dialog';
import { EnvironmentCard } from './_components/environment-card';

export default function SettingsPage() {
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [healthResult, setHealthResult] = React.useState<HealthCheckResult | null>(null);

  const handleHealthCheck = async () => {
    setLoading(true);
    try {
      const result = await checkServerHealth();
      setHealthResult(result);
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage system configurations, environment parameters, and server health.
        </p>
      </div>

      <div className="grid gap-6 max-w-3xl">
        <HealthCheckCard onCheck={handleHealthCheck} loading={loading} />
        <EnvironmentCard />
      </div>

      <HealthDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        result={healthResult}
      />
    </div>
  );
}
