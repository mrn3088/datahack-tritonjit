from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
import asyncio
import random
import logging
from app.song_util import get_song_recommendation
from app.openai_client import OpenAIClient

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize global OpenAI client
openai_client = OpenAIClient()

app = FastAPI(title="Emoji Music Recommender API")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# 模拟的歌曲数据库
SONGS_DB = [
    {
        "spotifyUrl": "https://open.spotify.com/track/60nZcImufyMA1MKQY3dcCH",
    },
    {
        "spotifyUrl": "https://open.spotify.com/track/4wJ5Qq0jBN4ajy7ouZIV1c",
    },
    {
        "spotifyUrl": "https://open.spotify.com/track/7ne4VBA60CxGM75vw0EYad",
    },
    {
        "spotifyUrl": "https://open.spotify.com/track/3QaPy1KgI7nu9FJEQUgn6h",
    },
    {
        "spotifyUrl": "https://open.spotify.com/track/3AdXwuFn7j21HNiFMXvZXt",
    },
]


class EmojiRequest(BaseModel):
    emojis: List[str]


class Song(BaseModel):
    spotifyUrl: str


class SongResponse(BaseModel):
    songs: List[Song]


@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )


@app.options("/api/recommend")
async def options_recommend():
    return JSONResponse(
        status_code=200,
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Accept",
            "Access-Control-Max-Age": "3600",
        }
    )


@app.post("/api/recommend", response_model=SongResponse)
async def recommend_songs(request: EmojiRequest):
    try:
        logger.info(f"Received emojis: {request.emojis}")

        # Load song list if not already loaded
        if openai_client.song_list is None:
            await openai_client.load_song_list()

        # Get song recommendations using OpenAI
        emojis_str = " ".join(request.emojis)
        song_uris = await get_song_recommendation(openai_client, emojis_str)
        logger.warning(f"Song URIs: {song_uris}")
        # Convert URIs to Song objects
        recommended_songs = [
            {"spotifyUrl": f"https://open.spotify.com/track/{uri}"} for uri in song_uris]

        logger.info(f"Recommended songs: {recommended_songs}")

        return {"songs": recommended_songs}
    except Exception as e:
        logger.error(f"Error in recommend_songs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.on_event("startup")
async def startup_event():
    """Initialize OpenAI client and load song list during application startup"""
    try:
        logger.info("Initializing OpenAI client and loading song list...")
        await openai_client.load_song_list()
        logger.info(
            "OpenAI client initialized and song list loaded successfully")
    except Exception as e:
        logger.error(f"Error initializing OpenAI client: {str(e)}")
        # We don't raise an exception here to allow the application to start
        # The client will be initialized on the first request if needed
