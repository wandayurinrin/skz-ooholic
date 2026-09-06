export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { contents, systemInstruction } = req.body;
        // 自動讀取 Vercel 環境變數中的金鑰
        const apiKey = process.env.GEMINI_API_KEY || process.env.AQ_KEY || "";
        if (!apiKey) {
            return res.status(400).json({ error: 'Missing server API key environment variable' });
        }

        const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
        let lastError = null;

        for (let i = 0; i < models.length; i++) {
            const model = models[i];
            // AQ. 金鑰是標準 API Key，需透過 ?key= 與 x-goog-api-key 傳遞
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const headers = { 
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey 
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    contents: contents,
                    systemInstruction: systemInstruction,
                    generationConfig: { temperature: 0.75, maxOutputTokens: 350 }
                })
            });

            const data = await response.json();
            if (response.ok) {
                return res.status(200).json(data);
            } else {
                lastError = data;
            }
        }

        return res.status(500).json({ error: lastError || 'All models failed' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
