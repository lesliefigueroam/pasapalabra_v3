import { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Check, X, SkipForward, Copy, Settings, Wifi, WifiOff, Trophy, ChevronRight } from 'lucide-react';
import { db, FIREBASE_CONFIGURED } from '../firebase';
import { ref, onValue, set, get } from 'firebase/database';
import confetti from 'canvas-confetti';

// ─── Roscos (20 roscos, todas las respuestas en español) ──────────────────────
const ROSCOS: Record<string, string>[] = [
  // Rosco 1
  { A:"Empieza con A: Líquido vital que cubre el 70% de la Tierra", B:"Empieza con B: Deporte con pelota naranja y canasta", C:"Empieza con C: Número de colores en un semáforo", D:"Empieza con D: Herramienta para clavar clavos", E:"Empieza con E: Continente donde está España", F:"Empieza con F: Deporte rey del mundo", G:"Empieza con G: Animal doméstico que maúlla", H:"Empieza con H: Agua solidificada por el frío", I:"Empieza con I: País en forma de bota de Europa", J:"Empieza con J: Deporte de combate japonés con cinturón", K:"Empieza con K: Arte marcial de golpes y patadas", L:"Empieza con L: Satélite natural de la Tierra", M:"Empieza con M: Capital de España", N:"Empieza con N: Número después del ocho", Ñ:"Contiene la Ñ: Persona de corta estatura", O:"Empieza con O: Metal precioso de color amarillo", P:"Empieza con P: Fruta alargada amarilla que pelan los monos", Q:"Empieza con Q: Producto lácteo sólido hecho con leche cuajada", R:"Empieza con R: Órgano del cuerpo para respirar", S:"Empieza con S: Estrella del sistema solar", T:"Empieza con T: Bebida caliente de hierbas", U:"Empieza con U: Fruto pequeño morado o verde para hacer vino", V:"Empieza con V: Animal mamífero que da leche y dice mu", W:"Contiene la W: Deporte acuático con tabla y vela", X:"Contiene la X: Instrumento de percusión con láminas de madera", Y:"Empieza con Y: Embarcación de lujo privada", Z:"Empieza con Z: Calzado deportivo para correr" },
  // Rosco 2
  { A:"Empieza con A: Insecto social que produce miel", B:"Empieza con B: Biblioteca portátil electrónica", C:"Empieza con C: Animal felino doméstico que ronronea", D:"Empieza con D: Séptimo día de la semana cristiana", E:"Empieza con E: Animal con trompa y orejas grandes de África", F:"Empieza con F: Mes del año con 28 o 29 días", G:"Empieza con G: Ave de corral que pone huevos y dice clo-clo", H:"Empieza con H: Órgano del cuerpo que bombea sangre", I:"Empieza con I: Arco de siete colores que aparece tras la lluvia", J:"Empieza con J: Deporte con raqueta, red y pelotas amarillas", K:"Empieza con K: Unidad de peso equivalente a mil gramos", L:"Empieza con L: Objeto para leer páginas impresas", M:"Empieza con M: Fruta roja redonda que crece en árboles", N:"Empieza con N: Postre helado con palo de madera", Ñ:"Empieza con Ñ: Animal bovino africano también llamado gnu", O:"Empieza con O: Sentido humano para escuchar sonidos", P:"Empieza con P: Alimento hecho con harina, agua y levadura", Q:"Empieza con Q: Profesional de la medicina que realiza operaciones", R:"Empieza con R: Prenda de vestir femenina que cubre las piernas", S:"Empieza con S: Día que viene después del viernes", T:"Empieza con T: Tela vaquera de color azul para pantalones", U:"Empieza con U: Dedo más grueso y corto de la mano", V:"Empieza con V: Día de la semana que viene antes del sábado", W:"Contiene la W: Sistema operativo de Microsoft para ordenadores", X:"Contiene la X: Deporte de lucha libre con máscara típico de México", Y:"Empieza con Y: Postre lácteo cremoso y espeso", Z:"Empieza con Z: Verdura alargada de color verde claro" },
  // Rosco 3
  { A:"Empieza con A: Reptil americano parecido al cocodrilo", B:"Empieza con B: Deporte de combate con guantes y ring", C:"Empieza con C: Vehículo de cuatro ruedas para transportar personas", D:"Empieza con D: Pieza dental, también llamado muela", E:"Empieza con E: Temporada del año entre invierno y verano con flores", F:"Empieza con F: Documento oficial que acredita algo", G:"Empieza con G: Instrumento musical de seis cuerdas", H:"Empieza con H: Edificio que ofrece hospedaje y alojamiento", I:"Empieza con I: Edificio de hielo construido por pueblos esquimales", J:"Empieza con J: Juego de mesa con tablero de 64 cuadros", K:"Empieza con K: Marsupial australiano que salta con su cría en bolsa", L:"Empieza con L: Lugar de trabajo donde se hacen experimentos científicos", M:"Empieza con M: Mamífero marino muy inteligente que salta y nada", N:"Empieza con N: Barco grande de guerra para combate naval", Ñ:"Contiene la Ñ: Araña muy venenosa de color negro", O:"Empieza con O: Instrumento óptico para ver objetos lejanos", P:"Empieza con P: Profesional de la educación que da clases", Q:"Empieza con Q: Insecto con alas transparentes que zumba", R:"Empieza con R: Comida principal del mediodía", S:"Empieza con S: Reptil sin patas que se arrastra por el suelo", T:"Empieza con T: Mueble de cuatro patas donde se come", U:"Empieza con U: Último planeta del sistema solar", V:"Empieza con V: Instrumento musical de cuerda que se toca con arco", W:"Contiene la W: Bocadillo o emparedado relleno de ingredientes", X:"Contiene la X: Gas noble de la tabla periódica, número 54", Y:"Contiene la Y: Tipo de queso suizo con agujeros", Z:"Empieza con Z: Fruta cítrica grande parecida al limón verde" },
  // Rosco 4
  { A:"Empieza con A: Ave rapaz nocturna con plumas silenciosas", B:"Empieza con B: Lugar donde se guardan y prestan libros", C:"Empieza con C: Metal rojizo conductor de electricidad", D:"Empieza con D: Pieza dental blanca para masticar", E:"Empieza con E: Planta con espinas que vive en el desierto", F:"Empieza con F: Temporada del año con hojas que caen de los árboles", G:"Empieza con G: Primate grande de África occidental", H:"Empieza con H: Instrumento de metal con mango largo para clavar", I:"Empieza con I: Estado de ánimo cuando algo nos enfurece", J:"Empieza con J: Piedra preciosa de color verde intenso", K:"Empieza con K: Arte marcial de origen coreano con patadas altas", L:"Empieza con L: Competición deportiva con varias pruebas", M:"Empieza con M: Construcción funeraria egipcia de forma triangular", N:"Empieza con N: Embarcación grande que navega por el mar", Ñ:"Contiene la Ñ: Bebé que acaba de nacer hace pocos días", O:"Empieza con O: Aparato para observar estrellas y planetas", P:"Empieza con P: Medio de comunicación impreso que se vende diariamente", Q:"Empieza con Q: Acción de romper o destruir algo en pedazos", R:"Empieza con R: Órgano que filtra la sangre y produce orina", S:"Empieza con S: Mamífero grande del océano parecido al delfín", T:"Empieza con T: Deporte con pelota amarilla y raquetas en una pista", U:"Empieza con U: Ciudad capital de Mongolia", V:"Empieza con V: Prenda sin mangas que se lleva sobre la camisa", W:"Contiene la W: Software antivirus para proteger el ordenador", X:"Contiene la X: Tipo de radiografía médica para ver los huesos", Y:"Contiene la Y: Producto lácteo cremoso hecho con leche fermentada", Z:"Empieza con Z: Mamífero africano con rayas negras y blancas" },
  // Rosco 5
  { A:"Empieza con A: País de habla alemana en Europa central", B:"Empieza con B: Planta verde comestible de hojas grandes", C:"Empieza con C: Mamífero équido doméstico que se monta", D:"Empieza con D: Número formado por dos cifras iguales a diez", E:"Empieza con E: Aparato mecánico que sube y baja en edificios", F:"Empieza con F: Ciencia que estudia las fuerzas y el movimiento", G:"Empieza con G: Mamífero africano de cuello muy largo", H:"Empieza con H: Acción de comunicarse oralmente con palabras", I:"Empieza con I: Acción de trasladarse de un lugar a otro", J:"Empieza con J: Prenda de vestir vaquera azul de tela gruesa", K:"Empieza con K: Bebida de hojas verdes muy popular en Asia", L:"Empieza con L: Acción de expulsar lágrimas por los ojos", M:"Empieza con M: Cereal para hacer harina y polenta", N:"Empieza con N: Acción de traer al mundo un nuevo ser vivo", Ñ:"Contiene la Ñ: Montaña o cumbre de gran altitud", O:"Empieza con O: Mamífero carnívoro de pelaje negro y blanco", P:"Empieza con P: Acción de reflexionar con la mente", Q:"Empieza con Q: Acción de retirar o sacar algo de un lugar", R:"Empieza con R: Acción de partir algo en dos partes", S:"Empieza con S: Acción de moverse hacia arriba con los pies", T:"Empieza con T: Acción de entrar en contacto físico con algo", U:"Empieza con U: Acción de emplear o servirse de algo", V:"Empieza con V: Acción de desplazarse por el aire con alas", W:"Contiene la W: Aplicación de videollamadas por internet", X:"Contiene la X: Prefijo de origen griego que significa fuera o exterior", Y:"Contiene la Y: Bebida amarga sudamericana que se toma en mate", Z:"Empieza con Z: Animal volador nocturno con alas de cuero" },
  // Rosco 6
  { A:"Empieza con A: Vehículo que vuela por el cielo con pasajeros", B:"Empieza con B: Instrumento para escribir con tinta en papel", C:"Empieza con C: Insecto de colores vivos con alas de escamas", D:"Empieza con D: Postre dulce que se come después de comer", E:"Empieza con E: Temporada del año con calor, sol y vacaciones", F:"Empieza con F: Recipiente de vidrio o plástico para líquidos", G:"Empieza con G: Animal verde que salta y vive cerca del agua", H:"Empieza con H: Vegetal verde que se usa en ensaladas", I:"Empieza con I: Edificio religioso donde se celebra la misa", J:"Empieza con J: Producto líquido para limpiar la ropa", K:"Empieza con K: Unidad de medida de temperatura absoluta", L:"Empieza con L: Deporte de combate japonés en tatami", M:"Empieza con M: Mamífero australiano que salta y lleva crías en bolsa", N:"Empieza con N: Fruto seco con cáscara dura muy energético", Ñ:"Empieza con Ñ: Ave corredora grande de Sudamérica que no vuela", O:"Empieza con O: Instrumento musical de viento grande y tubos", P:"Empieza con P: Mamífero blanco y negro de China que come bambú", Q:"Empieza con Q: Moneda de cinco centavos de dólar americano", R:"Empieza con R: Instrumento de percusión con membrana de cuero", S:"Empieza con S: Mueble para dormir y descansar por las noches", T:"Empieza con T: Ave grande africana que no vuela y corre muy rápido", U:"Empieza con U: Continente más pequeño del mundo", V:"Empieza con V: Medio de transporte sobre rieles y vías", W:"Contiene la W: Conexión inalámbrica a internet en espacios públicos", X:"Contiene la X: Servicio de transporte privado por aplicación móvil", Y:"Contiene la Y: Metal plateado usado en joyería y monedas", Z:"Empieza con Z: Mamífero salvaje parecido al perro que vive en manadas" },
  // Rosco 7
  { A:"Empieza con A: Fruto seco alargado con cáscara dura marrón", B:"Empieza con B: Vehículo de dos ruedas que se pedalea", C:"Empieza con C: Parte del cuerpo entre la cabeza y los hombros", D:"Empieza con D: Figura geométrica de cuatro lados iguales y cuatro ángulos rectos", E:"Empieza con E: Deporte de montar y galopar sobre caballos", F:"Empieza con F: Aparato eléctrico que produce corriente de aire fresco", G:"Empieza con G: Felino salvaje con manchas negras sobre pelaje amarillo", H:"Empieza con H: Instrumento de metal para clavar y golpear", I:"Empieza con I: Temporada fría del año con nieve y hielo", J:"Empieza con J: Piedra preciosa verde muy valorada en Asia", K:"Empieza con K: Arte marcial coreano de patadas espectaculares", L:"Empieza con L: Competición deportiva olímpica con varias pruebas", M:"Empieza con M: Construcción funeraria de antigua civilización egipcia", N:"Empieza con N: Embarcación muy grande para transportar mercancías", Ñ:"Contiene la Ñ: Niño o niña recién nacida de pocos días de vida", O:"Empieza con O: Instrumento para observar astros del universo", P:"Empieza con P: Medio de comunicación impreso con noticias diarias", Q:"Empieza con Q: Acción de eliminar o borrar algo completamente", R:"Empieza con R: Órgano par del cuerpo humano que filtra la sangre", S:"Empieza con S: Mamífero grande del océano que canta bajo el agua", T:"Empieza con T: Deporte de raqueta en pista con red central", U:"Empieza con U: Ciudad capital de Mongolia en Asia Central", V:"Empieza con V: Prenda de tela sin mangas que cubre el torso", W:"Contiene la W: Software de protección contra virus informáticos", X:"Contiene la X: Tipo de imagen médica que atraviesa el cuerpo", Y:"Contiene la Y: Producto fermentado de leche de vaca o cabra", Z:"Empieza con Z: Tela de algodón gruesa para confeccionar pantalones" },
  // Rosco 8
  { A:"Empieza con A: Tela blanca que los médicos usan para cubrir heridas", B:"Empieza con B: Edificio donde se guarda y gestiona el dinero", C:"Empieza con C: Bebida caliente oscura hecha con granos tostados", D:"Empieza con D: Animal vertebrado acuático que respira por branquias", E:"Empieza con E: Mamífero con trompa que es el animal terrestre más grande", F:"Empieza con F: Ave rosada de patas largas que vive en lagunas", G:"Empieza con G: Roca formada por lava volcánica solidificada", H:"Empieza con H: Corte o excavación en la tierra para plantar", I:"Empieza con I: Acción de crear algo nuevo o mejorar algo existente", J:"Empieza con J: Piedra preciosa verde de gran valor en joyería", K:"Empieza con K: Bebida carbonatada de cola muy popular mundialmente", L:"Empieza con L: Acción de interpretar textos escritos", M:"Empieza con M: Cereal que se usa para hacer palomitas de maíz", N:"Empieza con N: País escandinavo situado al norte de Europa", Ñ:"Contiene la Ñ: Daño físico o lesión en el cuerpo", O:"Empieza con O: Recipiente de barro o cerámica para cocinar", P:"Empieza con P: Animal vertebrado cubierto de plumas con alas", Q:"Empieza con Q: Acción de fracturar o romper un hueso del cuerpo", R:"Empieza con R: Acción de emitir carcajadas de alegría", S:"Empieza con S: Condimento blanco que se añade a la comida para dar sabor", T:"Empieza con T: Animal de caparazón duro que puede vivir cien años", U:"Empieza con U: Ciudad holandesa famosa por su universidad medieval", V:"Empieza con V: Ciudad italiana con canales y góndolas", W:"Contiene la W: Aplicación de mensajería instantánea por el móvil", X:"Contiene la X: Éxito o triunfo conseguido con esfuerzo", Y:"Contiene la Y: Desayuno americano con huevos revueltos y tocino", Z:"Empieza con Z: Animal que aúlla y es pariente del lobo doméstico" },
  // Rosco 9
  { A:"Empieza con A: Color azulado turquesa del mar tropical", B:"Empieza con B: Vaso grande con asa que se usa para beber cerveza", C:"Empieza con C: Fruto del árbol del cacao usado para hacer chocolate", D:"Empieza con D: Bebida energizante con cafeína y vitaminas", E:"Empieza con E: Jefe o director de una empresa o negocio", F:"Empieza con F: Deporte de esgrima con espada y careta protectora", G:"Empieza con G: Primate grande de selva africana, primo del chimpancé", H:"Empieza con H: Tipo de pan con semillas y forma redondeada", I:"Empieza con I: Estado emocional de enfado o rabia intensa", J:"Empieza con J: Acción de divertirse con un juguete o participar en un deporte", K:"Empieza con K: Bebida fermentada de leche originaria de Rusia", L:"Empieza con L: Planeta donde vivimos los seres humanos", M:"Empieza con M: Música grabada en disco de vinilo circular", N:"Empieza con N: Acción de desplazarse en el agua moviendo brazos y piernas", Ñ:"Contiene la Ñ: Compañero con quien se trabaja en la misma empresa", O:"Empieza con O: Mamífero marino enorme también llamado ballena asesina", P:"Empieza con P: Deporte de remar en el agua con paletas", Q:"Empieza con Q: Acción de producir fuego sobre algo para destruirlo", R:"Empieza con R: Órgano vital del cuerpo que nos permite respirar", S:"Empieza con S: Deporte de deslizarse rápido por la nieve con tablas", T:"Empieza con T: Instrumento musical de viento hecho de metal brillante", U:"Empieza con U: Galaxia espiral donde se encuentra nuestro sistema solar", V:"Empieza con V: Deporte de equipo que se juega con pelota sobre red alta", W:"Contiene la W: Navegador de internet de color azul", X:"Contiene la X: Elemento químico gaseoso que respiramos constantemente", Y:"Contiene la Y: Mineral de hierro que se extrae de la tierra", Z:"Empieza con Z: Zapato de madera típico de los países nórdicos" },
  // Rosco 10
  { A:"Empieza con A: Reptil grande acuático con muchos dientes afilados", B:"Empieza con B: Deporte de combate con guantes y árbitro en ring", C:"Empieza con C: Mamífero del desierto con una o dos jorobas", D:"Empieza con D: Moneda oficial de los Estados Unidos de América", E:"Empieza con E: Mamífero con púas que se hace bola para defenderse", F:"Empieza con F: Dulce cremoso que se usa para decorar pasteles", G:"Empieza con G: Prenda de lana para cubrir y calentar las manos", H:"Empieza con H: Elemento químico más abundante del universo", I:"Empieza con I: Parte de la casa donde se cocina y prepara la comida", J:"Empieza con J: Planta tropical con gel medicinal para las quemaduras", K:"Empieza con K: Fruta peluda marrón por fuera y verde por dentro", L:"Empieza con L: Fruta cítrica pequeña de color amarillo o verde", M:"Empieza con M: Mueble grande de madera para guardar la ropa", N:"Empieza con N: Color oscuro como la noche sin luna", Ñ:"Contiene la Ñ: Hermano o hermana del padre o de la madre", O:"Empieza con O: Mamífero del bosque que hiberna y come miel", P:"Empieza con P: Trozo pequeño de pan redondeado para bocadillo", Q:"Empieza con Q: Instrumento de vidrio para medir la temperatura corporal", R:"Empieza con R: Color de la sangre y de las amapolas del campo", S:"Empieza con S: Prenda de dos piezas para dormir cómodamente", T:"Empieza con T: Aparato de comunicación para hablar con personas lejanas", U:"Empieza con U: Parte del cuerpo con cinco dedos para agarrar objetos", V:"Empieza con V: Color morado intenso parecido al de las violetas", W:"Contiene la W: Red social de vídeos cortos muy popular", X:"Contiene la X: Deporte de pelea con guantes grandes y protecciones", Y:"Contiene la Y: Desayuno completo de huevos, salchichas y judías", Z:"Empieza con Z: Calzado con suela de madera o corcho elevado" },
  // Rosco 11
  { A:"Empieza con A: Capital de Australia y ciudad más grande del país", B:"Empieza con B: Instrumento musical de viento de madera con llaves", C:"Empieza con C: Ciudad italiana famosa por el Coliseo y la pasta", D:"Empieza con D: Baile popular de pareja originario de Argentina", E:"Empieza con E: País africano con las pirámides más famosas del mundo", F:"Empieza con F: Instrumento musical de cuerdas con forma de 8", G:"Empieza con G: Ciudad española famosa por la Sagrada Familia", H:"Empieza con H: Personaje bíblico que construyó un arca para el diluvio", I:"Empieza con I: País asiático con el Taj Mahal y muchas especias", J:"Empieza con J: Ciudad capital de Israel en Oriente Medio", K:"Empieza con K: País asiático con Seúl como capital", L:"Empieza con L: Capital de Portugal en la costa atlántica", M:"Empieza con M: País norteafricano con Marrakech y el Sahara", N:"Empieza con N: Río más largo del mundo que atraviesa Egipto", Ñ:"Contiene la Ñ: Personaje de cómic español de los años 80", O:"Empieza con O: Capital de Noruega en Escandinavia", P:"Empieza con P: Ciudad capital de Francia con la Torre Eiffel", Q:"Empieza con Q: Ciudad boliviana con gran altitud sobre el nivel del mar", R:"Empieza con R: Ciudad de Brasil con el Cristo Redentor", S:"Empieza con S: Capital de Chile en Sudamérica", T:"Empieza con T: Ciudad japonesa antes conocida como Edo", U:"Empieza con U: País africano con las cataratas Victoria", V:"Empieza con V: Ciudad italiana con canales y el palacio Ducal", W:"Contiene la W: Ciudad capital de Polonia en Europa Central", X:"Contiene la X: Ciudad mexicana capital del estado de Oaxaca", Y:"Empieza con Y: Ciudad turística de la Riviera Maya en México", Z:"Empieza con Z: Ciudad suiza conocida por sus bancos y relojes" },
  // Rosco 12
  { A:"Empieza con A: Ciencia que estudia los astros y el universo", B:"Empieza con B: Ciencia que estudia los seres vivos y la naturaleza", C:"Empieza con C: Ciencia que estudia la composición de la materia", D:"Empieza con D: Ciencia que estudia los números y las figuras geométricas", E:"Empieza con E: Ciencia que estudia la producción y distribución de riqueza", F:"Empieza con F: Ciencia que estudia las fuerzas y la energía", G:"Empieza con G: Ciencia que estudia la superficie de la Tierra", H:"Empieza con H: Ciencia que estudia los hechos del pasado", I:"Empieza con I: Ciencia aplicada para construir máquinas y edificios", J:"Empieza con J: Disciplina de la razón y el pensamiento filosófico", K:"Empieza con K: Unidad de velocidad usada en navegación marítima", L:"Empieza con L: Ciencia que estudia el lenguaje y los idiomas", M:"Empieza con M: Ciencia que estudia los fenómenos del tiempo atmosférico", N:"Empieza con N: Ciencia que estudia los números enteros y sus propiedades", Ñ:"Contiene la Ñ: Lesión o deterioro en tejido vivo del organismo", O:"Empieza con O: Ciencia que estudia los huesos del cuerpo humano", P:"Empieza con P: Ciencia que estudia la mente y el comportamiento humano", Q:"Empieza con Q: Ciencia experimental que estudia los elementos y reacciones", R:"Empieza con R: Ciencia que estudia la radiación y sus aplicaciones médicas", S:"Empieza con S: Ciencia que estudia la sociedad y sus estructuras", T:"Empieza con T: Ciencia que estudia los seres vivos y sus clasificaciones", U:"Empieza con U: Rama de la medicina que estudia el tracto urinario", V:"Empieza con V: Ciencia que estudia y cuida la salud de los animales", W:"Contiene la W: Diseño de páginas web y sitios en internet", X:"Contiene la X: Técnica médica de imágenes con rayos del mismo nombre", Y:"Contiene la Y: Disciplina espiritual y física originaria de la India", Z:"Empieza con Z: Ciencia que estudia los animales y sus comportamientos" },
  // Rosco 13
  { A:"Empieza con A: Juego de cartas donde no se puede pasar de 21", B:"Empieza con B: Juego de mesa donde se mueven fichas por un tablero", C:"Empieza con C: Juego de estrategia milenario con rey, dama y peones", D:"Empieza con D: Pequeños cubos con puntos del uno al seis para jugar", E:"Empieza con E: Juego de puntería que se lanza al blanco circular", F:"Empieza con F: Juego de naipes donde se apuesta con cartas tapadas", G:"Empieza con G: Juego de destreza con pelotita de colores en agujero", H:"Empieza con H: Juego de cartas en que se reparte una mano a cada jugador", I:"Empieza con I: Juego de palabras donde se adivinan letras de una frase", J:"Empieza con J: Acción de jugar y entretenerse con diversión", K:"Empieza con K: Juego de azar japonés con cartas ilustradas", L:"Empieza con L: Juego de azar donde se sortean números premiados", M:"Empieza con M: Juego de mesa con fichas blancas y negras con puntos", N:"Empieza con N: Juego de naipes donde se apunta el valor de las cartas", Ñ:"Contiene la Ñ: Habilidad o destreza especial para hacer algo bien", O:"Empieza con O: Juego de estrategia con fichas negras y blancas en tablero", P:"Empieza con P: Juego de pelota vasca en frontón con cesta o pala", Q:"Empieza con Q: Juego de quille donde se tiran bolos con una bola", R:"Empieza con R: Juego de ruleta con colores rojo y negro", S:"Empieza con S: Juego de cartas donde se canta cuando completas la mano", T:"Empieza con T: Juego de mesa donde se responden preguntas de cultura", U:"Empieza con U: Juego de cartas con colores y números que se gritan", V:"Empieza con V: Juego donde se voltea el tablero cuando perderás", W:"Contiene la W: Juego de mesa con palabras que forman cruces", X:"Contiene la X: Número romano que vale diez unidades", Y:"Empieza con Y: Juego de habilidad con un disco que sube y baja por un hilo", Z:"Empieza con Z: Juego de relevos donde se pasa un testigo" },
  // Rosco 14
  { A:"Empieza con A: Planeta rojo vecino de la Tierra en el sistema solar", B:"Empieza con B: Constelación con forma de toro en el zodíaco", C:"Empieza con C: Planeta con anillos espectaculares visible desde la Tierra", D:"Empieza con D: Teoría científica del origen de las especies por selección natural", E:"Empieza con E: Período de formación de la Tierra hace millones de años", F:"Empieza con F: Unidad de temperatura usada en países anglosajones", G:"Empieza con G: Astrónomo italiano que observó las lunas de Júpiter con telescopio", H:"Empieza con H: Físico alemán creador de la teoría cuántica", I:"Empieza con I: Científico inglés que formuló la ley de gravedad universal", J:"Empieza con J: Planeta más grande del sistema solar con gran mancha roja", K:"Empieza con K: Unidad absoluta de temperatura equivalente a 273 grados bajo cero", L:"Empieza con L: Físico que propuso la teoría del Big Bang", M:"Empieza con M: Planeta más pequeño y cercano al Sol", N:"Empieza con N: Planeta azul lejano del sistema solar con fuertes vientos", Ñ:"Contiene la Ñ: Instrumento óptico de aumento para observar objetos pequeños", O:"Empieza con O: Planeta del sistema solar con 27 lunas conocidas", P:"Empieza con P: Planeta enano situado más allá de Neptuno reclasificado en 2006", Q:"Empieza con Q: Partícula subatómica que forma los protones y neutrones", R:"Empieza con R: Tipo de radiación electromagnética invisible de alta energía", S:"Empieza con S: Satélite artificial soviético lanzado en 1957, el primero en orbitar", T:"Empieza con T: Instrumento óptico para observar objetos distantes en el cielo", U:"Empieza con U: Planeta que gira de lado con respecto al plano orbital", V:"Empieza con V: Planeta más caliente del sistema solar con atmósfera densa", W:"Contiene la W: Científico que descubrió la doble hélice del ADN", X:"Contiene la X: Tipo de radiación usada en medicina para ver el interior del cuerpo", Y:"Contiene la Y: Sistema de coordenadas matemáticas con dos ejes perpendiculares", Z:"Empieza con Z: Cinturón de constelaciones por donde pasan los planetas" },
  // Rosco 15
  { A:"Empieza con A: Pintor español del Guernica y el cubismo", B:"Empieza con B: Escritor alemán del teatro épico del siglo XX", C:"Empieza con C: Pintor español que pintó la rendición de Breda", D:"Empieza con D: Pintor surrealista español de los relojes blandos", E:"Empieza con E: Escritora inglesa que creó el personaje de Sherlock Holmes, no", F:"Empieza con F: Cantante española conocida como La Faraona del flamenco", G:"Empieza con G: Arquitecto catalán de la Sagrada Familia y el Parque Güell", H:"Empieza con H: Escritor americano de El viejo y el mar", I:"Empieza con I: Pintor renacentista italiano de la Escuela de Atenas", J:"Empieza con J: Escritor checo de La metamorfosis sobre un hombre insecto", K:"Empieza con K: Pintor austriaco del modernismo vienés con El beso", L:"Empieza con L: Escritor colombiano del realismo mágico de Cien años de soledad", M:"Empieza con M: Pintor italiano del Renacimiento autor de la Capilla Sixtina", N:"Empieza con N: Poeta chileno ganador del Premio Nobel de Literatura en 1971", Ñ:"Contiene la Ñ: Baile flamenco de Andalucía con palmas y guitarras", O:"Empieza con O: Compositor alemán de Las cuatro estaciones, no", P:"Empieza con P: Músico y compositor español de guitarra clásica del siglo XX", Q:"Empieza con Q: Escritor español del Siglo de Oro autor de poemas y sátiras", R:"Empieza con R: Pintor renacentista italiano de La Escuela de Atenas en el Vaticano", S:"Empieza con S: Compositor alemán de las Sinfonías y Beethoven es el 9", T:"Empieza con T: Escritor ruso del siglo XIX autor de Guerra y Paz", U:"Empieza con U: Escritor peruano ganador del Premio Nobel de Literatura en 2010", V:"Empieza con V: Pintor holandés postimpresionista de La noche estrellada", W:"Contiene la W: Compositor austriaco de Las bodas de Fígaro y Don Giovanni", X:"Contiene la X: Instrumento de percusión con láminas que aparece en el rosco", Y:"Contiene la Y: Poeta irlandés ganador del Premio Nobel de Literatura", Z:"Empieza con Z: Escultor español del siglo XX famoso por figuras de hojalata" },
  // Rosco 16
  { A:"Empieza con A: Fruta tropical con corona de hojas y pulpa dulce amarilla", B:"Empieza con B: Fruta pequeña azul o negra que crece en arbustos del bosque", C:"Empieza con C: Fruta tropical con leche dentro y pulpa blanca rallada", D:"Empieza con D: Fruta oval y dulce de color marrón que crece en el desierto", E:"Empieza con E: Fruta pequeña verde o negra que se usa para hacer aceite", F:"Empieza con F: Fruta de temporada roja o verde que crece en higueras", G:"Empieza con G: Fruta tropical con piel rugosa amarilla y pulpa agridulce", H:"Empieza con H: Fruta oval tropical con piel verde y pulpa blanca cremosa", I:"Empieza con I: Fruta pequeña ácida de la India usada en chutneys", J:"Empieza con J: Árbol cítrico sin fruto propio, pero sus hojas tienen nombre", K:"Empieza con K: Fruta pequeña marrón peluda con interior verde y negro", L:"Empieza con L: Fruta cítrica amarilla muy ácida", M:"Empieza con M: Fruta tropical carnosa de color amarillo anaranjado", N:"Empieza con N: Fruta cítrica pequeña de piel fácil de pelar", Ñ:"Contiene la Ñ: Fruta pequeña roja parecida a la cereza tropical", O:"Empieza con O: Fruta cítrica redonda de color naranja", P:"Empieza con P: Fruta de piel rugosa amarilla o verde con pepitas negras", Q:"Empieza con Q: Árbol frutal de flores rosadas y fruto amarillo perfumado", R:"Empieza con R: Fruta roja pequeña en ramillete que crece en arbustos", S:"Empieza con S: Fruta tropical grande con piel verde a rayas y pulpa roja", T:"Empieza con T: Fruta subtropical con piel rugosa verde y pulpa blanda", U:"Empieza con U: Fruto pequeño morado o verde de la vid", V:"Empieza con V: Fruta larga verde de la familia del pepino", W:"Contiene la W: Variedad de sandía pequeña originaria de Asia", X:"Contiene la X: Árbol frutal cítrico de China con frutos pequeños", Y:"Empieza con Y: Fruta tropical grande verde por fuera con pulpa cremosa", Z:"Empieza con Z: Fruto del zarzal rojo parecido a la mora de forma cónica" },
  // Rosco 17
  { A:"Empieza con A: Deporte olímpico de lanzar una jabalina o disco", B:"Empieza con B: Deporte de raqueta con volante en lugar de pelota", C:"Empieza con C: Deporte de equipo con casco y balón ovalado americano", D:"Empieza con D: Deporte de saltar desde un trampolín al agua", E:"Empieza con E: Deporte ecuestre de saltar obstáculos con un caballo", F:"Empieza con F: Deporte con arco y flechas en pista de tiro", G:"Empieza con G: Deporte de palos y hoyos en campo de hierba", H:"Empieza con H: Deporte de equipo sobre hielo con palo y disco", I:"Empieza con I: Deporte de regata en barcos de vela", J:"Empieza con J: Arte marcial japonés de sumo y llaves al suelo", K:"Empieza con K: Deporte de vela individual sobre tabla en el mar", L:"Empieza con L: Deporte de combate griego olímpico en colchoneta", M:"Empieza con M: Deporte de velocidad en motos de gran cilindrada", N:"Empieza con N: Deporte de natación y atletismo juntos más ciclismo", Ñ:"Contiene la Ñ: Acción de competir con otros para ganar un trofeo", O:"Empieza con O: Deporte de remo en bote con ocho remeros y timonel", P:"Empieza con P: Deporte de mesa con paletas y pelota blanca muy pequeña", Q:"Empieza con Q: Deporte de atletismo de saltar con una pértiga", R:"Empieza con R: Deporte de raqueta en pista cerrada de cuatro paredes", S:"Empieza con S: Deporte de deslizarse en tabla por las olas del mar", T:"Empieza con T: Deporte de combate con espadas y trajes blancos", U:"Empieza con U: Deporte de carreras en ciclismo en pista cubierta", V:"Empieza con V: Deporte de equipo con pelota sobre red en playa o sala", W:"Contiene la W: Deporte de surf en tabla con vela y arnés al cuerpo", X:"Contiene la X: Deporte de skateboard en rampas y obstáculos urbanos", Y:"Empieza con Y: Deporte acuático de navegación en embarcación de vela", Z:"Empieza con Z: Deporte de tiro al plato con escopeta y platillos" },
  // Rosco 18
  { A:"Empieza con A: Profesional de la construcción de edificios y espacios", B:"Empieza con B: Profesional que atiende a clientes en el mostrador de bebidas", C:"Empieza con C: Profesional que cocina en restaurantes y hoteles", D:"Empieza con D: Profesional de la salud dental que cuida los dientes", E:"Empieza con E: Profesional que redacta y publica noticias en medios", F:"Empieza con F: Profesional que toma fotografías para publicaciones o eventos", G:"Empieza con G: Profesional que conduce y pilota grandes aviones", H:"Empieza con H: Profesional de la salud que atiende a pacientes", I:"Empieza con I: Profesional que diseña y construye puentes y máquinas", J:"Empieza con J: Profesional que decide sobre asuntos legales en un tribunal", K:"Empieza con K: Profesional de arte marcial que enseña a sus alumnos", L:"Empieza con L: Profesional que asesora y defiende en asuntos legales", M:"Empieza con M: Profesional que estudia los movimientos del mercado financiero", N:"Empieza con N: Profesional sanitario que cuida y atiende a los enfermos", Ñ:"Contiene la Ñ: Persona que viaja habitualmente al trabajo en tren", O:"Empieza con O: Profesional del teatro o del cine que interpreta personajes", P:"Empieza con P: Profesional que enseña a alumnos en escuela o instituto", Q:"Empieza con Q: Profesional que prepara y despacha medicamentos en farmacia", R:"Empieza con R: Profesional que trabaja arreglando tuberías y fontanería", S:"Empieza con S: Profesional que cose y confecciona prendas de vestir", T:"Empieza con T: Profesional que conduce taxis y transporta pasajeros", U:"Empieza con U: Profesional de la medicina especializado en las vías urinarias", V:"Empieza con V: Profesional que cuida la salud de los animales", W:"Contiene la W: Profesional que diseña páginas y aplicaciones web", X:"Contiene la X: Profesional que realiza radiografías y otras pruebas de imagen", Y:"Empieza con Y: Instructor o maestro de yoga y meditación", Z:"Empieza con Z: Profesional que cuida y alimenta a los animales del zoo" },
  // Rosco 19
  { A:"Empieza con A: Instrumento musical de teclado y fuelles portátil", B:"Empieza con B: Instrumento de percusión mayor con dos parches que se golpea", C:"Empieza con C: Instrumento de cuerda pulsada con caja de resonancia y mástil largo", D:"Empieza con D: Instrumento de percusión pequeño con membrana que se golpea", E:"Empieza con E: Instrumento musical que necesita amplificación eléctrica para sonar", F:"Empieza con F: Instrumento musical de viento madera que se sopla lateralmente", G:"Empieza con G: Instrumento de cuerda pulsada con seis cuerdas y caja resonadora", H:"Empieza con H: Instrumento de cuerda con forma triangular y muchas cuerdas", I:"Empieza con I: Instrumento musical electrónico que imita muchos sonidos", J:"Empieza con J: Conjunto de instrumentos de percusión que toca un solo músico", K:"Empieza con K: Instrumento de percusión africano formado por un cajón de madera", L:"Empieza con L: Instrumento de cuerda pulsada de la Edad Media con forma de pera", M:"Empieza con M: Instrumento de viento metal que produce un sonido muy grave", N:"Empieza con N: Instrumento indio de cuerdas simpáticas con resonadores de calabaza", Ñ:"Contiene la Ñ: Instrumento de cuerda pequeño de cuatro cuerdas hawaiano", O:"Empieza con O: Instrumento de teclado grande de tubos que suena en las catedrales", P:"Empieza con P: Instrumento de teclado de 88 teclas que se toca con los dedos", Q:"Empieza con Q: Instrumento de viento madera con lengüeta simple y sonido melancólico", R:"Empieza con R: Instrumento de percusión pequeño que se agita haciendo ruido", S:"Empieza con S: Instrumento de viento metal con forma curva y llaves metálicas", T:"Empieza con T: Instrumento de percusión formado por una membrana tensa y circular", U:"Empieza con U: Instrumento de cuerda pequeño de cuatro cuerdas originario de Hawái", V:"Empieza con V: Instrumento de cuerda frotada que se apoya en el hombro izquierdo", W:"Contiene la W: Instrumento de viento metal de la familia de la tuba", X:"Contiene la X: Instrumento de percusión con láminas de madera o metal", Y:"Contiene la Y: Instrumento de percusión africano formado por un tronco hueco", Z:"Empieza con Z: Instrumento de cuerdas pulsadas de Europa Central" },
  // Rosco 20
  { A:"Empieza con A: País más grande del mundo por superficie en Asia", B:"Empieza con B: País de América del Sur con el río Amazonas", C:"Empieza con C: País asiático más poblado del mundo con la Gran Muralla", D:"Empieza con D: País nórdico europeo con Copenhague como capital", E:"Empieza con E: País sudamericano bañado por el océano Pacífico con Quito", F:"Empieza con F: País europeo con la Torre Eiffel y los Campos Elíseos", G:"Empieza con G: País africano occidental con Accra como capital", H:"Empieza con H: País europeo que incluye las ciudades de Budapest y Debrecen", I:"Empieza con I: País de Oceanía con los canguros y la Gran Barrera de Coral", J:"Empieza con J: País asiático insular con el monte Fuji y los samuráis", K:"Empieza con K: País africano oriental con Nairobi como capital", L:"Empieza con L: País sudamericano con Buenos Aires, no es Argentina sino...", M:"Empieza con M: País norteafricano con el Sahara y Casablanca", N:"Empieza con N: País africano más populoso del mundo con Lagos", Ñ:"Contiene la Ñ: Etnia indígena de los Andes con gran herencia cultural", O:"Empieza con O: País de Oceanía con Wellington como capital", P:"Empieza con P: País asiático con Islamabad como capital y frontera con India", Q:"Empieza con Q: Emirato árabe del Golfo Pérsico con Doha como capital", R:"Empieza con R: País europeo del este con Bucarest como capital", S:"Empieza con S: País asiático insular con Singapur ciudad-estado como capital", T:"Empieza con T: País asiático con Bangkok como capital y templos budistas", U:"Empieza con U: País de África Oriental con Kampala como capital", V:"Empieza con V: País sudamericano bañado por el mar Caribe con Caracas", W:"Contiene la W: País de Oceanía con Samoa como parte de su nombre", X:"Contiene la X: País donde se habla luxemburgués y tiene Luxemburgo capital", Y:"Empieza con Y: País de Oriente Medio con Saná como capital", Z:"Empieza con Z: País africano austral con las cataratas Victoria y elefantes" },
];

