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

  // Load emojis on mount
  useEffect(() => {
    loadEmojiList().then((emojis) => {
      setEmojiList(emojis);
    });
  }, []);

  // Memoize generateRandomEmojis function
  const generateRandomEmojis = useCallback(() => {
    const availableEmojis = emojiList.filter(
      (emoji) => !selections.includes(emoji)
    );
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
    const newSelections = [...selections, selectedEmoji];
    setSelections(newSelections);

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setCurrentOptions(generateRandomEmojis());
    } else {
      setIsComplete(true);
      setIsLoading(true);
      try {
        const response = await getSongRecommendations(newSelections);
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
        <h1>Emoji 选择器</h1>
        {!isComplete ? (
          <div className="selection-container">
            <p>第 {currentStep + 1} 次选择 (共5次)</p>
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
                换一对
              </button>
            </div>
          </div>
        ) : (
          <div className="results-container">
            <h2>你的选择是：</h2>
            <div className="selected-emojis">
              {selections.map((emoji, index) => (
                <span key={index} className="selected-emoji">
                  {emoji}
                </span>
              ))}
            </div>
            {isLoading ? (
              <p>正在为你推荐歌曲...</p>
            ) : (
              <SongRecommendations songs={recommendedSongs} />
            )}
            <button className="reset-button" onClick={resetGame}>
              重新开始
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
