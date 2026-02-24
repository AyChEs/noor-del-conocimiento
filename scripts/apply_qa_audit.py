import json

def apply_audit():
    with open('src/data/questions.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        questions = data['questions']

    # 1. IDs to remove
    ids_to_remove = {
        380, 387, 445, 455, 487, 553, 554, 555, 556, 564, 567, 569, 574, # Fechas exactas
        198, # Tarawih
        369, # Madre Ibrahim
        475, # Nacimiento Profeta 12 rabi
        359, # Años enfermedad Ayyub
        350, # Idris elevado vivo
        353, # Suegro Musa shuaib
        572, # Duplicado esposas 13
        172, # Duplicado libros
        43, 84, # Duplicados de 6
        51, 81, # Duplicados de 1
        52, 82, # Duplicados de 18
        42, 83  # Duplicados de 2
    }

    filtered_qs = [q for q in questions if q['id'] not in ids_to_remove]

    # 2. Modify specific questions
    for q in filtered_qs:
        qid = q['id']
        if qid == 110:
            q['question']['es'] = "¿Cuál de estas acciones es parte obligatoria del Wudu según el Corán (5:6)?"
            q['options']['es'] = ["Lavar la cara", "Lavar el cuello", "Lavar las rodillas", "Lavar la nuca"]
            q['correctAnswer']['es'] = "Lavar la cara"
            q['explanation']['es'] = "El Corán (5:6) menciona cuatro pasos obligatorios: lavar la cara, las manos hasta los codos, pasar la mano mojada por la cabeza y lavar los pies hasta los tobillos."
        elif qid == 547:
            q['question']['es'] = "¿Cuántas esposas (Madres de los Creyentes) sobrevivieron al Profeta Muhammad (ﷺ) tras su muerte?"
            q['options']['es'] = ["9", "11", "4", "none"]
            q['correctAnswer']['es'] = "9"
            q['explanation']['es'] = "El Profeta tuvo 11 esposas en total a lo largo de su vida, pero al momento de su fallecimiento vivían 9 de ellas."
        elif qid == 109:
            q['question']['es'] = "¿Cuántos Libros Sagrados se mencionan por nombre en el Corán?"
            q['options']['es'] = ["4 principales", "3", "5", "6"]
            q['correctAnswer']['es'] = "4 principales"
            q['explanation']['es'] = "El Corán menciona por nombre la Tawrah, Zabur, Injil y Corán, y alude a las Páginas (Suhuf) de Ibrahim y Musa."
        elif qid == 29: # Suhur/Sahur
            q['options']['es'] = ["Iftar", "Tarawih", "Qiyam", "Suhur"]
            if "Sahur" in q['options']['es']:
                q['options']['es'].remove("Sahur")
            q['correctAnswer']['es'] = "Suhur"
        elif qid == 312:
            q['question']['es'] = "¿Cuál fue el destino de la esposa del Profeta Lut según el Corán?"
            q['options']['es'] = [
                "Se quedó atrás y fue destruida",
                "Se salvó con él",
                "Murió de enfermedad",
                "Fue perdonada"
            ]
            q['correctAnswer']['es'] = "Se quedó atrás y fue destruida"
            q['explanation']['es'] = "El Corán indica que no obedeció y fue de los que se quedaron atrás. (Mencionar que se convirtió en estatua de sal es tradición bíblica, no coránica)."
        elif qid == 354:
            q['question']['es'] = "¿Quién fue el hombre inmensamente rico y arrogante de la época del Profeta Musa que fue tragado por la tierra?"
            q['options']['es'] = ["Qarun", "Haman", "Faraón", "Jalut"]
            q['correctAnswer']['es'] = "Qarun"
            q['explanation']['es'] = "Qarun (Coré) se rebeló contra Musa y se jactó de su riqueza, por lo que Allah hizo que la tierra se lo tragase."
        elif qid == 355:
            q['question']['es'] = "¿A qué gigante derrotó el joven Dawud en batalla?"
            q['options']['es'] = ["Jalut (Goliat)", "Faraón", "Qarun", "Nimrod"]
            q['correctAnswer']['es'] = "Jalut (Goliat)"
        elif qid == 114:
            q['question']['es'] = "¿Qué se conmemora en el Eid al-Adha?"
            q['options']['es'] = ["La disposición de Ibrahim de sacrificar a su hijo", "El final del Ramadán", "La revelación del Corán", "La Hégira a Medina"]
            q['correctAnswer']['es'] = "La disposición de Ibrahim de sacrificar a su hijo"
        elif qid == 242:
            q['question']['es'] = "¿Cuál es uno de los pilares indispensables (arkan) del Hajj sin el cual la peregrinación no es válida?"
            q['options']['es'] = ["Estar en Arafat (Wuquf)", "Lanzar piedras en Mina", "Visitar Medina", "Sacrificar un animal"]
            q['correctAnswer']['es'] = "Estar en Arafat (Wuquf)"
            q['explanation']['es'] = "El Profeta (ﷺ) dijo: 'El Hajj es Arafat', indicando que es el pilar más importante."
        elif qid == 137:
            q['question']['es'] = "¿Cuál es el atributo de Allah que significa 'El Más Misericordioso'?"
            q['options']['es'] = ["Ar-Rahim", "Al-Malik", "Al-Quddus", "As-Salam"]
            q['correctAnswer']['es'] = "Ar-Rahim"
    
    # Check that translations exist or need update. To keep it simple we only updated ES here.
    # It would be best to update EN and AR as well or delete them to run the translation script later.
    for q in filtered_qs:
        for k in ['question', 'options', 'correctAnswer', 'explanation']:
            if 'en' in q.get(k, {}): del q[k]['en']
            if 'ar' in q.get(k, {}): del q[k]['ar']

    data['questions'] = filtered_qs
    data['total'] = len(filtered_qs)
    
    with open('src/data/questions_fixed.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"File saved with {len(filtered_qs)} questions. Removed {len(questions) - len(filtered_qs)} questions.")

if __name__ == '__main__':
    apply_audit()
