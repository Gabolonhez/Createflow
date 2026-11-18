export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Chave de API do Gemini não configurada. Obtenha uma chave gratuita válida em https://aistudio.google.com/app/apikey e adicione GEMINI_API_KEY no arquivo .env.local.');
  }

  const models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-3-flash-preview'];
  let lastErrorMessage = '';

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

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
        if (response.status === 429 || msg.includes('Quota exceeded') || msg.includes('limit: 0')) {
          lastErrorMessage = 'Cota do modelo excedida.';
          continue;
        }
        if (response.status === 404 || response.status === 503 || response.status === 500) {
          lastErrorMessage = `Modelo ${model} temporariamente indisponível (${response.status}).`;
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
      if (err.message.includes('não configurada')) {
        throw err;
      }
      lastErrorMessage = err.message;
    }
  }

  throw new Error(lastErrorMessage || 'Não foi possível se comunicar com o Gemini. Verifique sua GEMINI_API_KEY no .env.local.');
}

export async function generateJson<T>(prompt: string, systemInstruction?: string): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Chave de API do Gemini não configurada. Obtenha uma chave gratuita válida em https://aistudio.google.com/app/apikey e adicione GEMINI_API_KEY no arquivo .env.local.');
  }

  const models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-3-flash-preview'];
  let lastErrorMessage = '';

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

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
        if (response.status === 429 || msg.includes('Quota exceeded') || msg.includes('limit: 0')) {
          lastErrorMessage = 'Cota do modelo excedida.';
          continue;
        }
        if (response.status === 404 || response.status === 503 || response.status === 500) {
          lastErrorMessage = `Modelo ${model} temporariamente indisponível (${response.status}).`;
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
        lastErrorMessage = 'A resposta do Gemini não pôde ser analisada como JSON válido.';
        continue;
      }
    } catch (err: any) {
      if (err.message.includes('não configurada')) {
        throw err;
      }
      lastErrorMessage = err.message;
    }
  }

  throw new Error(lastErrorMessage || 'Não foi possível se comunicar com o Gemini. Verifique sua GEMINI_API_KEY no .env.local.');
}

export interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export async function generateMultimodalJson<T>(
  parts: GeminiPart[],
  systemInstruction?: string
): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Chave de API do Gemini não configurada. Configure GEMINI_API_KEY no arquivo .env.local.');
  }

  const models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest'];
  let lastErrorMessage = '';

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

      const formattedParts = parts.map((p) => {
        if (p.inlineData) {
          return {
            inline_data: {
              mime_type: p.inlineData.mimeType,
              data: p.inlineData.data,
            },
          };
        }
        return { text: p.text || '' };
      });

      const body: any = {
        contents: [
          {
            parts: formattedParts,
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      };

      if (systemInstruction) {
        body.systemInstruction = {
          parts: [{ text: systemInstruction }],
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
        if (response.status === 429 || msg.includes('Quota exceeded') || msg.includes('limit: 0')) {
          lastErrorMessage = 'Cota do modelo excedida.';
          continue;
        }
        if (response.status === 404 || response.status === 503 || response.status === 500) {
          lastErrorMessage = `Modelo ${model} temporariamente indisponível (${response.status}).`;
          continue;
        }
        throw new Error(`Erro no Gemini Multimodal (${model}): ${msg}`);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('A API do Gemini retornou uma resposta multimodal vazia.');
      }

      try {
        return JSON.parse(text) as T;
      } catch (e) {
        console.error('Erro ao analisar JSON retornado pelo Gemini:', text);
        lastErrorMessage = 'A resposta do Gemini não pôde ser analisada como JSON válido.';
        continue;
      }
    } catch (err: any) {
      if (err.message.includes('não configurada')) {
        throw err;
      }
      lastErrorMessage = err.message;
    }
  }

  throw new Error(lastErrorMessage || 'Não foi possível processar mídia no Gemini. Verifique a chave de API.');
}
