import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import { loadEmojiList } from "./data/emojiList";
import { getSongRecommendations } from "./services/songService";
import SongRecommendations from "./components/SongRecommendations";
import { Song } from "./types/song";

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<string[]>([]);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [emojiList, setEmojiList] = useState<string[]>([]);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<number>(0);

  // Load emojis on mount
  useEffect(() => {
    loadEmojiList().then((emojis) => {
      setEmojiList(emojis);
      // Randomly select initial group
      setCurrentGroup(Math.floor(Math.random() * 8));
    });
  }, []);

  // Memoize generateRandomEmojis function with random group selection
  const generateRandomEmojis = useCallback(() => {
    const groupRanges = [
      [0, 116],
      [117, 204],
      [205, 372],
      [373, 480],
      [481, 597],
      [598, 890],
      [891, 1482],
      [1483, emojiList.length - 1]
    ];

    // Randomly select a group each time
    const randomGroup = Math.floor(Math.random() * groupRanges.length);
    const [start, end] = groupRanges[randomGroup];
    const groupEmojis = emojiList.slice(start, end + 1);
    
    // Filter out already selected emojis from this group
    const availableEmojis = groupEmojis.filter(
      (emoji) => !selections.includes(emoji)
    );

    // If not enough emojis in current group, try another random group
    if (availableEmojis.length < 2) {
      const availableGroups = Array.from({ length: 8 }, (_, i) => i)
        .filter(g => g !== randomGroup);
      const newGroup = availableGroups[Math.floor(Math.random() * availableGroups.length)];
      
      const [newStart, newEnd] = groupRanges[newGroup];
      const newGroupEmojis = emojiList.slice(newStart, newEnd + 1);
      const newAvailableEmojis = newGroupEmojis.filter(
        (emoji) => !selections.includes(emoji)
      );
      const shuffled = [...newAvailableEmojis].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 2);
    }

    const shuffled = [...availableEmojis].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }, [emojiList, selections]);

  // Initialize or reset game
  useEffect(() => {
    if (currentStep === 0) {
      setCurrentOptions(generateRandomEmojis());
    }
  }, [currentStep, generateRandomEmojis]);

  // Handle selection
  const handleSelection = async (selectedEmoji: string) => {
    console.log("handleSelection called with emoji:", selectedEmoji);
    const newSelections = [...selections, selectedEmoji];
    console.log("Updated selections:", newSelections);
    setSelections(newSelections);

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setCurrentOptions(generateRandomEmojis());
    } else {
      console.log("Selection complete, getting recommendations...");
      setIsComplete(true);
      setIsLoading(true);
      try {
        console.log("Calling getSongRecommendations with:", newSelections);
        const response = await getSongRecommendations(newSelections);
        console.log("Received recommendations:", response);
        setRecommendedSongs(response.songs);
      } catch (error) {
        console.error("Failed to get song recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Reset game
  const resetGame = () => {
    setCurrentStep(0);
    setSelections([]);
    setCurrentOptions(generateRandomEmojis());
    setIsComplete(false);
    setRecommendedSongs([]);
  };

  // Generate new options without selecting
  const handleSkip = () => {
    setCurrentOptions(generateRandomEmojis());
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Emoji Selector</h1>
        {!isComplete ? (
          <div className="selection-container">
            <p>Selection {currentStep + 1} of 5</p>
            <div className="emoji-options">
              {currentOptions.map((emoji, index) => (
                <button
                  key={index}
                  className="emoji-button"
                  onClick={() => handleSelection(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="action-buttons">
              <button className="skip-button" onClick={handleSkip}>
                Skip
              </button>
            </div>
          </div>
        ) : (
          <div className="results-container">
            <h2>Your selections:</h2>
            <div className="selected-emojis">
              {selections.map((emoji, index) => (
                <span key={index} className="selected-emoji">
                  {emoji}
                </span>
              ))}
            </div>
            {isLoading ? (
              <p>Finding songs for you...</p>
            ) : (
              <SongRecommendations songs={recommendedSongs} />
            )}
            <button className="reset-button" onClick={resetGame}>
              Start Over
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
