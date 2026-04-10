// Service layer exports for the Ga Bible Study app

// YouVersion API (text content)
export { getVersions, getChapterContent, BOOK_IDS } from "./youversion";
export type { BookMapping } from "./youversion";

// Bible Brain API (audio content)
export {
  getFilesetId,
  getChapterAudioUrl,
  getPlayableAudioUrl,
  getVerseTiming,
  listFilesets,
  GA_FILESETS,
} from "./biblebrain";

// Study Data (Strong's, Spurgeon, Lady Guyon)
export {
  getStrongDefinition,
  getAllStrongEntries,
  getSpurgeonCommentary,
  getSpurgeonChapterCommentary,
  getDevotionalEntry,
  getAllDevotionalEntries,
  getDevotionalsByVerse,
} from "./studyData";
