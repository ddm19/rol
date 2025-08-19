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
        if (line.trim() === "") return;

        const regex = /\{([^}]+)\}/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        let hasEmbeds = false;

        while ((match = regex.exec(line)) !== null) {
            hasEmbeds = true;
            const before = line.slice(lastIndex, match.index);
            if (before.trim()) {
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

            const id = match[1];
            const imp = article.imports.find((i) => i.id === id);
            if (imp) {
                if (imp.title || imp.subtitle || imp.shortDesc || imp.link) {
                    parsedContainer.push(
                        <EmbedArticle
                            key={`${lineIndex}-embed-${match.index}`}
                            related={imp}
                        />
                    );
                } else if (imp.image) {
                    parsedContainer.push(
                        <img
                            key={`${lineIndex}-img-${match.index}`}
                            src={imp.image}
                            alt={imp.id}
                            width={imp.width}
                        />
                    );
                }
            } else {
                parsedContainer.push(
                    <p
                        key={`${lineIndex}-placeholder-${match.index}`}
                        className={paragraphClass}
                    >
                        {`{${id}}`}
                    </p>
                );
            }

            lastIndex = regex.lastIndex;
        }

        if (hasEmbeds) {
            const remaining = line.slice(lastIndex);
            if (remaining.trim()) {
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
        } else {
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
