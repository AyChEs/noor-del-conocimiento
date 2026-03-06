import json
import re

def parse_md_to_json():
    with open('auditoria.md', 'r', encoding='utf-8') as f:
        content = f.read()

    questions = []
    current_category = ""
    
    # Split by lines
    lines = content.split('\n')
    
    q_pattern = re.compile(r'^\*\*(?:\[NUEVA.*\] )?(\d+)\.\s+(.*?)\*\*')
    opt_correct_pattern = re.compile(r'^-\s+✅\s+\*\*(.*?)\*\*')
    opt_wrong_pattern = re.compile(r'^-\s+❌\s+(.*)')
    exp_pattern = re.compile(r'^>\s+💡\s+\*(.*?)\*')

    current_q = None

    for line in lines:
        line = line.strip()
        
        if line.startswith('## Corán y General'):
            current_category = 'quran'
        elif line.startswith('## Profetas'):
            current_category = 'prophets'
        elif line.startswith('## Seerah'):
            current_category = 'seerah'
            
        m_q = q_pattern.match(line)
        if m_q:
            if current_q and 'question' in current_q:
                questions.append(current_q)
                
            q_id = int(m_q.group(1))
            q_text = m_q.group(2)
            
            # Asignar dificultad por el bloque actual (simplificado, 'medium' por defecto)
            current_q = {
                "id": q_id,
                "category": current_category if current_category else "quran",
                "question": {
                    "es": q_text,
                    "en": q_text, # Placeholder
                    "ma": q_text  # Placeholder
                },
                "options": {
                    "es": [],
                    "en": [],
                    "ma": []
                },
                "correct_answer": {
                    "es": "",
                    "en": "",
                    "ma": ""
                },
                "difficulty": "medium",
                "explanation": {
                    "es": "",
                    "en": "",
                    "ma": ""
                }
            }
            continue
            
        if current_q:
            m_corr = opt_correct_pattern.match(line)
            if m_corr:
                opt_text = m_corr.group(1)
                current_q["options"]["es"].append(opt_text)
                current_q["correct_answer"]["es"] = opt_text
                # Placeholders
                current_q["options"]["en"].append(opt_text)
                current_q["correct_answer"]["en"] = opt_text
                current_q["options"]["ma"].append(opt_text)
                current_q["correct_answer"]["ma"] = opt_text
                continue
                
            m_wrong = opt_wrong_pattern.match(line)
            if m_wrong:
                opt_text = m_wrong.group(1)
                current_q["options"]["es"].append(opt_text)
                current_q["options"]["en"].append(opt_text)
                current_q["options"]["ma"].append(opt_text)
                continue
                
            m_exp = exp_pattern.match(line)
            if m_exp:
                exp_text = m_exp.group(1)
                current_q["explanation"]["es"] = exp_text
                current_q["explanation"]["en"] = exp_text
                current_q["explanation"]["ma"] = exp_text
                continue

    if current_q and 'question' in current_q:
        questions.append(current_q)
        
    # Limpiamos duplicados exactos si los hubiera
    seen_ids = set()
    final_questions = []
    for q in questions:
        if q['id'] not in seen_ids:
            seen_ids.add(q['id'])
            # Mezclar opciones no es estrictamente necesario aquí, 
            # el front end lo hace soltando las correctas
            final_questions.append(q)

    with open('src/data/questions.json', 'w', encoding='utf-8') as f:
        json.dump(final_questions, f, indent=2, ensure_ascii=False)
        
    print(f"✅ Se han procesado y guardado {len(final_questions)} preguntas auditadas en questions.json")

if __name__ == '__main__':
    parse_md_to_json()
