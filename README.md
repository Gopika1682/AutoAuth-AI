## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`

2. Run the app:
   `npm run dev`


For admin side login

mail: admin@gmail.com
password: admin@123

Environment variables
---------------------

To enable server-side AI analysis via the Gemini API, set `GEMINI_API_KEY` in a `.env` file at the project root (see `.env.example`). After creating `.env`, restart the server:

```
npm run dev
```

If `GEMINI_API_KEY` is not set the endpoint `/api/analyze` will return fallback responses.