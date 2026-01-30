const stepButtons = document.querySelectorAll("[data-step]");
const buildButton = document.getElementById("build-database");
const exportButton = document.getElementById("export-csv");
const fileInputs = document.querySelectorAll(".upload-box input");
const matchBody = document.getElementById("matches-body");
const overlapRate = document.getElementById("overlap-rate");
const overlapCount = document.getElementById("overlap-count");
const revenueInfluenced = document.getElementById("revenue-influenced");
const topSegment = document.getElementById("top-segment");
const topSegmentDetail = document.getElementById("top-segment-detail");
const pipelineList = document.getElementById("pipeline-by-engagement");

const state = {
  audienceRows: [],
  crmRows: [],
  audienceHeaders: [],
  crmHeaders: [],
  matches: [],
};

stepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.step);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth" });
  });
});

const normalizeHeader = (value) => value.toLowerCase().replace(/\s+/g, " ").trim();

const parseCsv = (content) => {
  const rows = [];
  let current = "";
  let inQuotes = false;
  const result = [];

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      rows.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i += 1;
      }
      rows.push(current);
      result.push(rows.splice(0));
      current = "";
      continue;
    }

    current += char;
  }

  rows.push(current);
  result.push(rows);

  const cleaned = result
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row) => row.map((cell) => cell.trim()));

  return cleaned;
};

const buildRows = (headers, rawRows) =>
  rawRows.map((row) =>
    headers.reduce((acc, header, index) => {
      acc[header] = row[index] ?? "";
      return acc;
    }, {})
  );

const updateUploadLabel = (input) => {
  const label = input.closest(".upload-box");
  const fileName = input.files?.[0]?.name;
  if (!label || !fileName) return;
  const small = label.querySelector("small");
  if (small) {
    small.textContent = `Selected: ${fileName}`;
  }
};

const setMappingOptions = (source, headers) => {
  document.querySelectorAll(`select[data-source="${source}"]`).forEach((select) => {
    const currentValue = select.value;
    select.innerHTML = '<option value="">Select column</option>';
    headers.forEach((header) => {
      const option = document.createElement("option");
      option.value = header;
      option.textContent = header;
      select.appendChild(option);
    });

    if (currentValue && headers.includes(currentValue)) {
      select.value = currentValue;
    } else {
      const guess = guessDefault(select.dataset.field, headers);
      if (guess) select.value = guess;
    }
  });
};

const guessDefault = (field, headers) => {
  const normalized = headers.map((header) => [header, normalizeHeader(header)]);
  const matches = {
    email: ["email", "e-mail", "primary email"],
    name: ["name", "subscriber name", "contact"],
    engagement: ["engagement", "last opened", "last open", "opens", "clicks"],
    source: ["utm", "source", "campaign"],
    company: ["company", "account", "organization"],
    stage: ["stage", "lifecycle", "pipeline"],
    revenue: ["arr", "revenue", "amount", "deal value"],
    closeDate: ["close", "closed", "won", "date"],
  };

  const targets = matches[field] ?? [];
  for (const [header, normalizedHeader] of normalized) {
    if (targets.some((target) => normalizedHeader.includes(target))) {
      return header;
    }
  }
  return "";
};

const getMapping = () => {
  const mapping = { audience: {}, crm: {} };
  document.querySelectorAll("select[data-source]").forEach((select) => {
    const source = select.dataset.source;
    const field = select.dataset.field;
    mapping[source][field] = select.value;
  });
  return mapping;
};

