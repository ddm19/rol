import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArticleType } from "./types";
import "./article.scss";
import Error from "components/Error/error";
import Sections from "./components/sections";
import { contentParser } from "./utilFunctions";
import RelatedContent from "./components/relatedContent";
import Index from "./components/index";
import { fetchArticleById } from "./actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faPencil } from "@fortawesome/free-solid-svg-icons";
import Loading from "components/Loading/Loading";
interface ArticleProps {
  articleContent?: ArticleType | null;
}

const Article = (props: ArticleProps) => {
  const articleId = useParams().articleId;
  const { articleContent } = props;
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [error, setError] = useState<String | null>(null);
  const [isIndexVisible, setIsIndexVisible] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (articleContent) setArticle(articleContent);
  }, [articleContent]);

  useEffect(() => {
    if (articleId && articleContent == null)
      fetchArticleById(articleId)
        .then((res: any) => {
          setArticle(res);
        })
        .catch((err: any) => {
          setError(err);
        });
  }, [articleId]);

  return (
    <>
      {error ? (
        <Error title={error} subtitle="Puedes crearlo tú mismo 😉" />
      ) : (
        <>
          {article != null ? (
            <div className="articleContainer">
              <button
                className={`${isIndexVisible
                  ? "articleContainer__indexButton--hidden"
                  : "articleContainer__indexButton articleContainer__indexButton--float"
                  }`}
                onClick={() => setIsIndexVisible(!isIndexVisible)}
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>

              <div
                className={`articleContainer__indexContainer${!isIndexVisible
                  ? " articleContainer__indexContainer--hidden"
                  : ""
                  }`}
              >
                <span className="articleContainer--bold">CONTENIDO</span>
                <button
                  onClick={() => setIsIndexVisible(!isIndexVisible)}
                  className="articleContainer__indexButton "
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>

                <Index sections={article.sections} />
              </div>
              <div className="articleContainer__mainContainer">
                <h1 className="articleContainer__title">{article.title}</h1>
                <span className="articleContainer__subtitle">
                  {article.date}
                </span>
                {contentParser(article.content, article)}
                <Sections sections={article.sections} article={article} />
              </div>
              <div className="relatedContentContainer">
                <RelatedContent relatedArray={article.related} />
                <button onClick={() => { navigate(`/Article?id=${articleId}&mode=create`) }}>Editar Artículo <FontAwesomeIcon icon={faPencil} className="articleContainer__editIcon" /></button>

              </div>
            </div>
          ) : (
            <Loading />
          )}
        </>
      )}
    </>
  );
};

export default Article;
