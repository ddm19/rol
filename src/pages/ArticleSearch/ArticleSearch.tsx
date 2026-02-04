import { useEffect, useState } from "react";
import "./ArticleSearch.scss";
import ArticleDisplay from "components/ArticleDisplay/articleDisplay";
import { fetchArticles } from "pages/Home/actions";
import { getCategories } from "pages/ArticleEditor/actions";
import { ArticleDisplayType } from "pages/Home/types/types";
import { ArticleType, Category } from "components/Article/types";
import Loading from "components/Loading/Loading";

export interface ArticleSearchProps {
  category?: Category | null;
  defaultCategories?: Category[];
}

const ArticleSearch = (props: ArticleSearchProps) => {
  const { category, defaultCategories } = props;
  const noImage = `${import.meta.env.VITE_PUBLIC_URL}/background.png`;
  const [articles, setArticles] = useState<ArticleDisplayType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(
    category?.id ?? ""
  );
  const [search, setSearch] = useState("");
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [articlesLoaded, setArticlesLoaded] = useState(false);

  useEffect(() => {
    fetchArticles().then((res: ArticleDisplayType[]) => {
      setArticles(res);
      setArticlesLoaded(true);
    });
    if (defaultCategories == null || defaultCategories.length === 0) {
      getCategories().then((res: Category[]) => {
        setCategories(res);
        setCategoriesLoaded(true);
      });
    } else {
      setCategories(defaultCategories || []);
      setCategoriesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (props.category?.id) {
      setSelectedCategory(props.category.id);
    }
  }, [props.category?.id]);

  useEffect(() => {
    if (
      categoriesLoaded &&
      props.category &&
      props.category.id &&
      categories.some((c) => c.id === props.category!.id)
    ) {
      setSelectedCategory(props.category.id);
    }
  }, [categoriesLoaded, props.category, categories]);

  const filteredArticles = articles.filter((a) => {
    const matchesCategory =
      selectedCategory === "" ||
      (a.content.category && a.content.category.id === selectedCategory);

    const searchLower = search.toLowerCase();
    const matchesSearch =
      a.content.title?.toLowerCase().includes(searchLower) ||
      a.content.author?.toLowerCase().includes(searchLower) ||
      a.content.date?.toLowerCase().includes(searchLower) ||
      a.content.shortDescription?.toLowerCase().includes(searchLower);

    return matchesCategory && (search === "" || matchesSearch);
  });

  return (
    <div className="articleSearch">
      <h1 className="articleSearch__title">Conoce Hispania</h1>
      <h2 className="articleSearch__subtitle">
        Explora los artículos disponibles o crea uno nuevo
      </h2>
      <div className="articleSearch__categoryFilter">
        <input
          type="text"
          placeholder="Buscar por título, autor, fecha o descripción"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="articleSearch__searchBar"
        />
        <label className="articleSearch__label" htmlFor="categorySelect">
          Categoría:
        </label>
        <select
          className="articleSearch__select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {defaultCategories == null || defaultCategories.length === 0 ?
            <option value="">Todas</option>
            : null
          }


          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <span className="articleSearch__separator"></span>
      <div className="articlesContainer">
        {(!articlesLoaded || !categoriesLoaded) ? (
          <Loading />
        ) : filteredArticles.length > 0 ? (
          filteredArticles.map((articleItem: ArticleDisplayType, index: number) => {
            return (
              <ArticleDisplay
                key={index}
                image={
                  articleItem.content.image
                    ? articleItem.content.image
                    : noImage
                }
                title={articleItem.content.title}
                articleInfo={getArticleInfo(articleItem.content)}
                description={
                  articleItem.content.shortDescription
                    ? articleItem.content.shortDescription
                    : ""
                }
                articleId={articleItem.id}
              />
            );
          })
        ) : (
          <div className="articleSearch__noResults">Sin resultados</div>
        )}
        <ArticleDisplay
          image="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Plus_symbol.svg/1200px-Plus_symbol.svg.png"
          title="Crear Artículo"
        />
      </div>
    </div>
  );
};

export default ArticleSearch;

function getArticleInfo(content: ArticleType): string {
  const timeToRead = content.timeToRead ? `Leído en ${content.timeToRead}` : "";
  const author = content.author ? content.author : "";
  return `${author} • ${content.date} • ${timeToRead} `;
}
