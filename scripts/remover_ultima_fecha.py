import json
import os

def apply_fix():
    path = 'src/data/questions.json'
    with open(path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # Identificar la pregunta a eliminar (contiene "Hégira" y opciones en "d.C." o id exacto)
    # Por la captura de pantalla es "¿En qué año ocurrió la Hégira (migración a Medina)?"
    # y nuestro grep encontró en el ID 4 la Batalla de Badr con opciones 622 d.C., 624 d.C.
    
    # Busquemos todas las preguntas problemáticas que nos quedaron con "d.C." en las opciones
    to_delete_ids = []
    
    for q in questions:
        # Check in options for "d.C."
        has_dc = False
        if 'es' in q.get('options', {}):
            for opt in q['options']['es']:
                if 'd.C.' in opt:
                    has_dc = True
                    break
        if 'es' in q.get('question', {}):
            if 'd.C.' in q['question']['es']:
                 has_dc = True
        
        if has_dc:
            to_delete_ids.append(q['id'])
            
    # Agregamos también la pregunta de la imagen manualmente si existe
    for q in questions:
        if "Hégira" in q.get('question', {}).get('es', '') and "Medina" in q.get('question', {}).get('es', ''):
            if q['id'] not in to_delete_ids:
                to_delete_ids.append(q['id'])
                
    print(f"Preguntas a eliminar por contener 'd.C.' o ser la de la imagen: {to_delete_ids}")

    # Filtrar
    questions = [q for q in questions if q['id'] not in to_delete_ids]

    # Agregar reemplazos de la misma categoría (Historia/Seerah) sin usar fechas
    replacements = [
        {
            "id": 9001,
            "category": "seerah",
            "question": {
                "es": "¿A qué ciudad emigraron los primeros musulmanes antes de la migración definitiva a Medina?",
                "en": "To which city did the first Muslims migrate before the final migration to Medina?",
                "ma": "لأي مدينة هاجرو المسلمين الأوائل قبل الهجرة الأخيرة للمدينة؟"
            },
            "options": {
                "es": ["Abisinia (Etiopía)", "Ta'if", "Jerusalén", "Yemen"],
                "en": ["Abyssinia (Ethiopia)", "Ta'if", "Jerusalem", "Yemen"],
                "ma": ["الحبشة (إثيوبيا)", "الطائف", "القدس", "اليمن"]
            },
            "correct_answer": {
                "es": "Abisinia (Etiopía)",
                "en": "Abyssinia (Ethiopia)",
                "ma": "الحبشة (إثيوبيا)"
            },
            "difficulty": "medium",
            "explanation": {
                "es": "Debido a la persecución en La Meca, un grupo de musulmanes buscó refugio en Abisinia, gobernada por un rey cristiano justo (Najashi).",
                "en": "Due to persecution in Mecca, a group of Muslims sought refuge in Abyssinia, ruled by a just Christian king (Najashi).",
                "ma": "بسبب الاضطهاد فمكة، لجأ مجموعة من المسلمين للحبشة، لي كان حاكمها ملك مسيحي عادل (النجاشي)."
            }
        },
        {
            "id": 9002,
            "category": "seerah",
            "question": {
                "es": "¿En qué mes islámico ocurrió la Batalla de Badr?",
                "en": "In which Islamic month did the Battle of Badr occur?",
                "ma": "فأي شهر إسلامي وقعات غزوة بدر؟"
            },
            "options": {
                "es": ["Ramadán", "Shawwal", "Rabi' al-Awwal", "Muharram"],
                "en": ["Ramadan", "Shawwal", "Rabi' al-Awwal", "Muharram"],
                "ma": ["رمضان", "شوال", "ربيع الأول", "محرم"]
            },
            "correct_answer": {
                "es": "Ramadán",
                "en": "Ramadan",
                "ma": "رمضان"
            },
            "difficulty": "medium",
            "explanation": {
                "es": "La decisiva Batalla de Badr, la primera gran victoria militar del Islam, ocurrió el 17 de Ramadán del segundo año de la Hégira.",
                "en": "The decisive Battle of Badr, the first major military victory of Islam, occurred on the 17th of Ramadan in the second year of the Hijrah.",
                "ma": "غزوة بدر الحاسمة، أول انتصار عسكري كبير فالإسلام، وقعات نهار 17 رمضان فالسنة الثانية للهجرة."
            }
        },
        {
            "id": 9003,
            "category": "seerah",
            "question": {
                "es": "¿Qué Compañero sugirió cavar una trinchera en la Batalla de Al-Khandaq (La Trinchera)?",
                "en": "Which Companion suggested digging a trench in the Battle of Al-Khandaq (The Trench)?",
                "ma": "شكون الصحابي لي اقترح يحفرو خندق فغزوة الخندق؟"
            },
            "options": {
                "es": ["Salman Al-Farsi", "Abu Bakr", "Umar bin Al-Khattab", "Ali bin Abi Talib"],
                "en": ["Salman Al-Farsi", "Abu Bakr", "Umar bin Al-Khattab", "Ali bin Abi Talib"],
                "ma": ["سلمان الفارسي", "أبو بكر", "عمر بن الخطاب", "علي بن أبي طالب"]
            },
            "correct_answer": {
                "es": "Salman Al-Farsi",
                "en": "Salman Al-Farsi",
                "ma": "سلمان الفارسي"
            },
            "difficulty": "medium",
            "explanation": {
                "es": "Salman Al-Farsi (ra) sugirió esta táctica militar persa para defender Medina, lo que frustró a los ejércitos aliados enemigos.",
                "en": "Salman Al-Farsi (ra) suggested this Persian military tactic to defend Medina, which frustrated the allied enemy armies.",
                "ma": "سلمان الفارسي (رضي الله عنه) اقترح هاد التكتيك العسكري الفارسي باش يدافعو على المدينة، وهادشي أحبط جيوش الأعداء المتحالفة."
            }
        }
    ]

    # Añadir reemplazos solo hasta empatar con lo eliminado
    questions.extend(replacements[:len(to_delete_ids)])

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
        
    print(f"Total nuevo de preguntas: {len(questions)}")
    
if __name__ == '__main__':
    apply_fix()
