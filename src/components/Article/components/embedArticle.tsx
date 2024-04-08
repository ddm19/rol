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
    useEffect(() =>
    {
        console.log(related);
    }, []);
    return (
        <>
            <img src={related.image ? related.image : defaultImage} />
            <h3>{related.title}</h3>
            <h4>{related.subtitle}</h4>
            <p>{related.shortDesc}</p>
        </>

    );
};
export default EmbedArticle;