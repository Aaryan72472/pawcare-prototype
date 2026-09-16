// ---------- Shared service data ----------
const services = [
  {
    id: 1,
    name: "Sunrise Veterinary Clinic",
    category: "Vet",
    distanceKm: 1.2,
    openNow: true,
    emergency: true,
    hours: "Mon–Sat, 9:00 AM – 9:00 PM · Sun, 10:00 AM – 4:00 PM",
    phone: "+91 98765 43210",
    address: "12 MG Road, Bhopal",
    about: "General veterinary clinic with an in-house pharmacy and diagnostic lab, handling everything from routine checkups to minor surgery."
  },
  {
    id: 2,
    name: "Paws & Claws Rescue NGO",
    category: "NGO",
    distanceKm: 2.4,
    openNow: false,
    emergency: false,
    hours: "Mon–Fri, 10:00 AM – 6:00 PM",
    phone: "+91 91234 56780",
    address: "Shivaji Nagar, Bhopal",
    about: "Volunteer-run rescue network for stray and injured animals, coordinating foster care and adoption across the city."
  },
  {
    id: 3,
    name: "CityVet Ambulance Service",
    category: "Ambulance",
    distanceKm: 0.8,
    openNow: true,
    emergency: true,
    hours: "Open 24 hours",
    phone: "+91 99887 66554",
    address: "Arera Colony, Bhopal",
    about: "24-hour animal ambulance staffed by trained handlers, covering the greater Bhopal area for urgent transport."
  },
  {
    id: 4,
    name: "Green Valley Boarding House",
    category: "Boarding",
    distanceKm: 3.6,
    openNow: true,
    emergency: false,
    hours: "Daily, 7:00 AM – 8:00 PM",
    phone: "+91 90909 09090",
    address: "Kolar Road, Bhopal",
    about: "Short and long-stay boarding for dogs and cats, with daily walks and a resident vet on call."
  },
  {
    id: 5,
    name: "Meera Joshi — Independent Rescuer",
    category: "Rescuer",
    distanceKm: 1.9,
    openNow: true,
    emergency: true,
    hours: "On call, 8:00 AM – 11:00 PM",
    phone: "+91 93333 22110",
    address: "Near New Market, Bhopal",
    about: "Independent rescuer specialising in street-animal first response and safe capture for injured strays."
  },
  {
    id: 6,
    name: "Hopewell Animal Clinic",
    category: "Clinic",
    distanceKm: 4.1,
    openNow: false,
    emergency: false,
    hours: "Mon–Sat, 11:00 AM – 7:00 PM",
    phone: "+91 95555 44332",
    address: "Bittan Market, Bhopal",
    about: "Multi-specialty animal clinic offering vaccination, dental care and diagnostic imaging."
  }
];

// ---------- Helpers ----------
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function statusBadge(service) {
  return service.openNow
    ? `<span class="status status--open">Open now</span>`
    : `<span class="status status--closed">Closed</span>`;
}

function categoryTag(category) {
  return `<span class="tag">${category}</span>`;
}

// ---------- Home page: search + category pills ----------
function initHome() {
  const form = document.getElementById("home-search-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = document.getElementById("home-location").value.trim();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    window.location.href = "search-results.html?" + params.toString();
  });

  document.querySelectorAll("[data-category]").forEach((pill) => {
    pill.addEventListener("click", () => {
      const category = pill.getAttribute("data-category");
      window.location.href = "search-results.html?category=" + encodeURIComponent(category);
    });
  });
}

