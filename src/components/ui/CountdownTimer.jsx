import { useCountdown } from '../../hooks/useCountdown';

export default function CountdownTimer({ targetDate, size = 'md', format = 'cells', expiredText = '모집이 마감되었습니다' }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  if (isExpired) {
    return <p className="text-accent-orange font-bold tracking-wide">{expiredText}</p>;
  }

  if (format === 'adaptive') {
    const pad = (n) => String(n).padStart(2, '0');
    let text;
    if (days >= 1) {
      text = `${days}일 ${hours}시간`;
    } else if (hours >= 1) {
      text = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    } else {
      text = `${pad(minutes)}:${pad(seconds)}`;
    }
    const textSize = size === 'lg' ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl';
    return (
      <div className="flex justify-center">
        <span className={`font-kr font-black tabular-nums tracking-wide text-accent-green ${textSize}`}>
          {text}
        </span>
      </div>
    );
  }

  const units = [
    { label: 'DAYS', value: days },
    { label: 'HRS', value: hours },
    { label: 'MIN', value: minutes },
    { label: 'SEC', value: seconds },
  ];

  const sizeStyles = {
    lg: 'w-20 h-20 text-3xl',
    md: 'w-16 h-16 text-2xl',
  };

  return (
    <div className="flex gap-3 justify-center">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className={`${sizeStyles[size]} bg-accent-green text-bg-primary rounded-2xl flex items-center justify-center font-extrabold shadow-[0_8px_24px_rgba(200,255,77,0.25)]`}>
            {String(value).padStart(2, '0')}
          </div>
          <span className="text-[10px] text-text-muted mt-2 font-bold tracking-widest">{label}</span>
        </div>
      ))}
    </div>
  );
}
