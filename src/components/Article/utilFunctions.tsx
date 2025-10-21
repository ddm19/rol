import ReactMarkdown from "react-markdown"
import EmbedArticle from "./components/embedArticle"
import { ArticleType } from "./types"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import { defaultSchema as hastDefaultSchema } from "hast-util-sanitize"
import "./components/tables.scss"

const schema = {
    ...hastDefaultSchema,
    tagNames: [
        ...(hastDefaultSchema.tagNames || []),
        "table", "thead", "tbody", "tr", "th", "td"
    ],
    attributes: {
        ...hastDefaultSchema.attributes,
        table: [
            ...(hastDefaultSchema.attributes?.table || []),
            ["className"], ["border"], ["cellPadding"], ["cellSpacing"]
        ],
        th: [
            ...(hastDefaultSchema.attributes?.th || []),
            ["colspan"], ["rowspan"], ["align"], ["className"], ["colSpan"], ["rowSpan"]
        ],
        td: [
            ...(hastDefaultSchema.attributes?.td || []),
            ["colspan"], ["rowspan"], ["align"], ["className"], ["colSpan"], ["rowSpan"]
        ],
        a: [
            ...(hastDefaultSchema.attributes?.a || []),
            ["target"], ["rel"]
        ],
    },
}

export const contentParser = (
    content: string,
    article: ArticleType,
    isNumbered = false
) => {
    const paragraphClass = isNumbered ? "articleContainer--leftMargin" : ""
    const normalized = (content || "").replace(/\r\n?/g, "\n")

    const blocks: Array<{ type: "md"; text: string } | { type: "embed"; id: string }> = []
    const re = /\{([^}]+)\}/g
    let last = 0
    let m: RegExpExecArray | null

    while ((m = re.exec(normalized)) !== null) {
        const before = normalized.slice(last, m.index)
        if (before) blocks.push({ type: "md", text: before })
        blocks.push({ type: "embed", id: m[1] })
        last = re.lastIndex
    }
    const tail = normalized.slice(last)
    if (tail) blocks.push({ type: "md", text: tail })

    const out: JSX.Element[] = []

    blocks.forEach((b, i) => {
        if (b.type === "md") {
            out.push(
                <ReactMarkdown
                    key={`md-${i}`}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
                    components={{
                        p: ({ children }) => <p className={paragraphClass}>{children}</p>,
                        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                        table: ({ node, className, ...props }) => {
                            const cls = className ? `${className} dndTable` : "dndTable"
                            return <table {...props} className={cls} />
                        },
                    }}
                >
                    {b.text}
                </ReactMarkdown>
            )
        } else {
            const imp = article.imports.find(x => x.id === b.id)
            if (imp) {
                if (imp.title || imp.subtitle || imp.shortDesc || imp.link) {
                    out.push(<EmbedArticle key={`embed-${i}`} related={imp} />)
                } else if (imp.image) {
                    out.push(<img key={`img-${i}`} src={imp.image} alt={imp.id} width={imp.width} />)
                }
            } else {
                out.push(<p key={`placeholder-${i}`} className={paragraphClass}>{`{${b.id}}`}</p>)
            }
        }
    })

    return <>{out}</>
}
