import { useState } from "react";
import { ArticleType, Section } from "../types";
import { contentParser } from "../utilFunctions";

interface SectionProps 
{
    sections: Array<Section>;
    article: ArticleType;
    parentTitle?: String;
    className?: String;
    isChild?: Boolean;
}
const Sections = (props: SectionProps) =>
{
    const { sections, article, parentTitle } = props;
    let articlesQuantity = 0;

    return (
        <>
            {
                sections.map((sectionObject) =>
                {
                    let finalSection = [];
                    if (sectionObject.isNumbered)
                    {
                        articlesQuantity += 1;
                        finalSection.push(<h2 id={sectionObject.title} className={props.className ? `${props.className}` : 'articleContainer__title'}>{parentTitle}{articlesQuantity} {sectionObject.title}</h2>);
                    }
                    else
                    {
                        finalSection.push(<h2 id={sectionObject.title} className={props.className ? `${props.className}` : 'articleContainer__title'}>{sectionObject.title}</h2>);

                    }
                    if (sectionObject.subtitle != null)
                        finalSection.push(<p className="articleContainer__subtitle">{sectionObject.subtitle}</p>);

                    finalSection = finalSection.concat(contentParser(sectionObject.content, article, props.isChild != null));

                    if (sectionObject.subSections != null && sectionObject.subSections.length > 0)
                    {
                        finalSection.push(<Sections article={article} sections={sectionObject.subSections} parentTitle={articlesQuantity + '.'} className="articleContainer__title2 articleContainer--leftMargin" isChild={true} />);;
                    }

                    return finalSection;
                })}

        </>

    );
};
export default Sections;