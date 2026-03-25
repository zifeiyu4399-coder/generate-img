# generate-img

Generate image from mermaid diagram using mermaid-cli. Provides both CLI and REST API.

## Installation

```bash
npm install
```

## CLI Usage

```bash
npm run generate
```

### CLI Configuration

- `input`: `architecture.mmd` - your mermaid diagram file
- `output`: `architecture.png` - output PNG image

## REST API Server

Start the API server:

```bash
# Start server
npm start

# Development mode with auto-reload
npm run dev
```

Server runs on `http://localhost:3000` by default. Set port with environment variable:
```bash
PORT=8080 npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate` | Generate image from mermaid content |
| POST | `/api/generate/upload` | Generate image from uploaded .mmd file |
| GET | `/api/images/:filename` | Get generated image |
| DELETE | `/api/images/:filename` | Delete generated image |
| GET | `/api/list` | List all generated images |
| GET | `/api/health` | Health check |

See [API.md](./API.md) for full API documentation.

## Example

### Generate from content with curl

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"mermaidContent": "graph LR\nA[开始] --> B[结束]"}'
```
