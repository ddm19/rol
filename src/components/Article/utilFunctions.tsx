import EmbedArticle from "./components/embedArticle";
import { ArticleType } from "./types";

export const contentParser = (content: string, article: ArticleType, isNumbered = false) =>
{
    let parsedContainer = [];
    let contentArray = content.split(' ');

    let element = "";

    contentArray.forEach((word: string) =>
    {
        if (word.includes('{'))
        {
            parsedContainer.push(<p >{element}</p>);
            element = "";
            const imageId = word.substring(1, word.length - 1);
            const src = article.imports.filter((importedThing) => importedThing.id === imageId)[0];
            parsedContainer.push(<EmbedArticle related={src} />);

        }
        else if (word.includes('\n'))
        {
            parsedContainer.push(<p>{element}</p>);
            element = "";
        }
        else
            element += word + ' ';

    });

    parsedContainer.push(<p className={isNumbered ? "articleContainer--leftMargin" : ""}>{element}</p>);
    return parsedContainer;

};