from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, quote_plus, urlparse
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor
import csv
import html
import json
import os
import re
from io import StringIO
import xml.etree.ElementTree as ET


TRANSLATION_CACHE = {}
IMAGE_CACHE = {}
UNIVERSE_CACHE = None


class ResearchDeskHandler(SimpleHTTPRequestHandler):
    def do_HEAD(self):
        parsed = urlparse(self.path)
        if parsed.path in {"/api/news", "/api/indices", "/api/flows", "/api/universe"}:
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            return
        super().do_HEAD()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/news":
            self.handle_news(parsed.query)
            return
        if parsed.path == "/api/indices":
            self.handle_indices()
            return
        if parsed.path == "/api/flows":
            self.handle_flows()
            return
        if parsed.path == "/api/universe":
            self.handle_universe()
            return
        super().do_GET()

    def handle_news(self, query):
        params = parse_qs(query)
        ticker = params.get("ticker", [""])[0].strip()
        name = params.get("name", [""])[0].strip()
        sector = params.get("sector", [""])[0].strip()
        news_type = params.get("type", ["company"])[0].strip()

        if news_type == "market":
            search = "Nasdaq 100 stocks macro economy Federal Reserve earnings guidance when:30d"
        elif news_type == "related":
            search = f'"{sector}" stocks OR "{sector}" earnings OR "{sector}" guidance macro rates policy when:30d'
        else:
            search = f'"{ticker}" "{name}" stock earnings guidance OR SEC filing when:30d'

        url = (
            "https://news.google.com/rss/search?"
            f"q={quote_plus(search)}&hl=en-US&gl=US&ceid=US:en"
        )

        try:
            request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urlopen(request, timeout=8) as response:
                xml_body = response.read()
            root = ET.fromstring(xml_body)
            raw_items = []
            for item in root.findall("./channel/item")[:6]:
                title = item.findtext("title", default="").strip()
                link = item.findtext("link", default="").strip()
                published = item.findtext("pubDate", default="").strip()
                source_node = item.find("source")
                source = source_node.text.strip() if source_node is not None and source_node.text else "Google News"
                if title:
                    raw_items.append(
                        {
                            "title": title,
                            "source": source,
                            "published": published,
                            "url": link,
                        }
                    )
            with ThreadPoolExecutor(max_workers=6) as executor:
                items = list(executor.map(enrich_item, raw_items))
            self.write_json({"items": items})
        except Exception as error:
            self.write_json({"items": [], "error": str(error)}, status=502)

    def write_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_indices(self):
        with ThreadPoolExecutor(max_workers=8) as executor:
            quotes = list(executor.map(fetch_yahoo_quote, MARKET_SYMBOLS))
        fear_greed = fetch_fear_greed()
        self.write_json({"items": [fear_greed, *[quote for quote in quotes if quote]]})

    def handle_flows(self):
        with ThreadPoolExecutor(max_workers=12) as executor:
            assets = [asset for asset in executor.map(fetch_flow_asset, FLOW_SYMBOLS) if asset]
        weakest = sorted(assets, key=lambda item: item["changePercent"])[:3]
        strongest = sorted(assets, key=lambda item: item["changePercent"], reverse=True)[:3]
        links = build_flow_links(weakest, strongest)
        self.write_json(
            {
                "summary": build_flow_summary(weakest, strongest),
                "outflows": weakest,
                "inflows": strongest,
                "links": links,
                "note": "ETF 가격 등락률 기반 추정입니다. 실제 펀드 유입·유출액과 다를 수 있습니다.",
            }
        )

    def handle_universe(self):
        global UNIVERSE_CACHE
        if UNIVERSE_CACHE is None:
            sp500 = fetch_sp500_universe()
            russell = fetch_russell2000_universe()
            merged = {}
            for item in [*sp500, *russell]:
                ticker = item["ticker"]
                if ticker not in merged:
                    merged[ticker] = item
                else:
                    indexes = set(merged[ticker]["indexes"])
                    indexes.update(item["indexes"])
                    merged[ticker]["indexes"] = sorted(indexes)
                    if not merged[ticker].get("sector") and item.get("sector"):
                        merged[ticker]["sector"] = item["sector"]
                    if not merged[ticker].get("industry") and item.get("industry"):
                        merged[ticker]["industry"] = item["industry"]
            UNIVERSE_CACHE = sorted(merged.values(), key=lambda item: item["ticker"])
        self.write_json({"items": UNIVERSE_CACHE, "count": len(UNIVERSE_CACHE)})


