(() => {
  const STORAGE_KEY = "jiguang-lang";

  const applyLang = (lang) => {
    const next = lang === "en" ? "en" : "zh-Hans";
    document.documentElement.lang = next;
    document.documentElement.dataset.lang = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore quota / private mode */
    }

    const title = document.documentElement.getAttribute(
      next === "en" ? "data-title-en" : "data-title-zh"
    );
    if (title) document.title = title;

    const description = document.documentElement.getAttribute(
      next === "en" ? "data-desc-en" : "data-desc-zh"
    );
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute("content", description);

    document.querySelectorAll("[data-lang-switch]").forEach((button) => {
      const active = button.getAttribute("data-lang-switch") === next;
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    const search = document.querySelector("[data-faq-search]");
    if (search) {
      search.placeholder = next === "en" ? "Search topics…" : "搜索问题…";
    }
    document.dispatchEvent(new Event("jiguang-lang"));

    const url = new URL(window.location.href);
    if (url.searchParams.get("lang") !== next) {
      url.searchParams.set("lang", next);
      window.history.replaceState({}, "", url);
    }
  };

  const resolveLang = () => {
    const query = new URLSearchParams(window.location.search).get("lang");
    if (query === "en" || query === "zh-Hans") return query;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "zh-Hans") return stored;
    } catch {
      /* ignore */
    }
    const langs = navigator.languages || [navigator.language];
    if (langs.some((item) => String(item).toLowerCase().startsWith("zh"))) {
      return "zh-Hans";
    }
    if (langs.some((item) => String(item).toLowerCase().startsWith("en"))) {
      return "en";
    }
    return "zh-Hans";
  };

  applyLang(resolveLang());

  document.querySelectorAll("[data-lang-switch]").forEach((button) => {
    button.addEventListener("click", () => {
      applyLang(button.getAttribute("data-lang-switch"));
    });
  });

  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  if (nav && toggle) {
    const closeNav = () => {
      nav.setAttribute("data-open", "false");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", () => {
      const open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", open ? "false" : "true");
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });
  }

  const search = document.querySelector("[data-faq-search]");
  const items = [...document.querySelectorAll("[data-faq-item]")];
  const empty = document.querySelector("[data-faq-empty]");
  const count = document.querySelector("[data-faq-count]");

  const filterFaq = () => {
    if (!search) return;
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    items.forEach((item) => {
      const hay = `${item.getAttribute("data-faq-text") || ""} ${item.textContent || ""}`
        .toLowerCase();
      const match = !query || hay.includes(query);
      item.hidden = !match;
      if (match) visible += 1;
    });
    document.querySelectorAll(".faq").forEach((section) => {
      const any = [...section.querySelectorAll("[data-faq-item]")].some((item) => !item.hidden);
      section.hidden = Boolean(query) && !any;
    });
    if (empty) empty.hidden = visible !== 0;
    if (count) {
      count.textContent =
        document.documentElement.lang === "en"
          ? `${visible} topics`
          : `${visible} 条问题`;
    }
  };

  if (search) {
    search.addEventListener("input", filterFaq);
    document.addEventListener("jiguang-lang", filterFaq);
    filterFaq();
  }
})();
