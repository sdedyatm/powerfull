const GAS_URL = "https://script.google.com/macros/s/AKfycbyQaBZGoUYSHiOgUTGP4hVJabErUkhUDRCuOYwikN82kuHr1JhF8cdF3p4IkSQpXxxWhg/exec";

// IndexedDB
const db = new Dexie("ATM_DB");
db.version(1).stores({
  shard: "id"
});

// Web Worker
const worker = new Worker("worker-search.js");

worker.onmessage = e => {
  const res = e.data;
  if (!res.length || !res[0].result.length) {
    hasil.innerHTML = "<div class='p-4 text-center text-muted'>Tidak ditemukan</div>";
    return;
  }
  renderTable(res[0].result.map(r => r.doc.rowArray));
};

async function syncData() {
  status.innerText = "🔄 Sinkronisasi...";
  const v = await fetch(`${GAS_URL}?action=version`).then(r => r.json());
  const local = localStorage.getItem("db_version");

  if (v.version === local) {
    status.innerText = "✅ Data terbaru";
    return;
  }

  await db.shard.clear();
  worker.postMessage({ type: "CLEAR" });

  let chunk = 0;
  while (true) {
    const res = await fetch(`${GAS_URL}?action=chunk&chunk=${chunk}`);
    const json = await res.json();

    await db.shard.bulkPut(json.data);
    worker.postMessage({ type: "ADD", payload: json.data });

    if (json.done) break;
    chunk++;
  }

  localStorage.setItem("db_version", v.version);
  status.innerText = "🚀 Sinkron selesai";
}

function cepatCari(val) {
  if (!val || val.length < 2) {
    hasil.innerHTML = "";
    return;
  }
  worker.postMessage({ type: "SEARCH", payload: val });
}

function renderTable(rows) {
  let html = `<table class="table table-sm table-striped text-center" style="font-size:12px"><tbody>`;
  rows.forEach(r => {
    html += "<tr>";
    r.forEach(c => html += `<td>${c || ""}</td>`);
    html += "</tr>";
  });
  html += "</tbody></table>";
  hasil.innerHTML = html;
}

window.onload = async () => {
  const local = await db.shard.toArray();
  if (local.length) {
    worker.postMessage({ type: "ADD", payload: local });
    status.innerText = "⚡ Data lokal siap";
  }
  syncData();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }

  if ("SyncManager" in window) {
    navigator.serviceWorker.ready.then(sw =>
      sw.sync.register("atm-bg-sync")
    );
  }
};
