

export function getTextOffset(container: HTMLElement, node: Node, nodeOffset: number): number {
    const range = document.createRange();
    range.selectNodeContents(container);
    try {
        range.setEnd(node, nodeOffset);
    } catch {
        return container.textContent?.length || 0;
    }
    return range.toString().length;
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
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let remaining = offset;
    let node = walker.nextNode();
    let target: { node: Node; offset: number } | null = null;
    while (node) {
        const len = node.textContent?.length || 0;
        if (remaining <= len) {
            target = { node, offset: remaining };
            break;
        }
        remaining -= len;
        node = walker.nextNode();
    }
    if (!target) {
        const range = document.createRange();
        range.selectNodeContents(container);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        return;
    }
    const range = document.createRange();
    range.setStart(target.node, target.offset);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
}

export interface ResolvedAnnotation {
    id: string;
    start: number;
    end: number;
    note: string;
    orphaned: boolean;
}

export function resolveAnnotations(
    value: string,
    annotations: { id: string; start: number; end: number; anchorText: string; note: string }[],
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
            resolved.push({ id: a.id, start: a.start, end: a.end, note: a.note, orphaned: true });
        } else {
            used.push({ start, end });
            resolved.push({ id: a.id, start, end, note: a.note, orphaned: false });
        }
    }
    return resolved.sort((x, y) => x.start - y.start);
}
