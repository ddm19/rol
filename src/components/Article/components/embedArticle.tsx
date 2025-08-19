import { ImportedItem } from "../types";

interface RelatedProps {
    related: ImportedItem;
}
const EmbedArticle = (props: RelatedProps) => {
    const { related } = props;
    const defaultImage = `/NotFound.png`;
    const stack = (related.width || 0) > 150;
    return (
        <div className={`embedContentContainer articleContainer--leftMargin${stack ? " embedContentContainer--stack" : ""}`}>
            <img src={related.image ? related.image : defaultImage} alt={related.title} width={related.width} />
            <div className="embedContentContainer__content">
                <h3 className="embedContentContainer__title">{related.title}</h3>
                <span className="embedContentContainer__subtitle">{related.subtitle}</span>
                <p >{related.shortDesc}</p>
            </div>
        </div>

    );
};
export default EmbedArticle;