const ANSWERS: Record<string, string>[] = [
  { A:"Agua", B:"Baloncesto", C:"Tres", D:"Martillo", E:"Europa", F:"Fútbol", G:"Gato", H:"Hielo", I:"Italia", J:"Judo", K:"Karate", L:"Luna", M:"Madrid", N:"Nueve", Ñ:"Niño / Enano", O:"Oro", P:"Plátano", Q:"Queso", R:"Pulmón", S:"Sol", T:"Té", U:"Uva", V:"Vaca", W:"Windsurf", X:"Xilófono", Y:"Yate", Z:"Zapatilla" },
  { A:"Abeja", B:"Libro electrónico / eBook", C:"Gato", D:"Domingo", E:"Elefante", F:"Febrero", G:"Gallina", H:"Corazón", I:"Iris / Arcoíris", J:"Tenis", K:"Kilogramo", L:"Libro", M:"Manzana", N:"Helado", Ñ:"Ñu", O:"Oído", P:"Pan", Q:"Cirujano / Quirúrgico", R:"Falda", S:"Sábado", T:"Tejano / Tela vaquera", U:"Pulgar", V:"Viernes", W:"Windows", X:"Lucha libre", Y:"Yogur", Z:"Zanahoria / Zucchini" },
  { A:"Aligátor / Caimán", B:"Boxeo", C:"Coche", D:"Diente / Muela", E:"Primavera", F:"Factura / Ficha", G:"Guitarra", H:"Hotel", I:"Iglú", J:"Jaque / Ajedrez", K:"Koala / Canguro", L:"Laboratorio", M:"Marsopa / Delfín", N:"Navío / Navío de guerra", Ñ:"Araña venenosa / Viuda negra", O:"Ojo de aumento / Telescopio", P:"Profesor", Q:"Queja / Quiróptero", R:"Rancho / Restaurante", S:"Serpiente", T:"Table / Mesa de comedor", U:"Urano", V:"Violín / Viola", W:"Bocadillo / Sándwich", X:"Xenón", Y:"Queso con agujeros / Yorkshire", Z:"Zumo de limón / Lima" },
  { A:"Búho / Lechuza", B:"Biblioteca", C:"Cobre", D:"Diente / Muela", E:"Primavera", F:"Otoño", G:"Gorila", H:"Martillo", I:"Ira / Enfado", J:"Jade / Joya verde", K:"Taekwondo", L:"Ligas / Liga deportiva", M:"Mastaba / Pirámide", N:"Navío", Ñ:"Niño recién nacido", O:"Ojo / Telescopio", P:"Periódico", Q:"Quiebra / Quebrarse", R:"Riñón", S:"Serpiente / Ballena", T:"Tenis", U:"Ulán Bator", V:"Verdugo / Chaqueta sin mangas", W:"Antivirus / Windows Defender", X:"Radiografía", Y:"Yogur", Z:"Cebra" },
  { A:"Austria", B:"Lechuga / Brécol", C:"Caballo", D:"Diez / Docena", E:"Elevador / Ascensor", F:"Física", G:"Jirafa", H:"Hablar / Habla", I:"Ir / Marcha", J:"Pantalón vaquero / Jeans", K:"Té verde / Matcha", L:"Llorar / Llanto", M:"Maíz", N:"Nacer / Nacimiento", Ñ:"Montaña / Peña", O:"Oso", P:"Pensar / Pensamiento", Q:"Quitar", R:"Romper", S:"Saltar", T:"Tocar", U:"Usar", V:"Volar", W:"Videollamada / WhatsApp", X:"Exterior / Extra", Y:"Mate / Yerba mate", Z:"Murciélago" },
  { A:"Avión", B:"Bolígrafo", C:"Catarina / Mariposa", D:"Dulce / Postre", E:"Verano", F:"Frasco / Frasquito", G:"Rana / Sapo", H:"Hojas verdes / Lechuga", I:"Iglesia", J:"Jabón / Jabonoso", K:"Kelvin", L:"Lucha / Luchador", M:"Marsupial / Canguro", N:"Nuez", Ñ:"Ñandú", O:"Órgano", P:"Panda", Q:"Quinto / Cinco centavos", R:"Redoble / Redoblante", S:"Sofá / Sofa-cama", T:"Toro / Avestruz", U:"Último continente / Australia", V:"Vagón / Tren", W:"Wifi inalámbrico", X:"Uber / Taxi", Y:"Plata / Yod", Z:"Perro salvaje / Licaón" },
  { A:"Almendra", B:"Bicicleta", C:"Cuello", D:"Diamante / Cuadrado", E:"Equitación", F:"Abanico / Fan", G:"Guepardo / Leopardo", H:"Golpe / Martillo", I:"Invierno", J:"Jade", K:"Taekwondo / Kárate", L:"Ligas olímpicas", M:"Mastaba / Pirámide", N:"Navío grande", Ñ:"Niño/a neonato/a", O:"Observatorio / Telescopio", P:"Periódico diario", Q:"Quitar / Quebrarse", R:"Riñón", S:"Cetáceo / Ballena azul", T:"Tenis", U:"Ulán Bator", V:"Vest / Chaleco", W:"Antivirus informático", X:"Rayos X", Y:"Yogur cremoso", Z:"Tela gruesa / Lona vaquera" },
  { A:"Apósito / Venda", B:"Banco", C:"Café", D:"Delfín / Pez", E:"Elefante africano", F:"Flamenco ave", G:"Granito / Lava volcánica", H:"Hoyo / Surco", I:"Inventar / Innovación", J:"Jade / Joya verde", K:"Coca-cola / Refresco de cola", L:"Lectura", M:"Maíz palomitas", N:"Noruega", Ñ:"Daño / Herida", O:"Olla de barro", P:"Pájaro / Plumas", Q:"Quebrarse / Fractura", R:"Reír / Risa", S:"Sal", T:"Tortuga", U:"Utrech ciudad holandesa", V:"Venecia", W:"Whatsapp", X:"Éxito / Triunfo", Y:"Desayuno completo", Z:"Perro salvaje / Coyote" },
  { A:"Aguamarina / Turquesa", B:"Jarra de cerveza", C:"Cacao", D:"Drinkito / Bebida energizante", E:"Empresario / Ejecutivo", F:"Florete / Esgrima", G:"Gorila", H:"Hogaza / Pan redondo", I:"Ira", J:"Jugar / Juego", K:"Kéfir", L:"La Tierra", M:"Música en vinilo / Disco", N:"Nadar / Natación", Ñ:"Colega / Compañero trabajo", O:"Orca", P:"Paleta / Piraguismo", Q:"Quemar / Combustión", R:"Respiración / Pulmón", S:"Esquí / Skiing", T:"Trompeta", U:"Universo / Vía Láctea", V:"Voleibol", W:"Chrome / Navegador", X:"Oxígeno", Y:"Mineral de hierro", Z:"Zueco nórdico" },
  { A:"Aligátor / Cocodrilo", B:"Boxeo", C:"Camello", D:"Dólar", E:"Erizo", F:"Fondant / Flan", G:"Guante de lana", H:"Hidrógeno", I:"Instalaciones / Cocina", J:"Jabón / Aloe vera", K:"Kiwi", L:"Limón / Lima", M:"Mueble / Guardarropa", N:"Negro", Ñ:"Tío o Tía", O:"Oso", P:"Panecillo", Q:"Quito / Termómetro", R:"Rojo", S:"Siesta / Pijama", T:"Teléfono", U:"Mano / Uña", V:"Violeta morado", W:"YouTube / TikTok", X:"Boxeo", Y:"Desayuno inglés", Z:"Zueco de madera" },
  { A:"Sídney", B:"Oboe / Clarinete", C:"Roma", D:"Tango", E:"Egipto", F:"Violín", G:"Barcelona", H:"Noé", I:"India", J:"Jerusalén", K:"Corea del Sur", L:"Lisboa", M:"Marruecos", N:"Nilo", Ñ:"Mortadelo / Peñín", O:"Oslo", P:"París", Q:"Quito / Sucre", R:"Río de Janeiro", S:"Santiago", T:"Tokio", U:"Uganda / Victoria", V:"Venecia", W:"Varsovia", X:"Oaxaca", Y:"Yucatán / Cancún", Z:"Zúrich" },
  { A:"Astronomía", B:"Biología", C:"Química", D:"Matemáticas", E:"Economía", F:"Física", G:"Geografía", H:"Historia", I:"Ingeniería", J:"Lógica / Filosofía", K:"Nudo marino", L:"Lingüística", M:"Meteorología", N:"Teoría de números", Ñ:"Lesión / Daño tisular", O:"Osteología", P:"Psicología", Q:"Química", R:"Radiología", S:"Sociología", T:"Taxonomía / Biología", U:"Urología", V:"Veterinaria", W:"Diseño web", X:"Radiografía", Y:"Yoga", Z:"Zoología" },
  { A:"Blackjack / Veintiuno", B:"Parchís / Backgammon", C:"Ajedrez", D:"Dado", E:"Dardos", F:"Póker", G:"Golf en miniatura", H:"Póker de mano", I:"Ahorcado", J:"Jugar", K:"Karuta japonés", L:"Lotería", M:"Dominó", N:"Nap / Naipe de puntos", Ñ:"Maña / Destreza", O:"Othello / Reversi", P:"Pelota vasca / Jai alai", Q:"Quilles / Bolos", R:"Ruleta", S:"Solitario / Snap", T:"Trivial Pursuit", U:"Uno", V:"Voltea el tablero", W:"Scrabble", X:"Número romano diez", Y:"Yoyó", Z:"Relevo" },
  { A:"Marte", B:"Tauro", C:"Saturno", D:"Darwin / Evolución", E:"Eón geológico", F:"Fahrenheit", G:"Galileo Galilei", H:"Heisenberg", I:"Isaac Newton", J:"Júpiter", K:"Cero absoluto / Kelvin", L:"Lemaître", M:"Mercurio", N:"Neptuno", Ñ:"Microscopio", O:"Urano", P:"Plutón", Q:"Quark", R:"Rayos gamma / Radiación", S:"Sputnik", T:"Telescopio", U:"Urano", V:"Venus", W:"Watson y Crick", X:"Rayos X", Y:"Eje de coordenadas", Z:"Zodiaco" },
  { A:"Picasso", B:"Brecht", C:"Velázquez", D:"Dalí", E:"Agatha Christie", F:"Lola Flores", G:"Gaudí", H:"Hemingway", I:"Rafael Sanzio", J:"Kafka", K:"Klimt", L:"García Márquez", M:"Miguel Ángel", N:"Neruda", Ñ:"Sevillanas / Bulerías", O:"Vivaldi", P:"Paco de Lucía", Q:"Quevedo", R:"Rafael Sanzio", S:"Beethoven / Sinfonía", T:"Tolstói", U:"Vargas Llosa", V:"Van Gogh", W:"Mozart", X:"Xilófono musical", Y:"Yeats", Z:"Zurbarán" },
  { A:"Piña / Ananá", B:"Arándano", C:"Coco", D:"Dátil", E:"Aceituna / Oliva", F:"Higo", G:"Pomelo / Grapefruit", H:"Guanábana", I:"Tamarindo", J:"Jazmín árbol", K:"Kiwi", L:"Limón", M:"Mango", N:"Mandarina / Naranjita", Ñ:"Guinda tropical", O:"Naranja", P:"Papaya / Maracuyá", Q:"Membrillo", R:"Grosella roja", S:"Sandía", T:"Tamarillo", U:"Uva", V:"Calabacín / Pepino largo", W:"Pequeña sandía asiática", X:"Kumquat", Y:"Aguacate / Avocado", Z:"Zarza mora / Frambuesa cónica" },
  { A:"Atletismo", B:"Bádminton", C:"Fútbol americano", D:"Natación sincronizada", E:"Equitación / Salto ecuestre", F:"Tiro con arco", G:"Golf", H:"Hockey hielo", I:"Regata a vela", J:"Judo sobre colchoneta", K:"Kitesurf", L:"Lucha grecorromana", M:"Motociclismo / MotoGP", N:"Natación triatlón", Ñ:"Competición / Campeonato", O:"Remo en ocho", P:"Ping-pong / Tenis mesa", Q:"Pértiga / Salto con pértiga", R:"Raquetbol / Squash", S:"Surf", T:"Esgrima con espada", U:"Velódromo / Ciclismo pista", V:"Vóleibol", W:"Windsurf con arnés", X:"Skate extremo", Y:"Vela / Yate", Z:"Tiro al plato" },
  { A:"Arquitecto", B:"Barista / Bartender", C:"Chef / Cocinero", D:"Dentista", E:"Redactor / Periodista", F:"Fotógrafo", G:"Piloto", H:"Médico", I:"Ingeniero", J:"Juez", K:"Maestro de kárate", L:"Letrado / Abogado", M:"Gestor de mercados", N:"Nurse / Enfermero", Ñ:"Viajero de cercanías", O:"Actor", P:"Profesor", Q:"Químico / Farmacéutico", R:"Fontanero / Plomero", S:"Sastre / Costurera", T:"Taxista", U:"Urólogo", V:"Veterinario", W:"Webmaster / Desarrollador web", X:"Técnico en radiología", Y:"Instructor de yoga", Z:"Cuidador de zoológico" },
  { A:"Acordeón", B:"Bombo", C:"Cítara / Contrabajo", D:"Djembé / Tamborilete", E:"Guitarra eléctrica", F:"Flauta travesera", G:"Guitarra clásica", H:"Arpa", I:"Instrumento electrónico", J:"Batería completa", K:"Cajón peruano", L:"Laúd", M:"Tuba / Bombardino", N:"Sitar indio", Ñ:"Ukelele", O:"Órgano de tubos", P:"Piano", Q:"Clarinete", R:"Maraca / Sonajero", S:"Saxofón", T:"Timbal / Tambor", U:"Ukelele hawaiano", V:"Violín", W:"Trombón / Wagner tuba", X:"Xilófono / Marimba", Y:"Yembe / Djembé africano", Z:"Cítara centroeuropea" },
  { A:"Rusia", B:"Brasil", C:"China", D:"Dinamarca", E:"Ecuador", F:"Francia", G:"Ghana", H:"Hungría", I:"Australia", J:"Japón", K:"Kenia", L:"Uruguay", M:"Marruecos", N:"Nigeria", Ñ:"Pueblo quechua / inca", O:"Nueva Zelanda", P:"Pakistán", Q:"Qatar", R:"Rumanía", S:"Singapur", T:"Tailandia", U:"Uganda", V:"Venezuela", W:"Samoa Occidental", X:"Luxemburgo", Y:"Yemen", Z:"Zimbabue" },
];


