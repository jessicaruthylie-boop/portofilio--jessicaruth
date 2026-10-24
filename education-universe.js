/* ==========================================
   JESSICA.DEV
   ACADEMIC UNIVERSE - INTERACTIVE EDUCATION
   ========================================== */

(() => {
  "use strict";

  /* ------------------------------------------
     DATA PENDIDIKAN
     ------------------------------------------ */

  const educationData = {
    methodist: {
      category: "01 / HIGH SCHOOL",
      name: "SMAS Methodist 5 Medan",
      program: "Matematika & Ilmu Pengetahuan Alam",

      details: [
        ["LEVEL", "Senior High School"],
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

  /* ------------------------------------------
     INITIALIZATION
     ------------------------------------------ */

  function initializeEducationUniverse() {
    // Main Academic Universe container
    const universe = document.getElementById("academic-universe");

    if (!universe) {
      console.warn("[Education] Academic Universe tidak ditemukan.");
      return;
    }

    // Institution buttons already inside orbit
    const institutionButtons = universe.querySelectorAll(
      ".au2-choice[data-au2]",
    );

    // Information panel
    const infoPanel = document.getElementById("au2-info");

    if (!infoPanel) {
      console.error("[Education] Panel kiri #au2-info tidak ditemukan.");
      return;
    }

    // Panel elements
    const emptyState = infoPanel.querySelector(".au2-info-empty");

    const infoContent = infoPanel.querySelector(".au2-info-content");

    const infoCategory = document.getElementById("au2-info-category");

    const infoName = document.getElementById("au2-info-name");

    const infoProgram = document.getElementById("au2-info-program");

    const infoStats = document.getElementById("au2-info-stats");

    const infoMap = document.getElementById("au2-info-map-frame");

    const infoMapLink = document.getElementById("au2-info-map-link");

    const closeButton = document.getElementById("au2-info-close");

    /* ----------------------------------------
       VALIDATE ELEMENTS
       ---------------------------------------- */

    const requiredElements = {
      institutionButtons: institutionButtons.length > 0,

      emptyState,
      infoContent,
      infoCategory,
      infoName,
      infoProgram,
      infoStats,
      infoMap,
      infoMapLink,
      closeButton,
    };

    const missingElements = Object.entries(requiredElements)
      .filter(([, element]) => !element)
      .map(([name]) => name);

    if (missingElements.length > 0) {
      console.error(
        "[Education] Elemen HTML belum lengkap:",
        missingElements.join(", "),
      );
      return;
    }

    /* ----------------------------------------
       STATE
       ---------------------------------------- */

    let activeEducation = null;

    /* ----------------------------------------
       GOOGLE MAPS
       ---------------------------------------- */

    function createMapUrls(location) {
      const query = encodeURIComponent(location);

      return {
        embed: "https://maps.google.com/maps?q=" + query + "&output=embed",

        external:
          "https://www.google.com/maps/search/" + "?api=1&query=" + query,
      };
    }

    /* ----------------------------------------
       RENDER EDUCATION DETAILS
       ---------------------------------------- */

    function renderEducationDetails(details) {
      // Clear previous details
      infoStats.replaceChildren();

      details.forEach(([label, value]) => {
        const item = document.createElement("div");
        item.className = "au2-info-stat";

        const labelElement = document.createElement("span");

        labelElement.className = "au2-info-stat-label";

        labelElement.textContent = label;

        const valueElement = document.createElement("strong");

        valueElement.className = "au2-info-stat-value";

        valueElement.textContent = value;

        item.append(labelElement, valueElement);

        infoStats.appendChild(item);
      });
    }

    /* ----------------------------------------
       UPDATE ACTIVE INSTITUTION
       ---------------------------------------- */

    function updateActiveInstitution(key) {
      institutionButtons.forEach((button) => {
        const isActive = button.dataset.au2 === key;

        button.setAttribute("aria-pressed", String(isActive));

        button.classList.toggle("is-active", isActive);
      });
    }

    /* ----------------------------------------
       SHOW EDUCATION INFORMATION
       ---------------------------------------- */

    function showEducation(key) {
      const data = educationData[key];

      if (!data) {
        console.warn("[Education] Data tidak ditemukan:", key);
        return;
      }

      // Save current selection
      activeEducation = key;

      // Update text information
      infoCategory.textContent = data.category;

      infoName.textContent = data.name;

      infoProgram.textContent = data.program;

      // Render details
      renderEducationDetails(data.details);

      // Generate Google Maps URLs
      const mapUrls = createMapUrls(data.mapQuery);

      infoMap.src = mapUrls.embed;
      infoMapLink.href = mapUrls.external;

      // Set appropriate iframe title
      infoMap.title = "Peta lokasi " + data.name;

      // Hide initial instruction
      emptyState.hidden = true;

      // Reveal academic information
      infoContent.hidden = false;

      // Pause rotating orbit
      universe.classList.add("has-selection");

      // Update selected institution
      updateActiveInstitution(key);

      // Restart panel entrance animation
      infoContent.classList.remove("is-visible");

      void infoContent.offsetWidth;

      infoContent.classList.add("is-visible");

      console.log("[Education] Menampilkan:", data.name);
    }

    /* ----------------------------------------
       RESET EDUCATION INFORMATION
       ---------------------------------------- */

    function resetEducation() {
      activeEducation = null;

      // Hide information
      infoContent.hidden = true;

      // Show initial instruction
      emptyState.hidden = false;

      // Remove Google Maps iframe
      infoMap.removeAttribute("src");

      // Resume rotating orbit
      universe.classList.remove("has-selection");

      // Reset institution state
      updateActiveInstitution(null);

      infoContent.classList.remove("is-visible");

      console.log("[Education] Panel ditutup.");
    }

    /* ----------------------------------------
       INSTITUTION CLICK EVENTS
       ---------------------------------------- */

    institutionButtons.forEach((button) => {
      button.setAttribute("aria-pressed", "false");

      button.addEventListener("click", (event) => {
        event.preventDefault();

        const selectedInstitution = button.dataset.au2;

        if (!selectedInstitution) return;

        // Toggle selected institution
        if (activeEducation === selectedInstitution) {
          resetEducation();
          return;
        }

        showEducation(selectedInstitution);
      });
    });

    /* ----------------------------------------
       CLOSE PANEL EVENT
       ---------------------------------------- */

    closeButton.addEventListener("click", () => {
      resetEducation();
    });

    /* ----------------------------------------
       KEYBOARD SUPPORT
       ---------------------------------------- */

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activeEducation !== null) {
        resetEducation();
      }
    });

    /* ----------------------------------------
       INITIAL DISPLAY
       ---------------------------------------- */

    emptyState.hidden = false;
    infoContent.hidden = true;

    infoMap.removeAttribute("src");

    universe.classList.remove("has-selection");

    console.log("[Education] Academic Universe berhasil diinisialisasi.");
  }

  /* ------------------------------------------
     RUN AFTER DOM IS READY
     ------------------------------------------ */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeEducationUniverse, {
      once: true,
    });
  } else {
    initializeEducationUniverse();
  }
})();
