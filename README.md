# LLM Council

Query multiple AI models and get a synthesized answer from a chairman model.

Inspired by [karpathy/llm-council](https://github.com/karpathy/llm-council).

## Models

**Council Members:**
- NVIDIA Nemotron 9B
- Gemini 2.0 Flash
- Gemma 3 27B
- GPT OSS 20B

**Chairman:**
- Grok 4.1 Fast

## Setup

1. Get your API key at [openrouter.ai/keys](https://openrouter.ai/keys)

2. Add it to `backend/.env`:
```
OPENROUTER_API_KEY=your_key_here
```

3. Run backend:
```bash
cd backend
pip install -r requirements.txt
python main.py
```

4. Run frontend:
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173
