import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { DICT } from "./dict";
import { cn } from "@/index";

export const LANGS = [
  { code: "en", label: "EN", name: "English", html: "en" },
  { code: "pt", label: "PT", name: "Português", html: "pt-BR" },
  { code: "es", label: "ES", name: "Español", html: "es" },
  { code: "zh", label: "中文", name: "简体中文", html: "zh-CN" },
] as const;
export type Lang = (typeof LANGS)[number]["code"];
export const DEFAULT_LANG: Lang = "en";
export const LANG_KEY = "vz-lang";

const COL: Record<Exclude<Lang, "pt">, number> = { en: 0, es: 1, zh: 2 };
const norm = (s: string) => s.replace(/\s+/g, " ").trim();

export function isLang(v: unknown): v is Lang {
  return LANGS.some((l) => l.code === v);
}
export function readLang(stored: string | null | undefined): Lang {
  return isLang(stored) ? stored : DEFAULT_LANG;
}

/** Templated UI strings with a variable part ($1), e.g. numbers or titles. */
const PATTERNS: [RegExp, [string, string, string]][] = [
  [/^Ir para o item (\d+)$/, ["Go to item $1", "Ir al elemento $1", "跳到第 $1 项"]],
  [/^Não recomendado para menores de (\d+) anos$/, ["Not recommended for under $1", "No recomendado para menores de $1 años", "不建议 $1 岁以下观看"]],
  [/^Mês (\d+)$/, ["Month $1", "Mes $1", "第 $1 个月"]],
  [/^Ver (.+)$/, ["View $1", "Ver $1", "查看 $1"]],
];
function matchPattern(key: string): [string, string, string] | undefined {
  for (const [re, out] of PATTERNS) {
    const m = key.match(re);
    if (m) return out.map((s) => s.replace("$1", m[1])) as [string, string, string];
  }
}

/** Translate one PT-BR UI string; unknown strings pass through unchanged. */
export function translate(pt: string, lang: Lang): string {
  if (lang === "pt") return pt;
  const key = norm(pt);
  if (!key) return pt;
  const hit = DICT[key] ?? matchPattern(key);
  if (!hit) return pt;
  const lead = pt.match(/^\s*/)?.[0] ?? "";
  const trail = pt.match(/\s*$/)?.[0] ?? "";
  return lead + hit[COL[lang]] + trail;
}

// Design-system catalog stays in Portuguese.
const SKIP_PATHS = /^\/(design-system|marca|cores|tipografia|icones|componentes|__)/;
const ATTRS = ["placeholder", "aria-label", "title", "alt"] as const;

/** DOM-level translator: rewrites text nodes and a few attributes, remembering the PT originals. */
function createTranslator() {
  const textOrig = new WeakMap<Text, { pt: string; shown: string }>();
  const attrOrig = new WeakMap<Element, Record<string, { pt: string; shown: string }>>();
  let lang: Lang = DEFAULT_LANG;
  let busy = false;

  const skipEl = (el: Element | null) => !!el?.closest("script,style,textarea,[data-no-translate],[contenteditable=true]");

  const doText = (n: Text) => {
    if (skipEl(n.parentElement)) return;
    const cur = n.nodeValue ?? "";
    let rec = textOrig.get(n);
    if (!rec || cur !== rec.shown) { rec = { pt: cur, shown: cur }; textOrig.set(n, rec); }
    const next = translate(rec.pt, lang);
    if (next !== cur) n.nodeValue = next;
    rec.shown = next;
  };
  const doAttrs = (el: Element) => {
    if (skipEl(el)) return;
    let recs = attrOrig.get(el);
    for (const a of ATTRS) {
      const cur = el.getAttribute(a);
      if (cur == null) continue;
      recs ??= {};
      let r = recs[a];
      if (!r || cur !== r.shown) { r = { pt: cur, shown: cur }; recs[a] = r; }
      const next = translate(r.pt, lang);
      if (next !== cur) el.setAttribute(a, next);
      r.shown = next;
    }
    if (recs) attrOrig.set(el, recs);
  };
  const walk = (root: Node) => {
    if (root.nodeType === 3) return doText(root as Text);
    if (root.nodeType !== 1) return;
    const el = root as Element;
    doAttrs(el);
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n: Node | null;
    while ((n = tw.nextNode())) n.nodeType === 3 ? doText(n as Text) : doAttrs(n as Element);
  };
  const run = (fn: () => void) => { busy = true; try { fn(); } finally { busy = false; } };
  const active = () => !SKIP_PATHS.test(location.pathname);

  let titlePt = document.title;
  const doTitle = () => {
    const t = document.title;
    if (t !== translate(titlePt, lang)) titlePt = t;
    const next = active() ? translate(titlePt, lang) : titlePt;
    if (next !== t) document.title = next;
  };

  const obs = new MutationObserver((muts) => {
    if (busy) return;
    run(() => {
      if (!active()) return;
      for (const m of muts) {
        if (m.type === "characterData") doText(m.target as Text);
        else if (m.type === "attributes") doAttrs(m.target as Element);
        else m.addedNodes.forEach(walk);
      }
    });
  });
  const titleObs = new MutationObserver(() => { if (!busy) run(doTitle); });

  return {
    start() {
      obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] });
      const head = document.querySelector("head");
      if (head) titleObs.observe(head, { subtree: true, childList: true, characterData: true });
    },
    stop() { obs.disconnect(); titleObs.disconnect(); },
    apply(next: Lang) {
      lang = active() ? next : "pt";
      run(() => { walk(document.body); doTitle(); });
    },
  };
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LangContext = createContext<Ctx>({ lang: DEFAULT_LANG, setLang: () => {} });
export const useLang = () => useContext(LangContext);

export function LanguageProvider({ children, pathname }: { children: ReactNode; pathname: string }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);
  const [tr, setTr] = useState<ReturnType<typeof createTranslator> | null>(null);

  useEffect(() => {
    setLangState(readLang(localStorage.getItem(LANG_KEY)));
    const t = createTranslator();
    t.start();
    setTr(t);
    return () => t.stop();
  }, []);

  useEffect(() => {
    if (!tr) return;
    tr.apply(lang);
    document.documentElement.lang = LANGS.find((l) => l.code === lang)!.html;
    document.documentElement.classList.remove("vz-i18n-pending");
  }, [tr, lang, pathname]);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(LANG_KEY, l);
    setLangState(l);
  }, []);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

/** Hides the page until the first translation pass when the visitor's language isn't PT (max 2.5s). */
export const I18N_BOOT_SCRIPT = `(function(){try{var l=localStorage.getItem("${LANG_KEY}")||"${DEFAULT_LANG}";if(l!=="pt"&&!/^\\/(design-system|marca|cores|tipografia|icones|componentes|__)/.test(location.pathname)){var d=document.documentElement;d.classList.add("vz-i18n-pending");setTimeout(function(){d.classList.remove("vz-i18n-pending")},2500);}}catch(e){}})();`;

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div data-no-translate role="group" aria-label="Language" className={cn("inline-flex shrink-0 items-center rounded-full border border-border bg-surface/70 p-0.5 backdrop-blur", className)}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.html}
          title={l.name}
          aria-pressed={lang === l.code}
          onClick={() => setLang(l.code)}
          className={cn(
            "rounded-full px-2 py-1 font-mono text-[11px] leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            lang === l.code ? "bg-magenta/20 text-magenta" : "text-muted-foreground hover:text-magenta",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
