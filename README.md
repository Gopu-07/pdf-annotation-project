# 📄 PDF Extraction & Annotation Pipeline

A full-stack system for extracting structured regions from PDFs and enabling human review through an interactive dashboard.

This project consists of:

* 🧠 **FastAPI Backend** — Extracts text regions with bounding boxes from PDFs
* 🖥️ **React Frontend** — Visual dashboard to review and correct extracted regions
* 📦 **Sample Data** — PDFs for testing the full pipeline

---

## 🚀 Features

### Backend (FastAPI)

* Upload PDF files
* Detect text regions with bounding boxes
* Extract text from each region
* Return structured JSON output
* Supports multi-page documents

### Frontend (React)

* Render PDF pages
* Overlay bounding boxes on detected regions
* Click to select regions
* Side panel for reviewing extracted text
* Edit text and labels
* Highlight low-confidence regions

---

## 🏗️ Project Structure

```
pdf-annotation-project/
 ├── Backend/
 │    ├── main.py
 │    └── requirements.txt
 │
 ├── Frontend/
 │    ├── package.json
 │    ├── public/
 │    └── src/
```

---

## ⚙️ Setup Instructions

### 🔧 Backend Setup (FastAPI)

1. Navigate to backend folder:

```
cd Backend
```

2. Install dependencies:

```
pip install -r requirements.txt
```

3. Run the server:

```
python3 -m uvicorn main:app --reload
```

Backend will start at:

```
http://127.0.0.1:8000
```

---

### 🖥️ Frontend Setup (React)

1. Navigate to frontend folder:

```
cd Frontend
```

2. Install dependencies:

```
npm install
```

3. Start the React app:

```
npm start
```

Frontend will open at:

```
http://localhost:3000
```

---

## 📤 API Endpoint

### POST `/extract`

Upload a PDF file and receive extracted regions.

**Request:**
Multipart form-data with file field:

```
file: <PDF file>
```

**Response Example:**

```json
{
  "pages": [
    {
      "page": 1,
      "regions": [
        {
          "bbox": [x1, y1, x2, y2],
          "text": "Sample text",
          "label": "paragraph",
          "confidence": 0.92
        }
      ]
    }
  ]
}
```

---

## 🧪 Sample Data

Sample PDFs are included in the `sample-data` folder to test the pipeline end-to-end.

---

## 🖱️ Dashboard Usage

1. Upload a PDF from the frontend
2. View detected regions on each page
3. Click a bounding box to inspect details
4. Edit extracted text or label
5. Flag incorrect regions for review

---

## 🛠️ Technologies Used

### Backend

* FastAPI
* PyMuPDF (fitz)
* Uvicorn

### Frontend

* React
* Axios
* PDF rendering libraries

---

## 🎯 Evaluation Goals

This project demonstrates:

* Automated PDF content extraction
* Structured data generation
* Human-in-the-loop validation workflow
* Fast and intuitive annotation UI

---

## 📌 Notes

* Bounding boxes are generated using text block detection.
* Confidence values are simulated for demonstration.
* The system can be extended with ML-based layout models.

---

## 👤 Author

**Padmalochan Sahu**

---

## 📜 License

For evaluation purposes only.
