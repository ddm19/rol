import { useEffect, useState } from "react";
import "./sheetsList.scss";
import { useNavigate } from "react-router-dom";
import { listMySheets } from "services/sheets";

type SheetRow = { id: string; updatedAt: string };

const SheetsList: React.FC = () => {
    const [items, setItems] = useState<SheetRow[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        listMySheets().then((rows) =>
            setItems(rows.map((r: any) => ({ id: r.id, updatedAt: r.updated_at })))
        );
    }, []);

    return (
        <div className="sheetsList">
            <h2 className="sheetsList__title">Mis Fichas</h2>
            <ul className="sheetsList__grid">
                {items.map((x) => (
                    <li key={x.id} className="sheetsList__item" onClick={() => navigate(`/sheets/${encodeURIComponent(x.id)}`)}>
                        <h2 className="sheetsList__name">{x.id}
                            <div className="sheetsList__dateLabel">Última edición:</div>
                            <div className="sheetsList__date">
                                {new Date(x.updatedAt).toLocaleString()}
                            </div>
                        </h2>

                        <button
                            className="sheetsList__btn"
                            onClick={() => navigate(`/sheets/${encodeURIComponent(x.id)}`)}
                        >
                            Ver ficha
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default SheetsList;