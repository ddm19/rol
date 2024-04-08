import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArticleType, RelatedArticle } from "./types";
import { error } from "console";


const Article = () =>
{
    const articleId = useParams().articleId;
    const [article, setArticle] = useState<ArticleType | null>(null);
    const [related, setRelated] = useState<RelatedArticle | null>(null);
    const [error, setError] = useState<String | null>(null);

    useEffect(() =>
    {

        import(`Articles/${articleId}.json`).then((res) =>
        {
            setArticle(res);
        }).catch((err) =>
        {
            if (err.code == "MODULE_NOT_FOUND")
                setError("No hemos encontrado ese Artículo");
        });


    }, []);

    return (
        <>
            {error ? error :
                <div className="articleContainer">
                    {article ?
                        <div className="articleContainer__sectionsContainer">
                            <h1>{article.title}</h1>
                            <h3>{article.date}</h3>
                            <p>{article.content}</p>
                        </div>
                        :
                        <h1>Loading...</h1>
                    }
                </div>
            }
        </>


    );
};
export default Article;