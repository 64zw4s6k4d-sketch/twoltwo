/* Customer information pages share language controls but not the homepage's scroll camera. */
(() => {
  "use strict";
  const page = document.body.dataset.customerPage || "customer";
  const dictionary = {
    ja: {
      home: "ホームに戻る", back: "お客様向け情報に戻る", homeLabel: "2L² — ホームに戻る",
      titles: {customer: "お客様向け情報", policy: "情報保護方針", security: "情報の安全管理・取り扱い", onboarding: "導入までの流れ"}
    },
    en: {
      home: "Back to home", back: "Back to customer information", homeLabel: "2L² — Back to home",
      titles: {customer: "Customer Information", policy: "Information Protection Policy", security: "Information Security & Handling", onboarding: "Our Implementation Process"}
    },
    th: {
      home: "กลับไปหน้าแรก", back: "กลับไปยังข้อมูลสำหรับลูกค้า", homeLabel: "2L² — กลับไปหน้าแรก",
      titles: {customer: "ข้อมูลสำหรับลูกค้า", policy: "นโยบายคุ้มครองข้อมูล", security: "การรักษาความปลอดภัยและการจัดการข้อมูล", onboarding: "ขั้นตอนการนำไปใช้งาน"}
    }
  };
  const buttons = Array.from(document.querySelectorAll(".language button[data-lang]"));
  const panels = Array.from(document.querySelectorAll("[data-policy-lang]"));
  function updateLanguage(lang) {
    const copy = dictionary[lang];
    if (!copy) return;
    document.documentElement.lang = lang;
    document.title = (copy.titles[page] || copy.titles.customer) + " | 2L²";
    panels.forEach(panel => {
      panel.hidden = panel.dataset.policyLang !== lang;
    });
    buttons.forEach(button => {
      const active = button.dataset.lang === lang;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("active", active);
    });
    document.querySelectorAll("[data-policy-i18n]").forEach(link => {
      const role = link.dataset.policyI18n;
      const arrow = link.querySelector("[aria-hidden='true']");
      link.textContent = (copy[role] || copy.home) + " ";
      if (arrow) link.appendChild(arrow);
      if (role === "back") link.setAttribute("href", "./customer.html" + (lang === "ja" ? "" : "?lang=" + lang));
    });
    document.querySelectorAll(".customer-link").forEach(link => {
      const base = link.getAttribute("href").split("?")[0];
      link.setAttribute("href", base + (lang === "ja" ? "" : "?lang=" + lang));
    });
    document.querySelector(".privacy-header .brand")?.setAttribute("aria-label", copy.homeLabel);
  }
  buttons.forEach(button => button.addEventListener("click", () => updateLanguage(button.dataset.lang)));
  const initial = new URLSearchParams(window.location.search).get("lang");
  updateLanguage(dictionary[initial] ? initial : "ja");
})();
