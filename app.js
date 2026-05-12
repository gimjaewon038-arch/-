const companies = [
  {
    ticker: "AAPL",
    name: "Apple",
    sector: "Technology Hardware",
    profile: "서비스 매출과 프리미엄 기기 생태계가 핵심인 대형 현금흐름 기업",
    sensitivity: { duration: 0.45, cyclical: 0.38, policy: 0.34, dollar: 0.48 },
    scores: { growth: 72, profitability: 88, fundamentals: 90, guidance: 70, companyRisk: 24, macroRegime: 63, rateSensitivity: 56, policyImpact: 62, sectorMomentum: 68, cycleFit: 65 },
  },
  {
    ticker: "NVDA",
    name: "NVIDIA",
    sector: "Semiconductors",
    profile: "AI 인프라 투자 사이클과 데이터센터 가속기 수요에 민감한 고성장 기업",
    sensitivity: { duration: 0.82, cyclical: 0.58, policy: 0.52, dollar: 0.44 },
    scores: { growth: 94, profitability: 91, fundamentals: 82, guidance: 89, companyRisk: 42, macroRegime: 68, rateSensitivity: 47, policyImpact: 58, sectorMomentum: 88, cycleFit: 78 },
  },
  {
    ticker: "TSLA",
    name: "Tesla",
    sector: "Consumer Discretionary",
    profile: "전기차 수요, 가격 정책, 금리, 정책 보조금에 모두 민감한 성장주",
    sensitivity: { duration: 0.9, cyclical: 0.72, policy: 0.76, dollar: 0.35 },
    scores: { growth: 66, profitability: 59, fundamentals: 63, guidance: 54, companyRisk: 62, macroRegime: 51, rateSensitivity: 38, policyImpact: 55, sectorMomentum: 49, cycleFit: 43 },
  },
  {
    ticker: "JPM",
    name: "JPMorgan Chase",
    sector: "Financials",
    profile: "순이자마진, 신용 사이클, 자본 규제, 경기 방향에 민감한 대형 은행",
    sensitivity: { duration: -0.22, cyclical: 0.7, policy: 0.69, dollar: 0.18 },
    scores: { growth: 58, profitability: 76, fundamentals: 84, guidance: 63, companyRisk: 36, macroRegime: 61, rateSensitivity: 72, policyImpact: 57, sectorMomentum: 63, cycleFit: 59 },
  },
  {
    ticker: "XOM",
    name: "Exxon Mobil",
    sector: "Energy",
    profile: "유가, 정제마진, 자본환원, 에너지 정책에 민감한 업스트림 중심 기업",
    sensitivity: { duration: -0.08, cyclical: 0.64, policy: 0.73, dollar: 0.41 },
    scores: { growth: 47, profitability: 78, fundamentals: 81, guidance: 64, companyRisk: 34, macroRegime: 66, rateSensitivity: 69, policyImpact: 49, sectorMomentum: 71, cycleFit: 68 },
  },
  {
    ticker: "HIMS",
    name: "Hims & Hers Health",
    sector: "Digital Health",
    profile: "구독형 원격진료와 개인화 헬스케어 수요에 노출된 고성장 헬스 플랫폼",
    sensitivity: { duration: 0.86, cyclical: 0.46, policy: 0.82, dollar: 0.12 },
    scores: { growth: 88, profitability: 61, fundamentals: 68, guidance: 82, companyRisk: 58, macroRegime: 56, rateSensitivity: 42, policyImpact: 48, sectorMomentum: 67, cycleFit: 61 },
  },
  {
    ticker: "OSCR",
    name: "Oscar Health",
    sector: "Managed Care",
    profile: "ACA 개인 보험 시장, 의료비 추세, 정책 변화에 민감한 성장형 헬스케어 보험사",
    sensitivity: { duration: 0.62, cyclical: 0.34, policy: 0.9, dollar: 0.08 },
    scores: { growth: 79, profitability: 53, fundamentals: 57, guidance: 72, companyRisk: 66, macroRegime: 55, rateSensitivity: 51, policyImpact: 44, sectorMomentum: 58, cycleFit: 54 },
  },
  {
    ticker: "SOFI",
    name: "SoFi Technologies",
    sector: "Fintech",
    profile: "대출 성장, 예금 조달비용, 신용 사이클에 민감한 디지털 금융 플랫폼",
    sensitivity: { duration: 0.78, cyclical: 0.76, policy: 0.64, dollar: 0.1 },
    scores: { growth: 82, profitability: 57, fundamentals: 62, guidance: 76, companyRisk: 61, macroRegime: 50, rateSensitivity: 39, policyImpact: 52, sectorMomentum: 57, cycleFit: 49 },
  },
  {
    ticker: "HOOD",
    name: "Robinhood Markets",
    sector: "Fintech",
    profile: "거래 활동, 현금 잔고 수익, 암호자산 사이클에 민감한 리테일 브로커리지",
    sensitivity: { duration: 0.64, cyclical: 0.82, policy: 0.7, dollar: 0.15 },
    scores: { growth: 77, profitability: 65, fundamentals: 66, guidance: 70, companyRisk: 59, macroRegime: 57, rateSensitivity: 54, policyImpact: 49, sectorMomentum: 62, cycleFit: 58 },
  },
  {
    ticker: "RKLB",
    name: "Rocket Lab",
    sector: "Space & Defense",
    profile: "발사 서비스와 우주 시스템 수주, 정부 예산, 장기 성장 할인율에 민감한 우주 기업",
    sensitivity: { duration: 0.93, cyclical: 0.52, policy: 0.78, dollar: 0.28 },
    scores: { growth: 84, profitability: 38, fundamentals: 51, guidance: 69, companyRisk: 72, macroRegime: 48, rateSensitivity: 34, policyImpact: 61, sectorMomentum: 64, cycleFit: 55 },
  },
  {
    ticker: "RDDT",
    name: "Reddit",
    sector: "Internet Media",
    profile: "광고 경기, 데이터 라이선싱, AI 검색 트래픽 변화에 민감한 커뮤니티 플랫폼",
    sensitivity: { duration: 0.83, cyclical: 0.7, policy: 0.46, dollar: 0.22 },
    scores: { growth: 86, profitability: 49, fundamentals: 58, guidance: 74, companyRisk: 64, macroRegime: 53, rateSensitivity: 40, policyImpact: 56, sectorMomentum: 69, cycleFit: 60 },
  },
  {
    ticker: "DUOL",
    name: "Duolingo",
    sector: "Consumer Software",
    profile: "구독 전환, AI 학습 기능, 글로벌 소비 지출에 민감한 교육 소프트웨어 기업",
    sensitivity: { duration: 0.87, cyclical: 0.43, policy: 0.26, dollar: 0.36 },
    scores: { growth: 83, profitability: 72, fundamentals: 76, guidance: 78, companyRisk: 45, macroRegime: 61, rateSensitivity: 43, policyImpact: 66, sectorMomentum: 72, cycleFit: 67 },
  },
  {
    ticker: "PLTR",
    name: "Palantir",
    sector: "AI Software",
    profile: "정부·상업 AI 플랫폼 도입, 국방 예산, 고멀티플 밸류에이션에 민감한 소프트웨어 기업",
    sensitivity: { duration: 0.88, cyclical: 0.48, policy: 0.74, dollar: 0.32 },
    scores: { growth: 85, profitability: 74, fundamentals: 73, guidance: 80, companyRisk: 50, macroRegime: 62, rateSensitivity: 41, policyImpact: 63, sectorMomentum: 81, cycleFit: 70 },
  },
  {
    ticker: "CRWD",
    name: "CrowdStrike",
    sector: "Cybersecurity",
    profile: "엔터프라이즈 보안 지출, ARR 성장, 소프트웨어 밸류에이션에 민감한 보안 플랫폼",
    sensitivity: { duration: 0.79, cyclical: 0.4, policy: 0.38, dollar: 0.3 },
    scores: { growth: 80, profitability: 73, fundamentals: 77, guidance: 76, companyRisk: 44, macroRegime: 64, rateSensitivity: 46, policyImpact: 67, sectorMomentum: 76, cycleFit: 69 },
  },
  {
    ticker: "NET",
    name: "Cloudflare",
    sector: "Cloud Infrastructure",
    profile: "네트워크 보안, 엣지 컴퓨팅, 개발자 플랫폼 수요에 민감한 클라우드 인프라 기업",
    sensitivity: { duration: 0.91, cyclical: 0.45, policy: 0.34, dollar: 0.31 },
    scores: { growth: 78, profitability: 50, fundamentals: 61, guidance: 69, companyRisk: 57, macroRegime: 55, rateSensitivity: 36, policyImpact: 62, sectorMomentum: 71, cycleFit: 58 },
  },
  {
    ticker: "APP",
    name: "AppLovin",
    sector: "AdTech",
    profile: "모바일 광고 예산, AI 광고 최적화, 소비 앱 사이클에 민감한 광고 기술 기업",
    sensitivity: { duration: 0.76, cyclical: 0.84, policy: 0.36, dollar: 0.27 },
    scores: { growth: 87, profitability: 83, fundamentals: 75, guidance: 81, companyRisk: 52, macroRegime: 60, rateSensitivity: 45, policyImpact: 64, sectorMomentum: 74, cycleFit: 68 },
  },
  {
    ticker: "TMDX",
    name: "TransMedics",
    sector: "Medical Technology",
    profile: "장기 이식 물류 플랫폼과 의료기기 채택률에 민감한 고성장 메드테크 기업",
    sensitivity: { duration: 0.81, cyclical: 0.25, policy: 0.58, dollar: 0.09 },
    scores: { growth: 81, profitability: 42, fundamentals: 56, guidance: 73, companyRisk: 68, macroRegime: 59, rateSensitivity: 44, policyImpact: 57, sectorMomentum: 66, cycleFit: 60 },
  },
  {
    ticker: "IONQ",
    name: "IonQ",
    sector: "Quantum Computing",
    profile: "양자컴퓨팅 상용화 기대와 장기 R&D 자금조달 환경에 민감한 초기 성장주",
    sensitivity: { duration: 0.98, cyclical: 0.5, policy: 0.67, dollar: 0.18 },
    scores: { growth: 76, profitability: 18, fundamentals: 36, guidance: 58, companyRisk: 84, macroRegime: 42, rateSensitivity: 24, policyImpact: 54, sectorMomentum: 63, cycleFit: 45 },
  },
];

