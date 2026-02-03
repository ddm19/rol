import { Category } from "components/Article/types";
import Loading from "components/Loading/Loading";
import { getCategories } from "pages/ArticleEditor/actions";
import ArticleSearch from "pages/ArticleSearch/ArticleSearch";
import { useEffect, useState } from "react";

const RuleSearch = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoaded, setCategoriesLoaded] = useState(false);

    useEffect(() => {
        getCategories().then((res: Category[]) => {
            setCategories(res.filter(category => category.name.includes("Reglas")).map(category => ({ ...category, name: category.name.replace("Reglas - ", "") })));
            setCategoriesLoaded(true);
        });
    }, []);

    return (
        categoriesLoaded ? <ArticleSearch defaultCategories={categories} category={categories[0]} /> : <Loading />
    );
}

export default RuleSearch;