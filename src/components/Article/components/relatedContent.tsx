import { Link } from "react-router-dom";
import { RelatedArticle } from "../types";
import React from "react";

interface RelatedContentProps
{
    relatedArray: Array<RelatedArticle>;
}

const RelatedContent = (props: RelatedContentProps) =>
{
    const { relatedArray } = props;
    const defaultImage = `${process.env.PUBLIC_URL}/NotFound.png`;

    return (
        <React.Fragment>
            <h2>CONTENIDO RELACIONADO</h2>
            {relatedArray.map((related) =>
            {
                return (
                    <Link to={related.link}>

                        <img src={related.image != null ? related.image : defaultImage} />
                        <h3>{related.title}</h3>
                        <h4>{related.subtitle}</h4>
                    </Link>

                );
            })}
        </React.Fragment>

    );
};
export default RelatedContent;