import MarkdownEditor from "components/MarkdownEditor/markdownEditor";
import { useEffect, useState } from "react";
import "./inventoryDisplay.scss";
import { fetchArticles } from "pages/Home/actions";
import { ArticleType } from "components/Article/types";
import ArticleDisplay from "components/ArticleDisplay/articleDisplay";
import { getArticleInfo } from "pages/Home/Home";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLink, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export type MagicItem = {
    id: string;
    content: ArticleType;
}

interface InventoryDisplayProps {
    inventory: string;
    magicItems: MagicItem[];
    onInventoryChange: (val: string) => void;
    handleMagicItemsChange: (val: MagicItem[]) => void;
}

const InventoryDisplay = (props: InventoryDisplayProps) => {
    const { inventory, magicItems, onInventoryChange, handleMagicItemsChange } = props;
    const [inventoryValue, setInventoryValue] = useState(inventory);
    const [availableMagicItems, setMagicItems] = useState<MagicItem[]>([]);
    const [magicItemsOnInventory, setMagicItemsOnInventory] = useState<MagicItem[]>(magicItems || []);
    const [selectedValue, setSelectedValue] = useState<MagicItem>();

    useEffect(() => {
        fetchArticles().then((articles) => {
            const items = articles.filter(
                (a: { content: any, id: string }) => a.content.category?.name.toLowerCase().includes("objeto")
            );

            setMagicItems(items);
            setSelectedValue(items[0] || null);
        });
    }, []);

    useEffect(() => {
        setInventoryValue(inventory);
    }, [inventory]);

    useEffect(() => {
        setMagicItemsOnInventory(magicItems || []);
    }, [magicItems]);

    const onChange = (val: string) => {
        setInventoryValue(val);
        onInventoryChange(val);
    }

    const handleAddToInventory = () => {
        if (selectedValue) {
            const newItems = [...magicItemsOnInventory, { ...selectedValue, id: Date.now().toString() }];
            setMagicItemsOnInventory(newItems);
            handleMagicItemsChange(newItems);
        }
    };

    const handleDeleteFromInventory = (id: string) => {
        const newItems = magicItemsOnInventory.filter((item) => item.id !== id);
        setMagicItemsOnInventory(newItems);
        handleMagicItemsChange(newItems);
    };

    return (
        <div className="inventoryDisplay">
            <h2>Inventario</h2>
            <MarkdownEditor value={inventoryValue} onChange={onChange} />
            <h2>Objetos Mágicos</h2>
            <div className="inventoryDisplay__selector">
                <img src={selectedValue?.content.image} className="inventoryDisplay__image" alt={selectedValue?.content.title} />
                <select
                    value={selectedValue?.content.title}
                    onChange={(e) => {
                        const item = availableMagicItems.find((item) => item.content.title === e.target.value) || null;
                        setSelectedValue(item || availableMagicItems[0]);
                    }}
                >
                    {availableMagicItems && availableMagicItems.map((item) => (
                        <option key={item.content.title} value={item.content.title}>
                            {item.content.title}
                        </option>
                    ))}
                </select>
                <button onClick={handleAddToInventory}>
                    Añadir al inventario
                </button>
                <Link to={'/article'} className="inventoryDisplay__link" target="_blank" rel="noopener noreferrer">
                    No encuentras el que buscas? Créalo <FontAwesomeIcon icon={faExternalLink} />
                </Link>
            </div>
            <div className="inventoryDisplay__itemsDisplay">
                {magicItemsOnInventory.map((item) =>
                    <div className="inventoryDisplay__item" key={item.id}>
                        <ArticleDisplay
                            key={item.id}
                            image={item.content.image || ""}
                            title={item.content.title}
                            description={item.content.shortDescription}
                            articleId={item.id}
                            articleInfo={getArticleInfo(item.content)}
                        />
                        <button
                            onClick={() => handleDeleteFromInventory(item.id)}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

}

export default InventoryDisplay;