// ─── Tipos ─────────────────────────────────────────────────────────────────────

const ALPHABET = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','Ñ','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

type LetterStatus = 'pending' | 'correct' | 'incorrect' | 'passed';
type Role = 'lobby' | 'animator' | 'team1' | 'team2' | 'public' | 'admin';
type TournamentMode = 'single' | 'bo3' | 'bo5' | 'grandslam';
type SyncMode = 'firebase' | 'local';

interface TournamentConfig {
  mode: TournamentMode;
  label: string;
  gamesNeeded: number; // partidas para ganar el torneo
  totalGames: number;  // máximo de partidas
}

const TOURNAMENT_MODES: TournamentConfig[] = [
  { mode: 'single',    label: 'Partida Normal',     gamesNeeded: 1, totalGames: 1 },
  { mode: 'bo3',       label: 'Master (Mejor de 3)', gamesNeeded: 2, totalGames: 3 },
  { mode: 'bo5',       label: 'Grand Slam (Mejor de 5)', gamesNeeded: 3, totalGames: 5 },
  { mode: 'grandslam', label: 'Tour (Mejor de 7)',   gamesNeeded: 4, totalGames: 7 },
];

interface GameResult {
  team1Score: number;
  team2Score: number;
  winner: 1 | 2 | 'tie';
  rosco1: number;
  rosco2: number;
  duration: number; // segundos
}