// ---------- Search results page ----------
function initSearchResults() {
  const list = document.getElementById("results-list");
  if (!list) return;

  const categoryCheckboxes = document.querySelectorAll("[data-filter-category]");
  const openNowCheckbox = document.getElementById("filter-open-now");
  const emergencyCheckbox = document.getElementById("filter-emergency");
  const distanceSelect = document.getElementById("filter-distance");
  const searchInput = document.getElementById("results-search");
  const resultCount = document.getElementById("result-count");
  const searchLabel = document.getElementById("search-label");

  // Pre-fill from query params
  const initialQuery = getParam("q") || "";
  const initialCategory = getParam("category");
  const initialEmergency = getParam("emergency");

  searchInput.value = initialQuery;
  searchLabel.textContent = initialQuery ? `“${initialQuery}”` : "your area";

  if (initialCategory) {
    categoryCheckboxes.forEach((cb) => {
      if (cb.value === initialCategory) cb.checked = true;
    });
  }
  if (initialEmergency) {
    emergencyCheckbox.checked = true;
  }

  function render() {
    const checkedCategories = Array.from(categoryCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
    const wantOpenNow = openNowCheckbox.checked;
    const wantEmergency = emergencyCheckbox.checked;
    const maxDistance = parseFloat(distanceSelect.value);
    const query = searchInput.value.trim().toLowerCase();

    const filtered = services.filter((s) => {
      if (checkedCategories.length && !checkedCategories.includes(s.category)) return false;
      if (wantOpenNow && !s.openNow) return false;
      if (wantEmergency && !s.emergency) return false;
      if (!isNaN(maxDistance) && s.distanceKm > maxDistance) return false;
      if (query && !s.name.toLowerCase().includes(query) && !s.category.toLowerCase().includes(query)) return false;
      return true;
    });

    resultCount.textContent = filtered.length;

    if (filtered.length === 0) {
      list.innerHTML = `<li class="empty-state">
        <p>No matches yet.</p>
        <p>Try widening the distance or clearing a filter.</p>
      </li>`;
      return;
    }

    list.innerHTML = filtered
      .map(
        (s) => `
      <li class="result-row" data-id="${s.id}">
        <div class="result-row__main">
          <p class="result-row__name">${s.name}</p>
          <p class="result-row__meta">
            ${categoryTag(s.category)}
            <span class="dot">·</span>
            ${s.distanceKm} km away
            <span class="dot">·</span>
            ${statusBadge(s)}
          </p>
          ${s.emergency ? '<p class="result-row__emergency">Emergency capable</p>' : ""}
        </div>
        <span class="result-row__arrow" aria-hidden="true">&#8594;</span>
      </li>`
      )
      .join("");

    list.querySelectorAll(".result-row").forEach((row) => {
      row.addEventListener("click", () => {
        window.location.href = "service-details.html?id=" + row.getAttribute("data-id");
      });
    });
  }

  [openNowCheckbox, emergencyCheckbox, distanceSelect, searchInput].forEach((el) =>
    el.addEventListener("input", render)
  );
  categoryCheckboxes.forEach((cb) => cb.addEventListener("change", render));

  render();
}

// ---------- Service details page ----------
function initServiceDetails() {
  const root = document.getElementById("service-detail-root");
  if (!root) return;

  const id = parseInt(getParam("id"), 10);
  const service = services.find((s) => s.id === id) || services[0];

  document.title = service.name + " · PawCare";

  root.innerHTML = `
    <p class="tag-row">
      ${categoryTag(service.category)}
      ${service.emergency ? '<span class="tag tag--emergency">Emergency capable</span>' : ""}
    </p>
    <h1>${service.name}</h1>
    <p class="detail-meta">${service.distanceKm} km away <span class="dot">·</span> ${statusBadge(service)}</p>

    <div class="detail-actions">
      <a class="btn btn--primary" href="tel:${service.phone.replace(/\s/g, "")}">Call ${service.phone}</a>
      <a class="btn btn--ghost" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        service.address
      )}" target="_blank" rel="noopener">Get directions</a>
    </div>

    <section class="detail-section">
      <h2>About</h2>
      <p>${service.about}</p>
    </section>

    <section class="detail-section">
      <h2>Hours</h2>
      <p>${service.hours}</p>
    </section>

    <section class="detail-section">
      <h2>Contact &amp; location</h2>
      <p>${service.phone}<br>${service.address}</p>
    </section>
  `;
}

// ---------- AI Assistant page ----------
function initAiAssistant() {
  const button = document.getElementById("analyze-btn");
  if (!button) return;

  const fileInput = document.getElementById("report-upload");
  const fileLabel = document.getElementById("upload-filename");
  const resultBox = document.getElementById("ai-result");
  const loadingBox = document.getElementById("ai-loading");

  fileInput.addEventListener("change", () => {
    fileLabel.textContent = fileInput.files.length
      ? fileInput.files[0].name
      : "No file selected";
  });

  button.addEventListener("click", () => {
    resultBox.hidden = true;
    loadingBox.hidden = false;

    setTimeout(() => {
      loadingBox.hidden = true;
      resultBox.hidden = false;
      if (resultBox.scrollIntoView) {
        resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 1400);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initHome();
  initSearchResults();
  initServiceDetails();
  initAiAssistant();
});
