// full_emoji_loader.ts

// Tell the bundler to treat the CSV as a file URL
import emojiCSVUrl from './full_emoji.csv?url';

export const loadEmojiList = async (): Promise<string[]> => {
  try {
    const response = await fetch(emojiCSVUrl);
    const data = await response.text();
    
    return data
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
  } catch (err) {
    console.warn('Failed to fetch emoji CSV. Using fallback.');
    return ["😀", "😂", "🥰", "😎", "🤔", "😴", "🥳", "😍", "🤓", "😇"];
  }
};
