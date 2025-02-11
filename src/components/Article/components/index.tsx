import React from "react";
import { Section } from "../types";

interface IndexProps {
  sections: Array<Section>;
  parentTitle?: string;
  classname?: string;
}

const Index = (props: IndexProps) => {
  const { sections, parentTitle } = props;
  let articlesQuantity = 0;
  const smoothScroll = (e: any, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      console.error("Element not found");
    }
  };

  return (
    <React.Fragment>
      {sections.map((sectionObject) => {
        const finalIndex = [];
        if (sectionObject.isNumbered) {
          articlesQuantity += 1;
          finalIndex.push(
            <a
              href={`#${sectionObject.title}`}
              onClick={(e) => smoothScroll(e, sectionObject.title)}
            >
              {" "}
              <p className={props.classname}>
                {parentTitle}
                {articlesQuantity} {sectionObject.title}
              </p>{" "}
            </a>
          );
        } else {
          finalIndex.push(
            <a
              href={`#${sectionObject.title}`}
              onClick={(e) => smoothScroll(e, sectionObject.title)}
            >
              {" "}
              <p className={props.classname}>{sectionObject.title}</p>{" "}
            </a>
          );
        }

        if (
          sectionObject.subSections != null &&
          sectionObject.subSections.length > 0
        ) {
          finalIndex.push(
            <Index
              sections={sectionObject.subSections}
              parentTitle={"- " + articlesQuantity + "."}
              classname="index--subSection"
            />
          );
        }

        return finalIndex;
      })}
    </React.Fragment>
  );
};
export default Index;
