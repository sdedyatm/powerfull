// worker.js
importScripts(
  "https://cdn.jsdelivr.net/gh/nextapps-de/flexsearch@0.7.31/dist/flexsearch.bundle.js"
);

// Inisialisasi index di dalam worker
const index = new FlexSearch.Document({
  document: {
    id: "id",
    index: ["search_blob"],
    store: ["rowArray"]
  },
  tokenize: "forward",
  cache: true
});

self.onmessage = (e) => {
  const { type, payload } = e.data;

  if (type === "ADD") {
    // Tambahkan data ke index worker
    payload.forEach((d) => index.add(d));
    self.postMessage({ type: "STATUS", msg: "Data diindex oleh Worker" });
  }

  if (type === "CLEAR") {
    index.clear();
  }

  if (type === "SEARCH") {
    // Limit hasil ke 50-100 agar transfer data ke Main Thread tidak LAG
    const res = index.search(payload, {
      enrich: true,
      limit: 5000
    });

    // Kirim hasil kembali ke Main Thread
    self.postMessage({ type: "RESULTS", data: res });
  }
};
