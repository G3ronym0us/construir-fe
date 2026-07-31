import type { Category } from "@/types";

/**
 * "¿Quisiste decir plomeria?" para las búsquedas sin resultados.
 *
 * Un error de tipeo en un buscador que acepta nombre y slug casi siempre está
 * a una o dos letras del término correcto, así que basta con la distancia de
 * edición contra ambos campos y un techo proporcional al largo de lo escrito.
 */

/** Distancia de Levenshtein en O(min(a,b)) de memoria. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, substitution);
    }
    previous = current;
  }

  return previous[b.length];
}

/** Sin acentos y en minúsculas: "Plomería" y "plomeria" son el mismo término. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * El candidato más cercano al término buscado, o `null` si ninguno está lo
 * bastante cerca como para que sugerirlo ayude en vez de confundir.
 */
export function suggestCategory(
  query: string,
  categories: Category[]
): string | null {
  const needle = normalize(query.trim());
  if (needle.length < 3) return null;

  // Un tercio del término: "plomeira" alcanza a "plomeria", "cemento" no
  // alcanza a "pinturas".
  const maxDistance = Math.max(1, Math.floor(needle.length / 3));

  let best: { label: string; distance: number } | null = null;

  for (const category of categories) {
    for (const candidate of [category.name, category.slug]) {
      if (!candidate) continue;

      const distance = editDistance(needle, normalize(candidate));
      if (distance <= maxDistance && (!best || distance < best.distance)) {
        best = { label: candidate, distance };
      }
    }
  }

  return best?.label ?? null;
}
