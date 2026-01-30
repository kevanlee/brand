const stepButtons = document.querySelectorAll("[data-step]");
const navLinks = document.querySelectorAll(".nav-link");
const buildButton = document.getElementById("build-database");
const exportButton = document.getElementById("export-csv");
const fileInputs = document.querySelectorAll(".upload-box input");
const matchBody = document.getElementById("matches-body");
const overlapRate = document.getElementById("overlap-rate");
const overlapCount = document.getElementById("overlap-count");
const revenueInfluenced = document.getElementById("revenue-influenced");
const topCustomer = document.getElementById("top-customer");
const topCustomerDetail = document.getElementById("top-customer-detail");
const revenueByStage = document.getElementById("revenue-by-stage");

const state = {
  audienceRows: [],
  crmRows: [],
  audienceHeaders: [],
  crmHeaders: [],
  matches: [],
  audienceMatchedCount: 0,
  companyRevenueTotal: 0,
  matchedCompanyCount: 0,
  crmCompanyCount: 0,
  stageRevenueTotals: {},
};

stepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.step);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth" });
  });
});

const setActiveNav = (sectionId) => {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.section === sectionId);
  });
};

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
  label.classList.add("is-uploaded");
  const cardButton = input.closest(".upload-card")?.querySelector(".secondary-button");
  if (cardButton) {
    cardButton.classList.add("is-active");
    cardButton.textContent = "Uploaded ✓";
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
    companyName: ["company", "account", "organization", "company name"],
    companyUrl: ["website", "url", "domain", "company website", "company url"],
    stage: ["stage", "lifecycle", "pipeline"],
    acv: ["acv", "arr", "revenue", "amount", "deal value"],
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

const extractDomain = (email) => {
  if (!email || !email.includes("@")) return "";
  return email.split("@")[1].toLowerCase().trim();
};

const normalizeWebsiteDomain = (value) => {
  if (!value) return "";
  const cleaned = value
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .trim();
  return cleaned;
};

const updateDashboard = () => {
  if (state.matches.length === 0) {
    matchBody.innerHTML =
      '<tr><td colspan="5">No matches yet. Upload data and build the database.</td></tr>';
    overlapRate.textContent = "--";
    overlapCount.textContent = "Upload data to see overlap";
    revenueInfluenced.textContent = "--";
    topCustomer.textContent = "--";
    topCustomerDetail.textContent = "Awaiting audience data";
    revenueByStage.querySelectorAll("strong").forEach((node) => {
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
      <td>${formatCurrency(match.acv)}</td>
      <td>${match.engagement || "--"}</td>
    `;
    matchBody.appendChild(row);
  });

  // Overlap rate: matched company domains / total CRM company domains.
  const overlap = state.matchedCompanyCount || 0;
  const totalCompanies = state.crmCompanyCount || 1;
  overlapRate.textContent = `${Math.round((overlap / totalCompanies) * 100)}%`;
  overlapCount.textContent = `${overlap.toLocaleString()} of ${totalCompanies.toLocaleString()} companies overlap`;

  // Revenue influenced: sum of ACV for matched CRM company domains.
  revenueInfluenced.textContent = formatCurrency(state.companyRevenueTotal);

  // Top customer: company name with the most matched subscribers.
  const topCompanyCounts = state.matches.reduce((acc, match) => {
    const key = match.company || "Unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const [topCompanyName, topCompanyCount] = Object.entries(topCompanyCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  topCustomer.textContent = topCompanyName;
  topCustomerDetail.textContent = `${topCompanyCount} subscribers in this company`;

  // Revenue influenced by stage: sum ACV per lifecycle stage for matched companies.
  const stageTotals = state.stageRevenueTotals;
  revenueByStage.querySelectorAll("li").forEach((item) => {
    const label = item.querySelector("span")?.textContent || "Unspecified";
    const value = stageTotals[label] ?? 0;
    const strong = item.querySelector("strong");
    if (strong) {
      strong.textContent = formatCurrency(value);
    }
  });
};

const buildMatches = () => {
  const mapping = getMapping();
  const audienceEmailField = mapping.audience.email;
  state.stageRevenueTotals = {};
  state.companyRevenueTotal = 0;
  state.matchedCompanyCount = 0;
  state.crmCompanyCount = 0;
  if (
    !audienceEmailField ||
    !mapping.crm.companyUrl ||
    !mapping.crm.acv ||
    !mapping.crm.stage ||
    !mapping.crm.companyName
  ) {
    matchBody.innerHTML =
      '<tr><td colspan="5">Select required columns for audience email and CRM company name, URL, stage, and ACV fields.</td></tr>';
    return;
  }

  const audienceDomainIndex = new Map();
  state.audienceRows.forEach((row) => {
    const email = row[audienceEmailField]?.toLowerCase();
    if (!email) return;
    const domain = extractDomain(email);
    const entry = { ...row, __domain: domain };
    if (domain && !audienceDomainIndex.has(domain)) {
      audienceDomainIndex.set(domain, []);
    }
    if (domain) {
      audienceDomainIndex.get(domain).push(entry);
    }
  });

  state.matches = [];
  const matchedDomains = new Set();
  const matchedCompanyRevenue = new Map();
  const crmDomains = new Set();
  state.crmRows.forEach((row) => {
    const websiteDomain = normalizeWebsiteDomain(row[mapping.crm.companyUrl]);
    if (websiteDomain) {
      crmDomains.add(websiteDomain);
    }
    if (!websiteDomain || !audienceDomainIndex.has(websiteDomain)) return;
    matchedDomains.add(websiteDomain);
    if (!matchedCompanyRevenue.has(websiteDomain)) {
      const revenueValue = row[mapping.crm.acv];
      matchedCompanyRevenue.set(websiteDomain, {
        company: row[mapping.crm.companyName],
        acv: revenueValue,
        stage: row[mapping.crm.stage],
      });
    }
    const audienceEntries = audienceDomainIndex.get(websiteDomain);
    audienceEntries.forEach((audience) => {
      state.matches.push({
        email: audience[audienceEmailField],
        name: audience[mapping.audience.name] || audience[mapping.audience.email],
        engagement: audience[mapping.audience.engagement],
        source: audience[mapping.audience.source],
        company: row[mapping.crm.companyName],
        stage: row[mapping.crm.stage],
        acv: row[mapping.crm.acv],
      });
    });
  });

  const audienceMatchedCount = state.audienceRows.filter((row) => {
    const email = row[audienceEmailField]?.toLowerCase();
    const domain = extractDomain(email);
    return domain && matchedDomains.has(domain);
  }).length;
  state.audienceMatchedCount = audienceMatchedCount;
  state.matchedCompanyCount = matchedDomains.size;
  state.crmCompanyCount = crmDomains.size;
  state.companyRevenueTotal = Array.from(matchedCompanyRevenue.values()).reduce((sum, entry) => {
    const numeric = Number(String(entry.acv).replace(/[^\d.-]/g, ""));
    return sum + (Number.isNaN(numeric) ? 0 : numeric);
  }, 0);
  state.stageRevenueTotals = Array.from(matchedCompanyRevenue.values()).reduce((acc, entry) => {
    const key = entry.stage || "Unspecified";
    const numeric = Number(String(entry.acv).replace(/[^\d.-]/g, ""));
    acc[key] = (acc[key] ?? 0) + (Number.isNaN(numeric) ? 0 : numeric);
    return acc;
  }, {});

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
    const header = ["Contact", "Company", "Stage", "ACV", "Engagement"];
    const rows = state.matches.map((match) => [
      match.name || match.email,
      match.company || "",
      match.stage || "",
      match.acv || "",
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

const sections = document.querySelectorAll("main section[id]");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveNav(entry.target.id);
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);

sections.forEach((section) => observer.observe(section));

setActiveNav("landing");
