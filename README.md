# Date Idea Finder

A ChatGPT App that uses MCP (Model Context Protocol) to help plan perfect dates based on your city, budget, vibe, and time of day.

## Features

- **Smart Venue Recommendations**: Uses Google Places API to find real venues
- **Personalized Suggestions**: Matches your vibe (artsy, outdoorsy, foodie, chill, adventurous)
- **Complete Date Package**: Primary spot, backup option, outfit suggestion, conversation starters, and end-of-night move

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment (optional)

```bash
cp .env.example .env
```

Add your Google Places API key to `.env` for real venue data. Without it, the app uses curated fallback recommendations.

### 3. Build and run

```bash
npm run build
npm start
```

Server runs at `http://localhost:3000`

### 4. Expose via ngrok

```bash
ngrok http 3000
```

Use the ngrok HTTPS URL as your MCP endpoint when connecting to ChatGPT.

## Endpoints

- `POST /mcp` - MCP protocol endpoint
- `GET /health` - Health check
- `GET /widget` - Widget preview (for testing)

## Tool: planDate

### Inputs

| Parameter | Type | Options |
|-----------|------|---------|
| city | string | Any city name |
| budget | enum | "low", "medium", "high" |
| vibe | enum | "artsy", "outdoorsy", "foodie", "chill", "adventurous" |
| timeOfDay | enum | "afternoon", "evening", "late night" |

### Output

Returns a responsive card showing:
- Primary date spot (name, rating, why it fits, maps link)
- Backup option
- Outfit suggestion
- 2-3 conversation starters
- End-of-night move (dessert/walk/bar suggestion)

## Development

```bash
# Build TypeScript and widget
npm run build

# Build only widget
npm run build:widget

# Run server
npm start

# Build and run
npm run dev
```

## Tech Stack

- TypeScript
- Express
- @modelcontextprotocol/sdk
- Zod (schema validation)
- esbuild (widget bundling)
- Google Places API (optional)
