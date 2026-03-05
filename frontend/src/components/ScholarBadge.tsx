import { Moon, ShieldCheck, Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';

type BadgeRole = 'scholar' | 'admin' | 'moderator';
type BadgeSize = 'sm' | 'md' | 'lg';

const ROLE_CONFIG: Record<
  BadgeRole,
  { label: string; Icon: React.ElementType; pillCls: string; iconCls: string }
> = {
  scholar: {
    label: 'Scholar',
    Icon: Moon,
    pillCls: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    iconCls: 'fill-emerald-600',
  },
  admin: {
    label: 'Admin',
    Icon: ShieldCheck,
    pillCls: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
    iconCls: '',
  },
  moderator: {
    label: 'Mod',
    Icon: Gavel,
    pillCls: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
    iconCls: '',
  },
};

const SIZE_CONFIG: Record<BadgeSize, { pill: string; icon: string }> = {
  sm: { pill: 'px-1 py-0.5 gap-0.5 text-[9px]', icon: 'w-2.5 h-2.5' },
  md: { pill: 'px-1.5 py-0.5 gap-1 text-[10px]', icon: 'w-3 h-3' },
  lg: { pill: 'px-2 py-1 gap-1 text-xs', icon: 'w-3.5 h-3.5' },
};

interface ScholarBadgeProps {
  role: string;
  size?: BadgeSize;
  className?: string;
}

export function ScholarBadge({ role, size = 'md', className }: ScholarBadgeProps) {
  if (!['scholar', 'admin', 'moderator'].includes(role)) return null;

  const config = ROLE_CONFIG[role as BadgeRole];
  const sz = SIZE_CONFIG[size];
  const { Icon } = config;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold tracking-wide uppercase shadow-sm',
        sz.pill,
        config.pillCls,
        className,
      )}
    >
      <Icon className={cn(sz.icon, config.iconCls)} />
      {config.label}
    </span>
  );
}
