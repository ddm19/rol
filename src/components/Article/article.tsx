import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArticleType, RelatedArticle } from "./types";
import "./article.scss";
import Error from "components/Error/error";
import Sections from "./components/sections";
import { contentParser } from "./utilFunctions";
import RelatedContent from "./components/relatedContent";
import Index from "./components/index";
import { fetchArticleById } from "./actions";
const Article = () =>
{
    const articleId = useParams().articleId;
    const [article, setArticle] = useState<ArticleType | null>(null);
    const [error, setError] = useState<String | null>(null);

    useEffect(() =>
    {
        if (articleId)
            fetchArticleById(articleId).then((res: any) =>
            {
                console.log(res);
                setArticle(res);
            }).catch((err: any) =>
            {
                setError(err);
            });



    }, []);
    useEffect(() =>
    {
        console.log(article);
    }, [article]);

    return (
        <>
            {error ? <Error
                title={error}
                subtitle="Puedes crearlo tú mismo 😉"
            /> :
                <>
                    {article ?
                        <div className="articleContainer">
                            <div className="articleContainer__indexContainer">
                                <span className="articleContainer--bold">CONTENIDO</span>
                                <Index sections={article.sections} />
                            </div>
                            <div className="articleContainer__mainContainer">
                                <h1 className="articleContainer__title">{article.title}</h1>
                                <span className="articleContainer__subtitle">{article.date}</span>
                                {contentParser(article.content, article)}
                                <Sections sections={article.sections} article={article} />
                            </div>
                            <div className="relatedContentContainer">
                                <RelatedContent relatedArray={article.related} />
                            </div>

                        </div >
                        :
                        <h1>Loading...</h1>
                    }
                </>
            }
        </>


    );
};

export default Article;