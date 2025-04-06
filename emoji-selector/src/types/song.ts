export interface Song {
  id: string;
  title: string;
  artist: string;
}

export interface SongRecommendationResponse {
  songs: Song[];
}