const formatCurrency = (value) => {
  if (!value) return "$0";
  const numeric = Number(String(value).replace(/[^\d.-]/g, ""));
  if (Number.isNaN(numeric)) return "$0";
  return numeric.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

const updateDashboard = () => {
  if (state.matches.length === 0) {
    matchBody.innerHTML =
      '<tr><td colspan="5">No matches yet. Upload data and build the database.</td></tr>';
    overlapRate.textContent = "--";
    overlapCount.textContent = "Upload data to see overlap";
    revenueInfluenced.textContent = "--";
    topSegment.textContent = "--";
    topSegmentDetail.textContent = "Awaiting audience data";
    pipelineList.querySelectorAll("strong").forEach((node) => {
      node.textContent = "--";
    });
    return;
  }

  matchBody.innerHTML = "";
  state.matches.slice(0, 10).forEach((match) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${match.name || match.email}</td>
      <td>${match.company || "--"}</td>
      <td>${match.stage || "--"}</td>
      <td>${formatCurrency(match.revenue)}</td>
      <td>${match.engagement || "--"}</td>
    `;
    matchBody.appendChild(row);
  });

  const overlap = state.matches.length;
  const audienceTotal = state.audienceRows.length || 1;
  overlapRate.textContent = `${Math.round((overlap / audienceTotal) * 100)}%`;
  overlapCount.textContent = `${overlap.toLocaleString()} newsletter readers already in CRM`;

  const totalRevenue = state.matches.reduce((sum, match) => {
    const numeric = Number(String(match.revenue).replace(/[^\d.-]/g, ""));
    return sum + (Number.isNaN(numeric) ? 0 : numeric);
  }, 0);
  revenueInfluenced.textContent = formatCurrency(totalRevenue);

  const topSource = state.matches.reduce((acc, match) => {
    const key = match.source || "Direct";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const [topSourceName, topSourceCount] = Object.entries(topSource).sort(
    (a, b) => b[1] - a[1]
  )[0];

  topSegment.textContent = topSourceName;
  topSegmentDetail.textContent = `${topSourceCount} matches driven by this source`;

  const buckets = {
    High: 0,
    Medium: 0,
    Low: 0,
  };

  state.matches.forEach((match) => {
    const engagement = String(match.engagement || "").toLowerCase();
    let bucket = "Low";
    if (engagement.includes("high") || engagement.includes("open") || engagement.includes("click")) {
      bucket = "High";
    } else if (engagement.includes("medium")) {
      bucket = "Medium";
    }
    const numeric = Number(String(match.revenue).replace(/[^\d.-]/g, ""));
    buckets[bucket] += Number.isNaN(numeric) ? 0 : numeric;
  });

  const bucketValues = pipelineList.querySelectorAll("strong");
  ["High", "Medium", "Low"].forEach((key, index) => {
    if (bucketValues[index]) {
      bucketValues[index].textContent = formatCurrency(buckets[key]);
    }
  });
};

const buildMatches = () => {
  const mapping = getMapping();
  const audienceEmailField = mapping.audience.email;
  const crmEmailField = mapping.crm.email;

  if (
    !audienceEmailField ||
    !crmEmailField ||
    !mapping.crm.revenue ||
    !mapping.crm.stage ||
    !mapping.crm.company
  ) {
    matchBody.innerHTML =
      '<tr><td colspan="5">Select required columns for audience email and CRM fields.</td></tr>';
    return;
  }

  const audienceIndex = new Map();
  state.audienceRows.forEach((row) => {
    const email = row[audienceEmailField]?.toLowerCase();
    if (email) audienceIndex.set(email, row);
  });

  state.matches = [];
  state.crmRows.forEach((row) => {
    const email = row[crmEmailField]?.toLowerCase();
    if (!email || !audienceIndex.has(email)) return;
    const audience = audienceIndex.get(email);
    state.matches.push({
      email,
      name: audience[mapping.audience.name] || audience[mapping.audience.email],
      engagement: audience[mapping.audience.engagement],
      source: audience[mapping.audience.source],
      company: row[mapping.crm.company],
      stage: row[mapping.crm.stage],
      revenue: row[mapping.crm.revenue],
    });
  });

  updateDashboard();
};

fileInputs.forEach((input) => {
  input.addEventListener("change", async () => {
    updateUploadLabel(input);
    const file = input.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = parseCsv(text);
    const headers = parsed[0] ?? [];
    const rows = parsed.slice(1);

    if (input.closest(".upload-card")?.textContent.includes("Newsletter")) {
      state.audienceHeaders = headers;
      state.audienceRows = buildRows(headers, rows);
      setMappingOptions("audience", headers);
    } else {
      state.crmHeaders = headers;
      state.crmRows = buildRows(headers, rows);
      setMappingOptions("crm", headers);
    }
  });
});

if (buildButton) {
  buildButton.addEventListener("click", () => {
    buildMatches();
  });
}

if (exportButton) {
  exportButton.addEventListener("click", () => {
    if (state.matches.length === 0) return;
    const header = ["Contact", "Company", "Stage", "ARR", "Engagement"];
    const rows = state.matches.map((match) => [
      match.name || match.email,
      match.company || "",
      match.stage || "",
      match.revenue || "",
      match.engagement || "",
    ]);
    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "audience-revenue-matches.csv";
    link.click();
    URL.revokeObjectURL(url);
  });
}

updateDashboard();
