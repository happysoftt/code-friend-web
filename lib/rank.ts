export function calculateLevel(xp: number) {
  // สูตรง่ายๆ: เลเวล = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}