MARKET_SYMBOLS = [
    {"symbol": "^GSPC", "name": "S&P 500", "note": "미국 대형주 전반의 위험선호 기준"},
    {"symbol": "^IXIC", "name": "Nasdaq Composite", "note": "성장주와 기술주 투자심리"},
    {"symbol": "^DJI", "name": "Dow Jones", "note": "우량 대형 가치주의 흐름"},
    {"symbol": "^VIX", "name": "VIX", "note": "옵션시장 변동성, 높을수록 공포 확대"},
    {"symbol": "^TNX", "name": "10Y Treasury Yield", "note": "장기금리와 성장주 할인율 압력"},
    {"symbol": "QQQ", "name": "QQQ", "note": "Nasdaq-100 ETF 상대 흐름"},
]

FLOW_SYMBOLS = [
    {"symbol": "GLD", "name": "금", "group": "안전자산"},
    {"symbol": "TLT", "name": "장기채", "group": "채권"},
    {"symbol": "IEF", "name": "중기채", "group": "채권"},
    {"symbol": "SPY", "name": "미국 대형주", "group": "주식"},
    {"symbol": "QQQ", "name": "나스닥 성장주", "group": "주식"},
    {"symbol": "IWM", "name": "소형주", "group": "주식"},
    {"symbol": "XLK", "name": "기술", "group": "섹터"},
    {"symbol": "XLF", "name": "금융", "group": "섹터"},
    {"symbol": "XLE", "name": "에너지", "group": "섹터"},
    {"symbol": "XLV", "name": "헬스케어", "group": "섹터"},
    {"symbol": "XLY", "name": "임의소비재", "group": "섹터"},
    {"symbol": "XLP", "name": "필수소비재", "group": "섹터"},
    {"symbol": "XLU", "name": "유틸리티", "group": "섹터"},
]

SP500_URL = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
IWM_HOLDINGS_URL = "https://www.ishares.com/us/products/239710/ishares-russell-2000-etf/1467271812596.ajax?fileType=csv&fileName=IWM_holdings&dataType=fund"


def fetch_sp500_universe():
    try:
        body = fetch_text(SP500_URL, timeout=8)
        rows = re.findall(r"<tr>(.*?)</tr>", body, flags=re.DOTALL | re.IGNORECASE)
        items = []
        for row in rows:
            cells = re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", row, flags=re.DOTALL | re.IGNORECASE)
            if len(cells) < 4:
                continue
            values = [clean_html(cell) for cell in cells]
            ticker = normalize_ticker(values[0])
            if not ticker or ticker == "SYMBOL":
                continue
            items.append(
                {
                    "ticker": ticker,
                    "name": values[1],
                    "sector": values[2],
                    "industry": values[3],
                    "indexes": ["S&P 500"],
                }
            )
        return items
    except Exception:
        return []


def fetch_russell2000_universe():
    try:
        body = fetch_text(IWM_HOLDINGS_URL, timeout=10)
        lines = body.splitlines()
        header_index = next(index for index, line in enumerate(lines) if line.startswith("Ticker,"))
        reader = csv.DictReader(StringIO("\n".join(lines[header_index:])))
        items = []
        for row in reader:
            ticker = normalize_ticker(row.get("Ticker", ""))
            name = clean_csv_value(row.get("Name", ""))
            sector = clean_csv_value(row.get("Sector", ""))
            asset_class = clean_csv_value(row.get("Asset Class", ""))
            exchange = clean_csv_value(row.get("Exchange", ""))
            if not ticker or asset_class != "Equity" or exchange == "-":
                continue
            items.append(
                {
                    "ticker": ticker,
                    "name": titleize_name(name),
                    "sector": sector,
                    "industry": "",
                    "indexes": ["Russell 2000"],
                }
            )
        return items
    except Exception:
        return []


