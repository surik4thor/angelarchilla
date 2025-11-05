// Tarot de los Ángeles - Las 78 Cartas Completas
// Jerarquía celestial completa con significados positivos, neutrales y negativos
// Basado en la tradición angelical y teología cristiana

export const angelsDeck = {
  // Primera Jerarquía: Serafines (1-3)
  1: {
    name: "Serafín del Amor Puro y Elevado",
    hierarchy: "Serafines",
    tier: "Primera Jerarquía",
    description: "Representa el amor a la humanidad y la pureza de sentimientos.",
    meaning_upright: "Simboliza la voluntad de hacer buenas acciones desinteresadas. Invita a actuar sin esperar recompensa para recibir el bienestar que las buenas acciones proporcionan.",
    meaning_reversed: null,
    keywords_upright: ["amor puro", "desinterés", "buenas acciones", "pureza", "humanidad"],
    keywords_reversed: [],
    element: "fuego",
    planet: "sol"
  },
  
  2: {
    name: "Serafín Sanador",
    hierarchy: "Serafines", 
    tier: "Primera Jerarquía",
    description: "Indica curación de enfermedades y auxilio en momentos de dificultad.",
    meaning_upright: "Protege a los enfermos y ofrece esperanza en el camino hacia la recuperación.",
    meaning_reversed: "Representa un mal tratamiento de enfermedades.",
    keywords_upright: ["curación", "auxilio", "protección", "esperanza", "recuperación"],
    keywords_reversed: ["mal tratamiento", "enfermedad", "desesperanza"],
    element: "agua",
    planet: "luna"
  },

  3: {
    name: "Serafín Cantor",
    hierarchy: "Serafines",
    tier: "Primera Jerarquía", 
    description: "Representa al artista y la creatividad.",
    meaning_upright: "Simboliza habilidades creativas y don artístico.",
    meaning_reversed: "Representa tristeza y falta de inspiración.",
    keywords_upright: ["creatividad", "arte", "inspiración", "talento", "expresión"],
    keywords_reversed: ["tristeza", "bloqueo creativo", "falta de inspiración"],
    element: "aire",
    planet: "mercurio"
  },

  // Querubines (4-6)
  4: {
    name: "Querubín Kerub",
    hierarchy: "Querubines",
    tier: "Primera Jerarquía",
    description: "Ángel mediador y consejero.",
    meaning_upright: "Representa buenos consejos y resolución pacífica de conflictos.",
    meaning_reversed: "Representa falta de apoyo ante situaciones problemáticas.",
    keywords_upright: ["mediación", "consejo", "paz", "resolución", "armonía"],
    keywords_reversed: ["falta de apoyo", "conflictos", "problemas"],
    element: "tierra",
    planet: "venus"
  },

  5: {
    name: "Querubín Karibu", 
    hierarchy: "Querubines",
    tier: "Primera Jerarquía",
    description: "Ángel guardián con gran capacidad de protección y buenos principios.",
    meaning_upright: "Representa poder judicial y justicia.",
    meaning_reversed: "Determina a personas poco tolerantes y conservadoras.",
    keywords_upright: ["protección", "justicia", "principios", "guardián", "poder judicial"],
    keywords_reversed: ["intolerancia", "conservadurismo", "rigidez"],
    element: "fuego",
    planet: "marte"
  },

  6: {
    name: "Querubín Longevo",
    hierarchy: "Querubines",
    tier: "Primera Jerarquía",
    description: "Custodio del Árbol de la Vida.",
    meaning_upright: "Representa a personas sabias con gran experiencia y conocimiento de la vida.",
    meaning_reversed: "Representa ideas incorrectas y personas en las que no se puede confiar.",
    keywords_upright: ["sabiduría", "experiencia", "conocimiento", "custodio", "longevidad"],
    keywords_reversed: ["ideas erróneas", "desconfianza", "engaño"],
    element: "tierra",
    planet: "saturno"
  },

  // Tronos (7-9)
  7: {
    name: "Trono Masculino/Femenino",
    hierarchy: "Tronos",
    tier: "Primera Jerarquía",
    description: "Representa personas con ideas fijas que no se dejan arrastrar por pasiones.",
    meaning_upright: "Ángeles o extraterrestres con firmeza de carácter y estabilidad.",
    meaning_reversed: "Indica dificultades para concluir proyectos, embarazos falsos e ideas equivocadas.",
    keywords_upright: ["firmeza", "estabilidad", "ideas fijas", "autocontrol"],
    keywords_reversed: ["proyectos inconclusos", "confusión", "ideas erróneas"],
    element: "aire",
    planet: "jupiter"
  },

  8: {
    name: "Tronos Creativos",
    hierarchy: "Tronos", 
    tier: "Primera Jerarquía",
    description: "Representa a personas creativas con grandes ideas e innovación.",
    meaning_upright: "Ángeles o extraterrestres de la creatividad y la innovación.",
    meaning_reversed: "Muestra poca creatividad y paralización de proyectos.",
    keywords_upright: ["creatividad", "innovación", "grandes ideas", "progreso"],
    keywords_reversed: ["bloqueo creativo", "paralización", "estancamiento"],
    element: "fuego",
    planet: "sol"
  },

  9: {
    name: "Tronos los Extranjeros",
    hierarchy: "Tronos",
    tier: "Primera Jerarquía", 
    description: "Anuncia cambios y aparición de ideas nuevas.",
    meaning_upright: "Extraterrestres que muestran el poder de la mente.",
    meaning_reversed: "Representa mente confusa y peligro de adicciones.",
    keywords_upright: ["cambios", "ideas nuevas", "poder mental", "transformación"],
    keywords_reversed: ["confusión mental", "adicciones", "peligro"],
    element: "agua",
    planet: "neptuno"
  },

  // Dominaciones (10-12)
  10: {
    name: "Dominación Yahriel",
    hierarchy: "Dominaciones",
    tier: "Segunda Jerarquía",
    description: "Ángel gobernante que representa a un líder innato.",
    meaning_upright: "Liderazgo natural y capacidad de gobernar con sabiduría.",
    meaning_reversed: "Representa a un tirano sin capacidad de justicia.",
    keywords_upright: ["liderazgo", "gobierno", "autoridad", "sabiduría"],
    keywords_reversed: ["tiranía", "injusticia", "abuso de poder"],
    element: "fuego",
    planet: "sol"
  },

  11: {
    name: "Dominación Chasmal",
    hierarchy: "Dominaciones",
    tier: "Segunda Jerarquía",
    description: "Representa personas con gran pasión e impulsividad.",
    meaning_upright: "Pasión controlada y energía vital positiva.",
    meaning_reversed: "Representa histeria y pérdida de control.",
    keywords_upright: ["pasión", "impulsividad", "energía vital", "intensidad"],
    keywords_reversed: ["histeria", "descontrol", "caos emocional"],
    element: "fuego", 
    planet: "marte"
  },

  12: {
    name: "Dominación Zadkiel",
    hierarchy: "Dominaciones",
    tier: "Segunda Jerarquía",
    description: "Ángel de la misericordia y el altruismo.",
    meaning_upright: "Simboliza desinterés personal en favor de los demás.",
    meaning_reversed: "Representa egoísmo y engaño.",
    keywords_upright: ["misericordia", "altruismo", "desinterés", "compasión"],
    keywords_reversed: ["egoísmo", "engaño", "interés personal"],
    element: "agua",
    planet: "jupiter"
  },

  // Virtudes (13-18)
  13: {
    name: "Virtud Miguel",
    hierarchy: "Virtudes",
    tier: "Segunda Jerarquía",
    description: "Muestra nobleza y buen corazón.",
    meaning_upright: "Simboliza la llegada pronta de ayuda. No tiene interpretación invertida.",
    meaning_reversed: null,
    keywords_upright: ["nobleza", "buen corazón", "ayuda", "virtud"],
    keywords_reversed: [],
    element: "fuego",
    planet: "sol"
  },

  14: {
    name: "Virtud Tarshish",
    hierarchy: "Virtudes",
    tier: "Segunda Jerarquía", 
    description: "Ángel custodio que cuida y vela por los otros.",
    meaning_upright: "Representa protección a la familia y capacidad de cuidado. No tiene significado invertido.",
    meaning_reversed: null,
    keywords_upright: ["custodia", "protección", "familia", "cuidado"],
    keywords_reversed: [],
    element: "tierra",
    planet: "luna"
  },

  15: {
    name: "Virtud Bariel",
    hierarchy: "Virtudes",
    tier: "Segunda Jerarquía",
    description: "Ángel de la valentía y el coraje.",
    meaning_upright: "Representa personas capaces de superar cualquier adversidad. Invita a tomar decisiones difíciles. No tiene significado invertido.",
    meaning_reversed: null,
    keywords_upright: ["valentía", "coraje", "superación", "decisiones difíciles"],
    keywords_reversed: [],
    element: "fuego",
    planet: "marte"
  },

  16: {
    name: "Potestad Camael",
    hierarchy: "Potestades",
    tier: "Segunda Jerarquía",
    description: "Ángel de la dualidad y reconciliación.",
    meaning_upright: "Representa personas equilibradas con autoconfianza.",
    meaning_reversed: "Muestra personas deshonestas.",
    keywords_upright: ["dualidad", "reconciliación", "equilibrio", "autoconfianza"],
    keywords_reversed: ["deshonestidad", "desequilibrio"],
    element: "aire",
    planet: "venus"
  },

  17: {
    name: "Potestad Kemuel",
    hierarchy: "Potestades", 
    tier: "Segunda Jerarquía",
    description: "Ángel que concilia el bien y el mal.",
    meaning_upright: "Representa personas que buscan equilibrio entre lo correcto e incorrecto.",
    meaning_reversed: "Representa personas poco tolerantes y obstinadas.",
    keywords_upright: ["conciliación", "equilibrio", "bien y mal", "justicia"],
    keywords_reversed: ["intolerancia", "obstinación", "extremismo"],
    element: "aire",
    planet: "libra"
  },

  18: {
    name: "Potestad Sensiner",
    hierarchy: "Potestades",
    tier: "Segunda Jerarquía",
    description: "Representa a personas deprimidas con malos hábitos.",
    meaning_upright: "Advertencia sobre depresión y malos hábitos que deben transformarse.",
    meaning_reversed: "Simboliza pérdidas de valores morales y cuestiones materiales.",
    keywords_upright: ["depresión", "malos hábitos", "advertencia", "transformación"],
    keywords_reversed: ["pérdida de valores", "materialismo", "decadencia moral"],
    element: "agua",
    planet: "saturno"
  },

  // Principados (19-21)
  19: {
    name: "Principado Anael",
    hierarchy: "Principados",
    tier: "Tercera Jerarquía",
    description: "Ángel de la creación y sensualidad.",
    meaning_upright: "Representa poder, liderazgo, belleza física y buena relación con el sexo opuesto.",
    meaning_reversed: "Simboliza soberbia, egoísmo y aparición de enfermedades.",
    keywords_upright: ["creación", "sensualidad", "belleza", "liderazgo", "atracción"],
    keywords_reversed: ["soberbia", "egoísmo", "enfermedades", "vanidad"],
    element: "tierra",
    planet: "venus"
  },

  20: {
    name: "Principado Hamiel",
    hierarchy: "Principados",
    tier: "Tercera Jerarquía",
    description: "Consejero espiritual que llevó a Enoc al Cielo.",
    meaning_upright: "Simboliza sabiduría e inteligencia.",
    meaning_reversed: "Representa confusión y falta de vida espiritual.",
    keywords_upright: ["sabiduría", "inteligencia", "consejero espiritual", "elevación"],
    keywords_reversed: ["confusión", "falta de espiritualidad", "ignorancia"],
    element: "aire",
    planet: "mercurio"
  },

  21: {
    name: "Principado Cervill",
    hierarchy: "Principados",
    tier: "Tercera Jerarquía",
    description: "Ángel que ayudó a David contra Goliat.",
    meaning_upright: "Simboliza amistad, ayuda y contención emocional.",
    meaning_reversed: "Simboliza soledad.",
    keywords_upright: ["amistad", "ayuda", "contención", "apoyo", "victoria"],
    keywords_reversed: ["soledad", "abandono", "falta de apoyo"],
    element: "fuego",
    planet: "sol"
  },

  // Mensajeros (22-24)
  22: {
    name: "Dobiel",
    hierarchy: "Mensajeros",
    tier: "Tercera Jerarquía",
    description: "Transmite decretos divinos.",
    meaning_upright: "Representa personas comprensivas y abiertas en sentimientos.",
    meaning_reversed: "Representa personas confundidas en crisis.",
    keywords_upright: ["mensajes divinos", "comprensión", "apertura emocional", "comunicación"],
    keywords_reversed: ["confusión", "crisis", "falta de claridad"],
    element: "aire",
    planet: "mercurio"
  },

  23: {
    name: "El Ángel Renueco",
    hierarchy: "Mensajeros",
    tier: "Tercera Jerarquía",
    description: "Ángel mensajero que anuncia un legado benéfico.",
    meaning_upright: "Representa cambio de ciclo positivo.",
    meaning_reversed: null,
    keywords_upright: ["legado", "beneficio", "cambio positivo", "nueva etapa"],
    keywords_reversed: [],
    element: "aire",
    planet: "jupiter"
  },

  24: {
    name: "El Ángel Sariel",
    hierarchy: "Mensajeros", 
    tier: "Tercera Jerarquía",
    description: "Ángel mensajero que representa inspiración para descubrir cosas nuevas.",
    meaning_upright: "Anuncia herencia y cambio positivo.",
    meaning_reversed: "Simboliza falta de comunicación.",
    keywords_upright: ["inspiración", "descubrimiento", "herencia", "cambio"],
    keywords_reversed: ["falta de comunicación", "aislamiento"],
    element: "aire",
    planet: "urano"
  },

  // Noveno Coro (25-27)
  25: {
    name: "Zagzagel",
    hierarchy: "Noveno Coro",
    tier: "Tercera Jerarquía",
    description: "Ángel relacionado con medicina, curaciones y sanaciones.",
    meaning_upright: "Poder sanador y conocimiento médico divino.",
    meaning_reversed: null,
    keywords_upright: ["medicina", "curación", "sanación", "salud"],
    keywords_reversed: [],
    element: "agua",
    planet: "neptuno"
  },

  26: {
    name: "Uriel",
    hierarchy: "Noveno Coro",
    tier: "Tercera Jerarquía", 
    description: "Poseedor de las llaves del Reino. Ángel del Arrepentimiento.",
    meaning_upright: "Representa sanación, reparación y arrepentimiento de errores. Advierte sobre obstáculos que deben superarse.",
    meaning_reversed: null,
    keywords_upright: ["llaves del reino", "arrepentimiento", "sanación", "obstáculos", "reparación"],
    keywords_reversed: [],
    element: "fuego",
    planet: "sol"
  },

  27: {
    name: "Custodio de las Ciudades",
    hierarchy: "Noveno Coro",
    tier: "Tercera Jerarquía",
    description: "Ángel custodio de portones que vela por las comunidades.",
    meaning_upright: "Protección comunitaria y cuidado de los espacios sagrados.",
    meaning_reversed: null,
    keywords_upright: ["custodio", "comunidad", "protección", "portones", "vigilancia"],
    keywords_reversed: [],
    element: "tierra", 
    planet: "saturno"
  },

  // Arcángeles (28-37)
  28: {
    name: "Arcángel Miguel",
    hierarchy: "Arcángeles",
    tier: "Arcángeles",
    description: "Representa justicia y cambios importantes en la vida.",
    meaning_upright: "Ofrece solución a problemas.",
    meaning_reversed: null,
    keywords_upright: ["justicia", "cambios importantes", "solución", "protección"],
    keywords_reversed: [],
    element: "fuego",
    planet: "sol"
  },

  29: {
    name: "Arcángel Gabriel",
    hierarchy: "Arcángeles",
    tier: "Arcángeles", 
    description: "Simboliza el subconsciente y la dualidad entre lo bueno y lo malo.",
    meaning_upright: "Mensajero divino y guía espiritual.",
    meaning_reversed: "Representa injusticia y postergación de cambios necesarios.",
    keywords_upright: ["subconsciente", "dualidad", "mensajes", "guía"],
    keywords_reversed: ["injusticia", "postergación", "resistencia al cambio"],
    element: "agua",
    planet: "luna"
  },

  30: {
    name: "Arcángel Haniel",
    hierarchy: "Arcángeles",
    tier: "Arcángeles",
    description: "Representa lo bueno de la vida: amor, fecundidad, armonía, éxito, abundancia, prosperidad y creatividad.",
    meaning_upright: "Bendiciones abundantes y creatividad divina.",
    meaning_reversed: "Representa lo superfluo y frivolidad.",
    keywords_upright: ["amor", "abundancia", "prosperidad", "creatividad", "armonía"],
    keywords_reversed: ["superficialidad", "frivolidad", "excesos"],
    element: "tierra",
    planet: "venus"
  },

  31: {
    name: "Arcángel Rafael",
    hierarchy: "Arcángeles",
    tier: "Arcángeles",
    description: "Representa fuerza y notoriedad.",
    meaning_upright: "Simboliza personas nobles con capacidad de liderazgo.",
    meaning_reversed: "Representa egoísmo, engaños y frustraciones.",
    keywords_upright: ["fuerza", "notoriedad", "nobleza", "liderazgo", "sanación"],
    keywords_reversed: ["egoísmo", "engaños", "frustraciones"],
    element: "aire",
    planet: "mercurio"
  },

  32: {
    name: "Arcángel Sariel",
    hierarchy: "Arcángeles", 
    tier: "Arcángeles",
    description: "Muestra las órdenes de Dios y es responsable por los ángeles que se apartan de la ley.",
    meaning_upright: "Representa personas líderes y justas. Representa sanación del alma.",
    meaning_reversed: null,
    keywords_upright: ["órdenes divinas", "justicia", "liderazgo", "sanación del alma"],
    keywords_reversed: [],
    element: "fuego",
    planet: "marte"
  },

  33: {
    name: "Arcángel Ragüel",
    hierarchy: "Arcángeles",
    tier: "Arcángeles",
    description: "Vela por la Tierra y el segundo cielo. El Vengador de los Astros.",
    meaning_upright: "Simboliza personas de gran valor moral y equilibradas.",
    meaning_reversed: "Representa falta de equilibrio emocional.",
    keywords_upright: ["vengador", "equilibrio", "valor moral", "justicia cósmica"],
    keywords_reversed: ["desequilibrio emocional", "falta de balance"],
    element: "tierra",
    planet: "saturno"
  },

  34: {
    name: "Arcángel Remiel",
    hierarchy: "Arcángeles",
    tier: "Arcángeles", 
    description: "Ángel de la Misericordia de Dios.",
    meaning_upright: "Representa el espíritu triunfador y autodominio. Muestra mensajes que han estado escondidos durante tiempo.",
    meaning_reversed: "Representa futuro incierto.",
    keywords_upright: ["misericordia", "triunfo", "autodominio", "mensajes ocultos"],
    keywords_reversed: ["futuro incierto", "incertidumbre"],
    element: "agua",
    planet: "neptuno"
  },

  35: {
    name: "Arcángel Raciel",
    hierarchy: "Arcángeles",
    tier: "Arcángeles",
    description: "Ángel de los secretos y misterios.",
    meaning_upright: "Representa espíritu elevado y armonía con el Cosmos.",
    meaning_reversed: "Representa inseguridad, traición y peligro.",
    keywords_upright: ["secretos", "misterios", "espíritu elevado", "armonía cósmica"],
    keywords_reversed: ["inseguridad", "traición", "peligro"],
    element: "aire",
    planet: "urano"
  },

  36: {
    name: "Arcángel Metatron",
    hierarchy: "Arcángeles",
    tier: "Arcángeles",
    description: "Vínculo directo entre Dios y la humanidad. Escriba Celestial.",
    meaning_upright: "Representa fuerza y grandeza.",
    meaning_reversed: "Representa personas ególatras y egoístas.",
    keywords_upright: ["vínculo divino", "escriba celestial", "fuerza", "grandeza"],
    keywords_reversed: ["egolatría", "egoísmo", "soberbia"],
    element: "aire",
    planet: "mercurio"
  },

  37: {
    name: "Arcángel Amiel",
    hierarchy: "Arcángeles",
    tier: "Arcángeles",
    description: "Representa la superación de lo viejo por lo nuevo.",
    meaning_upright: "Simboliza todo lo nuevo e inexplorado.",
    meaning_reversed: "Representa recelo y temor por lo desconocido.",
    keywords_upright: ["renovación", "lo nuevo", "superación", "inexplorado"],
    keywords_reversed: ["recelo", "temor", "resistencia al cambio"],
    element: "aire",
    planet: "urano"
  },

  // Ángeles Representativos (38-66)
  38: {
    name: "Ángeles de la Muerte",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Simboliza cambios radicales y ruptura de relaciones.",
    meaning_upright: "Transformación necesaria y finales que permiten nuevos comienzos.",
    meaning_reversed: "Muestra acontecimientos tristes, muertes o fracasos.",
    keywords_upright: ["transformación", "cambios radicales", "finales", "renovación"],
    keywords_reversed: ["tristeza", "muerte", "fracaso", "pérdida"],
    element: "agua",
    planet: "plutón"
  },

  39: {
    name: "Ángeles de Batalla",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Representa traiciones, disputas y falta de fortuna.",
    meaning_upright: "Muestra personas desagradables y enemigos. No tiene significado invertido.",
    meaning_reversed: null,
    keywords_upright: ["batalla", "conflicto", "enemigos", "disputas"],
    keywords_reversed: [],
    element: "fuego",
    planet: "marte"
  },

  40: {
    name: "Hada de Amor",
    hierarchy: "Hadas",
    tier: "Ángeles Especiales",
    description: "Muestra fidelidad, seguridad y felicidad con la pareja.",
    meaning_upright: "Representa llegada del amor.",
    meaning_reversed: "Muestra rupturas, separaciones y falta de amor.",
    keywords_upright: ["amor", "fidelidad", "felicidad", "pareja", "romance"],
    keywords_reversed: ["ruptura", "separación", "falta de amor"],
    element: "aire",
    planet: "venus"
  },

  41: {
    name: "Hada de la Abundancia",
    hierarchy: "Hadas",
    tier: "Ángeles Especiales",
    description: "Representa buena suerte en aspecto material y buena posición económica.",
    meaning_upright: "Abundancia y prosperidad material.",
    meaning_reversed: "Representa el trabajo necesario para alcanzar metas.",
    keywords_upright: ["abundancia", "suerte", "prosperidad", "posición económica"],
    keywords_reversed: ["trabajo necesario", "esfuerzo requerido"],
    element: "tierra",
    planet: "jupiter"
  },

  42: {
    name: "Hada del Nacimiento",
    hierarchy: "Hadas",
    tier: "Ángeles Especiales",
    description: "Inicio de un nuevo ciclo positivo.",
    meaning_upright: "Representa el nacimiento de un niño.",
    meaning_reversed: "Representa cambios inesperados o problemas repentinos.",
    keywords_upright: ["nacimiento", "nuevo ciclo", "inicio", "fertilidad"],
    keywords_reversed: ["cambios inesperados", "problemas repentinos"],
    element: "agua",
    planet: "luna"
  },

  43: {
    name: "Gnomo del Trabajo",
    hierarchy: "Gnomos",
    tier: "Ángeles Especiales",
    description: "Representa beneficio del esfuerzo hecho y buenos resultados.",
    meaning_upright: "Anuncia nuevo trabajo y bienestar físico y material.",
    meaning_reversed: "Simboliza problemas laborales.",
    keywords_upright: ["trabajo", "esfuerzo", "resultados", "bienestar"],
    keywords_reversed: ["problemas laborales", "dificultades"],
    element: "tierra",
    planet: "saturno"
  },

  44: {
    name: "Gnomo Revoltoso",
    hierarchy: "Gnomos",
    tier: "Ángeles Especiales", 
    description: "Representa diversos problemas según las cartas que lo acompañen.",
    meaning_upright: "Simboliza diversión y adicciones.",
    meaning_reversed: null,
    keywords_upright: ["problemas", "diversión", "adicciones", "caos"],
    keywords_reversed: [],
    element: "tierra",
    planet: "mercurio"
  },

  45: {
    name: "Fantasmita de los Celos",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Representa inseguridad y celos.",
    meaning_upright: "Simboliza angustia por incapacidad de expresar sentimientos.",
    meaning_reversed: "Representa celos justificados e infidelidades.",
    keywords_upright: ["celos", "inseguridad", "angustia", "expresión"],
    keywords_reversed: ["celos justificados", "infidelidad"],
    element: "agua",
    planet: "plutón"
  },

  46: {
    name: "Ángel Cupido",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Representa amor, pasión y armonía entre dos personas.",
    meaning_upright: "Muestra posibles matrimonios o noviazgos.",
    meaning_reversed: "Simboliza infidelidad y rupturas amorosas.",
    keywords_upright: ["amor", "pasión", "armonía", "matrimonio", "noviazgo"],
    keywords_reversed: ["infidelidad", "ruptura amorosa"],
    element: "aire",
    planet: "venus"
  },

  47: {
    name: "Anciano de los Días",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Representa precaución, calma y sentido común.",
    meaning_upright: "Muestra solución a problemas de salud.",
    meaning_reversed: "Representa oscuridad y confusión.",
    keywords_upright: ["precaución", "calma", "sentido común", "salud"],
    keywords_reversed: ["oscuridad", "confusión"],
    element: "tierra",
    planet: "saturno"
  },

  48: {
    name: "El Paraíso",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Representa personas altruistas, bondad y paz de espíritu.",
    meaning_upright: "Simboliza alegría y realización en diversos ámbitos. Muestra inspiración de artistas y buena salud.",
    meaning_reversed: "Representa fracasos, soledad y proyectos truncados.",
    keywords_upright: ["altruismo", "bondad", "paz", "alegría", "realización"],
    keywords_reversed: ["fracaso", "soledad", "proyectos truncados"],
    element: "aire",
    planet: "jupiter"
  },

  49: {
    name: "Ángel del Juicio",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Ángel de la conciencia y lo mental.",
    meaning_upright: "Simboliza inteligencia, conocimiento y equilibrio entre lo bueno y lo malo.",
    meaning_reversed: "Representa falta de discernimiento.",
    keywords_upright: ["juicio", "conciencia", "inteligencia", "equilibrio"],
    keywords_reversed: ["falta de discernimiento", "confusión"],
    element: "aire",
    planet: "mercurio"
  },

  50: {
    name: "Ángel Solar",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Representa luz, paz del espíritu y buenos sentimientos.",
    meaning_upright: "Muestra relaciones exitosas, excelente salud y belleza física.",
    meaning_reversed: "Anuncia futuro oscuro y soledad.",
    keywords_upright: ["luz", "paz", "buenos sentimientos", "salud", "belleza"],
    keywords_reversed: ["futuro oscuro", "soledad"],
    element: "fuego",
    planet: "sol"
  },

  51: {
    name: "Ángel Lunar",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales", 
    description: "Representa desequilibrio y ensueños.",
    meaning_upright: "Simboliza personas preocupadas por lo provisorio. Indica problemas psicológicos.",
    meaning_reversed: "Representa dudas y falsas esperanzas.",
    keywords_upright: ["desequilibrio", "ensueños", "preocupación", "problemas psicológicos"],
    keywords_reversed: ["dudas", "falsas esperanzas"],
    element: "agua",
    planet: "luna"
  },

  52: {
    name: "Ángel de la Enfermedad",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Representa depresión o problemas en la salud que pueden ser superados.",
    meaning_upright: "Advertencia sobre salud que puede transformarse positivamente.",
    meaning_reversed: "Representa inconstancia y falta de superación.",
    keywords_upright: ["enfermedad", "depresión", "superación", "transformación"],
    keywords_reversed: ["inconstancia", "falta de superación"],
    element: "agua",
    planet: "neptuno"
  },

  53: {
    name: "Ángel de la Justicia",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Representa equilibrio en la salud.",
    meaning_upright: "Muestra personas que dan buenos consejos. Puede anunciar divorcio.",
    meaning_reversed: "Representa pérdidas, estafas e incapacidad para comprender.",
    keywords_upright: ["justicia", "equilibrio", "buenos consejos", "divorcio"],
    keywords_reversed: ["pérdidas", "estafas", "incomprensión"],
    element: "aire",
    planet: "libra"
  },

  54: {
    name: "El Elogim de las Aguas",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Representa a personas equilibradas y sensibles.",
    meaning_upright: "Invita a hacer caso a las emociones para ser feliz.",
    meaning_reversed: null,
    keywords_upright: ["equilibrio", "sensibilidad", "emociones", "felicidad"],
    keywords_reversed: [],
    element: "agua",
    planet: "neptuno"
  },

  55: {
    name: "Ángel Star",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Representa esperanza e inspiración.",
    meaning_upright: "Indica el momento cierto, orden y equilibrio. Relacionado con habilidades artísticas.",
    meaning_reversed: "Representa desilusiones y falsas esperanzas.",
    keywords_upright: ["esperanza", "inspiración", "momento cierto", "arte"],
    keywords_reversed: ["desilusiones", "falsas esperanzas"],
    element: "aire",
    planet: "acuario"
  },

  56: {
    name: "Ángel del Amor Masculino",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Anuncia la llegada de un pretendiente con quien habrá relación sentimental.",
    meaning_upright: "Amor masculino y pretendiente.",
    meaning_reversed: null,
    keywords_upright: ["amor masculino", "pretendiente", "relación sentimental"],
    keywords_reversed: [],
    element: "fuego",
    planet: "marte"
  },

  57: {
    name: "Ángel del Amor Femenino",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Representa a una mujer enamorada.",
    meaning_upright: "Invita a decidir con cabeza y corazón.",
    meaning_reversed: null,
    keywords_upright: ["amor femenino", "mujer enamorada", "decisión", "corazón"],
    keywords_reversed: [],
    element: "agua",
    planet: "venus"
  },

  58: {
    name: "Ángel de la Envidia",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Simboliza a personas con malas intenciones.",
    meaning_upright: "Representa resentimiento, celos y envidia.",
    meaning_reversed: "Aumenta el poder de la negatividad.",
    keywords_upright: ["envidia", "malas intenciones", "resentimiento", "celos"],
    keywords_reversed: ["negatividad aumentada", "maldad"],
    element: "agua",
    planet: "escorpio"
  },

  59: {
    name: "Ángel del Sacrificio",
    hierarchy: "Ángeles Representativos", 
    tier: "Ángeles Especiales",
    description: "Representa dudas e indecisiones en terreno afectivo.",
    meaning_upright: "Simboliza sacrificios que deben afrontarse.",
    meaning_reversed: null,
    keywords_upright: ["sacrificio", "dudas", "indecisión", "terreno afectivo"],
    keywords_reversed: [],
    element: "agua",
    planet: "neptuno"
  },

  60: {
    name: "Ángel de los Hijos",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Representa a los hijos del consultante.",
    meaning_upright: "Puede simbolizar hijos por llegar.",
    meaning_reversed: null,
    keywords_upright: ["hijos", "descendencia", "familia", "fertilidad"],
    keywords_reversed: [],
    element: "agua",
    planet: "luna"
  },

  61: {
    name: "Ángel de la Ascensión",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Representa sabiduría, buena conciencia y buenos sentimientos.",
    meaning_upright: "Simboliza evolución y crecimiento espiritual.",
    meaning_reversed: "Representa negación de camino espiritual.",
    keywords_upright: ["ascensión", "sabiduría", "evolución", "crecimiento espiritual"],
    keywords_reversed: ["negación espiritual", "estancamiento"],
    element: "aire",
    planet: "urano"
  },

  62: {
    name: "Ángel del Trono Femenino",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Representa belleza de la mujer casada.",
    meaning_upright: "Simboliza equilibrio, esperanza y sentido común en lo femenino.",
    meaning_reversed: "Representa demora para solucionar problemas.",
    keywords_upright: ["belleza femenina", "matrimonio", "equilibrio", "esperanza"],
    keywords_reversed: ["demora", "problemas sin resolver"],
    element: "tierra",
    planet: "venus"
  },

  63: {
    name: "Ángel del Trono Masculino",
    hierarchy: "Ángeles Representativos",
    tier: "Ángeles Especiales",
    description: "Simboliza a un hombre con gran pericia y conocimiento.",
    meaning_upright: "Liderazgo masculino y sabiduría.",
    meaning_reversed: null,
    keywords_upright: ["pericia", "conocimiento", "liderazgo masculino", "sabiduría"],
    keywords_reversed: [],
    element: "fuego",
    planet: "sol"
  },

  64: {
    name: "Grigori Sexual",
    hierarchy: "Grigori",
    tier: "Ángeles Especiales",
    description: "Representa pasión y deseo sexual.",
    meaning_upright: "Muestra logros por belleza física e indica romance pasajero.",
    meaning_reversed: "Representa exceso de pasiones y libertinaje sexual.",
    keywords_upright: ["pasión", "deseo sexual", "belleza física", "romance"],
    keywords_reversed: ["exceso", "libertinaje", "descontrol sexual"],
    element: "fuego",
    planet: "marte"
  },

  65: {
    name: "Grigori Material",
    hierarchy: "Grigori",
    tier: "Ángeles Especiales",
    description: "Representa personas materialistas y ambiciosas.",
    meaning_upright: "Invita a controlar la ambición.",
    meaning_reversed: null,
    keywords_upright: ["materialismo", "ambición", "control", "posesiones"],
    keywords_reversed: [],
    element: "tierra",
    planet: "capricornio"
  },

  66: {
    name: "Grigori del Poder",
    hierarchy: "Grigori",
    tier: "Ángeles Especiales",
    description: "Representa éxitos conseguidos por fuerza o uso del poder.",
    meaning_upright: "Busca equilibrio para que los buenos tiempos sean duraderos.",
    meaning_reversed: null,
    keywords_upright: ["poder", "éxito", "fuerza", "equilibrio"],
    keywords_reversed: [],
    element: "fuego",
    planet: "plutón"
  },

  // Ángeles Negativos (67-78)
  67: {
    name: "Lucifer",
    hierarchy: "Ángeles Negativos",
    tier: "Ángeles Caídos",
    description: "El primero de los ángeles negativos.",
    meaning_upright: "Simboliza deseo sexual, lujuria y egoísmo. Muestra éxitos materiales conseguidos ilegalmente.",
    meaning_reversed: "Representa desobediencia e intolerancia.",
    keywords_upright: ["lujuria", "egoísmo", "éxitos ilegales", "tentación"],
    keywords_reversed: ["desobediencia", "intolerancia", "rebeldía"],
    element: "fuego",
    planet: "plutón"
  },

  68: {
    name: "Abadon", 
    hierarchy: "Ángeles Negativos",
    tier: "Ángeles Caídos",
    description: "Representa personas influenciables sin seguridad. El rey de las langostas.",
    meaning_upright: "Muestra muchos problemas.",
    meaning_reversed: "Representa intención de superación.",
    keywords_upright: ["influenciable", "inseguridad", "problemas", "destrucción"],
    keywords_reversed: ["intención de superación", "redención"],
    element: "tierra",
    planet: "saturno"
  },

  69: {
    name: "Samael",
    hierarchy: "Ángeles Negativos",
    tier: "Ángeles Caídos",
    description: "Ángel de la Tentación.",
    meaning_upright: "Muestra tentaciones. Simboliza personas adictas a vicios.",
    meaning_reversed: "Representa intentos por superar tentaciones.",
    keywords_upright: ["tentación", "vicios", "adicción", "caída"],
    keywords_reversed: ["superación", "lucha contra vicios"],
    element: "agua",
    planet: "neptuno"
  },

  70: {
    name: "Mastema",
    hierarchy: "Ángeles Negativos",
    tier: "Ángeles Caídos", 
    description: "El Ángel Hechicero.",
    meaning_upright: "Representa personas hostiles y enemigas. Muestra magia.",
    meaning_reversed: "Muestra magia negra y locura.",
    keywords_upright: ["hechicería", "hostilidad", "enemigos", "magia"],
    keywords_reversed: ["magia negra", "locura", "maldad"],
    element: "aire",
    planet: "mercurio"
  },

  71: {
    name: "Carniveau",
    hierarchy: "Ángeles Negativos",
    tier: "Ángeles Caídos",
    description: "El Príncipe de las Moscas.",
    meaning_upright: "Representa magia negra, odio y promiscuidad. Muestra personas de carácter débil.",
    meaning_reversed: "Representa logros de corta duración e infecciones.",
    keywords_upright: ["magia negra", "odio", "promiscuidad", "debilidad"],
    keywords_reversed: ["logros efímeros", "infecciones", "decadencia"],
    element: "agua",
    planet: "plutón"
  },

  72: {
    name: "Mammon",
    hierarchy: "Ángeles Negativos",
    tier: "Ángeles Caídos",
    description: "Representa avaricia, codicia y estafa.",
    meaning_upright: "Simboliza tentación del arribismo por lo material.",
    meaning_reversed: "Representa logro de objetivos por tentaciones.",
    keywords_upright: ["avaricia", "codicia", "estafa", "materialismo"],
    keywords_reversed: ["logros por tentación", "corrupción"],
    element: "tierra",
    planet: "capricornio"
  },

  73: {
    name: "Kemuel",
    hierarchy: "Ángeles Negativos",
    tier: "Ángeles Caídos",
    description: "Ángel que intenta impedir la entrega de la Tora a Moisés.",
    meaning_upright: "Simboliza adversidad, dificultades y retrasos.",
    meaning_reversed: "Representa que se alcanzará el objetivo.",
    keywords_upright: ["adversidad", "dificultades", "retrasos", "impedimentos"],
    keywords_reversed: ["logro de objetivos", "superación"],
    element: "tierra",
    planet: "saturno"
  },

  74: {
    name: "Adrameleck",
    hierarchy: "Ángeles Negativos",
    tier: "Ángeles Caídos",
    description: "Ángel Rey del Fuego.",
    meaning_upright: "Simboliza ansiedad, alteración, angustia y sufrimiento. Muestra problemas en la salud.",
    meaning_reversed: "Simboliza enfermedades mentales.",
    keywords_upright: ["ansiedad", "alteración", "angustia", "problemas de salud"],
    keywords_reversed: ["enfermedades mentales", "desequilibrio"],
    element: "fuego",
    planet: "marte"
  },

  75: {
    name: "Dubbiel",
    hierarchy: "Ángeles Negativos",
    tier: "Ángeles Caídos",
    description: "Representa el orgullo.",
    meaning_upright: "Simboliza soberbia y falta de sentimientos nobles.",
    meaning_reversed: "Simboliza fuerza para vencer sentimientos negativos.",
    keywords_upright: ["orgullo", "soberbia", "falta de nobleza"],
    keywords_reversed: ["fuerza", "vencer negatividad", "humildad"],
    element: "fuego",
    planet: "sol"
  },

  76: {
    name: "Rimmon",
    hierarchy: "Ángeles Negativos",
    tier: "Ángeles Caídos",
    description: "Ángel del Rayo y las Tormentas.",
    meaning_upright: "Representa accidentes, rupturas y peleas.",
    meaning_reversed: "Simboliza accidentes menores y rápida reconciliación.",
    keywords_upright: ["accidentes", "rupturas", "peleas", "tormentas"],
    keywords_reversed: ["accidentes menores", "reconciliación"],
    element: "aire",
    planet: "urano"
  },

  77: {
    name: "Moloch",
    hierarchy: "Ángeles Negativos",
    tier: "Ángeles Caídos",
    description: "Ángel maligno que sacrifica niños en la hoguera.",
    meaning_upright: "Representa personas mentirosas, corruptas y sin escrúpulos. Muestra malos tratos y violencia. No tiene significado invertido.",
    meaning_reversed: null,
    keywords_upright: ["mentira", "corrupción", "violencia", "malos tratos"],
    keywords_reversed: [],
    element: "fuego",
    planet: "plutón"
  },

  78: {
    name: "Malchi Dael",
    hierarchy: "Ángeles Negativos",
    tier: "Ángeles Caídos",
    description: "Simboliza personas con falta de escrúpulos que mienten para conseguir favores.",
    meaning_upright: "Representa manipulación para obtener lo deseado.",
    meaning_reversed: "Simboliza depresión y frustración.",
    keywords_upright: ["falta de escrúpulos", "mentira", "manipulación"],
    keywords_reversed: ["depresión", "frustración"],
    element: "aire",
    planet: "mercurio"
  }
};

