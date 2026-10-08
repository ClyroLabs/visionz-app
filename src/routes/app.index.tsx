import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { AIVerifiedBadge, AgeRating, Button } from "@/index";
import { catalog } from "@/experience/data";
import { filterCatalog } from "@/experience/logic";
import { useExperience } from "@/experience/store";
import { CatalogRow } from "@/experience/catalog-row";
import { MissionsCard } from "@/experience/rewards-ui";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Início — Protótipo VisionZ" },
      { name: "description", content: "Catálogo de streaming da VisionZ com compra avulsa e Modo infantil." },
      { property: "og:title", content: "Início — Protótipo VisionZ" },
      { property: "og:description", content: "Explore o catálogo navegável da plataforma VisionZ." },
    ],
  }),
  component: AppHome,
});

function AppHome() {
  const { kids } = useExperience();
  const list = filterCatalog(catalog, kids);
  const hero = list[0];
  return (
    <div className="space-y-10">
      {hero && (
        <div className="relative overflow-hidden rounded-xl border border-cyan/20">
          <img src={hero.cover} alt="" width={1280} height={720} className="h-80 w-full object-cover md:h-[26rem]" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 flex max-w-xl flex-col justify-end gap-4 p-8">
            <div className="flex gap-2"><AgeRating rating={hero.rating} /><AIVerifiedBadge /></div>
            <h1 className="font-display text-4xl font-bold tracking-wide">{hero.title}</h1>
            <p className="text-muted-foreground">{hero.creator} · {hero.duration}</p>
            <Link to="/app/assistir" search={{ id: hero.id }}><Button size="lg"><Play />Assistir agora</Button></Link>
          </div>
        </div>
      )}
      <MissionsCard />
      <CatalogRow title="Em alta" items={list.filter((t) => t.row === "alta")} />
      <CatalogRow title="Produções Clyro Synth" items={list.filter((t) => t.row === "synth")} />
      <CatalogRow title="Para a família" items={list.filter((t) => t.row === "familia")} />
    </div>
  );
}
