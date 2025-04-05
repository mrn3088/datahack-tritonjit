// Import the emoji data file
import emojiDataText from './full_emoji.csv';

// Parse emoji data from CSV
const parseEmojiData = (data: string): string[] => {
  const lines = data.split('\n');
  return lines
    .slice(1) // Skip header
    .map(line => line.split(',')[0]) // Take first column (emoji)
    .filter(emoji => emoji && emoji.trim()); // Remove empty entries
};

// Parse and export the emoji list
export const EMOJI_LIST = parseEmojiData(emojiDataText); 