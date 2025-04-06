import os
import json
import logging
import asyncio
from dotenv import load_dotenv
from openai import AsyncOpenAI
from app.data import fetch_data_from_db

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = "You are a helpful musician help recommend songs basic on emojis representing people's mood. "
USER_PROMPT = (
    "Here is a list of songs:\n"
    "{song_list}\n\n"
    "Here is/are emoji(s) in the end: {emojis}\n"
    "Based only on this/these emoji(s), pick top 3 best matching song from the list and "
    "Respond ONLY in the following JSON format:\n"
    "{{\n"
    "  \"Top 1\": \"<song name> <uri>\",\n"
    "  \"Top 2\": \"<song name> <uri>\",\n"
    "  \"Top 3\": \"<song name> <uri>\"\n"
    "}}\n"
    "Do not include any explanation or extra text."
)


class OpenAIClient:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv(
            'OPENAI_API_KEY'), base_url="https://api.deepseek.com")
        self.song_list = None

    async def load_song_list(self):
        df = await asyncio.to_thread(fetch_data_from_db)
        song_list = df.apply(
            lambda row: f"Track Name: {row['track_name']} \n Lyrics: {row['Lyrics']} \n URI: {row['uri']}", axis=1).tolist()
        self.song_list = chr(10).join(song_list)

    async def generate_response(self, emojis: str, max_tokens: int = 200) -> str:
        """
        Generate a response using OpenAI's API

        Args:
            prompt (str): The input prompt
            max_tokens (int): Maximum number of tokens in the response

        Returns:
            str: The generated response
        """
        assert self.song_list is not None, "Song list is not loaded"
        try:
            response = await self.client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": USER_PROMPT.format(
                        song_list=self.song_list, emojis=emojis)},
                ],
                max_tokens=max_tokens
            )
            logger.warning(f"{response.usage.prompt_cache_hit_tokens = }")
            logger.warning(f"{response.usage.prompt_tokens_details = }")
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Error generating OpenAI response: {str(e)}")


async def main():
    client = OpenAIClient()
    await client.load_song_list()
    resp = await client.generate_response("🎵🎶🎵🎶")
    print("Raw response:")
    print(resp)
    try:
        # Clean the response to ensure it's valid JSON
        resp = resp.strip()
        if resp.startswith("```json"):
            resp = resp[7:]
        if resp.endswith("```"):
            resp = resp[:-3]
        resp = resp.strip()

        json_resp = json.loads(resp)
        print("\nParsed JSON response:")
        print(json.dumps(json_resp, indent=2))
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        print("Response was not in valid JSON format")


if __name__ == "__main__":
    asyncio.run(main())
