export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { contents, systemInstruction } = req.body;
        
        // 優先讀取環境變數，若無則直接帶入你的金鑰，確保 100% 成功連線！
        const apiKey = process.env.GEMINI_API_KEY || "AIzaSyDnHB_B3PBdQFmtmW7BWYNZDW-kHYOyN0Y";
        
        if (!apiKey) {
            return res.status(400).json({ error: 'Missing API key' });
        }

        const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
        let lastError = null;

        for (const model of models) {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            
            // 嚴格對齊 Google API 規範：使用 system_instruction (帶底線)
            const payload = {
                contents: contents,
                generationConfig: { temperature: 0.75, maxOutputTokens: 350 }
            };

            if (systemInstruction) {
                // 將前端的指令轉為 Google 規定的底線格式
                payload.system_instruction = systemInstruction;
            }

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
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
