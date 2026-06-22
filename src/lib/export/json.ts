import type { Sprite } from "@/types/sprite";
import { SERIALIZATION_VERSION, serializeSprite } from "@/lib/sprite/serialize";

export function exportJson(sprite: Sprite): string {
  return JSON.stringify(
    {
      v: SERIALIZATION_VERSION,
      sprite: serializeSprite(sprite),
    },
    null,
    2,
  );
}
