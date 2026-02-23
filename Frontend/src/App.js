import React, { useState } from "react"
import axios from "axios"

function App() {
  const [data, setData] = useState(null)
  const [selected, setSelected] = useState(null)

  const upload = async (e) => {
    const file = e.target.files[0]

    const form = new FormData()
    form.append("file", file)

    const res = await axios.post(
      "http://127.0.0.1:8000/extract",
      form
    )

    setData(res.data)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>PDF Review Tool</h2>

      <input type="file" onChange={upload} />

      {data && data.pages.map(p => (
        <div key={p.page}>
          <h3>Page {p.page}</h3>

          {p.regions.map(r => (
            <div
              key={r.id}
              style={{
                border: "1px solid #ccc",
                margin: 5,
                padding: 5,
                cursor: "pointer"
              }}
              onClick={() => setSelected(r)}
            >
              {r.text.slice(0, 100)}
            </div>
          ))}
        </div>
      ))}

      {selected && (
        <div style={{
          position: "fixed",
          right: 20,
          top: 20,
          background: "#fff",
          padding: 10,
          border: "1px solid black"
        }}>
          <h3>Edit Region</h3>

          <textarea
            rows={6}
            value={selected.text}
            onChange={(e) =>
              setSelected({ ...selected, text: e.target.value })
            }
          />

          <p>Confidence: {selected.confidence}</p>
        </div>
      )}
    </div>
  )
}

export default App
