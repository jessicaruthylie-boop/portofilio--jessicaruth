"use strict";
// Lightly blurred certificate backdrop with the original image kept sharp.
document.querySelectorAll('.credential-image img').forEach(img => {
  const refresh = () => {
    if ((img.currentSrc || img.src).includes('placeholder')) return;
    const frame = img.closest('.credential-image');
    frame.classList.add('certificate-soft-backdrop');
    frame.style.setProperty('--certificate-backdrop', 'url(' + JSON.stringify(img.currentSrc || img.src) + ')');
  };
  img.addEventListener('load', refresh);
  refresh();
});
// Enlarge each certificate while preserving the compact card layout.
(() => {
  const images = document.querySelectorAll('#certificates-panel .credential-image img');
  if (!images.length || typeof HTMLDialogElement === 'undefined') return;
  const viewer = document.createElement('dialog');
  viewer.className = 'credential-viewer';
  viewer.setAttribute('aria-labelledby', 'credential-viewer-title');
  viewer.innerHTML = '<div class="credential-viewer-heading"><h2 id="credential-viewer-title"></h2><button type="button" aria-label="Tutup gambar sertifikat" autofocus>Tutup &times;</button></div><img class="credential-viewer-image" alt="" /><p class="credential-viewer-issuer"></p>';
  document.body.append(viewer);
  const title = viewer.querySelector('h2');
  const enlarged = viewer.querySelector('img');
  const issuer = viewer.querySelector('p');
  let trigger;
  let previousOverflow;
  images.forEach(img => {
    const card = img.closest('.credential-entry');
    const name = card.querySelector('h4').textContent;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'credential-zoom';
    button.setAttribute('aria-label', 'Perbesar sertifikat ' + name);
    button.setAttribute('aria-haspopup', 'dialog');
    img.before(button);
    button.append(img);
    button.addEventListener('click', () => {
      if (card.closest('.certificate-stack.is-carousel') && !card.classList.contains('is-current')) return;
      if (card.closest('[aria-labelledby="appreciation-title"], [aria-labelledby="certifications-title"]') && !card.classList.contains('credential-featured')) {
        card.dispatchEvent(new Event('feature-award', { bubbles: true }));
        return;
      }
      trigger = button;
      title.textContent = name;
      enlarged.src = img.currentSrc || img.src;
      enlarged.alt = img.alt;
      issuer.textContent = card.querySelector(':scope > p')?.textContent || '';
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      viewer.showModal();
    });
  });
  viewer.querySelector('button').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const rect = viewer.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
  });
  viewer.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    enlarged.removeAttribute('src');
    trigger?.focus({ preventScroll: true });
  });
})();
// Unified certificate carousel; all entries remain readable without JavaScript.
(() => {
  const stack = document.querySelector('#certificate-stack');
  if (!stack) return;
  const cards = [...stack.querySelectorAll('.credential-entry')];
  const controls = document.querySelector('.certificate-carousel-controls');
  const position = controls.querySelector('.certificate-position');
  const indicators = document.createElement('div');
  indicators.className = 'certificate-indicators';
  indicators.setAttribute('role', 'group');
  indicators.setAttribute('aria-label', 'Pilih sertifikat');
  const dots = cards.map((card, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', card.querySelector('h4').textContent);
    dot.addEventListener('click', () => select(index));
    indicators.append(dot);
    return dot;
  });
  stack.after(indicators);
  let current = 0;
  function select(index) {
    current = (index + cards.length) % cards.length;
    cards.forEach((card, i) => {
      let distance = (i - current + cards.length) % cards.length;
      if (distance > cards.length / 2) distance -= cards.length;
      card.style.setProperty('--card-offset', Math.max(-2, Math.min(2, distance)));
      card.style.setProperty('--card-depth', Math.min(2, Math.abs(distance)));
      card.style.zIndex = String(5 - Math.abs(distance));
      card.classList.toggle('is-current', distance === 0);
      card.classList.toggle('is-outside', Math.abs(distance) > 2);
      card.inert = distance !== 0;
      card.setAttribute('aria-hidden', String(distance !== 0));
    });
    position.textContent = String(current + 1).padStart(2, '0') + ' / ' + cards.length;
    dots.forEach((dot, index) => dot.setAttribute('aria-pressed', String(index === current)));
  }
  stack.classList.add('is-carousel');
  controls.hidden = false;
  controls.querySelectorAll('button').forEach(button => button.addEventListener('click', () => select(current + Number(button.dataset.certificateStep))));
  stack.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const hadFocus = stack.contains(document.activeElement);
    select(current + (event.key === 'ArrowRight' ? 1 : -1));
    if (hadFocus) stack.focus({ preventScroll: true });
  });
  let touchStart;
  stack.addEventListener('touchstart', event => { touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }, { passive: true });
  stack.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) select(current + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
  select(0);
})();
// Each credential group manages its own featured card and swap animation.
document.querySelectorAll('[aria-labelledby="appreciation-title"] .credential-grid, [aria-labelledby="certifications-title"] .credential-grid').forEach(grid => {
  const cards = [...grid.querySelectorAll('.credential-entry')];
  const status = document.createElement('p');
  status.className = 'award-selection-status';
  status.setAttribute('role', 'status');
  grid.after(status);
  function updateLabels() {
    cards.forEach(card => {
      const selected = card.classList.contains('credential-featured');
      const titleButton = card.querySelector('.award-select');
      titleButton.setAttribute('aria-pressed', String(selected));
      const zoom = card.querySelector('.credential-zoom');
      if (zoom) {
        zoom.setAttribute('aria-label', (selected ? 'Perbesar sertifikat ' : 'Tampilkan sebagai sertifikat utama: ') + titleButton.textContent);
        if (selected) zoom.setAttribute('aria-haspopup', 'dialog');
        else zoom.removeAttribute('aria-haspopup');
      }
    });
  }
  const swapAnimations = new Set();
  function select(card) {
    const featured = grid.querySelector('.credential-featured');
    if (!featured || featured === card) return;
    swapAnimations.forEach(animation => animation.cancel());
    swapAnimations.clear();
    const animateSwap = !matchMedia('(prefers-reduced-motion: reduce)').matches && typeof card.animate === 'function';
    const previousRects = new Map(animateSwap ? cards.map(item => [item, item.getBoundingClientRect()]) : []);
    const marker = document.createComment('award position');
    card.before(marker);
    featured.replaceWith(card);
    marker.replaceWith(featured);
    featured.classList.remove('credential-featured');
    card.classList.add('credential-featured');
    const badge = featured.querySelector('.credential-featured-label');
    if (badge) card.append(badge);
    updateLabels();
    if (animateSwap) {
      cards.forEach(item => {
        const before = previousRects.get(item);
        const after = item.getBoundingClientRect();
        if (!after.width || !after.height) return;
        const animation = item.animate([
          { transformOrigin: 'top left', transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width}, ${before.height / after.height})`, opacity: .7 },
          { transformOrigin: 'top left', transform: 'translate(0, 0) scale(1, 1)', opacity: 1 },
        ], { duration: 480, easing: 'cubic-bezier(.22, 1, .36, 1)' });
        swapAnimations.add(animation);
        const cleanup = () => swapAnimations.delete(animation);
        animation.onfinish = cleanup;
        animation.oncancel = cleanup;
      });
      const highlight = card.animate([
        { boxShadow: '0 0 0 1px #ffa58690, 0 0 30px #ffa58630' },
        { boxShadow: '0 0 0 0px #ffa58600, 0 0 0px #ffa58600' },
      ], { duration: 800, easing: 'ease-out' });
      swapAnimations.add(highlight);
      const cleanup = () => swapAnimations.delete(highlight);
      highlight.onfinish = cleanup;
      highlight.oncancel = cleanup;
    }
    card.querySelector('.award-select').focus({ preventScroll: true });
    status.textContent = card.querySelector('h4').textContent + ' ditampilkan sebagai sertifikat utama.';
  }
  cards.forEach(card => {
    const heading = card.querySelector('h4');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'award-select';
    button.textContent = heading.textContent;
    heading.replaceChildren(button);
    card.addEventListener('feature-award', () => select(card));
    card.addEventListener('click', event => {
      if (event.target.closest('a, .credential-zoom')) return;
      select(card);
    });
  });
  updateLabels();
});
// Loop the committee gallery using inert copies on both sides of the real cards.
(() => {
  const track = document.querySelector('#committee-track');
  if (!track) return;
  const controls = document.querySelector('.committee-arrows');
  const buttons = [...controls.querySelectorAll('button')];
  const cards = [...track.querySelectorAll('.experience-tile')];
  if (!cards.length) return;
  function copyCards() {
    return cards.map(card => {
      const copy = card.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.inert = true;
      copy.removeAttribute('id');
      copy.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
      return copy;
    });
  }
  track.prepend(...copyCards());
  track.append(...copyCards());
  controls.hidden = false;
  let step = 0;
  let origin = 0;
  let cycle = 0;
  let settleTimer;
  let touching = false;
  function measure() {
    const index = step ? Math.round((track.scrollLeft - origin) / step) : 0;
    step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
    origin = cards[0].offsetLeft - track.firstElementChild.offsetLeft;
    cycle = step * cards.length;
    track.scrollTo({ left: origin + ((index % cards.length + cards.length) % cards.length) * step, behavior: 'instant' });
  }
  function settle() {
    if (touching || !cycle) return;
    const position = track.scrollLeft;
    if (position < origin - 1 || position >= origin + cycle - 1) {
      const wrapped = ((position - origin) % cycle + cycle) % cycle;
      track.scrollTo({ left: origin + wrapped, behavior: 'instant' });
    }
  }
  function move(direction) {
    settle();
    const index = Math.round((track.scrollLeft - origin) / step);
    track.scrollTo({ left: origin + (index + direction) * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  buttons.forEach(button => button.addEventListener('click', () => move(Number(button.dataset.committeeDirection))));
  track.addEventListener('keydown', event => {
    if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });
  track.addEventListener('scroll', () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 180);
  }, { passive: true });
  track.addEventListener('touchstart', () => { touching = true; }, { passive: true });
  const endTouch = () => { touching = false; clearTimeout(settleTimer); settleTimer = setTimeout(settle, 180); };
  track.addEventListener('touchend', endTouch, { passive: true });
  track.addEventListener('touchcancel', endTouch, { passive: true });
  track.addEventListener('scrollend', settle);
  new ResizeObserver(measure).observe(track);
  measure();
})();
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
if (modal && openCertificate && typeof modal.showModal === "function") {
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
