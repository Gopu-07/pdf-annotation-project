import React, { useState, useRef } from "react";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { UploadCloud, FileText, ZoomIn, ZoomOut, Maximize, Search } from "lucide-react";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Set up the PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [numPages, setNumPages] = useState(null);

  // Ref for the zoom wrapper to programmatically zoom/pan
  const transformComponentRef = useRef(null);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsLoading(true);

    const form = new FormData();
    form.append("file", uploadedFile);

    try {
      const res = await axios.post("http://127.0.0.1:8000/extract", form);
      setData(res.data);
    } catch (err) {
      console.error("Extraction failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setData(null);
    setSelected(null);
  };

  // Helper to get confidence color class
  const getConfidenceClass = (conf) => {
    if (conf >= 0.9) return "confidence-high";
    if (conf >= 0.7) return "confidence-medium";
    return "confidence-low";
  };

  const handleRegionClick = (region, itemPageNum) => {
    setSelected({ ...region, pageNum: itemPageNum });

    // Programmatic Zoom & Highlight Logic based on absolute BBox rendering
    setTimeout(() => {
      const targetId = `selected-region-${region.id}`;
      const targetElement = document.getElementById(targetId);

      if (targetElement && transformComponentRef.current) {
        const { setTransform } = transformComponentRef.current;
        requestAnimationFrame(() => {
          const pageContainer = targetElement.closest('.react-pdf__Page');
          if (pageContainer) {
            const scale = 1.8; // Set scale back to a safe zoom amount

            // Ensure the actual node is in view of the browser scroll BEFORE applying transform mathematics
            // Smooth scroll the native container so it doesn't clip the wrapper math
            pageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Allow the smooth scroll behavior to finish before transforming the inner canvas
            setTimeout(() => {
              // Get the relative coordinates of the target element inside its unscaled page
              const pageRect = pageContainer.getBoundingClientRect();
              const elementRect = targetElement.getBoundingClientRect();

              // Current scale of the DOM before we apply new scale
              // react-pdf scales the .react-pdf__Page div using CSS transform / canvas size
              const currentScale = pageRect.width / pageContainer.offsetWidth || 1;

              // Center of the element relative to the wrapper content
              const contentEl = transformComponentRef.current.instance.contentComponent;
              const contentRect = contentEl.getBoundingClientRect();

              // The absolute offset of the page within the scalable content wrapper
              const pageOffsetX = (pageRect.left - contentRect.left) / currentScale;
              const pageOffsetY = (pageRect.top - contentRect.top) / currentScale;

              // The relative center of the element inside its page
              const elementCenterX = (elementRect.left - pageRect.left + elementRect.width / 2) / currentScale;
              const elementCenterY = (elementRect.top - pageRect.top + elementRect.height / 2) / currentScale;

              // We need to translate the TransformWrapper. Get the wrapper's dimensions first.
              const wrapperEl = transformComponentRef.current.instance.wrapperComponent;
              const viewportWidth = wrapperEl ? wrapperEl.offsetWidth : 800;
              const viewportHeight = wrapperEl ? wrapperEl.offsetHeight : 600;

              // Total unscaled center point we want to focus on
              const targetFocusX = pageOffsetX + elementCenterX;
              const targetFocusY = pageOffsetY + elementCenterY;

              // The translation required to put targetFocus precisely in the center of the viewport
              let targetX = (viewportWidth / 2) - (targetFocusX * scale);
              let targetY = (viewportHeight / 2) - (targetFocusY * scale);

              // Apply precise transform manually
              setTransform(targetX, targetY, scale, 500, "easeOut");
            }, 350); // Delay safely bypasses browser scroll collision
          } else {
            const { zoomToElement } = transformComponentRef.current;
            zoomToElement(targetElement, 1.8, 500);
          }
        });
      } else if (transformComponentRef.current) {
        const { centerView } = transformComponentRef.current;
        centerView(1.5, 500);
      }
    }, 150); // Small delay to guarantee DOM has rendered the overlay div
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Render Upload View if no file
  if (!file || isLoading) {
    return (
      <div className="upload-container">
        <div className="upload-card">
          {isLoading ? (
            <div className="loader-container">
              <div className="spinner"></div>
              <h2>Analyzing Document...</h2>
              <p>Extracting text and regions safely using AI.</p>
            </div>
          ) : (
            <>
              <UploadCloud size={64} className="upload-icon" />
              <h2>Upload PDF Document</h2>
              <p>Drag and drop your file here, or click the button below to browse.</p>

              <label className="upload-input-label">
                <FileText size={20} style={{ marginRight: 8 }} />
                Select PDF
                <input
                  type="file"
                  accept="application/pdf"
                  className="upload-input"
                  onChange={handleFileUpload}
                />
              </label>
            </>
          )}
        </div>
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className="dashboard">
      {/* Left Pane - PDF Viewer */}
      <div className="pane-left">
        <div className="pdf-viewer-container">
          <TransformWrapper
            ref={transformComponentRef}
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            centerOnInit={true}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="pdf-controls">
                  <button className="control-btn" onClick={() => zoomOut()} title="Zoom Out">
                    <ZoomOut size={20} />
                  </button>
                  <button className="control-btn" onClick={() => resetTransform()} title="Reset Zoom">
                    <Maximize size={20} />
                  </button>
                  <button className="control-btn" onClick={() => zoomIn()} title="Zoom In">
                    <ZoomIn size={20} />
                  </button>
                </div>

                <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                  <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div className="spinner" style={{ margin: "5rem auto" }}></div>}
                  >
                    {Array.from(new Array(numPages), (el, index) => {
                      const pageNum = index + 1;
                      const pageData = data?.pages?.find(p => p.page === pageNum);

                      return (
                        <div key={`page_${pageNum}`} style={{ marginBottom: 20, position: 'relative' }}>
                          <Page
                            pageNumber={pageNum}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            width={800} // Standard fixed width to avoid layout thrashing
                          />

                          {/* Exact Coordinates Highlight Overlay */}
                          {selected && selected.pageNum === pageNum && pageData && pageData.page_width && pageData.page_height && selected.bbox && (
                            <div
                              id={`selected-region-${selected.id}`}
                              className="highlighted-word"
                              style={{
                                position: 'absolute',
                                left: `${(selected.bbox[0] / pageData.page_width) * 100}%`,
                                top: `${(selected.bbox[1] / pageData.page_height) * 100}%`,
                                width: `${((selected.bbox[2] - selected.bbox[0]) / pageData.page_width) * 100}%`,
                                height: `${((selected.bbox[3] - selected.bbox[1]) / pageData.page_height) * 100}%`,
                                pointerEvents: 'none',
                                margin: 0,
                                padding: 0
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </Document>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      </div>

      {/* Right Pane - Extracted Data */}
      <div className="pane-right">
        <div className="pane-header">
          <div>
            <h2 style={{ fontSize: "1.25rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Search size={20} className="upload-icon" style={{ margin: 0, animation: "none" }} />
              Extracted Regions
            </h2>
            <p style={{ fontSize: "0.875rem", margin: 0 }}>Review extracted text.</p>
          </div>
          <button
            onClick={clearSelection}
            style={{
              background: "white",
              border: "1px solid var(--border-color)",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontWeight: 500
            }}
          >
            Clear Document
          </button>
        </div>

        <div className="regions-list">
          {data ? data.pages.map((p) => (
            <div key={p.page} className="page-group">
              <div className="page-group-title">Page {p.page}</div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {p.regions.map((r) => {
                  const isSelected = selected?.id === r.id;

                  return (
                    <div
                      key={r.id}
                      className={`region-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleRegionClick(r, p.page)}
                    >
                      <div className="region-text">
                        {r.text}
                      </div>

                      <div className="region-meta">
                        <span className={`confidence-badge ${getConfidenceClass(r.confidence)}`}>
                          {Math.round(r.confidence * 100)}% Match
                        </span>
                        {isSelected && <span style={{ color: "var(--accent-primary)", fontSize: "0.75rem", fontWeight: 500 }}>Selected</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )) : (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "2rem" }}>
              No data extracted yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
