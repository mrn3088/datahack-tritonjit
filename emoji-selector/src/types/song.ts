export interface Song {
  id: string;
  title: string;
  artist: string;
  spotifyUrl: string;
}

export interface SongRecommendationResponse {
  songs: Song[];
}