// Jerarquía celestial organizada
export const angelicalHierarchy = {
  "Primera Jerarquía": {
    "Serafines": [1, 2, 3],
    "Querubines": [4, 5, 6], 
    "Tronos": [7, 8, 9]
  },
  "Segunda Jerarquía": {
    "Dominaciones": [10, 11, 12],
    "Virtudes": [13, 14, 15],
    "Potestades": [16, 17, 18]
  },
  "Tercera Jerarquía": {
    "Principados": [19, 20, 21],
    "Mensajeros": [22, 23, 24],
    "Noveno Coro": [25, 26, 27]
  },
  "Arcángeles": [28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
  "Ángeles Representativos": {
    "Ángeles Especiales": [38, 39, 47, 48, 49, 50, 51, 52, 53, 54, 55, 58, 59, 60, 61, 62, 63],
    "Hadas": [40, 41, 42],
    "Gnomos": [43, 44], 
    "Ángeles del Amor": [45, 46, 56, 57],
    "Grigori": [64, 65, 66]
  },
  "Ángeles Negativos/Caídos": [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78]
};

// Función para obtener una carta específica
export const getAngelCard = (cardNumber) => {
  return angelsDeck[cardNumber] || null;
};

// Función para obtener cartas por jerarquía
export const getCardsByHierarchy = (hierarchy) => {
  return Object.keys(angelsDeck)
    .map(Number)
    .filter(cardNumber => angelsDeck[cardNumber].hierarchy === hierarchy)
    .map(cardNumber => ({ number: cardNumber, ...angelsDeck[cardNumber] }));
};

// Función para obtener una carta aleatoria
export const getRandomAngelCard = () => {
  const cardNumbers = Object.keys(angelsDeck).map(Number);
  const randomIndex = Math.floor(Math.random() * cardNumbers.length);
  const cardNumber = cardNumbers[randomIndex];
  return { number: cardNumber, ...angelsDeck[cardNumber] };
};

export default {
  angelsDeck,
  angelicalHierarchy,
  getAngelCard,
  getCardsByHierarchy,
  getRandomAngelCard
};