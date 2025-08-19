import EmbedArticle from "./components/embedArticle";
import { ArticleType } from "./types";

export const contentParser = (content: string, article: ArticleType, isNumbered = false) => {
    const parsedContainer: JSX.Element[] = [];
    const paragraphClass = isNumbered ? "articleContainer--leftMargin" : "";

    const normalized = (content || "").replace(/\r\n?/g, "\n");

    const lines = normalized.split(/\n+/);

    lines.forEach((line) => {
        if (line == null || line.trim() === "") return;

        const regex = /\{([^}]+)\}/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(line)) !== null) {
            const before = line.slice(lastIndex, match.index);
            if (before && before.trim() !== "") {
                parsedContainer.push(<p className={paragraphClass}>{before}</p>);
            }

            const imageId = match[1];
            const imported = article.imports.find((importedThing) => importedThing.id === imageId);
            if (imported) {
                if (imported.title || imported.subtitle || imported.shortDesc || imported.link) {
                    parsedContainer.push(<EmbedArticle related={imported} />);
                } else if (imported.image) {
                    parsedContainer.push(<img src={imported.image} alt={imported.id} width={imported.width} />);
                }
            } else {
                parsedContainer.push(
                    <p className={paragraphClass}>{`{${imageId}}`}</p>
                );
            }

            lastIndex = regex.lastIndex;
        }

        const after = line.slice(lastIndex);
        if (after && after.trim() !== "") {
            parsedContainer.push(<p className={paragraphClass}>{after}</p>);
        }
    });

    return parsedContainer;
};