interface TeamState {
  letterStatus: Record<string, LetterStatus>;
  letterIndex: number;
  timeLeft: number;
  roscoIndex: number;
  score: number;
}

interface GameState {
  roomCode: string;
  teamNames: [string, string];
  currentTeam: 1 | 2;
  isRunning: boolean;
  gameStarted: boolean;
  gameFinished: boolean;
  nextRoscoPosition: number;
  team1: TeamState;
  team2: TeamState;
  // Torneo
  tournament: TournamentConfig;
  tournamentWins: [number, number];  // wins por equipo
  gameHistory: GameResult[];
  gameStartTime: number; // timestamp ms
  showSummary: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeTeamState = (roscoIndex: number): TeamState => ({
  letterStatus: Object.fromEntries(ALPHABET.map(l => [l, 'pending' as LetterStatus])),
  letterIndex: 0,
  timeLeft: 180,
  roscoIndex,
  score: 0,
});

const makeInitialGameState = (roomCode: string, teamNames: [string, string], tournament?: TournamentConfig): GameState => ({
  roomCode, teamNames,
  currentTeam: 1, isRunning: false, gameStarted: false, gameFinished: false, nextRoscoPosition: 2,
  team1: makeTeamState(0), team2: makeTeamState(1),
  tournament: tournament ?? TOURNAMENT_MODES[0],
  tournamentWins: [0, 0],
  gameHistory: [],
  gameStartTime: 0,
  showSummary: false,
});

const visualStatus = (s: LetterStatus): 'pending' | 'correct' | 'incorrect' =>
  s === 'passed' ? 'pending' : s;

const isAnswerable = (s: LetterStatus) => s === 'pending' || s === 'passed';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const generateCode = () =>
  Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)]).join('');

