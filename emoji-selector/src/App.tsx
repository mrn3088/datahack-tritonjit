import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import { loadEmojiList } from "./data/emojiList";
import { getSongRecommendations } from "./services/songService";
import SongRecommendations from "./components/SongRecommendations";
import { Song } from "./types/song";
import LoadingSpinner from "./components/LoadingSpinner";

// Particle types
type Particle = {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  tr: number;
  type: "heart" | "shatter";
};

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
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showParticles, setShowParticles] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);
  const particleIdCounter = useRef<number>(0);

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

  // Create particles for effects
  const createParticles = useCallback(
    (type: "heart" | "shatter", count: number = 15) => {
      if (!emojiRef.current) return;

      const rect = emojiRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Determine if particles should come from left or right edge
      const isRightSwipe = swipeDirection === "right";
      const edgeX = isRightSwipe ? 0 : rect.width; // Left edge for right swipe, right edge for left swipe

      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const id = particleIdCounter.current++;

        // Random vertical position along the edge with more spread
        const edgeY = Math.random() * rect.height;

        // Calculate angle towards the center with more randomness
        const angleToCenter = Math.atan2(centerY - edgeY, centerX - edgeX);

        // Add more randomness to the angle
        const randomAngle =
          angleToCenter + (Math.random() - 0.5) * Math.PI * 0.8;

        // Add a slight curve to the path
        const curveFactor = (Math.random() - 0.5) * 0.5;
        const curvedAngle = randomAngle + curveFactor;

        // Distance varies more
        const distance = 100 + Math.random() * 300;

        // Calculate target position with more spread
        const tx = Math.cos(curvedAngle) * distance;
        const ty = Math.sin(curvedAngle) * distance;

        // More random rotation
        const tr = Math.random() * 720 - 360;

        newParticles.push({
          id,
          x: edgeX,
          y: edgeY,
          tx,
          ty,
          tr,
          type,
        });
      }

      setParticles(newParticles);
      setShowParticles(true);

      // Remove particles after animation completes
      setTimeout(() => {
        setShowParticles(false);
      }, 1500); // Reduced from 3000ms to 1500ms
    },
    [swipeDirection]
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

      // Delay particle creation slightly to let the emoji start moving
      setTimeout(() => {
        // Create particles based on swipe direction
        if (swipeDirection === "right") {
          createParticles("heart", 25);
        } else {
          createParticles("shatter", 20);
        }
      }, 100);

      // Wait for the emoji to exit and particles to finish before showing next emoji
      setTimeout(() => {
        handleEmojiResponse(swipeDirection === "right");
        setIsExiting(false);
        setSwipeDirection(null);
        setCurrentX(startX);
      }, 1500); // Increased to match particle animation duration
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

    // Add a small delay before generating the next emoji
    setTimeout(() => {
      generateNewEmoji();
    }, 100);
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

  // Get particle style with animation
  const getParticleStyle = (particle: Particle) => {
    const isHeart = particle.type === "heart";
    const color = isHeart ? "#2ecc71" : "#e74c3c";
    const scale = 0.8 + Math.random() * 0.4; // Random scale between 0.8 and 1.2
    const duration = 0.8 + Math.random() * 0.4; // Random duration between 0.8s and 1.2s
    const delay = Math.random() * 0.1; // Random delay between 0s and 0.1s

    return {
      position: "absolute" as const,
      left: `${particle.x}px`,
      top: `${particle.y}px`,
      fontSize: isHeart ? `${1.5 * scale}rem` : `${1 * scale}rem`,
      color: color,
      zIndex: 20,
      animation: `particleAnimation-${particle.id} ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s forwards`,
      opacity: 0,
    };
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="app-title">Moodify</h1>
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

              {/* Particles container */}
              {showParticles && (
                <div className="particles-container">
                  {particles.map((particle) => (
                    <div key={particle.id} style={getParticleStyle(particle)}>
                      {particle.type === "heart" ? "❤️" : "💔"}
                    </div>
                  ))}
                </div>
              )}

              <div className="swipe-hint">
                <span className="swipe-left">👎 Swipe left to dislike</span>
                <span className="swipe-right">Swipe right to like 👍</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="complete-container">
            {isLoading ? (
              <LoadingSpinner />
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

      {/* Add keyframe animations for each particle */}
      <style>
        {`
          ${particles
            .map(
              (particle) => `
            @keyframes particleAnimation-${particle.id} {
              0% {
                opacity: 0;
                transform: translate(0, 0) scale(0.5);
              }
              20% {
                opacity: 0.8;
                transform: translate(${particle.tx * 0.4}px, ${
                particle.ty * 0.4
              }px) rotate(${particle.tr * 0.4}deg) scale(1.1);
              }
              60% {
                opacity: 1;
                transform: translate(${particle.tx * 0.8}px, ${
                particle.ty * 0.8
              }px) rotate(${particle.tr * 0.8}deg) scale(1.2);
              }
              100% {
                opacity: 0;
                transform: translate(${particle.tx * 1.2}px, ${
                particle.ty * 1.2
              }px) rotate(${particle.tr * 1.2}deg) scale(0.8);
              }
            }
          `
            )
            .join("")}
        `}
      </style>
    </div>
  );
}

export default App;
