# Zenvia Assistant

A single-file AI chatbot that runs entirely in your browser. No backend, no build step, no installs. Just open `Zenvia-Assistant.html`, add your API key, and start chatting.

Zenvia comes with five ready-made modes, voice input and spoken replies, task reminders, and an interactive quiz generator.

---

## Features

| Feature | What it does |
|---|---|
| **General assistant** | Ask anything and get clear, concise answers |
| **Topic explainer** | A one-line definition, key ideas, a real-world example, and quick check questions |
| **Interview coach** | Mock HR, behavioural and technical interviews, one question at a time, with feedback |
| **Task planner** | Turns goals into small, prioritised steps with time estimates |
| **Quiz** | Generates multiple-choice quizzes on any topic and difficulty, scores you, and keeps your recent history |
| **Voice mode** | Hands-free conversation: speak, hear the reply, and keep talking |
| **Dictation** | Tap the microphone button to speak a message instead of typing |
| **Read aloud** | Replies are spoken using your browser's built-in text-to-speech (adjustable voice and speed) |
| **Reminders** | Set task reminders with an in-chat alert, a beep, a spoken message and a browser notification |
| **Short answers toggle** | Keep replies brief or let them run longer |
| **Streaming replies** | Text appears as it is generated |
| **Auto-retry and backup model** | Temporary server errors (502/503/504) are retried, then one attempt is made on a backup model |

---

## Supported AI providers

Pick a provider in **Settings**. Each provider keeps its own API key, model ID and base URL.

| Provider | Default model | Notes |
|---|---|---|
| **Anthropic (Claude)** | `claude-sonnet-4-6` | Also available: `claude-opus-4-5`, `claude-haiku-4-5` |
| **Google Gemini** | `gemini-3.5-flash-lite` | Uses Google's OpenAI-compatible endpoint; backup model `gemini-3.1-flash-lite` |
| **OpenAI-compatible** | `gpt-4o-mini` | Works with OpenAI or any service that offers a `/chat/completions` API (change the Base URL) |

---

## Quick start

1. **Install Node.js 18 or newer** from https://nodejs.org
2. **Clone or download** this repository, then run:
   ```bash
   cd Zenvia-Assistant
   npm start
   ```
3. Open **http://localhost:3000** in Chrome or Edge.
4. Click the **Settings** button, choose a provider, paste your **API key**, press **Test connection**, then **Save**.
5. Pick a mode from the sidebar and start chatting.

No `npm install` is needed because the server has no dependencies. Use `npm run dev` to restart it automatically while editing. To change the port, copy `.env.example` to `.env` and edit `PORT`.

You can also open `public/index.html` directly in the browser. Chat will work, but the microphone will ask for permission every time (see below).

### Getting an API key

- **Anthropic:** https://console.anthropic.com
- **Google Gemini:** https://aistudio.google.com/apikey
- **OpenAI:** https://platform.openai.com/api-keys

---

## Microphone and voice note

Voice features use the browser's Web Speech API, so they work best in **Google Chrome or Edge**.

- Speech input needs **https://** or **localhost**. If the file is opened straight from disk (`file://`), Chrome asks for microphone permission on every use.
- A website cannot grant itself microphone access. To stop the prompts, serve the file from localhost or https and choose **Allow** once.
- To set it permanently, click the lock icon in the address bar, then **Site settings**, then set **Microphone** to **Allow**.
- Browsers can't hear the microphone without an internet connection, because Chrome's speech recognition uses an online service.

---

## Deploying on Netlify with a server-side API key

A public site has no API key by default, which causes the message *"The assistant is not configured yet"*. Fix it by storing your key on the server. Visitors then use the chatbot with no key of their own, and your key is never exposed in the web page.