const macroState = {
  fedFunds: { label: "Fed Funds", value: "5.25-5.50%", trend: "Higher for longer", interpretation: "장기 성장주 밸류에이션에는 부담, 은행 NIM에는 일부 우호" },
  tenYear: { label: "10Y Treasury", value: "4.42%", trend: "+18bp", interpretation: "듀레이션이 긴 기술/소비 성장주에 할인율 압력" },
  cpi: { label: "CPI", value: "3.3%", trend: "둔화", interpretation: "완화 기대를 높이지만 서비스 물가가 리스크로 남음" },
  ism: { label: "ISM Manufacturing", value: "50.9", trend: "확장 전환", interpretation: "산업재, 에너지, 반도체 주문 사이클에 우호" },
};

const nasdaq100Constituents = [
  ["AAPL", "Apple", "Technology Hardware"],
  ["ABNB", "Airbnb", "Travel Platform"],
  ["ADBE", "Adobe", "Creative Software"],
  ["ADI", "Analog Devices", "Semiconductors"],
  ["ADP", "Automatic Data Processing", "Human Capital Management"],
  ["ADSK", "Autodesk", "Design Software"],
  ["AEP", "American Electric Power", "Utilities"],
  ["ALNY", "Alnylam Pharmaceuticals", "Biotechnology"],
  ["AMAT", "Applied Materials", "Semiconductor Equipment"],
  ["AMD", "Advanced Micro Devices", "Semiconductors"],
  ["AMGN", "Amgen", "Biotechnology"],
  ["AMZN", "Amazon.com", "E-Commerce & Cloud"],
  ["APP", "AppLovin", "AdTech"],
  ["ARM", "Arm Holdings", "Semiconductors"],
  ["ASML", "ASML Holding", "Semiconductor Equipment"],
  ["AVGO", "Broadcom", "Semiconductors"],
  ["AXON", "Axon Enterprise", "Public Safety Technology"],
  ["BKNG", "Booking Holdings", "Online Travel"],
  ["BKR", "Baker Hughes", "Energy Services"],
  ["CCEP", "Coca-Cola Europacific Partners", "Consumer Staples"],
  ["CDNS", "Cadence Design Systems", "EDA Software"],
  ["CEG", "Constellation Energy", "Clean Energy"],
  ["CHTR", "Charter Communications", "Telecom"],
  ["CMCSA", "Comcast", "Media & Telecom"],
  ["COST", "Costco Wholesale", "Retail"],
  ["CPRT", "Copart", "Auction Services"],
  ["CRWD", "CrowdStrike", "Cybersecurity"],
  ["CSCO", "Cisco Systems", "Networking"],
  ["CSGP", "CoStar Group", "Real Estate Data"],
  ["CSX", "CSX", "Railroads"],
  ["CTAS", "Cintas", "Business Services"],
  ["CTSH", "Cognizant", "IT Services"],
  ["DASH", "DoorDash", "Local Commerce"],
  ["DDOG", "Datadog", "Observability Software"],
  ["DXCM", "DexCom", "Medical Devices"],
  ["EA", "Electronic Arts", "Gaming"],
  ["EXC", "Exelon", "Utilities"],
  ["FANG", "Diamondback Energy", "Energy"],
  ["FAST", "Fastenal", "Industrial Distribution"],
  ["FER", "Ferrovial", "Infrastructure"],
  ["FTNT", "Fortinet", "Cybersecurity"],
  ["GEHC", "GE HealthCare", "Medical Technology"],
  ["GILD", "Gilead Sciences", "Biotechnology"],
  ["GOOG", "Alphabet Class C", "Internet Platforms"],
  ["GOOGL", "Alphabet Class A", "Internet Platforms"],
  ["HON", "Honeywell", "Industrials"],
  ["IDXX", "IDEXX Laboratories", "Animal Health"],
  ["INSM", "Insmed", "Biotechnology"],
  ["INTC", "Intel", "Semiconductors"],
  ["INTU", "Intuit", "Financial Software"],
  ["ISRG", "Intuitive Surgical", "Medical Technology"],
  ["KDP", "Keurig Dr Pepper", "Consumer Staples"],
  ["KHC", "Kraft Heinz", "Consumer Staples"],
  ["KLAC", "KLA", "Semiconductor Equipment"],
  ["LIN", "Linde", "Industrial Gases"],
  ["LRCX", "Lam Research", "Semiconductor Equipment"],
  ["MAR", "Marriott International", "Lodging"],
  ["MCHP", "Microchip Technology", "Semiconductors"],
  ["MDLZ", "Mondelez International", "Consumer Staples"],
  ["MELI", "MercadoLibre", "E-Commerce & Fintech"],
  ["META", "Meta Platforms", "Social Platforms"],
  ["MNST", "Monster Beverage", "Consumer Staples"],
  ["MPWR", "Monolithic Power Systems", "Semiconductors"],
  ["MRVL", "Marvell Technology", "Semiconductors"],
  ["MSFT", "Microsoft", "Cloud Software"],
  ["MSTR", "MicroStrategy", "Bitcoin Treasury & Software"],
  ["MU", "Micron Technology", "Memory Semiconductors"],
  ["NFLX", "Netflix", "Streaming Media"],
  ["NVDA", "NVIDIA", "Semiconductors"],
  ["NXPI", "NXP Semiconductors", "Semiconductors"],
  ["ODFL", "Old Dominion Freight Line", "Logistics"],
  ["ORLY", "O'Reilly Automotive", "Auto Parts Retail"],
  ["PANW", "Palo Alto Networks", "Cybersecurity"],
  ["PAYX", "Paychex", "Human Capital Management"],
  ["PCAR", "PACCAR", "Truck Manufacturing"],
  ["PDD", "PDD Holdings", "E-Commerce"],
  ["PEP", "PepsiCo", "Consumer Staples"],
  ["PLTR", "Palantir", "AI Software"],
  ["PYPL", "PayPal", "Fintech"],
  ["QCOM", "Qualcomm", "Semiconductors"],
  ["REGN", "Regeneron Pharmaceuticals", "Biotechnology"],
  ["ROP", "Roper Technologies", "Vertical Software"],
  ["ROST", "Ross Stores", "Off-Price Retail"],
  ["SBUX", "Starbucks", "Restaurants"],
  ["SHOP", "Shopify", "E-Commerce Software"],
  ["SNPS", "Synopsys", "EDA Software"],
  ["STX", "Seagate Technology", "Data Storage"],
  ["TEAM", "Atlassian", "Collaboration Software"],
  ["TMUS", "T-Mobile US", "Telecom"],
  ["TRI", "Thomson Reuters", "Information Services"],
  ["TSLA", "Tesla", "Electric Vehicles"],
  ["TTWO", "Take-Two Interactive", "Gaming"],
  ["TXN", "Texas Instruments", "Semiconductors"],
  ["VRSK", "Verisk Analytics", "Data Analytics"],
  ["VRTX", "Vertex Pharmaceuticals", "Biotechnology"],
  ["WBD", "Warner Bros. Discovery", "Media"],
  ["WDAY", "Workday", "Enterprise Software"],
  ["WDC", "Western Digital", "Data Storage"],
  ["WMT", "Walmart", "Retail"],
  ["XEL", "Xcel Energy", "Utilities"],
  ["ZS", "Zscaler", "Cybersecurity"],
];

const sectorDefaults = {
  "Semiconductors": { duration: 0.78, cyclical: 0.58, policy: 0.46, dollar: 0.34 },
  "Semiconductor Equipment": { duration: 0.74, cyclical: 0.66, policy: 0.48, dollar: 0.38 },
  "Biotechnology": { duration: 0.72, cyclical: 0.22, policy: 0.62, dollar: 0.16 },
  "Cybersecurity": { duration: 0.72, cyclical: 0.36, policy: 0.38, dollar: 0.22 },
  "Utilities": { duration: -0.12, cyclical: 0.18, policy: 0.55, dollar: 0.04 },
  "Consumer Staples": { duration: 0.2, cyclical: 0.24, policy: 0.24, dollar: 0.22 },
  "Retail": { duration: 0.38, cyclical: 0.58, policy: 0.18, dollar: 0.16 },
  "Telecom": { duration: 0.3, cyclical: 0.28, policy: 0.48, dollar: 0.08 },
  "Energy": { duration: -0.08, cyclical: 0.64, policy: 0.73, dollar: 0.41 },
  "Energy Services": { duration: 0.08, cyclical: 0.72, policy: 0.66, dollar: 0.38 },
};

function hashTicker(ticker) {
  return ticker.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);
}

function defaultSensitivity(sector) {
  return sectorDefaults[sector] || { duration: 0.62, cyclical: 0.46, policy: 0.36, dollar: 0.24 };
}

