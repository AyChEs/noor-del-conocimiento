"""
Script principal para generar y actualizar questions.json
Combina todos los lotes de preguntas y actualiza el archivo JSON principal
"""

import json
import os

# Importar todos los lotes
from questions_batch1 import BATCH1
from questions_batch2 import BATCH2
from questions_batch3 import BATCH3
from questions_batch4 import BATCH4
from questions_batch5 import BATCH5
from questions_batch6 import BATCH6
from questions_batch7 import BATCH7
from questions_batch8 import BATCH8
from questions_batch9 import BATCH9
from questions_batch10 import BATCH10
from questions_batch11 import BATCH11
from questions_batch12 import BATCH12
from questions_batch13 import BATCH13
from questions_batch14 import BATCH14
from questions_batch15 import BATCH15
from questions_batch16 import BATCH16

# Ruta al archivo JSON principal
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
JSON_PATH = os.path.join(PROJECT_ROOT, "src", "data", "questions.json")

def main():
    # Cargar las preguntas existentes
    print(f"Cargando preguntas desde: {JSON_PATH}")
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # El JSON puede ser una lista directa o un objeto con clave "questions"
    if isinstance(data, list):
        existing_questions = data
    else:
        existing_questions = data.get("questions", [])
    print(f"Preguntas existentes: {len(existing_questions)}")
    
    # Eliminar la pregunta ID 28 (Al-Khwarizmi - fuera de tema)
    existing_questions = [q for q in existing_questions if q.get("id") != 28]
    print(f"Preguntas después de eliminar ID 28: {len(existing_questions)}")
    
    # Obtener IDs existentes para evitar duplicados
    existing_ids = {q["id"] for q in existing_questions}
    
    # Combinar todos los lotes nuevos
    all_new_batches = (BATCH1 + BATCH2 + BATCH3 + BATCH4 + BATCH5 + BATCH6 + BATCH7 +
                       BATCH8 + BATCH9 + BATCH10 + BATCH11 + BATCH12 + BATCH13 +
                       BATCH14 + BATCH15 + BATCH16)
    print(f"Total de preguntas nuevas en lotes: {len(all_new_batches)}")
    
    # Filtrar duplicados por ID
    new_questions = []
    for q in all_new_batches:
        if q["id"] not in existing_ids:
            new_questions.append(q)
            existing_ids.add(q["id"])
        else:
            print(f"  Advertencia: ID {q['id']} duplicado, saltando...")
    
    print(f"Preguntas nuevas únicas: {len(new_questions)}")
    
    # Combinar todo
    all_questions = existing_questions + new_questions
    all_questions.sort(key=lambda x: x["id"])
    
    print(f"\nTotal final de preguntas: {len(all_questions)}")
    
    # Estadísticas por categoría
    cats = {}
    diffs = {}
    for q in all_questions:
        cat = q.get("category", "Unknown")
        diff = q.get("difficulty", "Unknown")
        cats[cat] = cats.get(cat, 0) + 1
        diffs[diff] = diffs.get(diff, 0) + 1
    
    print("\nDistribución por categoría:")
    for cat, count in sorted(cats.items()):
        print(f"  {cat}: {count}")
    
    print("\nDistribución por dificultad:")
    for diff, count in sorted(diffs.items()):
        print(f"  {diff}: {count}")
    
    # Guardar el archivo JSON actualizado
    if isinstance(data, list):
        output_data = all_questions
    else:
        data["questions"] = all_questions
        output_data = data
    
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Archivo actualizado exitosamente: {JSON_PATH}")
    print(f"   Total: {len(all_questions)} preguntas")

if __name__ == "__main__":
    main()
