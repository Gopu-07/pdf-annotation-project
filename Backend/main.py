from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import uuid

app = FastAPI()

# ✅ Allow frontend (React) to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Test route
@app.get("/")
def home():
    return {"message": "Backend is running"}

# ✅ PDF extraction route
@app.post("/extract")
async def extract_pdf(file: UploadFile = File(...)):

    pdf_bytes = await file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    pages_output = []

    for page_index in range(len(doc)):
        page = doc[page_index]

        # Extract text blocks with positions
        blocks = page.get_text("blocks")

        regions = []

        for b in blocks:
            x1, y1, x2, y2, text, *_ = b

            regions.append({
                "id": str(uuid.uuid4()),
                "label": "paragraph",
                "bbox": [x1, y1, x2, y2],  # bounding box
                "text": text.strip(),
                "confidence": 0.9
            })

        pages_output.append({
            "page": page_index + 1,
            "regions": regions
        })

    return {"pages": pages_output}
