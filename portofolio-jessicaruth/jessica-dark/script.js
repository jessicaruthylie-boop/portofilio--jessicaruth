"use strict";
// Isi data asli di bawah ini untuk mengaktifkan kontak. Biarkan kosong jika belum tersedia.
const CONTACTS = {
  email: { value: "", label: "" },
  github: {
    value: "https://github.com/jessicaruthylie-boop",
    label: "@jessicaruthylie-boop",
  },
  linkedin: { value: "", label: "" },
  instagram: { value: "", label: "" },
};
document.documentElement.classList.add("js");
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector("#nav-menu");
function closeMenu(returnFocus = false) {
  menu.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Buka menu");
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
});
menu
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", () => closeMenu()));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.classList.contains("open"))
    closeMenu(true);
});
const desktop = matchMedia("(min-width: 761px)");
desktop.addEventListener("change", () => closeMenu());
// Foto gagal dimuat: pertahankan placeholder tanpa ikon gambar rusak.
const photo = document.querySelector("#profile-photo");
photo.addEventListener("load", () => {
  photo.hidden = false;
  document.querySelector("#photo-fallback").hidden = true;
});
photo.addEventListener("error", () => {
  photo.hidden = true;
  document.querySelector("#photo-fallback").hidden = false;
});
if (photo.complete && photo.naturalWidth > 0) {
  photo.hidden = false;
  document.querySelector("#photo-fallback").hidden = true;
}
document.querySelector("#year").textContent = new Date().getFullYear();
// Efek mengetik; teks lengkap tetap tersedia tanpa JavaScript.
const typed = document.querySelector("#typed");
const phrase = "Computer Technology Student";
let typingTimer;
function startTyping() {
  clearTimeout(typingTimer);
  typed.textContent = phrase;
  if (motionPreference.matches) return;
  let position = phrase.length,
    deleting = true;
  function tick() {
    if (document.hidden) {
      typingTimer = setTimeout(tick, 600);
      return;
    }
    position += deleting ? -1 : 1;
    typed.textContent = phrase.slice(0, position);
    let delay = deleting ? 30 : 65;
    if (position === 0) {
      deleting = false;
      delay = 400;
    } else if (position === phrase.length) {
      deleting = true;
      delay = 3000;
    }
    typingTimer = setTimeout(tick, delay);
  }
  typingTimer = setTimeout(tick, 3000);
}
startTyping();
// Dua baris berlawanan arah; menampilkan total 25 teknologi yang pernah digunakan.
const marquees = [...document.querySelectorAll(".marquee")];
const marqueeClones = marquees.map((marquee) => {
  const track = marquee.querySelector(".marquee-track");
  const clone = track.querySelector(".tech-list").cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  track.append(clone);
  return clone;
});
function updateMarquee() {
  const reduced = motionPreference.matches;
  marquees.forEach((marquee) => {
    marquee.classList.toggle("is-animated", !reduced);
  });
  marqueeClones.forEach((clone) => {
    clone.hidden = reduced;
  });
}
motionPreference.addEventListener("change", () => {
  startTyping();
  updateMarquee();
});
updateMarquee();

// Reveal tidak menyembunyikan konten sebelum JavaScript berjalan.
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!motionPreference.matches) entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((item) => revealObserver.observe(item));
}
// Navigasi aktif dan tombol kembali ke atas.
const navLinks = [...menu.querySelectorAll("a")];
const sections = navLinks.map((link) =>
  document.querySelector(link.getAttribute("href")),
);
const backTop = document.querySelector(".back-top");
let scrollQueued = false;
function updateScroll() {
  let active = sections[0];
  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= 160) active = section;
  });
  navLinks.forEach((link) => {
    if (link.hash === "#" + active.id)
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  backTop.hidden = scrollY < 450;
  scrollQueued = false;
}
addEventListener(
  "scroll",
  () => {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(updateScroll);
    }
  },
  { passive: true },
);
updateScroll();
// Tab mendukung klik, panah kiri/kanan, Home, dan End.
const tabList = document.querySelector("#project-tabs");
const tabs = [...tabList.querySelectorAll("button")];
tabList.hidden = false;
tabList.setAttribute("role", "tablist");
tabs.forEach((tab) => {
  tab.setAttribute("role", "tab");
  const panel = document.getElementById(tab.getAttribute("aria-controls"));
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", tab.id);
  panel.tabIndex = 0;
});
function selectTab(selected, focus = false) {
  tabs.forEach((tab) => {
    const active = tab === selected;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !active;
  });
  if (focus) selected.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft")
      next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectTab(tabs[next], true);
    }
  });
});
selectTab(tabs[0]);
// Modal sertifikat: dialog native membatasi fokus dan mendukung Escape.
const modal = document.querySelector("#certificate-modal");
const openCertificate = document.querySelector("#open-certificate");
if (typeof modal.showModal === "function") {
  openCertificate.disabled = false;
  openCertificate.addEventListener("click", () => modal.showModal());
  document
    .querySelector("#close-certificate")
    .addEventListener("click", () => modal.close());
  modal.addEventListener("close", () => openCertificate.focus());
}
// Aktifkan hanya alamat kontak yang telah diisi dengan format yang sesuai.
Object.entries(CONTACTS).forEach(([key, data]) => {
  if (!data.value.trim()) return;
  const item = document.querySelector('[data-contact="' + key + '"]');
  let href;
  if (key === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.value)) return;
    href = "mailto:" + data.value;
  } else {
    try {
      const url = new URL(data.value);
      if (url.protocol !== "https:") return;
      href = url.href;
    } catch {
      return;
    }
  }
  const link = document.createElement("a");
  link.className = item.className;
  link.href = href;
  if (key !== "email") {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  while (item.firstChild) link.append(item.firstChild);
  link.querySelector("span").textContent = data.label || data.value;
  item.replaceWith(link);
});

