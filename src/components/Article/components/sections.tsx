import { useState } from "react";
import { ArticleType, Section } from "../types";
import { contentParser } from "../utilFunctions";

interface SectionProps 
{
    sections: Array<Section>;
    article: ArticleType;
    parentTitle?: String;
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
                        finalSection.push(<h2 id={sectionObject.title}>{parentTitle}{articlesQuantity} {sectionObject.title}</h2>);
                    }
                    else
                    {
                        finalSection.push(<h2 id={sectionObject.title}>{sectionObject.title}</h2>);

                    }
                    if (sectionObject.subtitle != null)
                        finalSection.push(<h4>{sectionObject.subtitle}</h4>);

                    finalSection = finalSection.concat(contentParser(sectionObject.content, article));

                    if (sectionObject.subSections != null && sectionObject.subSections.length > 0)
                    {
                        finalSection.push(<Sections article={article} sections={sectionObject.subSections} parentTitle={articlesQuantity + '.'} />);
                    }

                    return finalSection;
                })}

        </>

    );
};
export default Sections;