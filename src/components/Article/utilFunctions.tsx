import ReactMarkdown from "react-markdown";
import EmbedArticle from "./components/embedArticle";
import { ArticleType } from "./types";

export const contentParser = (
  content: string,
  article: ArticleType,
  isNumbered = false
): JSX.Element => {
  const paragraphClass = isNumbered ? "articleContainer--leftMargin" : "";
  const components = {
    p({ node, children }: any) {
      if (children && children.length === 1 && typeof children[0] === "string") {
        const match = (children[0] as string).match(/^\{([^}]+)\}$/);
        if (match) {
          const src = article.imports.find(
            (importedThing) => importedThing.id === match[1]
          );
          if (src) return <EmbedArticle related={src} />;
        }
      }
      return <p className={paragraphClass}>{children}</p>;
    },
    text({ node }: any) {
      const parts = node.value.split(/(\{[^}]+\})/g);
      return (
        <>
          {parts.map((part: string, index: number) => {
            const match = part.match(/^\{([^}]+)\}$/);
            if (match) {
              const src = article.imports.find(
                (importedThing) => importedThing.id === match[1]
              );
              if (src) return <EmbedArticle key={index} related={src} />;
            }
            return part;
          })}
        </>
      );
    }
  };
  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
};
