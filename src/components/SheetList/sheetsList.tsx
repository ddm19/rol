import { useEffect, useRef, useState, CSSProperties } from "react";
import "./sheetsList.scss";
import { useNavigate } from "react-router-dom";
import { listMySheets } from "services/sheets";
import { faEye, faPlus, faChevronLeft, faChevronRight, faDiceD20 } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loading from "components/Loading/Loading";

type SheetRow = {
    id: string;
    updatedAt: string;
    avatarUrl: string;
    characterName: string;
    classLevel: string;
    race: string;
};

type Slide = { kind: "new" } | { kind: "sheet"; data: SheetRow };

// ---------- config del carousel ----------
const MOBILE_QUERY = "(max-width: 768px)";
const DEFAULT_VISIBLE_COUNT = 2;
const MOBILE_VISIBLE_COUNT = 1;
const DEFAULT_RENDER_BUFFER = 2;
const MOBILE_RENDER_BUFFER = 1;
const SWIPE_THRESHOLD_PX = 45;
const EDGE_RESISTANCE = 0.35;

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
    useEffect(() => {
        const mql = window.matchMedia(MOBILE_QUERY);
        const onChange = () => setIsMobile(mql.matches);
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, []);
    return isMobile;
}

interface SheetsListProps {
    visibleCount?: number;
}

const SheetsList: React.FC<SheetsListProps> = ({ visibleCount }) => {
    const isMobile = useIsMobile();
    const effectiveVisibleCount = visibleCount ?? (isMobile ? MOBILE_VISIBLE_COUNT : DEFAULT_VISIBLE_COUNT);
    const renderBuffer = isMobile ? MOBILE_RENDER_BUFFER : DEFAULT_RENDER_BUFFER;

    const [items, setItems] = useState<SheetRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [dragPx, setDragPx] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const touchStartX = useRef<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        listMySheets()
            .then((rows) =>
                setItems(
                    rows.map((r: any) => ({
                        id: r.id,
                        updatedAt: r.updated_at,
                        avatarUrl: r.content?.avatarUrl || "",
                        characterName: r.content?.CharacterName || "",
                        classLevel: r.content?.ClassLevel || "",
                        race: r.content?.Race || "",
                    }))
                )
            )
            .finally(() => setLoading(false));
    }, []);

    const slides: Slide[] = [{ kind: "new" }, ...items.map((data) => ({ kind: "sheet" as const, data }))];
    const maxIndex = Math.max(0, slides.length - effectiveVisibleCount);

    useEffect(() => {
        setActiveIndex((i) => Math.min(i, maxIndex));
    }, [maxIndex]);

    const isFocused = (i: number) => i >= activeIndex && i < activeIndex + effectiveVisibleCount;
    const goTo = (i: number) => setActiveIndex(Math.min(Math.max(i, 0), maxIndex));

    const activate = (i: number, onNavigate: () => void) => {
        if (!isFocused(i)) {
            goTo(i);
            return;
        }
        onNavigate();
    };

    // swipe con seguimiento en vivo del dedo + rubber-band en los extremos
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        setIsDragging(true);
        setDragPx(0);
    };
    const onTouchMove = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const dx = e.touches[0].clientX - touchStartX.current;
        const atStart = activeIndex <= 0 && dx > 0;
        const atEnd = activeIndex >= maxIndex && dx < 0;
        setDragPx(atStart || atEnd ? dx * EDGE_RESISTANCE : dx);
    };
    const onTouchEnd = () => {
        if (dragPx <= -SWIPE_THRESHOLD_PX) goTo(activeIndex + 1);
        else if (dragPx >= SWIPE_THRESHOLD_PX) goTo(activeIndex - 1);
        setIsDragging(false);
        setDragPx(0);
        touchStartX.current = null;
    };

    return (
        <div className="sheetsList">
            <h2 className="sheetsList__title">Mis Fichas</h2>

            {loading ? (
                <Loading />
            ) : (
                <div className="sheetsList__stage">
                    <button className="sheetsList__navBtn" onClick={() => goTo(activeIndex - 1)} disabled={activeIndex <= 0} aria-label="Anterior">
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>

                    <div className="sheetsList__viewport" style={{ "--visible-count": effectiveVisibleCount } as CSSProperties}>
                        <ul
                            className={`sheetsList__track ${isDragging ? "sheetsList__track--dragging" : ""}`}
                            style={{ "--active-index": activeIndex, "--drag-px": `${dragPx}px` } as CSSProperties}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            {slides.map((slide, i) => {
                                const focused = isFocused(i);

                                if (Math.abs(i - activeIndex) > renderBuffer) {
                                    return <li key={`ghost-${i}`} className="sheetsList__card sheetsList__card--ghost" />;
                                }

                                if (slide.kind === "new") {
                                    return (
                                        <li
                                            key="new"
                                            className={`sheetsList__card sheetsList__card--new ${focused ? "sheetsList__card--focused" : "sheetsList__card--peek"}`}
                                            onClick={() => activate(i, () => navigate("/sheets/new"))}
                                        >
                                            <div className="sheetsList__newIcon">
                                                <FontAwesomeIcon icon={faPlus} />
                                            </div>
                                            <span className="sheetsList__newLabel">Nueva ficha</span>
                                        </li>
                                    );
                                }

                                const x = slide.data;
                                const goToSheet = () => navigate(`/sheets/${encodeURIComponent(x.id)}`);
                                return (
                                    <li key={x.id} className={`sheetsList__card ${focused ? "sheetsList__card--focused" : "sheetsList__card--peek"}`} onClick={() => activate(i, goToSheet)}>
                                        <div className="sheetsList__portrait">
                                            {x.avatarUrl ? (
                                                <>
                                                    <img className="sheetsList__portraitBg" src={x.avatarUrl} alt="" aria-hidden="true" loading="lazy" />
                                                    <img className="sheetsList__portraitImg" src={x.avatarUrl} alt={x.characterName || x.id} loading="lazy" />
                                                </>
                                            ) : (
                                                <FontAwesomeIcon icon={faDiceD20} className="sheetsList__portraitPlaceholder" />
                                            )}
                                        </div>

                                        <div className="sheetsList__body">
                                            <h3 className="sheetsList__name">{x.characterName || x.id}</h3>
                                            {(x.classLevel || x.race) && <div className="sheetsList__subtitle">{[x.classLevel, x.race].filter(Boolean).join(" · ")}</div>}
                                            <div className="sheetsList__date">Última edición: {new Date(x.updatedAt).toLocaleDateString()}</div>

                                            <button
                                                className="sheetsList__btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    activate(i, goToSheet);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                                Ver ficha
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <button className="sheetsList__navBtn" onClick={() => goTo(activeIndex + 1)} disabled={activeIndex >= maxIndex} aria-label="Siguiente">
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            )}
        </div>
    );
};
export default SheetsList;
