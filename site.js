/* ==========================================================================
   Site behaviour — mobile nav, reveal-on-scroll, WhatsApp links, booking form
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("burgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
    mobileMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => mobileMenu.classList.remove("open"));
    });
  }

  /* ---------- WhatsApp links ---------- */
  const phone = (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.phoneIntl) || "923214595777";
  const defaultMsg = (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.whatsappDefaultMessage) ||
    "Hi, I'd like to know more about your services.";
  document.querySelectorAll("[data-whatsapp]").forEach(link => {
    const customMsg = link.getAttribute("data-whatsapp-message");
    const msg = encodeURIComponent(customMsg || defaultMsg);
    link.setAttribute("href", `https://wa.me/${phone}?text=${msg}`);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener");
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("in"));
  }

  /* ---------- Booking mode toggle ---------- */
  const modeButtons = document.querySelectorAll(".mode-btn");
  const sessionTypeField = document.getElementById("sessionTypeField");
  if (modeButtons.length) {
    modeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        modeButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        if (sessionTypeField) {
          sessionTypeField.value = btn.dataset.mode === "online" ? "Online Session" : "Face-to-Face Session";
        }
      });
    });
  }

  /* ---------- Booking form ---------- */
  const bookingForm = document.getElementById("bookingForm");
  const formStatus = document.getElementById("formStatus");
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const phoneVal = document.getElementById("phone").value.trim();
      const email = document.getElementById("email").value.trim();
      const desc = document.getElementById("desc").value.trim();
      const sessionType = sessionTypeField ? sessionTypeField.value : "Online Session";

      if (!name || !phoneVal || !email || !desc) {
        showStatus("Please fill in every field before sending your inquiry.", "err");
        return;
      }

      const subject = encodeURIComponent(`New Booking Inquiry — ${sessionType}`);
      const body = encodeURIComponent(
        `Name: ${name}\nPhone: ${phoneVal}\nEmail: ${email}\nSession Type: ${sessionType}\n\nDescription:\n${desc}`
      );
      const mailTo = `mailto:${(typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.email) || "info@specialmindscentre.com"}?subject=${subject}&body=${body}`;

      const waMsg = encodeURIComponent(
        `Hi, I'd like to book a ${sessionType}.\nName: ${name}\nPhone: ${phoneVal}\nEmail: ${email}\nDetails: ${desc}`
      );
      const waLink = `https://wa.me/${phone}?text=${waMsg}`;

      showStatus("Inquiry prepared — choose Email or WhatsApp to send it.", "ok");

      // Open a pre-filled email draft; WhatsApp remains available via the side panel / float button.
      window.location.href = mailTo;

      // Small delay so the email client has a chance to open before offering WhatsApp as a fallback.
      window.__lastBookingWhatsApp = waLink;
    });
  }

  function showStatus(msg, type) {
    if (!formStatus) return;
    formStatus.textContent = msg;
    formStatus.className = `form-status ${type}`;
  }
});
