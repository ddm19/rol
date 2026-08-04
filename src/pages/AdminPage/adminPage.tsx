import { Link } from "react-router-dom";
import SheetsList from "components/SheetList/sheetsList";

const AdminPage = () => {

    return (
        <>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem" }}>
                <Link to="/admin/cards">Subir cartas →</Link>
            </div>
            <SheetsList />
        </>
    );
}

export default AdminPage;
