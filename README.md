# 🧬 Holon: The Genealogy of Ideas

> **Transform linear concepts into explorable, causal knowledge graphs**

Holon is a recursive knowledge mapping engine that traces the evolutionary lineage of ideas, concepts, and technologies. Instead of static timelines or generic knowledge graphs, Holon builds interactive "Knowledge Spines" that users can expand infinitely to understand **how** and **why** concepts came to be.

---

## 🎯 Core Concept

Holon answers the question: **"How did this concept come to be?"**

Instead of showing related concepts, Holon traces **causal chains**:
- 🟠 **Origins**: What sparked this idea?
- 🔵 **Evolution**: How did it develop over time?
- 🟢 **Impact**: What did it enable or influence?

---

## ✨ Features

- **Infinite Expansion**: Click any node to explore its sub-components recursively
- **Causal Mapping**: Edges show cause-and-effect relationships, not just associations
- **Context-Aware**: Expanding "Backpropagation" under "Neural Networks" yields different results than under "Calculus"
- **Visual Hierarchy**: Main spine vs expanded branches for clear navigation
- **Export**: High-resolution PNG export of your knowledge graphs
- **Smart Caching**: Database-backed caching for instant re-loading of popular concepts

---

## 🏗️ Architecture

### Frontend
- **Framework**: React (Vite)
- **Graph Visualization**: React Flow
- **Layout Algorithm**: Dagre (automatic node positioning)
- **State Management**: React Hooks

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with async SQLAlchemy
- **AI Engine**: LangChain with Gemini/LLaMA
- **Caching**: JSONB storage for generated graphs

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add:
# - DATABASE_URL=postgresql+asyncpg://user:password@localhost/holon
# - GOOGLE_API_KEY=your_gemini_key
# - OPENROUTER_API_KEY=your_openrouter_key (optional)

# Run migrations (creates tables)
python -c "from database import engine, Base; import models; import asyncio; asyncio.run(engine.run_sync(Base.metadata.create_all))"

# Start the server
uvicorn main:app --reload
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## 📖 Usage

### Generate a Knowledge Spine

1. Enter a concept in the search box (e.g., "Artificial Intelligence")
2. Wait for the AI to generate the initial knowledge spine (3-5 nodes)
3. The graph shows the genealogical progression from origins → evolution → impact

### Expand Nodes

1. Click the **(+)** button on any node
2. The system generates 4-5 sub-nodes explaining that concept in depth
3. Context is preserved - expanding "History" nodes gives historical detail, "Impact" nodes give modern applications

### Export

Click **"📷 Export PNG"** to download a high-resolution image of your graph

---

## 🎨 Node Types

Holon uses three genealogical categories:

| Type | Color | Meaning | Examples |
|------|-------|---------|----------|
| **origins** | 🟠 Orange | Historical spark, founding moment | "ARPANET (1969)", "Turing Test (1950)" |
| **evolution** | 🔵 Teal | Key turning points, breakthroughs | "Deep Learning Revolution (2012)" |
| **impact** | 🟢 Green | Modern applications, influenced fields | "Self-Driving Cars", "GPT Models" |

---

## 🔧 Configuration

### Change AI Model

Edit `backend/service.py`:

```python
# Use Gemini
ACTIVE_LLM = gemini_llm

# Use LLaMA via OpenRouter
ACTIVE_LLM = llama_llm
```

### Adjust Graph Spacing

Edit the expansion factors in `frontend/src/components/RoadmapGraph.jsx`:

```javascript
const baseRankSep = 150;  // Horizontal spacing
const baseNodeSep = 100;  // Vertical spacing
const expansionFactor = Math.floor(nodes.length / 5);
```

### Database Connection

Set `DATABASE_URL` in `.env`:

