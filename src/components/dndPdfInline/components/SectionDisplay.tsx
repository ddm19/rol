import MarkdownEditor from "components/MarkdownEditor/markdownEditor";
import { useEffect, useState, useCallback } from "react";
import "./sectionDisplay.scss";
import { fetchArticles } from "pages/Home/actions";
import { ArticleType } from "components/Article/types";
import ArticleDisplay from "components/ArticleDisplay/articleDisplay";
import { getArticleInfo } from "pages/Home/Home";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLink, faMagicWandSparkles, faTrash, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Loading from "components/Loading/Loading";

export type SectionItem = {
    id: string;
    content: ArticleType;
}

interface SectionDisplayProps {
    title: string;
    content: string;
    onContentChange: (val: string) => void;
    items?: SectionItem[];
    onItemsChange?: (val: SectionItem[]) => void;
    itemsCategory?: string;
    itemsLabel?: string;
    onBeautify?: (val: string) => Promise<string>;
    enableBeautify?: boolean;
    createItemLink?: string;
}

const EMPTY_ITEMS: SectionItem[] = [];

const SectionDisplay = (props: SectionDisplayProps) => {
    const {
        title,
        content,
        onContentChange,
        items = EMPTY_ITEMS,
        onItemsChange,
        itemsCategory,
        itemsLabel = "Items",
        onBeautify,
        enableBeautify = false,
        createItemLink
    } = props;

    const [contentValue, setContentValue] = useState(content);
    const [availableItems, setAvailableItems] = useState<SectionItem[]>([]);
    const [itemsOnSection, setItemsOnSection] = useState<SectionItem[]>(items);
    const [selectedValue, setSelectedValue] = useState<SectionItem>();
    const [isContentBeautifying, setIsContentBeautifying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (itemsCategory) {
            fetchArticles().then((articles) => {
                const filteredItems = articles.filter(
                    (a: { content: any, id: string }) => a.content.category?.name.toLowerCase().includes(itemsCategory.toLowerCase())
                );

                setAvailableItems(filteredItems);
                setSelectedValue(filteredItems[0]);
            });
        }
    }, [itemsCategory]);

    useEffect(() => {
        setContentValue(content);
    }, [content]);

    useEffect(() => {
        setItemsOnSection(items);
    }, [items]);

    const onChange = (val: string) => {
        setContentValue(val);
        onContentChange(val);
    }

    const handleAddToSection = () => {
        if (selectedValue && onItemsChange) {
            const newItems = [...itemsOnSection, { ...selectedValue, id: Date.now().toString() }];
            setItemsOnSection(newItems);
            onItemsChange(newItems);
        }
    };

    const handleDeleteFromSection = (id: string) => {
        if (onItemsChange) {
            const newItems = itemsOnSection.filter((item) => item.id !== id);
            setItemsOnSection(newItems);
            onItemsChange(newItems);
        }
    };

    const handleBeautify = async () => {
        if (!onBeautify) return;

        const confirmBeautify = window.confirm(
            "⚠️ La IA puede cometer errores al formatear.\n\n¿Deseas copiar el texto actual antes de continuar?"
        );

        if (confirmBeautify) {
            try {
                await navigator.clipboard.writeText(contentValue);
                alert("Contenido copiado al portapapeles ✅");
            } catch {
                alert("No se pudo copiar automáticamente. Copia el texto manualmente si lo necesitas.");
            }
        }

        const proceed = window.confirm(
            "¿Quieres continuar con el formateo automático?"
        );

        if (!proceed) return;

        setIsContentBeautifying(true);
        try {
            const beautified = await onBeautify(contentValue);
            setContentValue(beautified);
            onContentChange(beautified);
            setIsEditing(false);
        } finally {
            setIsContentBeautifying(false);
        }
    };

    return (
        <div className="sectionDisplay">
            {isContentBeautifying ? <Loading text="Una cuadrilla de gnomos está organizando tu inventario, esto puede tardar hasta 30 segundos" /> :
                <>
                    <div className="sectionDisplay__header">
                        <button
                            className="sectionDisplay__collapseButton"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                        >
                            <FontAwesomeIcon icon={isCollapsed ? faChevronUp : faChevronDown} />
                        </button>
                        <h2>{title}</h2>
                    </div>

                    {!isCollapsed && (
                        <>
                            {enableBeautify && onBeautify && (
                                <button onClick={handleBeautify} className="sectionDisplay__beautifyButton">
                                    Formatea con IA
                                    <FontAwesomeIcon icon={faMagicWandSparkles} />
                                </button>
                            )}

                            <MarkdownEditor value={contentValue} onChange={onChange} isEditing={isEditing} setIsEditing={setIsEditing} />

                            {itemsCategory && onItemsChange && (
                                <>
                                    <h2>{itemsLabel}</h2>
                                    <div className="sectionDisplay__selector">
                                        <img src={selectedValue?.content.image} className="sectionDisplay__image" alt={selectedValue?.content.title} />
                                        <select
                                            value={selectedValue?.content.title || ""}
                                            onChange={(e) => {
                                                const item = availableItems.find((item) => item.content.title === e.target.value);
                                                setSelectedValue(item || availableItems[0]);
                                            }}
                                        >
                                            {availableItems && availableItems.map((item) => (
                                                <option key={item.content.title} value={item.content.title}>
                                                    {item.content.title}
                                                </option>
                                            ))}
                                        </select>
                                        <button onClick={handleAddToSection}>
                                            Añadir a {title}
                                        </button>
                                        {createItemLink && (
                                            <Link to={createItemLink} className="sectionDisplay__link" target="_blank" rel="noopener noreferrer">
                                                No encuentras el que buscas? Créalo <FontAwesomeIcon icon={faExternalLink} />
                                            </Link>
                                        )}
                                    </div>
                                    <div className="sectionDisplay__itemsDisplay">
                                        {itemsOnSection.map((item) =>
                                            <div className="sectionDisplay__item" key={item.id}>
                                                <ArticleDisplay
                                                    image={item.content.image || ""}
                                                    title={item.content.title}
                                                    description={item.content.shortDescription}
                                                    articleId={item.content.title}
                                                    articleInfo={getArticleInfo(item.content)}
                                                    isBlank
                                                />
                                                <button
                                                    onClick={() => handleDeleteFromSection(item.id)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </>}
        </div>

    );

}

export default SectionDisplay;