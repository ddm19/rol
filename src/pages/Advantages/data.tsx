// src/data/advantagesDisadvantages.ts

export enum ChoiceTypes {
  Advantage,
  Disadvantage,
}
export interface ChoiceItem {
  id: string;
  title: string;
  description: string | JSX.Element;
  tier: number;
  special?: boolean;
  disabled?: boolean;
  type: ChoiceTypes;
}

export const disadvantages: ChoiceItem[] = [
  {
    id: "d1-1",
    title: "Comportamiento marcial",
    description:
      "Establece un patrón de comportamiento y una consecuencia; tu personaje debe seguir dicho patrón o sufrir la consecuencia.",
    tier: 1,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d1-2",
    title: "Obligación Verbal y Somática",
    description:
      "Necesitas los componentes verbal y somático independientemente del hechizo.",
    tier: 1,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d1-3",
    title: "Patoso",
    description:
      "Desventaja en todas las pruebas de habilidad que requieran Destreza.",
    tier: 1,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d1-4",
    title: "Arma Designada",
    description:
      "Tienes un arma designada; desventaja en cualquier ataque que no sea con ella.",
    tier: 1,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d1-5",
    title: "Feo",
    description: "Desventaja en todas las pruebas de habilidad sociales.",
    tier: 1,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d1-6",
    title: "Insufrible",
    description: "Por algún motivo, le caes mal a la gente.",
    tier: 1,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d1-7",
    title: "Elemento adverso",
    description: (
      <>
        Elige un tipo de daño entre: <span style={{ color: "darkred" }}>Fuego </span>,<span style={{ color: "DarkSlateGray" }}> Perforante , Cortante, Contundente </span>, <span style={{ color: "darkorange" }}>Radiante</span>, <span style={{ color: "darkgreen" }}>Necrótico</span>.
        Eres vulnerable a ese tipo de daño.
      </>
    ),
    tier: 1,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d1-8",
    title: "Otro (DTier 1)",
    description:
      "Crea una nueva desventaja de Tier 1 y espera a que el DM la califique como apta para este tier.",
    tier: 1,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d2-1",
    title: "Lenta Recuperación",
    description:
      "Recuperas solo la mitad de los slots de hechizos en un descanso largo. No se puede escoger si tu clase principal no es caster.",
    tier: 2,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d2-2",
    title: "Enemigo poderoso",
    description:
      "Tienes un enemigo poderoso; alguien fuerte te quiere muerto, establece el por qué.",
    tier: 2,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d2-3",
    title: "Flojucho",
    description:
      "Siempre que tus puntos de golpe se reduzcan a menos de 1/3, tendrás desventaja en todas las tiradas de ataque, salvación y habilidad.",
    tier: 2,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d2-4",
    title: "Desgraciado",
    description: "Todos tus críticos se sustituyen por pifias.",
    tier: 2,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d2-5",
    title: "Deudas",
    description:
      "Le debes mucha pasta a alguien; estableces si es un pago único o te lo solicitan periódicamente.",
    tier: 2,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d2-6",
    title: "Miopía",
    description: (
      <>

        Naciste o tuviste un accidente que te dejó con mala vista. Desventaja en
        ataques y cualquier tirada que requiera de la vista a más de 15 pies.

        <span style={{ color: "darkred", fontWeight: "bold" }}>
          Esta desventaja puede eliminarse con el uso de algún artilugio como
          gafas, monóculos u otro que mejore la vista.
        </span>
      </>
    ),
    tier: 2,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d2-7",
    title: "Curación deficiente",
    description:
      "Las curaciones externas te curan la mitad de lo que deberían. No cuentan las curaciones por descanso.",
    tier: 2,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d2-8",
    title: "Otro (DTier 2)",
    description:
      "Crea una nueva desventaja de Tier 2 y espera a que el DM la califique como apta para este tier.",
    tier: 2,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d3-1",
    title: "Castigo ambicioso",
    description:
      "Cada vez que fallas un ataque recibes daño igual a la diferencia para acertar.",
    tier: 3,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d3-2",
    title: "Resistencia a la curación",
    description: "Da igual por el medio que sea; te curas la mitad.",
    tier: 3,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d3-3",
    title: "Mala suerte",
    description: "Tu pifia se extiende de 1 – 5.",
    tier: 3,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d3-4",
    title: "Adicto",
    description:
      "Tienes una adicción muy fuerte a algo; si no la satisfaces, tu cuerpo sufrirá las consecuencias.",
    tier: 3,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d3-5",
    title: "Sordo o Ciego",
    description: "Eres sordo, ciego o ambas cosas.",
    tier: 3,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d3-6",
    title: "Otro (DTier 3)",
    description:
      "Crea una nueva desventaja de Tier 3 y espera a que el DM la califique como apta para este tier.",
    tier: 3,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d-s1",
    title: "Fobia Incontrolable",
    description:
      "Le tienes mucho miedo a algo; dependiendo de a qué sea, puede cambiar de tier.",
    tier: 0,
    special: true,
    disabled: true,
    type: ChoiceTypes.Disadvantage,
  },
  {
    id: "d-s2",
    title: "Maldición",
    description:
      "Por alguna razón te maldijeron y ahora sufres las consecuencias. Depende de la maldición si cambia de tier.",
    tier: 0,
    special: true,
    disabled: true,
    type: ChoiceTypes.Disadvantage,
  },
];

