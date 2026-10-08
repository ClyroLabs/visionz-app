import neon from "@/assets/demo/series-neon.jpg";
import ocean from "@/assets/demo/series-ocean.jpg";
import album from "@/assets/demo/album-ecos.jpg";
import trio from "@/assets/demo/trio-meninada-capa.jpg.asset.json";

const MAP: Record<string, string> = { neon, ocean, album, trio: trio.url };
/** Bundled covers for seeded demo catalog items (data.cover_key). */
export const demoCover = (key?: string) => (key ? MAP[key] : undefined);
