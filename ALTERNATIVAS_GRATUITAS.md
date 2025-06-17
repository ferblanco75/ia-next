# Alternativas Gratuitas a OpenAI

## 🎯 Opción Recomendada: Ollama (Local)

### Instalación de Ollama

1. **Instalar Ollama:**
   ```bash
   # En Linux/macOS
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # En Windows
   # Descargar desde https://ollama.ai/download
   ```

2. **Descargar un modelo:**
   ```bash
   # Modelo recomendado (equilibrio entre velocidad y calidad)
   ollama pull llama3.2
   
   # Alternativas:
   ollama pull mistral    # Más rápido, buena calidad
   ollama pull codellama  # Especializado en código
   ollama pull phi3       # Muy rápido, buena para tareas simples
   ```

3. **Iniciar Ollama:**
   ```bash
   ollama serve
   ```

4. **Instalar la dependencia en tu proyecto:**
   ```bash
   npm install ollama
   ```

### Ventajas de Ollama:
- ✅ **Completamente gratuito**
- ✅ **Funciona offline**
- ✅ **Sin límites de uso**
- ✅ **Privacidad total** (datos no salen de tu máquina)
- ✅ **Múltiples modelos disponibles**

---

## 🌐 Otras Alternativas Gratuitas

### 1. **Hugging Face Inference API**
```bash
npm install @huggingface/inference
```

**Configuración:**
```javascript
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function chatWithHuggingFace(prompt) {
  const response = await hf.textGeneration({
    model: 'microsoft/DialoGPT-medium',
    inputs: prompt,
    parameters: {
      max_new_tokens: 300,
      temperature: 0.7
    }
  });
  return response.generated_text;
}
```

**Ventajas:**
- ✅ Gratuito hasta 30,000 requests/mes
- ✅ Muchos modelos disponibles
- ✅ API simple

---

### 2. **Ollama WebUI (Interfaz Web)**
```bash
# Instalar Ollama WebUI
git clone https://github.com/ollama-webui/ollama-webui.git
cd ollama-webui
npm install
npm run dev
```

**Ventajas:**
- ✅ Interfaz web para Ollama
- ✅ Chat visual
- ✅ Gestión de modelos
- ✅ Completamente gratuito

---

### 3. **LM Studio (Interfaz Gráfica)**
- Descargar desde: https://lmstudio.ai/
- Interfaz gráfica para modelos locales
- Soporte para múltiples formatos de modelo

---

### 4. **API de Google Gemini (Gratuito)**
```bash
npm install @google/generative-ai
```

**Configuración:**
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function chatWithGemini(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

**Ventajas:**
- ✅ 60 requests/minuto gratis
- ✅ Buena calidad
- ✅ API estable

---

### 5. **Claude API (Anthropic)**
```bash
npm install @anthropic-ai/sdk
```

**Configuración:**
```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function chatWithClaude(prompt) {
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });
  return message.content[0].text;
}
```

**Ventajas:**
- ✅ 5 requests/minuto gratis
- ✅ Excelente calidad
- ✅ API robusta

---

## 🔧 Configuración en tu Aplicación

### Variables de Entorno (.env)
```env
# Ollama (recomendado - gratuito)
OLLAMA_BASE_URL=http://localhost:11434

# Alternativas (opcionales)
HUGGINGFACE_API_KEY=tu_api_key_aqui
GOOGLE_API_KEY=tu_api_key_aqui
ANTHROPIC_API_KEY=tu_api_key_aqui

# OpenAI (respaldo)
OPENAI_API_KEY=tu_api_key_aqui
```

### Instalación de Dependencias
```bash
# Para Ollama (recomendado)
npm install ollama

# Para otras alternativas
npm install @huggingface/inference
npm install @google/generative-ai
npm install @anthropic-ai/sdk
```

---

## 📊 Comparación de Alternativas

| Servicio | Costo | Calidad | Velocidad | Privacidad | Facilidad |
|----------|-------|---------|-----------|------------|-----------|
| **Ollama** | Gratuito | Buena | Rápida | Total | Media |
| Hugging Face | Gratuito* | Variable | Media | Parcial | Fácil |
| Google Gemini | Gratuito* | Excelente | Rápida | Parcial | Fácil |
| Claude | Gratuito* | Excelente | Rápida | Parcial | Fácil |
| OpenAI | Pago | Excelente | Rápida | Parcial | Fácil |

*Con límites mensuales

---

## 🚀 Recomendación Final

**Para tu caso, recomiendo Ollama** porque:

1. **Es completamente gratuito** - sin límites ni costos ocultos
2. **Funciona offline** - no necesitas internet
3. **Privacidad total** - tus datos nunca salen de tu máquina
4. **Fácil de configurar** - ya está integrado en tu código
5. **Escalable** - puedes cambiar modelos según tus necesidades

### Próximos Pasos:
1. Instala Ollama: `curl -fsSL https://ollama.ai/install.sh | sh`
2. Descarga un modelo: `ollama pull llama3.2`
3. Inicia Ollama: `ollama serve`
4. Ejecuta tu aplicación: `npm run dev:full`

¡Y listo! Tu aplicación funcionará completamente gratis con IA local. 