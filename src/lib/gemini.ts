export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('AQ.')) {
    throw new Error('Chave de API do Gemini inválida ou não configurada. Obtenha uma chave gratuita válida em https://aistudio.google.com/app/apikey e adicione GEMINI_API_KEY nas variáveis da Vercel / .env.local.');
  }

  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite'];
  let lastErrorMessage = '';

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const body: any = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      };

      if (systemInstruction) {
        body.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = data.error?.message || `Status HTTP ${response.status}`;
        if (data.error?.code === 429 || msg.includes('Quota exceeded') || msg.includes('limit: 0')) {
          throw new Error('A cota da sua chave do Gemini foi excedida (limit: 0). Por favor, gere uma nova chave de API no Google AI Studio: https://aistudio.google.com/app/apikey');
        }
        if (response.status === 404) {
          lastErrorMessage = `Modelo ${model} indisponível.`;
          continue;
        }
        throw new Error(`Erro no Gemini (${model}): ${msg}`);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('A API do Gemini retornou uma resposta vazia.');
      }

      return text;
    } catch (err: any) {
      if (err.message.includes('cota') || err.message.includes('inválida') || err.message.includes('configurada')) {
        throw err;
      }
      lastErrorMessage = err.message;
    }
  }

  throw new Error(lastErrorMessage || 'Não foi possível se comunicar com o Gemini. Verifique sua GEMINI_API_KEY.');
}

export async function generateJson<T>(prompt: string, systemInstruction?: string): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('AQ.')) {
    throw new Error('Chave de API do Gemini inválida ou não configurada. Obtenha uma chave gratuita válida em https://aistudio.google.com/app/apikey e adicione GEMINI_API_KEY nas variáveis da Vercel / .env.local.');
  }

  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite'];
  let lastErrorMessage = '';

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const body: any = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        }
      };

      if (systemInstruction) {
        body.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = data.error?.message || `Status HTTP ${response.status}`;
        if (data.error?.code === 429 || msg.includes('Quota exceeded') || msg.includes('limit: 0')) {
          throw new Error('A cota da sua chave do Gemini foi excedida (limit: 0). Por favor, gere uma nova chave de API no Google AI Studio: https://aistudio.google.com/app/apikey');
        }
        if (response.status === 404) {
          lastErrorMessage = `Modelo ${model} indisponível.`;
          continue;
        }
        throw new Error(`Erro no Gemini (${model}): ${msg}`);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('A API do Gemini retornou uma resposta vazia.');
      }

      try {
        return JSON.parse(text) as T;
      } catch (e) {
        console.error('Erro ao analisar JSON retornado pelo Gemini:', text);
        throw new Error('A resposta do Gemini não pôde ser analisada como JSON válido.');
      }
    } catch (err: any) {
      if (err.message.includes('cota') || err.message.includes('inválida') || err.message.includes('configurada')) {
        throw err;
      }
      lastErrorMessage = err.message;
    }
  }

  throw new Error(lastErrorMessage || 'Não foi possível se comunicar com o Gemini. Verifique sua GEMINI_API_KEY.');
}

