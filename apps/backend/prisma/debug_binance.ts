
import axios from 'axios';

async function testBinance() {
    console.log("Testing Binance P2P API...");
    try {
        const response = await axios.post(
            'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
            {
                "asset": "USDT",
                "fiat": "VES",
                "tradeType": "BUY",
                "page": 1,
                "rows": 10,
                "countries": [],
                "proMerchantAds": false,
                "shieldMerchantAds": false
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            }
        );

        console.log("Status:", response.status);
        const data = response.data;
        if (data && data.data && Array.isArray(data.data)) {
            console.log("Found ads:", data.data.length);
            data.data.forEach((item, index) => {
                console.log(`Adv ${index + 1}: Price=${item.adv.price}, Nickname=${item.advertiser.nickName}, Min=${item.adv.minSingleTransAmount}, Max=${item.adv.maxSingleTransAmount}`);
            });

            let sum = 0;
            let count = 0;
            for (const item of data.data.slice(0, 5)) {
                if (item.adv && item.adv.price) {
                    sum += parseFloat(item.adv.price);
                    count++;
                }
            }
            console.log(`Average of Top 5: ${count > 0 ? sum / count : 0}`);
        } else {
            console.log("Empty or invalid response data:", JSON.stringify(data));
        }
    } catch (e) {
        console.error("Error details:", e.response?.status, e.response?.data || e.message);
    }
}

testBinance();
