import { createFileRoute } from "@tanstack/react-router";
import { Caption, PageHeader, Shell } from "@/showcase/shell";
import { Card, Logo, type LogoProps } from "@/index";

export const Route = createFileRoute("/marca")({
  head: () => ({
    meta: [
      { title: "Marca — VisionZ Design System" },
      { name: "description", content: "Logos oficiais da VisionZ e da Clyro Labs e como usá-las." },
      { property: "og:title", content: "Marca — VisionZ Design System" },
      { property: "og:description", content: "Logos oficiais da VisionZ e da Clyro Labs e como usá-las." },
    ],
  }),
  component: Brand,
});

const logos: { brand: LogoProps["brand"]; name: string; role: string; light: boolean }[] = [
  { brand: "vizionz", name: "VisionZ Entertainment", role: "Logo principal. Criação, entretenimento, ações de destaque.", light: true },
  { brand: "clyro", name: "Clyro", role: "Camada de inteligência. Usar em telas de tecnologia e IA.", light: false },
  { brand: "clyro-labs-ai", name: "Clyro Labs AI", role: "Selo de moderação e segurança do conteúdo.", light: true },
  { brand: "clyro-icon", name: "Ícone Clyro", role: "Ícone de app e favicon.", light: false },
];

function Brand() {
  return (
    <Shell>
      <PageHeader eyebrow="Marca" title="Logos oficiais">A VisionZ é a marca do produto; a família Clyro é a tecnologia por trás. Use sempre os arquivos originais — nunca redesenhe ou mude as cores.</PageHeader>
      <div className="grid gap-6 md:grid-cols-2">
        {logos.map((l) => (
          <Card key={l.brand} padding="none" className="overflow-hidden">
            <div className={l.light ? "flex h-56 items-center justify-center bg-white" : "flex h-56 items-center justify-center bg-[#080f19]"}>
              <Logo brand={l.brand} size="xl" />
            </div>
            <div className="space-y-1 p-5">
              <p className="font-semibold">{l.name}</p>
              <p className="text-sm text-muted-foreground">{l.role}</p>
              <Caption>{`<Logo brand="${l.brand}" />`}</Caption>
            </div>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
