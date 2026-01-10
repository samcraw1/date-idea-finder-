// Date Idea Finder Widget - Renders in ChatGPT
declare global {
  interface Window {
    openai: {
      toolInput: any;
      toolOutput: any;
      toolResponseMetadata: any;
      widgetState: any;
      theme: "light" | "dark";
      locale: string;
      callTool: (name: string, args: any) => Promise<any>;
      setWidgetState: (state: any) => void;
      notifyIntrinsicHeight: (height: number) => void;
      openExternal: (url: string) => void;
    };
  }
}

interface Venue {
  name: string;
  address: string;
  rating: number;
  priceLevel: number;
  url: string;
  photoUrl?: string;
  whyItFits: string;
}

interface DatePlan {
  primarySpot: Venue;
  backupOption: Venue;
  outfitSuggestion: string;
  conversationStarters: string[];
  endOfNightMove: {
    type: string;
    suggestion: string;
    venue?: Venue;
  };
  city: string;
  vibe: string;
  timeOfDay: string;
  budget: string;
  error?: boolean;
  message?: string;
}

// Styles
const styles = `
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --bg-card: #ffffff;
    --text-primary: #1a1a2e;
    --text-secondary: #4a4a68;
    --text-muted: #6c757d;
    --accent: #e63946;
    --accent-light: #fdf2f2;
    --border: #e9ecef;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --radius: 12px;
  }

  .dark {
    --bg-primary: #1a1a2e;
    --bg-secondary: #16213e;
    --bg-card: #1f2937;
    --text-primary: #f8f9fa;
    --text-secondary: #cbd5e1;
    --text-muted: #94a3b8;
    --accent: #f87171;
    --accent-light: #2d1f1f;
    --border: #374151;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 16px;
  }

  .header {
    text-align: center;
    margin-bottom: 24px;
  }

  .header h1 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .header .subtitle {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .badge-row {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 12px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border: 1px solid var(--border);
  }

  .card {
    background: var(--bg-card);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    margin-bottom: 16px;
    overflow: hidden;
  }

  .card-header {
    padding: 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    background: var(--accent-light);
  }

  .card-title {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    margin-bottom: 2px;
  }

  .card-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .card-body {
    padding: 16px;
  }

  .venue-info {
    margin-bottom: 12px;
  }

  .venue-rating {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .stars {
    color: #fbbf24;
    font-size: 14px;
  }

  .rating-text {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .price-dots {
    display: flex;
    gap: 2px;
  }

  .price-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border);
  }

  .price-dot.filled {
    background: var(--accent);
  }

  .why-fits {
    font-size: 14px;
    color: var(--text-secondary);
    font-style: italic;
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: 8px;
    margin-bottom: 12px;
  }

  .link-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    background: var(--accent);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: opacity 0.2s;
  }

  .link-btn:hover {
    opacity: 0.9;
  }

  .backup-card {
    background: var(--bg-secondary);
  }

  .backup-card .card-header {
    border-bottom-color: var(--border);
  }

  .outfit-text {
    font-size: 15px;
    color: var(--text-secondary);
    line-height: 1.7;
  }

  .starters-list {
    list-style: none;
  }

  .starters-list li {
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
    font-size: 15px;
    color: var(--text-secondary);
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .starters-list li:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .starter-num {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--accent-light);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .end-night {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .end-icon {
    font-size: 32px;
  }

  .end-content h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
    text-transform: capitalize;
  }

  .end-content p {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .loading {
    text-align: center;
    padding: 48px 24px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    text-align: center;
    padding: 32px;
    color: var(--accent);
  }

  @media (max-width: 480px) {
    .container {
      padding: 12px;
    }

    .header h1 {
      font-size: 20px;
    }

    .card-name {
      font-size: 16px;
    }
  }
`;

// Render stars for rating
function renderStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let stars = "★".repeat(fullStars);
  if (hasHalf) stars += "½";
  stars += "☆".repeat(5 - fullStars - (hasHalf ? 1 : 0));
  return stars;
}

// Render price dots
function renderPriceDots(level: number): string {
  let dots = "";
  for (let i = 1; i <= 4; i++) {
    dots += `<span class="price-dot ${i <= level ? "filled" : ""}"></span>`;
  }
  return dots;
}

// Get icon for end of night type
function getEndIcon(type: string): string {
  const icons: Record<string, string> = {
    dessert: "🍰",
    walk: "🌙",
    bar: "🍸",
    food: "🌮",
    activity: "🎯",
  };
  return icons[type] || "✨";
}

