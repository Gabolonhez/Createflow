const apiUrlInput = document.getElementById('apiUrl');
const apiTokenInput = document.getElementById('apiToken');
const saveCfgBtn = document.getElementById('saveCfgBtn');
const captureSavedBtn = document.getElementById('captureSavedBtn');
const captureRadarBtn = document.getElementById('captureRadarBtn');
const contextBadge = document.getElementById('contextBadge');
const statusBox = document.getElementById('statusBox');

function showStatus(message, type) {
  statusBox.textContent = message;
  statusBox.className = `status ${type === 'ok' ? 'ok' : type === 'err' ? 'err' : ''}`;
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

function detectContextLabel(url) {
  if (!url) return 'Sem aba ativa';
  if (url.includes('linkedin.com/my-items/saved-posts')) return 'LinkedIn · Salvos';
  if (url.includes('linkedin.com')) return 'LinkedIn Web';
  if (url.includes('instagram.com') && url.includes('/saved')) return 'Instagram · Salvos';
  if (url.includes('instagram.com')) return 'Instagram Web';
  return 'Site não suportado';
}

async function loadSavedConfig() {
  const stored = await chrome.storage.local.get(['createflowApiUrl', 'createflowToken']);
  apiUrlInput.value = stored.createflowApiUrl || 'http://localhost:3002';
  apiTokenInput.value = stored.createflowToken || '';

  const tab = await getActiveTab();
  contextBadge.textContent = detectContextLabel(tab?.url || '');
}

saveCfgBtn.addEventListener('click', async () => {
  const createflowApiUrl = apiUrlInput.value.trim().replace(/\/+$/, '');
  const createflowToken = apiTokenInput.value.trim();

  if (!createflowApiUrl || !createflowToken) {
    showStatus('Preencha a URL do CreateFlow e o Token Pessoal.', 'err');
    return;
  }

  await chrome.storage.local.set({ createflowApiUrl, createflowToken });
  showStatus('Configuração salva na extensão!', 'ok');
});

async function runCapture(mode) {
  const baseUrl = apiUrlInput.value.trim().replace(/\/+$/, '');
  const token = apiTokenInput.value.trim();

  if (!baseUrl || !token) {
    showStatus('Configure a URL e o Token do CreateFlow antes de capturar.', 'err');
    return;
  }

  await chrome.storage.local.set({
    createflowApiUrl: baseUrl,
    createflowToken: token,
  });

  const tab = await getActiveTab();
  if (!tab?.id || !tab.url) {
    showStatus('Não foi possível acessar a aba ativa.', 'err');
    return;
  }

  if (!tab.url.includes('linkedin.com') && !tab.url.includes('instagram.com')) {
    showStatus('Abra seus Salvos ou um Perfil no LinkedIn ou Instagram primeiro.', 'err');
    return;
  }

  captureSavedBtn.disabled = true;
  captureRadarBtn.disabled = true;
  showStatus('Lendo posts visíveis na página e enviando ao CreateFlow...', '');

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    });

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (selectedMode) => window.__createflowExtractPage(selectedMode),
      args: [mode],
    });

    const extracted = results?.[0]?.result;
    if (!extracted || extracted.error) {
      throw new Error(extracted?.error || 'Falha ao extrair posts da página.');
    }

    if (!Array.isArray(extracted.posts) || extracted.posts.length === 0) {
      throw new Error(
        'Nenhum post visível encontrado. Role a página um pouco para carregar os cards e tente novamente.'
      );
    }

    const endpoint = `${baseUrl}/api/radar/ingest`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(extracted),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.error || `Erro HTTP ${res.status} ao enviar para o CreateFlow.`);
    }

    showStatus(
      `Pronto! ${data.importedCount || 0} novos posts capturados e ${data.updatedCount || 0} atualizados.`,
      'ok'
    );
  } catch (err) {
    showStatus(err?.message || 'Erro desconhecido na captura.', 'err');
  } finally {
    captureSavedBtn.disabled = false;
    captureRadarBtn.disabled = false;
  }
}

captureSavedBtn.addEventListener('click', () => runCapture('saved'));
captureRadarBtn.addEventListener('click', () => runCapture('radar'));

loadSavedConfig();
