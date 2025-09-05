// src/hooks/useToast.js
import { useCallback, useRef, useState } from "react";

export default function useToast() {
    const [toast, setToast] = useState({
        visible: false,
        message: "",
        type: "success",
    });
    const timerRef = useRef(null);

    const showToast = useCallback(
        (message, type = "success", duration = 2200) => {
            setToast({ visible: true, message, type });
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(
                () => setToast((t) => ({ ...t, visible: false })),
                duration
            );
        },
        []
    );

    return { toast, showToast };
}