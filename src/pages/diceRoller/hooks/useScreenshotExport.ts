import { useCallback, useRef, useState } from "react";
import html2canvas from "html2canvas";

type CopyStatus = "idle" | "copied";

export const useScreenshotExport = (fileName: string) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

  const captureCanvas = useCallback(() => {
    if (!targetRef.current) return null;
    return html2canvas(targetRef.current, {
      allowTaint: false,
      useCORS: true,
      scale: 2,
      backgroundColor: null,
    });
  }, []);

  const download = useCallback(async () => {
    const canvas = await captureCanvas();
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = fileName;
    link.href = canvas.toDataURL();
    link.click();
  }, [captureCanvas, fileName]);

  const copy = useCallback(async () => {
    const canvas = await captureCanvas();
    if (!canvas) return;

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
    if (!blob) return;

    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    setCopyStatus("copied");
    setTimeout(() => setCopyStatus("idle"), 1000);
  }, [captureCanvas]);

  return { targetRef, download, copy, copyStatus };
};
