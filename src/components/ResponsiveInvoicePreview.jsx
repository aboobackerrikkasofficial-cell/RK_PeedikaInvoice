import { useState, useEffect, useRef } from "react";
import InvoiceTemplate from "./InvoiceTemplate";

// Standard A4 dimensions in CSS pixels at 96 DPI
// Aspect ratio: 210 / 297 ≈ 0.70707
export const A4_BASE_WIDTH = 794;
export const A4_BASE_HEIGHT = 1123;

/**
 * ResponsiveInvoicePreview
 *
 * Responsively displays the full A4 InvoiceTemplate:
 * - On desktop: centered at 100% scale (794×1123px)
 * - On mobile/tablet: scales down proportionally to fit the screen width
 * - Strictly maintains the 210 × 297 A4 portrait aspect ratio
 * - Never requires horizontal scrolling
 * - Never cuts off the bottom or sides
 */
export default function ResponsiveInvoicePreview(props) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState(A4_BASE_WIDTH);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      // Get the container's inner available width
      const measured = containerRef.current.clientWidth;
      if (measured > 0) {
        setContainerWidth(measured);
        // Leave a slight padding margin on mobile so the invoice doesn't stick to the edge
        const padding = measured < 794 ? 16 : 0;
        const available = Math.max(280, measured - padding);
        // Scale down on screens < 794px; on desktop (>= 794px), cap at 1 (100%)
        const newScale = Math.min(1, available / A4_BASE_WIDTH);
        setScale(newScale);
      }
    };

    updateScale();

    // ResizeObserver tracks container width changes (orientation changes, viewport resize)
    const ro = new ResizeObserver(() => {
      updateScale();
    });

    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    window.addEventListener("resize", updateScale);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  const scaledWidth = Math.round(A4_BASE_WIDTH * scale);
  const scaledHeight = Math.round(A4_BASE_HEIGHT * scale);

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center items-start print:hidden"
      style={{
        width: "100%",
        padding: "8px 0",
        boxSizing: "border-box",
      }}
    >
      {/* Sized wrapper that matches the exact scaled A4 dimensions */}
      <div
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          position: "relative",
          overflow: "hidden",
          borderRadius: scale < 1 ? "4px" : "6px",
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#ffffff",
          flexShrink: 0,
        }}
      >
        {/* Fixed coordinate A4 invoice element scaled via CSS transform */}
        <div
          style={{
            width: `${A4_BASE_WIDTH}px`,
            height: `${A4_BASE_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "auto",
          }}
        >
          <InvoiceTemplate {...props} />
        </div>
      </div>
    </div>
  );
}