def clean_html(value):
    value = re.sub(r"<sup.*?</sup>", "", value, flags=re.DOTALL | re.IGNORECASE)
    value = re.sub(r"<[^>]+>", "", value)
    return html.unescape(value).strip()


def clean_csv_value(value):
    return str(value or "").replace("\ufeff", "").replace("\xa0", " ").strip()


def normalize_ticker(value):
    ticker = clean_csv_value(value).replace(".", "-").replace(" ", "").upper()
    if not re.match(r"^[A-Z0-9][A-Z0-9-]{0,9}$", ticker):
        return ""
    return ticker


def titleize_name(value):
    words = clean_csv_value(value).split()
    small_words = {"A", "AN", "AND", "CLASS", "OF", "THE", "INC", "CORP", "LTD", "PLC", "CO"}
    return " ".join(word if word in small_words else word.capitalize() for word in words)


def fetch_yahoo_quote(item):
    try:
        quote = fetch_yahoo_raw(item["symbol"])
        price = quote["price"] if quote else None
        change_percent = quote["changePercent"] if quote else None
        previous = None if quote is None or change_percent == -100 else price / (1 + change_percent / 100)
        change = None if quote is None or previous is None else price - previous
        change_percent = None if change is None else (change / previous) * 100
        return {
            "name": item["name"],
            "value": format_market_value(item["symbol"], price),
            "change": format_change(change, change_percent),
            "tone": market_tone(item["symbol"], change),
            "note": item["note"],
            "source": "Yahoo Finance",
        }
    except Exception:
        return {
            "name": item["name"],
            "value": "N/A",
            "change": "데이터 확인 필요",
            "tone": "mixed",
            "note": item["note"],
            "source": "Yahoo Finance",
        }


def fetch_flow_asset(item):
    quote = fetch_yahoo_raw(item["symbol"])
    if not quote:
        return None
    return {
        "symbol": item["symbol"],
        "name": item["name"],
        "group": item["group"],
        "price": quote["price"],
        "changePercent": quote["changePercent"],
        "changeLabel": f"{quote['changePercent']:+.2f}%",
    }


def fetch_yahoo_raw(symbol):
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{quote_plus(symbol)}?range=5d&interval=1d"
        body = fetch_text(url, timeout=5)
        data = json.loads(body)
        result = data["chart"]["result"][0]
        meta = result["meta"]
        previous = meta.get("chartPreviousClose") or meta.get("previousClose")
        price = meta.get("regularMarketPrice")
        if previous in (None, 0) or price is None:
            return None
        return {"price": float(price), "changePercent": ((float(price) - float(previous)) / float(previous)) * 100}
    except Exception:
        return None


def fetch_yahoo_series(symbol, period="1y"):
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{quote_plus(symbol)}?range={period}&interval=1d"
        body = fetch_text(url, timeout=6)
        data = json.loads(body)
        result = data["chart"]["result"][0]
        quote = result["indicators"]["quote"][0]
        closes = [float(value) for value in quote.get("close", []) if value is not None]
        volumes = [float(value) for value in quote.get("volume", []) if value is not None]
        return {"close": closes, "volume": volumes}
    except Exception:
        return {"close": [], "volume": []}


def build_flow_links(weakest, strongest):
    links = []
    for index, target in enumerate(strongest):
        source = weakest[index % len(weakest)] if weakest else None
        if not source:
            continue
        strength = abs(target["changePercent"] - source["changePercent"])
        links.append(
            {
                "from": source["name"],
                "to": target["name"],
                "label": f"{source['changeLabel']} → {target['changeLabel']}",
                "strength": max(18, min(100, round(strength * 18))),
            }
        )
    return links


def build_flow_summary(weakest, strongest):
    if not weakest or not strongest:
        return "오늘 자금 흐름을 계산할 데이터가 부족합니다."
    leader = strongest[0]
    laggard = weakest[0]
    return f"오늘은 {laggard['name']}({laggard['changeLabel']})보다 {leader['name']}({leader['changeLabel']}) 쪽 가격 탄력이 강합니다. 단기 자금은 상대 약세 자산에서 상대 강세 자산으로 이동하는 흐름으로 해석합니다."