function defaultScores(ticker, sector) {
  const seed = hashTicker(ticker);
  const isGrowth =
    /Software|Cloud|AI|Internet|E-Commerce|Cybersecurity|Biotechnology|Semiconductors|Medical|Gaming|Fintech/.test(sector);
  const isDefensive = /Utilities|Consumer Staples|Telecom|Retail/.test(sector);
  const isCyclical = /Energy|Industrial|Travel|Lodging|Restaurants|Auto|Logistics|Advertising|Media/.test(sector);
  return {
    growth: clamp(58 + (seed % 18) + (isGrowth ? 10 : 0) - (isDefensive ? 4 : 0)),
    profitability: clamp(55 + ((seed * 3) % 22) + (isDefensive ? 7 : 0)),
    fundamentals: clamp(58 + ((seed * 5) % 20) + (isDefensive ? 6 : 0)),
    guidance: clamp(55 + ((seed * 7) % 21) + (isGrowth ? 4 : 0)),
    companyRisk: clamp(32 + ((seed * 11) % 25) + (isGrowth ? 8 : 0) + (isCyclical ? 6 : 0)),
    macroRegime: clamp(50 + ((seed * 13) % 22) - (isCyclical ? 3 : 0)),
    rateSensitivity: clamp(45 + ((seed * 17) % 22) - (isGrowth ? 7 : 0) + (isDefensive ? 5 : 0)),
    policyImpact: clamp(48 + ((seed * 19) % 20)),
    sectorMomentum: clamp(50 + ((seed * 23) % 24) + (isGrowth ? 4 : 0)),
    cycleFit: clamp(48 + ((seed * 29) % 24) - (isCyclical ? 2 : 0)),
  };
}

const companyProfileOverrides = {
  ABNB: "전 세계 숙박·체험 예약을 연결하는 여행 플랫폼으로, 여행 수요와 호스트 공급, 규제, 소비 경기 변화에 민감합니다.",
  ADBE: "Creative Cloud, Document Cloud, Experience Cloud를 보유한 소프트웨어 기업으로, 구독 유지율과 생성형 AI 기능의 수익화가 핵심입니다.",
  ADI: "산업·자동차·통신용 아날로그 반도체를 공급하며, 산업 자동화와 자동차 전장화 사이클에 민감합니다.",
  ADP: "급여 처리와 인사관리 솔루션을 제공하는 반복매출 기업으로, 고용 시장과 중소기업 활동성이 실적의 주요 변수입니다.",
  ADSK: "건축, 제조, 미디어 설계 소프트웨어를 제공하며, 건설 투자와 제조 설계 수요, 클라우드 전환이 성장 동력입니다.",
  AEP: "미국 전력 유틸리티 기업으로, 전력 수요와 송전망 투자, 규제 수익률, 금리 변화가 밸류에이션에 큰 영향을 줍니다.",
  ALNY: "RNAi 기반 희귀질환 치료제를 개발·판매하는 바이오 기업으로, 파이프라인 임상 성과와 약가/보험 적용이 핵심입니다.",
  AMAT: "반도체 제조 장비를 공급하며, 메모리·파운드리 투자 사이클과 AI 반도체 증설 수요에 민감합니다.",
  AMD: "CPU, GPU, 데이터센터 가속기를 판매하는 반도체 기업으로, AI 서버 수요와 PC·게임 콘솔 사이클이 실적을 좌우합니다.",
  AMGN: "바이오 의약품 포트폴리오와 신약 파이프라인을 보유한 제약사로, 특허 만료와 신제품 성장률이 핵심 변수입니다.",
  AMZN: "전자상거래, AWS 클라우드, 광고 사업을 보유한 플랫폼 기업으로, 소비 경기와 클라우드 지출, 물류 효율성이 중요합니다.",
  ARM: "저전력 반도체 설계 IP를 라이선스하는 기업으로, 모바일·서버·AI칩 채택 확대와 로열티 단가가 성장 동력입니다.",
  ASML: "EUV 노광장비를 독점적으로 공급하는 반도체 장비 기업으로, 선단공정 투자와 대중국 수출 규제가 핵심 리스크입니다.",
  AVGO: "네트워킹·무선·스토리지 반도체와 인프라 소프트웨어를 보유하며, AI 네트워크 투자와 VMware 통합 성과가 중요합니다.",
  AXON: "경찰·공공안전용 바디캠, 테이저, 클라우드 증거관리 플랫폼을 제공하며, 공공 예산과 구독형 소프트웨어 확장이 핵심입니다.",
  BKNG: "Booking.com, Priceline 등 온라인 여행 예약 플랫폼을 운영하며, 글로벌 여행 수요와 숙박 가격, 환율에 민감합니다.",
  BKR: "유전 서비스와 에너지 장비를 공급하며, LNG 투자, 업스트림 자본지출, 유가 사이클에 민감합니다.",
  CCEP: "유럽·아시아태평양 지역 코카콜라 보틀링 기업으로, 음료 소비와 가격 전가력, 환율, 원재료 비용이 중요합니다.",
  CDNS: "반도체 설계 자동화 소프트웨어를 제공하며, AI칩 설계 복잡도 상승과 반도체 R&D 지출 증가의 수혜를 받습니다.",
  CEG: "원자력과 청정 전력 생산 비중이 높은 발전 기업으로, 전력 가격과 데이터센터 전력 수요, 에너지 정책이 핵심입니다.",
  CHTR: "미국 케이블·브로드밴드 사업자로, 인터넷 가입자 순증, 무선 번들 전략, 콘텐츠 비용과 경쟁 강도가 실적을 좌우합니다.",
  CMCSA: "브로드밴드, 케이블, NBCUniversal, 테마파크를 보유한 미디어·통신 기업으로, 가입자 감소와 광고 경기 회복이 주요 변수입니다.",
  COST: "회원제 창고형 할인점으로, 멤버십 갱신율과 트래픽, 식품 가격, 소비자 가격 민감도가 핵심입니다.",
  CPRT: "온라인 차량 경매 플랫폼을 운영하며, 보험 전손 차량 물량과 중고차 가격, 해외 바이어 수요에 민감합니다.",
  CSCO: "네트워킹 장비와 보안·협업 소프트웨어를 제공하며, 기업 IT 투자와 반복매출 전환, AI 네트워크 수요가 중요합니다.",
  CSGP: "상업용 부동산 데이터와 마켓플레이스를 제공하며, 부동산 거래량과 구독 데이터 수요, 금리 환경에 민감합니다.",
  CSX: "미국 동부 철도 운송 기업으로, 산업 생산과 석탄·복합운송 물동량, 연료비, 운임이 실적을 좌우합니다.",
  CTAS: "유니폼 렌탈과 시설관리 서비스를 제공하는 기업으로, 고용 수준과 서비스 가격 전가력, 중소기업 활동성이 중요합니다.",
  CTSH: "IT 컨설팅과 아웃소싱 서비스를 제공하며, 기업 디지털 전환 예산과 금융·헬스케어 고객 지출이 핵심 변수입니다.",
  DASH: "음식배달과 지역 커머스 플랫폼으로, 주문 빈도와 광고/멤버십 수익화, 배달 비용 효율성이 중요합니다.",
  DDOG: "클라우드 모니터링과 보안 관측성 플랫폼을 제공하며, 클라우드 사용량 회복과 대형 고객 확장이 성장 동력입니다.",
  DXCM: "연속혈당측정기 CGM을 판매하는 의료기기 기업으로, 당뇨 환자 침투율과 보험 적용 확대, 경쟁 제품 출시가 중요합니다.",
  EA: "스포츠와 라이브서비스 게임 포트폴리오를 보유하며, 신작 출시 성과와 인게임 결제, 콘솔 사이클에 민감합니다.",
  EXC: "미국 전력·가스 유틸리티 기업으로, 규제 승인 투자와 전력망 현대화, 금리 수준이 주가와 실적에 영향을 줍니다.",
  FANG: "미국 셰일 중심의 석유·가스 생산 기업으로, 유가와 생산 효율, 자본환원 정책, 시추 비용이 핵심입니다.",
  FAST: "산업용 패스너와 MRO 제품을 공급하며, 제조업 가동률과 고객 현장 자동판매기 침투율이 성장의 핵심입니다.",
  FER: "교통 인프라와 공항·도로 운영 자산을 보유하며, 통행량과 인프라 투자, 금리와 규제 수익률이 중요합니다.",
  FTNT: "방화벽과 보안 플랫폼을 제공하는 사이버보안 기업으로, 네트워크 보안 교체주기와 SASE 전환이 핵심입니다.",
  GEHC: "영상진단, 초음파, 환자 모니터링 장비를 공급하며, 병원 자본지출과 절차량 회복, 서비스 매출이 중요합니다.",
  GILD: "항바이러스제와 항암제 포트폴리오를 보유한 제약사로, HIV 프랜차이즈 방어와 신약 파이프라인 성과가 핵심입니다.",
  GOOG: "검색, YouTube, 광고, Google Cloud, AI 인프라를 보유한 플랫폼 기업으로, 광고 경기와 AI 검색 전환이 핵심입니다.",
  GOOGL: "검색, YouTube, 광고, Google Cloud, AI 인프라를 보유한 플랫폼 기업으로, 광고 경기와 AI 검색 전환이 핵심입니다.",
  HON: "항공우주, 자동화, 에너지 솔루션을 보유한 산업재 기업으로, 항공 수요와 자동화 투자, 주문잔고가 중요합니다.",
  IDXX: "동물병원 진단 장비와 검사 서비스를 제공하며, 반려동물 의료 지출과 진단 소모품 반복매출이 성장 동력입니다.",
  INSM: "희귀 폐질환 치료제와 파이프라인을 보유한 바이오 기업으로, 임상 데이터와 승인 일정, 상업화 속도가 핵심입니다.",
  INTC: "CPU와 파운드리 전환을 추진하는 반도체 기업으로, 공정 경쟁력 회복과 AI/서버 점유율, 설비투자 부담이 중요합니다.",
  INTU: "TurboTax, QuickBooks, Credit Karma를 보유한 금융 소프트웨어 기업으로, 중소기업 활동과 AI 자동화 수익화가 핵심입니다.",
  ISRG: "다빈치 수술 로봇 플랫폼을 제공하며, 설치 대수 증가와 수술 건수, 소모품 반복매출이 실적을 견인합니다.",
  KDP: "커피와 탄산·비탄산 음료 포트폴리오를 보유하며, 가격 전가력과 유통 채널, 원재료 비용이 중요합니다.",
  KHC: "가공식품 브랜드를 보유한 소비재 기업으로, 가격 전가 이후 물량 회복과 브랜드 투자, 원가 안정이 핵심입니다.",
  KLAC: "반도체 공정 검사·계측 장비를 공급하며, 선단공정 수율 관리와 파운드리·메모리 투자 사이클에 민감합니다.",
  LIN: "산업용 가스 글로벌 리더로, 장기 공급계약과 에너지·화학·전자 고객 수요, 가격 전가력이 핵심입니다.",
  LRCX: "식각·증착 장비를 공급하는 반도체 장비 기업으로, 메모리 투자 회복과 선단공정 장비 수요가 중요합니다.",
  MAR: "글로벌 호텔 브랜드와 프랜차이즈 모델을 운영하며, 객실당 매출, 여행 수요, 개발 파이프라인이 핵심입니다.",
  MCHP: "마이크로컨트롤러와 아날로그 반도체를 공급하며, 산업·자동차 재고 조정과 경기 회복 속도에 민감합니다.",
  MDLZ: "스낵과 초콜릿 브랜드를 보유한 글로벌 식품 기업으로, 신흥국 수요와 코코아 비용, 가격 전가력이 중요합니다.",
  MELI: "라틴아메리카 전자상거래와 핀테크 플랫폼으로, 물류 효율, 결제 성장, 환율과 지역 소비 경기가 핵심입니다.",
  META: "Facebook, Instagram, WhatsApp과 광고 플랫폼을 보유하며, AI 추천 효율과 광고 경기, 메타버스 투자 부담이 변수입니다.",
  MNST: "에너지드링크 브랜드를 판매하며, 유통 확장과 해외 성장, 소비재 마진, 경쟁 브랜드 동향이 중요합니다.",
  MPWR: "고성능 전력반도체를 공급하며, AI 서버 전력관리와 자동차·산업용 수요가 성장의 핵심입니다.",
  MRVL: "데이터센터 네트워킹과 맞춤형 실리콘을 공급하며, AI 인프라 투자와 통신·스토리지 사이클에 민감합니다.",
  MSFT: "Azure, Office, Windows, LinkedIn, AI 서비스를 보유한 소프트웨어 기업으로, 클라우드 성장과 AI 코파일럿 수익화가 핵심입니다.",
  MSTR: "엔터프라이즈 소프트웨어와 대규모 비트코인 보유 전략을 가진 기업으로, 비트코인 가격과 자본조달 환경에 매우 민감합니다.",
  MU: "DRAM과 NAND 메모리를 생산하며, AI 서버 HBM 수요와 메모리 가격 사이클, 설비투자 규율이 핵심입니다.",
  NFLX: "글로벌 스트리밍 플랫폼으로, 가입자 성장과 광고 요금제, 콘텐츠 투자 효율, 가격 인상이 실적을 좌우합니다.",
  NXPI: "자동차·산업용 반도체를 공급하며, 차량 전장화와 산업 수요 회복, 재고 정상화가 핵심 변수입니다.",
  ODFL: "미국 LTL 화물 운송사로, 산업 물동량과 운임, 운영 효율성, 경기 사이클에 민감합니다.",
  ORLY: "자동차 애프터마켓 부품 유통 기업으로, 차량 노후화와 DIY/정비 수요, 소비 둔화 방어력이 중요합니다.",
  PANW: "차세대 방화벽, 클라우드 보안, 보안 운영 플랫폼을 제공하며, 플랫폼 통합 전략과 대형 계약이 핵심입니다.",
  PAYX: "급여·HR 아웃소싱 서비스를 제공하며, 중소기업 고용과 금리수익, 고객 유지율이 실적을 좌우합니다.",
  PCAR: "Kenworth와 Peterbilt 트럭을 생산하며, 북미 트럭 교체수요와 운송 경기, 부품·금융 수익이 중요합니다.",
  PDD: "중국과 글로벌 e커머스 플랫폼을 운영하며, 소비 경기와 가격 경쟁, 해외 Temu 성장, 규제 리스크가 핵심입니다.",
  PEP: "음료와 스낵을 보유한 글로벌 소비재 기업으로, 가격 전가력과 물량 회복, 원재료 비용, 해외 성장률이 중요합니다.",
  PYPL: "디지털 결제 플랫폼으로, 결제 거래액 성장과 브랜드 체크아웃 경쟁력, 마진 회복, 금리수익이 핵심입니다.",
  QCOM: "스마트폰·자동차·IoT용 통신칩과 라이선스를 보유하며, 핸드셋 사이클과 온디바이스 AI 채택이 중요합니다.",
  REGN: "안과·면역·항암제 포트폴리오를 보유한 바이오 기업으로, 핵심 의약품 성장과 임상 파이프라인 성과가 변수입니다.",
  ROP: "고마진 버티컬 소프트웨어와 산업 기술 자산을 보유하며, 인수합병과 반복매출 성장, 가격 결정력이 핵심입니다.",
  ROST: "오프프라이스 의류 할인점으로, 저가 소비 수요와 재고 매입 기회, 임금·운임 비용이 중요합니다.",
  SBUX: "글로벌 커피 체인으로, 미국·중국 트래픽 회복과 가격 정책, 매장 생산성, 원두·인건비가 핵심입니다.",
  SHOP: "상인을 위한 e커머스 소프트웨어와 결제·물류 서비스를 제공하며, GMV 성장과 결제 침투율, 소비 경기 민감도가 중요합니다.",
  SNPS: "반도체 설계 자동화와 IP를 제공하며, AI칩 설계 수요와 반도체 R&D 지출, 소프트웨어 반복매출이 핵심입니다.",
  STX: "하드디스크와 데이터 저장장치를 공급하며, 클라우드 저장 수요와 엔터프라이즈 교체주기, 가격 사이클에 민감합니다.",
  TEAM: "Jira, Confluence 등 협업 소프트웨어를 제공하며, 클라우드 전환과 개발자 생산성 수요, 좌석 확장이 핵심입니다.",
  TMUS: "미국 무선통신 사업자로, 가입자 순증과 5G 네트워크 품질, 가격 경쟁, 자사주 매입이 중요합니다.",
  TRI: "법률·세무·뉴스 정보 서비스를 제공하며, 전문 데이터 구독과 AI 워크플로 도입, 반복매출 안정성이 핵심입니다.",
  TTWO: "Grand Theft Auto 등 게임 IP를 보유하며, 대형 신작 출시 일정과 라이브서비스 매출, 개발비가 핵심 변수입니다.",
  TXN: "아날로그와 임베디드 반도체를 공급하며, 산업·자동차 수요 회복과 재고 조정, 설비투자 효율이 중요합니다.",
  VRSK: "보험·리스크 데이터 분석 서비스를 제공하며, 보험사 데이터 수요와 구독 갱신, 재난 모델링 활용이 핵심입니다.",
  VRTX: "낭포성 섬유증 치료제와 유전자·세포치료 파이프라인을 보유하며, 신약 확장성과 약가 방어가 중요합니다.",
  WBD: "영화·TV·스트리밍 자산을 보유한 미디어 기업으로, 스트리밍 수익성, 광고 경기, 부채 축소가 핵심입니다.",
  WDAY: "인사·재무 클라우드 소프트웨어를 제공하며, 대기업 SaaS 지출과 갱신율, AI 기능 확장이 성장 변수입니다.",
  WDC: "하드디스크와 NAND 저장장치를 공급하며, 데이터센터 저장 수요와 메모리 가격 사이클, 분사/구조조정 효과가 중요합니다.",
  WMT: "대형 할인점과 식료품·이커머스 사업을 운영하며, 소비자 가격 민감도와 광고·멤버십 수익화, 재고 관리가 핵심입니다.",
  XEL: "전력·가스 유틸리티 기업으로, 재생에너지 투자와 규제 수익률, 전력 수요, 금리 수준이 중요합니다.",
  ZS: "클라우드 기반 제로트러스트 보안 플랫폼을 제공하며, 대기업 보안 통합과 SASE 채택, 영업 효율성이 핵심입니다.",
};

