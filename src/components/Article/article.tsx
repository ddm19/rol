import { useParams } from "react-router-dom";


const Article = () =>
{
    const articleId = useParams();
    const articlesUrl = "Articles/";

    const file = require(articlesUrl + articleId);

    console.log(file);


    return <div>asdasd</div>;
};
export default Article;