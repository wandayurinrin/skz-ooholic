export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { contents, systemInstruction } = req.body;
        const apiKey = process.env.GEMINI_API_KEY || process.env.AQ_KEY || "";
        
        if (!apiKey) {
            return res.status(400).json({ error: 'Missing API key in environment variables' });
        }

        // 使用最穩定、全面支援標準 AIza 金鑰的 gemini-1.5-flash
        const model = "gemini-1.5-flash";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                systemInstruction: systemInstruction,
                generationConfig: { temperature: 0.75, maxOutputTokens: 350 }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: data.error?.message || 'Google API Error' 
            });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
