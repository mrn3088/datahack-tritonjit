import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import { loadEmojiList } from "./data/emojiList";
import { getSongRecommendations } from "./services/songService";
import SongRecommendations from "./components/SongRecommendations";
import { Song } from "./types/song";

function App() {
  const [likedEmojis, setLikedEmojis] = useState<string[]>([]);
  const [currentEmoji, setCurrentEmoji] = useState<string>("");
  const [totalRecommendations, setTotalRecommendations] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);
  const [emojiList, setEmojiList] = useState<string[]>([]);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState<number>(0);
  const [currentX, setCurrentX] = useState<number>(0);
  const [isExiting, setIsExiting] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);

  // Load emojis on mount
  useEffect(() => {
    loadEmojiList().then((emojis) => {
      setEmojiList(emojis);
      generateNewEmoji(emojis);
    });
  }, []);

  // Generate a new random emoji
  const generateNewEmoji = useCallback(
    (emojis: string[] = emojiList) => {
      const availableEmojis = emojis.filter(
        (emoji) => !likedEmojis.includes(emoji)
      );
      if (availableEmojis.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableEmojis.length);
        setCurrentEmoji(availableEmojis[randomIndex]);
      }
    },
    [emojiList, likedEmojis]
  );

  // Handle touch/mouse events for swipe
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    setIsExiting(false);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setCurrentX(clientX);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setCurrentX(clientX);

    const diff = clientX - startX;
    // Calculate the angle based on the swipe distance
    const angle = Math.atan2(diff, 100) * (180 / Math.PI);

    // Only set swipe direction if angle is significant (more than 30 degrees)
    if (Math.abs(angle) > 30) {
      setSwipeDirection(diff > 0 ? "right" : "left");
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (swipeDirection) {
      setIsExiting(true);
      // Increase timeout to match longer animation duration
      setTimeout(() => {
        handleEmojiResponse(swipeDirection === "right");
        setIsExiting(false);
        setSwipeDirection(null);
        setCurrentX(startX);
      }, 500); // Increased from 300ms to 500ms
    } else {
      // Return to center if not swiped enough
      setCurrentX(startX);
      setSwipeDirection(null);
    }
  };

  // Handle emoji like/dislike
  const handleEmojiResponse = async (liked: boolean) => {
    if (liked) {
      const newLikedEmojis = [...likedEmojis, currentEmoji];
      setLikedEmojis(newLikedEmojis);

      if (newLikedEmojis.length >= 5) {
        setIsComplete(true);
        setIsLoading(true);
        try {
          const response = await getSongRecommendations(newLikedEmojis);
          setRecommendedSongs(response.songs);
        } catch (error) {
          console.error("Failed to get song recommendations:", error);
        } finally {
          setIsLoading(false);
        }
        return;
      }
    }

    setTotalRecommendations((prev) => prev + 1);
    if (totalRecommendations + 1 >= 10) {
      setIsComplete(true);
      setIsLoading(true);
      try {
        const response = await getSongRecommendations(likedEmojis);
        setRecommendedSongs(response.songs);
      } catch (error) {
        console.error("Failed to get song recommendations:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    generateNewEmoji();
  };

  // Reset game
  const resetGame = () => {
    setLikedEmojis([]);
    setTotalRecommendations(0);
    setIsComplete(false);
    setRecommendedSongs([]);
    generateNewEmoji();
  };

  // Calculate transform style based on swipe
  const getTransformStyle = () => {
    if (!isDragging && !isExiting) return {};
    const diff = currentX - startX;
    // Calculate the angle for rotation
    const angle = Math.atan2(diff, 100) * (180 / Math.PI);
    // Limit the rotation to a reasonable range
    const rotate = Math.max(Math.min(angle * 0.5, 30), -30);

    const translateX = isExiting
      ? swipeDirection === "right"
        ? window.innerWidth
        : -window.innerWidth
      : diff;

    // Add scale effect for exit animation
    const scale = isExiting ? 0.5 : 1;

    return {
      transform: `translateX(${translateX}px) rotate(${rotate}deg) scale(${scale})`,
      transition: isDragging ? "none" : "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      opacity: isExiting ? 0 : 1,
    };
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Emoji Selector</h1>
        {!isComplete ? (
          <div className="selection-container">
            <p>
              Liked: {likedEmojis.length}/5 | Total: {totalRecommendations}/10
            </p>
            <div className="emoji-display">
              <div
                ref={emojiRef}
                className={`current-emoji ${
                  swipeDirection ? `swipe-${swipeDirection}` : ""
                }`}
                style={getTransformStyle()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseMove={handleTouchMove}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
              >
                {currentEmoji}
                {swipeDirection && (
                  <div className={`swipe-indicator ${swipeDirection}`}>
                    {swipeDirection === "right" ? "✓" : "✕"}
                  </div>
                )}
              </div>
              <div className="swipe-hint">
                <span className="swipe-left">👎 Swipe left to dislike</span>
                <span className="swipe-right">Swipe right to like 👍</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="results-container">
            <h2>Your liked emojis:</h2>
            <div className="selected-emojis">
              {likedEmojis.map((emoji, index) => (
                <span key={index} className="selected-emoji">
                  {emoji}
                </span>
              ))}
            </div>
            {isLoading ? (
              <p>Finding songs for you...</p>
            ) : (
              <>
                <SongRecommendations songs={recommendedSongs} />
                <button className="reset-button" onClick={resetGame}>
                  Start Over
                </button>
              </>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
