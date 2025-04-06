from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
import asyncio
import random
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Emoji Music Recommender API")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # 允许两个端口
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # 明确指定允许的方法
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # 预检请求的缓存时间
)

# 模拟的歌曲数据库
SONGS_DB = [
    {
        "id": "1",
        "title": "Happy",
        "artist": "Pharrell Williams",
        "spotifyUrl": "https://open.spotify.com/track/60nZcImufyMA1MKQY3dcCH",
    },
    {
        "id": "2",
        "title": "Don't Stop Believin'",
        "artist": "Journey",
        "spotifyUrl": "https://open.spotify.com/track/0bX6fqFyBzlc83Hy4MMAjj",
    },
    {
        "id": "3",
        "title": "Good Vibes",
        "artist": "Avicii",
        "spotifyUrl": "https://open.spotify.com/track/1Xh9p1JzqX1j8y8KZ3wU1X",
    },
    {
        "id": "4",
        "title": "Walking on Sunshine",
        "artist": "Katrina & The Waves",
        "spotifyUrl": "https://open.spotify.com/track/5qg5wLbCoxUpS70jC1H2qv",
    },
    {
        "id": "5",
        "title": "I Gotta Feeling",
        "artist": "The Black Eyed Peas",
        "spotifyUrl": "https://open.spotify.com/track/2dqwwm1LPuxuCAw8tBwUg",
    },
]


class EmojiRequest(BaseModel):
    emojis: List[str]


class Song(BaseModel):
    id: str
    title: str
    artist: str
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

        # 模拟API处理延迟
        await asyncio.sleep(1)

        # 随机选择3首歌
        recommended_songs = random.sample(SONGS_DB, 3)
        logger.info(f"Recommended songs: {recommended_songs}")

        return {"songs": recommended_songs}
    except Exception as e:
        logger.error(f"Error in recommend_songs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
