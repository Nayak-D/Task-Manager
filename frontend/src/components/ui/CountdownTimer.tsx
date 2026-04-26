import { useCountdown } from '@/hooks/useCountdown';
import { Clock } from 'lucide-react';
import { cn } from '@/utils';

interface CountdownProps {
  expiryDate: string;
  compact?: boolean;
}

export function CountdownTimer({ expiryDate, compact = false }: CountdownProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(expiryDate);

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 font-mono">
        <Clock size={12} />
        Expired
      </span>
    );
  }

  const isUrgent = days === 0 && hours < 24;
  const isCritical = days === 0 && hours < 6;

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs font-mono font-medium',
          isCritical
            ? 'text-red-500 dark:text-red-400'
            : isUrgent
            ? 'text-orange-500 dark:text-orange-400'
            : 'text-slate-500 dark:text-slate-400'
        )}
      >
        <Clock size={11} className={isCritical ? 'animate-pulse' : ''} />
        {days > 0
          ? `${days}d ${hours}h`
          : `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
      </span>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', isCritical ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400')}>
      <Clock size={13} className={isCritical ? 'animate-pulse' : ''} />
      <div className="flex gap-1 items-center font-mono text-xs font-medium">
        {days > 0 && (
          <>
            <Unit value={days} label="d" />
            <span className="opacity-50">·</span>
          </>
        )}
        <Unit value={hours} label="h" />
        <span className="opacity-50">:</span>
        <Unit value={minutes} label="m" />
        <span className="opacity-50">:</span>
        <Unit value={seconds} label="s" />
      </div>
    </div>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <span>
      {String(value).padStart(2, '0')}
      <span className="text-[10px] opacity-60 ml-0.5">{label}</span>
    </span>
  );
}
