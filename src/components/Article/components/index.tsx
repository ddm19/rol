import React from "react";
import { Section } from "../types";

interface IndexProps
{
    sections: Array<Section>;
    parentTitle?: string;
}

const Index = (props: IndexProps) =>
{
    const { sections, parentTitle } = props;
    let articlesQuantity = 0;

    return (
        <React.Fragment>
            CONTENIDO
            {sections.map((sectionObject) =>
            {
                const finalIndex = [];
                if (sectionObject.isNumbered)
                {
                    articlesQuantity += 1;
                    finalIndex.push(
                        <a href={`#${sectionObject.title}`}> <h3>{parentTitle}{articlesQuantity} {sectionObject.title}</h3> </a>);
                }
                else
                {
                    finalIndex.push(<a href={`#${sectionObject.title}`}> <h3>{sectionObject.title}</h3> </a>);


                }

                if (sectionObject.subSections != null && sectionObject.subSections.length > 0)
                {
                    finalIndex.push(<Index sections={sectionObject.subSections} parentTitle={articlesQuantity + '.'} />);
                }

                return finalIndex;
            }

            )
            }
        </React.Fragment>
    );

};
export default Index;
;
