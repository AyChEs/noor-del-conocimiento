<div align="center">

<img src="https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
<img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind"/>
<img src="https://img.shields.io/badge/Google_Genkit-1.20-orange?style=for-the-badge&logo=google" alt="Genkit"/>
<img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel" alt="Vercel"/>

# 🌙 نور المعرفة — Noor del Conocimiento

**Un juego de trivia islámico multijugador con feedback de Inteligencia Artificial**

[🎮 Jugar ahora](https://noor-del-conocimiento.vercel.app) · [🐛 Reportar un error](https://github.com/AyChEs/noor-del-conocimiento/issues) · [💡 Sugerir mejora](https://github.com/AyChEs/noor-del-conocimiento/issues)

</div>

---

## ✨ ¿Qué es Noor del Conocimiento?

**Noor del Conocimiento** (*Luz del Conocimiento* / *نور المعرفة*) es una aplicación web de trivia sobre conocimiento islámico diseñada para aprender de forma entretenida, tanto en solitario como en grupo.

Cada respuesta incorrecta genera una **explicación personalizada por IA** para que el jugador aprenda del error en el momento.

---

## 🎮 Modos de Juego

### 🧳 Modo Musafir (Solo)
Responde 15 preguntas contra el reloj. Tienes **3 vidas** — si las pierdes todas, el juego termina. Tu puntuación final es sobre **100 puntos**, calculada en base a tus aciertos y la velocidad de respuesta.

### 🪑 Modo Majlis (Grupo)
De **2 a 6 jugadores** compiten por turnos en el mismo dispositivo. Cada jugador tiene sus propias vidas y comodines. El último en pie, o quien más puntos acumule en 15 rondas, gana.

---

## 🃏 Comodines

| Comodín | Nombre | Descripción |
|---------|--------|-------------|
| **50/50** | El Discernimiento | Elimina 2 respuestas incorrectas. 2 usos por partida. |
| **+15s** | Sabr (Paciencia) | Añade 15 segundos al temporizador. 2 usos por partida. |
| **Skip** | Hégira | Salta la pregunta sin perder vida. 1 uso (solo en Medio y Difícil). |

---

## 📚 Categorías y Dificultades

**Categorías:**
- 🕌 **Seerah** — Vida, batallas y enseñanzas del Profeta Muhammad ﷺ
- 📖 **Profetas** — Historias de los profetas desde Adán (AS) hasta Isa (AS)
- 🌍 **Corán y General** — Revelación, Fiqh básico, historia islámica y pilares de la fe
- 🎲 **Mixto** — Preguntas aleatorias de todas las categorías

**Dificultades:**

| Nivel | Tiempo | Descripción |
|-------|--------|-------------|
| 🟢 Fácil | 30s | Hechos básicos y nombres conocidos |
| 🟡 Medio | 20s | Fechas, detalles de batallas |
| 🔴 Difícil | 15s | Tafsir, cronología exacta, jurisprudencia |

---

## 🌍 Idiomas

La aplicación está disponible en **3 idiomas**:

- 🇪🇸 **Español**
- 🇬🇧 **English**
- 🇲🇦 **العربية (الدارجة)** — Árabe marroquí (Darija)

---

## 🤖 Feedback con Inteligencia Artificial

Cuando un jugador responde incorrectamente, **Google Gemini** genera una explicación contextual en el idioma del jugador, convirtiendo cada error en una oportunidad de aprendizaje.

---

## 🏆 Sistema de Puntuación

La puntuación final es siempre **sobre 100**, calculada como porcentaje ponderado:

- Las preguntas **difíciles** valen el doble que las fáciles
- Responder **rápido** otorga hasta un 30% de bonus por pregunta
- El rango final refleja el nivel de conocimiento alcanzado

| Puntuación | Rango |
|-----------|-------|
| 0 – 39 | 🌱 Novato de la Luz |
| 40 – 59 | 📜 Buscador de las Escrituras |
| 60 – 79 | 🎓 Erudito de la Sunnah |
| 80 – 100 | ⭐ Sabio de los Sahaba |

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|-----------|-----|
| **Next.js 15** | Framework React con App Router |
| **TypeScript 5** | Tipado estático |
| **Tailwind CSS 3** | Estilos y diseño responsivo |
| **shadcn/ui** | Componentes de interfaz |
| **Google Genkit** | Integración con IA (Gemini) |
| **Vercel** | Despliegue y hosting |

---

## 🚀 Instalación Local

### Requisitos
- Node.js 18+
- Una API key de [Google AI Studio](https://aistudio.google.com)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/AyChEs/noor-del-conocimiento.git
cd noor-del-conocimiento

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local y añade tu GOOGLE_GENAI_API_KEY

# 4. Iniciar en modo desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Variables de entorno

```env
GOOGLE_GENAI_API_KEY=tu_api_key_de_google_ai_studio
```

---

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Páginas (Next.js App Router)
│   ├── page.tsx            # Pantalla de inicio y configuración
│   ├── play/               # Pantalla de juego principal
│   ├── game-over/          # Resultados modo Musafir
│   ├── majlis-setup/       # Configuración modo Majlis
│   └── majlis-game-over/   # Resultados modo Majlis
├── ai/
│   └── flows/              # Flujos de IA (Genkit)
│       └── incorrect-answer-feedback.ts
├── components/ui/          # Componentes de interfaz (shadcn/ui)
├── context/
│   └── LanguageProvider.tsx # Contexto de internacionalización
├── data/
│   └── questions.json      # Base de datos de preguntas (2500+ líneas)
├── lib/
│   ├── gameLogic.ts        # Lógica del juego, puntuación y shuffle
│   ├── types.ts            # Tipos TypeScript
│   └── utils.ts            # Utilidades
└── locales/                # Traducciones
    ├── es.json             # Español
    ├── en.json             # English
    └── ma.json             # Darija (العربية المغربية)
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Si encuentras un error o tienes una sugerencia:

1. Abre un [Issue](https://github.com/AyChEs/noor-del-conocimiento/issues)
2. O haz un Fork → rama → Pull Request

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia **MIT**.

---

<div align="center">

Hecho con 🤍 para la comunidad musulmana hispanohablante

*بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ*

</div>
