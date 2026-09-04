<div align="center">

# ⚡ DocsFeed MCP

**Turn any documentation site into a live, authenticated Model Context Protocol (MCP) server for your AI agents.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-green.svg)](https://nodejs.org/)
[![Model Context Protocol](https://img.shields.io/badge/Protocol-MCP-purple.svg)](https://modelcontextprotocol.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#-key-features) • [Our Mission](#-our-mission) • [How It Works](#-how-it-works) • [Quickstart](#-quickstart) • [Connecting to AI Clients](#-connecting-to-ai-clients) • [Contributing](#-contributing)

</div>

---

## 🎯 Our Mission

AI coding assistants and autonomous agents are only as good as the context they have. When documentation changes, libraries release new versions, or internal APIs evolve, language models hallucinate or generate outdated code.

**DocsFeed MCP bridges this gap.** 

Our mission is to give every developer and AI agent instantaneous access to up-to-date documentation. Simply paste any documentation URL—DocsFeed crawls it, extracts structured content, embeds it, and provides a dedicated, secured **Model Context Protocol (MCP)** endpoint that connects seamlessly to Claude, Cursor, Windsurf, or any MCP-compatible client.

No more copying and pasting markdown or dealing with stale knowledge cutoffs.

---

## ✨ Key Features

- 🌐 **Instant URL to MCP Server**: Point to any documentation website or sitemap and convert it into a live MCP server in minutes.
- ⚡ **Real-time Doc Querying**: Exposes powerful native MCP tools like `search_docs`, `get_page`, and `list_sections` directly to your AI agents.
- 🔒 **Per-Source API Key Security**: Each doc source gets its own isolated endpoint and hashed API key—safe for multi-agent workflows.
- 📊 **Visual Management Dashboard**: A clean Next.js dashboard to create, inspect, re-crawl, and monitor all your documentation feeds.
- 🧩 **Pluggable Embeddings**: Run completely free and local with **Ollama** or scale with **OpenAI** embeddings.
- ☁️ **Zero-Redis & Serverless-Ready**: Runs effortlessly on serverless Postgres (Neon / Supabase) with zero extra infrastructure headaches.

---

## 🔄 How It Works

```
 ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
 │   Submit URL    │ ───►  │ Crawl & Vector  │ ───►  │ Live MCP Server │
 │ (Any Doc Site)  │       │   Processing    │       │ (Secure API Key)│
 └─────────────────┘       └─────────────────┘       └─────────────────┘
                                                              │
                                                              ▼
                                                   ┌─────────────────────┐
                                                   │  AI Agents / IDEs   │
                                                   │  • Cursor / Claude  │
                                                   │  • Windsurf / Agents│
                                                   └─────────────────────┘
```

1. **Submit**: Enter the root URL of any framework, library, or API doc site in the dashboard.
2. **Process**: DocsFeed crawls the pages, converts them into clean structured Markdown, and creates semantic embeddings.
3. **Connect**: Copy your generated MCP server URL and API key into your favorite AI tool and start querying live documentation with perfect accuracy.

---

## 🚀 Quickstart

Get up and running locally in under 3 minutes:

### 1. Clone & Install
```bash
git clone https://github.com/sajannethsara/DocsFeed-MCP.git
cd DocsFeed-MCP
npm install
```

### 2. Configure Environment
```bash
# Copy template config
cp .env.example .env
```
*(Add your PostgreSQL connection string from [Neon](https://neon.tech/) / [Supabase](https://supabase.com/) or local Postgres in `.env`)*

### 3. Migrate & Seed Sample Data
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4. Run Development Servers
```bash
npm run dev
```

- 🌐 **Web Dashboard:** [http://localhost:3000](http://localhost:3000)
- ⚙️ **API & MCP Server:** [http://localhost:4000](http://localhost:4000)
- 📖 **Swagger API Docs:** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

> [!TIP]
> For a comprehensive setup walkthrough, local Docker options, and troubleshooting, check out our **[Contribution Guide](CONTRIBUTING.md)**.

---

## 🔌 Connecting to AI Clients

Once your documentation feed is active, connect it to any MCP-enabled tool:

### Claude Desktop / Cursor / Windsurf MCP Configuration
Add to your `mcpServers` settings:

```json
{
  "mcpServers": {
    "docsfeed-nestjs": {
      "url": "http://localhost:4000/mcp/your-doc-source-id",
      "headers": {
        "Authorization": "Bearer your-docsfeed-api-key"
      }
    }
  }
}
```

Now your AI assistant can invoke tools like:
- `search_docs({ query: "How to implement guards in NestJS" })`
- `get_page({ path: "/controllers" })`
- `list_sections()`

---

## 🤝 Contributing

We welcome contributions of all kinds! Whether you're fixing bugs, adding new embedding providers, or improving documentation:

- 📖 Read our **[Contributing Guide](CONTRIBUTING.md)** for developer setup, scripts, and conventions.
- 💡 Submit feature ideas or report bugs via [GitHub Issues](https://github.com/sajannethsara/DocsFeed-MCP/issues).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