export const advantages: ChoiceItem[] = [
  {
    id: "v1-1",
    title: "Inquebrantable",
    description:
      "Tienes ventaja en todas las tiradas de salvación para mantener la concentración en hechizos.",
    tier: 1,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v1-2",
    title: "Repetir Tirada",
    description:
      "Puedes repetir los dados de característica de tu personaje o escoger compra de puntos incluso habiendo tirado ya. No se puede escoger más de una vez.",
    tier: 1,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v1-3",
    title: "Sin penalizadores",
    description:
      "Sustituye una puntuación de característica por un 10. No se puede escoger más de una vez.",
    tier: 1,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v1-4",
    title: "Sueño ligero",
    description:
      "Recibes un bono igual a tu nivel a la percepción pasiva mientras duermes.",
    tier: 1,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v1-5",
    title: "Truhán",
    description: "Ventaja en tiradas de Carisma contra el sexo opuesto.",
    tier: 1,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v1-6",
    title: "Resistencia Elemental",
    description:
      (
        <>
          Elige un tipo de daño: <span style={{ color: "darkred" }}>Fuego</span>, <span style={{ color: "DeepSkyBlue" }}>Frío</span>, <span style={{ color: "darkgreen" }}>Ácido/Veneno</span>, <span style={{ color: "DarkSlateGray" }}>Perforante</span>, <span style={{ color: "DarkSlateGray" }}>Cortante</span>, <span style={{ color: "DarkSlateGray" }}>Contundente</span>, <span style={{ color: "yellow" }}>Radiante</span> o <span style={{ color: "DarkOrchid" }}>Necrótico</span>. Eres resistente a ese tipo.
        </>
      ),
    tier: 1,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v1-7",
    title: "El don",
    description:
      "Tienes el don de la magia; puedes ver corrientes mágicas e identificar presencias mágicas, pero no significa que puedas usarla.",
    tier: 1,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v1-8",
    title: "Afinidad con los animales",
    description:
      "Les caes bien a los animales; tratarán de evitar atacarte. Animales entrenados o hostiles no se ven afectados.",
    tier: 1,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v1-9",
    title: "Encantador",
    description:
      "Suelo caer bien; no significa que hagan lo que pidas, pero tienen buena predisposición.",
    tier: 1,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v1-10",
    title: "Erudito",
    description: "Obtén acceso a una lista de conjuros que no es la de tu clase.",
    tier: 1,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v1-11",
    title: "Otro (VTier 1)",
    description:
      "Crea una nueva ventaja de Tier 1 y espera a que el DM la califique como apta para este tier.",
    tier: 1,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v2-1",
    title: "Sobrecarga de Maná",
    description:
      "Tienes 5 puntos que se recuperan cada descanso largo; puedes gastar puntos igual al nivel de un slot de hechizo para recuperar un slot de ese nivel.",
    tier: 2,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v2-2",
    title: "Artefacto",
    description:
      "Elige un objeto mágico de calidad Común, Poco común o Raro; comienzas con dicho objeto. No se puede escoger más de una vez.",
    tier: 2,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v2-3",
    title: "Opcionalidad Verbal y Somática",
    description:
      "No necesitas hablar o gesticular para lanzar hechizos, independientemente de los componentes.",
    tier: 2,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v2-4",
    title: "Familiar",
    description: "Tienes un familiar mágico vinculado a tu alma.",
    tier: 2,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v2-5",
    title: "Aliado Poderoso",
    description:
      "Alguien te debe un favor o te recibe bien; tienes a quién acudir cuando las cosas se ponen feas. Puede dejar de ser así en algún momento.",
    tier: 2,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v2-6",
    title: "Dote",
    description: "Escoge un dote a tu elección; tienes dicho dote.",
    tier: 2,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v2-7",
    title: "Al límite",
    description:
      "Cuando tienes 5 puntos de golpe o menos, duplicas todo el daño que haces.",
    tier: 2,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v2-8",
    title: "Tocado por el destino",
    description:
      "Una vez por partida puedes hacer repetir cualquier tirada de dados. Si la tirada conlleva varios dados, se tiran todos.",
    tier: 2,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v2-9",
    title: "Famoso",
    description:
      "Eres famoso en casi cualquier lugar; puede abrirte puertas o cerrártelas. Te reconocerán donde vayas.",
    tier: 2,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v2-10",
    title: "Otro (VTier 2)",
    description:
      "Crea una nueva ventaja de Tier 2 y espera a que el DM la califique como apta para este tier.",
    tier: 2,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v3-1",
    title: "Legendaria!",
    description:
      "Escoge un objeto mágico legendario a tu elección; comienzas la partida con dicho objeto.",
    tier: 3,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v3-2",
    title: "Millonario",
    description:
      "Tu personaje tiene gran poder adquisitivo de base, monetario o en posesiones; estás podrido de dinero.",
    tier: 3,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v3-3",
    title: "Esponja",
    description:
      "Siempre que recibas curación de una fuente externa, recibes un dado extra de dicha curación.",
    tier: 3,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v3-4",
    title: "Otro (VTier 3)",
    description:
      "Crea una nueva ventaja de Tier 3 y espera a que el DM la califique como apta para este tier.",
    tier: 3,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v-s1",
    title: "Competente",
    description:
      "Ganas una competencia a tu elección; dependiendo de tu clase social, puede cambiar de tier.",
    tier: 0,
    special: true,
    disabled: true,
    type: ChoiceTypes.Advantage,
  },
  {
    id: "v-s2",
    title: "Posición de poder",
    description:
      "Perteneces al clero, nobleza o posición importante; dependiendo de tu clase social, puede cambiar de tier.",
    tier: 0,
    special: true,
    disabled: true,
    type: ChoiceTypes.Advantage,
  },
];
