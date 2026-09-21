/* Standalone privacy page language selector; independent of home scroll logic. */
(() => {
  "use strict";
  const captions = {
    ja: {back: "ホームに戻る", title: "個人情報方針 | 2L²", home: "2L² — ホームに戻る"},
    en: {back: "Back to home", title: "Privacy Policy | 2L²", home: "2L² — Back to home"},
    th: {back: "กลับไปหน้าแรก", title: "นโยบายความเป็นส่วนตัว | 2L²", home: "2L² — กลับไปหน้าแรก"}
  };
  const buttons = Array.from(document.querySelectorAll(".language button[data-lang]"));
  const panels = Array.from(document.querySelectorAll("[data-policy-lang]"));
  function setLanguage(lang) {
    const text = captions[lang];
    if (!text) return;
    document.documentElement.lang = lang;
    document.title = text.title;
    panels.forEach(panel => {
      panel.hidden = panel.dataset.policyLang !== lang;
    });
    buttons.forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
      button.classList.toggle("active", button.dataset.lang === lang);
    });
    document.querySelectorAll("[data-policy-i18n='back']").forEach(link => {
      const arrow = link.querySelector("[aria-hidden='true']");
      link.textContent = text.back + " ";
      if (arrow) link.appendChild(arrow);
    });
    document.querySelector(".privacy-header .brand")?.setAttribute("aria-label", text.home);
  }
  buttons.forEach(button => button.addEventListener("click", () => setLanguage(button.dataset.lang)));
  setLanguage("ja");
})();
