import { useEffect, useState } from "react";
import "./ArticleSearch.scss";
import ArticleDisplay from "components/ArticleDisplay/articleDisplay";
import { fetchArticles } from "pages/Home/actions";
import { getCategories } from "pages/ArticleEditor/actions";
import { ArticleDisplayType } from "pages/Home/types/types";
import { ArticleType, Category } from "components/Article/types";
import Loading from "components/Loading/Loading";

const ArticleSearch = () => {
  const noImage = `${import.meta.env.VITE_PUBLIC_URL}/background.png`;
  const [articles, setArticles] = useState<ArticleDisplayType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  useEffect(() => {
    fetchArticles().then((res: ArticleDisplayType[]) => setArticles(res));
    getCategories().then((res: Category[]) => setCategories(res));
  }, []);
  const filteredArticles =
    selectedCategory === ""
      ? articles
      : articles.filter(
          (a) => a.content.category && a.content.category.id === selectedCategory
        );
  return (
    <div className="articleSearch">
      <select
        className="articleSearch__select"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="">Todas</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <div className="articlesContainer">
        {filteredArticles.length > 0 ? (
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
          <Loading />
        )}
        <ArticleDisplay
          image="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Plus_symbol.svg/1200px-Plus_symbol.svg.png"
          title="Crear Articulo"
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
