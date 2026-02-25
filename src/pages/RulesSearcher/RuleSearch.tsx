import { Category } from "components/Article/types";
import Loading from "components/Loading/Loading";
import { getCategories } from "pages/ArticleEditor/actions";
import ArticleSearch from "pages/ArticleSearch/ArticleSearch";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const RuleSearch = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoaded, setCategoriesLoaded] = useState(false);
    const [defaultCategory, setDefaultCategory] = useState<Category | undefined>();
    const defaultRule = new URLSearchParams(window.location.search).get("defaultRule");



    useEffect(() => {
        getCategories().then((res: Category[]) => {
            setCategories(res.filter(category => category.name.includes("Reglas"))
                .map(category => ({ ...category, name: category.name.replace("Reglas - ", "") })))
            setCategoriesLoaded(true);

        });
    }, []);

    useEffect(() => {
        if (defaultRule) {
            setDefaultCategory(categories.find((category) => category.name == defaultRule))
        }
    }, [categories])


    return (
        categoriesLoaded ? <ArticleSearch defaultCategories={categories} category={defaultCategory || categories[0]} /> : <Loading />
    );
}

export default RuleSearch;