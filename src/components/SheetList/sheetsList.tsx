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
const isMobile = window.innerWidth < 768;
const DEFAULT_VISIBLE_COUNT = isMobile ? 1 : 2;
const RENDER_BUFFER = isMobile ? 1 : 2;


interface SheetsListProps {
    visibleCount?: number;
}

const SheetsList: React.FC<SheetsListProps> = ({ visibleCount = DEFAULT_VISIBLE_COUNT }) => {
    const [items, setItems] = useState<SheetRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
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
    const maxIndex = Math.max(0, slides.length - visibleCount);

    useEffect(() => {
        setActiveIndex((i) => Math.min(i, maxIndex));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [maxIndex]);

    const isFocused = (i: number) => i >= activeIndex && i < activeIndex + visibleCount;
    const goTo = (i: number) => setActiveIndex(Math.min(Math.max(i, 0), maxIndex));

    const activate = (i: number, onNavigate: () => void) => {
        if (!isFocused(i)) {
            goTo(i);
            return;
        }
        onNavigate();
    };

    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) goTo(activeIndex + (dx < 0 ? 1 : -1));
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

                    <div className="sheetsList__viewport" style={{ "--visible-count": visibleCount } as CSSProperties} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                        <ul className="sheetsList__track" style={{ "--active-index": activeIndex } as CSSProperties}>
                            {slides.map((slide, i) => {
                                const focused = isFocused(i);

                                if (Math.abs(i - activeIndex) > RENDER_BUFFER) {
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
