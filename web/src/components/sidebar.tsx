'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      active: pathname.startsWith('/settings'),
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
      {/* Brand Header */}
      <div className="flex h-14 items-center gap-3 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold shadow-sm">
          <Layers className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-tight flex items-center gap-1.5">
            DocsFeed <span className="text-primary font-mono text-xs font-bold">MCP</span>
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="px-2 pb-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
          Configuration
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                item.active
                  ? 'bg-secondary text-secondary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4',
                  item.active ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-medium text-muted-foreground">DocsFeed MCP</span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            v0.1.0
          </Badge>
        </div>
      </div>
    </aside>
  );
}
