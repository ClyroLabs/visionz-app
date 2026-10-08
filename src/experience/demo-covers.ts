import neon from "@/assets/demo/series-neon.jpg";
import ocean from "@/assets/demo/series-ocean.jpg";
import album from "@/assets/demo/album-ecos.jpg";

const MAP: Record<string, string> = { neon, ocean, album };
/** Bundled covers for seeded demo catalog items (data.cover_key). */
export const demoCover = (key?: string) => (key ? MAP[key] : undefined);
