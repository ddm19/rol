const pad = (value: number) => String(value).padStart(2, '0');

export function toDateTimeInput(iso: string | null): string {
    if (!iso) return '';
    const date = new Date(iso);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDateTimeInput(value: string): string | null {
    return value ? new Date(value).toISOString() : null;
}

export function formatDateTime(iso: string | null): string {
    return iso ? new Date(iso).toLocaleString('es-ES') : '—';
}
