import React from "react";
import { Song } from "../types/song";

interface SongRecommendationsProps {
  songs: Song[];
}

const SongRecommendations: React.FC<SongRecommendationsProps> = ({ songs }) => {
  return (
    <div className="song-recommendations">
      <h2>Recommended Songs for You:</h2>
      <div className="songs-list">
        {songs.map((song) => (
          <div key={song.spotifyUrl} className="song-item">
            <iframe
              src={`https://open.spotify.com/embed/track/${song.spotifyUrl
                .split("/")
                .pop()}`}
              width="100%"
              height="152"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongRecommendations;
