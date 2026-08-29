/**
 * RENO APARTMENTS ABUJA — SITE SCRIPT
 * Depends on data/property.js being loaded first (defines window PROPERTY).
 *
 * Design note: every DOM update in this file replaces state rather than
 * layering it (e.g. classList.toggle / textContent = ..., never appendChild
 * of a repeated "loading" element). That's a deliberate guard against the
 * kind of bug where a stacked skeleton/loader gets re-added on every
 * scroll/observer tick and never cleared.
 */
(function () {
  "use strict";

  var P = window.PROPERTY;

  /* ---------------- WhatsApp helpers ---------------- */
  function waLink(message) {
    var digits = (P && P.contact && P.contact.whatsappDigits) || "";
    var text = encodeURIComponent(message || "Hello " + (P ? P.name : "") + ", I would like to enquire about accommodation.");
    return "https://wa.me/" + digits + "?text=" + text;
  }

  function applyWhatsAppLinks() {
    var nodes = document.querySelectorAll("[data-wa]");
    nodes.forEach(function (el) {
      var custom = el.getAttribute("data-wa-message");
      el.setAttribute("href", waLink(custom));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  }

  function applyTelLinks() {
    var nodes = document.querySelectorAll("[data-tel]");
    nodes.forEach(function (el) {
      var idx = parseInt(el.getAttribute("data-tel"), 10) || 0;
      var phone = (P && P.contact && P.contact.phones && P.contact.phones[idx]) || "";
      el.setAttribute("href", "tel:" + phone.replace(/\s+/g, ""));
      if (el.hasAttribute("data-tel-text")) el.textContent = phone;
    });
  }

  function applyEmailLinks() {
    var email = (P && P.contact && P.contact.email) || "";
    var nodes = document.querySelectorAll("[data-email]");
    nodes.forEach(function (el) {
      if (!email) { el.style.display = "none"; return; }
      el.setAttribute("href", "mailto:" + email);
      if (el.hasAttribute("data-email-text")) el.textContent = email;
    });
  }

  function applyMapLinks() {
    var nodes = document.querySelectorAll("[data-directions]");
    var url = (P && P.geo && P.geo.googleMapsUrl) || "#";
    nodes.forEach(function (el) { el.setAttribute("href", url); el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener"); });
  }

  /* ---------------- Mobile nav ---------------- */
  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-nav");
    if (!toggle || !panel) return;
    function close() {
      panel.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    function open() {
      panel.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    toggle.addEventListener("click", function () {
      panel.classList.contains("open") ? close() : open();
    });
    panel.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ---------------- Gallery: filter + lightbox ---------------- */
  function initGallery() {
    var grid = document.querySelector("[data-gallery]");
    if (!grid) return;
    var items = Array.prototype.slice.call(grid.querySelectorAll("figure"));
    var filterBar = document.querySelector("[data-gallery-filters]");
    var lightbox = document.querySelector(".lightbox");
    var lbImg = lightbox ? lightbox.querySelector("img") : null;
    var lbCaption = lightbox ? lightbox.querySelector(".lightbox-caption") : null;
    var currentIndex = 0;
    var visibleItems = items;

    function applyFilter(cat) {
      visibleItems = [];
      items.forEach(function (fig) {
        var match = cat === "all" || fig.getAttribute("data-cat") === cat;
        fig.style.display = match ? "" : "none";
        if (match) visibleItems.push(fig);
      });
      if (filterBar) {
        filterBar.querySelectorAll("button").forEach(function (btn) {
          btn.classList.toggle("active", btn.getAttribute("data-filter") === cat);
        });
      }
    }

    if (filterBar) {
      filterBar.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-filter]");
        if (!btn) return;
        applyFilter(btn.getAttribute("data-filter"));
      });
    }

    function openLightbox(fig) {
      if (!lightbox || !lbImg) return;
      currentIndex = visibleItems.indexOf(fig);
      renderLightbox();
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function renderLightbox() {
      var fig = visibleItems[currentIndex];
      if (!fig) return;
      var img = fig.querySelector("img");
      lbImg.src = img.getAttribute("data-full") || img.src;
      lbImg.alt = img.alt || "";
      if (lbCaption) lbCaption.textContent = (fig.querySelector("figcaption") || {}).textContent || "";
    }
    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    }
    function step(dir) {
      if (!visibleItems.length) return;
      currentIndex = (currentIndex + dir + visibleItems.length) % visibleItems.length;
      renderLightbox();
    }

    items.forEach(function (fig) {
      var link = fig.querySelector("a");
      if (!link) return;
      link.addEventListener("click", function (e) {
        e.preventDefault();
        openLightbox(fig);
      });
    });

    if (lightbox) {
      lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
      lightbox.querySelector(".lightbox-prev").addEventListener("click", function () { step(-1); });
      lightbox.querySelector(".lightbox-next").addEventListener("click", function () { step(1); });
      lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
      document.addEventListener("keydown", function (e) {
        if (!lightbox.classList.contains("open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      });
    }
  }

  /* ---------------- Forms: contact / booking ---------------- */
  function validateField(field) {
    var input = field.querySelector("input, select, textarea");
    var errorEl = field.querySelector(".field-error");
    if (!input) return true;
    var valid = input.checkValidity();
    field.classList.toggle("has-error", !valid);
    if (errorEl) errorEl.textContent = valid ? "" : (input.dataset.errorMessage || "Please check this field.");
    return valid;
  }

  function initForm(form) {
    var status = form.querySelector(".form-status");
    var submitBtn = form.querySelector('button[type="submit"]');
    var fields = Array.prototype.slice.call(form.querySelectorAll(".field"));

    fields.forEach(function (field) {
      var input = field.querySelector("input, select, textarea");
      if (!input) return;
      input.addEventListener("blur", function () { validateField(field); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var allValid = fields.map(validateField).every(Boolean);
      if (status) { status.className = "form-status"; status.textContent = ""; }
      if (!allValid) {
        if (status) {
          status.textContent = "Please fix the highlighted fields and try again.";
          status.classList.add("show", "error");
        }
        var firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }

      submitBtn && (submitBtn.disabled = true);
      submitBtn && submitBtn.setAttribute("data-original", submitBtn.textContent);
      submitBtn && (submitBtn.textContent = "Sending…");

      // NOTE: No email/booking backend is connected yet. We do not claim to
      // send an email or confirm live availability — see README for how to
      // wire this form to a real backend (Formspree, a Vercel serverless
      // function with Resend/SendGrid, or a PMS API). For now the request
      // is captured locally and handed off via WhatsApp so no enquiry is lost.
      setTimeout(function () {
        try {
          var data = {};
          new FormData(form).forEach(function (v, k) { data[k] = v; });
          var log = JSON.parse(localStorage.getItem("reno_enquiries") || "[]");
          log.push(Object.assign({ ts: new Date().toISOString() }, data));
          localStorage.setItem("reno_enquiries", JSON.stringify(log));

          var summary = Object.keys(data).map(function (k) { return k + ": " + data[k]; }).join("\n");
          var waMsg = "New enquiry from website:\n" + summary;
          var waHandoff = form.querySelector("[data-wa-handoff]");
          if (waHandoff) waHandoff.setAttribute("href", waLink(waMsg));

          if (status) {
            status.textContent = form.getAttribute("data-success-message") ||
              "Your request has been received. Reno Apartments Abuja will contact you shortly to confirm availability. You can also tap below to send it on WhatsApp for a faster response.";
            status.classList.add("show", "success");
          }
          form.reset();
          fields.forEach(function (f) { f.classList.remove("has-error"); });
        } catch (err) {
          if (status) {
            status.textContent = "Something went wrong sending your request. Please try WhatsApp or call us directly.";
            status.classList.add("show", "error");
          }
        } finally {
          submitBtn && (submitBtn.disabled = false);
          submitBtn && (submitBtn.textContent = submitBtn.getAttribute("data-original") || "Send request");
        }
      }, 700);
    });
  }

  function initForms() {
    document.querySelectorAll("form[data-enquiry-form]").forEach(function (form) {
      if (form.hasAttribute("data-booking-api")) {
        initBookingForm(form);
      } else {
        initForm(form);
      }
    });
  }

  /* ---------------- Booking form: real backend submission ----------------
   * Unlike the general enquiry form above, this form's "success" state is
   * driven entirely by the actual response from POST /api/bookings — a
   * live Vercel serverless function (see /api/bookings.js). It is never
   * shown as successful based on a timer or local storage; if the backend
   * isn't configured yet, the API returns success:false and this code
   * shows that honestly, with the WhatsApp button offered as a fallback.
   */
  function initBookingForm(form) {
    var status = form.querySelector(".form-status");
    var submitBtn = form.querySelector('button[type="submit"]');
    var fields = Array.prototype.slice.call(form.querySelectorAll(".field"));

    fields.forEach(function (field) {
      var input = field.querySelector("input, select, textarea");
      if (!input) return;
      input.addEventListener("blur", function () { validateField(field); });
    });

    function validateDates() {
      var checkin = form.querySelector('[name="checkin"]');
      var checkout = form.querySelector('[name="checkout"]');
      if (!checkin || !checkout || !checkin.value || !checkout.value) return null;
      var checkoutField = checkout.closest(".field");
      var errEl = checkoutField ? checkoutField.querySelector(".field-error") : null;
      if (new Date(checkout.value) <= new Date(checkin.value)) {
        var msg = "Check-out date must be after check-in date.";
        if (checkoutField) checkoutField.classList.add("has-error");
        if (errEl) errEl.textContent = msg;
        return msg;
      }
      var today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(checkin.value) < today) {
        var msg2 = "Check-in date cannot be in the past.";
        var checkinField = checkin.closest(".field");
        if (checkinField) checkinField.classList.add("has-error");
        var errEl2 = checkinField ? checkinField.querySelector(".field-error") : null;
        if (errEl2) errEl2.textContent = msg2;
        return msg2;
      }
      return null;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var allValid = fields.map(validateField).every(Boolean);
      var dateError = validateDates();
      if (dateError) allValid = false;

      if (status) { status.className = "form-status"; status.textContent = ""; }
      if (!allValid) {
        if (status) {
          status.textContent = dateError || "Please fix the highlighted fields and try again.";
          status.classList.add("show", "error");
        }
        var firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }

      submitBtn && (submitBtn.disabled = true);
      var originalLabel = submitBtn ? submitBtn.textContent : "";
      submitBtn && (submitBtn.textContent = "Sending…");

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });

      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (json) {
            return { ok: res.ok, json: json };
          });
        })
        .then(function (result) {
          var json = result.json || {};
          if (json.success) {
            if (status) {
              status.textContent = "Booking request received. Our management team will review your request and contact you shortly. Reference: " + json.bookingId;
              status.classList.remove("error");
              status.classList.add("show", "success");
            }
            form.reset();
            fields.forEach(function (f) { f.classList.remove("has-error"); });
          } else {
            if (status) {
              status.textContent = json.message || "We could not submit your booking request. Please try again or contact us directly by phone or WhatsApp.";
              status.classList.remove("success");
              status.classList.add("show", "error");
            }
          }
        })
        .catch(function () {
          if (status) {
            status.textContent = "We could not reach the booking system. Please try again or contact us directly by phone or WhatsApp.";
            status.classList.remove("success");
            status.classList.add("show", "error");
          }
        })
        .finally(function () {
          submitBtn && (submitBtn.disabled = false);
          submitBtn && (submitBtn.textContent = originalLabel);
        });
    });
  }

  /* ---------------- WhatsApp dynamic booking message ---------------- */
  function initBookingWhatsApp() {
    var form = document.querySelector("[data-booking-wa-source]");
    var waBtn = document.querySelector("[data-booking-wa-target]");
    if (!form || !waBtn) return;
    function update() {
      var apt = form.querySelector('[name="apartment"]');
      var checkin = form.querySelector('[name="checkin"]');
      var checkout = form.querySelector('[name="checkout"]');
      var guests = form.querySelector('[name="guests"]');
      var parts = ["Hello " + (P ? P.name : "") + ", I'd like to enquire about a booking."];
      if (apt && apt.value) parts.push("Apartment: " + apt.options[apt.selectedIndex].text);
      if (checkin && checkin.value) parts.push("Check-in: " + checkin.value);
      if (checkout && checkout.value) parts.push("Check-out: " + checkout.value);
      if (guests && guests.value) parts.push("Guests: " + guests.value);
      waBtn.setAttribute("href", waLink(parts.join("\n")));
    }
    form.addEventListener("input", update);
    update();
  }

  /* ---------------- FAQ / structured content from data ---------------- */
  function renderFaqs() {
    var mount = document.querySelector("[data-faq-list]");
    if (!mount || !P || !P.faqs) return;
    mount.innerHTML = "";
    P.faqs.forEach(function (item) {
      var details = document.createElement("details");
      details.className = "faq-item";
      var summary = document.createElement("summary");
      summary.className = "faq-q";
      var span = document.createElement("span");
      span.textContent = item.q;
      var plus = document.createElement("span");
      plus.className = "plus";
      plus.setAttribute("aria-hidden", "true");
      summary.appendChild(span);
      summary.appendChild(plus);
      var body = document.createElement("div");
      body.className = "faq-a";
      body.textContent = item.a;
      details.appendChild(summary);
      details.appendChild(body);
      mount.appendChild(details);
    });
  }

  /* ---------------- AI Chat Assistant (rule-based, zero hallucination) ---------------- */
  var FALLBACK = "I don't have confirmed information about that yet. Please contact Reno Apartments Abuja directly for assistance.";

  function chatAnswer(raw) {
    if (!P) return FALLBACK;
    var q = raw.toLowerCase();

    function has(words) { return words.some(function (w) { return q.indexOf(w) !== -1; }); }

    if (has(["book", "reserve", "reservation", "availability", "available"])) {
      return "To check availability or book, share your check-in date, check-out date, number of guests and preferred apartment on our Booking page, or message us directly on WhatsApp — our team confirms every request personally.";
    }
    if (has(["where", "location", "address", "direction", "map", "guzape"])) {
      return "We're located at " + P.address.full + ". Tap \"Get Directions\" anywhere on the site to open the route in Google Maps.";
    }
    if (has(["whatsapp"])) {
      return "You can reach us on WhatsApp at " + P.contact.whatsapp + " — tap any WhatsApp button on the site to start a chat with your details already filled in.";
    }
    if (has(["call", "phone", "number", "contact", "email"])) {
      var emailPart = P.contact.email ? (" You can also email us at " + P.contact.email + ".") : "";
      return "You can call or text us on " + P.contact.phones.join(" or ") + ", or reach us on WhatsApp at " + P.contact.whatsapp + "." + emailPart;
    }
    if (has(["check-in", "checkin", "check in", "check-out", "checkout", "check out"])) {
      return P.hours.checkIn && P.hours.checkIn.indexOf("PLACEHOLDER") === -1
        ? "Check-in is " + P.hours.checkIn + " and check-out is " + P.hours.checkOut + "."
        : FALLBACK;
    }
    if (has(["price", "cost", "rate", "how much", "naira"])) {
      var priced = P.apartments.filter(function (a) { return a.published && a.priceFrom; });
      if (priced.length) {
        return priced.map(function (a) { return a.name + ": from " + a.currency + " " + a.priceFrom.toLocaleString(); }).join("\n");
      }
      return "Rates are confirmed directly with our team based on your dates and apartment choice. Send an enquiry and we'll get back to you with pricing.";
    }
    if (has(["amenit", "wifi", "facility", "facilities", "gym", "pool", "parking", "laundry"])) {
      var confirmed = P.amenities.filter(function (a) { return a.confirmed; }).map(function (a) { return a.name; });
      return confirmed.length ? "Confirmed amenities include: " + confirmed.join(", ") + "." : FALLBACK;
    }
    if (has(["pet", "smok", "children", "kid", "cancel", "polic"])) {
      return "Policy details for that are still being confirmed by the property — please contact Reno Apartments Abuja directly and we'll get you an accurate answer.";
    }
    if (has(["apartment", "room", "unit", "suite"])) {
      var pub = P.apartments.filter(function (a) { return a.published; });
      if (pub.length) return pub.map(function (a) { return a.name; }).join(", ") + " — see the Apartments page for full details.";
      return "Our apartment listings are being finalized on the website right now — message us on WhatsApp and our team can share what's currently available.";
    }
    if (has(["hi", "hello", "hey"])) {
      return "Hello! I can help with booking, availability, location, amenities, or contact details for " + P.name + ". What would you like to know?";
    }
    return FALLBACK;
  }

  function initChat() {
    var launcher = document.querySelector("[data-chat-launcher]");
    var panel = document.querySelector("[data-chat-panel]");
    if (!launcher || !panel) return;
    var body = panel.querySelector(".chat-body");
    var form = panel.querySelector(".chat-form");
    var input = form ? form.querySelector("input") : null;
    var closeBtn = panel.querySelector(".chat-close");
    var suggestions = panel.querySelector(".chat-suggestions");

    function addMsg(text, who) {
      var div = document.createElement("div");
      div.className = "chat-msg " + who;
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }

    function open() {
      panel.classList.add("open");
      launcher.setAttribute("aria-expanded", "true");
      if (input) input.focus();
    }
    function close() {
      panel.classList.remove("open");
      launcher.setAttribute("aria-expanded", "false");
    }

    launcher.addEventListener("click", function () {
      panel.classList.contains("open") ? close() : open();
    });
    closeBtn && closeBtn.addEventListener("click", close);

    if (suggestions) {
      suggestions.addEventListener("click", function (e) {
        var btn = e.target.closest("button");
        if (!btn) return;
        addMsg(btn.textContent, "user");
        addMsg(chatAnswer(btn.textContent), "bot");
      });
    }

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var val = (input.value || "").trim();
        if (!val) return;
        addMsg(val, "user");
        input.value = "";
        var answer = chatAnswer(val);
        setTimeout(function () { addMsg(answer, "bot"); }, 350);
      });
    }
  }

  /* ---------------- Public API for late-inserted content ----------------
   * Some pages inject apartment/gallery cards from PROPERTY data via an
   * inline <script> AFTER main.js has already run its one-time init (event
   * binding for nav, gallery, forms, chat, etc). Those cards can contain
   * fresh [data-wa] / [data-tel] / [data-directions] elements that need
   * their href filled in. Re-running the *one-time* inits (initChat,
   * initMobileNav, ...) would attach duplicate event listeners and cause
   * things like double-toggling buttons — so we only expose the safe,
   * idempotent "fill in the links" functions for that purpose.
   */
  window.SiteUtils = {
    refreshLinks: function () {
      applyWhatsAppLinks();
      applyTelLinks();
      applyEmailLinks();
      applyMapLinks();
    }
  };

  /* ---------------- Boot (runs exactly once) ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    applyWhatsAppLinks();
    applyTelLinks();
    applyEmailLinks();
    applyMapLinks();
    initMobileNav();
    initGallery();
    initForms();
    initBookingWhatsApp();
    renderFaqs();
    initChat();

    // Footer year
    var yearEl = document.querySelector("[data-year]");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });
})();
