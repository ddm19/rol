import { ImportedItem } from "../types";

interface RelatedProps {
    related: ImportedItem;
}
const EmbedArticle = (props: RelatedProps) => {
    const { related } = props;
    const defaultImage = `/NotFound.png`;
    const defaultWidth = 150;
    const isMobile = window.innerWidth <= 768;
    const stack = isMobile || (related.width || 0) > 250;
    return (
        <div className={`embedContentContainer articleContainer--leftMargin${stack ? " embedContentContainer--stack" : ""}`}>
            <img src={related.image ? related.image : defaultImage} alt={related.title} width={related.width || defaultWidth} />
            <div className="embedContentContainer__content">
                <h3 className="embedContentContainer__title">{related.title}</h3>
                <span className="embedContentContainer__subtitle">{related.subtitle}</span>
                <p >{related.shortDesc}</p>
            </div>
        </div>

    );
};
export default EmbedArticle;