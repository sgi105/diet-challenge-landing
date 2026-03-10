import { useCountdown } from '../../hooks/useCountdown';

export default function CountdownTimer({ targetDate, size = 'md' }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  if (isExpired) {
    return <p className="text-accent-orange font-semibold">모집이 마감되었습니다</p>;
  }

  const units = [
    { label: '일', value: days },
    { label: '시간', value: hours },
    { label: '분', value: minutes },
    { label: '초', value: seconds },
  ];

  const sizeStyles = {
    lg: 'w-20 h-20 text-3xl',
    md: 'w-14 h-14 text-xl',
  };

  return (
    <div className="flex gap-3 justify-center">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className={`${sizeStyles[size]} bg-bg-card border border-border rounded-lg flex items-center justify-center font-bold text-accent-green`}>
            {String(value).padStart(2, '0')}
          </div>
          <span className="text-xs text-text-muted mt-1">{label}</span>
        </div>
      ))}
    </div>
  );
}
