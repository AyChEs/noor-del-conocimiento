#!/usr/bin/env python3
"""Genera PREGUNTAS.md con todas las preguntas del banco del juego."""
import json
from collections import defaultdict

with open('src/data/questions.json', encoding='utf-8') as f:
    questions = json.load(f)

# Agrupar por categoría y dificultad
groups = defaultdict(list)
for q in questions:
    cat = q.get('category', 'Sin categoría')
    diff = q.get('difficulty', 'medium')
    groups[(cat, diff)].append(q)

# Categorías únicas ordenadas
cats = sorted(set(k[0] for k in groups))
DIFF_ORDER = ['easy', 'medium', 'hard']
DIFF_ES = {'easy': '🟢 Fácil', 'medium': '🟡 Media', 'hard': '🔴 Difícil'}

lines = [
    '# 📚 Banco de Preguntas — Noor Al-Ilm Trivia\n',
    f'**Total de preguntas: {len(questions)}**\n',
    '> Este documento contiene todas las preguntas del juego con sus respuestas correctas marcadas con ✅\n',
    '---\n',
]

# Tabla de contenidos
lines.append('## Índice de Categorías\n')
for cat in cats:
    total = sum(len(groups.get((cat, d), [])) for d in DIFF_ORDER)
    anchor = cat.lower().replace(' ', '-').replace('ó', 'o').replace('á', 'a').replace('é', 'e').replace('ú', 'u').replace('í', 'i').replace('ñ', 'n').replace('(', '').replace(')', '').replace('/', '')
    lines.append(f'- [{cat}](#{anchor}) — {total} preguntas')
lines.append('\n---\n')

n_global = 0
for cat in cats:
    total = sum(len(groups.get((cat, d), [])) for d in DIFF_ORDER)
    if total == 0:
        continue

    lines.append(f'## {cat}\n')

    for diff in DIFF_ORDER:
        qs = groups.get((cat, diff), [])
        if not qs:
            continue

        lines.append(f'### {DIFF_ES[diff]} ({len(qs)} preguntas)\n')

        for i, q in enumerate(qs, 1):
            n_global += 1
            q_text = q.get('question', {}).get('es', '')
            a_text = q.get('correctAnswer', {}).get('es', '')
            opts = q.get('options', {}).get('es', [])
            expl = q.get('explanation', {}).get('es', '')

            lines.append(f'**{n_global}. {q_text}**\n')
            for opt in opts:
                if opt == a_text:
                    lines.append(f'- ✅ **{opt}**')
                else:
                    lines.append(f'- ❌ {opt}')
            if expl:
                lines.append(f'\n> 💡 *{expl}*')
            lines.append('')

    lines.append('---\n')

content = '\n'.join(lines)
with open('PREGUNTAS.md', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'✅ Documento generado: PREGUNTAS.md')
print(f'📊 Total: {len(questions)} preguntas')
print(f'📁 Tamaño: {len(content) / 1024:.1f} KB')
for cat in cats:
    total = sum(len(groups.get((cat, d), [])) for d in DIFF_ORDER)
    if total > 0:
        dist = ' | '.join(f'{d}:{len(groups.get((cat,d),[]))}' for d in DIFF_ORDER if groups.get((cat,d)))
        print(f'  {cat}: {total} ({dist})')
