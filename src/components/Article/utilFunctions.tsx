import EmbedArticle from "./components/embedArticle";
import { ArticleType } from "./types";

export const contentParser = (content: string, article: ArticleType) =>
{
    let parsedContainer = [];
    let contentArray = content.split(' ');

    let element = "";
    contentArray.forEach((word: string) =>
    {
        if (!word.includes('{'))
            element += word + ' ';
        else
        {
            parsedContainer.push(<p>{element}</p>);
            element = "";
            const imageId = word.substring(1, word.length - 1);
            const src = article.imports.filter((importedThing) => importedThing.id === imageId)[0];
            parsedContainer.push(<EmbedArticle related={src} />);

        }
    });

    parsedContainer.push(<p>{element}</p>);

    return parsedContainer;

};