function buildUniverseProfile({ ticker, name, sector, industry, indexes }) {
  if (companyProfileOverrides[ticker]) return companyProfileOverrides[ticker];
  const indexText = indexes?.length ? `${indexes.join(", ")} 편입 종목` : "미국 상장사";
  const industryText = industry ? `${sector} 섹터의 ${industry} 산업` : `${sector} 섹터`;
  return `${name}은 ${indexText}으로, ${industryText}에서 사업을 영위합니다. 매출 성장, 마진 추세, 밸류에이션, 정책·금리·경기 사이클 변화가 상세 재평가의 핵심 변수입니다.`;
}

function buildCompanyRecord({ ticker, name, sector, industry = "", indexes = [] }) {
  return {
    ticker,
    name,
    sector,
    industry,
    indexes,
    profile: buildUniverseProfile({ ticker, name, sector, industry, indexes }),
    sensitivity: defaultSensitivity(sector),
    scores: defaultScores(ticker, sector),
  };
}

function buildNasdaqCompany([ticker, name, sector]) {
  return buildCompanyRecord({ ticker, name, sector, indexes: ["Nasdaq-100"] });
}

const existingCompanies = new Map(companies.map((company) => [company.ticker, company]));
nasdaq100Constituents.forEach((constituent) => {
  if (!existingCompanies.has(constituent[0])) {
    companies.push(buildNasdaqCompany(constituent));
  }
});

