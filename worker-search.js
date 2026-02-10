importScripts("https://cdn.jsdelivr.net/gh/nextapps-de/flexsearch@0.7.31/dist/flexsearch.bundle.js");

const index = new FlexSearch.Document({
  document: {
    id: "id",
    index: ["search_blob"],
    store: ["rowArray"]
  },
  tokenize: "forward"
});

self.onmessage = e => {
  const { type, payload } = e.data;

  if (type === "ADD") payload.forEach(d => index.add(d));
  if (type === "CLEAR") index.clear();
  if (type === "SEARCH") {
    const res = index.search(payload, { enrich: true, limit: 5000 });
    self.postMessage(res);
  }
};
