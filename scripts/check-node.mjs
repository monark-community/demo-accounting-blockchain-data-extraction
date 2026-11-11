// Refuses to build or start on a Node.js release that is still exposed to
// CVE-2026-111497 (Node2Shell), an out-of-bounds write in the Brotli decoder
// bundled with Node.js. Fixed in 22.23.4, 24.22.1 and 26.12.1.
const PATCHED = { 22: [23, 4], 24: [22, 1], 26: [12, 1] };
const NEWEST_LISTED = 26;

const [major, minor, patch] = process.versions.node.split(".").map(Number);
const floor = PATCHED[major];

const ok =
  major > NEWEST_LISTED ||
  (floor !== undefined &&
    (minor > floor[0] || (minor === floor[0] && patch >= floor[1])));

if (!ok) {
  const wanted = Object.entries(PATCHED)
    .map(([m, [mi, pa]]) => `${m}.${mi}.${pa}`)
    .join(", ");
  console.error(
    `Node.js ${process.versions.node} is exposed to CVE-2026-111497 (Node2Shell).\n` +
      `Use a patched release: ${wanted}, or newer on one of those lines.`,
  );
  process.exit(1);
}
