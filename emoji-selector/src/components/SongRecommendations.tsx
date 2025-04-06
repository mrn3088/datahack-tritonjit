import React, { useState } from "react";
import { Song } from "../types/song";

interface SongRecommendationsProps {
  songs: Song[];
}

const SongRecommendations: React.FC<SongRecommendationsProps> = ({ songs }) => {
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  const handlePlay = (song: Song) => {
    setPlayingSongId(song.id);
    window.open(song.spotifyUrl, "_blank");
  };

  return (
    <div className="song-recommendations">
      <h2>Recommended Songs for You:</h2>
      <div className="songs-list">
        {songs.map((song) => (
          <div key={song.id} className="song-item">
            <div className="song-info">
              <h3>{song.title}</h3>
              <p>{song.artist}</p>
            </div>
            <button
              className={`play-button ${
                playingSongId === song.id ? "playing" : ""
              }`}
              onClick={() => handlePlay(song)}
            >
              {playingSongId === song.id ? "Playing..." : "Play on Spotify"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongRecommendations;
