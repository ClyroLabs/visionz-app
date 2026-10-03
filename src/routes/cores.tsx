import { createFileRoute } from "@tanstack/react-router";
import { Caption, PageHeader, Shell } from "@/showcase/shell";

export const Route = createFileRoute("/cores")({
  head: () => ({
    meta: [
      { title: "Cores — VisionZ Design System" },
      { name: "description", content: "Paleta da VisionZ: azul-noite, degradê de criação e ciano de tecnologia." },
      { property: "og:title", content: "Cores — VisionZ Design System" },
      { property: "og:description", content: "Paleta da VisionZ: azul-noite, degradê de criação e ciano de tecnologia." },
    ],
  }),
  component: Colors,
});

const groups = [
  { title: "Superfícies", items: [
    ["bg-background", "--background", "fundo da aplicação"], ["bg-surface", "--surface", "cartões e painéis"],
    ["bg-surface-raised", "--surface-raised", "menus e elevados"], ["bg-muted", "--muted", "trilhos e campos inativos"],
    ["bg-border", "--border", "bordas e divisores"],
  ] },
  { title: "Marca — criação", items: [
    ["bg-gradient-brand", "--gradient-brand", "ação principal, ganhos"], ["bg-primary", "--primary", "violeta VisionZ"],
    ["bg-magenta", "--magenta", "destaque emocional"], ["bg-ember", "--ember", "calor, preço à la carte"],
  ] },
  { title: "Tecnologia — Clyro", items: [
    ["bg-gradient-tech", "--gradient-tech", "capas e camadas de IA"], ["bg-cyan", "--cyan", "foco, rede, segurança"],
    ["bg-cyan-deep", "--cyan-deep", "ciano secundário"], ["bg-steel", "--steel", "metal do ícone"], ["bg-steel-light", "--steel-light", "metal claro"],
  ] },
  { title: "Estados", items: [
    ["bg-success", "--success", "aprovado, modo infantil"], ["bg-warning", "--warning", "em análise"], ["bg-destructive", "--destructive", "bloqueado, erro"],
  ] },
];

const pairs = [
  ["bg-background text-foreground", "foreground / background"], ["bg-surface text-muted-foreground", "muted-foreground / surface"],
  ["bg-gradient-brand text-primary-foreground", "primary-foreground / gradient-brand"], ["bg-cyan text-cyan-foreground", "cyan-foreground / cyan"],
  ["bg-destructive text-destructive-foreground", "destructive-foreground / destructive"],
];

function Colors() {
  return (
    <Shell>
      <PageHeader eyebrow="Fundamentos" title="Cores">Duas energias: o degradê da VisionZ para criação e recompensas, o ciano da Clyro para tecnologia e segurança — sobre um azul-noite profundo.</PageHeader>
      {groups.map((g) => (
        <section key={g.title} className="mb-12">
          <h2 className="mb-4 font-display text-lg font-semibold tracking-wide">{g.title}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {g.items.map(([cls, token, role]) => (
              <div key={token} className="overflow-hidden rounded-lg border bg-surface">
                <div className={`h-24 ${cls}`} />
                <div className="space-y-1 p-3">
                  <p className="text-sm font-medium">{cls}</p>
                  <Caption>{token}</Caption>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      <section>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-wide">Texto sobre fundo</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pairs.map(([cls, label]) => (
            <div key={label} className={`rounded-lg border p-5 ${cls}`}>
              <p className="font-display text-xl font-bold">Assista agora</p>
              <p className="mt-1 font-mono text-xs opacity-80">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
