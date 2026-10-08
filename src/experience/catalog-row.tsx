import { useNavigate } from "@tanstack/react-router";
import { Carousel, ContentCard, useToast } from "@/index";
import type { Title } from "./data";
import { useExperience } from "./store";

export function Cover({ src }: { src: string }) {
  return <img src={src} alt="" loading="lazy" width={1280} height={720} className="absolute inset-0 size-full object-cover" />;
}

export function CatalogRow({ title, items }: { title: string; items: Title[] }) {
  const { owned, buy } = useExperience();
  const toast = useToast();
  const nav = useNavigate();
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold tracking-wide">{title}</h2>
      <Carousel label={title}>
        {items.map((t) => {
          const isOwned = owned.includes(t.id);
          return (
            <div key={t.id} className="shrink-0 space-y-2" onClickCapture={(e) => {
              e.preventDefault();
              if (t.priceValue && !isOwned) {
                const ok = buy(t.id, t.title, t.priceValue);
                toast(ok ? { title: `Compra confirmada: ${t.title}`, description: "+1 VZN de recompensa", variant: "reward" } : { title: "Saldo insuficiente", description: "Adicione saldo na Carteira.", variant: "error" });
                if (!ok) return;
              }
              nav({ to: "/app/assistir", search: { id: t.id } });
            }}>
              <ContentCard title={t.title} creator={t.creator} duration={t.duration} rating={t.rating} price={isOwned ? undefined : t.price} cover={<Cover src={t.cover} />} />
            </div>
          );
        })}
      </Carousel>
    </section>
  );
}
