import { useEffect, useState } from 'react';

export const formatTimeUntil = (target: Date | null) => {
    if (!target) return '';

    const diff = target.getTime() - Date.now();
    if (diff <= 0) return '';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
};

export function useCountdown(target: Date | null, onReached?: () => void) {
    const [timeLeft, setTimeLeft] = useState(() => formatTimeUntil(target));

    useEffect(() => {
        setTimeLeft(formatTimeUntil(target));
        if (!target || target.getTime() <= Date.now()) return;

        const interval = window.setInterval(() => {
            setTimeLeft(formatTimeUntil(target));
            if (target.getTime() <= Date.now()) {
                window.clearInterval(interval);
                onReached?.();
            }
        }, 1000);

        return () => window.clearInterval(interval);
    }, [target, onReached]);

    return timeLeft;
}