const STORAGE_KEY = (code: string) => `pasapalabra_room_${code}`;
const saveLocal  = (s: GameState) => { try { localStorage.setItem(STORAGE_KEY(s.roomCode), JSON.stringify(s)); } catch {} };
const loadLocal  = (code: string): GameState | null => {
  try { const r = localStorage.getItem(STORAGE_KEY(code)); return r ? JSON.parse(r) : null; } catch { return null; }
};

// ─── Firebase sync ────────────────────────────────────────────────────────────

function useGameSync(roomCode: string) {
  const [gameState, setGameState] = useState<GameState | null>(() => loadLocal(roomCode));
  const [syncMode]  = useState<SyncMode>(FIREBASE_CONFIGURED ? 'firebase' : 'local');
  const channelRef  = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (!FIREBASE_CONFIGURED || !db || roomCode === 'ADMIN') return;
    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsub = onValue(roomRef, snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val() as GameState;
        setGameState(data);
        saveLocal(data);
      }
    });
    return unsub;
  }, [roomCode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (FIREBASE_CONFIGURED || roomCode === 'ADMIN') return;
    const ch = new BroadcastChannel(`pasapalabra_${roomCode}`);
    channelRef.current = ch;
    ch.onmessage = (e: MessageEvent) => {
      if (e.data?.roomCode) { setGameState(e.data as GameState); saveLocal(e.data as GameState); }
    };
    return () => { ch.close(); channelRef.current = null; };
  }, [roomCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const broadcast = useCallback((updater: (prev: GameState) => GameState) => {
    setGameState(prev => {
      if (!prev) return prev;
      const next = updater(prev);
      saveLocal(next);
      if (FIREBASE_CONFIGURED && db) {
        set(ref(db, `rooms/${next.roomCode}`), next).catch(console.error);
      } else {
        channelRef.current?.postMessage(next);
      }
      return next;
    });
  }, []);

  return { gameState, broadcast, syncMode };
}

async function createRoom(state: GameState): Promise<void> {
  saveLocal(state);
  if (FIREBASE_CONFIGURED && db) await set(ref(db, `rooms/${state.roomCode}`), state);
}

async function joinRoom(code: string): Promise<GameState | null> {
  if (FIREBASE_CONFIGURED && db) {
    try { const snap = await get(ref(db, `rooms/${code}`)); if (snap.exists()) return snap.val() as GameState; } catch {}
  }
  return loadLocal(code);
}

// ─── Rosco visual ─────────────────────────────────────────────────────────────

function RoscoWheel({ team, currentLetterIndex, gameStarted, size = 'lg' }: {
  team: TeamState; currentLetterIndex: number; gameStarted: boolean; size?: 'lg' | 'sm';
}) {
  const dim = size === 'lg' ? 'w-10 h-10 text-sm' : 'w-6 h-6 text-xs';
  return (
    <div className={`relative w-full aspect-square ${size === 'sm' ? 'max-w-xs' : 'max-w-lg'} mx-auto`}>
      {ALPHABET.map((letter, index) => {
        const angle = (index / ALPHABET.length) * Math.PI * 2;
        const r = 40;
        const x = 50 + Math.cos(angle - Math.PI / 2) * r;
        const y = 50 + Math.sin(angle - Math.PI / 2) * r;
        const ds = visualStatus(team.letterStatus[letter]);
        const isCurrent = index === currentLetterIndex && gameStarted;
        return (
          <div key={letter}
            className={`absolute flex items-center justify-center font-bold rounded-full transition-all duration-300
              ${dim}
              ${isCurrent ? 'ring-4 ring-purple-500 scale-125 z-10' : ''}
              ${ds === 'correct'   ? 'bg-green-500 text-white shadow-lg' : ''}
              ${ds === 'incorrect' ? 'bg-red-500 text-white shadow-lg' : ''}
              ${ds === 'pending'   ? 'bg-gradient-to-br from-purple-200 to-blue-200 text-gray-700 shadow-md' : ''}
            `}
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}
          >
            {letter}
          </div>
        );
      })}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
        <span className="text-white font-black text-xl">{team.score}</span>
      </div>
    </div>
  );
}

// ─── Modal de resumen de partida ───────────────────────────────────────────────

// ─── Celebración: sonido + confetti ──────────────────────────────────────────

// Genera todos los sonidos via Web Audio API — sin archivos externos
function playSound(type: 'win' | 'tie' | 'partial') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const play = (freq: number, start: number, dur: number, vol = 0.35, wave: OscillatorType = 'sine') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    };

    if (type === 'win') {
      // Fanfarria de victoria: acorde ascendente + redoble final
      play(523, 0.00, 0.18, 0.4);                    // Do
      play(659, 0.18, 0.18, 0.4);                    // Mi
      play(784, 0.36, 0.18, 0.4);                    // Sol
      play(1047, 0.54, 0.35, 0.45);                  // Do alto
      play(784, 0.54, 0.35, 0.3);                    // Sol (armonía)
      play(523, 0.54, 0.35, 0.25);                   // Do (armonía)
      // Redoble final
      play(1175, 0.95, 0.12, 0.35);
      play(1319, 1.10, 0.12, 0.35);
      play(1568, 1.25, 0.45, 0.5);
      play(1319, 1.25, 0.45, 0.3);
      play(1047, 1.25, 0.45, 0.2);
    } else if (type === 'partial') {
      // Fin de partida parcial: tres notas ascendentes breves
      play(440, 0.00, 0.15, 0.3);
      play(554, 0.18, 0.15, 0.3);
      play(659, 0.36, 0.25, 0.35);
    } else {
      // Empate: dos notas simétricas (subida + bajada)
      play(523, 0.00, 0.20, 0.3);
      play(659, 0.22, 0.20, 0.3);
      play(523, 0.44, 0.30, 0.3);
    }
  } catch {
    // El navegador puede bloquear AudioContext si no hay interacción previa — silencio seguro
  }
}

// Lanza cotillones adaptados al resultado
function launchConfetti(type: 'win' | 'tie' | 'partial', winnerSide?: 'left' | 'right') {
  if (type === 'partial') {
    // Partida intermedia: lluvia suave desde arriba
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.3 },
      colors: ['#a855f7', '#7c3aed', '#ddd6fe', '#c4b5fd'],
    });
    return;
  }

  if (type === 'tie') {
    // Empate: lluvia simétrica desde ambos lados en grises y morados
    confetti({ particleCount: 50, angle: 60,  spread: 55, origin: { x: 0, y: 0.6 }, colors: ['#94a3b8','#cbd5e1','#a855f7'] });
    confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: ['#94a3b8','#cbd5e1','#a855f7'] });
    return;
  }

  // Victoria: cañón de cotillones desde el lado del ganador + lluvia central
  const side = winnerSide ?? 'left';
  const angleMain = side === 'left' ? 60 : 120;
  const xMain = side === 'left' ? 0 : 1;
  const colors = side === 'left'
    ? ['#3b82f6','#60a5fa','#93c5fd','#fbbf24','#fde68a'] // azul/dorado
    : ['#22c55e','#4ade80','#86efac','#fbbf24','#fde68a']; // verde/dorado

  // Primera ráfaga
  confetti({ particleCount: 120, angle: angleMain, spread: 60, origin: { x: xMain, y: 0.6 }, colors });

  // Segunda ráfaga a los 400ms
  setTimeout(() => {
    confetti({ particleCount: 80, angle: angleMain, spread: 50, origin: { x: xMain, y: 0.55 }, colors, startVelocity: 45 });
  }, 400);

  // Lluvia central con brillo
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { x: 0.5, y: 0.2 },
      colors: [...colors, '#ffffff'],
      shapes: ['circle', 'square'],
      scalar: 1.1,
    });
  }, 700);

  // Última ráfaga lateral
  setTimeout(() => {
    confetti({ particleCount: 60, angle: angleMain, spread: 70, origin: { x: xMain, y: 0.7 }, colors, startVelocity: 30 });
  }, 1100);
}

