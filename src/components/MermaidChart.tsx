import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidChartProps {
  chart: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "inherit",
});

export const MermaidChart: React.FC<MermaidChartProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let observer: IntersectionObserver | null = null;
    setHasError(false);

    if (ref.current) {
      ref.current.innerHTML = "";
      // Strip out markdown code block backticks if present
      let cleanChart = chart.replace(/^mermaid\n/, "").trim();

      // Sanitizer to heal common AI-generated mermaid syntax errors
      if (
        cleanChart.startsWith("graph") ||
        cleanChart.startsWith("flowchart")
      ) {
        // Fix sequence-diagram style edge labels in flowcharts: A --> B : label text -> A -->|"label text"| B
        // This also wraps the label in quotes which avoids some dagre layout errors.
        cleanChart = cleanChart.replace(
          /([A-Za-z0-9_-]+)\s*(<-->|<->|-->|->|<--|<-|---|-\.->|-\.-|==>|===)\s*([A-Za-z0-9_-]+)\s*:\s*([^\n\r]+)/g,
          (match, n1, edge, n2, text) => {
            // Normalize non-standard edges to standard flowchart edges
            let stdEdge = edge;
            if (edge === "->") stdEdge = "-->";
            if (edge === "<-") stdEdge = "<--";
            if (edge === "<->") stdEdge = "<-->";

            let cleanText = text.trim();
            // Remove trailing comments if any
            if (cleanText.includes("%%")) {
              cleanText = cleanText.split("%%")[0].trim();
            }
            // Strip existing quotes if present so we don't double quote
            if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
              cleanText = cleanText.slice(1, -1);
            }
            return `${n1} ${stdEdge}|"${cleanText}"| ${n2}`;
          },
        );

        // Standard edge with unquoted text: A -->|Text| B -> A -->|"Text"| B
        // Quotes help prevent "Could not find a suitable point for the given distance" dagre layout errors.
        cleanChart = cleanChart.replace(
          /([A-Za-z0-9_-]+)\s*(<-->|-->|<--|---|-\.->|-\.-|==>|===)\s*\|([^"|\n\r]+)\|\s*([A-Za-z0-9_-]+)/g,
          (match, n1, edge, text, n2) => {
            let cleanText = text.trim();
            if (cleanText.includes("%%")) {
              cleanText = cleanText.split("%%")[0].trim();
            }
            return `${n1} ${edge}|"${cleanText}"| ${n2}`;
          },
        );

        // Heal comma-separated multiple targets: A --> B, C -> A --> B & C
        // Only target lines that look like they have comma-separated nodes at the end, outside of edge labels
        cleanChart = cleanChart.split('\n').map(line => {
           if (!line.includes(',')) return line;
           // If line has an edge and comma after the edge
           const edgeMatch = line.match(/(<-->|-->|<--|---|-\.->|-\.-|==>|===)/);
           if (edgeMatch) {
              const edgeIdx = line.indexOf(edgeMatch[0]);
              let leftPart = line.substring(0, edgeIdx + edgeMatch[0].length);
              let rightPart = line.substring(edgeIdx + edgeMatch[0].length);
              
              // If there's a label like |"text"|, preserve it
              const labelMatch = rightPart.match(/^\s*\|[^|]+\|/);
              if (labelMatch) {
                 leftPart += labelMatch[0];
                 rightPart = rightPart.substring(labelMatch[0].length);
              }
              
              // Now replace commas in the rightPart with '&'
              if (rightPart.includes(',')) {
                 rightPart = rightPart.split(',').map(s => s.trim()).filter(Boolean).join(' & ');
              }
              return leftPart + ' ' + rightPart;
           }
           return line;
        }).join('\n');

        // Fix subgraph Titles with spaces/parens that lack brackets: subgraph Backend Services -> subgraph sg_BackendServices ["Backend Services"]
        cleanChart = cleanChart.replace(
          /^(\s*subgraph\s+)([^\n\r\[]+?)\s*(?:\r?\n|$)/gm,
          (match, prefix, contentText) => {
            let text = contentText.trim();
            let comment = "";
            if (text.includes("%%")) {
              const parts = text.split("%%");
              text = parts[0].trim();
              comment = " %%" + parts.slice(1).join("%%");
            }
            if (/^[A-Za-z0-9_-]+$/.test(text)) {
              return `${prefix}${text}${comment}\n`;
            }
            const id = "sg_" + text.replace(/[^A-Za-z0-9_]/g, "");
            return `${prefix}${id} ["${text}"]${comment}\n`;
          },
        );

        // Fix nodes with brackets/parens/spaces inside {} that aren't quoted: D{Database (Users)} -> D{"Database (Users)"}
        cleanChart = cleanChart.replace(
          /([A-Za-z0-9_-]+)\{([^"}]+)\}/g,
          (match, nodeId, text) => {
            if (
              text.includes("(") ||
              text.includes(")") ||
              text.includes(" ")
            ) {
              return `${nodeId}{"${text}"}`;
            }
            return match;
          },
        );

        // Fix nodes with parens inside [] that aren't quoted: A[Database (Users)] -> A["Database (Users)"]
        cleanChart = cleanChart.replace(
          /([A-Za-z0-9_-]+)\[([^"\]]+)\]/g,
          (match, nodeId, text) => {
            if (text.includes("(") || text.includes(")")) {
              return `${nodeId}["${text}"]`;
            }
            return match;
          },
        );
      }

      if (cleanChart.startsWith("classDiagram")) {
        // Fix enum Name { PATIENT } by converting it to class Name { <<enumeration>> PATIENT }
        cleanChart = cleanChart.replace(
          /enum\s+([A-Za-z0-9_]+)\s*\{/g,
          "class $1 {\n    <<enumeration>>",
        );
      }

      const id = `mermaid-${Math.round(Math.random() * 1000000)}`;

      const renderChart = async () => {
        if (!isMounted) return;
        try {
          // Parse first to validate syntax without throwing global unhandled rejections
          await mermaid.parse(cleanChart, { suppressErrors: true });
          const { svg } = await mermaid.render(id, cleanChart);
          if (ref.current && isMounted) {
            ref.current.innerHTML = svg;
            // Make SVG responsive
            const svgElement = ref.current.querySelector("svg");
            if (svgElement) {
              svgElement.style.maxWidth = "100%";
              svgElement.style.height = "auto";
            }
          }
        } catch (e) {
          console.error("Mermaid parsing error:", e);
          if (isMounted) {
            setHasError(true);
          }
          // Cleanup any error element mermaid might have injected
          const errorElement = document.getElementById(id);
          if (errorElement) {
            errorElement.remove();
          }
        }
      };

      // Only render when the container is visible and has a layout width to avoid "Could not find a suitable point for the given distance" and "svg element not in render tree" errors which happen when dagre layout engine tries to calculate sizes of zero-width elements
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            const checkAndRender = () => {
              if (!isMounted) return;
              if (ref.current && ref.current.offsetWidth > 0) {
                renderChart();
                if (observer) observer.disconnect();
              } else {
                // If it's intersecting but has 0 width, wait and try again
                requestAnimationFrame(checkAndRender);
              }
            };
            checkAndRender();
          }
        },
        { threshold: 0, rootMargin: '500px' }
      );
      
      observer.observe(ref.current);
    }

    return () => {
      isMounted = false;
      if (observer) {
        observer.disconnect();
      }
    };
  }, [chart]);

  return (
    <div className="my-6 w-full overflow-hidden">
      <div
        ref={ref}
        className={`overflow-x-auto flex justify-center py-6 bg-white border border-gray-100 rounded-xl shadow-sm ${
          hasError ? "hidden" : "block"
        }`}
      />
      {hasError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 overflow-x-auto w-full">
          <p className="font-semibold mb-2">
            Failed to render Mermaid diagram due to syntax error. Raw code:
          </p>
          <pre className="whitespace-pre-wrap font-mono text-xs">{chart}</pre>
        </div>
      )}
    </div>
  );
};