// Render venue card
function renderVenueCard(venue: Venue, label: string, icon: string, isBackup = false): string {
  return `
    <div class="card ${isBackup ? "backup-card" : ""}">
      <div class="card-header">
        <div class="card-icon">${icon}</div>
        <div>
          <div class="card-title">${label}</div>
          <div class="card-name">${venue.name}</div>
        </div>
      </div>
      <div class="card-body">
        <div class="venue-info">
          <div class="venue-rating">
            <span class="stars">${renderStars(venue.rating)}</span>
            <span class="rating-text">${venue.rating.toFixed(1)}</span>
            <div class="price-dots">${renderPriceDots(venue.priceLevel)}</div>
          </div>
        </div>
        <div class="why-fits">"${venue.whyItFits}"</div>
        <button class="link-btn" onclick="window.openai?.openExternal?.('${venue.url}') || window.open('${venue.url}', '_blank')">
          View on Maps →
        </button>
      </div>
    </div>
  `;
}

// Main render function
function render() {
  const root = document.getElementById("root");
  if (!root) return;

  // Check for data
  const data: DatePlan | null = window.openai?.toolOutput;
  const theme = window.openai?.theme || "light";

  // Apply theme
  document.documentElement.className = theme === "dark" ? "dark" : "";

  // Inject styles
  if (!document.getElementById("widget-styles")) {
    const styleEl = document.createElement("style");
    styleEl.id = "widget-styles";
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  // Handle loading state
  if (!data) {
    root.innerHTML = `
      <div class="container">
        <div class="loading">
          <div class="loading-spinner"></div>
          <p>Planning your perfect date...</p>
        </div>
      </div>
    `;
    return;
  }

  // Handle error state
  if (data.error) {
    root.innerHTML = `
      <div class="container">
        <div class="error">
          <p>${data.message || "Something went wrong. Please try again."}</p>
        </div>
      </div>
    `;
    return;
  }

  // Render full date plan
  root.innerHTML = `
    <div class="container">
      <div class="header">
        <h1>Your Date Plan</h1>
        <p class="subtitle">${data.city} • ${data.timeOfDay}</p>
        <div class="badge-row">
          <span class="badge">💰 ${data.budget} budget</span>
          <span class="badge">✨ ${data.vibe}</span>
        </div>
      </div>

      ${renderVenueCard(data.primarySpot, "Primary Spot", "📍")}
      ${renderVenueCard(data.backupOption, "Backup Option", "🔄", true)}

      <div class="card">
        <div class="card-header">
          <div class="card-icon">👔</div>
          <div>
            <div class="card-title">What to Wear</div>
            <div class="card-name">Outfit Suggestion</div>
          </div>
        </div>
        <div class="card-body">
          <p class="outfit-text">${data.outfitSuggestion}</p>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-icon">💬</div>
          <div>
            <div class="card-title">Keep It Flowing</div>
            <div class="card-name">Conversation Starters</div>
          </div>
        </div>
        <div class="card-body">
          <ul class="starters-list">
            ${data.conversationStarters
              .map(
                (starter, i) =>
                  `<li><span class="starter-num">${i + 1}</span>${starter}</li>`
              )
              .join("")}
          </ul>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-icon">🌃</div>
          <div>
            <div class="card-title">End the Night Right</div>
            <div class="card-name">Closing Move</div>
          </div>
        </div>
        <div class="card-body">
          <div class="end-night">
            <span class="end-icon">${getEndIcon(data.endOfNightMove.type)}</span>
            <div class="end-content">
              <h4>${data.endOfNightMove.type}</h4>
              <p>${data.endOfNightMove.suggestion}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Notify ChatGPT of content height
  window.openai?.notifyIntrinsicHeight?.(root.scrollHeight);
}

// Initialize widget
function init() {
  // Listen for data updates from ChatGPT
  window.addEventListener("openai:set_globals", render);

  // Initial render
  render();

  // Auto-call planDate if we have input but no output (on load behavior)
  if (window.openai?.toolInput && !window.openai?.toolOutput) {
    const { city, budget, vibe, timeOfDay } = window.openai.toolInput;
    if (city && budget && vibe && timeOfDay) {
      window.openai.callTool?.("planDate", { city, budget, vibe, timeOfDay });
    }
  }
}

// Run on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
