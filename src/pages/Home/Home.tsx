import { FormEventHandler, SetStateAction, useEffect, useState } from "react";
import "./Home.scss";
import "./animations.css";
import ArticleDisplay from "components/ArticleDisplay/articleDisplay";
import { fetchArticles } from "./actions";
import { ArticleDisplayType } from "./types/types";
import { ArticleType } from "components/Article/types";
import Loading from "components/Loading/Loading";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import submitNewsletter from "services/newletter";

const Home: React.FC = () => {
  const noImage = `${import.meta.env.VITE_PUBLIC_URL}/background.png`;
  const [articles, setArticles] = useState<ArticleDisplayType[]>([]);
  const [mainArticle, setMainArticle] = useState<ArticleDisplayType>();

  const navigate = useNavigate();

  const submitEmail = (e: any): FormEventHandler<HTMLButtonElement> | any => {
    e.preventDefault();
    const email = e.target.email.value;
    submitNewsletter(email)
      .then(() => {
        alert("¡Gracias por suscribirte!");
        e.target.reset();
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  useEffect(() => {
    fetchArticles()
      .then((res: ArticleDisplayType[]) => {
        res.sort((a, b) => {
          const dateA = new Date(a.content.date);
          const dateB = new Date(b.content.date);
          return dateB.getTime() - dateA.getTime();
        });
        setArticles(res);
        const randomIndex = Math.floor(Math.random() * res.length);
        setMainArticle(res[randomIndex]);
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
                <h1
                  className="mainArticleContainer__title mainArticleContainer--whiteText"
                  onClick={() => navigate(`article/${mainArticle?.id}`)}
                >
                  {mainArticle?.content.title}
                </h1>
                <p
                  className="mainArticleContainer--normalText mainArticleContainer--whiteText"
                  onClick={() => navigate(`article/${mainArticle?.id}`)}
                >
                  {mainArticle?.content.shortDescription}
                </p>

                <Link
                  to={`/article/${mainArticle?.id}`}
                  className="mainArticleContainer__button mainArticleContainer--redText mainArticleContainer--normalText"
                >
                  Leer Más
                </Link>
                <img
                  src={
                    mainArticle?.content.image
                      ? mainArticle?.content.image
                      : noImage
                  }
                  alt={mainArticle?.id}
                  className="mainArticleContainer__image"
                  onClick={() => navigate(`article/${mainArticle?.id}`)}
                />
              </>
            ) : (
              <Loading />
            )}
          </div>
        </div>
      </div>
      <button className="newArticleButton" onClick={() => navigate("article")}>
        Crear artículo <FontAwesomeIcon icon={faPlus} />
      </button>
      <h1 className="articlesTitle">Artículos Recientes</h1>
      <p>Explora Hispania para ver más</p>
      <div className="articlesContainer">
        {articles != null ? (
          articles.length > 0 ? (
            articles.slice(0, 5).map((articleItem: ArticleDisplayType, index: number) => {
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
          )
        ) : (
          <Loading />
        )}
        <ArticleDisplay
          image="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Plus_symbol.svg/1200px-Plus_symbol.svg.png"
          title="Crear Artículo"
        />
      </div>

      <div className="emailContainer">
        <div className="titleContainer">
          <h2 className=" emailTitle">Entérate cuando haya algo nuevo</h2>
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
          <button className="subscribeButton" type="submit">
            Enviar
          </button>
        </form>
      </div>
    </>
  );
};
export default Home;
export function getArticleInfo(content: ArticleType): string {
  const timeToRead = content.timeToRead ? `Leído en ${content.timeToRead}` : "";
  const author = content.author ? content.author : "";

  return `${author} • ${content.date} • ${timeToRead} `;
}
