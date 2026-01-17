/**
 * Blizzard Character Render Utilities
 *
 * Generates URLs for Blizzard's character render CDN.
 * URL Format: https://render.worldofwarcraft.com/{region}/character/{realm-slug}/{partition}/{characterId}-avatar.jpg
 *
 * Rate limits (for reference):
 * - 100 requests per second
 * - 36,000 requests per hour
 *
 * Since we construct URLs directly (no API calls needed), rate limits don't apply.
 */

/**
 * Converts a server/realm name to a URL-safe slug
 * Examples:
 * - "Area 52" -> "area-52"
 * - "MoonGaurd" -> "moon-gaurd"
 * - "Blade'sEdge" -> "blades-edge"
 * - "Area52" -> "area-52"
 * - "Raid52Kings" -> "raid-52-kings"
 */
export function getRealmSlug(server: string): string {
  return server
    // Insert hyphen before uppercase letters that follow lowercase letters or digits (CamelCase)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    // Insert hyphen between letters and digits
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    // Insert hyphen between digits and letters
    .replace(/(\d)([a-zA-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/'/g, '')        // Remove apostrophes
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/--+/g, '-')     // Clean up multiple hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove any other special characters
}

/**
 * Calculates the partition number for the character render URL
 * The partition is characterId modulo 256
 */
export function getPartition(characterId: number): number {
  return characterId % 256;
}

/**
 * Generates a Blizzard character avatar URL
 *
 * @param playerId - The character's unique ID from Warcraft Logs
 * @param server - The server/realm name
 * @param region - The region (defaults to 'us')
 * @returns The full URL for the character's avatar with fallback
 */
export function getCharacterAvatarUrl(
  playerId: number,
  server: string,
  region: 'us' | 'eu' = 'us'
): string {
  const partition = getPartition(playerId);
  const realmSlug = getRealmSlug(server);

  const baseUrl = `https://render.worldofwarcraft.com/${region}/character/${realmSlug}/${partition}/${playerId}-avatar.jpg`;

  // Add fallback parameter for missing renders (race=1, gender=0)
  return `${baseUrl}?alt=/shadow/avatar/1-0.jpg`;
}

/**
 * Generates a Blizzard character main render URL (full body)
 * Note: This endpoint may not always be available for all characters
 *
 * @param playerId - The character's unique ID
 * @param server - The server/realm name
 * @param region - The region (defaults to 'us')
 * @returns The full URL for the character's main render
 */
export function getCharacterMainRenderUrl(
  playerId: number,
  server: string,
  region: 'us' | 'eu' = 'us'
): string {
  const partition = getPartition(playerId);
  const realmSlug = getRealmSlug(server);

  return `https://render.worldofwarcraft.com/${region}/character/${realmSlug}/${partition}/${playerId}-main.jpg`;
}
