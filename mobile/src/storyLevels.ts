/** Story levels use CSV row order and keep the user on the same card after a wrong answer. */
export function isStoryLevel(csvName: string): boolean {
  return /\bStory\s*-/i.test(csvName.replace(/\.csv$/i, ""));
}
