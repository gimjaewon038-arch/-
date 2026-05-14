from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, quote_plus, urlparse
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor
import csv
import html
import json
import os
import re
import time
from datetime import datetime, timezone
from io import StringIO
import xml.etree.ElementTree as ET


TRANSLATION_CACHE = {}
IMAGE_CACHE = {}
UNIVERSE_CACHE = None
DASHBOARD_CACHE = {"expiresAt": 0.0, "payload": None}
FRED_CACHE = {}


class ResearchDeskHandler(SimpleHTTPRequestHandler):
    def do_HEAD(self):
        parsed = urlparse(self.path)
        if parsed.path in {"/api/news", "/api/indices", "/api/flows", "/api/universe", "/api/price", "/api/dashboard"}:
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
        if parsed.path == "/api/price":
            self.handle_price(parsed.query)
            return
        if parsed.path == "/api/dashboard":
            self.handle_dashboard()
            return
        super().do_GET()

    def handle_news(self, query):
        params = parse_qs(query)
        ticker = params.get("ticker", [""])[0].strip()
        name = params.get("name", [""])[0].strip()
        sector = params.get("sector", [""])[0].strip()
        news_type = params.get("type", ["company"])[0].strip()

        if news_type == "market":
            search = "CPI core CPI PPI jobs Fed rates yields oil sector rotation earnings guidance when:7d"
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
        with ThreadPoolExecutor(max_workers=12) as executor:
            quotes = list(executor.map(fetch_yahoo_quote, MARKET_SYMBOLS))
        fear_greed = fetch_fear_greed()
        as_of = today_iso()
        summary = build_market_summary(quotes, fear_greed)
        self.write_json(
            {
                "asOf": as_of,
                "summary": summary,
                "items": [fear_greed, *[quote for quote in quotes if quote]],
            }
        )

    def handle_flows(self):
        with ThreadPoolExecutor(max_workers=12) as executor:
            assets = [asset for asset in executor.map(fetch_flow_asset, FLOW_SYMBOLS) if asset]
        weakest = sorted(assets, key=lambda item: item["changePercent"])[:3]
        strongest = sorted(assets, key=lambda item: item["changePercent"], reverse=True)[:3]
        links = build_flow_links(weakest, strongest)
        self.write_json(
            {
                "asOf": today_iso(),
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

    def handle_price(self, query):
        params = parse_qs(query)
        ticker = normalize_ticker(params.get("ticker", [""])[0])
        range_key = params.get("range", ["3M"])[0].strip().upper()
        if not ticker:
            self.write_json({"error": "ticker is required"}, status=400)
            return
        self.write_json(fetch_price_snapshot(ticker, range_key))

    def handle_dashboard(self):
        payload = get_dashboard_payload()
        self.write_json(payload)


MARKET_SYMBOLS = [
    {"symbol": "^GSPC", "name": "S&P 500", "note": "미국 대형주 전반의 위험선호 기준, 종합 점수의 시장 베타 기준"},
    {"symbol": "^IXIC", "name": "Nasdaq Composite", "note": "AI·반도체·소프트웨어 투자심리, 성장주 리스크 선호 확인"},
    {"symbol": "^DJI", "name": "Dow Jones", "note": "우량 대형 가치주와 현금흐름 방어주의 상대 흐름"},
    {"symbol": "^RUT", "name": "Russell 2000", "note": "소형주·내수·신용 민감도, 금리 부담 확인"},
    {"symbol": "^VIX", "name": "VIX", "note": "옵션시장 변동성, 높을수록 공포와 헤지 수요 확대"},
    {"symbol": "^TNX", "name": "10Y Treasury Yield", "note": "장기금리와 성장주 할인율 압력, 은행 NIM 방어 요인"},
    {"symbol": "QQQ", "name": "QQQ", "note": "Nasdaq-100 ETF, AI 대형 성장주의 실시간 proxy"},
    {"symbol": "IWM", "name": "IWM", "note": "Russell 2000 ETF, 소형 성장주와 신용 사이클 proxy"},
    {"symbol": "GLD", "name": "Gold / GLD", "note": "금 가격 proxy, 인플레·실질금리·안전자산 수요 확인"},
    {"symbol": "USO", "name": "Oil / USO", "note": "원유 가격 proxy, 에너지 강세와 물가 압력 확인"},
    {"symbol": "XLE", "name": "Energy / XLE", "note": "에너지 섹터 ETF, 유가 충격 수혜와 섹터 로테이션 확인"},
    {"symbol": "ARKK", "name": "High Growth / ARKK", "note": "장기 성장주 basket, 금리 상승 취약도 확인"},
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

BANK_PRICE_TARGETS = {
    "AAPL": [
        {"bank": "UBS", "target": 296},
        {"bank": "TD Cowen", "target": 335},
        {"bank": "Wedbush", "target": 350},
        {"bank": "Barclays", "target": 253},
    ],
    "NVDA": [
        {"bank": "Citi", "target": 300},
        {"bank": "Susquehanna", "target": 275},
        {"bank": "Rosenblatt", "target": 325},
        {"bank": "Cantor Fitzgerald", "target": 300},
        {"bank": "Raymond James", "target": 323},
    ],
    "TSLA": [
        {"bank": "UBS", "target": 364},
        {"bank": "Canaccord Genuity", "target": 450},
    ],
    "JPM": [
        {"bank": "Evercore ISI", "target": 340},
        {"bank": "Truist", "target": 332},
    ],
    "XOM": [
        {"bank": "RBC Capital", "target": 180},
        {"bank": "UBS", "target": 174},
    ],
    "HIMS": [
        {"bank": "JPMorgan", "target": 35},
        {"bank": "BofA Securities", "target": 30},
    ],
    "OSCR": [
        {"bank": "Jefferies", "target": 16},
        {"bank": "UBS", "target": 17},
        {"bank": "Barclays", "target": 18},
    ],
    "PLTR": [
        {"bank": "Citigroup", "target": 225},
        {"bank": "Morgan Stanley", "target": 205},
        {"bank": "BofA Securities", "target": 255},
        {"bank": "Truist", "target": 223},
    ],
    "CRWD": [
        {"bank": "Wells Fargo", "target": 525},
        {"bank": "Mizuho", "target": 520},
        {"bank": "RBC Capital", "target": 550},
    ],
    "APP": [
        {"bank": "Macquarie", "target": 730},
        {"bank": "UBS", "target": 750},
        {"bank": "Needham", "target": 700},
    ],
}


def today_iso():
    return datetime.now(timezone.utc).date().isoformat()


def cached(key, ttl_seconds, loader):
    now = time.time()
    entry = FRED_CACHE.get(key)
    if entry and entry.get("expiresAt", 0) > now:
        return entry.get("value")
    value = loader()
    FRED_CACHE[key] = {"expiresAt": now + ttl_seconds, "value": value}
    return value


def fetch_fred_csv(series_id, timeout=8):
    try:
        url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={quote_plus(series_id)}"
        body = fetch_text(url, timeout=timeout)
        rows = []
        for line in body.splitlines()[1:]:
            parts = line.split(",")
            if len(parts) < 2:
                continue
            date = parts[0].strip()
            value = parts[1].strip()
            if value == "." or value == "":
                continue
            try:
                rows.append((date, float(value)))
            except Exception:
                continue
        return rows
    except Exception:
        return []


def latest_fred_point(series_id):
    rows = cached(f"fred:{series_id}", 60 * 60, lambda: fetch_fred_csv(series_id))
    if not rows:
        return None
    return rows[-1]


def fred_change(series_id, lookback=1):
    rows = cached(f"fred:{series_id}", 60 * 60, lambda: fetch_fred_csv(series_id))
    if not rows or len(rows) <= lookback:
        return None
    last_date, last_value = rows[-1]
    prev_date, prev_value = rows[-1 - lookback]
    return {"last": (last_date, last_value), "prev": (prev_date, prev_value)}


def yoy_from_index_series(series_id):
    rows = cached(f"fred:{series_id}", 60 * 60, lambda: fetch_fred_csv(series_id))
    if not rows or len(rows) < 13:
        return None
    last_date, last_value = rows[-1]
    prev_date, prev_value = rows[-13]
    if prev_value == 0:
        return None
    return {"date": last_date, "value": (last_value / prev_value - 1) * 100, "previous": (rows[-14][1] / rows[-26][1] - 1) * 100 if len(rows) >= 26 else None}


def build_macro_state():
    fed = latest_fred_point("FEDFUNDS")
    ten = latest_fred_point("DGS10")
    wti = latest_fred_point("DCOILWTICO")
    cpi_yoy = yoy_from_index_series("CPIAUCSL")
    core_yoy = yoy_from_index_series("CPILFESL")

    def fmt_pct(value):
        return "N/A" if value is None else f"{value:.2f}%"

    def fmt_level(value, unit=""):
        return "N/A" if value is None else f"{value:.2f}{unit}"

    macro = {
        "fedFunds": {
            "label": "Fed Funds (FRED)",
            "value": fmt_level(fed[1], "%") if fed else "N/A",
            "trend": "최신값",
            "interpretation": "정책금리가 높게 유지되면 장기 성장주 할인율 부담이 커지고, 금융/현금흐름 방어주에는 상대적으로 우호적일 수 있습니다.",
            "asOf": fed[0] if fed else None,
            "source": "FRED",
        },
        "tenYear": {
            "label": "10Y Treasury (FRED)",
            "value": fmt_level(ten[1], "%") if ten else "N/A",
            "trend": "최신값",
            "interpretation": "장기금리 상승은 고PER 성장주·소형 성장주의 멀티플 부담으로 반영되는 경향이 있습니다.",
            "asOf": ten[0] if ten else None,
            "source": "FRED",
        },
        "cpi": {
            "label": "CPI YoY (FRED)",
            "value": fmt_pct(cpi_yoy["value"]) if cpi_yoy else "N/A",
            "trend": "최신값",
            "interpretation": "물가가 예상보다 끈적하면 금리 인하 기대가 늦춰져 성장주에는 부담, 인플레 헤지/에너지에는 일부 우호적으로 작용할 수 있습니다.",
            "asOf": cpi_yoy["date"] if cpi_yoy else None,
            "source": "FRED",
        },
        # UI 호환을 위해 기존 키(ism)를 유지합니다.
        "ism": {
            "label": "Cycle/Oil (FRED)",
            "value": f"WTI {fmt_level(wti[1], '')}" if wti else "N/A",
            "trend": "최신값",
            "interpretation": "유가·경기 민감 변수는 에너지/원자재에는 우호적일 수 있지만 소비재·운송·마진 민감 업종에는 부담이 될 수 있습니다.",
            "asOf": wti[0] if wti else None,
            "source": "FRED",
        },
    }
    return macro


def build_macro_reports():
    reports = []

    def report_from_yoy(name, series_id, negative_bias=True):
        yoy = yoy_from_index_series(series_id)
        if not yoy:
            return None
        previous = yoy.get("previous")
        delta = None if previous is None else yoy["value"] - previous
        tone = "mixed"
        verdict = "중립"
        if delta is not None:
            if negative_bias and delta > 0.05:
                tone = "negative"
                verdict = "물가 부담"
            elif negative_bias and delta < -0.05:
                tone = "positive"
                verdict = "디스인플레"
            elif (not negative_bias) and delta > 0.05:
                tone = "positive"
                verdict = "경기 강세"
        reason = f"FRED 시계열({series_id})의 최근 12개월 변화율을 계산했습니다. 직전 관측치 대비 {'상승' if delta and delta>0 else '하락' if delta and delta<0 else '변화 제한'} 흐름을 반영합니다."
        return {
            "name": name,
            "date": yoy["date"],
            "value": f"{yoy['value']:.2f}%",
            "previous": f"{previous:.2f}%" if previous is not None else "N/A",
            "consensus": "N/A",
            "tone": tone,
            "verdict": verdict,
            "reason": reason,
            "source": "FRED",
        }

    cpi = report_from_yoy("CPI", "CPIAUCSL", negative_bias=True)
    core = report_from_yoy("Core CPI", "CPILFESL", negative_bias=True)
    ppi = report_from_yoy("PPI (Index YoY)", "PPIACO", negative_bias=True)

    def report_level(name, series_id, unit="", negative_when_up=False):
        change = fred_change(series_id, 1)
        if not change:
            return None
        last_date, last_value = change["last"]
        prev_date, prev_value = change["prev"]
        delta = last_value - prev_value
        tone = "mixed"
        verdict = "중립"
        if abs(delta) > 0.01:
            if negative_when_up and delta > 0:
                tone = "negative"
                verdict = "부담 확대"
            elif negative_when_up and delta < 0:
                tone = "positive"
                verdict = "완화"
            elif (not negative_when_up) and delta > 0:
                tone = "positive"
                verdict = "강세"
            elif (not negative_when_up) and delta < 0:
                tone = "negative"
                verdict = "약화"
        reason = f"FRED 시계열({series_id})의 최근 관측치를 직전 관측치와 비교했습니다."
        return {
            "name": name,
            "date": last_date,
            "value": f"{last_value:.2f}{unit}" if unit else f"{last_value:.2f}",
            "previous": f"{prev_value:.2f}{unit}" if unit else f"{prev_value:.2f}",
            "consensus": "N/A",
            "tone": tone,
            "verdict": verdict,
            "reason": reason,
            "source": "FRED",
        }

    jobs = report_level("Unemployment Rate", "UNRATE", "%", negative_when_up=True)
    fed = report_level("Fed Funds", "FEDFUNDS", "%", negative_when_up=True)

    for item in [cpi, core, ppi, jobs, fed]:
        if item:
            reports.append(item)
    return reports


def build_sector_strength():
    # Relative strength proxy: 3mo ETF return vs SPY return
    sector_etfs = [
        {"etf": "XLK", "name": "Technology", "rate": "High"},
        {"etf": "XLF", "name": "Financials", "rate": "Mixed"},
        {"etf": "XLE", "name": "Energy", "rate": "Low"},
        {"etf": "XLY", "name": "Consumer Discretionary", "rate": "High"},
        {"etf": "XLP", "name": "Consumer Staples", "rate": "Low"},
        {"etf": "XLV", "name": "Healthcare", "rate": "Low"},
        {"etf": "XLI", "name": "Industrials", "rate": "Medium"},
        {"etf": "XLU", "name": "Utilities", "rate": "Low"},
        {"etf": "ARKK", "name": "High Growth", "rate": "Very High"},
        {"etf": "CIBR", "name": "Cybersecurity", "rate": "Medium"},
        {"etf": "BOTZ", "name": "AI Software", "rate": "High"},
    ]

    def pct_return(series):
        closes = series.get("close") or []
        if len(closes) < 2:
            return None
        start = closes[0]
        end = closes[-1]
        if start in (None, 0):
            return None
        return (end / start - 1) * 100

    symbols = ["SPY", *[item["etf"] for item in sector_etfs]]
    with ThreadPoolExecutor(max_workers=10) as executor:
        data = dict(zip(symbols, executor.map(lambda s: fetch_yahoo_series(s, "3mo"), symbols)))

    spy_ret = pct_return(data.get("SPY") or {}) or 0.0
    scored = []
    for item in sector_etfs:
        ret = pct_return(data.get(item["etf"]) or {})
        if ret is None:
            relative = 55
            cycle = "데이터 확인 필요"
        else:
            # Map relative return vs SPY into 0-100 score band.
            diff = ret - spy_ret
            relative = max(18, min(92, round(55 + diff * 2.2)))
            cycle = f"3개월 상대수익 {diff:+.1f}pp (vs SPY)"
        scored.append({**item, "relative": relative, "cycle": cycle})

    strongest = sorted(scored, key=lambda x: x["relative"], reverse=True)[:2]
    weakest = sorted(scored, key=lambda x: x["relative"])[:2]
    summary = f"{today_iso()} 기준 섹터 상대강도: {', '.join([s['name'] for s in strongest])} 강세, {', '.join([s['name'] for s in weakest])} 약세(3개월 SPY 대비)."
    return {"summary": summary, "items": scored}


def build_market_brief(macro_state, sector_strength, indices_summary):
    macro = macro_state.get("cpi", {})
    rates = macro_state.get("tenYear", {})
    oil = macro_state.get("ism", {})
    return [
        {
            "label": "시장 레짐",
            "value": "금리·물가 체크",
            "tone": "mixed",
            "text": f"CPI YoY {macro.get('value','N/A')} · 10Y {rates.get('value','N/A')} · {oil.get('value','N/A')} 를 기준으로 성장주 할인율과 섹터 로테이션을 함께 점검합니다.",
        },
        {
            "label": "섹터 순환",
            "value": "상대강도 기반",
            "tone": "mixed",
            "text": sector_strength.get("summary", "섹터 상대강도 데이터를 계산 중입니다."),
        },
        {
            "label": "시장 요약",
            "value": "지수·리스크",
            "tone": "mixed",
            "text": indices_summary or "지수 카드의 등락률과 공포·탐욕지수를 함께 해석합니다.",
        },
        {
            "label": "점수 반영",
            "value": "뉴스+매크로",
            "tone": "mixed",
            "text": "상세 페이지에서 회사 뉴스(실적/가이던스/공시)와 외부 환경(금리/정책/섹터)을 분리해 긍정·부정 요인을 점수에 반영합니다.",
        },
    ]


def get_dashboard_payload():
    now = time.time()
    cached_payload = DASHBOARD_CACHE.get("payload")
    if cached_payload and DASHBOARD_CACHE.get("expiresAt", 0) > now:
        return cached_payload

    # Build indices summary using the same logic as /api/indices but cheaper.
    with ThreadPoolExecutor(max_workers=12) as executor:
        quotes = list(executor.map(fetch_yahoo_quote, MARKET_SYMBOLS))
    fear_greed = fetch_fear_greed()
    indices_summary = build_market_summary(quotes, fear_greed)

    macro_state = build_macro_state()
    macro_reports = build_macro_reports()
    sector_strength = build_sector_strength()
    brief_cards = build_market_brief(macro_state, sector_strength, indices_summary)

    payload = {
        "asOf": today_iso(),
        "macroState": macro_state,
        "macroReports": macro_reports,
        "marketBriefCards": brief_cards,
        "sectors": {"summary": sector_strength.get("summary"), "items": sector_strength.get("items", [])},
    }

    DASHBOARD_CACHE["payload"] = payload
    DASHBOARD_CACHE["expiresAt"] = now + 60 * 10
    return payload


def build_market_summary(quotes, fear_greed):
    def find_value(name):
        for item in quotes:
            if item and item.get("name") == name:
                return item.get("change") or ""
        return ""

    vix = find_value("VIX")
    tnx = find_value("10Y Treasury Yield")
    qqq = find_value("QQQ")
    iwm = find_value("IWM")
    oil = find_value("Oil / USO")
    fg = fear_greed.get("value") if isinstance(fear_greed, dict) else None
    return f"공포·탐욕 {fg or 'N/A'} · 10Y {tnx} · VIX {vix} · QQQ {qqq} · IWM {iwm} · Oil {oil} 흐름을 함께 확인합니다."


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


PRICE_RANGES = {
    "1D": {"range": "1d", "interval": "5m", "label": "1일"},
    "5D": {"range": "5d", "interval": "15m", "label": "5일"},
    "1M": {"range": "1mo", "interval": "1d", "label": "1개월"},
    "3M": {"range": "3mo", "interval": "1d", "label": "3개월"},
    "6M": {"range": "6mo", "interval": "1d", "label": "6개월"},
    "1Y": {"range": "1y", "interval": "1d", "label": "1년"},
}


def fetch_price_snapshot(ticker, range_key="3M"):
    selected_range = PRICE_RANGES.get(range_key, PRICE_RANGES["3M"])
    try:
        url = (
            f"https://query1.finance.yahoo.com/v8/finance/chart/{quote_plus(ticker)}"
            f"?range={selected_range['range']}&interval={selected_range['interval']}"
        )
        body = fetch_text(url, timeout=6)
        data = json.loads(body)
        result = data["chart"]["result"][0]
        meta = result["meta"]
        quote = result["indicators"]["quote"][0]
        timestamps = result.get("timestamp", [])
        closes = quote.get("close", [])
        history = []
        for timestamp, close in zip(timestamps, closes):
            if close is None:
                continue
            history.append({"date": str(timestamp), "close": round(float(close), 2)})
        price = meta.get("regularMarketPrice")
        previous = meta.get("chartPreviousClose") or meta.get("previousClose")
        change = None if price is None or previous in (None, 0) else float(price) - float(previous)
        change_percent = None if change is None else (change / float(previous)) * 100
        return {
            "ticker": ticker,
            "range": range_key if range_key in PRICE_RANGES else "3M",
            "rangeLabel": selected_range["label"],
            "price": round(float(price), 2) if price is not None else None,
            "currency": meta.get("currency", "USD"),
            "change": round(change, 2) if change is not None else None,
            "changePercent": round(change_percent, 2) if change_percent is not None else None,
            "history": history[-64:],
            "targets": BANK_PRICE_TARGETS.get(ticker, []),
            "targetSource": "최근 공개 애널리스트 리포트 스냅샷",
        }
    except Exception as error:
        return {
            "ticker": ticker,
            "range": range_key if range_key in PRICE_RANGES else "3M",
            "rangeLabel": selected_range["label"],
            "price": None,
            "currency": "USD",
            "change": None,
            "changePercent": None,
            "history": [],
            "targets": BANK_PRICE_TARGETS.get(ticker, []),
            "targetSource": "최근 공개 애널리스트 리포트 스냅샷",
            "error": str(error),
        }


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
