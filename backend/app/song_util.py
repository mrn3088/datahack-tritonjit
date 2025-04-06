import logging
import json
import asyncio
from app.openai_client import OpenAIClient

logger = logging.getLogger(__name__)


async def get_song_recommendation(client: OpenAIClient, emojis: str, refresh_song_list: bool = False) -> list[str]:
    # await asyncio.sleep(10000000000)
    if refresh_song_list:
        await client.load_song_list()
    resp = await client.generate_response(emojis)
    logger.warning(f"Raw response: {resp}")
    try:
        # Clean the response to ensure it's valid JSON
        resp = resp.strip()
        if resp.startswith("```json"):
            resp = resp[7:]
        if resp.endswith("```"):
            resp = resp[:-3]
        resp = resp.strip()

        json_resp = json.loads(resp)
        logger.warning(f"Parsed JSON response: {json_resp}")
        uris = []
        for val in json_resp.values():
            uri = val.split(" ")[-1]
            uri = uri.split(":")[-1]
            uris.append(uri)
        return uris
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing JSON: {e}")
        logger.error("Response was not in valid JSON format")


async def main():
    client = OpenAIClient()
    await client.load_song_list()
    logger.warning(await get_song_recommendation(client, "🎵🎶🎵🎶"))


if __name__ == "__main__":
    asyncio.run(main())
