# Shadow mirror backend

Small Express server that keeps the Gemini API key on the server side
(read from `.env`) and proxies analysis requests from the frontend.

## Setup

```
cd shadow-mirror-backend
npm install
cp .env.example .env
```

Open `.env` and fill in your key:

```
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=3001
```

Get a free key at https://aistudio.google.com/apikey

## Run

```
npm start
```

Server runs at http://localhost:3001

## Endpoint

`POST /api/reflect`

Request body:
```json
{
  "answers": [
    { "question": "...", "answer": "..." }
  ]
}
```

Response: the parsed reflection JSON (logic/empathy/responsibility/consistency
scores + notes, shadow_message, overall_reflection), or `{ "error": "..." }`
on failure.

## Frontend

`shadow_mirror.html` and `shadow_mirror.jsx` both call
`http://localhost:3001/api/reflect` (see the `BACKEND_URL` constant near
the top of the script). Change that constant if you deploy the backend
somewhere other than localhost.