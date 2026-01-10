import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from "express";
import { z } from "zod";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { fetchDateSpots, generateDatePlan } from "./places.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

// Load widget HTML template
function getWidgetHtml(): string {
  try {
    const widgetJs = readFileSync(join(__dirname, "widget.js"), "utf-8");
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">${widgetJs}</script>
</body>
</html>`;
  } catch {
    return `<html><body><div id="root">Loading...</div></body></html>`;
  }
}

// Create MCP Server
const server = new McpServer({
  name: "date-idea-finder",
  version: "1.0.0",
});

// Register the widget template as a resource
server.resource(
  "date-widget",
  "ui://widget/date-planner.html",
  async () => ({
    contents: [{
      uri: "ui://widget/date-planner.html",
      mimeType: "text/html+skybridge",
      text: getWidgetHtml(),
    }],
  })
);

// Define the planDate tool schema
const PlanDateInput = z.object({
  city: z.string().describe("The city where the date will take place"),
  budget: z.enum(["low", "medium", "high"]).describe("Budget level for the date"),
  vibe: z.enum(["artsy", "outdoorsy", "foodie", "chill", "adventurous"]).describe("The vibe/atmosphere desired"),
  timeOfDay: z.enum(["afternoon", "evening", "late night"]).describe("Time of day for the date"),
});

type PlanDateInputType = z.infer<typeof PlanDateInput>;

// Register the planDate tool
server.tool(
  "planDate",
  "Plan a perfect date based on city, budget, vibe, and time of day. Returns venue recommendations, outfit suggestions, and conversation starters.",
  PlanDateInput.shape,
  async ({ city, budget, vibe, timeOfDay }: PlanDateInputType) => {
    console.log(`Planning date: ${city}, ${budget}, ${vibe}, ${timeOfDay}`);

    try {
      // Fetch real venue data from Google Places API
      const spots = await fetchDateSpots(city, budget, vibe, timeOfDay);

      // Generate complete date plan
      const datePlan = generateDatePlan(spots, city, budget, vibe, timeOfDay);

      // Convert to plain object with index signature
      const structuredOutput: Record<string, unknown> = { ...datePlan };

      return {
        structuredContent: structuredOutput,
        content: [{
          type: "text" as const,
          text: `Here's your perfect ${vibe} date plan for ${timeOfDay} in ${city}!`
        }],
        _meta: {
          "openai/outputTemplate": "ui://widget/date-planner.html",
        },
      };
    } catch (error) {
      console.error("Error planning date:", error);
      return {
        structuredContent: {
          error: true,
          message: "Failed to fetch date recommendations. Please try again.",
        } as Record<string, unknown>,
        content: [{ type: "text" as const, text: "Sorry, I couldn't fetch date recommendations right now." }],
      };
    }
  }
);

// Set up HTTP transport for MCP
const mcpTransport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

// MCP endpoint
app.all("/mcp", async (req: Request, res: Response) => {
  try {
    await mcpTransport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "date-idea-finder" });
});

// Serve widget directly for testing
app.get("/widget", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/html");
  res.send(getWidgetHtml());
});

// Connect MCP server to transport
await server.connect(mcpTransport);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Date Idea Finder MCP Server running on http://localhost:${PORT}`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`Widget preview: http://localhost:${PORT}/widget`);
  console.log("\nTo expose via ngrok: ngrok http 3000");
});
