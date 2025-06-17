# 🔑 Configuración de API Keys Gratuitas

## ❌ Problema Actual
Tu aplicación sigue usando OpenAI porque no tienes configuradas las API keys gratuitas.

## ✅ Solución: Configurar API Keys Gratuitas

### 1. **Google Gemini API (Recomendado)**

#### Obtener API Key:
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la API key generada

#### Configurar localmente:
```bash
# Crear archivo .env.local en la raíz del proyecto
echo "GOOGLE_API_KEY=tu_api_key_de_google_aqui" > .env.local
```

### 2. **Hugging Face API (Alternativa)**

#### Obtener Token:
1. Ve a [Hugging Face](https://huggingface.co/settings/tokens)
2. Crea una cuenta gratuita
3. Ve a "Access Tokens"
4. Crea un nuevo token
5. Copia el token

#### Configurar localmente:
```bash
# Añadir al archivo .env.local
echo "HUGGINGFACE_API_KEY=tu_token_de_hugging_face_aqui" >> .env.local
```

### 3. **Claude API (Opcional)**

#### Obtener API Key:
1. Ve a [Anthropic Console](https://console.anthropic.com/)
2. Crea una cuenta gratuita
3. Ve a "API Keys"
4. Crea una nueva API key
5. Copia la key

#### Configurar localmente:
```bash
# Añadir al archivo .env.local
echo "ANTHROPIC_API_KEY=tu_api_key_de_anthropic_aqui" >> .env.local
```

## 🔧 Configuración Completa

### Archivo .env.local
Crea un archivo `.env.local` en la raíz de tu proyecto con este contenido:

```env
# Base de datos (mantener las que ya tienes)
POSTGRES_URL=tu_url_de_postgres
POSTGRES_HOST=tu_host
POSTGRES_DATABASE=tu_database
POSTGRES_USERNAME=tu_username
POSTGRES_PASSWORD=tu_password

# JWT (mantener el que ya tienes)
JWT_SECRET=tu_secreto_jwt

# IA Gratuita (CONFIGURAR ESTAS)
GOOGLE_API_KEY=tu_api_key_de_google_aqui
HUGGINGFACE_API_KEY=tu_token_de_hugging_face_aqui
ANTHROPIC_API_KEY=tu_api_key_de_anthropic_aqui

# OpenAI (opcional, mantener como respaldo)
OPENAI_API_KEY=tu_api_key_de_openai_aqui
```

## 🚀 Pasos para Configurar

### Paso 1: Obtener Google Gemini API Key
1. Abre [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión
3. Haz clic en "Create API Key"
4. Copia la key

### Paso 2: Crear archivo .env.local
```bash
# En la raíz de tu proyecto
touch .env.local
```

### Paso 3: Añadir la API key
```bash
# Añadir solo la línea de Google Gemini
echo "GOOGLE_API_KEY=tu_api_key_real_aqui" >> .env.local
```

### Paso 4: Reiniciar la aplicación
```bash
# Detener la aplicación si está corriendo (Ctrl+C)
# Luego reiniciar
npm run dev:full
```

## 🔍 Verificar que Funciona

### Test 1: Verificar variables de entorno
```bash
# Debería mostrar tu API key
echo $GOOGLE_API_KEY
```

### Test 2: Hacer una pregunta en la aplicación
- Abre tu aplicación en el navegador
- Haz una pregunta
- Debería responder usando Gemini en lugar de OpenAI

### Test 3: Verificar logs
En la consola deberías ver:
```
✅ Usando Google Gemini para responder
```

## 🎯 Resultado Esperado

Después de configurar la API key de Google Gemini:
- ✅ La aplicación usará Gemini en lugar de OpenAI
- ✅ Será completamente gratuito (60 requests/minuto)
- ✅ No necesitarás tarjeta de crédito
- ✅ Funcionará tanto local como en Vercel

## 🔧 Para Vercel

Si quieres desplegar en Vercel:
1. Ve al dashboard de Vercel
2. Settings → Environment Variables
3. Añade: `GOOGLE_API_KEY=tu_api_key_aqui`
4. Redeploy

## ❓ Troubleshooting

### Error: "No se pudo conectar con ningún servicio"
- Verifica que el archivo `.env.local` existe
- Verifica que la API key esté correctamente copiada
- Reinicia la aplicación después de añadir la variable

### Error: "Invalid API key"
- Verifica que la API key no tenga espacios extra
- Asegúrate de que la cuenta esté activa
- Prueba generar una nueva API key

### La aplicación sigue usando OpenAI
- Verifica que el archivo `.env.local` esté en la raíz del proyecto
- Reinicia completamente la aplicación
- Verifica que no haya un archivo `.env` que esté sobrescribiendo

---

## 🎉 ¡Listo!

Una vez configurada la API key de Google Gemini, tu aplicación funcionará completamente gratis sin OpenAI. 