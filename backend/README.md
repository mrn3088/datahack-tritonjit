# Emoji Music Recommender Backend

This is the backend service for the Emoji Music Recommender application. It provides a REST API for song recommendations based on emoji selections.

## Features

- FastAPI-based REST API
- Async request handling
- CORS support
- Type validation with Pydantic
- Health check endpoint
- Song recommendation endpoint

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python run.py
```

The server will start at http://localhost:8000

## API Endpoints

- POST /api/recommend
  - Request body: `{"emojis": ["emoji1", "emoji2", ...]}`
  - Returns: List of recommended songs

- GET /health
  - Returns: Server health status

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc 