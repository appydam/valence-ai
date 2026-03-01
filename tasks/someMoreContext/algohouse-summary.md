# AlgoHouse Codebase Summary

## Project Overview

**AlgoHouse** is a Flask-based frontend web application that acts as a proxy and demo interface for the AlgoHouse backend API (`https://api.algohouse.ai`). It is **not** a data collection platform — it surfaces cryptocurrency/financial market data from an existing backend.

---

## Project Structure

```
algohouse/
└── algohouse-fe/
    └── algohouse-fe/
        ├── flaskApp.py        — Main Flask app (routes, proxy logic, SSE streaming)
        ├── api_utils.py       — Query param builder, compatibility API conversion
        ├── ah_utils.py        — HMAC-SHA256 signing utility
        ├── email_utils.py     — Contact form email sender
        ├── Email_.py          — MailSender class with attachment support
        ├── smtp_send.py       — Core SMTP sending logic
        ├── settings.py        — Config (API domain, email, rate limits)
        ├── main.py            — Utilities module
        ├── requirements.txt   — Python dependencies
        ├── Dockerfile         — Container config (waitress on port 8090)
        ├── .gitlab-ci.yml     — CI/CD pipeline (builds on git tags)
        └── templates/
            ├── js/
            │   ├── api-demo-actions.js   — Frontend API demo logic
            │   └── contact-form.js       — Contact form submission
            ├── css/, scss/, img/, vendor/
            └── *.jinja2                  — HTML templates
```

---

## Key Dependencies

```
Flask==2.2.2
Flask-Session==0.4.0
Flask-Cors==3.0.10
requests==2.27.1
pandas==1.5.2
numpy==1.26.4
Werkzeug==2.2.3
waitress==2.1.2
py-dotenv>=0.1
```

---

## Core Functionality

### 1. API Proxy Layer
The app forwards requests to `https://api.algohouse.ai` with optional HMAC-SHA256 signing.

- **Unsigned calls:** Capped at `limit=20` via `api_utils.build_unsigned_call_args()`
- **Signed calls:** Append `signerEmail`, `requestTimestamp`, and `signature` query params
- **Signing:** `ah_utils.signature(key, msg)` — HMAC-SHA256 hex digest

### 2. Contact Form
Collects user inquiry data (name, company, email, product interests) and emails to `support@algohouse.ai`.

- Route: `POST /ims/contact-form-submit`
- Handled by: `email_utils.send_mail_v2()`

### 3. Real-time Streaming
Server-Sent Events (SSE) stream from `/stream` endpoint. Parses:
- `!` prefix → trades
- `$` prefix → orders
- `#` prefix → comments

---

## Backend API Endpoints (`https://api.algohouse.ai`)

All data is sourced from this backend. Results of live testing:

| # | Endpoint | Auth Required | Test Result |
|---|----------|---------------|-------------|
| 1 | `GET /instruments` | No (public) | ✅ 200 OK |
| 2 | `GET /trades` | Yes (x-api-key header) | ❌ 403 |
| 3 | `GET /orderbooks` | Yes | ❌ 401 |
| 4 | `GET /trades_aggregated` | Yes | ❌ 401 |
| 5 | `GET /multi/trades` | Yes | ❌ 401 |
| 6 | `GET /option_quotes` | Yes | ❌ 401 |
| 7 | `GET /data/v2/histoday` | Yes | ❌ 401 |
| 8 | `GET /data/v2/histohour` | Yes | ❌ 401 |
| 9 | `GET /data/v2/histominute` | Yes | ❌ 401 |
| 10 | `GET /data/ob/l1/top` | Yes | ❌ 401 |
| 11 | `GET /data/v2/ob/l2/snapshot` | Yes | ❌ 401 |
| 12 | `GET /stream` (SSE) | Yes | ❌ 400 (missing symbol) |

### Key Findings from Testing
- **Only 1/12 endpoints** work without credentials (`/instruments`)
- The app's "unsigned with limit=20" fallback **does not bypass auth** — the backend enforces authentication regardless
- `/trades` specifically requires an `x-api-key` HTTP header (different from other endpoints)
- `/stream` requires both auth and a `symbol` parameter
- Historical endpoints (`histoday`, `histohour`, `histominute`) auto-convert `toTs` param from datetime string → Unix timestamp via `api_utils.adjust_args_for_compatibility_api()`

---

## API Reference — What Each Endpoint Does

---

### 1. `GET /instruments`

**Purpose:** Returns the full list of exchanges and trading instruments supported by the AlgoHouse API.

**Auth:** None (public endpoint)

**Request Parameters:** None

**Sample Request:**
```
curl -s "https://api.algohouse.ai/instruments"
```

**Response format** (space-delimited plain text, one instrument per line):
```
<exchange>  <instrument>  <type>  <base>  <quote>  <price_decimals>  <has_trades>  <has_orderbook>  <has_futures>  <has_other_quotes>
```

**Sample Response:**
```
coinbase BTC-USD spot BTC USD 2 1 1 0 0
binance BTCUSDT spot BTC USDT 2 1 1 0 0
binance/o BNB-230317-260-P option BNB USD 4 0 0 0 1
```

**Response fields:**
| Field | Description |
|-------|-------------|
| exchange name | Name of the exchange (e.g. `coinbase`, `binance`) |
| instrument name | Trading pair symbol (e.g. `BTC-USD`) |
| instrument type | `spot`, `perpetual`, or `option` |
| base currency | Base asset (e.g. `BTC`) |
| quote currency | Quote asset (e.g. `USD`) |
| price decimals | Number of decimal places in price |
| has_trades | `1` if trade data is available |
| has_orderbook | `1` if order book data is available |
| has_futures | `1` if futures data is available |
| has_other_quotes | `1` if other quote data (e.g. options) is available |

---

### 2. `GET /trades`

**Purpose:** Returns historical individual trade executions for a specific exchange and instrument.

**Auth:** Required (HMAC-signed)

**Request Parameters:**
| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `ex` | string | Exchange name | `coinbase` |
| `ins` | string | Instrument name | `BTC-USD` |
| `from` | datetime | Start time (ISO 8601) | `2023-01-10T00:00:00` |
| `to` | datetime | End time (ISO 8601) | `2023-01-10T06:00:00` |
| `limit` | integer | Max records to return (1–10000) | `20` |
| `signerEmail` | string | Authenticated user's email | `user@example.com` |
| `requestTimestamp` | integer | Unix ms timestamp of request | `1673308800000` |
| `signature` | string | HMAC-SHA256 signature | `abc123...` |

**Sample Request:**
```
curl -s "https://api.algohouse.ai/trades?ex=coinbase&ins=BTC-USD&from=2023-01-10T00:00:00&to=2023-01-10T06:00:00&limit=20&signerEmail=user@example.com&requestTimestamp=1673308800000&signature=<sig>"
```

**Response fields** (space-delimited, one trade per line):
| Field | Description |
|-------|-------------|
| timestamp | Unix milliseconds |
| side | Buy/sell indicator |
| price | Trade price |
| quantity | Trade size/volume |

---

### 3. `GET /orderbooks`

**Purpose:** Returns historical order book raw deltas (incremental changes) for a specific exchange and instrument.

**Auth:** Required (HMAC-signed)

**Request Parameters:**
| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `ex` | string | Exchange name | `coinbase` |
| `ins` | string | Instrument name | `BTC-USD` |
| `from` | datetime | Start time (ISO 8601) | `2023-01-10T00:00:00` |
| `limit` | integer | Max records to return | `20` |
| `signerEmail` | string | Authenticated user's email | |
| `requestTimestamp` | integer | Unix ms timestamp | |
| `signature` | string | HMAC-SHA256 signature | |

**Response fields** (space-delimited, one record per line):
| Field | Description |
|-------|-------------|
| timestamp | Unix milliseconds |
| side | Buy/sell indicator |
| orderbook delta/snapshot | Price and quantity changes |
| R (optional) | Reset indicator — if present, this is a full snapshot, not a delta |

---

### 4. `GET /trades_aggregated`

**Purpose:** Returns OHLCV (candlestick) aggregated trade data for a specific exchange and instrument over a chosen time interval.

**Auth:** Required (HMAC-signed)

**Request Parameters:**
| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `ex` | string | Exchange name | `coinbase` |
| `ins` | string | Instrument name | `BTC-USD` |
| `from` | datetime | Start time (ISO 8601) | `2023-01-10T00:00:00` |
| `to` | datetime | End time (ISO 8601) | `2023-01-10T06:00:00` |
| `limit` | integer | Max records | `20` |
| `aggregation` | string | Time interval: `1m`, `15m`, `1h`, `1d` | `1h` |
| `signerEmail` | string | Authenticated user's email | |
| `requestTimestamp` | integer | Unix ms timestamp | |
| `signature` | string | HMAC-SHA256 signature | |

**Response fields** (one candle per line):
| Field | Description |
|-------|-------------|
| timestamp | Unix ms, rounded to aggregation period |
| open | Opening price in period |
| high | Highest price in period |
| low | Lowest price in period |
| close | Closing price in period |
| volume | Total volume traded in period |
| count | Number of raw trade records in period |
| vwap | Volume-weighted average price for the period |

---

### 5. `GET /multi/trades`

**Purpose:** Returns historical trades across multiple exchanges and instruments simultaneously, filtered by base and quote currency pairs.

**Auth:** Required (HMAC-signed)

**Request Parameters:**
| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `exchanges` | string | Comma-separated exchange names | `coinbase` |
| `base_currencies` | string | Comma-separated base currencies | `BTC` |
| `quote_currencies` | string | Comma-separated quote currencies | `USDT` |
| `from` | datetime | Start time (ISO 8601) | `2023-01-10T00:00:00` |
| `to` | datetime | End time (ISO 8601) | `2023-01-10T06:00:00` |
| `limit` | integer | Max records | `20` |
| `signerEmail` | string | Authenticated user's email | |
| `requestTimestamp` | integer | Unix ms timestamp | |
| `signature` | string | HMAC-SHA256 signature | |

**Response fields** (one trade per line):
| Field | Description |
|-------|-------------|
| timestamp | Unix milliseconds |
| exchange | Exchange where trade occurred |
| instrument | Instrument name |
| side | Buy/sell indicator |
| price | Trade price |
| quantity | Trade size/volume |

---

### 6. `GET /option_quotes`

**Purpose:** Returns historical options quote data including Greeks, implied volatility, and market prices for a specific options instrument.

**Auth:** Required (HMAC-signed)

**Request Parameters:**
| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `ex` | string | Exchange name (options) | `binance/o` |
| `ins` | string | Options instrument name | `BNB-230317-260-P` |
| `from` | datetime | Start time (ISO 8601) | `2023-03-10T00:00:00` |
| `to` | datetime | End time (ISO 8601) | `2023-03-10T03:00:00` |
| `signerEmail` | string | Authenticated user's email | |
| `requestTimestamp` | integer | Unix ms timestamp | |
| `signature` | string | HMAC-SHA256 signature | |

> Instrument format: `{ASSET}-{EXPIRY}-{STRIKE}-{TYPE}` e.g. `BTC-24FEB23-14000-P` (P=put, C=call)

**Response fields:**
| Field | Description |
|-------|-------------|
| timestamp | Unix milliseconds |
| Instrument_Name | Full options instrument name |
| Underlying_price | Price of the underlying asset |
| Settlement_price | Settlement price |
| Open_interest | Total open interest |
| Min_price / Max_price | Price range |
| Mark_price | Mark price used for settlement |
| Mark_iv | Implied volatility at mark price |
| Last_price | Last traded price |
| Interest_rate | Risk-free interest rate |
| Index_price | Index price |
| Greek_vega | Vega (sensitivity to volatility) |
| Greek_theta | Theta (time decay) |
| Greek_rho | Rho (sensitivity to interest rate) |
| Greek_gamma | Gamma (rate of delta change) |
| Greek_delta | Delta (sensitivity to underlying price) |
| Estimated_delivery_price | Projected delivery price |
| Bid_iv / Ask_iv | Implied volatility for bid/ask |
| Best_bid_amount / Best_bid_price | Best bid |
| Best_ask_amount / Best_ask_price | Best ask |
| Volume_24h | 24-hour trading volume |

---

### 7. `GET /data/v2/histoday`

**Purpose:** Returns daily OHLCV (candlestick) historical data for a currency pair, compatible with the CryptoCompare-style API format.

**Auth:** Required (HMAC-signed)

**Request Parameters:**
| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `fsym` | string | Base (from) symbol | `BTC` |
| `tsym` | string | Quote (to) symbol | `USDT` |
| `e` | string | Exchange name | `coinbase` |
| `aggregate` | integer | Number of periods to aggregate | `1` |
| `toTs` | datetime | End datetime (auto-converted to Unix timestamp) | `2023-03-10T00:00:00` |
| `limit` | integer | Number of data points to return | `100` |
| `signerEmail` | string | Authenticated user's email | |
| `requestTimestamp` | integer | Unix ms timestamp | |
| `signature` | string | HMAC-SHA256 signature | |

> `toTs` is automatically converted from ISO 8601 datetime → Unix timestamp by the Flask proxy

**Response:** Daily OHLCV candles (open, high, low, close, volume) per day

---

### 8. `GET /data/v2/histohour`

**Purpose:** Returns hourly OHLCV historical data for a currency pair.

**Auth:** Required (HMAC-signed)

**Request Parameters:** Same as `/data/v2/histoday`

| Param | Example |
|-------|---------|
| `fsym` | `BTC` |
| `tsym` | `USDT` |
| `e` | `coinbase` |
| `aggregate` | `1` |
| `toTs` | `2023-03-10T00:00:00` |
| `limit` | `100` |

**Response:** Hourly OHLCV candles

---

### 9. `GET /data/v2/histominute`

**Purpose:** Returns minute-level OHLCV historical data for a currency pair.

**Auth:** Required (HMAC-signed)

**Request Parameters:** Same as `/data/v2/histoday`

