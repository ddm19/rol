import { FormEventHandler, SetStateAction, useEffect, useState } from "react";
import "./Home.scss";
import "./animations.css";
import ArticleDisplay from "components/ArticleDisplay/articleDisplay";
import { fetchArticles } from "./actions";
import { ArticleDisplayType } from "./types/types";
import { ArticleType } from "components/Article/types";
import Loading from "components/Loading/Loading";

const Home: React.FC = () => {
  const noImage = `${process.env.PUBLIC_URL}/background.png`;
  const [articles, setArticles] = useState<ArticleDisplayType[]>([]);
  const [mainArticle, setMainArticle] = useState<ArticleDisplayType>();
  const submitEmail = (e: any): FormEventHandler<HTMLButtonElement> | any => {
    e.preventDefault();
    alert("Método de envío de Emails no implementado!");
  };
  useEffect(() => {
    fetchArticles()
      .then((res: SetStateAction<ArticleDisplayType[]>) => {
        setArticles(res);
        const randomIndex = Math.floor(Math.random() * res.length);
        setMainArticle(articles[randomIndex]);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }, []);

  return (
    <>
      <div className="titleBlock">
        <div className="articleBGContainer">
          <div className="mainArticleContainer">
            {mainArticle != null ? (
              <>
                <h1 className="mainArticleContainer__title mainArticleContainer--whiteText">
                  {mainArticle?.content.title}
                </h1>
                <p className="mainArticleContainer--normalText mainArticleContainer--whiteText ">
                  {mainArticle?.content.shortDescription}
                </p>
                <button className="mainArticleContainer__button mainArticleContainer--redText mainArticleContainer--normalText">
                  Leer Más
                </button>
                <img
                  src={
                    mainArticle?.content.image
                      ? mainArticle?.content.image
                      : noImage
                  }
                  alt={mainArticle?.content.title}
                  className="mainArticleContainer__image"
                />
              </>
            ) : (
              <Loading />
            )}
          </div>
        </div>
      </div>
      <div className="articlesContainer">
        {articles != null ? (
          articles.length > 0 &&
          articles.map((articleItem: ArticleDisplayType, index: number) => {
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
                articleId={articleItem.name}
              />
            );
          })
        ) : (
          <h1 className="noArticles">No hay artículos</h1>
        )}
      </div>
      <div className="emailContainer">
        <div className="titleContainer">
          <h1 className=" emailTitle">Entérate cuando haya algo nuevo</h1>
          <p className="emailDescription">
            Partidas, nuevo lore, personajes interesantes...
          </p>

          <p className="emailDescription">
            Haz que te llegue un mail cuando haya algo nuevo!
          </p>
        </div>
        <form onSubmit={submitEmail} className="emailForm">
          <input
            className="redText"
            type="email"
            name="email"
            id="email"
            placeholder="Aquí va tu email"
          ></input>
          <button className="button whiteText subscribeButton" type="submit">
            Enviar
          </button>
        </form>
      </div>
    </>
  );
};
export default Home;
function getArticleInfo(content: ArticleType): string {
  const timeToRead = content.timeToRead ? `Leído en ${content.timeToRead}` : "";
  const author = content.author ? content.author : "";

  return `${author} • ${content.date} • ${timeToRead} `;
}
