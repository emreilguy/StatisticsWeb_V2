// src/components/details/LiveDetectionPanel.jsx
import React from "react";
import { Card, CardContent } from "../ui/card";
import { TbPhotoOff } from "react-icons/tb";

export default function LiveDetectionPanel({ file, onClear, fullHeight = false }) {
  return (
    <Card className="bg-white/5 border-transparent !border-0 shadow-none backdrop-blur-sm h-full">
      <CardContent className={fullHeight ? "p-0 h-full" : "p-0"}>
        {file ? (
          <div className={fullHeight ? "relative h-full" : "relative"}>
            <img
              src={file}
              alt="preview"
              className={fullHeight ? "w-full h-full object-contain rounded-xl" : "w-full h-auto max-h-[460px] object-contain rounded-xl"}
              onError={(e) => {
                e.currentTarget.alt = "Image failed to load";
              }}
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <button type="button" onClick={onClear} className="px-2 py-1 text-sm bg-white/10 hover:bg-white/20 rounded">
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className={fullHeight ? "flex flex-col items-center justify-center h-full text-gray-400" : "flex flex-col items-center justify-center h-[460px] text-gray-400"}>
            <TbPhotoOff className="text-6xl mb-4" />
            <p className="text-sm text-center">No photo selected yet. Click a photo from the table to preview here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
