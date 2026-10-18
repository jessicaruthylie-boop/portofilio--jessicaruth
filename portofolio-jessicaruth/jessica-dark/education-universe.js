/* ====================================
   ACADEMIC UNIVERSE INTERACTIONS
   ==================================== */

(() => {
  const modal = document.getElementById("au2-modal");
  const closeBtn = document.getElementById("au2-modal-close");
  const map = document.getElementById("au2-map");
  const mapLink = document.getElementById("au2-map-link");
  const stats = document.getElementById("au2-modal-stats");

  if (!modal || !closeBtn || !map || !mapLink || !stats) {
    return;
  }

  // Academic information
  const records = {
    methodist: {
      type: "EDUCATION / 01 — HIGH SCHOOL",
      name: "SMAS Methodist 5 Medan",
      program: "Matematika & Ilmu Pengetahuan Alam",
      details: [
        ["LEVEL", "Sekolah Menengah"],
        ["MAJOR", "MIPA"],
        ["CITY", "Medan"],
      ],
      query: "SMAS Methodist 5 Medan",
    },

    del: {
      type: "EDUCATION / 02 — UNIVERSITY",
      name: "Institut Teknologi Del",
      program: "D3 Teknologi Komputer",
      details: [
        ["DEGREE", "Diploma III"],
        ["SEMESTER", "05"],
        ["IPK", "3.02 / 4.00"],
      ],
      query: "Institut Teknologi Del",
    },
  };

  let trigger = null;

  // Handle institution click
  document.querySelectorAll("[data-au2]").forEach((button) => {
    button.addEventListener("click", () => {
      const data = records[button.dataset.au2];

      if (!data) return;

      trigger = button;

      document.getElementById("au2-modal-type").textContent = data.type;

      document.getElementById("au2-modal-name").textContent = data.name;

      document.getElementById("au2-modal-program").textContent = data.program;

      // Academic details
      stats.replaceChildren();

      data.details.forEach(([label, value]) => {
        const block = document.createElement("div");

        const heading = document.createElement("span");

        const content = document.createElement("strong");

        heading.className = "au2-stat-label";
        content.className = "au2-stat-value";

        heading.textContent = label;
        content.textContent = value;

        block.append(heading, content);
        stats.append(block);
      });

      // Google Maps
      const query = encodeURIComponent(data.query);

      map.src = "https://maps.google.com/maps?q=" + query + "&output=embed";

      mapLink.href =
        "https://www.google.com/maps/search/" + "?api=1&query=" + query;

      // Open modal
      if (!modal.open) {
        modal.showModal();
      }

      closeBtn.focus();
    });
  });

  // Close button
  closeBtn.addEventListener("click", () => {
    modal.close();
  });

  // Click outside popup
  modal.addEventListener("click", (event) => {
    if (event.target !== modal) return;

    const box = modal.getBoundingClientRect();

    const outside =
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom;

    if (outside) {
      modal.close();
    }
  });

  // Clean up after closing
  modal.addEventListener("close", () => {
    map.removeAttribute("src");

    if (trigger && trigger.isConnected) {
      trigger.focus({ preventScroll: true });
    }
  });
})();
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    showInfo(button.dataset.au2);
  });
});
<script src="education-side-panel.js" defer></script>;
