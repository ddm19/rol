import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faImages, faSpinner, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import useCardSearch from 'hooks/useCardSearch';
import { isOptimizedCardImage, optimizeExistingCardImage } from 'services/cardsService';

const CONCURRENCY = 1;
const MAX_ATTEMPTS = 4;
const RETRY_BASE_DELAY_MS = 2000;
const RATE_LIMIT_PATTERN = /429|too many/i;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

async function withRetry<T>(task: () => Promise<T>): Promise<T> {
    for (let attempt = 1; ; attempt++) {
        try {
            return await task();
        } catch (err: any) {
            if (attempt >= MAX_ATTEMPTS || !RATE_LIMIT_PATTERN.test(err?.message || '')) throw err;
            await wait(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
        }
    }
}

type Failure = { nombre: string; message: string };

const OptimizeImagesTab: React.FC = () => {
    const { all, loading, refetch } = useCardSearch();
    const [running, setRunning] = useState(false);
    const [done, setDone] = useState(0);
    const [total, setTotal] = useState(0);
    const [failures, setFailures] = useState<Failure[]>([]);
    const [finished, setFinished] = useState(false);

    const pending = useMemo(
        () => all.filter((card) => card.imagen_url && !isOptimizedCardImage(card.imagen_url)),
        [all]
    );

    const handleOptimize = async () => {
        const queue = [...pending];
        setRunning(true);
        setFinished(false);
        setDone(0);
        setTotal(queue.length);
        setFailures([]);

        const worker = async () => {
            while (queue.length > 0) {
                const card = queue.shift();
                if (!card) return;
                try {
                    await withRetry(() => optimizeExistingCardImage(card));
                } catch (err: any) {
                    setFailures((prev) => [...prev, { nombre: card.nombre, message: err?.message || 'Error desconocido' }]);
                } finally {
                    setDone((prev) => prev + 1);
                }
            }
        };

        await Promise.all(Array.from({ length: CONCURRENCY }, worker));
        await refetch();
        setRunning(false);
        setFinished(true);
    };

    if (loading && all.length === 0) {
        return <div className="adminCardManage__loading">Cargando cartas...</div>;
    }

    return (
        <div className="adminCardForm">
            <p>
                Convierte las imágenes de las cartas a WebP (500 px) y crea una miniatura (320 px) para la rejilla.
                Las imágenes nuevas ya se suben optimizadas; esto solo hace falta para las que se subieron antes.
            </p>
            <p>
                <strong>{pending.length}</strong> de {all.length} cartas tienen la imagen sin optimizar.
            </p>

            <button
                type="button"
                className="adminCardForm__submit"
                onClick={handleOptimize}
                disabled={running || pending.length === 0}
            >
                <FontAwesomeIcon icon={running ? faSpinner : faImages} spin={running} />
                {running ? `Optimizando ${done} / ${total}...` : `Optimizar ${pending.length} imágenes`}
            </button>

            {finished && (
                <div className={`adminCardForm__notice adminCardForm__notice--${failures.length > 0 ? 'error' : 'success'}`}>
                    <FontAwesomeIcon icon={failures.length > 0 ? faTriangleExclamation : faCheck} />{' '}
                    {total - failures.length} de {total} imágenes optimizadas
                </div>
            )}

            {failures.length > 0 && (
                <ul>
                    {failures.map(({ nombre, message }) => (
                        <li key={nombre}>{nombre}: {message}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OptimizeImagesTab;
