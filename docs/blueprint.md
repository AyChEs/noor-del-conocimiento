# **App Name**: Noor Al-Ilm Trivia

## Core Features:

- Optimized Question Retrieval (Batching): Retrieve a batch of 10-15 questions from Firestore at the start of the round.
- Real-time Timer: Implement a countdown timer per question with difficulty-based logic.
- Score Engine: Calculate score based on difficulty, multipliers and time bonuses.
- Lifeline Management: Implement 50/50, Extra Time, and Skip lifelines.
- Adaptive Difficulty (Mix Mode): Progressively increase difficulty in Mix Mode.
- AI-Powered Educational Feedback: When a user answers incorrectly, trigger an AI tool call to generate a 1-sentence supportive explanation
- Progression Ranking System: Assign titles at the Game Over screen based on deterministic logic.
- Data Seeding: Admin script to populate Firestore with initial JSON data.

## Style Guidelines:

- Primary: #D4A275 (Desaturated Gold)
- Background: #F5F5DC (Beige/Cream)
- Accent: #A3B86C (Olive Green)
- Error/Fail: #D65A5A (Soft Red)
- Primary (Latin): 'Alegreya', serif
- Secondary (Arabic): 'Amiri', serif (for Quranic verses)
- Use Lucide-React Heart, BookOpen, MoonStar, Layers icons
- Responsive grid of answer options (2 columns Desktop/Tablet, 1 column Mobile)
- Subtle fade-in/out transitions and green pulse/gentle shake for feedback