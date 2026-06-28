const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// 정적 파일 호스팅 (index.html, dashboard.html 등)
app.use(express.static(path.join(__dirname, './')));

let cachedTossToken = null;
let tossTokenExpiresAt = 0;

// 토스증권 OAuth 토큰 획득 (Basic Auth 방식)
async function getTossAccessToken() {
    const clientId = process.env.TOSS_CLIENT_ID;
    const clientSecret = process.env.TOSS_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        console.log('[Toss API] TOSS_CLIENT_ID or TOSS_CLIENT_SECRET is missing. Bypassing Toss API.');
        return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (cachedTossToken && tossTokenExpiresAt > now + 60) {
        return cachedTossToken;
    }

    try {
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const response = await axios.post('https://openapi.tossinvest.com/oauth2/token', 
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        if (response.data && response.data.access_token) {
            cachedTossToken = response.data.access_token;
            tossTokenExpiresAt = now + (response.data.expires_in || 86400);
            console.log('[Toss API] OAuth2 token issued successfully.');
            return cachedTossToken;
        }
    } catch (e) {
        console.error('[Toss API] Token request failed:', e.response ? e.response.status : e.message);
    }
    return null;
}

// 네이버 금융 단건 스크래퍼 (CORS 우회 우려 없음)
async function fetchNaverPrice(symbol) {
    try {
        const naverUrl = `https://finance.naver.com/item/main.naver?code=${symbol}`;
        const response = await axios.get(naverUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 5000
        });

        const $ = cheerio.load(response.data);
        const priceText = $('.no_today .blind').first().text().trim().replace(/,/g, '');
        const newPrice = parseInt(priceText);
        if (!isNaN(newPrice) && newPrice > 0) {
            return newPrice;
        }
    } catch (e) {
        console.error(`[Naver Scraper] Failed for ${symbol}:`, e.message);
    }
    return null;
}

// 다건 통합 시세 조회 엔드포인트
app.get('/api/prices', async (req, res) => {
    const symbolsQuery = req.query.symbols;
    if (!symbolsQuery) {
        return res.status(400).json({ error: 'symbols parameter is required' });
    }

    const symbols = symbolsQuery.split(',').map(s => s.trim()).filter(s => s);
    if (symbols.length === 0) {
        return res.status(400).json({ error: 'symbols list is empty' });
    }

    const results = {};
    const failList = [];

    // 1단계: 토스증권 API 시도
    let tossSuccess = false;
    const token = await getTossAccessToken();
    if (token) {
        try {
            console.log(`[Toss API] Fetching bulk prices for symbols: ${symbols.join(', ')}`);
            const response = await axios.get(`https://openapi.tossinvest.com/api/v1/prices?symbols=${symbols.join(',')}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 5000
            });

            if (response.data && Array.isArray(response.data.result)) {
                response.data.result.forEach(item => {
                    if (item.symbol && item.lastPrice) {
                        const price = parseInt(item.lastPrice);
                        if (!isNaN(price) && price > 0) {
                            results[item.symbol] = price;
                        }
                    }
                });
                tossSuccess = true;
                console.log('[Toss API] Bulk price fetch completed.');
            }
        } catch (e) {
            console.error('[Toss API] Bulk request failed, falling back to Naver:', e.message);
        }
    }

    // 2단계: 미해결 종목 또는 토스 실패 시 네이버 스크래퍼 Fallback
    const fallbackSymbols = symbols.filter(s => results[s] === undefined);
    if (fallbackSymbols.length > 0) {
        console.log(`[Fallback] Fetching ${fallbackSymbols.length} symbols from Naver...`);
        const promises = fallbackSymbols.map(async (symbol) => {
            const price = await fetchNaverPrice(symbol);
            if (price !== null) {
                results[symbol] = price;
            } else {
                failList.push(symbol);
            }
        });
        await Promise.allSettled(promises);
    }

    res.json({
        success: true,
        results: results, // { "005930": 72000, "AAPL": 185 }
        failed: failList,
        source: tossSuccess ? 'toss' : 'naver'
    });
});

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`📈 Stock Dashboard Server is running on port ${PORT}`);
    console.log(`📂 Web URL: http://localhost:${PORT}`);
    console.log(`==================================================`);
});