def fetch_fear_greed():
    series_symbols = ["^GSPC", "^VIX", "^CPC", "SPY", "QQQ", "IWM", "RSP", "TLT", "HYG", "LQD"]
    with ThreadPoolExecutor(max_workers=10) as executor:
        series = dict(zip(series_symbols, executor.map(fetch_yahoo_series, series_symbols)))

    components = [
        score_market_momentum(series.get("^GSPC", {})),
        score_price_strength_proxy(series),
        score_breadth_proxy(series),
        score_put_call(series.get("^CPC", {})),
        score_volatility(series.get("^VIX", {})),
        score_safe_haven(series),
        score_junk_bond(series),
    ]
    valid_scores = [component for component in components if component is not None]

    if not valid_scores:
        valid_scores = fetch_fallback_fear_greed_scores()

    if valid_scores:
        score = round(sum(valid_scores) / len(valid_scores))
        return {
            "name": "공포·탐욕지수",
            "value": f"{score:.0f}",
            "change": translate_fear_greed_score(score),
            "tone": "positive" if score >= 56 else "negative" if score <= 44 else "mixed",
            "note": f"CNN 7요소 기반 자체 산식, {len(valid_scores)}/7개 지표 반영",
            "source": "자체 계산",
        }

    return {
        "name": "공포·탐욕지수",
        "value": "N/A",
        "change": "데이터 확인 필요",
        "tone": "mixed",
        "note": "시장 데이터가 부족해 자체 공포·탐욕 점수를 계산하지 못했습니다.",
        "source": "자체 계산",
    }


def score_market_momentum(sp500):
    closes = sp500.get("close", [])
    if len(closes) < 125:
        return None
    latest = closes[-1]
    moving_average = sum(closes[-125:]) / 125
    return clamp_score(50 + ((latest / moving_average) - 1) * 500)


def score_price_strength_proxy(series):
    returns = [
        period_return(series.get(symbol, {}).get("close", []), 63)
        for symbol in ("SPY", "QQQ", "IWM")
    ]
    returns = [value for value in returns if value is not None]
    if not returns:
        return None
    return clamp_score(50 + (sum(returns) / len(returns)) * 250)


def score_breadth_proxy(series):
    rsp_return = period_return(series.get("RSP", {}).get("close", []), 21)
    spy_return = period_return(series.get("SPY", {}).get("close", []), 21)
    iwm_return = period_return(series.get("IWM", {}).get("close", []), 21)
    if rsp_return is None or spy_return is None:
        return None
    breadth = ((rsp_return - spy_return) + ((iwm_return or 0) - spy_return)) / 2
    return clamp_score(50 + breadth * 500)


def score_put_call(put_call):
    closes = put_call.get("close", [])
    if not closes:
        return None
    return clamp_score(linear_score(closes[-1], 1.25, 0.65))


def score_volatility(vix):
    closes = vix.get("close", [])
    if not closes:
        return None
    return clamp_score(linear_score(closes[-1], 32, 12))


def score_safe_haven(series):
    spy_return = period_return(series.get("SPY", {}).get("close", []), 21)
    tlt_return = period_return(series.get("TLT", {}).get("close", []), 21)
    if spy_return is None or tlt_return is None:
        return None
    return clamp_score(50 + (spy_return - tlt_return) * 250)


def score_junk_bond(series):
    hyg_return = period_return(series.get("HYG", {}).get("close", []), 21)
    lqd_return = period_return(series.get("LQD", {}).get("close", []), 21)
    if hyg_return is None or lqd_return is None:
        return None
    return clamp_score(50 + (hyg_return - lqd_return) * 400)


def fetch_fallback_fear_greed_scores():
    quote_symbols = ["SPY", "QQQ", "IWM", "^VIX", "TLT", "HYG", "LQD"]
    with ThreadPoolExecutor(max_workers=7) as executor:
        quotes = dict(zip(quote_symbols, executor.map(fetch_yahoo_raw, quote_symbols)))

    scores = []
    risk_changes = [
        quotes[symbol]["changePercent"]
        for symbol in ("SPY", "QQQ", "IWM")
        if quotes.get(symbol)
    ]
    if risk_changes:
        scores.append(clamp_score(50 + (sum(risk_changes) / len(risk_changes)) * 5))
    if quotes.get("^VIX"):
        scores.append(score_volatility({"close": [quotes["^VIX"]["price"]]}))
    if quotes.get("SPY") and quotes.get("TLT"):
        spread = quotes["SPY"]["changePercent"] - quotes["TLT"]["changePercent"]
        scores.append(clamp_score(50 + spread * 4))
    if quotes.get("HYG") and quotes.get("LQD"):
        spread = quotes["HYG"]["changePercent"] - quotes["LQD"]["changePercent"]
        scores.append(clamp_score(50 + spread * 6))
    return [score for score in scores if score is not None]


