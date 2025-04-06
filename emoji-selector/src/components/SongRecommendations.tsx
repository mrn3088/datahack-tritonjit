import React from "react";
import { Song } from "../types/song";

interface SongRecommendationsProps {
  songs: Song[];
}

const SongRecommendations: React.FC<SongRecommendationsProps> = ({ songs }) => {
  return (
    <div className="song-recommendations">
      <h2>为你推荐的歌曲：</h2>
      <div className="songs-list">
        {songs.map((song) => (
          <div key={song.id} className="song-item">
            <h3>{song.title}</h3>
            <p>{song.artist}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongRecommendations;
