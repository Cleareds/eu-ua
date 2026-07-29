import { revalidatePath } from "next/cache";

/**
 * Art pages are statically rendered and revalidated on a timer (see the
 * `revalidate` export on each page). That timer alone would make admin edits
 * take up to an hour to appear, so every write through the admin API also
 * purges the art routes here — edits show up on the next request, while
 * anonymous traffic and crawlers keep being served from the CDN cache.
 *
 * The whole art section is purged on any write rather than just the edited
 * record, because the pages cross-reference each other: an artwork's page
 * embeds its artist's bio, an artist's page lists their works, and both show
 * movement chips. Working out the exact fan-out per edit is easy to get wrong,
 * and re-rendering a handful of low-traffic pages is cheaper than serving a
 * stale one.
 *
 * The DB is also written to directly by the add-art skill, which cannot call
 * this; that content appears when the timer next expires.
 */
export function revalidateArt() {
  // Index pages
  revalidatePath("/ukrainian-art");
  revalidatePath("/ukrainian-art/art");
  revalidatePath("/ukrainian-art/artists");
  revalidatePath("/ukrainian-art/waves");

  // Every detail page of each type, via the dynamic route pattern
  revalidatePath("/ukrainian-art/art/[slug]", "page");
  revalidatePath("/ukrainian-art/artists/[slug]", "page");
  revalidatePath("/ukrainian-art/waves/[slug]", "page");

  // Slugs may have been added, renamed or unpublished
  revalidatePath("/sitemap.xml");
}
