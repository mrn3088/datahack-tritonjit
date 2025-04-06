import { Song, SongRecommendationResponse } from "../types/song";

const API_BASE_URL = "http://localhost:8000";

export const getSongRecommendations = async (
  selectedEmojis: string[]
): Promise<SongRecommendationResponse> => {
  console.log("getSongRecommendations called with:", selectedEmojis);

  try {
    console.log("Preparing request to:", `${API_BASE_URL}/api/recommend`);
    const requestBody = {
      emojis: selectedEmojis,
    };
    console.log("Request body:", requestBody);

    const response = await fetch(`${API_BASE_URL}/api/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      mode: "cors",
      body: JSON.stringify(requestBody),
    });

    console.log("Response received:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(`Failed to get recommendations: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Response data:", data);
    return data;
  } catch (error) {
    console.error("Error in getSongRecommendations:", error);
    throw error;
  }
};
