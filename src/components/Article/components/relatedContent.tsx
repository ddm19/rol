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
            <h2 className="relatedContentContainer__mainTitle">ENLACES RELACIONADOS</h2>
            {relatedArray.map((related) =>
            {
                return (
                    <Link to={related.link} className="relatedContentContainer__link" target="blank">
                        <img src={related.image != null ? related.image : defaultImage} />
                        <div className="relatedContentContainer__content">
                            <h3 className="relatedContentContainer__title">{related.title}</h3>
                            <p className="relatedContentContainer__subtitle">{related.subtitle}</p>
                        </div>

                    </Link>

                );
            })}
        </React.Fragment>

    );
};
export default RelatedContent;