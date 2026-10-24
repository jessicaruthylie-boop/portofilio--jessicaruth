/* ==========================================
   JESSICA.DEV - EDUCATION SIDE PANEL
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const root = document.getElementById("academic-universe");

  if (!root) {
    console.error("Academic Universe tidak ditemukan.");
    return;
  }

  const buttons = root.querySelectorAll(".au2-choice[data-au2]");
  const info = document.getElementById("au2-info");

  if (!info) {
    console.error("Panel informasi Education tidak ditemukan.");
    return;
  }

  const empty = info.querySelector(".au2-info-empty");
  const content = info.querySelector(".au2-info-content");

  const category = document.getElementById("au2-info-category");
  const name = document.getElementById("au2-info-name");
  const program = document.getElementById("au2-info-program");
  const stats = document.getElementById("au2-info-stats");
  const frame = document.getElementById("au2-info-map-frame");
  const mapLink = document.getElementById("au2-info-map-link");
  const closeButton = document.getElementById("au2-info-close");

  if (
    !buttons.length ||
    !empty ||
    !content ||
    !category ||
    !name ||
    !program ||
    !stats ||
    !frame ||
    !mapLink ||
    !closeButton
  ) {
    console.error("Ada elemen HTML Education yang belum lengkap.");
    return;
  }

  // Data pendidikan
  const schools = {
    methodist: {
      category: "01 / HIGH SCHOOL",
      name: "SMAS Methodist 5 Medan",
      program: "Matematika & Ilmu Pengetahuan Alam",
      details: [
        ["LEVEL", "SMA"],
        ["MAJOR", "MIPA"],
        ["LOCATION", "Medan"],
      ],
      mapQuery: "SMAS Methodist 5 Medan",
    },

    del: {
      category: "02 / UNIVERSITY",
      name: "Institut Teknologi Del",
      program: "D3 Teknologi Komputer",
      details: [
        ["DEGREE", "Diploma III"],
        ["SEMESTER", "05"],
        ["IPK", "3.02 / 4.00"],
      ],
      mapQuery: "Institut Teknologi Del",
    },
  };

  // Menampilkan informasi pendidikan
  function showEducation(key) {
    const data = schools[key];

    if (!data) {
      console.error("Data pendidikan tidak ditemukan:", key);
      return;
    }

    category.textContent = data.category;
    name.textContent = data.name;
    program.textContent = data.program;

    // Hapus data sebelumnya
    stats.replaceChildren();

    // Tambahkan informasi pendidikan
    data.details.forEach(([label, value]) => {
      const item = document.createElement("div");

      const labelElement = document.createElement("span");
      labelElement.className = "au2-info-stat-label";
      labelElement.textContent = label;

      const valueElement = document.createElement("strong");
      valueElement.className = "au2-info-stat-value";
      valueElement.textContent = value;

      item.append(labelElement, valueElement);
      stats.appendChild(item);
    });

    // Google Maps
    const query = encodeURIComponent(data.mapQuery);

    const embedUrl =
      "https://maps.google.com/maps?q=" + query + "&output=embed";

    const externalUrl =
      "https://www.google.com/maps/search/?api=1&query=" + query;

    frame.src = embedUrl;
    mapLink.href = externalUrl;

    // Tampilkan panel informasi
    empty.hidden = true;
    content.hidden = false;

    // Hentikan orbit sementara
    root.classList.add("has-selection");

    // Tandai institusi aktif
    buttons.forEach((button) => {
      const isSelected = button.dataset.au2 === key;

      button.setAttribute("aria-pressed", String(isSelected));
    });

    console.log("Education dibuka:", data.name);
  }

  // Mengembalikan tampilan awal
  function resetEducation() {
    content.hidden = true;
    empty.hidden = false;

    frame.removeAttribute("src");

    root.classList.remove("has-selection");

    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", "false");
    });

    console.log("Education ditutup.");
  }

  // Klik langsung pada institusi di orbit
  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      const selectedSchool = button.dataset.au2;

      showEducation(selectedSchool);
    });
  });

  // Menutup panel informasi
  closeButton.addEventListener("click", resetEducation);

  console.log("Academic Universe siap diklik.");
});
