import ReactMarkdown from "react-markdown";
import EmbedArticle from "./components/embedArticle";
import { ArticleType } from "./types";

export const contentParser = (
    content: string,
    article: ArticleType,
    isNumbered = false
) => {
    const parsedContainer: JSX.Element[] = [];
    const paragraphClass = isNumbered ? "articleContainer--leftMargin" : "";

    const normalized = (content || "").replace(/\r\n?/g, "\n");
    const lines = normalized.split(/\n+/);

    lines.forEach((line, lineIndex) => {
        if (line == null || line.trim() === "") return;

        const regex = /\{([^}]+)\}/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        let hasEmbeds = false;

        while ((match = regex.exec(line)) !== null) {
            hasEmbeds = true;
            const before = line.slice(lastIndex, match.index);
            if (before && before.trim() !== "") {
                parsedContainer.push(
                    <ReactMarkdown
                        key={`${lineIndex}-before-${match.index}`}
                        components={{
                            p: ({ children }) => <p className={paragraphClass}>{children}</p>,
                        }}
                    >
                        {before}
                    </ReactMarkdown>
                );
            }

            const imageId = match[1];
            const imported = article.imports.find(
                (importedThing) => importedThing.id === imageId
            );
            if (imported) {
                if (
                    imported.title ||
                    imported.subtitle ||
                    imported.shortDesc ||
                    imported.link
                ) {
                    parsedContainer.push(
                        <EmbedArticle
                            key={`${lineIndex}-embed-${match.index}`}
                            related={imported}
                        />
                    );
                } else if (imported.image) {
                    parsedContainer.push(
                        <img
                            key={`${lineIndex}-img-${match.index}`}
                            src={imported.image}
                            alt={imported.id}
                            width={imported.width}
                        />
                    );
                }
            } else {
                parsedContainer.push(
                    <p
                        key={`${lineIndex}-placeholder-${match.index}`}
                        className={paragraphClass}
                    >
                        {`{${imageId}}`}
                    </p>
                );
            }

            lastIndex = regex.lastIndex;
        }

        const remaining = line.slice(lastIndex);
        if (remaining && remaining.trim() !== "") {
            parsedContainer.push(
                <ReactMarkdown
                    key={`${lineIndex}-remaining`}
                    components={{
                        p: ({ children }) => <p className={paragraphClass}>{children}</p>,
                    }}
                >
                    {remaining}
                </ReactMarkdown>
            );
        }

        if (!hasEmbeds) {
            parsedContainer.push(
                <ReactMarkdown
                    key={`${lineIndex}-full`}
                    components={{
                        p: ({ children }) => <p className={paragraphClass}>{children}</p>,
                    }}
                >
                    {line}
                </ReactMarkdown>
            );
        }
    });

    return <>{parsedContainer}</>;
};
