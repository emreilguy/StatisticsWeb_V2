// src/hooks/usePreviewHeight.js
import { useEffect, useLayoutEffect, useState } from "react";

export default function usePreviewHeight(ref, deps = []) {
  const [previewHeight, setPreviewHeight] = useState(0);

  const syncHeights = () => {
    const h = ref.current?.offsetHeight || 0;
    setPreviewHeight(h);
  };

  useLayoutEffect(() => {
    syncHeights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onResize = () => syncHeights();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    syncHeights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return previewHeight;
}