function GameSummaryModal({ gameState, onContinue }: {
  gameState: GameState;
  onContinue: () => void;
}) {
  const lastResult = gameState.gameHistory[gameState.gameHistory.length - 1];
  if (!lastResult) return null;

  const [t1wins, t2wins] = gameState.tournamentWins;
  const { tournament, teamNames } = gameState;
  const isTournamentOver =
    t1wins >= tournament.gamesNeeded || t2wins >= tournament.gamesNeeded ||
    gameState.gameHistory.length >= tournament.totalGames;
  const tournamentWinner = t1wins > t2wins ? 0 : t2wins > t1wins ? 1 : -1;
  const gameWinner = lastResult.winner;

  // Determinar tipo de celebración
  const isFinalCelebration = isTournamentOver || tournament.mode === 'single';
  const celebrationType: 'win' | 'tie' | 'partial' =
    isFinalCelebration
      ? (gameWinner === 'tie' ? 'tie' : 'win')
      : (gameWinner === 'tie' ? 'tie' : 'partial');
  const winnerSide: 'left' | 'right' | undefined =
    gameWinner === 1 ? 'left' : gameWinner === 2 ? 'right' : undefined;

  // Lanzar celebración al montar
  useEffect(() => {
    // Pequeño delay para que el modal sea visible antes de los cotillones
    const t1 = setTimeout(() => launchConfetti(celebrationType, winnerSide), 150);
    const t2 = setTimeout(() => playSound(celebrationType), 100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className={`px-8 py-6 text-white text-center ${
          gameWinner === 'tie' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' :
          gameWinner === 1 ? 'bg-gradient-to-r from-blue-600 to-blue-700' :
          'bg-gradient-to-r from-green-600 to-green-700'
        }`}>
          {/* Emoji animado según resultado */}
          <div className={`text-5xl mb-2 ${isFinalCelebration && gameWinner !== 'tie' ? 'animate-bounce' : ''}`}>
            {isFinalCelebration && gameWinner !== 'tie' ? '🏆' : gameWinner === 'tie' ? '🤝' : '🏅'}
          </div>
          <p className="text-sm font-semibold opacity-80 uppercase tracking-widest mb-1">
            {isTournamentOver
              ? '🎉 Fin del torneo'
              : tournament.mode === 'single'
              ? '🏁 Fin de la partida'
              : `Partida ${gameState.gameHistory.length} de ${tournament.totalGames} · ${tournament.label}`}
          </p>
          <h2 className="text-3xl font-black">
            {isTournamentOver && tournamentWinner >= 0
              ? `¡${teamNames[tournamentWinner]} gana el ${tournament.label}!`
              : isTournamentOver && tournamentWinner === -1
              ? '¡Torneo empatado!'
              : gameWinner === 'tie'
              ? '¡Empate en esta partida!'
              : `¡${teamNames[gameWinner === 1 ? 0 : 1]} gana la partida!`}
          </h2>
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Marcador de la partida */}
          <div className="grid grid-cols-3 items-center gap-2">
            <div className="text-center">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{teamNames[0]}</p>
              <p className="text-5xl font-black text-blue-600">{lastResult.team1Score}</p>
              <p className="text-xs text-gray-400 mt-1">aciertos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-300">VS</p>
              <p className="text-xs text-gray-400 mt-1">{formatTime(180 - Math.min(lastResult.duration, 179))}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{teamNames[1]}</p>
              <p className="text-5xl font-black text-green-600">{lastResult.team2Score}</p>
              <p className="text-xs text-gray-400 mt-1">aciertos</p>
            </div>
          </div>

          {/* Progreso del torneo (si no es partida única) */}
          {tournament.mode !== 'single' && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center mb-3">
                {tournament.label} — Victorias
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 text-center">
                  <p className="text-sm font-bold text-blue-600">{teamNames[0]}</p>
                  <div className="flex justify-center gap-1 mt-1.5">
                    {Array.from({ length: tournament.gamesNeeded }).map((_, i) => (
                      <div key={i} className={`w-5 h-5 rounded-full border-2 ${
                        i < t1wins ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                      }`} />
                    ))}
                  </div>
                </div>
                <span className="text-gray-400 font-bold">–</span>
                <div className="flex-1 text-center">
                  <p className="text-sm font-bold text-green-600">{teamNames[1]}</p>
                  <div className="flex justify-center gap-1 mt-1.5">
                    {Array.from({ length: tournament.gamesNeeded }).map((_, i) => (
                      <div key={i} className={`w-5 h-5 rounded-full border-2 ${
                        i < t2wins ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Historial de partidas — siempre visible */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Historial del torneo</p>
            <div className="space-y-1">
              {gameState.gameHistory.map((r, i) => (
                <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-2 text-sm ${i === gameState.gameHistory.length - 1 ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
                  <span className="text-gray-500 font-medium">Partida {i + 1}</span>
                  <span className={`font-black text-base ${r.winner === 1 ? 'text-blue-600' : r.winner === 2 ? 'text-green-600' : 'text-gray-500'}`}>
                    {r.team1Score} — {r.team2Score}
                  </span>
                  <span className={`text-xs font-semibold ${r.winner === 'tie' ? 'text-gray-400' : r.winner === 1 ? 'text-blue-500' : 'text-green-500'}`}>
                    {r.winner === 'tie' ? 'Empate' : `✓ ${teamNames[r.winner === 1 ? 0 : 1]}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Botón continuar */}
          <button onClick={onContinue}
            className="w-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2">
            {isTournamentOver ? (
              <>🏠 Volver al inicio</>
            ) : (
              <>🎯 Elegir roscos para la partida {gameState.gameHistory.length + 1} <ChevronRight className="w-5 h-5"/></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Hook de audio ────────────────────────────────────────────────────────────
//
//  Maneja:
//  • Música de fondo en loop (se pausa/reanuda con el juego)
//  • Tick-tock acelerado cuando quedan ≤10 segundos
//  • Sonido de tiempo agotado al llegar a 0

function playTimeUp() {
  // Sirena descendente tipo "buzzzer" de concurso de TV
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const buzz = (freq: number, start: number, dur: number, vol = 0.5) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      // Distorsión suave con wave shaper
      const dist = ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 256 - 1;
        curve[i] = (Math.PI + 100) * x / (Math.PI + 100 * Math.abs(x));
      }
      dist.curve = curve;
      osc.connect(dist); dist.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      // Descenso rápido de frecuencia (efecto "game over")
      osc.frequency.exponentialRampToValueAtTime(freq * 0.3, ctx.currentTime + start + dur);
      gain.gain.setValueAtTime(vol, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    };

    // Tres "bzzz" descendentes superpuestos
    buzz(440, 0.00, 0.55, 0.45);
    buzz(220, 0.00, 0.55, 0.25);
    buzz(440, 0.60, 0.55, 0.40);
    buzz(220, 0.60, 0.55, 0.20);
    buzz(440, 1.20, 0.80, 0.50);
    buzz(220, 1.20, 0.80, 0.28);
  } catch { /* silencio si el navegador bloquea */ }
}

function playTick(isUrgent: boolean) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.value = isUrgent ? 1200 : 800;
    gain.gain.setValueAtTime(isUrgent ? 0.15 : 0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.07);
  } catch { /* silencio */ }
}

// Música de fondo — corre mientras el juego esté activo.
// NO se pausa cuando el animador pausa: la pausa es para interactuar con
// los participantes, la música sigue sonando para el ambiente.
// Solo se detiene al terminar la partida (fade out) o en el pre-game.
function useBgMusic(gameStarted: boolean, gameFinished: boolean) {
  const bgRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/audio/loop_mixdown.mp3');
    audio.loop   = true;
    audio.volume = 0.35;
    bgRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  // Arrancar cuando el juego empieza, sin importar pausa
  useEffect(() => {
    const audio = bgRef.current;
    if (!audio) return;
    if (gameStarted && !gameFinished) {
      audio.play().catch(() => {});
    } else if (!gameStarted) {
      // Pre-game: detener inmediatamente
      audio.pause();
      audio.currentTime = 0;
    }
  }, [gameStarted, gameFinished]);

  // Fade out al terminar la partida
  useEffect(() => {
    const audio = bgRef.current;
    if (!audio || !gameFinished) return;
    const fade = setInterval(() => {
      if (audio.volume > 0.02) {
        audio.volume = Math.max(0, audio.volume - 0.03);
      } else {
        audio.pause();
        audio.volume = 0.35;
        clearInterval(fade);
      }
    }, 80);
    return () => clearInterval(fade);
  }, [gameFinished]);
}

// Efectos de sonido — tick-tock y tiempo agotado.
// Estos SÍ dependen de isRunning: no tiene sentido hacer tick cuando está pausado.
function useSoundEffects(gameStarted: boolean, isRunning: boolean, gameFinished: boolean, timeLeft: number) {
  const timeUpFired = useRef<boolean>(false);

  useEffect(() => {
    if (!isRunning || !gameStarted || gameFinished) {
      timeUpFired.current = false;
      return;
    }
    if (timeLeft === 0 && !timeUpFired.current) {
      timeUpFired.current = true;
      playTimeUp();
      return;
    }
    if (timeLeft > 0 && timeLeft <= 10) {
      playTick(timeLeft <= 5);
    }
    if (timeLeft > 10) {
      timeUpFired.current = false;
    }
  }, [timeLeft, isRunning, gameStarted, gameFinished]);
}

// ─── Lógica de juego ──────────────────────────────────────────────────────────

function useGameLogic(gameState: GameState | null, broadcast: (updater: (prev: GameState) => GameState) => void) {

  useEffect(() => {
    if (!gameState?.isRunning || !gameState?.gameStarted || gameState?.gameFinished) return;
    const id = setInterval(() => {
      broadcast(prev => {
        if (!prev.isRunning || !prev.gameStarted || prev.gameFinished) return prev;
        const t = prev.currentTeam;
        const team = t === 1 ? prev.team1 : prev.team2;
        if (team.timeLeft <= 1) {
          return doSwitchTeam({ ...prev, [t === 1 ? 'team1' : 'team2']: { ...team, timeLeft: 0 } });
        }
        const updated = { ...team, timeLeft: team.timeLeft - 1 };
        return t === 1 ? { ...prev, team1: updated } : { ...prev, team2: updated };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [gameState?.isRunning, gameState?.gameStarted, gameState?.gameFinished, gameState?.currentTeam]); // eslint-disable-line react-hooks/exhaustive-deps

  const findNext = (status: Record<string, LetterStatus>, from: number): number | null => {
    let next = (from + 1) % ALPHABET.length;
    for (let i = 0; i < ALPHABET.length; i++) {
      if (isAnswerable(status[ALPHABET[next]])) return next;
      next = (next + 1) % ALPHABET.length;
    }
    return null;
  };

  const maxPossible = (team: TeamState): number =>
    ALPHABET.filter(l => isAnswerable(team.letterStatus[l])).length;

  // Devuelve true si el resultado ya está matemáticamente decidido:
  // un equipo no puede alcanzar ni empatar al otro aunque acierte todo lo que le queda.
  const isResultDecided = (gs: GameState): boolean => {
    const t1max = gs.team1.score + maxPossible(gs.team1);
    const t2max = gs.team2.score + maxPossible(gs.team2);
    // Equipo 2 ya no puede alcanzar ni empatar a equipo 1
    if (t2max < gs.team1.score) return true;
    // Equipo 1 ya no puede alcanzar ni empatar a equipo 2
    if (t1max < gs.team2.score) return true;
    return false;
  };

  const checkGameFinished = (gs: GameState): GameState => {
    const t1done = ALPHABET.every(l => !isAnswerable(gs.team1.letterStatus[l]));
    const t2done = ALPHABET.every(l => !isAnswerable(gs.team2.letterStatus[l]));

    // Caso 1: ambos equipos agotaron sus letras → fin normal
    if (t1done && t2done) return finishGame(gs);

    // Caso 2: el resultado está matemáticamente decidido → fin anticipado
    if (isResultDecided(gs)) return finishGame(gs);

    return gs;
  };

  const finishGame = (gs: GameState): GameState => {
    const winner: 1 | 2 | 'tie' =
      gs.team1.score > gs.team2.score ? 1 :
      gs.team2.score > gs.team1.score ? 2 : 'tie';

    const result: GameResult = {
      team1Score: gs.team1.score,
      team2Score: gs.team2.score,
      winner,
      rosco1: gs.team1.roscoIndex,
      rosco2: gs.team2.roscoIndex,
      duration: Math.round((Date.now() - gs.gameStartTime) / 1000),
    };

    const newWins: [number, number] = [
      gs.tournamentWins[0] + (winner === 1 ? 1 : 0),
      gs.tournamentWins[1] + (winner === 2 ? 1 : 0),
    ];

    return {
      ...gs,
      isRunning: false,
      gameFinished: true,
      showSummary: true,
      tournamentWins: newWins,
      gameHistory: [...gs.gameHistory, result],
    };
  };

  const doSwitchTeam = (gs: GameState): GameState => {
    const current = gs.currentTeam;
    const next = (current === 1 ? 2 : 1) as 1 | 2;
    const nextTeam = next === 1 ? gs.team1 : gs.team2;
    const nextTeamDone = ALPHABET.every(l => !isAnswerable(nextTeam.letterStatus[l]));

    // Si el equipo que recibiría el turno ya no tiene letras por responder,
    // el equipo activo sigue jugando solo — no se cambia el turno.
    // Ejemplo: eq2 terminó → eq1 falla → eq1 sigue jugando hasta terminar o decidirse.
    if (nextTeamDone) {
      return checkGameFinished({ ...gs, isRunning: true });
    }

    return checkGameFinished({ ...gs, currentTeam: next, isRunning: true });
  };

  function handleAnswerFn(status: 'correct' | 'incorrect' | 'passed') {
    return (prev: GameState): GameState => {
      if (prev.gameFinished) return prev;
      const t = prev.currentTeam;
      const team = t === 1 ? prev.team1 : prev.team2;
      const letter = ALPHABET[team.letterIndex];
      const updatedStatus = { ...team.letterStatus, [letter]: status };
      const nextIdx = findNext(updatedStatus, team.letterIndex);
      const updatedTeam = { ...team, letterStatus: updatedStatus, letterIndex: nextIdx ?? team.letterIndex };

      if (status === 'correct') {
        const scored = { ...updatedTeam, score: updatedTeam.score + 1 };
        const ns = t === 1 ? { ...prev, team1: scored } : { ...prev, team2: scored };
        // Si aún hay letras para el equipo activo, sigue su turno — pero primero
        // comprobar si el rival ya no tiene posibilidad de ganar
        if (nextIdx !== null) return checkGameFinished({ ...ns, isRunning: true });
        // El equipo activo terminó su rosco → doSwitchTeam decide si el otro juega o se acaba
        return doSwitchTeam({ ...ns, isRunning: true });
      } else {
        const ns = t === 1 ? { ...prev, team1: updatedTeam } : { ...prev, team2: updatedTeam };
        return doSwitchTeam(ns);
      }
    };
  }

  const handleAnswer = (status: 'correct' | 'incorrect' | 'passed') => broadcast(handleAnswerFn(status));
  const teamPass = (teamNumber: 1 | 2) => broadcast(prev => {
    if (prev.currentTeam !== teamNumber || !prev.isRunning || prev.gameFinished) return prev;
    return handleAnswerFn('passed')(prev);
  });
  const togglePause = () => broadcast(prev => ({ ...prev, isRunning: !prev.isRunning }));

  const startGame = (rosco1: number, rosco2: number, tournamentCfg?: TournamentConfig) => broadcast(prev => ({
    ...prev,
    gameStarted: true,
    gameFinished: false,
    isRunning: true,
    showSummary: false,
    gameStartTime: Date.now(),
    tournament: tournamentCfg ?? prev.tournament,
    team1: { ...makeTeamState(rosco1), score: 0 },
    team2: { ...makeTeamState(rosco2), score: 0 },
  }));

  // Vuelve al menú pre-game para seleccionar el rosco de la siguiente partida.
  // El torneo continúa (las victorias se mantienen, el historial se acumula).
  const returnToPreGame = () => broadcast(prev => ({
    ...prev,
    currentTeam: 1,
    isRunning: false,
    gameStarted: false,
    gameFinished: false,
    showSummary: false,
    team1: makeTeamState(prev.team1.roscoIndex), // mantener roscoIndex hasta que se elija otro
    team2: makeTeamState(prev.team2.roscoIndex),
  }));

  const endTournament = () => broadcast(prev => ({ ...prev, showSummary: true }));

  const resetGame = () => broadcast(prev => ({
    ...prev, currentTeam: 1, isRunning: false, gameStarted: false, gameFinished: false,
    showSummary: false, nextRoscoPosition: 2, tournamentWins: [0, 0], gameHistory: [],
    team1: makeTeamState(0), team2: makeTeamState(1),
  }));

  return { handleAnswer, teamPass, togglePause, startGame, returnToPreGame, endTournament, resetGame };
}

// ─── Vista: Lobby ─────────────────────────────────────────────────────────────

function LobbyView({ onJoin }: { onJoin: (role: Role, code: string, teamNames?: [string,string]) => void }) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinRole, setJoinRole] = useState<'team1' | 'team2' | 'public'>('team1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!team1Name.trim() || !team2Name.trim()) { setError('Ponle nombre a ambos equipos'); return; }
    setLoading(true);
    const code = generateCode();
    const state = makeInitialGameState(code, [team1Name.trim(), team2Name.trim()]);
    await createRoom(state);
    setLoading(false);
    onJoin('animator', code, [team1Name.trim(), team2Name.trim()]);
  };

  const handleJoin = async () => {
    const code = joinCode.toUpperCase().trim();
    if (code.length !== 4) { setError('El código tiene 4 letras'); return; }
    setLoading(true);
    const room = await joinRoom(code);
    setLoading(false);
    if (!room) { setError('Sala no encontrada. ¿El animador ya creó la partida?'); return; }
    onJoin(joinRole, code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-purple-900 mb-2">🎯 Pasapalabra</h1>
        <p className="text-center text-gray-400 mb-4 text-sm">Juego en equipo</p>
        <div className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mx-auto w-fit mb-6 ${FIREBASE_CONFIGURED ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {FIREBASE_CONFIGURED
            ? <><Wifi className="w-3 h-3" /> Conectado a Firebase — funciona en internet</>
            : <><WifiOff className="w-3 h-3" /> Modo local — solo misma red WiFi</>}
        </div>
        <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
          {(['create','join'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white shadow text-purple-700' : 'text-gray-500'}`}>
              {t === 'create' ? '✨ Crear sala' : '🔗 Unirse'}
            </button>
          ))}
        </div>
        {tab === 'create' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre Equipo 1</label>
              <input value={team1Name} onChange={e => { setTeam1Name(e.target.value); setError(''); }}
                placeholder="Ej: Los Tigres"
                className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-3 text-lg outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre Equipo 2</label>
              <input value={team2Name} onChange={e => { setTeam2Name(e.target.value); setError(''); }}
                placeholder="Ej: Los Leones"
                className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-3 text-lg outline-none transition-colors" />
            </div>
            <button onClick={handleCreate} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 active:scale-95 text-white py-4 rounded-xl font-bold text-lg transition-all">
              {loading ? 'Creando...' : 'Crear como Animador 🎙️'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Código de sala</label>
              <input value={joinCode} onChange={e => { setJoinCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="XXXX" maxLength={4}
                className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-3 text-3xl font-black text-center tracking-widest outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Entrar como</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { r: 'team1', label: '⚡ Equipo 1' },
                  { r: 'team2', label: '🔥 Equipo 2' },
                  { r: 'public', label: '📺 Público' },
                ] as const).map(({ r, label }) => (
                  <button key={r} onClick={() => setJoinRole(r)}
                    className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all
                      ${joinRole === r ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleJoin} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 active:scale-95 text-white py-4 rounded-xl font-bold text-lg transition-all">
              {loading ? 'Buscando sala...' : 'Unirse'}
            </button>
          </div>
        )}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm text-center">{error}</div>
        )}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <button onClick={() => onJoin('admin', 'ADMIN')}
            className="text-xs text-gray-300 hover:text-purple-400 flex items-center gap-1 mx-auto transition-colors">
            <Settings className="w-3 h-3" /> Modo Super Admin
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Vista: Animador ──────────────────────────────────────────────────────────

function AnimatorView({ gameState, roomCode, logic, syncMode }: {
  gameState: GameState; roomCode: string;
  logic: ReturnType<typeof useGameLogic>;
  syncMode?: SyncMode;
}) {
  const { handleAnswer, togglePause, startGame, returnToPreGame, resetGame } = logic;
  const [copied, setCopied] = useState(false);
  const [rosco1, setRosco1] = useState(gameState.team1.roscoIndex);
  const [rosco2, setRosco2] = useState(gameState.team2.roscoIndex);
  const [selectedTournament, setSelectedTournament] = useState<TournamentMode>(gameState.tournament.mode);
  // Pre-game: si el torneo ya empezó (hay historial), ocultar selector de modo
  const tournamentLocked = gameState.gameHistory.length > 0;

  // Audio solo en PublicView — no en el animador

  const t = gameState.currentTeam;
  const team = t === 1 ? gameState.team1 : gameState.team2;
  const letter = ALPHABET[team.letterIndex];
  const question = ROSCOS[team.roscoIndex]?.[letter] ?? '';
  const answer   = ANSWERS[team.roscoIndex]?.[letter] ?? '';
  const teamName = gameState.teamNames[t - 1];

  // Cuando hay historial y vuelve al pre-game, pre-seleccionar roscos no usados
  useEffect(() => {
    if (!gameState.gameStarted && gameState.gameHistory.length > 0) {
      const used = gameState.gameHistory.flatMap(r => [r.rosco1, r.rosco2]);
      const available = ROSCOS.map((_, i) => i).filter(i => !used.includes(i));
      if (available[0] !== undefined) setRosco1(available[0]);
      if (available[1] !== undefined) setRosco2(available[1]);
    }
  }, [gameState.gameStarted]); // eslint-disable-line react-hooks/exhaustive-deps

  const isTournamentOver =
    gameState.tournamentWins[0] >= gameState.tournament.gamesNeeded ||
    gameState.tournamentWins[1] >= gameState.tournament.gamesNeeded ||
    gameState.gameHistory.length >= gameState.tournament.totalGames;

  const copyCode = () => {
    navigator.clipboard?.writeText(roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4">
      {/* Modal resumen — al continuar vuelve al pre-game para elegir roscos */}
      {gameState.showSummary && (
        <GameSummaryModal
          gameState={gameState}
          onContinue={() => {
            if (isTournamentOver) {
              resetGame();
            } else {
              returnToPreGame();
            }
          }}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-2xl shadow px-6 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-purple-900">🎙️ Animador</h1>
            {syncMode && (
              <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${syncMode === 'firebase' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {syncMode === 'firebase' ? <><Wifi className="w-3 h-3"/>Internet</> : <><WifiOff className="w-3 h-3"/>Local</>}
              </span>
            )}
            {gameState.tournament.mode !== 'single' && gameState.gameStarted && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                <Trophy className="w-3 h-3"/> {gameState.tournament.label} · {gameState.tournamentWins[0]}–{gameState.tournamentWins[1]}
              </span>
            )}
          </div>
          <button onClick={copyCode}
            className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 px-4 py-2 rounded-xl font-mono font-bold text-lg transition-colors">
            <span className="tracking-widest">{roomCode}</span>
            <Copy className="w-4 h-4" />
            {copied && <span className="text-xs text-green-600 font-normal ml-1">¡Copiado!</span>}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Columna izq */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow p-5">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-5 h-5 text-purple-500" />
                <span className="font-semibold text-gray-600 text-sm">Turno: <strong>{teamName}</strong></span>
              </div>
              <div className={`text-6xl font-black text-center mb-4 tabular-nums ${team.timeLeft <= 30 ? 'text-red-500' : 'text-purple-800'}`}>
                {formatTime(team.timeLeft)}
              </div>
              <div className="flex gap-2">
                <button onClick={togglePause} disabled={!gameState.gameStarted || gameState.gameFinished}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold">
                  {gameState.isRunning ? <><Pause className="w-4 h-4"/> Pausar</> : <><Play className="w-4 h-4"/> Reanudar</>}
                </button>
                <button onClick={resetGame} title="Reiniciar"
                  className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-3 rounded-lg">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
            {([1, 2] as const).map(n => {
              const ts = n === 1 ? gameState.team1 : gameState.team2;
              const active = gameState.currentTeam === n;
              const c = n === 1
                ? { border:'border-blue-500', name:'text-blue-600', score:'text-blue-900', time:'text-blue-500' }
                : { border:'border-green-500', name:'text-green-600', score:'text-green-900', time:'text-green-500' };
              return (
                <div key={n} className={`bg-white rounded-2xl shadow p-5 border-4 transition-colors ${active ? c.border : 'border-gray-100'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold text-base ${c.name}`}>{gameState.teamNames[n-1]}</span>
                    {active && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Turno ●</span>}
                  </div>
                  <div className={`text-4xl font-black text-center my-1 ${c.score}`}>{ts.score}</div>
                  <div className={`text-center text-sm font-mono ${c.time}`}>{formatTime(ts.timeLeft)}</div>
                </div>
              );
            })}
          </div>

          {/* Columna central */}
          <div className="lg:col-span-2 space-y-4">
            {gameState.gameStarted && !gameState.gameFinished ? (
              <>
                <div className="bg-white rounded-2xl shadow p-6">
                  <div className="text-center mb-5">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 text-purple-900 text-5xl font-black mb-3">{letter}</div>
                    <p className="text-xl text-gray-700">{question}</p>
                  </div>
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl px-5 py-3 text-center mb-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-green-500 mb-1">Respuesta</p>
                    <p className="text-2xl font-black text-green-800">{answer}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleAnswer('correct')} disabled={!gameState.isRunning}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-base transition-all active:scale-95">
                      <Check className="w-5 h-5" /> Correcta
                    </button>
                    <button onClick={() => handleAnswer('incorrect')} disabled={!gameState.isRunning}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-base transition-all active:scale-95">
                      <X className="w-5 h-5" /> Incorrecta
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow p-5">
                  <p className="text-center text-sm text-gray-400 mb-1">Rosco #{team.roscoIndex + 1} · {teamName}</p>
                  <RoscoWheel team={team} currentLetterIndex={team.letterIndex} gameStarted={gameState.gameStarted} />
                </div>
              </>
            ) : gameState.gameFinished ? (
              <div className="bg-white rounded-2xl shadow p-10 text-center">
                <p className="text-5xl mb-4">🏁</p>
                <p className="text-2xl font-black text-gray-700 mb-2">¡Partida finalizada!</p>
                <p className="text-gray-400 text-sm">Revisa el resumen de resultados</p>
              </div>
            ) : (
              /* ── Pre-game ── */
              <div className="bg-white rounded-2xl shadow p-8 space-y-6">
                <div className="text-center">
                  <p className="text-gray-400 mb-2 text-sm">Código de sala</p>
                  <div className="text-6xl font-black text-purple-600 tracking-[0.2em] mb-1">{roomCode}</div>
                  <p className="text-xs text-gray-300">Todos deben conectarse a la misma red</p>
                </div>

                {/* Modo de torneo — se bloquea una vez que el torneo ya empezó */}
                <div className="border-t border-gray-100 pt-5">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 text-center">
                    {tournamentLocked
                      ? `${gameState.tournament.label} en curso · Partida ${gameState.gameHistory.length + 1}`
                      : 'Modo de juego'}
                  </p>
                  {!tournamentLocked && (
                    <div className="grid grid-cols-2 gap-2">
                      {TOURNAMENT_MODES.map(tm => (
                        <button key={tm.mode}
                          onClick={() => setSelectedTournament(tm.mode)}
                          className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all text-left
                            ${selectedTournament === tm.mode
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                          <div className="flex items-center gap-2">
                            {tm.mode === 'single' ? '🎮' : tm.mode === 'bo3' ? '⚡' : tm.mode === 'bo5' ? '🏆' : '👑'}
                            {tm.label}
                          </div>
                          {tm.mode !== 'single' && (
                            <div className="text-xs opacity-60 mt-0.5">Primero en ganar {tm.gamesNeeded}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {tournamentLocked && (
                    <div className="flex justify-center gap-8 mt-2">
                      {([0, 1] as const).map(i => (
                        <div key={i} className="text-center">
                          <p className={`text-sm font-bold mb-1 ${i===0?'text-blue-600':'text-green-600'}`}>{gameState.teamNames[i]}</p>
                          <div className="flex gap-1 justify-center">
                            {Array.from({ length: gameState.tournament.gamesNeeded }).map((_, j) => (
                              <div key={j} className={`w-5 h-5 rounded-full border-2 ${j < gameState.tournamentWins[i] ? (i===0?'bg-blue-500 border-blue-500':'bg-green-500 border-green-500') : 'border-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selector de roscos */}
                <div className="border-t border-gray-100 pt-5">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">Asignar rosco a cada equipo</p>
                  <div className="grid grid-cols-2 gap-4">
                    {([1, 2] as const).map(n => {
                      const tn = gameState.teamNames[n - 1];
                      const selected = n === 1 ? rosco1 : rosco2;
                      const otherSelected = n === 1 ? rosco2 : rosco1;
                      const selColor = n === 1 ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-green-400 bg-green-50 text-green-700';
                      return (
                        <div key={n}>
                          <p className={`text-sm font-black mb-2 ${n===1?'text-blue-600':'text-green-600'}`}>{tn}</p>
                          <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                            {ROSCOS.map((_, idx) => {
                              const isSelected = selected === idx;
                              const blocked = otherSelected === idx;
                              return (
                                <button key={idx}
                                  onClick={() => n === 1 ? setRosco1(idx) : setRosco2(idx)}
                                  disabled={blocked}
                                  className={`text-center px-2 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all
                                    ${isSelected ? selColor : 'border-gray-200 text-gray-500 hover:border-gray-300'}
                                    ${blocked ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'}
                                  `}>
                                  R#{idx + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button onClick={() => {
                  const cfg = tournamentLocked
                    ? gameState.tournament  // torneo ya configurado, mantenerlo
                    : TOURNAMENT_MODES.find(m => m.mode === selectedTournament)!;
                  startGame(rosco1, rosco2, cfg);
                }}
                  className="w-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white py-5 rounded-2xl font-black text-2xl transition-all">
                  {tournamentLocked
                    ? `▶ Iniciar partida ${gameState.gameHistory.length + 1}`
                    : `▶ Iniciar ${TOURNAMENT_MODES.find(m => m.mode === selectedTournament)?.label}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Vista: Equipo ─────────────────────────────────────────────────────────────

function TeamView({ gameState, teamNumber, onPass }: {
  gameState: GameState; teamNumber: 1 | 2; onPass?: () => void;
}) {
  const myTeam   = teamNumber === 1 ? gameState.team1 : gameState.team2;
  const myName   = gameState.teamNames[teamNumber - 1];
  const isMyTurn = gameState.currentTeam === teamNumber;
  const letter   = ALPHABET[myTeam.letterIndex];
  const question = ROSCOS[myTeam.roscoIndex]?.[letter] ?? '';
  const bg       = teamNumber === 1 ? 'from-blue-600 to-indigo-700' : 'from-green-600 to-emerald-700';
  const ring     = teamNumber === 1 ? 'ring-blue-400' : 'ring-green-400';
  const textAcc  = teamNumber === 1 ? 'text-blue-700' : 'text-green-700';
  const bgAcc    = teamNumber === 1 ? 'bg-blue-50' : 'bg-green-50';

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Resumen modal (pasivo, solo lectura) */}
      {gameState.showSummary && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
            <p className="text-5xl mb-3">🏁</p>
            <p className="text-xl font-black text-gray-700">¡Partida finalizada!</p>
            <p className="text-sm text-gray-400 mt-2">El animador está preparando la siguiente</p>
          </div>
        </div>
      )}

      <div className={`bg-gradient-to-r ${bg} text-white px-6 py-4 flex items-center justify-between`}>
        <div>
          <p className="text-xs opacity-70 font-semibold uppercase tracking-widest">Sala {gameState.roomCode}</p>
          <p className="text-2xl font-black">{myName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-70">Puntos</p>
          <p className="text-4xl font-black">{myTeam.score}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-4 mt-4">
        <div className={`bg-white rounded-2xl shadow p-6 text-center ${isMyTurn && gameState.gameStarted ? `ring-4 ${ring}` : ''}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Tu tiempo</p>
          <div className={`text-7xl font-black tabular-nums ${myTeam.timeLeft <= 30 ? 'text-red-500' : textAcc}`}>
            {formatTime(myTeam.timeLeft)}
          </div>
          {gameState.gameStarted && !isMyTurn && (
            <p className="mt-3 text-sm text-gray-400">Turno de <strong>{gameState.teamNames[gameState.currentTeam - 1]}</strong></p>
          )}
        </div>

        {gameState.gameStarted && !gameState.gameFinished && (
          <div className={`bg-white rounded-2xl shadow p-6 ${!isMyTurn ? 'opacity-50' : ''}`}>
            {isMyTurn ? (
              <>
                <div className="text-center mb-5">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${bgAcc} ${textAcc} text-5xl font-black mb-3`}>{letter}</div>
                  <p className="text-xl text-gray-700">{question}</p>
                </div>
                <button onClick={onPass} disabled={!gameState.isRunning || !onPass}
                  className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95
                    ${teamNumber === 1 ? 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200' : 'bg-green-500 hover:bg-green-600 disabled:bg-gray-200'} text-white`}>
                  <SkipForward className="w-6 h-6" /> Pasapalabra
                </button>
                <p className="text-center text-xs text-gray-300 mt-3 italic">El animador marcará si es correcta o incorrecta</p>
              </>
            ) : (
              <div className="text-center py-4 text-gray-400">
                <p className="text-4xl mb-2">⏳</p>
                <p className="font-medium">Esperando tu turno...</p>
              </div>
            )}
          </div>
        )}

        {!gameState.gameStarted && (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
            <p className="text-5xl mb-3">🎯</p>
            <p>Esperando que el animador inicie...</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-center text-xs text-gray-400 mb-1 font-semibold uppercase tracking-widest">Tu rosco · #{myTeam.roscoIndex + 1}</p>
          <RoscoWheel team={myTeam} currentLetterIndex={myTeam.letterIndex} gameStarted={gameState.gameStarted} />
        </div>
      </div>
    </div>
  );
}

// ─── Vista: Público ───────────────────────────────────────────────────────────

function PublicView({ gameState }: { gameState: GameState }) {
  const t        = gameState.currentTeam;
  const team     = t === 1 ? gameState.team1 : gameState.team2;
  const letter   = ALPHABET[team.letterIndex];
  const question = ROSCOS[team.roscoIndex]?.[letter] ?? '';
  const teamName = gameState.teamNames[t - 1];

  // Mismos sonidos que el animador — música continua + efectos
  useBgMusic(gameState.gameStarted, gameState.gameFinished);
  useSoundEffects(gameState.gameStarted, gameState.isRunning, gameState.gameFinished, team.timeLeft);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-purple-300 tracking-wide">PASAPALABRA</h1>
        <div className="flex gap-4">
          {([1, 2] as const).map(n => {
            const ts = n === 1 ? gameState.team1 : gameState.team2;
            const active = gameState.currentTeam === n;
            return (
              <div key={n} className={`px-6 py-3 rounded-2xl text-center font-bold ${active ? (n===1?'bg-blue-600':'bg-green-600') : 'bg-gray-700'}`}>
                <div className="text-xs opacity-75 mb-0.5">{gameState.teamNames[n-1]}</div>
                <div className="text-3xl">{ts.score}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        <div className="flex flex-col gap-4">
          <div className={`rounded-2xl px-5 py-3 text-center font-bold text-lg ${t===1?'bg-blue-700':'bg-green-700'}`}>
            🎙️ Turno de <span className="font-black">{teamName}</span>
          </div>
          {gameState.gameStarted && (
            <div className="bg-gray-800 rounded-2xl p-6 text-center flex-1">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-6xl font-black mb-4 ${t===1?'bg-blue-600':'bg-green-600'}`}>{letter}</div>
              <p className="text-xl text-gray-200 leading-relaxed">{question}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {([1,2] as const).map(n => {
              const ts = n === 1 ? gameState.team1 : gameState.team2;
              return (
                <div key={n} className={`rounded-xl p-4 text-center ${gameState.currentTeam===n?(n===1?'bg-blue-700':'bg-green-700'):'bg-gray-700'}`}>
                  <div className="text-xs opacity-70 mb-1 truncate">{gameState.teamNames[n-1]}</div>
                  <div className={`text-3xl font-black tabular-nums ${ts.timeLeft <= 30 ? 'text-red-300' : ''}`}>{formatTime(ts.timeLeft)}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-gray-800 rounded-2xl p-5">
          <p className="text-center text-xs text-gray-500 mb-2 font-semibold uppercase tracking-widest">Rosco de {teamName}</p>
          <RoscoWheel team={team} currentLetterIndex={team.letterIndex} gameStarted={gameState.gameStarted} />
        </div>
      </div>
      {!gameState.gameStarted && (
        <div className="text-center text-gray-500 py-6">
          <p className="text-5xl mb-3">⏳</p>
          <p className="text-lg">Esperando inicio del juego...</p>
        </div>
      )}
    </div>
  );
}

// ─── Super Admin ──────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = 'admin1234';

function AdminView({ onBack }: { onBack: () => void }) {
  const [authed, setAuthed]     = useState(false);
  const [pwInput, setPwInput]   = useState('');
  const [pwError, setPwError]   = useState(false);
  const [activeCode, setActiveCode] = useState<string | null>(null);

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={onBack} className="text-gray-500 hover:text-white text-lg">←</button>
            <h2 className="text-xl font-bold text-white">⚙️ Super Admin</h2>
          </div>
          <p className="text-gray-400 text-sm">Acceso restringido.</p>
          <input type="password" value={pwInput}
            onChange={e => { setPwInput(e.target.value); setPwError(false); }}
            onKeyDown={e => { if (e.key === 'Enter') { if (pwInput === ADMIN_PASSWORD) setAuthed(true); else setPwError(true); } }}
            placeholder="Contraseña"
            className={`w-full bg-gray-700 border-2 ${pwError?'border-red-500':'border-gray-600'} rounded-xl px-4 py-3 text-white text-lg outline-none`} />
          {pwError && <p className="text-red-400 text-sm">Contraseña incorrecta</p>}
          <button onClick={() => { if (pwInput === ADMIN_PASSWORD) setAuthed(true); else setPwError(true); }}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold">Entrar</button>
        </div>
      </div>
    );
  }
  if (!activeCode) return <AdminRoomSelector onBack={onBack} onReady={setActiveCode} />;
  return <AdminPanel onBack={() => setActiveCode(null)} roomCode={activeCode} />;
}

function AdminRoomSelector({ onBack, onReady }: { onBack: () => void; onReady: (code: string) => void }) {
  const [tab, setTab] = useState<'create'|'join'>('create');
  const [t1, setT1] = useState('Equipo 1');
  const [t2, setT2] = useState('Equipo 2');
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-500 hover:text-white text-lg">←</button>
            <h2 className="text-xl font-bold text-white">⚙️ Super Admin</h2>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${FIREBASE_CONFIGURED?'bg-green-900 text-green-300':'bg-amber-900 text-amber-300'}`}>
            {FIREBASE_CONFIGURED ? '🟢 Firebase' : '🟡 Local'}
          </span>
        </div>
        <div className="flex rounded-xl bg-gray-700 p-1">
          {(['create','join'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold ${tab===t?'bg-gray-900 text-white':'text-gray-400'}`}>
              {t==='create' ? '✨ Crear sala' : '🔗 Unirse a sala'}
            </button>
          ))}
        </div>
        {tab === 'create' ? (
          <div className="space-y-3">
            <input value={t1} onChange={e => setT1(e.target.value)}
              className="w-full bg-gray-700 border-2 border-gray-600 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-lg outline-none" />
            <input value={t2} onChange={e => setT2(e.target.value)}
              className="w-full bg-gray-700 border-2 border-gray-600 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-lg outline-none" />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button disabled={loading}
              onClick={async () => {
                if (!t1.trim() || !t2.trim()) { setError('Ponle nombre a ambos equipos'); return; }
                setLoading(true);
                const code = generateCode();
                await createRoom(makeInitialGameState(code, [t1.trim(), t2.trim()]));
                setLoading(false);
                onReady(code);
              }}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-4 rounded-xl font-black text-lg">
              {loading ? 'Creando...' : 'Crear sala y entrar'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input value={codeInput} onChange={e => { setCodeInput(e.target.value.toUpperCase()); setError(''); }}
              placeholder="XXXX" maxLength={4}
              className="w-full bg-gray-700 border-2 border-gray-600 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-3xl font-black text-center tracking-widest outline-none" />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button disabled={loading}
              onClick={async () => {
                const code = codeInput.trim();
                if (code.length !== 4) { setError('El código tiene 4 letras'); return; }
                setLoading(true);
                const room = await joinRoom(code);
                setLoading(false);
                if (!room) { setError('Sala no encontrada'); return; }
                onReady(code);
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-4 rounded-xl font-black text-lg">
              {loading ? 'Buscando...' : 'Conectar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminPanel({ onBack, roomCode }: { onBack: () => void; roomCode: string }) {
  const [simulateRole, setSimulateRole] = useState<Role | 'grid'>('grid');
  const { gameState, broadcast } = useGameSync(roomCode);
  const logic = useGameLogic(gameState, broadcast);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-5xl mb-4">⚙️</p>
          <p className="text-lg">Cargando sala <span className="font-mono font-black text-amber-400">{roomCode}</span>...</p>
        </div>
      </div>
    );
  }

  const roleLabel: Partial<Record<Role | 'grid', string>> = {
    grid:'⊞ Grid', animator:'🎙️ Animador', team1:'⚡ Eq.1', team2:'🔥 Eq.2', public:'📺 Público'
  };
  const views: Role[] = ['animator','team1','team2','public'];

  const renderView = (r: Role) => {
    switch (r) {
      case 'animator': return <AnimatorView gameState={gameState} roomCode={roomCode} logic={logic} syncMode={FIREBASE_CONFIGURED?'firebase':'local'} />;
      case 'team1':    return <TeamView gameState={gameState} teamNumber={1} onPass={() => logic.teamPass(1)} />;
      case 'team2':    return <TeamView gameState={gameState} teamNumber={2} onPass={() => logic.teamPass(2)} />;
      case 'public':   return <PublicView gameState={gameState} />;
      default:         return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 px-3 py-2 flex items-center gap-2 flex-wrap shrink-0" style={{ height: 44 }}>
        <button onClick={onBack} className="text-gray-500 hover:text-white text-sm px-1">←</button>
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Admin</span>
        <span className="font-mono font-black text-amber-400 text-base tracking-widest bg-amber-400/10 px-2 py-0.5 rounded">{roomCode}</span>
        <span className="text-gray-600 text-xs hidden sm:block">{gameState.teamNames[0]} vs {gameState.teamNames[1]}</span>
        <div className="flex gap-1 ml-auto">
          {(['grid', ...views] as (Role|'grid')[]).map(r => (
            <button key={r} onClick={() => setSimulateRole(r)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap
                ${simulateRole===r ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              {roleLabel[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {simulateRole === 'grid' ? (
          <div className="grid grid-cols-2 gap-0.5 bg-gray-950 p-0.5"
               style={{ height: 'calc(100vh - 44px)', gridTemplateRows: '1fr 1fr' }}>
            {views.map(r => (
              <div key={r} className="relative overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
                <div className="absolute top-1.5 left-1.5 z-20 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-bold pointer-events-none select-none">
                  {roleLabel[r]}
                </div>
                <div style={{ transform:'scale(0.5)', transformOrigin:'top left', width:'200%', height:'200%' }}>
                  {renderView(r)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full overflow-auto">{renderView(simulateRole as Role)}</div>
        )}
      </div>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  const isAdminUrl = typeof window !== 'undefined' && window.location.search.includes('admin');
  const [role, setRole]     = useState<Role>(isAdminUrl ? 'admin' : 'lobby');
  const [roomCode, setRoomCode] = useState('');

  if (role === 'lobby') return <LobbyView onJoin={(r, code) => { setRoomCode(code); setRole(r); }} />;
  if (role === 'admin') return <AdminView onBack={() => setRole('lobby')} />;
  return <SyncedGame role={role} roomCode={roomCode} onBack={() => setRole('lobby')} />;
}

function SyncedGame({ role, roomCode, onBack }: { role: Role; roomCode: string; onBack: () => void }) {
  const { gameState, broadcast, syncMode } = useGameSync(roomCode);
  const logic = useGameLogic(role === 'animator' ? gameState : null, broadcast);

  if (!gameState) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-400">
        <p className="text-5xl mb-4">🔄</p>
        <p className="text-lg">Conectando a sala <strong>{roomCode}</strong>...</p>
        <button onClick={onBack} className="mt-6 text-purple-500 hover:underline text-sm">← Volver</button>
      </div>
    </div>
  );

  switch (role) {
    case 'animator': return <AnimatorView gameState={gameState} roomCode={roomCode} logic={logic} syncMode={syncMode} />;
    case 'team1':    return <TeamView gameState={gameState} teamNumber={1} onPass={() => logic.teamPass(1)} />;
    case 'team2':    return <TeamView gameState={gameState} teamNumber={2} onPass={() => logic.teamPass(2)} />;
    case 'public':   return <PublicView gameState={gameState} />;
    default:         return null;
  }
}
