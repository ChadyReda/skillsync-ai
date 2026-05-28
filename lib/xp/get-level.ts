export function getLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}
