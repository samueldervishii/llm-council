# Installation

This guide will help you set up LLM Council on your local machine.

## Prerequisites

Before installing LLM Council, ensure you have:

- **Python 3.10+** for the backend
- **Node.js 18+** for the frontend
- **MongoDB** running locally or a MongoDB Atlas connection
- **OpenRouter API Key** (or other LLM provider keys)

## Backend Setup

### 1. Clone the Repository

```bash
git clone https://github.com/samueldervishii/llm-council.git
cd llm-council
```

### 2. Set Up Python Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# OpenRouter API Key
OPENROUTER_API_KEY=your_openrouter_api_key_here

# MongoDB Connection
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=llm_council
```

### 5. Start the Backend

```bash
python main.py
```

The API will be available at `http://localhost:8000`.

!!! success "Verify Installation"
Visit `http://localhost:8000` in your browser. You should see:
`json
    {"message": "LLM Council API", "status": "running", "version": "{{ version }}"}
    `

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd ../frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## MongoDB Setup

### Option 1: Local MongoDB

Install MongoDB locally following the [official guide](https://www.mongodb.com/docs/manual/installation/).

Start MongoDB:

```bash
mongod
```

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URL` in your `.env` file

## Verify Everything Works

1. **Backend**: Visit `http://localhost:8000/redoc` to see the API documentation
2. **Frontend**: Visit `http://localhost:5173` to see the chat interface
3. **Test a Query**: Ask a question in the chat to verify the council is working

## Next Steps

- [Quickstart Guide](quickstart.md) - Learn how to use LLM Council
- [Configuration](configuration.md) - Customize your council setup
- [API Reference](../api/overview.md) - Explore the full API