function mergeUniverseItems(items) {
  const byTicker = new Map(companies.map((company) => [company.ticker, company]));
  items.forEach((item) => {
    const ticker = item.ticker;
    if (!ticker) return;
    const existing = byTicker.get(ticker);
    if (existing) {
      const indexes = new Set([...(existing.indexes || []), ...(item.indexes || [])]);
      existing.indexes = [...indexes].sort();
      existing.industry = existing.industry || item.industry || "";
      existing.sector = existing.sector || item.sector || "Unknown";
      if (!companyProfileOverrides[ticker]) {
        existing.profile = buildUniverseProfile(existing);
      }
      return;
    }
    const company = buildCompanyRecord({
      ticker,
      name: item.name,
      sector: item.sector || "Unknown",
      industry: item.industry || "",
      indexes: item.indexes || [],
    });
    byTicker.set(ticker, company);
    companies.push(company);
  });
  companies.sort((a, b) => a.ticker.localeCompare(b.ticker));
}

async function loadUniverse() {
  try {
    const response = await fetch("/api/universe");
    if (!response.ok) throw new Error(`Universe request failed: ${response.status}`);
    const data = await response.json();
    mergeUniverseItems(data.items || []);
    universeLoaded = true;
    renderCompanyList();
  } catch (error) {
    universeLoaded = false;
  }
}

const sectors = [
  { etf: "XLK", name: "Technology", relative: 74, rate: "High", cycle: "Mid-cycle leadership" },
  { etf: "XLF", name: "Financials", relative: 62, rate: "Mixed", cycle: "Benefits from steepening, hurt by credit stress" },
  { etf: "XLE", name: "Energy", relative: 71, rate: "Low", cycle: "Late-cycle inflation hedge" },
  { etf: "XLY", name: "Consumer Discretionary", relative: 46, rate: "High", cycle: "Rate and credit sensitive" },
  { etf: "XLV", name: "Healthcare", relative: 57, rate: "Low", cycle: "Defensive compounder" },
  { etf: "XLI", name: "Industrials", relative: 60, rate: "Medium", cycle: "Manufacturing recovery exposure" },
  { etf: "ARKK", name: "High Growth", relative: 52, rate: "Very High", cycle: "Long-duration growth basket" },
  { etf: "ARKG", name: "Digital Health", relative: 59, rate: "High", cycle: "Policy and adoption sensitive" },
  { etf: "FINX", name: "Fintech", relative: 55, rate: "High", cycle: "Credit and liquidity sensitive" },
  { etf: "ITA", name: "Space & Defense", relative: 67, rate: "Medium", cycle: "Government budget support" },
  { etf: "CIBR", name: "Cybersecurity", relative: 70, rate: "Medium", cycle: "Resilient enterprise spend" },
  { etf: "CLOU", name: "Cloud Infrastructure", relative: 63, rate: "High", cycle: "Software multiple recovery" },
  { etf: "BOTZ", name: "AI Software", relative: 76, rate: "High", cycle: "AI platform leadership" },
  { etf: "SOCL", name: "Internet Media", relative: 61, rate: "High", cycle: "Ad market and AI data licensing" },
  { etf: "BLOK", name: "AdTech", relative: 66, rate: "High", cycle: "Mobile advertising recovery" },
  { etf: "QTUM", name: "Quantum Computing", relative: 58, rate: "Very High", cycle: "Speculative innovation cycle" },
];

const eventTemplates = {
  company: {
    title: "가이던스 업데이트",
    source: "Earnings call / SEC 8-K",
    summary: "경영진이 수요는 견조하지만 비용 통제와 재고 정상화를 다음 분기의 핵심 변수로 제시했습니다.",
  },
  macro: {
    title: "금리·물가 이벤트",
    source: "FRED / Federal Reserve / Policy news",
    summary: "장기 금리가 상승했지만 CPI 둔화가 확인되며 경기 연착륙 가능성이 일부 높아졌습니다.",
  },
};

let selectedTicker = "NVDA";
let currentPage = "overview";
let revisions = {};
let selectedCompanyFactor = "growth";
let selectedEnvironmentFactor = "macroRegime";
let expandedNewsLists = {};
let universeLoaded = false;
const companyFactorKeys = ["growth", "profitability", "fundamentals", "guidance", "companyRisk"];
const environmentFactorKeys = ["macroRegime", "rateSensitivity", "policyImpact", "sectorMomentum", "cycleFit"];