1. Push this project to GitHub (keep the `netlify/` folder).
2. On Netlify choose **Add new project, Import an existing project, GitHub**. The settings in `netlify.toml` are picked up automatically.
3. Go to **Site configuration, Environment variables** and add at least one key:

   | Variable | Value |
   |---|---|
   | `GEMINI_API_KEY` | key from https://aistudio.google.com/apikey |
   | `ANTHROPIC_API_KEY` | key from https://console.anthropic.com |
   | `OPENAI_API_KEY` | key from https://platform.openai.com/api-keys |
   | `DEFAULT_PROVIDER` (optional) | `gemini`, `anthropic` or `openai` |
   | `ALLOWED_MODELS` (optional) | comma-separated model list |
   | `MAX_TOKENS` (optional) | per-reply cap, default 3000 |

4. Go to **Deploys, Trigger deploy, Deploy site** so the variables take effect.

Notes:
- The proxy lives in `netlify/functions/chat.js`. It only allows approved models, caps reply length, and applies a basic rate limit.
- Replies on the hosted site arrive all at once instead of word by word.
- Dragging only the `public` folder into Netlify does **not** include the function. Use the GitHub method above (or the Netlify CLI).
- Because the key is yours, set a spending limit with your provider.
- Locally, copy `.env.example` to `.env`, add a key, and run `npm start`. The same proxy runs in `server.js`.

---

## Hosting on GitHub Pages (optional)

GitHub Pages serves over https, so the microphone permission is remembered.

1. Keep the app at `public/index.html`, or copy it to the repository root as `index.html`.
2. Go to **Settings, then Pages** in your repository.
3. Under **Source**, choose your branch and the `/ (root)` folder, then save.
4. Open the link GitHub gives you.

---

## Privacy and security

- Everything runs in your browser. There is no Zenvia server.
- Your **API key, chat history, reminders, quiz history and settings** are saved in your browser's `localStorage` only.
- Your messages and key are sent **only to the provider you select**.
- Anyone with access to your browser profile could read the saved key. Use it on your own device.
- **Never commit a real API key to GitHub.** Enter it in the Settings panel; it is not stored in the file.
- On a shared or public deployment, consider using a key with a spending limit.

---

## Project structure

```
Zenvia-Assistant/
├── public/
│   └── index.html        # The entire app (HTML + CSS + JavaScript)
├── docs/
│   └── Zenvia-Assistant-Code.pdf
├── netlify/functions/chat.js   # Secure API proxy (keeps your key on the server)
├── netlify.toml
├── server.js             # Dependency-free static server + local proxy
├── package.json
├── .env.example          # Optional PORT / HOST settings
├── .gitignore
├── LICENSE
└── README.md
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **"Not configured yet" / "No API key is set"** | Add a key in Settings, or set `GEMINI_API_KEY` (or another provider key) in Netlify environment variables and redeploy. |
| **HTTP 401 / 403** | Your API key is wrong or lacks access. Check it in Settings. |
| **HTTP 404** | The model ID or base URL is wrong for that provider. |
| **HTTP 429** | You hit a rate or quota limit. Wait a moment and retry. |
| **HTTP 503 / "model is busy"** | Temporary overload. Zenvia retries automatically, then tries the backup model. |
| **"Could not reach…"** | Check your internet connection, the Base URL, or whether a network or extension is blocking the request. |
| **Microphone blocked** | Allow the microphone for the site (lock icon), and use localhost or https. |
| **No voice replies** | Turn on **Read aloud**, or try another voice in the voice settings. Some browsers have no speech voices installed. |
| **Notifications not showing** | Allow notifications for the site when the browser asks. |

---

## Browser support

- **Best:** Google Chrome, Microsoft Edge (full voice support)
- **Works for text chat:** Firefox, Safari (voice input is limited or unavailable)

---

## Tech

Plain HTML, CSS and vanilla JavaScript in one file. Uses the Web Speech API (recognition and synthesis), the Notification API, `fetch` with streaming, and `localStorage`. The only external resource is the Manrope font from Google Fonts.

---

## License

Add the license of your choice here (for example, MIT).
