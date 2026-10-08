# Lumen — News that learns what you read

A personalized news reader. Browse the latest stories, follow topics, and get a home feed that re-ranks itself from explicit interests plus reading behavior (views, likes, saves, skips).

## Features

- Personalized home feed with explanations ("Similar to stories you saved")
- Explore by category, search with filters (relevance / newest / most relevant to me)
- Article reading view with related stories
- Like, save/bookmark, share, "not interested"
- Saved stories, reading history grouped by day, interests/preferences, profile
- JWT auth (register / login / demo account), bcrypt password hashing
- Content-based recommendation engine (documented below) — no fake ML claims
- Runs with zero setup: no MongoDB or news API key required (in-memory demo store + 30-article seed)

Demo login: `demo@lumen.news` / `demo1234`

## Tech stack

- Frontend: React 18, Vite, React Router 6, Tailwind CSS 3, Axios, lucide-react
- Backend: Node.js, Express 4, Mongoose 8, JWT, bcryptjs, express-validator, helmet
- Database: MongoDB (optional — falls back to an in-memory store with the same API)

## Folder structure

```
server/src/
  config/        env, db connection (mongo w/ memory fallback)
  data/          seedArticles.js (30 realistic dev articles)
  models/        User, Article, Interaction (mongoose schemas)
  routes/        auth, articles, recommendations, interactions, users
  controllers/   thin request handlers
  services/      store.js (memory fallback), recommendationService.js, newsService.js
  middleware/    auth (required + optional), error handler
  app.js, server.js, seed.js
client/src/
  components/    Navbar, Layout, ArticleCards (4 variants), BookmarkButton, ...
  pages/         Home, Explore, Category, ArticleDetail, Search, Saved, ...
  context/       AuthContext (user + liked/saved/skipped markers)
  lib/           api.js (axios instance, time helpers)
```

## Getting started

Prerequisites: Node 18+.

```bash
# 1. install
npm run install:all
# or: npm --prefix server install && npm --prefix client install

# 2. configure (optional — app runs without it)
cp .env.example server/.env
# edit server/.env: set MONGO_URI and JWT_SECRET for production-like runs

# 3. run
npm run dev:server   # API on http://localhost:5000
npm run dev:client   # web app on http://localhost:5173 (in another terminal)

# 4. seed (only needed when using MongoDB)
npm run seed
```

Build the client: `npm run build` (outputs `client/dist`).

## Environment variables

| Var | Required | What |
|---|---|---|
| `PORT` | no (default 5000) | API port |
| `MONGO_URI` | no | MongoDB connection string. Empty = demo memory mode |
| `JWT_SECRET` | yes in prod | Token signing secret |
| `JWT_EXPIRES_IN` | no | e.g. `7d` |
| `CLIENT_URL` | no | Allowed CORS origin |
| `NEWS_API_KEY` | no | NewsAPI.org key for the live provider path |
| `GNEWS_API_KEY` | no | GNews key for today's live headlines (`GET /api/live`). Empty = demo seed fallback |
| `VITE_API_URL` | no | Client override, default `/api` (vite proxies to :5000 in dev) |
| `AI_API_KEY` | no | OpenAI-compatible key for AI summaries + Ask Lumen. Empty = extractive fallback |
| `AI_BASE_URL` | no | Chat-completions base URL (default `https://api.openai.com/v1`) |
| `AI_MODEL` | no | Model name (default `gpt-4o-mini`) |
| `ADMIN_EMAILS` | no | Comma-separated admin emails (default `demo@lumen.news`) |

## API documentation

Base: `/api`. Auth: `Authorization: Bearer <jwt>`.

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | – | `{name, email, password}` → `{token, user}` |
| POST | `/auth/login` | – | `{email, password}` → `{token, user}` |
| GET | `/auth/me` | yes | Current user |
| GET | `/articles?category=&search=&sort=&page=&limit=` | – | List articles |
| GET | `/articles/categories` | – | Category counts |
| GET | `/live?category=&q=&page=&pageSize=` | – | Today's live headlines via GNews (seed fallback when no key) |
| GET | `/articles/:id` | – | One article |
| GET | `/recommendations/feed?limit=` | optional | Ranked feed + `reasons` map |
| GET | `/recommendations/related/:id` | optional | Related stories + reasons |
| POST | `/interactions` | yes | `{articleId, type: VIEW\|OPEN\|LIKE\|UNLIKE\|SAVE\|UNSAVE\|SKIP\|UNSKIP\|SHARE}` |
| GET | `/interactions/mystate` | yes | `{liked[], saved[], skipped[]}` |
| GET | `/interactions/history` | yes | Recent views (deduped per article) |
| DELETE | `/interactions/history` | yes | Clear view history |
| GET | `/users/preferences` | yes | `{interests, preferredTopics, language}` |
| PUT | `/users/preferences` | yes | Save interests |
| PATCH | `/users/profile` | yes | Update name/avatar |
| GET | `/trending?limit=` | optional | Engagement-ranked stories + score breakdown |
| GET | `/articles/:id/context` | optional | Topic cluster + Lumen summary + trust signals |
| GET | `/ai/summary/:id` | optional | AI/extractive summary: key points, why-it-matters, what's next |
| POST | `/ai/ask` | optional | `{articleId, question}` → grounded answer from the article |
| GET | `/admin/stats` | admin | Read-only metrics: users, articles, engagement, provider status |
| GET | `/health` | – | `{ok, demo, time}` |

## Recommendation algorithm

`server/src/services/recommendationService.js` — content-based, explainable.

Per-article score:

```
score = 3.0 × interestSimilarity
      + category/tag/keyword similarity to liked, saved and recently read stories
      + 1.0 × recencyScore (exp decay, ~72h half-life)
      − 4.0 if already read
      − 10.0 if skipped (also hard-excluded)
```

- `interestSimilarity`: match of the article's category/tags/keywords against explicit interests.
- Content similarity: `0.45 × categoryMatch + 0.30 × tagJaccard + 0.25 × cosine(TF vectors)` over title + description + tags + category (stopwords removed).
- Liked/saved references get 1.25×/1.15× boosts.
- Ranking: sort by score, cap at 3 per category in the top 75% (diversity), fill the remaining 25% with newest unseen stories from under-represented categories ("Outside your usual feed").
- Every recommendation carries a short reason ("Similar to stories you liked", "Because you read similar stories", "Matches your interest in AI") shown subtly under the card.

## News provider abstraction

`server/src/services/newsService.js` exposes `fetchFromProvider()` + `normalizeNewsApiItem()`. With `NEWS_API_KEY` set it can pull NewsAPI.org top headlines and normalize them to the internal `{title, description, content, image, source, url, category, tags, publishedAt}` shape with heuristic categorization. Without a key the API serves the local seed dataset. Swap the provider by replacing that one module.

## Future improvements

- Persist the memory store to disk for demo durability
- Background news sync job + deduplication
- Reading-time-weighted signals and session-based rerank
- Full-text search index (MongoDB Atlas Search / Postgres tsvector)
- Email verification, password reset, OAuth