| Param | Example |
|-------|---------|
| `fsym` | `BTC` |
| `tsym` | `USDT` |
| `e` | `coinbase` |
| `aggregate` | `1` |
| `toTs` | `2023-03-10T00:00:00` |
| `limit` | `100` |

**Response:** Minute-level OHLCV candles

---

### 10. `GET /data/ob/l1/top`

**Purpose:** Returns L1 (Level 1) order book top-of-book data — best bid and ask prices and volumes at a point in time.

**Auth:** Required (HMAC-signed)

**Request Parameters:**
| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `fsym` | string | Base symbol | `BTC` |
| `tsym` | string | Quote symbol | `USDT` |
| `e` | string | Exchange name | `coinbase` |
| `toTs` | datetime | Timestamp to query | `2023-03-10T00:00:00` |
| `limit` | integer | Number of records | `100` |
| `signerEmail` | string | Authenticated user's email | |
| `requestTimestamp` | integer | Unix ms timestamp | |
| `signature` | string | HMAC-SHA256 signature | |

**Response:** Best bid price, best bid volume, best ask price, best ask volume at the requested timestamp.

---

### 11. `GET /data/v2/ob/l2/snapshot`

**Purpose:** Returns an L2 (Level 2) full order book snapshot — top N price levels on both bid and ask sides at a point in time.

**Auth:** Required (HMAC-signed)

**Request Parameters:**
| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `fsym` | string | Base symbol | `BTC` |
| `tsym` | string | Quote symbol | `USDT` |
| `e` | string | Exchange name | `coinbase` |
| `toTs` | datetime | Timestamp to query | `2023-03-10T00:00:00` |
| `limit` | integer | Number of price levels (depth) | `100` |
| `signerEmail` | string | Authenticated user's email | |
| `requestTimestamp` | integer | Unix ms timestamp | |
| `signature` | string | HMAC-SHA256 signature | |

**Response:** Top N bid price levels and top N ask price levels with volumes.

---

### 12. `GET /stream` (Server-Sent Events)

**Purpose:** Opens a real-time live data stream for trades and order book updates via Server-Sent Events (SSE). Streams until `stream_time` seconds elapse.

**Auth:** Required (HMAC-signed — unauthenticated requests return 401)

**Request Parameters:**
| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `ex` | string | Exchange name | `binance2` |
| `ins` | string | Instrument name | `BTCTUSD` |
| `stream_time` | integer | Duration in seconds (1–120) | `30` |
| `signerEmail` | string | Authenticated user's email | |
| `requestTimestamp` | integer | Unix ms timestamp | |
| `signature` | string | HMAC-SHA256 signature | |

**Response format:** `text/event-stream` (SSE), one event per line, prefixed by record type:

**Trade stream records** (prefix `!`):
| Field | Description |
|-------|-------------|
| `!` | Record type indicator (trade) |
| timestamp | Unix milliseconds |
| instrument | Instrument name |
| side | Buy/sell indicator |
| price | Trade price |
| quantity | Trade quantity |

**Order stream records** (prefix `$`):
| Field | Description |
|-------|-------------|
| `$` | Record type indicator (order book delta/snapshot) |
| timestamp | Unix milliseconds |
| instrument | Instrument name |
| side | Buy/sell indicator |
| orderbook data | Price/volume delta or snapshot |
| R (optional) | Reset indicator — if present, this is a full snapshot; reset local order book to this value |

**Comment records** (prefix `#`):
| Field | Description |
|-------|-------------|
| `#` | Comment/status message from server |

---

## Authentication Flow

```
User provides email + signing key
        ↓
POST /ims/auth  →  stored in Flask session
        ↓
GET /ims/signedcall?endpoint=trades&...
        ↓
Flask builds: /{endpoint}?{params}&signerEmail={email}&requestTimestamp={rts}
        ↓
HMAC-SHA256 sign with user's key
        ↓
GET https://api.algohouse.ai/{endpoint}?...&signature={sig}
```

---

## Configuration (`settings.py`)

| Setting | Value |
|---------|-------|
| `ALGOHOUSE_DOMAIN` | `https://api.algohouse.ai` |
| `IMS_BASE_PATH` | `/ims` |
| `LIMIT_FOR_UNSIGNED_CALLS` | `20` |
| `EMAIL_TO` | `support@algohouse.ai` |
| `EMAIL_SUBJECT` | `AlgoHouse user request form` |
| Email credentials | Via env vars (`EMAIL_SERVER`, `EMAIL_SMTP_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`) |

---

## Deployment

- Containerized via Docker, served by `waitress` on port `8090`
- CI/CD via GitLab pipeline, triggers on git tags, pushes to GitLab registry
- Runs as non-root `worker` user inside container
