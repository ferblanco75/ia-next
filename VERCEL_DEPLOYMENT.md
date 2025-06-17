# 🚀 Despliegue en Vercel con IA Gratuita

## ❌ Por qué Ollama NO funciona en Vercel

Vercel es una plataforma **serverless** que:
- No permite procesos persistentes
- No tiene acceso al sistema de archivos para modelos
- Tiene límites de tiempo de ejecución (10 segundos)
- No puede ejecutar servicios como Ollama

## ✅ Alternativas Gratuitas para Vercel

### 1. **Google Gemini API (Recomendado)**

#### Obtener API Key:
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una cuenta gratuita
3. Genera una API key
4. **Límite gratuito:** 60 requests/minuto

#### Configurar en Vercel:
```bash
# En el dashboard de Vercel, añade esta variable de entorno:
GOOGLE_API_KEY=tu_api_key_de_google_aqui
```

### 2. **Hugging Face Inference API**

#### Obtener API Key:
1. Ve a [Hugging Face](https://huggingface.co/settings/tokens)
2. Crea una cuenta gratuita
3. Genera un token de acceso
4. **Límite gratuito:** 30,000 requests/mes

#### Configurar en Vercel:
```bash
# En el dashboard de Vercel, añade esta variable de entorno:
HUGGINGFACE_API_KEY=tu_token_de_hugging_face_aqui
```

### 3. **Claude API (Anthropic)**

#### Obtener API Key:
1. Ve a [Anthropic Console](https://console.anthropic.com/)
2. Crea una cuenta gratuita
3. Genera una API key
4. **Límite gratuito:** 5 requests/minuto

#### Configurar en Vercel:
```bash
# En el dashboard de Vercel, añade esta variable de entorno:
ANTHROPIC_API_KEY=tu_api_key_de_anthropic_aqui
```

## 🔧 Configuración Completa

### Variables de Entorno en Vercel

En el dashboard de Vercel, ve a tu proyecto → Settings → Environment Variables y añade:

```env
# Base de datos (ya configurado)
POSTGRES_URL=tu_url_de_postgres
POSTGRES_HOST=tu_host
POSTGRES_DATABASE=tu_database
POSTGRES_USERNAME=tu_username
POSTGRES_PASSWORD=tu_password

# JWT (ya configurado)
JWT_SECRET=tu_secreto_jwt

# IA Gratuita (NUEVO)
GOOGLE_API_KEY=tu_api_key_de_google
HUGGINGFACE_API_KEY=tu_token_de_hugging_face
ANTHROPIC_API_KEY=tu_api_key_de_anthropic

# OpenAI (respaldo opcional)
OPENAI_API_KEY=tu_api_key_de_openai
```

### Orden de Prioridad

La aplicación intentará usar los servicios en este orden:

1. **Google Gemini** (60 req/min gratis)
2. **Hugging Face** (30,000 req/mes gratis)
3. **Claude** (5 req/min gratis)
4. **OpenAI** (pago, como respaldo)

## 📦 Instalación de Dependencias

Las dependencias ya están configuradas en `package.json`:

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "@huggingface/inference": "^2.6.4",
    "openai": "^5.3.0"
  }
}
```

## 🚀 Despliegue

1. **Conectar con GitHub:**
   ```bash
   git add .
   git commit -m "Configurar IA gratuita para Vercel"
   git push origin main
   ```

2. **En Vercel Dashboard:**
   - Ve a tu proyecto
   - Settings → Environment Variables
   - Añade las variables de entorno
   - Redeploy

3. **Verificar:**
   - La aplicación debería funcionar con IA gratuita
   - Revisa los logs en Vercel para confirmar

## 💡 Recomendación

**Para Vercel, usa Google Gemini** porque:
- ✅ 60 requests/minuto es suficiente para la mayoría de casos
- ✅ Excelente calidad de respuesta
- ✅ API estable y confiable
- ✅ Fácil de configurar
- ✅ Gratuito para uso personal

## 🔍 Troubleshooting

### Error: "No se pudo conectar con ningún servicio"
- Verifica que al menos una API key esté configurada
- Revisa los logs en Vercel
- Asegúrate de que las variables de entorno estén en el entorno correcto (Production/Preview/Development)

### Error: "Rate limit exceeded"
- Google Gemini: espera 1 minuto
- Hugging Face: espera hasta el siguiente mes
- Claude: espera 12 segundos

### Error: "Invalid API key"
- Verifica que la API key esté correctamente copiada
- Asegúrate de que la cuenta esté activa
- Revisa que no haya espacios extra

## 📊 Comparación de Límites Gratuitos

| Servicio | Límite Gratuito | Calidad | Velocidad |
|----------|----------------|---------|-----------|
| **Google Gemini** | 60 req/min | Excelente | Rápida |
| Hugging Face | 30,000 req/mes | Variable | Media |
| Claude | 5 req/min | Excelente | Rápida |
| OpenAI | Pago | Excelente | Rápida |

---

## 🎯 Resultado Final

Con esta configuración, tu aplicación en Vercel:
- ✅ Funciona completamente gratis
- ✅ Tiene múltiples respaldos
- ✅ Es escalable
- ✅ Mantiene la misma funcionalidad
- ✅ No requiere servidor local

¡Tu aplicación de IA estará funcionando gratis en Vercel! 🚀 