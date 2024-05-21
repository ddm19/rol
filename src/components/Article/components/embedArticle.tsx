import { useEffect } from "react";
import { ImportedItem } from "../types";

interface RelatedProps
{
    related: ImportedItem;
}
const EmbedArticle = (props: RelatedProps) =>
{
    const { related } = props;
    const defaultImage = `${process.env.PUBLIC_URL}/NotFound.png`;

    return (
        <div className="embedContentContainer">
            <img src={related.image ? related.image : defaultImage} />
            <div className="embedContentContainer__content">
                <h3 className="embedContentContainer__title">{related.title}</h3>
                <span className="embedContentContainer__subtitle">{related.subtitle}</span>
                <p >{related.shortDesc}</p>
            </div>
        </div>

    );
};
export default EmbedArticle;