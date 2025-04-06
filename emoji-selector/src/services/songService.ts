import { Song, SongRecommendationResponse } from "../types/song";

// 模拟的歌曲数据
const dummySongs: Song[] = [
  {
    id: "1",
    title: "Happy",
    artist: "Pharrell Williams",
    spotifyUrl: "https://open.spotify.com/track/60nZcImufyMA1MKQY3dcCH",
  },
  {
    id: "2",
    title: "Don't Stop Believin'",
    artist: "Journey",
    spotifyUrl: "https://open.spotify.com/track/0bX6fqFyBzlc83Hy4MMAjj",
  },
  {
    id: "3",
    title: "Good Vibes",
    artist: "Avicii",
    spotifyUrl: "https://open.spotify.com/track/1Xh9p1JzqX1j8y8KZ3wU1X",
  },
  {
    id: "4",
    title: "Walking on Sunshine",
    artist: "Katrina & The Waves",
    spotifyUrl: "https://open.spotify.com/track/5qg5wLbCoxUpS70jC1H2qv",
  },
  {
    id: "5",
    title: "I Gotta Feeling",
    artist: "The Black Eyed Peas",
    spotifyUrl: "https://open.spotify.com/track/2dqwwm1LPuxuCAw8tBwUg",
  },
];

// 模拟API调用
export const getSongRecommendations = async (
  selectedEmojis: string[]
): Promise<SongRecommendationResponse> => {
  // 模拟API延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 随机选择3首歌
  const shuffled = [...dummySongs].sort(() => 0.5 - Math.random());
  const recommendedSongs = shuffled.slice(0, 3);

  return {
    songs: recommendedSongs,
  };
};
