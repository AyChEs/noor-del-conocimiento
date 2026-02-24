import json
import os

def apply_audit():
    path = 'src/data/questions.json'
    with open(path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # Si es un dict, extraemos la lista
    if isinstance(questions, dict):
        questions = questions.get("questions", [])

    # 1. IDs a eliminar
    ids_to_remove = {
        380, 387, 445, 455, 487, 553, 554, 555, 556, 564, 567, 569, 574, # Fechas exactas
        198, # Tarawih
        369, # Madre Ibrahim
        475, # Nacimiento Profeta 12 rabi
        359, # Años enfermedad Ayyub
        360, # Años Yusuf cárcel
        350, # Idris elevado vivo
        353, # Suegro Musa shuaib
        572, # Duplicado esposas 13
        109, 172, # Contradiccion libros (dejamos la 71 correcta)
        43, 84, # Duplicados de 6
        51, 81, # Duplicados de 1
        52, 82, # Duplicados de 18
        42, 83  # Duplicados de 2
    }

    filtered_qs = [q for q in questions if q['id'] not in ids_to_remove]

    # 2. Modificaciones in-place
    for q in filtered_qs:
        qid = q['id']
        if qid == 110:
            q['question'] = {"es": "¿Cuál de estas acciones es parte obligatoria del Wudu según el Corán (5:6)?", "en": "Which of these is a mandatory part of Wudu according to Quran (5:6)?", "ma": "أشنو هو الفرض ف الوضوء على حساب القرآن (5:6)؟"}
            q['options'] = {"es": ["Lavar la cara", "Lavar el cuello", "Lavar las rodillas", "Lavar la nuca"], "en": ["Wash the face", "Wash the neck", "Wash the knees", "Wash the nape"], "ma": ["غسل الوجه", "غسل العنق", "غسل الركبتين", "غسل القفا"]}
            q['correctAnswer'] = {"es": "Lavar la cara", "en": "Wash the face", "ma": "غسل الوجه"}
            q['explanation'] = {"es": "El Corán (5:6) menciona cuatro pasos obligatorios: lavar la cara, las manos hasta los codos, pasar la mano mojada por la cabeza y lavar los pies hasta los tobillos.", "en": "The Quran mentions 4 obligatory steps: washing face, arms to elbows, wiping head, washing feet to ankles.", "ma": "القرآن كيقول بلي كاين 4 د الفروض: غسل الوجه، اليدين للمرفقين، مسح الرأس، وغسل الرجلين للكعبين."}
        elif qid == 547:
            q['question'] = {"es": "¿Cuántas esposas tuvo el Profeta Muhammad (ﷺ) en total durante su vida?", "en": "How many wives did Prophet Muhammad (ﷺ) have in total during his life?", "ma": "شحال من زوجة تزوج النبي محمد (ﷺ) ف حياتو كاملة؟"}
            q['options'] = {"es": ["4", "9", "11", "13"], "en": ["4", "9", "11", "13"], "ma": ["4", "9", "11", "13"]}
            q['correctAnswer'] = {"es": "11", "en": "11", "ma": "11"}
            q['explanation'] = {"es": "El Profeta tuvo 11 esposas en total a lo largo de su vida, pero al momento de su fallecimiento vivían 9 de ellas.", "en": "He had 11 wives in total, but 9 were alive at the time of his death.", "ma": "تزوج 11 زوجة ف حياتو، و ملي مات كانو باقين حيين 9."}
        elif qid == 29:
            q['options'] = {"es": ["Iftar", "Tarawih", "Suhur (السحور)", "Qiyam"], "en": ["Iftar", "Tarawih", "Suhur", "Qiyam"], "ma": ["الفطور", "التراويح", "السحور", "القيام"]}
            q['correctAnswer'] = {"es": "Suhur (السحور)", "en": "Suhur", "ma": "السحور"}
        elif qid == 312:
            q['question'] = {"es": "¿Cuál fue el destino de la esposa del Profeta Lut?", "en": "What was the fate of Prophet Lut's wife?", "ma": "أشنو وقع للزوجة ديال النبي لوط؟"}
            q['options'] = {"es": ["Se salvó con él", "Se quedó atrás y fue destruida", "Murió de enfermedad", "Fue perdonada"], "en": ["Saved with him", "Stayed behind and was destroyed", "Died of illness", "Forgiven"], "ma": ["نجات معاه", "بقات لور و هلكات", "ماتت مريضة", "تغفر ليها"]}
            q['correctAnswer'] = {"es": "Se quedó atrás y fue destruida", "en": "Stayed behind and was destroyed", "ma": "بقات لور و هلكات"}
            q['explanation'] = {"es": "El Corán indica que no obedeció y fue de los que se quedaron atrás.", "en": "The Quran indicates she disobeyed and stayed behind among the destroyed.", "ma": "القرآن كيقول بلي ما سمعاتش الهضرة و بقات مع اللي هلكو."}
        elif qid == 354:
            q['question'] = {"es": "¿Qarun de quién era contemporáneo?", "en": "Who was Qarun a contemporary of?", "ma": "شكون كان فقارون ف زمانو؟"}
            q['options'] = {"es": ["De Nuh", "Del Profeta Musa", "De Ibrahim", "De Dawud"], "en": ["Nuh", "Prophet Musa", "Ibrahim", "Dawud"], "ma": ["نوح", "النبي موسى", "إبراهيم", "داوود"]}
            q['correctAnswer'] = {"es": "Del Profeta Musa", "en": "Prophet Musa", "ma": "النبي موسى"}
            q['explanation'] = {"es": "Qarun fue un hombre de la época del Profeta Musa, arrogante por su riqueza, que fue tragado por la tierra.", "en": "Qarun was a wealthy arrogant man from Musa's time, swallowed by the earth.", "ma": "قارون كان واحد الراجل ف زمان النبي موسى، كان متكبر بالفلوس ديالو، و بلعاتو الأرض."}
        elif qid == 355:
            q['question'] = {"es": "¿Cuál fue el nombre árabe del gigante que mató el Profeta Dawud?", "en": "What was the Arabic name of the giant killed by Prophet Dawud?", "ma": "أشنو السمية العربية ديال العملاق اللي قتلو النبي داوود؟"}
            q['options'] = {"es": ["Jalut (Goliat)", "Faraón", "Qarun", "Nimrod"], "en": ["Jalut (Goliath)", "Pharaoh", "Qarun", "Nimrod"], "ma": ["جالوت", "فرعون", "قارون", "نمرود"]}
            q['correctAnswer'] = {"es": "Jalut (Goliat)", "en": "Jalut (Goliath)", "ma": "جالوت"}
        elif qid == 114:
            q['question'] = {"es": "¿Qué se conmemora en el Eid al-Adha?", "en": "What is commemorated in Eid al-Adha?", "ma": "أشنو كنحتفلو ف عيد الأضحى؟"}
            q['options'] = {"es": ["La disposición de Ibrahim de sacrificar a su hijo", "El final del Ramadán", "La revelación del Corán", "La Hégira a Medina"], "en": ["Ibrahim's willingness to sacrifice his son", "End of Ramadan", "Revelation of Quran", "Hijra to Medina"], "ma": ["استعداد إبراهيم للتضحية بولدو", "نهاية رمضان", "نزول القرآن", "الهجرة للمدينة"]}
            q['correctAnswer'] = {"es": "La disposición de Ibrahim de sacrificar a su hijo", "en": "Ibrahim's willingness to sacrifice his son", "ma": "استعداد إبراهيم للتضحية بولدو"}
        elif qid == 242:
            q['question'] = {"es": "¿Cuál es uno de los pilares indispensables (arkan) del Hajj sin el cual la peregrinación no es válida?", "en": "What is an indispensable pillar of Hajj without which it's invalid?", "ma": "أشنو هو الركن ف الحج اللي يلا مادرتيهش كيبطل حجك؟"}
            q['options'] = {"es": ["Estar en Arafat (Wuquf)", "Lanzar piedras en Mina", "Visitar Medina", "Sacrificar un animal"], "en": ["Standing at Arafat (Wuquf)", "Throwing stones at Mina", "Visiting Medina", "Sacrificing an animal"], "ma": ["الوقوف بعرفة", "رمي الجمرات ف منى", "زيارة المدينة", "ذبح الأضحية"]}
            q['correctAnswer'] = {"es": "Estar en Arafat (Wuquf)", "en": "Standing at Arafat (Wuquf)", "ma": "الوقوف بعرفة"}
            q['explanation'] = {"es": "El Profeta (ﷺ) dijo: 'El Hajj es Arafat', indicando que es el pilar más importante.", "en": "The Prophet said: 'Hajj is Arafat', meaning it's the core pillar.", "ma": "النبي قال 'الحج عرفة'، يعني هو الركن الأساسي."}
        elif qid == 137:
            q['question'] = {"es": "¿Cuál es el atributo de Allah que significa 'El Más Misericordioso'?", "en": "What is the attribute of Allah meaning 'The Most Merciful'?", "ma": "أشنو هو اسم الله اللي كيعني 'الأكثر رحمة'؟"}
            q['options'] = {"es": ["Ar-Rahim", "Al-Malik", "Al-Quddus", "As-Salam"], "en": ["Ar-Rahim", "Al-Malik", "Al-Quddus", "As-Salam"], "ma": ["الرحيم", "الملك", "القدوس", "السلام"]}
            q['correctAnswer'] = {"es": "Ar-Rahim", "en": "Ar-Rahim", "ma": "الرحيم"}

    # 3. Add Nuevas Preguntas
    nuevas = [
        {
            "id": 601,
            "question": {"es": "¿Cuál es el término árabe para la biografía del Profeta Muhammad (ﷺ)?", "en": "What is the Arabic term for the biography of Prophet Muhammad (ﷺ)?", "ma": "شنو هو المصطلح العربي للسيرة ديال النبي محمد (ﷺ)؟"},
            "options": {"es": ["Tafsir", "Hadith", "Seerah", "Aqida"], "en": ["Tafsir", "Hadith", "Seerah", "Aqida"], "ma": ["تفسير", "حديث", "سيرة", "عقيدة"]},
            "correctAnswer": {"es": "Seerah", "en": "Seerah", "ma": "سيرة"},
            "category": "Seerah",
            "difficulty": "easy",
            "explanation": {"es": "La Seerah es la biografía del Profeta (ﷺ).", "en": "Seerah is the biography of the Prophet (ﷺ).", "ma": "السيرة هي قصة حياة النبي (ﷺ)."}
        },
        {
            "id": 602,
            "question": {"es": "¿Qué es el 'Witr' en la práctica islámica?", "en": "What is 'Witr' in Islamic practice?", "ma": "أشنو هو 'الوتر' ف الممارسة الإسلامية؟"},
            "options": {"es": ["Un mes", "Un ayuno", "Una oración de número impar de rak'at al final de la noche", "Un tipo de caridad"], "en": ["A month", "A fast", "An odd-numbered unit prayer at the end of the night", "A type of charity"], "ma": ["شهر", "صيام", "صلاة بعدد ركعات فردي وف آخر الليل", "نوع ديال الصدقة"]},
            "correctAnswer": {"es": "Una oración de número impar de rak'at al final de la noche", "en": "An odd-numbered unit prayer at the end of the night", "ma": "صلاة بعدد ركعات فردي وف آخر الليل"},
            "category": "Corán y General",
            "difficulty": "medium",
            "explanation": {"es": "El Witr cierra las oraciones nocturnas con rak'ats impares.", "en": "Witr concludes the night prayers with an odd number of rakats.", "ma": "الوتر كيختم صلوات الليل بركعات فردية."}
        },
        {
            "id": 603,
            "question": {"es": "¿Cuál es el término para el sermón del viernes?", "en": "What is the term for the Friday sermon?", "ma": "أشنو السمية ديال خطبة الجمعة؟"},
            "options": {"es": ["Adhan", "Iqama", "Khutbah", "Wa'dh"], "en": ["Adhan", "Iqama", "Khutbah", "Wa'dh"], "ma": ["آذان", "إقامة", "خطبة", "وعظ"]},
            "correctAnswer": {"es": "Khutbah", "en": "Khutbah", "ma": "خطبة"},
            "category": "Corán y General",
            "difficulty": "easy",
            "explanation": {"es": "La Khutbah es el sermón dado antes del Jumu'ah.", "en": "Khutbah is the sermon before Jumu'ah prayer.", "ma": "الخطبة هي اللي كيقولها الإمام قبل صلاة الجمعة."}
        },
        {
            "id": 604,
            "question": {"es": "¿Cuál fue la súplica del Profeta Ayyub mencionada en el Corán?", "en": "What was the supplication of Prophet Ayyub in the Quran?", "ma": "أشنو هو الدعاء ديال النبي أيوب اللي تذكر ف القرآن؟"},
            "options": {"es": ["La ilaha illa anta...", "Rabbana atina...", "'Que me ha tocado la adversidad, y Tú eres el más misericordioso...'", "Hasbunallahu..."], "en": ["La ilaha illa anta...", "Rabbana atina...", "'Adversity has touched me, and You are the Most Merciful...'", "Hasbunallahu..."], "ma": ["لا إله إلا أنت...", "ربنا آتنا...", "أني مسني الضر وأنت أرحم الراحمين", "حسبنا الله..."]},
            "correctAnswer": {"es": "'Que me ha tocado la adversidad, y Tú eres el más misericordioso...'", "en": "'Adversity has touched me, and You are the Most Merciful...'", "ma": "أني مسني الضر وأنت أرحم الراحمين"},
            "category": "Profetas",
            "difficulty": "hard",
            "explanation": {"es": "Corán 21:83 — 'Rabbahu anni massaniya al-durru...'", "en": "Quran 21:83", "ma": "القرآن 21:83"}
        },
        {
            "id": 605,
            "question": {"es": "¿En qué tierra se estableció el Profeta Musa tras huir de Egipto, donde encontró a las hijas del anciano?", "en": "Where did Prophet Musa settle after fleeing Egypt, finding the old man's daughters?", "ma": "فأشمن أرض استقر النبي موسى من بعد ما هرب من مصر ولقى بنات الشيخ؟"},
            "options": {"es": ["Sham (Siria)", "Madián", "Canaán", "Babilonia"], "en": ["Sham (Syria)", "Midian", "Canaan", "Babylon"], "ma": ["الشام", "مدين", "كنعان", "بابل"]},
            "correctAnswer": {"es": "Madián", "en": "Midian", "ma": "مدين"},
            "category": "Profetas",
            "difficulty": "medium",
            "explanation": {"es": "Musa huyó a Madián.", "en": "Musa fled to Midian.", "ma": "موسى هرب لمدين."}
        },
        {
            "id": 606,
            "question": {"es": "¿Cuántos profetas del Corán son de la descendencia de Ibrahim?", "en": "How many Quranic prophets are from Ibrahim's descendants?", "ma": "شحال من نبي ف القرآن من ذرية إبراهيم؟"},
            "options": {"es": ["Ninguno", "5", "La mayoría de los profetas posteriores", "Solo 2"], "en": ["None", "5", "Most of the subsequent prophets", "Only 2"], "ma": ["حتى واحد", "5", "أغلب الأنبياء اللي جاو من بعد", "غير 2"]},
            "correctAnswer": {"es": "La mayoría de los profetas posteriores", "en": "Most of the subsequent prophets", "ma": "أغلب الأنبياء اللي جاو من بعد"},
            "category": "Profetas",
            "difficulty": "medium",
            "explanation": {"es": "La descendencia de Ibrahim produjo a Ishaq, Yaqub, Yusuf, Musa, Dawud, Isa, entre otros.", "en": "Ibrahim's line produced Isaac, Jacob, Joseph, Moses, David, Jesus, etc.", "ma": "الذرية ديال إبراهيم خرجات إسحاق، يعقوب، يوسف، موسى، داوود، وعيسى وغيرهم."}
        },
        {
            "id": 607,
            "question": {"es": "¿Cuál fue la importancia del Isra wal-Mi'raj en la historia del Islam?", "en": "What was the importance of Isra wal-Mi'raj?", "ma": "أشنو هي أهمية الإسراء والمعراج ف تاريخ الإسلام؟"},
            "options": {"es": ["Se reveló el Corán", "Se prescribieron las cinco oraciones", "Primera batalla", "Cambio de Qibla"], "en": ["Quran revealed", "Five daily prayers prescribed", "First battle", "Qibla change"], "ma": ["نزل القرآن", "تفرضو الصلوات الخمس", "أول معركة", "تغيرات القبلة"]},
            "correctAnswer": {"es": "Se prescribieron las cinco oraciones", "en": "Five daily prayers prescribed", "ma": "تفرضو الصلوات الخمس"},
            "category": "Seerah",
            "difficulty": "hard",
            "explanation": {"es": "Durante el Mi'raj se ordenaron las 5 oraciones diarias.", "en": "The 5 daily prayers were ordained during the Mi'raj.", "ma": "ف المعراج تفرضو الصلوات الخمس."}
        },
        {
            "id": 608,
            "question": {"es": "¿Cuál fue la batalla decisiva que permitió a los musulmanes conquistar Siria?", "en": "Which decisive battle allowed Muslims to conquer Syria?", "ma": "أشنو هي المعركة الحاسمة اللي خلات المسلمين يفتحو الشام؟"},
            "options": {"es": ["Qadisiyyah", "Yarmuk", "Nahawand", "Ajnadain"], "en": ["Qadisiyyah", "Yarmouk", "Nahawand", "Ajnadain"], "ma": ["القادسية", "اليرموك", "نهاوند", "أجنادين"]},
            "correctAnswer": {"es": "Yarmuk", "en": "Yarmouk", "ma": "اليرموك"},
            "category": "Seerah",
            "difficulty": "hard",
            "explanation": {"es": "Yarmuk fue la batalla decisiva contra los bizantinos en Siria.", "en": "Yarmouk was the decisive battle against the Byzantines in Syria.", "ma": "اليرموك هي المعركة الحاسمة ضد الروم ف الشام."}
        },
        {
            "id": 609,
            "question": {"es": "¿Cuál fue la batalla que destruyó el poder del Imperio Sasánida de Persia?", "en": "Which battle destroyed the Sasanian Empire's power?", "ma": "أشنو المعركة اللي دمرات قوة إمبراطورية الفرس الساسانية؟"},
            "options": {"es": ["Yarmuk", "Qadisiyyah", "Nahawand", "Ajnadain"], "en": ["Yarmouk", "Qadisiyyah", "Nahawand", "Ajnadain"], "ma": ["اليرموك", "القادسية", "نهاوند", "أجنادين"]},
            "correctAnswer": {"es": "Qadisiyyah", "en": "Qadisiyyah", "ma": "القادسية"},
            "category": "Seerah",
            "difficulty": "hard",
            "explanation": {"es": "La batalla de Qadisiyyah quebrantó a Persia.", "en": "Qadisiyyah dismantled Persian power.", "ma": "القادسية هي اللي طيحات فارس."}
        },
        {
            "id": 610,
            "question": {"es": "¿Cuál fue la primera gran expedición militar de los musulmanes donde fue el primer comandante?", "en": "What was the first major military expedition and who commanded it?", "ma": "أشنو هي أول غزوة أو سرية عسكرية للمسلمين وشكون كان قائدها؟"},
            "options": {"es": ["Badr", "Expedición de Hamza ibn Abd al-Muttalib", "Uhud", "Khandaq"], "en": ["Badr", "Expedition of Hamza ibn Abd al-Muttalib", "Uhud", "Khandaq"], "ma": ["بدر", "سرية حمزة بن عبد المطلب", "أحد", "الخندق"]},
            "correctAnswer": {"es": "Expedición de Hamza ibn Abd al-Muttalib", "en": "Expedition of Hamza ibn Abd al-Muttalib", "ma": "سرية حمزة بن عبد المطلب"},
            "category": "Seerah",
            "difficulty": "hard",
            "explanation": {"es": "Sariyyat al-Kharrar, liderada por Hamza, fue la primera expedición.", "en": "Sariyyat al-Kharrar led by Hamza was the first expedition.", "ma": "سرية الخرار اللي قادها حمزة كانت هي الأولى."}
        },
        {
            "id": 611,
            "question": {"es": "¿Cuál fue el nombre del primer esclavo que abrazó el Islam?", "en": "What was the name of the first slave to embrace Islam?", "ma": "أشنو سمية أول عبد دخل للإسلام؟"},
            "options": {"es": ["Zayd ibn Harithah", "Bilal ibn Rabah", "Ammar ibn Yasir", "Suhayb al-Rumi"], "en": ["Zayd ibn Harithah", "Bilal ibn Rabah", "Ammar ibn Yasir", "Suhayb al-Rumi"], "ma": ["زيد بن حارثة", "بلال بن رباح", "عمار بن ياسر", "صهيب الرومي"]},
            "correctAnswer": {"es": "Zayd ibn Harithah", "en": "Zayd ibn Harithah", "ma": "زيد بن حارثة"},
            "category": "Seerah",
            "difficulty": "hard",
            "explanation": {"es": "Zayd ibn Harithah, el hijo adoptivo del Profeta, fue el primer esclavo liberto en abrazar el Islam.", "en": "Zayd ibn Harithah was the first slave to accept Islam.", "ma": "زيد بن حارثة كان أول واحد من الموالي اللي سْلْم."}
        },
        {
            "id": 612,
            "question": {"es": "¿Cuál fue la importancia estratégica de la Batalla del Khandaq (Foso)?", "en": "What was the strategic importance of the Battle of the Trench (Khandaq)?", "ma": "أشنو هي الأهمية الاستراتيجية ديال غزوة الخندق؟"},
            "options": {"es": ["Primera batalla del Islam", "Última gran ofensiva de los Quraysh contra Medina", "Conquista de La Meca", "Derrota de los judíos"], "en": ["First battle of Islam", "Last major Quraysh offensive against Medina", "Conquest of Mecca", "Defeat of the Jews"], "ma": ["أول معركة", "آخر هجوم كبير لقريش على المدينة", "فتح مكة", "هزيمة اليهود"]},
            "correctAnswer": {"es": "Última gran ofensiva de los Quraysh contra Medina", "en": "Last major Quraysh offensive against Medina", "ma": "آخر هجوم كبير لقريش على المدينة"},
            "category": "Seerah",
            "difficulty": "hard",
            "explanation": {"es": "Tras Khandaq, los Quraysh no volvieron a atacar Medina.", "en": "After Khandaq, Quraysh never attacked Medina again.", "ma": "من مورا الخندق، قريش ما عاودوش هجمو على المدينة."}
        },
        {
            "id": 613,
            "question": {"es": "¿Quién fue el gobernador fundador de la dinastía Omeya?", "en": "Who was the founding governor of the Umayyad dynasty?", "ma": "شكون هو الوالي اللي أسس الدولة الأموية؟"},
            "options": {"es": ["Yazid", "Mu'awiyah ibn Abi Sufyan", "Marwan", "Abd al-Malik"], "en": ["Yazid", "Mu'awiyah ibn Abi Sufyan", "Marwan", "Abd al-Malik"], "ma": ["يزيد", "معاوية بن أبي سفيان", "مروان", "عبد الملك"]},
            "correctAnswer": {"es": "Mu'awiyah ibn Abi Sufyan", "en": "Mu'awiyah ibn Abi Sufyan", "ma": "معاوية بن أبي سفيان"},
            "category": "Seerah",
            "difficulty": "hard",
            "explanation": {"es": "Mu'awiyah fundó la dinastía Omeya tras gobernar Siria.", "en": "Mu'awiyah founded the Umayyad dynasty.", "ma": "معاوية هو اللي أسس الدولة الأموية."}
        },
        {
            "id": 614,
            "question": {"es": "¿Cuántos años duró el califato de Uthman ibn Affan?", "en": "How many years did Uthman ibn Affan's caliphate last?", "ma": "شحال من عام دام خلافة عثمان بن عفان؟"},
            "options": {"es": ["5", "8", "12", "15"], "en": ["5", "8", "12", "15"], "ma": ["5", "8", "12", "15"]},
            "correctAnswer": {"es": "12", "en": "12", "ma": "12"},
            "category": "Seerah",
            "difficulty": "hard",
            "explanation": {"es": "Gobernó por 12 años aproximadamente.", "en": "He ruled for about 12 years.", "ma": "حكم تقريبا 12 عام."}
        },
        {
            "id": 615,
            "question": {"es": "¿Cuál fue la importancia de la Batalla de Badr para el Islam?", "en": "What was the importance of the Battle of Badr for Islam?", "ma": "أشنو هي أهمية غزوة بدر ف الإسلام؟"},
            "options": {"es": ["Conquista de La Meca", "Primera victoria que consolidó la autoridad del Profeta", "La mayor derrota", "Conquista de toda Arabia"], "en": ["Conquest of Mecca", "First victory consolidating the Prophet's authority", "Biggest defeat", "Conquest of all Arabia"], "ma": ["فتح مكة", "أول نصر اللي رسخ سلطة النبي", "أكبر هزيمة", "فتح ڭاع جزيرة العرب"]},
            "correctAnswer": {"es": "Primera victoria que consolidó la autoridad del Profeta", "en": "First victory consolidating the Prophet's authority", "ma": "أول نصر اللي رسخ سلطة النبي"},
            "category": "Seerah",
            "difficulty": "hard",
            "explanation": {"es": "Fue la primera gran victoria militar.", "en": "It was the first major military victory.", "ma": "كانت أول انتصار عسكري كبير."}
        },
        {
            "id": 616,
            "question": {"es": "¿Cuántos años gobernó Ali ibn Abi Talib como Califa?", "en": "How many years did Ali ibn Abi Talib rule as Caliph?", "ma": "شحال من عام حكم علي بن أبي طالب كخليفة؟"},
            "options": {"es": ["3", "Aproximadamente 5 años", "7", "10"], "en": ["3", "Approximately 5 years", "7", "10"], "ma": ["3", "تقريبا 5 سنين", "7", "10"]},
            "correctAnswer": {"es": "Aproximadamente 5 años", "en": "Approximately 5 years", "ma": "تقريبا 5 سنين"},
            "category": "Seerah",
            "difficulty": "hard",
            "explanation": {"es": "Su califato duró alrededor de 5 años.", "en": "His caliphate lasted about 5 years.", "ma": "الخلافة ديالو دامت قياس 5 سنين."}
        }
    ]

    filtered_qs.extend(nuevas)

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(filtered_qs, f, ensure_ascii=False, indent=2)

    print(f"Total de preguntas ahora: {len(filtered_qs)}")

if __name__ == '__main__':
    apply_audit()