```bash
# Local PostgreSQL
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/holon

# Supabase
DATABASE_URL=postgresql+asyncpg://user:password@db.supabase.co:5432/postgres

# Railway
DATABASE_URL=postgresql+asyncpg://user:password@containers-us-west-123.railway.app:5432/railway
```

---

## 🧪 Testing

### Manual Test Cases

Test with these concepts to verify genealogical output:

**Should Work Well:**
- ✅ "Artificial Intelligence" - Clear 1950s → modern progression
- ✅ "The Internet" - ARPANET → TCP/IP → WWW → Modern Web
- ✅ "Blockchain" - Cryptography → Bitcoin → DeFi
- ✅ "Neural Networks" - Perceptron → Backprop → Deep Learning

**Edge Cases:**
- ⚠️ "Love" - Abstract concept, might lack clear timeline
- ⚠️ "Mathematics" - Very broad, might default to generic associations

**Should Fail Gracefully:**
- ❌ "Pizza" - Not a genealogical concept, should just list ingredients

### API Testing

```bash
# Generate a roadmap
curl -X POST http://localhost:8000/roadmap \
  -H "Content-Type: application/json" \
  -d '{"concept": "Neural Networks"}'

# Expand a node
curl -X POST http://localhost:8000/expand \
  -H "Content-Type: application/json" \
  -d '{
    "concept": "Neural Networks",
    "parent_node": "Backpropagation",
    "parent_id": "node-123",
    "context_type": "evolution"
  }'

# Get trending concepts
curl http://localhost:8000/roadmap/trending?limit=10
```

---

## 📊 Data Model

### Node Schema

```python
{
  "id": "unique-id",
  "label": "Perceptron (1958)",
  "type": "origins",  # origins | evolution | impact
  "details": "2-3 sentence explanation",
  "tag": "1958",  # Optional badge
  "year": 1958,   # Optional specific year
  "decade": "1950s",  # Optional decade
  "key_people": ["Frank Rosenblatt"]  # Optional contributors
}
```

### Edge Schema

```python
{
  "source": "node-1",
  "target": "node-2",
  "label": "led to",  # Causal verb
  "influence": "strong"  # weak | moderate | strong
}
```

---

## 🐛 Known Issues

1. **Node Overlap**: Sometimes nodes with long labels overlap
   - **Fix**: Adjust `nodeWidth` in `RoadmapGraph.jsx`

2. **Ghost Edges**: Edges pointing to non-existent nodes
   - **Status**: Filtered automatically by the layout algorithm

3. **Context Drift**: LLM sometimes ignores context and generates generic content
   - **Fix**: Add more explicit examples to system prompts

---

## 🗺️ Roadmap

### Phase 1: Core Refactor (Current)
- [x] Basic graph generation
- [x] Node expansion
- [x] Database caching
- [ ] Fix node overlap issues
- [ ] Improve prompt consistency

### Phase 2: Enhanced Genealogy
- [ ] Chronological sorting
- [ ] Timeline view
- [ ] Narrative summaries
- [ ] Better temporal metadata

### Phase 3: Advanced Features
- [ ] Compare genealogies side-by-side
- [ ] Show "dead ends" (failed branches)
- [ ] Revival tracking (concepts that came back)
- [ ] Export to various formats (PDF, JSON, CSV)

### Phase 4: Integrations
- [ ] Wikipedia timeline scraping
- [ ] Academic citation networks
- [ ] Historical database APIs

---

## 🤝 Contributing

Contributions are welcome! Areas that need help:

1. **Prompt Engineering**: Improve LLM prompts for better genealogical output
2. **Layout Algorithm**: Fix node overlap issues
3. **UI/UX**: Design improvements for better visualization
4. **Testing**: Add automated tests for graph generation

---

## 📜 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- React Flow for the amazing graph visualization library
- Dagre for the layout algorithm
- LangChain for LLM orchestration
- FastAPI for the blazing-fast Python backend

---

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: your-email@example.com

---

**Built with ❤️ for people who want to understand how ideas evolve**