def period_return(closes, days):
    if len(closes) <= days or closes[-days - 1] == 0:
        return None
    return (closes[-1] / closes[-days - 1]) - 1


def linear_score(value, fear_value, greed_value):
    if fear_value == greed_value:
        return 50
    return ((value - fear_value) / (greed_value - fear_value)) * 100


def clamp_score(value):
    return max(0, min(100, float(value)))


def translate_fear_greed_score(score):
    if score >= 76:
        return "극단적 탐욕"
    if score >= 56:
        return "탐욕"
    if score >= 45:
        return "중립"
    if score >= 25:
        return "공포"
    return "극단적 공포"


def format_market_value(symbol, value):
    if value is None:
        return "N/A"
    if symbol == "^TNX":
        return f"{float(value):.2f}%"
    if symbol == "^VIX":
        return f"{float(value):.2f}"
    return f"{float(value):,.2f}"


def format_change(change, change_percent):
    if change is None or change_percent is None:
        return "데이터 확인 필요"
    sign = "+" if change >= 0 else ""
    return f"{sign}{change:.2f} ({sign}{change_percent:.2f}%)"


def market_tone(symbol, change):
    if change is None:
        return "mixed"
    if symbol in ("^VIX", "^TNX"):
        return "negative" if change > 0 else "positive" if change < 0 else "mixed"
    return "positive" if change > 0 else "negative" if change < 0 else "mixed"


def translate_fear_greed(rating):
    normalized = str(rating).lower()
    if "extreme greed" in normalized:
        return "극단적 탐욕"
    if "greed" in normalized:
        return "탐욕"
    if "extreme fear" in normalized:
        return "극단적 공포"
    if "fear" in normalized:
        return "공포"
    return "중립"


def fetch_text(url, timeout=5):
    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
        },
    )
    with urlopen(request, timeout=timeout) as response:
        return response.read().decode("utf-8", errors="ignore")


def translate_to_korean(text):
    if not text:
        return text
    if text in TRANSLATION_CACHE:
        return TRANSLATION_CACHE[text]
    try:
        url = (
            "https://translate.googleapis.com/translate_a/single"
            f"?client=gtx&sl=auto&tl=ko&dt=t&q={quote_plus(text)}"
        )
        body = fetch_text(url, timeout=3)
        data = json.loads(body)
        translated = "".join(part[0] for part in data[0] if part and part[0]).strip()
        TRANSLATION_CACHE[text] = translated or text
    except Exception:
        TRANSLATION_CACHE[text] = text
    return TRANSLATION_CACHE[text]


def extract_article_image(url):
    if not url:
        return ""
    if url in IMAGE_CACHE:
        return IMAGE_CACHE[url]
    try:
        body = fetch_text(url, timeout=2)
        patterns = [
            r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
            r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
            r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']',
            r'<img[^>]+src=["\'](https?://[^"\']+)["\']',
        ]
        image = ""
        for pattern in patterns:
            match = re.search(pattern, body, flags=re.IGNORECASE)
            if match:
                image = html.unescape(match.group(1))
                break
        if image.startswith("//"):
            image = f"https:{image}"
        IMAGE_CACHE[url] = image if image.startswith("http") else ""
    except Exception:
        IMAGE_CACHE[url] = ""
    return IMAGE_CACHE[url]


def enrich_item(item):
    return {
        **item,
        "titleKo": translate_to_korean(item["title"]),
        "image": extract_article_image(item["url"]),
    }


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    port = int(os.environ.get("PORT", "4173"))
    server = ThreadingHTTPServer(("0.0.0.0", port), ResearchDeskHandler)
    print(f"Research Desk running at http://0.0.0.0:{port}")
    server.serve_forever()
