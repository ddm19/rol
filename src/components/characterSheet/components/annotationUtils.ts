

function nodeTextLength(node: Node): number {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent?.length || 0;
    if (node.nodeName === "BR") return 1;
    let len = 0;
    node.childNodes.forEach((c) => (len += nodeTextLength(c)));
    return len;
}

// Treats <br> elements as a single "\n" character, matching how AnnotatedField
// converts line breaks to/from the plain-text value.
export function getTextOffset(container: HTMLElement, node: Node, nodeOffset: number): number {
    let total = 0;

    const walk = (n: Node): boolean => {
        if (n === node) {
            if (n.nodeType === Node.TEXT_NODE) {
                total += nodeOffset;
            } else {
                const children = n.childNodes;
                for (let i = 0; i < nodeOffset && i < children.length; i++) {
                    total += nodeTextLength(children[i]);
                }
            }
            return true;
        }
        if (n.nodeType === Node.TEXT_NODE) {
            total += n.textContent?.length || 0;
            return false;
        }
        if (n.nodeName === "BR") {
            total += 1;
            return false;
        }
        for (const child of Array.from(n.childNodes)) {
            if (walk(child)) return true;
        }
        return false;
    };

    if (!container.contains(node) && node !== container) return nodeTextLength(container);
    walk(container);
    return total;
}

export function getSelectionOffsets(container: HTMLElement): { start: number; end: number } | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) return null;
    const start = getTextOffset(container, range.startContainer, range.startOffset);
    const end = getTextOffset(container, range.endContainer, range.endOffset);
    return start <= end ? { start, end } : { start: end, end: start };
}

export function setCaretAtOffset(container: HTMLElement, offset: number) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
        acceptNode: (n) => (n.nodeType === Node.TEXT_NODE || (n as Element).nodeName === "BR" ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
    });
    let remaining = offset;
    let node = walker.nextNode();
    const range = document.createRange();
    const place = (n: Node, o: number) => {
        range.setStart(n, o);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
    };
    while (node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const len = node.textContent?.length || 0;
            if (remaining <= len) {
                place(node, remaining);
                return;
            }
            remaining -= len;
        } else {
            if (remaining <= 0) {
                const parent = node.parentNode;
                if (parent) {
                    const idx = Array.prototype.indexOf.call(parent.childNodes, node);
                    place(parent, idx);
                    return;
                }
            }
            remaining -= 1;
        }
        node = walker.nextNode();
    }
    range.selectNodeContents(container);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
}

export interface ResolvedAnnotation {
    id: string;
    start: number;
    end: number;
    note: string;
    kind?: string;
    orphaned: boolean;
}

export function resolveAnnotations(
    value: string,
    annotations: { id: string; start: number; end: number; anchorText: string; note: string; kind?: string }[],
): ResolvedAnnotation[] {
    const used: { start: number; end: number }[] = [];
    const resolved: ResolvedAnnotation[] = [];

    for (const a of annotations) {
        let start = -1;
        let end = -1;
        if (value.substring(a.start, a.end) === a.anchorText && a.anchorText !== "") {
            start = a.start;
            end = a.end;
        } else if (a.anchorText !== "") {
            const idx = value.indexOf(a.anchorText);
            if (idx !== -1) {
                start = idx;
                end = idx + a.anchorText.length;
            }
        }
        const overlaps = start !== -1 && used.some((u) => start < u.end && end > u.start);
        if (start === -1 || overlaps) {
            resolved.push({ id: a.id, start: a.start, end: a.end, note: a.note, kind: a.kind, orphaned: true });
        } else {
            used.push({ start, end });
            resolved.push({ id: a.id, start, end, note: a.note, kind: a.kind, orphaned: false });
        }
    }
    return resolved.sort((x, y) => x.start - y.start);
}