/* ========================================
   ACADEMIC UNIVERSE 2.0 INTERACTIONS
   ======================================== */

(() => {
  "use strict";

  const universeData = {
    methodist: {
      category: "EDUCATION / 01 - HIGH SCHOOL",
      name: "SMAS Methodist 5 Medan",
      program: "Matematika & Ilmu Pengetahuan Alam",
      details: [
        ["LEVEL", "Senior High School"],
        ["MAJOR", "MIPA"],
        ["LOCATION", "Medan"],
      ],
      location: "SMAS Methodist 5 Medan",
    },

    del: {
      category: "EDUCATION / 02 - UNIVERSITY",
      name: "Institut Teknologi Del",
      program: "Diploma III - Teknologi Komputer",
      details: [
        ["DEGREE", "D3"],
        ["SEMESTER", "05"],
        ["IPK", "3.02 / 4.00"],
      ],
      location: "Institut Teknologi Del",
    },
  };

  const modal = document.getElementById("universe-modal");

  const closeButton = document.getElementById("universe-modal-close");

  const mapFrame = document.getElementById("universe-map-frame");

  const mapLink = document.getElementById("universe-map-link");

  const detailContainer = document.getElementById("universe-modal-details");

  const buttons = document.querySelectorAll("[data-universe-school]");

  if (!modal || !closeButton || !mapFrame || !mapLink || !detailContainer) {
    console.warn("Academic Universe: required HTML not found.");
    return;
  }

  let lastTrigger = null;

  function openUniverseModal(key, button) {
    const school = universeData[key];

    if (!school) return;

    lastTrigger = button;

    document.getElementById("universe-modal-category").textContent =
      school.category;

    document.getElementById("universe-modal-title").textContent = school.name;

    document.getElementById("universe-modal-program").textContent =
      school.program;

    // Academic information
    detailContainer.replaceChildren();

    school.details.forEach(([label, value]) => {
      const item = document.createElement("div");

      const labelElement = document.createElement("span");

      const valueElement = document.createElement("strong");

      labelElement.className = "universe-detail-label";

      valueElement.className = "universe-detail-value";

      labelElement.textContent = label;
      valueElement.textContent = value;

      item.append(labelElement, valueElement);
      detailContainer.appendChild(item);
    });

    // Google Maps URL
    const query = encodeURIComponent(school.location);

    mapFrame.src = "https://maps.google.com/maps?q=" + query + "&output=embed";

    mapLink.href =
      "https://www.google.com/maps/search/" + "?api=1&query=" + query;

    // Open native modal
    if (!modal.open) {
      modal.showModal();
    }

    closeButton.focus();
  }

  // Institution click events
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      openUniverseModal(button.dataset.universeSchool, button);
    });
  });

  // Close button
  closeButton.addEventListener("click", () => {
    modal.close();
  });

  // Close when clicking outside modal
  modal.addEventListener("click", (event) => {
    if (event.target !== modal) return;

    const rect = modal.getBoundingClientRect();

    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (outside) modal.close();
  });

  // After modal is closed
  modal.addEventListener("close", () => {
    // Stop embedded Google Maps
    mapFrame.removeAttribute("src");

    // Return keyboard focus
    if (lastTrigger) {
      lastTrigger.focus();
    }
  });

  // Escape key is handled by native <dialog>
})();
