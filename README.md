<div align="center">
<img src="https://raw.githubusercontent.com/sajannethsara/DocsFeed-MCP/dev/Banner.jpg" alt="DocsFeed MCP">
</div>

---

## Why DocsFeed MCP ?

LLMs produce stale code when APIs shift and internal libraries release updates. Pasting documentation into chat windows breaks workflow and context limits.

DocsFeed automates the pipeline:

1. **Crawl & Parse:** Ingests documentation from URLs/sitemaps into clean Markdown chunks.
2. **Embed & Index:** Indexes chunks using OpenAI, Gemini, or local Ollama embeddings with `pgvector`.
3. **Serve via MCP:** Exposes native search tools to your editor through authenticated endpoints.

---

## Features

* **Automated Ingestion:** Crawl sitemaps or nested documentation trees automatically.
* **Native MCP Tools:** AI agents query documentation using structured tools (`search_docs`, `get_page`, `list_sections`).
* **Scoped API Keys:** Each documentation feed generates an isolated endpoint with an authenticated bearer token.
* **Flexible Embedding Providers:** Use OpenAI, Gemini, or run entirely offline using Ollama (`nomic-embed-text`).
* **Management UI:** Built-in Next.js interface to manage crawls, verify indexed pages, and monitor sync status.

---

## Architecture Overview

```
[ Doc URL / Sitemap ]
         │
         ▼
[ Crawler & Parser ] ───► [ Embeddings Engine ]
                                 │ (OpenAI / Gemini / Ollama)
                                 ▼
                     [ PostgreSQL + pgvector ]
                                 │
                                 ▼
                      [ DocsFeed MCP Server ]
                                 │
                ┌────────────────┼────────────────┐
                ▼                ▼                ▼
         Cursor / Windsurf  Claude Desktop   Custom Agents

```

---

## Quickstart

### Prerequisites

* Node.js `>= 20.0.0`
* Docker (recommended for local PostgreSQL) or a serverless PostgreSQL instance (Neon / Supabase)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/sajannethsara/DocsFeed-MCP.git
cd DocsFeed-MCP
npm install

```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env

```

Configure your database and embedding provider credentials in `.env`:

```env
# Database (Local Docker instance)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/docsfeed?schema=public"

# Embeddings (Choose one)
OPENAI_API_KEY="your-openai-key"
# GEMINI_API_KEY="your-gemini-key"
# OLLAMA_BASE_URL="http://localhost:11434"

```

### 3. Start Database & Apply Migrations

If using Docker:

```bash
npm run docker:up
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

```

### 4. Start the Application

```bash
npm run dev

```

The web dashboard runs at `http://localhost:3000`, and the MCP backend service runs at `http://localhost:4000`.

---

## Client Integration

Once an endpoint is created via the dashboard, register it inside your editor's MCP configuration file.

### Configuration (`mcpServers`)

Add the following block to your configuration file (e.g., `claude_desktop_config.json` or Cursor MCP settings):

```json
{
  "mcpServers": {
    "docsfeed-docs": {
      "url": "http://localhost:4000/mcp/<SOURCE_ID>",
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}

```

### Available Agent Tools

Connected clients can invoke the following tools during reasoning:

| Tool | Parameters | Description |
| --- | --- | --- |
| `search_docs` | `query` (string) | Performs semantic similarity search across documentation chunks. |
| `get_page` | `path` (string) | Retrieves the full raw Markdown content for a specific URL path. |
| `list_sections` | *none* | Returns the table of contents and indexed document hierarchy. |

---

## Contributing

Contributions are welcome. Please read the [Contributing Guide](https://www.google.com/search?q=CONTRIBUTING.md) for branch management rules, commit formats, and local testing procedures.

Report issues or submit feature proposals on the [GitHub Issues](https://github.com/sajannethsara/DocsFeed-MCP/issues) tracker.

---

## License

This project is licensed under the [MIT License](https://www.google.com/search?q=LICENSE).