function clamp(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getCompany(ticker = selectedTicker) {
  return companies.find((company) => company.ticker === ticker) || companies[0];
}

function companyScores(company) {
  return { ...company.scores, ...(revisions[company.ticker]?.scores || {}) };
}

function ensureRevision(ticker) {
  revisions[ticker] = revisions[ticker] || { scores: {}, events: [], applied: {} };
  revisions[ticker].applied = revisions[ticker].applied || {};
  return revisions[ticker];
}

function mergeScores(company, changedScores, keys) {
  const revision = ensureRevision(company.ticker);
  const next = { ...revision.scores };
  keys.forEach((key) => {
    next[key] = changedScores[key];
  });
  revision.scores = next;
}

function calculateComposite(scores) {
  const companyPart =
    scores.growth * 0.18 +
    scores.profitability * 0.17 +
    scores.fundamentals * 0.18 +
    scores.guidance * 0.13 +
    (100 - scores.companyRisk) * 0.09;
  const externalPart =
    scores.macroRegime * 0.08 +
    scores.rateSensitivity * 0.06 +
    scores.policyImpact * 0.04 +
    scores.sectorMomentum * 0.04 +
    scores.cycleFit * 0.03;
  return clamp(companyPart + externalPart);
}

function buildTimeline(company) {
  const base = [
    {
      type: "company",
      title: `${company.ticker} 실적 가이던스 반영`,
      date: "2026-05-10",
      source: "Company guidance",
      summary: `${company.sector} 내 수요 전망, 마진 방어력, 재고 정상화 속도를 반영해 회사 자체 점수를 갱신했습니다.`,
    },
    {
      type: "macro",
      title: "FOMC와 장기금리 변화 반영",
      date: "2026-05-08",
      source: "FRED / Federal Reserve",
      summary: `금리 레벨과 인플레이션 둔화 속도를 ${company.name}의 금리 민감도 프로필에 매핑했습니다.`,
    },
    {
      type: "sector",
      title: `${company.sector} 섹터 상대강도 업데이트`,
      date: "2026-05-07",
      source: "Sector ETF model",
      summary: "섹터 ETF 상대 성과와 경기 민감도를 결합해 섹터 모멘텀 및 사이클 적합도를 재평가했습니다.",
    },
  ];
  return [...(revisions[company.ticker]?.events || []), ...base];
}

function factorLabel(key) {
  return {
    growth: "성장성",
    profitability: "수익성",
    fundamentals: "펀더멘탈",
    guidance: "가이던스",
    companyRisk: "기업 리스크",
    macroRegime: "매크로 레짐",
    rateSensitivity: "금리 민감도",
    policyImpact: "정책 영향",
    sectorMomentum: "섹터 모멘텀",
    cycleFit: "사이클 적합도",
  }[key];
}

function factorDetail(key, company, scores) {
  const value = scores[key];
  const band = value >= 75 ? "높은 점수" : value >= 55 ? "중간 점수" : "낮은 점수";
  const details = {
    growth: {
      reason: `${company.name}의 성장성은 ${company.sector} 내 수요 확장, 제품 채택 속도, 최근 가이던스 신뢰도를 반영해 ${value}점으로 평가했습니다.`,
      drivers: [`핵심 사업 설명: ${company.profile}`, `성장 점수는 가이던스 ${scores.guidance}점과 섹터 모멘텀 ${scores.sectorMomentum}점을 함께 참고합니다.`],
      risks: ["금리 상승, 수요 둔화, 경쟁 심화가 성장 프리미엄을 낮출 수 있습니다."],
    },
    profitability: {
      reason: `${company.name}의 수익성은 마진 방어력, 반복매출 성격, 비용 통제 여지를 반영해 ${value}점으로 평가했습니다.`,
      drivers: [`펀더멘탈 ${scores.fundamentals}점과 리스크 ${scores.companyRisk}점을 함께 보며 수익의 질을 판단합니다.`, "가격 전가력과 규모의 경제가 높을수록 점수에 우호적입니다."],
      risks: ["원가 상승, 판관비 투자 확대, 가격 경쟁은 수익성 점수를 낮추는 요인입니다."],
    },
    fundamentals: {
      reason: `${company.name}의 펀더멘탈은 사업 안정성, 현금흐름 가시성, 재무 체력, 경쟁 우위를 반영해 ${value}점으로 평가했습니다.`,
      drivers: [`수익성 ${scores.profitability}점과 기업 리스크 ${scores.companyRisk}점을 함께 반영합니다.`, "방어적 현금흐름과 높은 고객 유지율은 점수에 긍정적입니다."],
      risks: ["부채 부담, 고객 집중도, 구조적 성장 둔화는 펀더멘탈 할인 요인입니다."],
    },
    guidance: {
      reason: `${company.name}의 가이던스 점수는 경영진 전망, 수요 가시성, 다음 분기 실적 변수의 명확성을 반영해 ${value}점으로 책정했습니다.`,
      drivers: ["최근 뉴스/공시 반영 이벤트가 있으면 수요, 마진, 재고, 주문잔고 신호를 이 점수에 반영합니다.", `성장성 ${scores.growth}점과 수익성 ${scores.profitability}점이 가이던스 신뢰도 판단의 출발점입니다.`],
      risks: ["경영진 톤이 보수적으로 바뀌거나 비용·수요 불확실성이 커지면 점수가 낮아집니다."],
    },
    companyRisk: {
      reason: `${company.name}의 기업 리스크는 규제, 밸류에이션, 재무 부담, 경쟁 강도, 실적 변동성을 반영해 ${value}점으로 평가했습니다. 이 항목은 높을수록 부담입니다.`,
      drivers: [`${band} 구간이며, 종합 점수 계산에서는 100점에서 차감해 반영합니다.`, "초기 성장주, 경기민감주, 정책 민감 업종은 리스크 점수가 높게 나올 수 있습니다."],
      risks: ["리스크 점수가 높으면 좋은 뉴스가 있어도 종합 점수 상승 폭이 제한됩니다."],
    },
    macroRegime: {
      reason: `매크로 레짐 점수는 현재 금리, 물가, 경기 지표가 ${company.name}의 사업모델에 주는 방향성을 반영해 ${value}점으로 책정했습니다.`,
      drivers: [`경기 민감도 ${company.sensitivity.cyclical.toFixed(2)}, 금리 민감도 ${company.sensitivity.duration.toFixed(2)}를 사용합니다.`, "CPI 둔화와 경기 확장 신호가 동시에 확인되면 대부분 성장주에 우호적입니다."],
      risks: ["성장 둔화와 높은 금리가 동시에 나타나면 매크로 레짐 점수가 하락합니다."],
    },
    rateSensitivity: {
      reason: `금리 민감도 점수는 장기금리 변화가 ${company.name}의 밸류에이션과 자금조달 비용에 미치는 영향을 반영해 ${value}점으로 평가했습니다.`,
      drivers: [`듀레이션 민감도는 ${company.sensitivity.duration.toFixed(2)}입니다. 높을수록 금리 상승에 취약합니다.`, "현금흐름이 멀리 있는 고성장주는 금리 상승 시 할인율 부담이 커집니다."],
      risks: ["장기금리 상승, 신용 스프레드 확대, 자본조달 비용 증가는 점수 하락 요인입니다."],
    },
    policyImpact: {
      reason: `정책 영향 점수는 규제, 정부 지출, 보조금, 산업 정책이 ${company.name}에 주는 순효과를 반영해 ${value}점으로 책정했습니다.`,
      drivers: [`정책 민감도는 ${company.sensitivity.policy.toFixed(2)}입니다.`, "정책 명확성, 정부 예산, 규제 완화는 우호적으로 반영됩니다."],
      risks: ["반독점, 개인정보, 의료보험, 수출 규제처럼 업종별 정책 리스크가 커지면 점수가 낮아집니다."],
    },
    sectorMomentum: {
      reason: `섹터 모멘텀 점수는 ${company.sector}와 관련 ETF·동종 업종의 상대 강도를 반영해 ${value}점으로 평가했습니다.`,
      drivers: ["메인 페이지의 섹터 강약 그래프에서 강세 섹터일수록 이 점수에 우호적입니다.", "동종 기업의 실적 서프라이즈와 자금 유입도 반영 대상입니다."],
      risks: ["섹터 로테이션에서 소외되거나 동종 기업 가이던스가 약해지면 점수가 내려갑니다."],
    },
    cycleFit: {
      reason: `사이클 적합도는 현재 경기 국면이 ${company.name}의 매출·마진 구조와 얼마나 맞는지를 반영해 ${value}점으로 책정했습니다.`,
      drivers: [`경기 민감도 ${company.sensitivity.cyclical.toFixed(2)}와 업종 특성을 함께 봅니다.`, "제조업 회복, 소비 회복, 클라우드 지출 회복 등 업종별 사이클 신호를 반영합니다."],
      risks: ["현재 사이클과 사업모델이 어긋나면 뉴스가 좋아도 외부 환경 점수는 제한됩니다."],
    },
  };
  return details[key];
}

function renderCompanyList() {
  const query = document.querySelector("#companySearch").value.trim().toLowerCase();
  const list = document.querySelector("#companyList");
  list.innerHTML = "";
  if (!universeLoaded) {
    const loading = document.createElement("div");
    loading.className = "company-item";
    loading.innerHTML = `<strong>종목 universe 로딩 중</strong><span>S&P 500, Russell 2000 추가 중</span>`;
    list.appendChild(loading);
  }

  companies
    .filter((company) => `${company.ticker} ${company.name} ${company.sector}`.toLowerCase().includes(query))
    .forEach((company) => {
      const button = document.createElement("button");
      button.className = `company-item ${company.ticker === selectedTicker ? "active" : ""}`;
      button.type = "button";
      button.innerHTML = `<strong>${company.ticker} · ${company.name}</strong><span>${company.sector}</span>`;
      button.addEventListener("click", () => {
        selectedTicker = company.ticker;
        currentPage = "detail";
        document.querySelector(".app-shell").classList.add("sidebar-closed");
        document.body.classList.remove("sidebar-open");
        document.querySelector("#sidebarToggle").setAttribute("aria-label", "종목 사이드바 열기");
        render();
      });
      list.appendChild(button);
    });
}

function renderFactorDetail(containerId, key, company, scores) {
  const detail = factorDetail(key, company, scores);
  const container = document.querySelector(containerId);
  container.innerHTML = `
    <h3>${factorLabel(key)} · ${scores[key]}점</h3>
    <p>${detail.reason}</p>
    <ul>
      ${detail.drivers.map((item) => `<li>${item}</li>`).join("")}
      ${detail.risks.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  `;
}

function renderFactors(containerId, scores, keys, selectedKey, onSelect) {
  const container = document.querySelector(containerId);
  container.innerHTML = "";
  keys.forEach((key) => {
    const value = scores[key];
    const row = document.createElement("button");
    row.type = "button";
    row.className = `factor-row ${key === selectedKey ? "active" : ""}`;
    row.innerHTML = `
      <label>${factorLabel(key)}</label>
      <strong>${value}</strong>
      <div class="mini-meter"><span style="width:${value}%"></span></div>
    `;
    row.addEventListener("click", () => onSelect(key));
    container.appendChild(row);
  });
}

function renderFactorSections(company, scores) {
  renderFactors("#companyScores", scores, companyFactorKeys, selectedCompanyFactor, (key) => {
    selectedCompanyFactor = key;
    renderFactorSections(company, scores);
  });
  renderFactors("#environmentScores", scores, environmentFactorKeys, selectedEnvironmentFactor, (key) => {
    selectedEnvironmentFactor = key;
    renderFactorSections(company, scores);
  });
  renderFactorDetail("#companyFactorDetail", selectedCompanyFactor, company, scores);
  renderFactorDetail("#environmentFactorDetail", selectedEnvironmentFactor, company, scores);
}

function renderTimeline(company) {
  const timeline = document.querySelector("#timeline");
  timeline.innerHTML = "";
  buildTimeline(company).forEach((event) => {
    const item = document.createElement("article");
    item.className = "event";
    item.innerHTML = `
      <header>
        <h3>${event.title}</h3>
        <span class="pill">${event.date}</span>
      </header>
      <p><strong>${event.source}</strong> · ${event.summary}</p>
    `;
    timeline.appendChild(item);
  });
}

function renderMacro(containerId = "#macroGrid") {
  const grid = document.querySelector(containerId);
  if (!grid) return;
  grid.innerHTML = "";
  Object.values(macroState).forEach((item) => {
    const card = document.createElement("div");
    card.className = "macro-card";
    card.innerHTML = `
      <span>${item.label} · ${item.trend}</span>
      <strong>${item.value}</strong>
      <p>${item.interpretation}</p>
    `;
    grid.appendChild(card);
  });
}

function impactTone(value) {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "mixed";
}

function signedLabel(value) {
  if (value > 0) return "우호";
  if (value < 0) return "부담";
  return "중립";
}

function renderCompanyMacroImpact(company, scores) {
  const grid = document.querySelector("#macroGrid");
  grid.innerHTML = "";
  const durationImpact = company.sensitivity.duration > 0.75 ? -2 : company.sensitivity.duration < 0 ? 1 : -1;
  const inflationImpact = company.sensitivity.cyclical > 0.65 ? -1 : company.sensitivity.cyclical < 0.3 ? 1 : 0;
  const cycleImpact = company.sensitivity.cyclical > 0.65 ? 1 : company.sensitivity.cyclical < 0.3 ? -1 : 0;
  const policyImpact = scores.policyImpact >= 60 ? 1 : scores.policyImpact <= 50 ? -1 : 0;
  const cards = [
    {
      label: `${macroState.tenYear.label} · ${macroState.tenYear.trend}`,
      value: signedLabel(durationImpact),
      tone: impactTone(durationImpact),
      text:
        durationImpact < 0
          ? `${company.name}은 장기 성장 기대가 점수에 많이 반영되는 구조라 금리 상승 시 할인율 부담이 커지고 밸류에이션 압박을 받을 수 있습니다.`
          : `${company.name}은 금리 상승에 대한 직접 밸류에이션 부담이 상대적으로 낮아, 현금흐름 방어력이나 이자수익 요인이 더 중요합니다.`,
    },
    {
      label: `${macroState.cpi.label} · ${macroState.cpi.trend}`,
      value: signedLabel(inflationImpact),
      tone: impactTone(inflationImpact),
      text:
        inflationImpact < 0
          ? `물가가 다시 끈적해지면 비용과 소비 여력이 동시에 부담이 될 수 있어 ${company.sector}의 가이던스 확신도가 낮아집니다.`
          : `물가 둔화는 마진 압박과 금리 부담을 낮춰 ${company.sector}의 수익성 또는 멀티플 회복에 도움을 줄 수 있습니다.`,
    },
    {
      label: `${macroState.ism.label} · ${macroState.ism.trend}`,
      value: signedLabel(cycleImpact),
      tone: impactTone(cycleImpact),
      text:
        cycleImpact > 0
          ? `제조업과 수요 지표가 확장 쪽으로 움직이면 ${company.name}의 매출 성장 기대와 섹터 모멘텀에 우호적으로 작용합니다.`
          : `${company.name}은 경기 확장 신호보다 제품 채택, 규제, 구조적 수요가 더 중요해 경기 지표의 영향은 제한적입니다.`,
    },
    {
      label: "Policy & Regulation",
      value: signedLabel(policyImpact),
      tone: impactTone(policyImpact),
      text:
        policyImpact < 0
          ? `${company.sector}는 정책·규제 변화에 민감합니다. 규제 리스크가 커지면 성장성보다 리스크 프리미엄이 먼저 반영될 수 있습니다.`
          : `현재 정책 환경은 ${company.name}의 사업모델에 중립 이상입니다. 정부 지출, 규제 명확성, 산업 지원책이 추가 촉매가 될 수 있습니다.`,
    },
  ];

  cards.forEach((item) => {
    const card = document.createElement("div");
    card.className = `macro-card company-impact ${item.tone}`;
    card.innerHTML = `
      <span>${item.label}</span>
      <strong>${item.value}</strong>
      <p>${item.text}</p>
    `;
    grid.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderHeadlineState(container, message) {
  container.innerHTML = `<div class="headline-placeholder">${escapeHtml(message)}</div>`;
}

function renderHeadlines(container, items, listKey) {
  if (!items.length) {
    renderHeadlineState(container, "표시할 헤드라인을 찾지 못했습니다.");
    return;
  }
  const isExpanded = Boolean(expandedNewsLists[listKey]);
  container.classList.toggle("collapsed", !isExpanded && items.length > 3);
  const headlines = items
    .map(
      (item) => {
        const image = item.image
          ? `<div class="headline-image"><img src="${escapeHtml(item.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" /></div>`
          : `<div class="headline-image-placeholder">${escapeHtml(item.source || "News")}</div>`;
        return `
        <a class="headline" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">
          ${image}
          <div>
            <strong>${escapeHtml(item.titleKo || item.title)}</strong>
            <span>${escapeHtml(item.source)} · ${escapeHtml(item.published || "Latest")}</span>
          </div>
        </a>
      `;
      },
    )
    .join("");
  const toggle =
    items.length > 3
      ? `<button class="news-more-button" type="button" data-news-toggle="${escapeHtml(listKey)}" aria-label="${isExpanded ? "뉴스 접기" : "뉴스 더 보기"}" title="${isExpanded ? "뉴스 접기" : "뉴스 더 보기"}">${isExpanded ? "−" : "⋯"}</button>`
      : "";
  container.innerHTML = `${headlines}${toggle}`;
}

function renderIndicatorState(message) {
  document.querySelector("#marketIndicators").innerHTML = `<div class="headline-placeholder">${escapeHtml(message)}</div>`;
}

async function renderMarketIndicators() {
  const container = document.querySelector("#marketIndicators");
  renderIndicatorState("유명 지수와 시장 심리 데이터를 불러오는 중입니다.");
  try {
    const response = await fetch("/api/indices");
    if (!response.ok) {
      throw new Error(`Indices request failed: ${response.status}`);
    }
    const data = await response.json();
    container.innerHTML = (data.items || [])
      .map(
        (item) => `
          <article class="indicator-card ${escapeHtml(item.tone || "mixed")}">
            <span>${escapeHtml(item.name)} · ${escapeHtml(item.source || "Live")}</span>
            <strong>${escapeHtml(item.value)}</strong>
            <em>${escapeHtml(item.change)}</em>
            <p>${escapeHtml(item.note)}</p>
          </article>
        `,
      )
      .join("");
  } catch (error) {
    renderIndicatorState("시장 지수 API 연결이 필요합니다. server.py로 실행하면 지수 카드가 표시됩니다.");
  }
}

function renderMoneyFlowState(message) {
  document.querySelector("#moneyFlow").innerHTML = `<div class="headline-placeholder">${escapeHtml(message)}</div>`;
}

async function renderMoneyFlow() {
  const container = document.querySelector("#moneyFlow");
  renderMoneyFlowState("오늘 자산군별 자금 이동 흐름을 계산하는 중입니다.");
  try {
    const response = await fetch("/api/flows");
    if (!response.ok) {
      throw new Error(`Flows request failed: ${response.status}`);
    }
    const data = await response.json();
    const outflows = (data.outflows || [])
      .map(
        (item) => `
          <article class="flow-node weak">
            <strong>${escapeHtml(item.name)} · ${escapeHtml(item.symbol)}</strong>
            <span>${escapeHtml(item.group)}</span>
            <em>${escapeHtml(item.changeLabel)}</em>
          </article>
        `,
      )
      .join("");
    const inflows = (data.inflows || [])
      .map(
        (item) => `
          <article class="flow-node strong">
            <strong>${escapeHtml(item.name)} · ${escapeHtml(item.symbol)}</strong>
            <span>${escapeHtml(item.group)}</span>
            <em>${escapeHtml(item.changeLabel)}</em>
          </article>
        `,
      )
      .join("");
    const links = (data.links || [])
      .map(
        (item) => `
          <article class="flow-link">
            <strong>${escapeHtml(item.from)} → ${escapeHtml(item.to)}</strong>
            <span>${escapeHtml(item.label)}</span>
            <i style="width:${Number(item.strength) || 18}%"></i>
          </article>
        `,
      )
      .join("");
    container.innerHTML = `
      <p class="flow-summary">${escapeHtml(data.summary || "")}</p>
      <div class="flow-board">
        <section class="flow-column">
          <h3>상대 약세</h3>
          ${outflows}
        </section>
        <section class="flow-links">
          ${links}
        </section>
        <section class="flow-column">
          <h3>상대 강세</h3>
          ${inflows}
        </section>
      </div>
      <p class="flow-summary">${escapeHtml(data.note || "")}</p>
    `;
  } catch (error) {
    renderMoneyFlowState("자금 흐름 API 연결이 필요합니다. server.py로 실행하면 그래프가 표시됩니다.");
  }
}

async function fetchNews(company, type) {
  const params = new URLSearchParams({ type });
  if (company) {
    params.set("ticker", company.ticker);
    params.set("name", company.name);
    params.set("sector", company.sector);
  }
  const response = await fetch(`/api/news?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`News request failed: ${response.status}`);
  }
  return response.json();
}

async function renderMarketNews() {
  const container = document.querySelector("#marketNews");
  renderHeadlineState(container, "시장 전체 최신 뉴스 헤드라인을 불러오는 중입니다.");
  try {
    const news = await fetchNews(null, "market");
    renderHeadlines(container, news.items || [], "market");
  } catch (error) {
    renderHeadlineState(container, "뉴스 서버 연결이 필요합니다. server.py로 실행하면 시장 헤드라인이 표시됩니다.");
  }
}

async function renderLatestNews(company) {
  const tickerAtRequest = company.ticker;
  const companyContainer = document.querySelector("#companyNews");
  const relatedContainer = document.querySelector("#relatedNews");
  renderHeadlineState(companyContainer, `${company.ticker} 뉴스 헤드라인을 불러오는 중입니다.`);
  renderHeadlineState(relatedContainer, `${company.sector} 관련 뉴스 헤드라인을 불러오는 중입니다.`);

  try {
    const [companyNews, relatedNews] = await Promise.all([
      fetchNews(company, "company"),
      fetchNews(company, "related"),
    ]);
    if (selectedTicker !== tickerAtRequest) return;
    renderHeadlines(companyContainer, companyNews.items || [], `${company.ticker}-company`);
    renderHeadlines(relatedContainer, relatedNews.items || [], `${company.ticker}-related`);
  } catch (error) {
    if (selectedTicker !== tickerAtRequest) return;
    renderHeadlineState(companyContainer, "뉴스 서버 연결이 필요합니다. server.py로 실행하면 헤드라인이 표시됩니다.");
    renderHeadlineState(relatedContainer, "관련 뉴스도 같은 로컬 뉴스 서버를 통해 불러옵니다.");
  }
}

function renderSectorChart() {
  const chart = document.querySelector("#sectorChart");
  chart.innerHTML = "";
  [...sectors]
    .sort((a, b) => b.relative - a.relative)
    .forEach((sector) => {
      const row = document.createElement("div");
      const tone = sector.relative >= 68 ? "strong" : sector.relative >= 58 ? "neutral" : "weak";
      row.className = `sector-bar ${tone}`;
      row.innerHTML = `
      <strong>${sector.etf}</strong>
      <div class="bar-track">
        <span style="width:${sector.relative}%"></span>
        <em>${sector.name} · ${sector.cycle}</em>
      </div>
      <em>${sector.relative}</em>
    `;
      chart.appendChild(row);
    });
}

function companyEventImpact(company) {
  if (company.scores.companyRisk >= 68 || company.scores.profitability < 45) {
    return {
      impact: { growth: 1, profitability: -2, fundamentals: -1, guidance: 0, companyRisk: 3 },
      summary: "성장 내러티브는 유지됐지만 수익성 전환 시점과 자금조달 비용이 핵심 리스크로 재부각됐습니다.",
    };
  }
  if (company.sensitivity.cyclical >= 0.75) {
    return {
      impact: { growth: 1, profitability: 0, fundamentals: 0, guidance: -1, companyRisk: 2 },
      summary: "수요 회복 신호는 있으나 신용 사이클과 소비 둔화 가능성이 가이던스 확신도를 낮췄습니다.",
    };
  }
  if (company.scores.profitability >= 70 && company.scores.fundamentals >= 70) {
    return {
      impact: { growth: 2, profitability: 1, fundamentals: 1, guidance: 2, companyRisk: -1 },
      summary: "매출 가시성과 마진 방어력이 확인되며 회사 자체 점수에 우호적으로 반영됐습니다.",
    };
  }
  return {
    impact: { growth: 1, profitability: 0, fundamentals: 1, guidance: 1, companyRisk: 0 },
    summary: eventTemplates.company.summary,
  };
}

function renderMemo(company, scores, composite) {
  const memo = document.querySelector("#memo");
  const riskTone = scores.companyRisk >= 55 ? "리스크가 높은 편이라 점수 상승에도 확신도는 제한됩니다." : "리스크가 통제 가능한 수준이라 펀더멘탈 점수의 설명력이 높습니다.";
  const rateTone = scores.rateSensitivity < 50 ? "현재 금리 레벨은 밸류에이션에 부담입니다." : "현재 금리 환경은 비즈니스 모델에 중립 이상으로 작용합니다.";
  const policyTone = scores.policyImpact < 55 ? "정책 변수는 단기 불확실성으로 남아 있습니다." : "정책 환경은 상대적으로 우호적이거나 관리 가능한 수준입니다.";
  const sectorTone = scores.sectorMomentum >= 65 ? `${company.sector}의 상대 강도는 종합 점수를 지지합니다.` : `${company.sector}의 상대 강도는 아직 강한 확인 신호가 아닙니다.`;
  const cards = [
    ["기업 요인", `${company.name}의 성장성 ${scores.growth}, 수익성 ${scores.profitability}, 펀더멘탈 ${scores.fundamentals}을 반영했습니다. ${riskTone}`],
    ["매크로 요인", `매크로 레짐 ${scores.macroRegime}, 금리 민감도 ${scores.rateSensitivity}입니다. ${rateTone}`],
    ["섹터 요인", `섹터 모멘텀 ${scores.sectorMomentum}, 사이클 적합도 ${scores.cycleFit}입니다. ${sectorTone}`],
    ["정책 요인", `정책 영향 점수는 ${scores.policyImpact}입니다. ${policyTone} 현재 종합 점수는 ${composite}입니다.`],
  ];

  memo.innerHTML = cards
    .map(([title, body]) => `<article class="memo-card"><h3>${title}</h3><p>${body}</p></article>`)
    .join("");
}

function applyCompanyEvent() {
  const company = getCompany();
  const revision = ensureRevision(company.ticker);
  if (revision.applied.companyGuidance) {
    render();
    return;
  }
  const scenario = companyEventImpact(company);
  const next = { ...company.scores };
  Object.entries(scenario.impact).forEach(([key, delta]) => {
    next[key] = clamp(company.scores[key] + delta);
  });
  const event = {
    ...eventTemplates.company,
    summary: scenario.summary,
    date: new Date().toISOString().slice(0, 10),
    title: `${company.ticker} ${eventTemplates.company.title}`,
  };
  mergeScores(company, next, companyFactorKeys);
  revision.applied.companyGuidance = true;
  revision.events = [event, ...revision.events];
  render();
}

function applyMacroEvent() {
  const company = getCompany();
  const revision = ensureRevision(company.ticker);
  if (revision.applied.macroRates) {
    render();
    return;
  }
  const sector = sectors.find((item) => company.sector.includes(item.name) || item.name.includes(company.sector.split(" ")[0]));
  const rateShock = company.sensitivity.duration > 0.75 ? -4 : company.sensitivity.duration < 0 ? 3 : -1;
  const cycleBoost = company.sensitivity.cyclical > 0.65 ? 3 : 1;
  const policyMove = company.sensitivity.policy > 0.7 ? -2 : 1;
  const next = {
    ...company.scores,
    macroRegime: clamp(company.scores.macroRegime + cycleBoost),
    rateSensitivity: clamp(company.scores.rateSensitivity + rateShock),
    policyImpact: clamp(company.scores.policyImpact + policyMove),
    sectorMomentum: clamp(company.scores.sectorMomentum + ((sector?.relative || 55) > 65 ? 2 : -1)),
    cycleFit: clamp(company.scores.cycleFit + cycleBoost + rateShock / 2),
  };
  const event = {
    ...eventTemplates.macro,
    date: new Date().toISOString().slice(0, 10),
    title: `${company.ticker} ${eventTemplates.macro.title}`,
  };
  mergeScores(company, next, environmentFactorKeys);
  revision.applied.macroRates = true;
  revision.events = [event, ...revision.events];
  render();
}

function applyRevaluation() {
  const company = getCompany();
  const revision = ensureRevision(company.ticker);
  const shouldApplyCompany = !revision.applied.companyGuidance;
  const shouldApplyMacro = !revision.applied.macroRates;

  if (shouldApplyCompany) {
    const scenario = companyEventImpact(company);
    const next = { ...company.scores };
    Object.entries(scenario.impact).forEach(([key, delta]) => {
      next[key] = clamp(company.scores[key] + delta);
    });
    mergeScores(company, next, companyFactorKeys);
    revision.applied.companyGuidance = true;
    revision.events = [
      {
        ...eventTemplates.company,
        summary: scenario.summary,
        date: new Date().toISOString().slice(0, 10),
        title: `${company.ticker} ${eventTemplates.company.title}`,
      },
      ...revision.events,
    ];
  }

  if (shouldApplyMacro) {
    const sector = sectors.find((item) => company.sector.includes(item.name) || item.name.includes(company.sector.split(" ")[0]));
    const rateShock = company.sensitivity.duration > 0.75 ? -4 : company.sensitivity.duration < 0 ? 3 : -1;
    const cycleBoost = company.sensitivity.cyclical > 0.65 ? 3 : 1;
    const policyMove = company.sensitivity.policy > 0.7 ? -2 : 1;
    const next = {
      ...company.scores,
      macroRegime: clamp(company.scores.macroRegime + cycleBoost),
      rateSensitivity: clamp(company.scores.rateSensitivity + rateShock),
      policyImpact: clamp(company.scores.policyImpact + policyMove),
      sectorMomentum: clamp(company.scores.sectorMomentum + ((sector?.relative || 55) > 65 ? 2 : -1)),
      cycleFit: clamp(company.scores.cycleFit + cycleBoost + rateShock / 2),
    };
    mergeScores(company, next, environmentFactorKeys);
    revision.applied.macroRates = true;
    revision.events = [
      {
        ...eventTemplates.macro,
        date: new Date().toISOString().slice(0, 10),
        title: `${company.ticker} ${eventTemplates.macro.title}`,
      },
      ...revision.events,
    ];
  }

  render();
}

function render() {
  const isOverview = currentPage === "overview";
  document.querySelector("#overviewPage").classList.toggle("hidden", !isOverview);
  document.querySelector("#detailPage").classList.toggle("hidden", isOverview);
  renderCompanyList();

  if (isOverview) {
    renderMacro("#overviewMacroGrid");
    renderSectorChart();
    renderMarketIndicators();
    renderMoneyFlow();
    renderMarketNews();
    return;
  }

  const company = getCompany();
  const scores = companyScores(company);
  const composite = calculateComposite(scores);
  const baseComposite = calculateComposite(company.scores);
  const delta = composite - baseComposite;
  const revision = revisions[company.ticker];
  const revaluationButton = document.querySelector("#applyRevaluation");

  document.querySelector("#companyTitle").textContent = `${company.ticker} · ${company.name}`;
  document.querySelector("#companySubtitle").textContent = `${company.sector} · ${company.profile}`;
  document.querySelector("#compositeScore").textContent = composite;
  document.querySelector("#scoreDelta").textContent = `${delta >= 0 ? "+" : ""}${delta}`;
  document.querySelector("#scoreDelta").style.color = delta >= 0 ? "var(--green)" : "var(--red)";
  document.querySelector("#compositeSummary").textContent =
    "뉴스·가이던스, 펀더멘탈, 매크로 레짐, 금리, 정책, 섹터 사이클을 분리 평가한 뒤 가중 합산했습니다.";
  document.querySelector("#compositeMeter").style.width = `${composite}%`;
  document.querySelector("#lastUpdated").textContent = `Updated ${new Date().toISOString().slice(0, 10)}`;
  const revaluationDone = Boolean(revision?.applied?.companyGuidance && revision?.applied?.macroRates);
  revaluationButton.disabled = revaluationDone;
  document.querySelector("#timelinePopover").classList.remove("open");
  document.querySelector("#timelineToggle").setAttribute("aria-expanded", "false");
  revaluationButton.innerHTML = revaluationDone ? `<span aria-hidden="true">✓</span> 재평가 반영됨` : `<span aria-hidden="true">●</span> 재평가 반영`;

  renderFactorSections(company, scores);
  renderTimeline(company);
  renderCompanyMacroImpact(company, scores);
  renderLatestNews(company);
  renderMemo(company, scores, composite);
}

document.querySelector("#companySearch").addEventListener("input", renderCompanyList);
document.querySelector("#sidebarToggle").addEventListener("click", () => {
  const shell = document.querySelector(".app-shell");
  const isClosed = shell.classList.toggle("sidebar-closed");
  document.body.classList.toggle("sidebar-open", !isClosed);
  document.querySelector("#sidebarToggle").setAttribute("aria-label", isClosed ? "종목 사이드바 열기" : "종목 사이드바 닫기");
});
document.querySelector("#brandHome").addEventListener("click", () => {
  currentPage = "overview";
  document.querySelector(".app-shell").classList.add("sidebar-closed");
  document.body.classList.remove("sidebar-open");
  render();
});
document.querySelector("#centerLogo").addEventListener("click", () => {
  currentPage = "overview";
  render();
});
document.querySelector("#timelineToggle").addEventListener("click", (event) => {
  event.stopPropagation();
  const popover = document.querySelector("#timelinePopover");
  const isOpen = popover.classList.toggle("open");
  document.querySelector("#timelineToggle").setAttribute("aria-expanded", String(isOpen));
});
document.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-news-toggle]");
  if (toggle) {
    event.preventDefault();
    event.stopPropagation();
    const key = toggle.dataset.newsToggle;
    expandedNewsLists[key] = !expandedNewsLists[key];
    render();
    return;
  }

  const wrap = document.querySelector(".popover-wrap");
  if (!wrap.contains(event.target)) {
    document.querySelector("#timelinePopover").classList.remove("open");
    document.querySelector("#timelineToggle").setAttribute("aria-expanded", "false");
  }
});
document.querySelector("#applyRevaluation").addEventListener("click", applyRevaluation);

render();
loadUniverse();
