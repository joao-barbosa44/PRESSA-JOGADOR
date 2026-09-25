/*
 * Draft do Craque — lógica do jogo:
 * dados, temporada/competições, partidas decisivas, bola parada, pênaltis,
 * moral, eventos narrativos, prêmios e marcos de carreira.
 */

'use strict';
/* ==================================================================
   PARTE 1 — DADOS (países, clubes, competições, banco de jogadores)
   ================================================================== */

const CONFED = { CONMEBOL:'CONMEBOL', UEFA:'UEFA', CONCACAF:'CONCACAF', AFC:'AFC', CAF:'CAF' };

const CONFED_LABEL = {
  CONMEBOL:'CONMEBOL — América do Sul',
  UEFA:'UEFA — Europa',
  CONCACAF:'CONCACAF — América do Norte/Central',
  AFC:'AFC — Ásia',
  CAF:'CAF — África'
};

const COUNTRIES = [
  {name:'Brasil', flag:'br', confed:CONFED.CONMEBOL},
  {name:'Argentina', flag:'ar', confed:CONFED.CONMEBOL},
  {name:'Uruguai', flag:'uy', confed:CONFED.CONMEBOL},
  {name:'Espanha', flag:'es', confed:CONFED.UEFA},
  {name:'Inglaterra', flag:'gb-eng', confed:CONFED.UEFA},
  {name:'Itália', flag:'it', confed:CONFED.UEFA},
  {name:'Alemanha', flag:'de', confed:CONFED.UEFA},
  {name:'França', flag:'fr', confed:CONFED.UEFA},
  {name:'Portugal', flag:'pt', confed:CONFED.UEFA},
  {name:'México', flag:'mx', confed:CONFED.CONCACAF},
  {name:'Japão', flag:'jp', confed:CONFED.AFC},
  {name:'Nigéria', flag:'ng', confed:CONFED.CAF},
];

function flagUrl(code){ return `https://flagcdn.com/w80/${code}.png`; }

// bandeiras como emoji para fallback de segurança
const FLAG_EMOJI = {
  'Brasil':'🇧🇷','Argentina':'🇦🇷','Uruguai':'🇺🇾','Espanha':'🇪🇸','Inglaterra':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Itália':'🇮🇹',
  'Alemanha':'🇩🇪','França':'🇫🇷','Portugal':'🇵🇹','México':'🇲🇽','Japão':'🇯🇵','Nigéria':'🇳🇬',
  'Holanda':'🇳🇱','Hungria':'🇭🇺','Suécia':'🇸🇪','Costa do Marfim':'🇨🇮','Camarões':'🇨🇲','Croácia':'🇭🇷',
  'Bélgica':'🇧🇪','Polônia':'🇵🇱','Noruega':'🇳🇴','Egito':'🇪🇬','Irlanda do Norte':'🇬🇧',
  'Rússia':'🇷🇺','Dinamarca':'🇩🇰','Colômbia':'🇨🇴','Paraguai':'🇵🇾','Costa Rica':'🇨🇷','Eslovênia':'🇸🇮','Marrocos':'🇲🇦',
  'Gana':'🇬🇭','Sérvia':'🇷🇸',
};

// clubes por país: divisão 1 e divisão 2, com força-base (1-99)
const CLUBS = {
  'Brasil': {
    d1:[['Flamengo',89],['Palmeiras',88],['Corinthians',83],['São Paulo',82],['Botafogo',84],['Cruzeiro',80],['Bahia',78],['Grêmio',80],['Internacional',80],['Atlético-MG',81],['Fluminense',79],['Fortaleza',75]],
    d2:[['Vasco da Gama',74],['Sport Recife',68],['Santos',77],['Vitória',70],['Red Bull Bragantino',76],['Ceará',67],['Ponte Preta',62],['Guarani',63]],
  },
  'Argentina': {
    d1:[['Boca Juniors',87],['River Plate',88],['Racing Club',80],['Independiente',78],['San Lorenzo',77],['Estudiantes',76],['Vélez Sarsfield',77],['Talleres',75],['Argentinos Juniors',73],['Lanús',72],['Defensa y Justicia',71],['Godoy Cruz',70]],
    d2:[['Rosario Central',70],['Newell\'s Old Boys',69],['Gimnasia La Plata',65],['Huracán',64],['Banfield',62],['Tigre',61],['Unión de Santa Fe',60],['Platense',58]],
  },
  'Uruguai': {
    d1:[['Peñarol',83],['Nacional',82],['Defensor Sporting',70],['Danubio',66],['Liverpool FC (URU)',65],['Cerro',62],['Plaza Colonia',58],['Fénix',57]],
    d2:[['Wanderers',58],['Racing Montevideo',56],['Rentistas',54],['Progreso',52],['Cerro Largo',50],['Boston River',49]],
  },
  'Espanha': {
    d1:[['Real Madrid',93],['Barcelona',91],['Atlético de Madrid',86],['Sevilla',80],['Real Betis',79],['Athletic Bilbao',79],['Valencia',77],['Villarreal',78],['Real Sociedad',78],['Celta de Vigo',74],['Osasuna',73],['Girona',74]],
    d2:[['Deportivo La Coruña',68],['Real Zaragoza',66],['Sporting de Gijón',65],['Leganés',62],['Racing de Santander',61],['Tenerife',60],['Real Oviedo',60],['Cádiz',63]],
  },
  'Inglaterra': {
    d1:[['Manchester City',93],['Arsenal',89],['Liverpool',90],['Manchester United',85],['Chelsea',85],['Tottenham Hotspur',84],['Newcastle United',82],['Aston Villa',81],['Brighton & Hove Albion',78],['West Ham United',77],['Everton',76],['Wolverhampton Wanderers',75]],
    d2:[['Leeds United',73],['Leicester City',73],['Southampton',70],['Norwich City',68],['West Bromwich Albion',66],['Sunderland',65],['Middlesbrough',64],['Sheffield United',65]],
  },
  'Itália': {
    d1:[['Inter de Milão',89],['AC Milan',86],['Juventus',85],['Napoli',86],['AS Roma',82],['Lazio',80],['Atalanta',81],['Fiorentina',78],['Bologna',76],['Torino',73],['Udinese',72],['Genoa',71]],
    d2:[['Parma',67],['Sampdoria',66],['Bari',63],['Cagliari',64],['Palermo',62],['Venezia',60],['Cremonese',59],['Cosenza',55]],
  },
  'Alemanha': {
    d1:[['Bayern de Munique',92],['Borussia Dortmund',86],['RB Leipzig',84],['Bayer Leverkusen',85],['Eintracht Frankfurt',79],['VfB Stuttgart',79],['Borussia Mönchengladbach',76],['Union Berlin',75],['Werder Bremen',73],['VfL Wolfsburg',74],['SC Freiburg',75],['Mainz 05',72]],
    d2:[['Hamburgo SV',68],['Schalke 04',66],['Hertha Berlin',65],['Fortuna Düsseldorf',62],['Kaiserslautern',61],['Nürnberg',60],['Hannover 96',63],['Karlsruher SC',58]],
  },
  'França': {
    d1:[['Paris Saint-Germain',91],['Marselha',82],['Lyon',80],['Monaco',81],['Lille',78],['Rennes',77],['Nice',76],['Lens',76],['Toulouse',72],['Strasbourg',71],['Nantes',70],['Montpellier',70]],
    d2:[['Saint-Étienne',65],['Bordeaux',64],['Metz',62],['Auxerre',61],['Bastia',58],['Le Havre',59],['Ajaccio',56],['Guingamp',57]],
  },
  'Portugal': {
    d1:[['Benfica',85],['FC Porto',84],['Sporting CP',85],['Sporting de Braga',78],['Vitória de Guimarães',72],['Arouca',68],['Casa Pia',65],['Estoril Praia',66],['Famalicão',67],['Gil Vicente',65]],
    d2:[['Boavista',68],['Académica de Coimbra',58],['Nacional da Madeira',56],['Farense',55],['Chaves',57],['Paços de Ferreira',56]],
  },
  'México': {
    d1:[['Club América',80],['Chivas Guadalajara',75],['Cruz Azul',76],['Pumas UNAM',73],['Monterrey',79],['Tigres UANL',79],['Toluca',77],['Pachuca',75],['León',73],['Tijuana',70],['Atlas',72],['Atlante',66]],
    d2:[['Correcaminos UAT',54],['Dorados de Sinaloa',56],['Mineros de Zacatecas',53],['Alebrijes de Oaxaca',52],['Cancún FC',51],['Tepatitlán',53],['Irapuato',52],['Venados FC',50]],
  },
  'Japão': {
    d1:[['Kashima Antlers',74],['Urawa Red Diamonds',75],['Yokohama F. Marinos',75],['Kawasaki Frontale',76],['Gamba Osaka',71],['Vissel Kobe',72],['Nagoya Grampus',70],['Sanfrecce Hiroshima',69],['FC Tokyo',70],['Cerezo Osaka',68]],
    d2:[['Ventforet Kofu',56],['Omiya Ardija',55],['Oita Trinita',53],['JEF United Chiba',54],['Mito HollyHock',50],['Tochigi SC',49]],
  },
  'Nigéria': {
    d1:[['Enyimba FC',68],['Kano Pillars',66],['Rivers United',65],['Plateau United',63],['Enugu Rangers',64],['Remo Stars',62],['Kwara United',59],['Shooting Stars',58]],
    d2:[['Wikki Tourists',48],['Katsina United',47],['Abia Warriors',46],['Niger Tornadoes',45],['Sunshine Stars',47],['Akwa United',48]],
  },
};

const CONTINENTAL_FILLERS = {
  CONMEBOL: [['Colo-Colo (CHI)',75],['Universitario (PER)',70],['Barcelona SC (EQU)',72],['Olimpia (PAR)',68]],
  UEFA: [['Ajax (HOL)',78],['Celtic (ESC)',72],['Shakhtar Donetsk (UCR)',74],['Feyenoord (HOL)',76]],
  CONCACAF: [['Toronto FC (CAN)',62],['LA Galaxy (EUA)',65],['Comunicaciones (GUA)',54],['Alajuelense (CRC)',58]],
  AFC: [['Al-Hilal (ARA)',77],['Ulsan HD (COR)',68],['Shanghai Port (CHN)',67],['Al-Ain (EAU)',63]],
  CAF: [['Al Ahly (EGI)',75],['Wydad Casablanca (MAR)',70],['Mamelodi Sundowns (AFS)',68],['Espérance de Tunis (TUN)',66]],
};

const ELITE_CLUB_NAMES = ['Real Madrid','Manchester City','Barcelona','Bayern de Munique','Paris Saint-Germain','Liverpool','Manchester United','Juventus','Inter de Milão','Chelsea','Napoli'];

const CLUB_COMPS = {
  CONMEBOL:{league:'Divisão', cup:'Copa Nacional', cont:'Copa Libertadores', cont2:'Copa Sul-Americana'},
  UEFA:{league:'Divisão', cup:'Copa Nacional', cont:'UEFA Champions League', cont2:'UEFA Europa League'},
  CONCACAF:{league:'Divisão', cup:'Copa Nacional', cont:'Liga dos Campeões da CONCACAF', cont2:null},
  AFC:{league:'Divisão', cup:'Copa Nacional', cont:'Liga dos Campeões da AFC', cont2:null},
  CAF:{league:'Divisão', cup:'Copa Nacional', cont:'Liga dos Campeões da CAF', cont2:null},
};

const NT_COMPS = {
  CONMEBOL:{qualifier:'Eliminatórias Sul-Americanas', continental:'Copa América'},
  UEFA:{qualifier:'Eliminatórias Europeias', continental:'Eurocopa'},
  CONCACAF:{qualifier:'Eliminatórias da CONCACAF', continental:'Copa Ouro'},
  AFC:{qualifier:'Eliminatórias Asiáticas', continental:'Copa da Ásia'},
  CAF:{qualifier:'Eliminatórias Africanas', continental:'Copa Africana de Nações'},
};

const POSITIONS = [
  {id:'GOL', name:'Goleiro', icon:'🧤', scenario:'GK', weights:{elasticidade:.22, reflexos:.22, colocacao:.18, agarrar:.14, jogoAereo:.10, fisico:.06, reposicao:.05, velocidade:.03}},
  {id:'ZAG', name:'Zagueiro', icon:'🛡️', scenario:'DEF', weights:{defesa:.45, fisico:.25, passe:.15, velocidade:.15}},
  {id:'LAT', name:'Lateral', icon:'⛓️', scenario:'DEF', weights:{defesa:.30, velocidade:.25, fisico:.15, passe:.15, drible:.15}},
  {id:'VOL', name:'Volante', icon:'🧱', scenario:'MID', weights:{defesa:.30, passe:.25, fisico:.20, velocidade:.15, drible:.10}},
  {id:'MEI', name:'Meio-Campo', icon:'🎯', scenario:'MID', weights:{passe:.35, drible:.20, finalizacao:.15, fisico:.15, velocidade:.15}},
  {id:'PON', name:'Ponta', icon:'💨', scenario:'ATT', weights:{velocidade:.30, drible:.30, finalizacao:.20, passe:.10, fisico:.10}},
  {id:'ATA', name:'Atacante', icon:'⚡', scenario:'ATT', weights:{finalizacao:.35, drible:.20, velocidade:.20, fisico:.15, passe:.10}},
];

function posById(id){ return POSITIONS.find(p=>p.id===id); }

const PLAYER_DB = [
  mkP('Pelé','Brasil','Lenda',5,4,96,86,95,93,48,60),
  mkP('Diego Maradona','Argentina','Lenda',5,3,97,90,90,85,55,65),
  mkP('Zinédine Zidane','França','Lenda',5,4,93,92,85,72,65,75),
  mkP('Ronaldo Fenômeno','Brasil','Lenda',5,4,95,75,94,96,30,78),
  mkP('Ronaldinho Gaúcho','Brasil','Lenda',5,5,97,86,88,80,68,68),
  mkP('Romário','Brasil','Lenda',4,3,88,68,92,84,62,60),
  mkP('Cristiano Ronaldo','Portugal','Atual',5,4,90,82,94,90,42,90),
  mkP('Lionel Messi','Argentina','Atual',5,3,96,90,92,80,68,65),
  mkP('Neymar Jr','Brasil','Atual',5,5,95,84,87,83,36,62),
  mkP('Kylian Mbappé','França','Atual',5,4,92,78,91,97,30,78),
  mkP('Franz Beckenbauer','Alemanha','Lenda',3,3,80,86,72,78,72,80),
  mkP('Johan Cruyff','Holanda','Lenda',5,3,92,88,84,75,68,62),
  mkP('Ferenc Puskás','Hungria','Lenda',3,2,84,78,93,70,60,72),
  mkP('Eusébio','Portugal','Lenda',4,3,85,68,90,90,42,68),
  mkP('Zico','Brasil','Lenda',5,3,90,87,89,72,64,60),
  mkP('Sócrates','Brasil','Lenda',3,3,75,88,80,65,55,68),
  mkP('Garrincha','Brasil','Lenda',5,2,98,60,78,88,32,55),
  mkP('Paolo Maldini','Itália','Lenda',2,3,72,78,58,73,80,88),
  mkP('Fabio Cannavaro','Itália','Lenda',2,2,65,72,52,68,78,80),
  mkP('Xavi Hernández','Espanha','Lenda',4,3,86,96,72,55,58,60),
  mkP('Andrés Iniesta','Espanha','Lenda',5,3,92,93,78,65,60,58),
  mkP('Roberto Carlos','Brasil','Lenda',3,2,82,74,88,85,80,78),
  mkP('Cafu','Brasil','Lenda',3,2,78,76,70,88,80,80),
  mkP('Rivaldo','Brasil','Lenda',5,5,90,80,90,75,65,66),
  mkP('Kaká','Brasil','Lenda',4,3,86,86,86,86,50,68),
  mkP('Alessandro Del Piero','Itália','Lenda',4,4,84,78,88,72,58,62),
  mkP('Francesco Totti','Itália','Lenda',4,4,83,84,87,68,60,68),
  mkP('Roberto Baggio','Itália','Lenda',5,3,88,78,88,75,62,60),
  mkP('Marco van Basten','Holanda','Lenda',3,3,78,72,92,75,68,75),
  mkP('Thierry Henry','França','Lenda',4,3,86,76,91,90,40,72),
  mkP('Zlatan Ibrahimović','Suécia','Lenda',5,4,85,72,90,72,40,88),
  mkP('Didier Drogba','Costa do Marfim','Lenda',3,3,74,68,88,78,46,80),
  mkP('Samuel Eto\'o','Camarões','Lenda',3,3,80,68,88,88,44,72),
  mkP('Luka Modrić','Croácia','Atual',4,3,88,93,74,70,62,62),
  mkP('Toni Kroos','Alemanha','Atual',3,4,75,95,72,55,55,68),
  mkP('Mohamed Salah','Egito','Atual',4,5,90,78,91,92,44,66),
  mkP('Karim Benzema','França','Atual',4,4,87,82,90,74,68,74),
  mkP('Robert Lewandowski','Polônia','Atual',3,4,80,72,93,72,38,80),
  mkP('Erling Haaland','Noruega','Atual',2,4,68,62,94,88,25,92),
  mkP('Kevin De Bruyne','Bélgica','Atual',4,5,85,96,86,72,68,72),
  mkP('N\'Golo Kanté','França','Atual',2,3,72,74,55,80,86,78),
  mkP('Virgil van Dijk','Holanda','Atual',2,3,60,78,45,74,74,90),
  mkP('Luis Suárez','Uruguai','Atual',4,4,86,76,92,80,50,80),
  mkP('Edinson Cavani','Uruguai','Atual',3,4,78,66,89,84,48,78),
  mkP('Sergio Agüero','Argentina','Atual',4,4,84,70,92,80,38,72),
  mkP('Vinícius Júnior','Brasil','Atual',5,4,93,74,84,96,30,70),
  mkP('Rodrygo','Brasil','Atual',4,4,88,78,84,90,34,66),
  mkP('Jude Bellingham','Inglaterra','Atual',4,4,86,84,86,80,62,80),
  mkP('Bukayo Saka','Inglaterra','Atual',4,3,86,80,82,88,48,68),
  mkP('Pedri','Espanha','Atual',4,3,88,92,74,64,62,58),
  mkP('Rodri','Espanha','Atual',3,4,78,90,68,58,60,80),
  mkP('Roberto Firmino','Brasil','Atual',4,3,80,82,80,68,64,68),
  mkP('Casemiro','Brasil','Atual',2,3,68,76,58,64,72,86),
  mkP('Marquinhos','Brasil','Atual',2,3,68,76,50,68,76,82),
  mkP('Thiago Silva','Brasil','Atual',2,3,64,78,50,64,72,80),
  mkP('Dani Alves','Brasil','Lenda',4,3,80,80,72,86,78,72),
  mkP('Ronald Koeman','Holanda','Lenda',2,3,58,74,80,52,55,74),
  mkP('George Best','Irlanda do Norte','Lenda',5,3,92,68,82,86,38,58),
  mkP('Bobby Charlton','Inglaterra','Lenda',3,3,74,76,86,74,60,68),
  mkP('Gerd Müller','Alemanha','Lenda',2,3,62,58,96,68,58,74),
  mkP('Michel Platini','França','Lenda',4,4,84,86,89,66,60,64),
  mkP('Lothar Matthäus','Alemanha','Lenda',3,3,76,82,80,74,70,78),
  mkP('Hugo Sánchez','México','Lenda',3,3,78,64,90,76,45,72),
  mkP('Fernandinho','Brasil','Lenda',2,3,58,68,42,55,72,74),
  mkP('Fred','Brasil','Atual',2,3,60,64,44,58,62,68),
  mkP('Danny Welbeck','Inglaterra','Atual',3,3,62,58,60,68,45,66),
  mkP('Marouane Fellaini','Bélgica','Lenda',2,2,48,55,50,45,58,78),
  mkP('Nicklas Bendtner','Dinamarca','Lenda',2,3,55,52,58,55,40,68),
  mkP('Kevin-Prince Boateng','Gana','Lenda',3,3,62,58,52,60,55,66),
  mkP('Marouane Chamakh','Marrocos','Lenda',2,3,55,50,60,62,40,64),
  mkP('Djibril Cissé','França','Lenda',3,3,58,48,64,70,38,62),
  mkP('Jack Rodwell','Inglaterra','Lenda',2,2,50,55,42,52,55,62),
  mkP('Freddy Adu','Gana','Lenda',3,4,60,52,48,58,35,50),
  mkP('Fábio Coentrão','Portugal','Lenda',2,2,55,58,38,62,60,64),
  mkP('Emerson Palmieri','Brasil','Atual',2,2,52,56,36,64,62,66),
  mkP('Younès Belhanda','Marrocos','Atual',3,3,64,60,55,58,42,58),
  mkP('Marcos Rojo','Argentina','Atual',2,2,45,50,38,55,64,72),
  mkP('Bacary Sagna','França','Lenda',2,2,50,58,35,62,66,68),
  mkP('Chris Smalling','Inglaterra','Atual',2,2,42,52,32,52,66,74),
  mkP('William Carvalho','Portugal','Atual',2,2,55,62,40,50,60,70),
  mkP('Nemanja Matić','Sérvia','Atual',1,3,52,64,38,48,66,76),
  mkP('Andy Carroll','Inglaterra','Lenda',1,2,35,42,58,38,25,82),
  mkP('Peter Crouch','Inglaterra','Lenda',1,2,38,45,55,35,22,78),
  mkP('Emile Heskey','Inglaterra','Lenda',2,3,45,48,48,58,30,76),
  mkP('Titus Bramble','Inglaterra','Lenda',1,2,35,42,20,55,48,68),
  mkP('Grzegorz Krychowiak','Polônia','Atual',1,2,42,55,25,45,58,72),
  mkP('Ryan Babel','Holanda','Lenda',3,3,62,50,48,78,22,58),
];

function mkP(name,country,era,f,pr,dr,pa,fi,ve,de,fis){
  return {name,country,era, fintas:f, pernaRuim:pr, drible:dr, passe:pa, finalizacao:fi, velocidade:ve, defesa:de, fisico:fis};
}

function mkGK(name,country,era,elasticidade,reflexos,colocacao,agarrar,jogoAereo,reposicao,velocidade,fisico){
  return {name,country,era, elasticidade, reflexos, colocacao, agarrar, jogoAereo, reposicao, velocidade, fisico};
}
const GK_DB = [
  mkGK('Gianluigi Buffon','Itália','Lenda',88,95,90,85,85,60,55,82),
  mkGK('Iker Casillas','Espanha','Lenda',90,94,85,82,80,58,58,78),
  mkGK('Alisson Becker','Brasil','Atual',87,91,88,85,84,78,62,84),
  mkGK('Manuel Neuer','Alemanha','Atual',85,90,92,87,90,85,68,84),
  mkGK('Lev Yashin','Rússia','Lenda',90,97,88,88,88,55,50,78),
  mkGK('Peter Schmeichel','Dinamarca','Lenda',88,93,90,90,92,68,52,92),
  mkGK('Oliver Kahn','Alemanha','Lenda',90,92,89,91,86,62,55,88),
  mkGK('Edwin van der Sar','Holanda','Lenda',84,87,91,85,82,82,58,80),
  mkGK('Dino Zoff','Itália','Lenda',80,85,88,84,78,55,48,75),
  mkGK('Gordon Banks','Inglaterra','Lenda',85,90,87,83,76,50,52,74),
  mkGK('Taffarel','Brasil','Lenda',82,86,80,78,74,58,56,76),
  mkGK('Rogério Ceni','Brasil','Lenda',78,80,82,76,72,88,54,74),
  mkGK('René Higuita','Colômbia','Lenda',75,78,70,72,65,80,72,70),
  mkGK('José Luis Chilavert','Paraguai','Lenda',80,83,78,79,76,85,60,80),
  mkGK('Keylor Navas','Costa Rica','Atual',86,89,84,82,78,65,65,76),
  mkGK('Thibaut Courtois','Bélgica','Atual',89,88,90,86,88,72,50,90),
  mkGK('Jan Oblak','Eslovênia','Atual',91,92,90,87,82,68,55,82),
  mkGK('Marc-André ter Stegen','Alemanha','Atual',85,87,86,85,80,90,62,78),
  mkGK('Ederson Moraes','Brasil','Atual',82,84,85,80,78,93,70,78),
  mkGK('Gianluigi Donnarumma','Itália','Atual',90,90,87,83,84,83,58,88),
  mkGK('Emiliano Martínez','Argentina','Atual',85,87,84,82,80,70,58,84),
  mkGK('David de Gea','Espanha','Atual',88,94,85,83,78,62,56,78),
  mkGK('Kepa Arrizabalaga','Espanha','Atual',82,84,80,78,74,68,60,76),
  mkGK('Yassine Bounou','Marrocos','Atual',84,86,83,81,76,72,62,78),
  mkGK('Heurelho Gomes','Brasil','Lenda',65,68,60,58,55,50,48,68),
  mkGK('David Ospina','Colômbia','Atual',68,70,65,62,58,55,50,66),
  mkGK('Fraser Forster','Inglaterra','Atual',62,65,68,64,70,48,42,74),
  mkGK('Loris Karius','Alemanha','Atual',58,55,56,52,54,60,52,62),
];

/* ==================================================================
   PARTE 2 — ESTADO GLOBAL E UTILITÁRIOS
   ================================================================== */

let S = null;
let D = null;
let pendingModalQueue = [];
let autoMode = false;
let matchContinuationIsStep = false;

function rnd(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function rndf(min,max){ return Math.random()*(max-min)+min; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function sample(arr,n){ return shuffle(arr).slice(0,n); }
function fmtMoney(v){
  if(v>=1000000) return '€' + (v/1000000).toFixed(1).replace('.0','') + 'M';
  return '€' + (v/1000).toFixed(0) + 'K';
}
function initials(name){ return name.split(' ').filter(w=>w.length>1).slice(0,2).map(w=>w[0]).join('').toUpperCase(); }

// ----------------------------------------------------
// SISTEMA ROBUSTO DE IMAGENS (Bandeiras e Escudos)
// ----------------------------------------------------
function flagEmoji(countryName) {
  if (!countryName) return '🏳️';
  const cleanName = countryName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");
  return `<img src="assets/flags/${cleanName}.png" alt="${countryName}" style="width:20px;height:14px;object-fit:cover;border-radius:2px;vertical-align:middle;" onerror="this.outerHTML='🏳️'">`;
}

function crestTag(teamName, countryName) {
  if (!teamName) return '⚽';
  const cleanTeam = teamName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  
  let country = countryName;
  if (!country) {
    if (S && S.club && S.club.name === teamName) {
      country = S.club.country;
    } else {
      for (const c in CLUBS) {
        const foundD1 = CLUBS[c].d1.some(item => item[0] === teamName);
        const foundD2 = CLUBS[c].d2 && CLUBS[c].d2.some(item => item[0] === teamName);
        if (foundD1 || foundD2) { country = c; break; }
      }
    }
  }
  const cleanCountry = (country || 'brasil').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");

  return `<img src="assets/teams/${cleanCountry}/${cleanTeam}.png" alt="${teamName}" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;margin-right:6px;" onerror="this.outerHTML='⚽'">`;
}

function playerPhotoTag(name){
  if (!name) return "initText";
    const cleanName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    const initText = initials(name);
    
    const imgId = "img-player-" + Math.random().toString(36).substr(2, 9);
    
    const testImg = new Image();
    testImg.src = "assets/players/" + cleanName + ".png";
    testImg.onerror = function() {
      console.warn("Foto do jogador não encontrada na pasta assets/players/:", name + " (" + cleanName + ".png)");
  };
  return `<img src="assets/players/${cleanName}.png" alt="${name}" style="width:50%;height:50%;object-fit:contain;vertical-align:middle;" onerror="this.outerHTML='${initText}'">`;
}

function overallFromAttrs(attrs, posId){
  const pos = posById(posId);
  let base = 0;
  for(const k in pos.weights){ base += (attrs[k]||0) * pos.weights[k]; }
  const hasStars = attrs.fintas!==undefined && attrs.pernaRuim!==undefined;
  const bonus = hasStars ? ((attrs.fintas + attrs.pernaRuim)/10) * 3 : 0;
  return Math.round(clamp(base + bonus, 30, 99));
}

function starStr(n){
  return '★'.repeat(n) + '☆'.repeat(5-n);
}

function roundRobinDouble(teams){
  const n = teams.length;
  const ids = teams.map((_,i)=>i);
  if(n % 2 !== 0) ids.push(-1);
  const total = ids.length;
  const rounds1 = [];
  const arr = ids.slice();
  for(let r=0;r<total-1;r++){
    const roundPairs = [];
    for(let i=0;i<total/2;i++){
      const a = arr[i], b = arr[total-1-i];
      if(a!==-1 && b!==-1) roundPairs.push(r%2===0?[a,b]:[b,a]);
    }
    rounds1.push(roundPairs);
    arr.splice(1,0,arr.pop());
  }
  const rounds2 = rounds1.map(rp=>rp.map(([a,b])=>[b,a]));
  return rounds1.concat(rounds2);
}

function simScoreline(strA, strB, homeBoost=2){
  const diff = (strA+homeBoost) - strB;
  const baseA = clamp(1.15 + diff/28, 0.25, 3.6);
  const baseB = clamp(1.15 - diff/28, 0.25, 3.6);
  return [poissonish(baseA), poissonish(baseB)];
}
function poissonish(lambda){
  let l = Math.exp(-lambda), k=0, p=1;
  do{ k++; p*=Math.random(); } while(p>l && k<9);
  return k-1;
}

function ordinal(n){ return n+'º'; }

function todayLabel(year, tag){ return `${tag} ${year}`; }

function addNews(text, type){
  S.news.unshift({text, type: type||'info', year:S.year});
  if(S.news.length>60) S.news.length=60;
}

function saveHistoryStat(){
  if(!S.statsBySeason[S.year]) S.statsBySeason[S.year] = {goals:0, assists:0, apps:0, cleanSheets:0, club:S.club.name};
}
function addMatchStat(goals, assists){
  saveHistoryStat();
  S.statsBySeason[S.year].goals += goals;
  S.statsBySeason[S.year].assists += assists;
  S.statsBySeason[S.year].apps += 1;
  S.career.goals += goals;
  S.career.assists += assists;
  S.career.apps += 1;
}

/* ==================================================================
   PARTE 3 — NAVEGAÇÃO DE TELAS E CRIAÇÃO DE PERSONAGEM
   ================================================================== */

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  window.scrollTo({top:0, behavior:'smooth'});
}

function updateTopbar(){
  const el = document.getElementById('topbarMeta');
  if(!S || S.retired){ el.innerHTML=''; return; }
  const moraleInfo = moraleLabel(S.player.morale);
  el.innerHTML = `
    <span class="pill">📅 <b>${S.year}</b></span>
    <span class="pill">🎂 <b>${S.player.age}</b> anos</span>
    <span class="pill">${crestTag(S.club.name, S.club.country)} <b>${S.club.name}</b></span>
    <span class="pill">OVR <b>${S.player.overall}</b></span>
    <span class="pill" title="Moral">${moraleInfo.icon} <b>${moraleInfo.text}</b></span>
  `;
}

function moraleLabel(m){
  m = (m===undefined ? 70 : m);
  if(m>=85) return {icon:'🔥', text:'Inspirado', cls:'high'};
  if(m>=65) return {icon:'😃', text:'Confiante', cls:'good'};
  if(m>=45) return {icon:'😐', text:'Neutro', cls:'mid'};
  if(m>=25) return {icon:'😟', text:'Abalado', cls:'low'};
  return {icon:'💔', text:'Desmotivado', cls:'crit'};
}
function changeMorale(delta, reason){
  const before = S.player.morale;
  S.player.morale = clamp(Math.round(S.player.morale + delta), 0, 100);
  const after = S.player.morale;
  if(reason && Math.abs(after-before)>=6){
    addNews(`${delta>0?'📈':'📉'} Moral ${delta>0?'em alta':'abalada'}: ${reason}`, delta>0?'info':'event');
  }
}
function moraleFactor(){
  const m = S.player.morale===undefined ? 70 : S.player.morale;
  return clamp(0.82 + (m/100)*0.36, 0.82, 1.18);
}

let createState = { nationality:null, position:null };

function initCreateScreen(){
  const natWrap = document.getElementById('chipNationality');
  natWrap.innerHTML = COUNTRIES.map(c=>`
    <div class="chip" data-nat="${c.name}">
      <span class="flag-emoji">${flagEmoji(c.name)}</span>${c.name}
    </div>`).join('');
  natWrap.querySelectorAll('.chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      natWrap.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      createState.nationality = chip.dataset.nat;
    });
  });

  const posWrap = document.getElementById('chipPosition');
  posWrap.innerHTML = POSITIONS.map(p=>`
    <div class="chip" data-pos="${p.id}">${p.icon} ${p.name}</div>
  `).join('');
  posWrap.querySelectorAll('.chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      posWrap.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      createState.position = chip.dataset.pos;
    });
  });
}

document.getElementById('btnGoDraft').addEventListener('click', ()=>{
  const name = document.getElementById('inpName').value.trim();
  const height = parseInt(document.getElementById('inpHeight').value,10);
  const weight = parseInt(document.getElementById('inpWeight').value,10);
  if(!name){ flashField('inpName'); return; }
  if(!createState.nationality){ alertShake('chipNationality'); return; }
  if(!createState.position){ alertShake('chipPosition'); return; }

  S = {
    year: 2026,
    player: {
      name, nationality: createState.nationality, position: createState.position,
      height, weight, age: 17,
      attrs: {fintas:0, pernaRuim:0, drible:0, passe:0, finalizacao:0, velocidade:0, defesa:0, fisico:0},
      overall: 0, potential: 0, outForGames: 0, reputation: 10,
      peakOverall: 0, morale: 70, bannedGames: 0, isCaptain: false,
      trainingFocus: null, penaltyTaker: false, freeKickTaker: false,
    },
    club: null,
    news: [],
    career: {goals:0, assists:0, apps:0, trophies:[], clubHistory:[], awards:[], milestones:[], redCards:0, suspensions:0},
    statsBySeason: {},
    nt: {capped:false, caps:0, lastCampaignBracket:null},
    seasonHistoryFinals: [],
    pendingOffers: null,
  };
  startDraft();
});

function flashField(id){
  const el = document.getElementById(id);
  el.style.borderColor = 'var(--crimson)';
  el.focus();
  setTimeout(()=>{ el.style.borderColor=''; }, 900);
}
function alertShake(id){
  const el = document.getElementById(id);
  el.style.outline = '2px solid var(--crimson)';
  el.style.borderRadius = '10px';
  setTimeout(()=>{ el.style.outline=''; }, 900);
}

/* ==================================================================
   PARTE 4 — DRAFT DE ATRIBUTOS
   ================================================================== */

const ATTR_ORDER_OUTFIELD = ['finalizacao','drible','passe','velocidade','defesa','fisico','fintas','pernaRuim'];
const ATTR_ORDER_GK = ['elasticidade','reflexos','colocacao','agarrar','jogoAereo','reposicao','velocidade','fisico'];
function attrOrderFor(positionId){ return positionId==='GOL' ? ATTR_ORDER_GK : ATTR_ORDER_OUTFIELD; }
const ATTR_LABEL = {finalizacao:'Finalização', drible:'Drible', passe:'Passe', velocidade:'Velocidade', defesa:'Defesa', fisico:'Físico', fintas:'Fintas', pernaRuim:'Perna Ruim', reflexos:'Reflexos', jogoAereo:'Jogo Aéreo', elasticidade:'Elasticidade', colocacao:'Colocação', agarrar:'Agarrar', reposicao:'Reposição'};
const ATTR_ICON = {finalizacao:'🥅', drible:'⚡', passe:'🎯', velocidade:'💨', defesa:'🛡️', fisico:'💪', fintas:'🎩', pernaRuim:'🦶', reflexos:'🧤', jogoAereo:'🙌', elasticidade:'🤸', colocacao:'🧭', agarrar:'🤲', reposicao:'🦵'};
const ATTR_STAR = {fintas:true, pernaRuim:true};

function cardOverallOf(p){
  if(p.elasticidade!==undefined){
    const mean = (p.elasticidade+p.reflexos+p.colocacao+p.agarrar+p.jogoAereo+p.reposicao+p.velocidade+p.fisico)/8;
    return Math.round(clamp(mean,30,99));
  }
  const mean = (p.drible+p.passe+p.finalizacao+p.velocidade+p.defesa+p.fisico)/6;
  const bonus = ((p.fintas+p.pernaRuim)/10)*3;
  return Math.round(clamp(mean+bonus,30,99));
}
function rarityOf(ovr){
  if(ovr>=92) return 'icon';
  if(ovr>=85) return 'gold';
  if(ovr>=75) return 'silver';
  return 'bronze';
}
const RARITY_LABEL = {icon:'ÍCONE', gold:'OURO', silver:'PRATA', bronze:'BRONZE'};

function startDraft(){
  D = { round:1, usedIdx:new Set(), currentIdx:null, rerollsLeft:1, filled:{}, log:[] };
  showScreen('screen-draft');
  document.getElementById('rerollCount').textContent = D.rerollsLeft;
  renderDraftProgress();
  drawCard();
}

function currentDeck(){ return S.player.position==='GOL' ? GK_DB : PLAYER_DB; }

function drawCard(){
  const deck = currentDeck();
  const avail = deck.map((_,i)=>i).filter(i=>!D.usedIdx.has(i));
  const idx = avail.length ? pick(avail) : rnd(0,deck.length-1);
  D.currentIdx = idx;
  D.usedIdx.add(idx);
  document.getElementById('draftRoundNum').textContent = D.round;
  renderDraftCard();
  renderAttrChoices();
  renderDraftProgress();
  renderTakenList();
}

function renderDraftCard(){
  const p = currentDeck()[D.currentIdx];
  const ovr = cardOverallOf(p);
  const rarity = rarityOf(ovr);
  const flag = flagEmoji(p.country);
  const order = attrOrderFor(S.player.position);
  const statsHtml = order.map(key=>{
    const val = p[key];
    const displayVal = ATTR_STAR[key] ? `${val}★` : val;
    return `<div class="st"><span>${ATTR_LABEL[key]}</span><b>${displayVal}</b></div>`;
  }).join('');
  const html = `
    <div class="player-card rarity-${rarity}">
      <div class="card-top">
        <div>
          <div class="card-ovr">${ovr}</div>
          <div class="card-rarity-tag">${RARITY_LABEL[rarity]}</div>
        </div>
        <span class="card-flag">${flag}</span>
      </div>
      <div class="card-avatar">${playerPhotoTag(p.name)}</div>
      <div class="card-name">${p.name}</div>
      <div class="card-meta">${p.country} · ${p.era}</div>
      <div class="card-stats">
        ${statsHtml}
      </div>
    </div>`;
  document.getElementById('draftCard').innerHTML = html;
}

function renderAttrChoices(){
  const p = currentDeck()[D.currentIdx];
  const wrap = document.getElementById('attrChoices');
  wrap.innerHTML = attrOrderFor(S.player.position).map(key=>{
    const taken = D.filled.hasOwnProperty(key);
    const val = p[key];
    const displayVal = ATTR_STAR[key] ? starStr(val) : val;
    return `
      <div class="attr-btn ${taken?'taken':''}" data-key="${key}">
        <span class="an">${ATTR_ICON[key]} ${ATTR_LABEL[key]}</span>
        <span class="av">${taken?'✔ preenchido':displayVal}</span>
      </div>`;
  }).join('');
  wrap.querySelectorAll('.attr-btn:not(.taken)').forEach(btn=>{
    btn.addEventListener('click', ()=>selectAttribute(btn.dataset.key));
  });
}

function renderDraftProgress(){
  const total = 8;
  const doneCount = Object.keys(D.filled).length;
  let html='';
  for(let i=0;i<total;i++){
    let cls='';
    if(i<doneCount) cls='done'; else if(i===doneCount) cls='current';
    html += `<i class="${cls}"></i>`;
  }
  document.getElementById('draftProgress').innerHTML = html;
}

function renderTakenList(){
  const wrap = document.getElementById('draftTakenList');
  wrap.innerHTML = D.log.map(l=>`<span class="taken-tag">${ATTR_ICON[l.attr]} ${ATTR_LABEL[l.attr]}: <b>${ATTR_STAR[l.attr]?starStr(l.value):l.value}</b> (${l.source})</span>`).join('');
}

function selectAttribute(key){
  if(D.filled.hasOwnProperty(key)) return;
  const p = currentDeck()[D.currentIdx];
  const val = p[key];
  D.filled[key] = val;
  D.log.push({attr:key, value:val, source:p.name});
  D.round++;
  if(Object.keys(D.filled).length >= 8){
    finishDraft();
    return;
  }
  drawCard();
}

document.getElementById('btnReroll').addEventListener('click', ()=>{
  if(D.rerollsLeft<=0) return;
  D.rerollsLeft--;
  document.getElementById('rerollCount').textContent = D.rerollsLeft;
  document.getElementById('btnReroll').disabled = D.rerollsLeft<=0;
  drawCard();
});

function applyYouthDiscount(rawAttrs){
  const factor = rndf(0.68, 0.82);
  const starFactor = clamp(factor + 0.12, 0.7, 0.95);
  const out = {};
  for(const k in rawAttrs){
    const v = rawAttrs[k];
    if(ATTR_STAR[k]) out[k] = Math.max(1, Math.round(v * starFactor));
    else out[k] = Math.max(20, Math.round(v * factor));
  }
  return out;
}

function finishDraft(){
  const rawAttrs = Object.assign({}, D.filled);
  const rawOverall = overallFromAttrs(rawAttrs, S.player.position);
  S.player.potential = clamp(rawOverall + rnd(4,14), Math.min(rawOverall+2,97), 99);
  S.player.attrs = applyYouthDiscount(rawAttrs);
  S.player.overall = overallFromAttrs(S.player.attrs, S.player.position);
  S.player.peakOverall = S.player.overall;
  renderDraftSummary();
}

function renderDraftSummary(){
  const pos = posById(S.player.position);
  const html = `
    <p class="section-label">Draft concluído</p>
    <h2 class="screen-title">Seu craque está pronto</h2>
    <p class="screen-sub">${S.player.name} — ${pos.icon} ${pos.name} · ${S.player.nationality}</p>
    <div class="career-grid" style="grid-template-columns:280px 1fr;">
      <div id="draftSummaryCardWrap"></div>
      <div>
        <p class="section-label">Origem de cada atributo</p>
        <div class="draft-taken-list">${D.log.map(l=>`<span class="taken-tag">${ATTR_ICON[l.attr]} ${ATTR_LABEL[l.attr]}: <b>${ATTR_STAR[l.attr]?starStr(l.value):l.value}</b> — ${l.source}</span>`).join('')}</div>
        <div class="divider"></div>
        <p class="draft-side-note">Overall calculado com base nos pesos da posição <b>${pos.name}</b>. Potencial define o teto de evolução do seu jogador ao longo da carreira.</p>
        <div class="btn-row">
          <button class="btn btn-primary btn-block" id="btnStartCareer">Começar Carreira →</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('draftSummaryPanel').innerHTML = html;
  const rarity = rarityOf(S.player.overall);
  const summaryStatsHtml = attrOrderFor(S.player.position).map(key=>{
    const val = S.player.attrs[key];
    const displayVal = ATTR_STAR[key] ? `${val}★` : val;
    return `<div class="st"><span>${ATTR_LABEL[key]}</span><b>${displayVal}</b></div>`;
  }).join('');
  document.getElementById('draftSummaryCardWrap').innerHTML = `
    <div class="player-card rarity-${rarity}" style="animation:none;">
      <div class="card-top">
        <div><div class="card-ovr">${S.player.overall}</div><div class="card-rarity-tag">POT ${S.player.potential}</div></div>
        <span class="card-flag">${flagEmoji(S.player.nationality)}</span>
      </div>
      <div class="card-avatar">${playerPhotoTag(S.player.name)}</div>
      <div class="card-name">${S.player.name}</div>
      <div class="card-meta">${pos.name} · 17 anos</div>
      <div class="card-stats">
        ${summaryStatsHtml}
      </div>
    </div>`;
  document.getElementById('btnStartCareer').addEventListener('click', ()=>{
    assignStartingClub();
    initSeason(true);
    showScreen('screen-career');
    renderCareer();
  });
  showScreen('screen-draftsummary');
}

/* ==================================================================
   PARTE 5 — CLUBE INICIAL, TEMPORADA E MOTOR DE COMPETIÇÕES
   ================================================================== */

const ALL_CLUBS_FLAT = [];
for(const country in CLUBS){
  CLUBS[country].d1.forEach(([name,str])=>ALL_CLUBS_FLAT.push({name,str,country,division:1}));
  CLUBS[country].d2.forEach(([name,str])=>ALL_CLUBS_FLAT.push({name,str,country,division:2}));
}

const RIVAL_NATIONS = {
  CONMEBOL: ['Argentina','Uruguai','Colômbia','Chile','Peru','Paraguai','Brasil'],
  UEFA: ['França','Alemanha','Espanha','Itália','Inglaterra','Portugal','Holanda','Bélgica'],
  CONCACAF: ['México','Estados Unidos','Costa Rica','Canadá'],
  AFC: ['Japão','Coreia do Sul','Austrália','Arábia Saudita'],
  CAF: ['Nigéria','Senegal','Marrocos','Egito','Gana'],
};
const ALL_RIVAL_NATIONS = Object.values(RIVAL_NATIONS).flat();

let pendingEvent = null;

function countryConfed(name){
  const c = COUNTRIES.find(x=>x.name===name);
  return c ? c.confed : CONFED.UEFA;
}

function assignStartingClub(){
  const country = S.player.nationality;
  const clubs = CLUBS[country];
  const useD2 = Math.random()<0.85 && clubs.d2 && clubs.d2.length>0;
  const pool = useD2 ? clubs.d2 : clubs.d1;
  const [name,str] = pick(pool);
  S.club = { name, str, division: useD2?2:1, country, confed: countryConfed(country), prevLeagueRank:null };
  S.career.clubHistory.push({club:name, startYear:S.year, country:country});
  addNews(`${S.player.name} inicia a carreira profissional no ${name} (${country}) — Divisão ${S.club.division}.`, 'transfer');
}

function meTeamStrength(){
  return clamp(S.club.str + Math.round((S.player.overall-70)/6), 30, 99);
}

function buildDivisionArray(){
  const clubs = CLUBS[S.club.country];
  const pool = S.club.division===1 ? clubs.d1 : clubs.d2;
  const others = pool.filter(([n])=>n!==S.club.name).map(([name,str])=>({name,str,isMe:false}));
  const me = {name:S.club.name, str: meTeamStrength(), isMe:true};
  return [me, ...others];
}

function buildTable(){
  const arr = buildDivisionArray();
  S._divisionArr = arr;
  const table = {};
  arr.forEach(c=>{ table[c.name] = {name:c.name, str:c.str, isMe:c.isMe, pj:0,v:0,e:0,d:0,gp:0,gc:0,pts:0}; });
  return table;
}

function buildLeagueQueue(){
  const arr = S._divisionArr;
  const rounds = roundRobinDouble(arr);
  const queue = [];
  rounds.forEach(round=>round.forEach(([h,a])=>queue.push({home:arr[h].name, away:arr[a].name})));
  return queue;
}

function updateTableWithResult(table, home, away, gh, ga){
  const th=table[home], ta=table[away];
  th.pj++; ta.pj++; th.gp+=gh; th.gc+=ga; ta.gp+=ga; ta.gc+=gh;
  if(gh>ga){ th.v++; th.pts+=3; ta.d++; }
  else if(gh<ga){ ta.v++; ta.pts+=3; th.d++; }
  else { th.e++; ta.e++; th.pts++; ta.pts++; }
}

function eliteCurveOuter(q){ return Math.pow(q, 1.7); }

function applyPersonalMatchStats(teamGoals){
  const pos = posById(S.player.position);
  const isAttacker = ['PON','ATA'].includes(pos.id);
  const isMidfield = ['MEI','VOL'].includes(pos.id);
  const isKeeper = pos.id==='GOL';
  const a = S.player.attrs;
  const quality = clamp((S.player.overall-60)/40, 0, 1);
  const mf = moraleFactor();
  let myGoals=0, myAssists=0;
  for(let g=0; g<teamGoals; g++){
    const eliteCurve = Math.pow(quality, 1.7);
    let involvementChance = isKeeper ? 0.02
      : isAttacker ? (0.42 + eliteCurve*0.48)
      : isMidfield ? (0.27 + eliteCurve*0.36)
      : (0.13 + eliteCurve*0.20);
    involvementChance = clamp(involvementChance * mf, 0.02, 0.88);
    if(Math.random()<involvementChance){
      const finish = a.finalizacao || 40;
      let scoreChance = isKeeper ? 0.1
        : isAttacker ? clamp(0.48 + finish/300, 0.42, 0.78)
        : isMidfield ? clamp(0.32 + finish/340, 0.26, 0.56)
        : clamp(0.18 + finish/380, 0.13, 0.38);
      if(Math.random()<scoreChance) myGoals++; else myAssists++;
    }
  }
  if(!isKeeper && (S.player.penaltyTaker || S.player.freeKickTaker) && teamGoals>0 && Math.random() < 0.14*eliteCurveOuter(quality)*mf){
    myGoals++;
  }
  addMatchStat(myGoals, myAssists);
  checkMilestones();
  return {myGoals, myAssists};
}

function buildCup(){
  const clubs = CLUBS[S.club.country];
  const allOthers = [...clubs.d1, ...clubs.d2].filter(([n])=>n!==S.club.name).map(([name,str])=>({name,str}));
  const chosen = sample(allOthers, Math.min(7, allOthers.length));
  const entrants = shuffle([{name:S.club.name, str:meTeamStrength(), isMe:true}, ...chosen.map(c=>({...c,isMe:false}))]);
  return { roundsNames:['Quartas de Final','Semifinal','Final'], round:0, teams:entrants, done:false, alive:true, champion:null, log:[] };
}

function continentalOpponentPool(confed, ownClubName){
  const pool = [];
  for(const countryName in CLUBS){
    if(countryConfed(countryName) !== confed) continue;
    CLUBS[countryName].d1.forEach(([name,str])=>{ if(name!==ownClubName) pool.push({name,str}); });
    CLUBS[countryName].d2.forEach(([name,str])=>{ if(name!==ownClubName) pool.push({name,str}); });
  }
  (CONTINENTAL_FILLERS[confed]||[]).forEach(([name,str])=>{ if(name!==ownClubName) pool.push({name,str}); });
  return pool;
}

function buildContinental(){
  const qualifies = S.club.division===1 && ( (S.club.prevLeagueRank!=null && S.club.prevLeagueRank<=3) || (S.club.prevLeagueRank==null && S.club.str>=80) );
  if(!qualifies) return null;
  const pool = continentalOpponentPool(S.club.confed, S.club.name);
  const need = 7;
  const chosen = sample(pool, Math.min(need, pool.length));
  const fillers = chosen.map(c=>({name:c.name, str:c.str, isMe:false}));
  while(fillers.length<need) fillers.push({name:'Clube Continental FC', str:65, isMe:false});
  const compName = CLUB_COMPS[S.club.confed].cont;
  addNews(`${S.club.name} está classificado(a) para a ${compName} ${S.year}!`, 'info');
  return { roundsNames:['Fase de Grupos','Quartas de Final','Semifinal','Final'], round:0,
    teams: shuffle([{name:S.club.name,str:meTeamStrength(),isMe:true}, ...fillers]), done:false, alive:true, champion:null, log:[] };
}

function buildNational(){
  const called = S.player.overall>=76 && S.player.age>=18;
  if(!called) return null;
  const ntConfed = countryConfed(S.player.nationality);
  const yearMod = S.year % 4;
  const isWorldCup = yearMod===2;
  const isContinental = yearMod===0;
  S.nt.capped = true;
  S.nt.caps++;
  let natObj;
  if(!isWorldCup && !isContinental){
    natObj = { label: NT_COMPS[ntConfed].qualifier, year:S.year, roundsNames:['Eliminatórias'],
      round:0, hasFinalDrama:false, done:false, alive:true, champion:null, log:[] };
  } else {
    const label = isWorldCup ? 'Copa do Mundo' : NT_COMPS[ntConfed].continental;
    addNews(`🌍 ${S.player.name} é convocado(a) pela Seleção ${S.player.nationality} para a ${label} de ${S.year}!`, 'info');
    natObj = { label, year:S.year, roundsNames:['Fase de Grupos','Oitavas de Final','Quartas de Final','Semifinal','Final'],
      round:0, hasFinalDrama:true, isWorldCup, done:false, alive:true, champion:null, log:[] };
  }
  S.nt.lastCampaignBracket = natObj;
  return natObj;
}

function resolveNormalMatch(a,b){
  const [ga,gb] = simScoreline(a.str, b.str, 1);
  if(a.isMe || b.isMe){
    const myGoals = a.isMe ? ga : gb;
    if(S.player.bannedGames>0) S.player.bannedGames--;
    else if(S.player.outForGames>0) S.player.outForGames--;
    else applyPersonalMatchStats(myGoals);
  }
  let winner;
  if(ga===gb) winner = Math.random() < a.str/(a.str+b.str) ? a : b;
  else winner = ga>gb ? a : b;
  return { winner, scoreA:ga, scoreB:gb, wentToPenalties: ga===gb };
}

function logBracketResult(bracket, compName, a, b, winner, isFinal, scoreA, scoreB, wentToPenalties){
  bracket.log.push({round:bracket.roundsNames[bracket.round], a:a.name, b:b.name, winner:winner.name, scoreA, scoreB, wentToPenalties});
  if(a.isMe || b.isMe){
    const oppo = a.isMe ? b : a;
    const scoreTxt = (scoreA!==undefined && scoreB!==undefined) ? ` (${scoreA}-${scoreB}${wentToPenalties?' nos pênaltis':''})` : '';
    if(winner.isMe) addNews(`${S.club.name} vence ${oppo.name}${scoreTxt} e avança na ${compName}${isFinal?' — CAMPEÃO!':''}.`, isFinal?'trophy':'info');
    else addNews(`${S.club.name} é eliminado(a) pelo ${oppo.name}${scoreTxt} na ${compName}${isFinal?' (vice-campeão)':''}.`, 'event');
  }
}

function awardTrophy(name, isNational){
  const context = isNational ? S.player.nationality : S.club.name;
  S.career.trophies.push({name, year:S.year, club:context, isNational: !!isNational});
  addNews(`🏆 ${S.player.name} conquista: ${name} (${S.year})!`, 'trophy');
}

function awardIndividual(name, detail){
  S.career.awards.push({name, year:S.year, club:S.club.name, detail});
  addNews(`🏅 ${S.player.name} conquista o prêmio ${name}! (${detail})`, 'trophy');
}

function checkSeasonAwards(){
  const stat = S.statsBySeason[S.year];
  if(!stat) return;
  const trophiesThisSeason = S.career.trophies.filter(t=>t.year===S.year);

  if(S.player.overall>=87){
    const score = S.player.overall + stat.goals*0.6 + stat.assists*0.4 + trophiesThisSeason.length*15;
    const threshold = 125;
    if(score>=threshold){
      const chance = clamp((score-threshold)/45, 0.1, 0.6);
      if(Math.random()<chance) awardIndividual('Bola de Ouro', `${stat.goals} gols e ${stat.assists} assistências pelo ${stat.club}`);
    }
  }

  if(stat.goals>0){
    const threshold = S.club.division===1 ? 16 : 12;
    if(stat.goals>=threshold){
      const chance = clamp((stat.goals-threshold)/12, 0.2, 0.9);
      if(Math.random()<chance) awardIndividual('Chuteira de Ouro', `${stat.goals} gols pelo ${stat.club}`);
    }
  }

  if(S.player.age<=21 && S.player.overall>=68){
    const score = S.player.overall + stat.goals*0.8 + stat.assists*0.5;
    const threshold = 78;
    if(score>=threshold){
      const chance = clamp((score-threshold)/22, 0.25, 0.9);
      if(Math.random()<chance) awardIndividual('Revelação do Ano', `${S.player.age} anos, overall ${S.player.overall}`);
    }
  }

  if(S.player.position==='GOL' && stat.cleanSheets>=10){
    const chance = clamp((stat.cleanSheets-10)/12, 0.15, 0.7);
    if(Math.random()<chance) awardIndividual('Luva de Ouro', `${stat.cleanSheets} jogos sem sofrer gol pelo ${stat.club}`);
  }
}

function checkCraqueDaFinal(compName, wonFinal){
  if(!wonFinal) return;
  const isBigFinal = /Libertadores|Champions|Copa do Mundo|Copa América|Eurocopa|Copa da Ásia|Copa Ouro|Copa Africana|Sul-Americana|Europa League/i.test(compName);
  if(!isBigFinal) return;
  awardIndividual('Craque da Final', `decidiu a final da ${compName} (${S.year})`);
}

function processKnockoutStep(bracket, compName){
  if(bracket.done) return null;
  if(bracket.teams.length===1){
    bracket.done=true; bracket.champion=bracket.teams[0];
    if(bracket.champion.isMe) awardTrophy(compName);
    return null;
  }
  const isFinalRound = bracket.round === bracket.roundsNames.length-1;
  if(isFinalRound){
    const a=bracket.teams[0], b=bracket.teams[1];
    const involvesMe = a.isMe || b.isMe;
    if(involvesMe && !autoMode){
      return { type:'MATCH', compName, roundName:bracket.roundsNames[bracket.round], teamA:a, teamB:b,
        onResolve:(winnerSide, scoreInfo)=>{
          const winner = winnerSide==='A' ? a : b;
          let scoreA, scoreB;
          if(scoreInfo){
            scoreA = a.isMe ? scoreInfo.scoreMe : scoreInfo.scoreOpp;
            scoreB = b.isMe ? scoreInfo.scoreMe : scoreInfo.scoreOpp;
          }
          logBracketResult(bracket, compName, a, b, winner, true, scoreA, scoreB, scoreA===scoreB);
          bracket.teams=[winner]; bracket.round++; bracket.done=true; bracket.champion=winner;
          if(winner.isMe) awardTrophy(compName);
        }};
    }
    let winner, scoreA, scoreB, wentToPenalties;
    if(involvesMe && autoMode){
      const res = simulateFinalAuto(a,b,compName);
      winner = res.winnerTeam;
      scoreA = a.isMe ? res.meScore : res.oppScore;
      scoreB = b.isMe ? res.meScore : res.oppScore;
      wentToPenalties = res.meScore===res.oppScore;
    } else {
      const res = resolveNormalMatch(a,b);
      winner = res.winner; scoreA = res.scoreA; scoreB = res.scoreB; wentToPenalties = res.wentToPenalties;
    }
    logBracketResult(bracket, compName, a, b, winner, true, scoreA, scoreB, wentToPenalties);
    bracket.teams=[winner]; bracket.round++; bracket.done=true; bracket.champion=winner;
    if(winner.isMe) awardTrophy(compName);
    return null;
  }
  const teams = bracket.teams;
  const nextTeams = [];
  for(let i=0;i<teams.length;i+=2){
    const ta=teams[i], tb=teams[i+1];
    if(!tb){ nextTeams.push(ta); continue; }
    const res = resolveNormalMatch(ta,tb);
    logBracketResult(bracket, compName, ta, tb, res.winner, false, res.scoreA, res.scoreB, res.wentToPenalties);
    nextTeams.push(res.winner);
  }
  bracket.teams = nextTeams;
  bracket.round++;
  if(!nextTeams.some(t=>t.isMe)){ bracket.alive=false; bracket.done=true; }
  return null;
}

function advanceCup(){
  if(!S.season.cup || S.season.cup.done) return null;
  return processKnockoutStep(S.season.cup, CLUB_COMPS[S.club.confed].cup);
}
function advanceContinental(){
  if(!S.season.continental || S.season.continental.done) return null;
  return processKnockoutStep(S.season.continental, CLUB_COMPS[S.club.confed].cont);
}

function advanceNational(){
  const nat = S.season.national;
  if(!nat || nat.done) return null;
  const ntConfed = countryConfed(S.player.nationality);
  const rivalPool = nat.isWorldCup ? ALL_RIVAL_NATIONS : (RIVAL_NATIONS[ntConfed]||[]);
  const rivals = rivalPool.filter(n=>n!==S.player.nationality);
  const oppName = rivals.length ? pick(rivals) : 'Seleção Rival';
  const oppStrength = 76 + rnd(-6,12);
  const myStrength = 78 + Math.round((S.player.overall-75)/5);
  const roundName = nat.roundsNames[nat.round];
  const isFinalRound = nat.round === nat.roundsNames.length-1;

  if(isFinalRound && nat.hasFinalDrama){
    if(!autoMode){
      return { type:'MATCH', compName:nat.label, roundName, isNational:true,
        teamA:{name:S.player.nationality, str:myStrength, isMe:true},
        teamB:{name:oppName, str:oppStrength, isMe:false},
        onResolve:(winnerSide, scoreInfo)=>{
          const won = winnerSide==='A';
          const score = scoreInfo ? `${scoreInfo.scoreMe}-${scoreInfo.scoreOpp}` : undefined;
          nat.log.push({round:roundName, opponent:oppName, score, result: won?'venceu':'perdeu'});
          nat.done=true;
          nat.champion = won ? S.player.nationality : oppName;
          if(won) awardTrophy(nat.label+' (Seleção)', true);
          else addNews(`${S.player.nationality} perde a final da ${nat.label} para ${oppName}.`, 'event');
        }};
    }
    const res = simulateFinalAuto({name:S.player.nationality,str:myStrength,isMe:true}, {name:oppName,str:oppStrength,isMe:false}, nat.label+' (Seleção)', true);
    nat.log.push({round:roundName, opponent:oppName, score:`${res.meScore}-${res.oppScore}`, result: res.winnerIsMe?'venceu':'perdeu'});
    nat.done = true;
    nat.champion = res.winnerIsMe ? S.player.nationality : oppName;
    return null;
  }

  const [myG, oppG] = simScoreline(myStrength, oppStrength, 1);
  if(S.player.bannedGames>0) S.player.bannedGames--;
  else if(S.player.outForGames>0) S.player.outForGames--;
  else applyPersonalMatchStats(myG);
  let passed, wentToPenalties = false;
  if(myG===oppG){ wentToPenalties = true; passed = Math.random() < myStrength/(myStrength+oppStrength); }
  else passed = myG > oppG;
  nat.log.push({round:roundName, opponent:oppName, score:`${myG}-${oppG}`, result: passed?'venceu':'eliminado', wentToPenalties});
  if(passed){
    addNews(`${S.player.nationality} avança na ${nat.label} após vencer ${oppName} por ${myG}-${oppG}${wentToPenalties?' nos pênaltis':''}.`, 'info');
    nat.round++;
    if(nat.round >= nat.roundsNames.length) nat.done = true;
  } else {
    addNews(`${S.player.nationality} é eliminado(a) da ${nat.label} pela ${oppName} (${myG}-${oppG}${wentToPenalties?', nos pênaltis':''}).`, 'event');
    nat.done = true; nat.alive = false;
  }
  return null;
}

function generateRandomEvent(){
  const pool = [];
  const w = (weight, fn)=>{ for(let i=0;i<weight;i++) pool.push(fn); };

  w(10, ()=>{
    const games = rnd(2,6);
    return {type:'injury', icon:'🩹', title:'Lesão!', games,
      text:`${S.player.name} sente dores musculares durante o jogo e será desfalque por ${games} partida(s).`};
  });
  w(7, ()=>({type:'locker', icon:'🗣️', title:'Polêmica de Vestiário',
    text:`Uma discussão nos bastidores do ${S.club.name} gera desgaste entre ${S.player.name} e o elenco.`}));
  w(7, ()=>({type:'crowd', icon:'📣', title:'Crise com a Torcida',
    text:`Após resultados ruins, a torcida do ${S.club.name} cobra publicamente mais entrega de ${S.player.name}.`}));
  w(6, ()=>{
    const c = pick(ALL_CLUBS_FLAT.filter(c=>c.name!==S.club.name));
    return {type:'flash_offer', icon:'⚡', title:'Oferta Relâmpago!', club:c,
      text:`O ${c.name} apresenta uma proposta-relâmpago no meio da temporada, mas a diretoria do ${S.club.name} nega a negociação por ora.`};
  });
  w(6, ()=>({type:'contract', icon:'📝', title:'Renovação de Contrato',
    text:`A diretoria do ${S.club.name} oferece renovação com aumento salarial a ${S.player.name}. O elenco vê como sinal de prestígio.`}));
  w(6, ()=>({type:'coach_clash', icon:'😤', title:'Atrito com o Técnico',
    text:`${S.player.name} discorda publicamente do esquema tático e o treinador do ${S.club.name} não gosta nada da declaração.`}));
  w(6, ()=>({type:'starting_fight', icon:'⚔️', title:'Disputa por Titularidade',
    text:`Um reforço chega ao ${S.club.name} para brigar diretamente pela posição de ${S.player.name}.`}));
  w(5, ()=>({type:'interview', icon:'🎤', title:'Entrevista Polêmica',
    text:`${S.player.name} solta o verbo em entrevista sobre a arbitragem e a imprensa repercute em peso.`}));
  w(5, ()=>({type:'charity', icon:'💚', title:'Ação Social',
    text:`${S.player.name} financia um projeto social no bairro onde cresceu. A torcida do ${S.club.name} aplaude de pé.`}));
  w(5, ()=>({type:'red_card', icon:'🟥', title:'Cartão Vermelho!',
    text:`${S.player.name} se desentende com um adversário e é expulso(a) de campo. Suspensão automática.`, games: rnd(1,3)}));
  w(4, ()=>({type:'sponsor', icon:'💼', title:'Contrato de Patrocínio',
    text:`Uma marca esportiva global fecha patrocínio individual com ${S.player.name}. A projeção internacional dispara.`}));
  w(4, ()=>({type:'captain_offer', icon:'🎗️', title:'Faixa de Capitão',
    text:`O técnico do ${S.club.name} entrega a braçadeira de capitão a ${S.player.name}.`}));
  w(4, ()=>({type:'fan_icon', icon:'🌟', title:'Ídolo da Torcida',
    text:`A torcida do ${S.club.name} criou um cântico exclusivo para ${S.player.name}. O estádio inteiro canta.`}));
  w(3, ()=>({type:'training_hard', icon:'🏋️', title:'Dedicação nos Treinos',
    text:`${S.player.name} tem ficado depois do treino todos os dias. A comissão técnica elogia publicamente.`}));
  w(3, ()=>({type:'party', icon:'🍾', title:'Festa na Véspera',
    text:`Fotos de ${S.player.name} numa festa na véspera do jogo vazam na imprensa. A diretoria não gostou.`}));
  w(3, ()=>({type:'betting_invite', icon:'🎲', title:'Convite Suspeito',
    text:`Um intermediário procura ${S.player.name} oferecendo dinheiro para influenciar lances de uma partida. O que fazer?`,
    choice:true}));
  w(2, ()=>({type:'betting_probe', icon:'🔍', title:'Investigação de Manipulação',
    text:`A federação abre investigação sobre apostas suspeitas em jogos do ${S.club.name}. ${S.player.name} é chamado(a) a depor.`}));
  w(1, ()=>({type:'tax_probe', icon:'🧾', title:'Problemas com o Fisco',
    text:`A receita aponta irregularidades nos direitos de imagem de ${S.player.name}. O caso vira manchete nacional.`}));

  return pick(pool)();
}

function maybeTriggerRandomEvent(){
  if(pendingEvent) return;
  if(Math.random() < 0.11) pendingEvent = generateRandomEvent();
}

function applyEventEffect(ev, choiceId){
  switch(ev.type){
    case 'injury':
      S.player.outForGames += ev.games;
      changeMorale(-8);
      break;
    case 'red_card':
      S.player.bannedGames += ev.games;
      S.career.redCards++;
      S.career.suspensions++;
      changeMorale(-10);
      addNews(`🟥 ${S.player.name} cumpre suspensão de ${ev.games} jogo(s).`, 'event');
      break;
    case 'locker':
      S.player.reputation = clamp(S.player.reputation-1, 0, 20);
      changeMorale(-12);
      break;
    case 'crowd':
      S.player.reputation = clamp(S.player.reputation-1, 0, 20);
      changeMorale(-14);
      break;
    case 'coach_clash':
      changeMorale(-16);
      S.player.reputation = clamp(S.player.reputation-1, 0, 20);
      break;
    case 'starting_fight':
      changeMorale(-10);
      break;
    case 'interview':
      changeMorale(-6);
      S.player.reputation = clamp(S.player.reputation-1, 0, 20);
      break;
    case 'party':
      changeMorale(-12);
      S.player.reputation = clamp(S.player.reputation-2, 0, 20);
      break;
    case 'contract':
      changeMorale(+16);
      S.player.reputation = clamp(S.player.reputation+1, 0, 20);
      break;
    case 'sponsor':
      changeMorale(+12);
      S.player.reputation = clamp(S.player.reputation+2, 0, 20);
      break;
    case 'charity':
      changeMorale(+10);
      S.player.reputation = clamp(S.player.reputation+2, 0, 20);
      break;
    case 'fan_icon':
      changeMorale(+18);
      S.player.reputation = clamp(S.player.reputation+1, 0, 20);
      break;
    case 'training_hard':
      changeMorale(+8);
      break;
    case 'captain_offer':
      S.player.isCaptain = true;
      changeMorale(+15);
      S.player.reputation = clamp(S.player.reputation+2, 0, 20);
      break;
    case 'flash_offer':
      changeMorale(+5);
      break;
    case 'betting_invite': {
      if(choiceId==='accept'){
        const caught = Math.random() < 0.45;
        if(caught){
          const ban = rnd(20, 60);
          S.player.bannedGames += ban;
          S.career.suspensions++;
          changeMorale(-40);
          S.player.reputation = clamp(S.player.reputation-8, 0, 20);
          S.career.milestones.push({year:S.year, text:`⛓️ Condenado(a) por manipulação de resultados — ${ban} jogos de suspensão`});
          addNews(`⛓️ ESCÂNDALO: ${S.player.name} é flagrado(a) em esquema de manipulação e pega ${ban} jogos de suspensão!`, 'event');
        } else {
          changeMorale(-6);
          addNews(`🤫 ${S.player.name} aceita o acordo e ninguém desconfia... por enquanto.`, 'event');
          S.player.underBettingSuspicion = true;
        }
      } else {
        changeMorale(+10);
        S.player.reputation = clamp(S.player.reputation+2, 0, 20);
        addNews(`🛡️ ${S.player.name} denuncia o aliciador e é elogiado(a) pela integridade.`, 'info');
      }
      break;
    }
    case 'betting_probe': {
      const guilty = S.player.underBettingSuspicion && Math.random()<0.6;
      if(guilty){
        const ban = rnd(15, 45);
        S.player.bannedGames += ban;
        S.career.suspensions++;
        changeMorale(-35);
        S.player.reputation = clamp(S.player.reputation-6, 0, 20);
        S.player.underBettingSuspicion = false;
        S.career.milestones.push({year:S.year, text:`⛓️ Punido(a) em investigação de apostas — ${ban} jogos`});
        addNews(`⛓️ A investigação alcança ${S.player.name}: ${ban} jogos de suspensão!`, 'event');
      } else {
        changeMorale(-10);
        addNews(`✅ ${S.player.name} é inocentado(a) na investigação de apostas.`, 'info');
      }
      break;
    }
    case 'tax_probe': {
      changeMorale(-18);
      S.player.reputation = clamp(S.player.reputation-3, 0, 20);
      if(Math.random()<0.3){
        const ban = rnd(5,15);
        S.player.bannedGames += ban;
        S.career.suspensions++;
        addNews(`⚖️ ${S.player.name} é condenado(a) e afastado(a) por ${ban} jogos enquanto resolve a pendência judicial.`, 'event');
      } else {
        addNews(`⚖️ ${S.player.name} faz acordo com o fisco e evita punição esportiva.`, 'info');
      }
      break;
    }
  }
  if(ev.type!=='betting_invite' && ev.type!=='betting_probe' && ev.type!=='tax_probe' && ev.type!=='red_card'){
    addNews(ev.text, ['contract','sponsor','charity','fan_icon','training_hard','captain_offer'].includes(ev.type) ? 'info' : 'event');
  }
}

const MILESTONES = {
  goals:   [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1250],
  assists: [50, 100, 200, 300, 400, 500, 600, 750, 1000],
  apps:    [100, 250, 500, 750, 1000, 1250],
};
function checkMilestones(){
  const c = S.career;
  const check = (key, label, icon)=>{
    MILESTONES[key].forEach(mark=>{
      if(c[key] >= mark && !c.milestones.some(m=>m.key===key && m.mark===mark)){
        c.milestones.push({key, mark, year:S.year, text:`${icon} ${mark} ${label} na carreira`});
        addNews(`${icon} MARCO HISTÓRICO: ${S.player.name} atinge ${mark} ${label} na carreira!`, 'trophy');
        changeMorale(+8);
      }
    });
  };
  check('goals', 'gols', '⚽');
  check('assists', 'assistências', '🎯');
  check('apps', 'jogos', '👕');
}

function advanceLeagueOneMatch(){
  const season = S.season;
  if(season.leagueIdx >= season.leagueQueue.length) return null;
  const fx = season.leagueQueue[season.leagueIdx];
  season.leagueIdx++;
  const table = season.table;
  const [gh,ga] = simScoreline(table[fx.home].str, table[fx.away].str, 2);
  updateTableWithResult(table, fx.home, fx.away, gh, ga);
  const meInvolved = (fx.home===S.club.name || fx.away===S.club.name);
  if(meInvolved){
    let personal = {myGoals:0, myAssists:0};
    if(S.player.bannedGames>0){ S.player.bannedGames--; }
    else if(S.player.outForGames>0){ S.player.outForGames--; }
    else { const myGoalsTeam = fx.home===S.club.name?gh:ga; personal = applyPersonalMatchStats(myGoalsTeam); }
    const isHome = fx.home===S.club.name;
    const my = isHome?gh:ga, their = isHome?ga:gh;
    const oppName = isHome?fx.away:fx.home;
    if(S.player.position==='GOL' && S.player.outForGames<=0 && their===0){
      saveHistoryStat();
      S.statsBySeason[S.year].cleanSheets++;
    }
    if(S.player.bannedGames<=0 && S.player.outForGames<=0){
      changeMorale(my>their ? 2 : my<their ? -2.5 : 0);
      if(personal.myGoals>=2) changeMorale(+4);
    }
    const resultWord = my>their?'Vitória':my<their?'Derrota':'Empate';
    const resultIcon = my>their?'✅':my<their?'❌':'➖';
    let text = `${resultIcon} ${resultWord} por ${my}-${their} vs ${oppName} — ${CLUB_COMPS[S.club.confed].league} ${S.club.division}.`;
    if(personal.myGoals>0) text += ` Você marcou ${personal.myGoals} gol(s)! ⚽`;
    else if(personal.myAssists>0) text += ` Você deu ${personal.myAssists} assistência(s).`;
    addNews(text, 'info');
    maybeTriggerRandomEvent();
  }
  if(pendingEvent){
    if(!autoMode){ const ev=pendingEvent; pendingEvent=null; return {type:'EVENT', event:ev}; }
    applyEventEffect(pendingEvent); pendingEvent=null;
  }
  return null;
}

function evolvePlayer(){
  const age = S.player.age;
  const attrs = S.player.attrs;
  let growth;
  if(age<=23) growth = rndf(1.5,4.5);
  else if(age<=29) growth = rndf(-0.5,2);
  else if(age<=33) growth = rndf(-3,0);
  else growth = rndf(-6,-2);
  const stat = S.statsBySeason[S.year] || {goals:0,assists:0,apps:0};
  const perf = clamp(stat.goals*0.3 + stat.assists*0.2 + stat.apps*0.05, 0, 6);
  const delta = growth + (age<=29 ? perf*0.4 : 0);
  const focus = S.player.trainingFocus;
  const moraleBoost = ((S.player.morale===undefined?70:S.player.morale) - 50) / 250;
  Object.keys(attrs).filter(k=>k!=='fintas'&&k!=='pernaRuim').forEach(k=>{
    const room = Math.max(S.player.potential - S.player.overall, 0);
    let d = delta * rndf(0.6,1.15) * (1 + moraleBoost);
    if(focus===k && d>0) d *= 1.9;
    else if(focus===k && d<0) d *= 0.45;
    if(d>0) d = Math.min(d, room*0.35 + 1.4);
    attrs[k] = clamp(Math.round(attrs[k]+d), 1, 99);
  });
  if(attrs.fintas!==undefined && delta>0 && Math.random()<0.15) attrs.fintas = clamp(attrs.fintas+1,0,5);
  if(attrs.pernaRuim!==undefined && delta>0 && Math.random()<0.15) attrs.pernaRuim = clamp(attrs.pernaRuim+1,0,5);
  if(delta<-3 && Math.random()<0.2) attrs.fisico = clamp(attrs.fisico-1,0,99);
  S.player.overall = overallFromAttrs(attrs, S.player.position);
  S.player.peakOverall = Math.max(S.player.peakOverall||0, S.player.overall);
}

function generateOffers(){
  const ovr = S.player.overall;
  const offers = [];
  const candidates = ALL_CLUBS_FLAT.filter(c=>c.name!==S.club.name);
  if(ovr>=90){
    const eliteCands = candidates.filter(c=>ELITE_CLUB_NAMES.includes(c.name));
    if(eliteCands.length) offers.push(makeOffer(pick(eliteCands)));
  }
  const n = ovr>=90?rnd(1,2): ovr>=84?rnd(1,3): ovr>=74?rnd(0,2): rnd(0,1);
  let pool = candidates.filter(c=>Math.abs(c.str-ovr)<=16 && !offers.some(o=>o.club===c.name));
  for(let i=0;i<n;i++){
    if(!pool.length) break;
    const c = pick(pool);
    offers.push(makeOffer(c));
    pool = pool.filter(x=>x.name!==c.name);
  }
  return offers;
}
function makeOffer(c){
  const value = Math.max(300000, Math.round((c.str + S.player.overall)/2 * 700000 * (0.7+Math.random()*0.7)));
  return {club:c.name, str:c.str, country:c.country, division:c.division, value};
}
function acceptOffer(offer){
  const lastEntry = S.career.clubHistory[S.career.clubHistory.length-1];
  if(lastEntry) lastEntry.endYear = S.year;
  S.club = {name:offer.club, str:offer.str, division:offer.division, country:offer.country, confed:countryConfed(offer.country), prevLeagueRank:null};
  S.career.clubHistory.push({club:offer.club, startYear:S.year+1, country:offer.country});
  addNews(`✍️ ${S.player.name} é anunciado(a) como novo reforço do ${offer.club} por ${fmtMoney(offer.value)}!`, 'transfer');
}

// tableDiv: divisão a que pertencia a tabela (1 ou 2), passada por finalizeSeason
// antes de o jogador mudar de divisão
function simulateOtherTeamsPromoRelegation(sorted, country, tableDiv){
  const clubs = CLUBS[country];
  if(!clubs || !clubs.d1 || !clubs.d2) return;

  const myClubName = S.club.name;
  const n = sorted.length;
  const inTable = new Set(sorted.map(t=>t.name));

  if(tableDiv === 1){
    // Os 2 últimos da D1 caem — sem exceção, incluindo o jogador
    const relegated = sorted.slice(n - 2);

    relegated.forEach(t=>{
      const idx = clubs.d1.findIndex(([name])=>name===t.name);
      if(idx===-1) return;
      const entry = clubs.d1.splice(idx,1)[0];
      clubs.d2.push(entry);
    });

    // Os 2 mais fortes de D2 que não estavam na tabela sobem
    const promoted = clubs.d2
      .filter(([name])=>!inTable.has(name))
      .sort((a,b)=>b[1]-a[1])
      .slice(0, 2);

    promoted.forEach(entry=>{
      const idx = clubs.d2.findIndex(([name])=>name===entry[0]);
      if(idx===-1) return;
      clubs.d2.splice(idx,1);
      clubs.d1.push(entry);
    });

    if(relegated.length){
      const names = relegated.map(t=>t.name).join(' e ');
      addNews(`📉 ${names} ${relegated.length>1?'são rebaixados':'é rebaixado'} para a Divisão 2.`, 'info');
    }
    if(promoted.length){
      const names = promoted.map(([name])=>name).join(' e ');
      addNews(`📈 ${names} ${promoted.length>1?'sobem':'sobe'} para a Divisão 1.`, 'info');
    }

  } else {
    // Os 2 primeiros da D2 sobem — sem exceção, incluindo o jogador
    const promoted = sorted.slice(0, 2);

    promoted.forEach(t=>{
      const idx = clubs.d2.findIndex(([name])=>name===t.name);
      if(idx===-1) return;
      const entry = clubs.d2.splice(idx,1)[0];
      clubs.d1.push(entry);
    });

    // Os 2 mais fracos de D1 que não estavam na tabela caem
    const relegated = clubs.d1
      .filter(([name])=>!inTable.has(name))
      .sort((a,b)=>a[1]-b[1])
      .slice(0, 2);

    relegated.forEach(entry=>{
      const idx = clubs.d1.findIndex(([name])=>name===entry[0]);
      if(idx===-1) return;
      clubs.d1.splice(idx,1);
      clubs.d2.push(entry);
    });

    if(promoted.length){
      const names = promoted.map(t=>t.name).join(' e ');
      addNews(`📈 ${names} ${promoted.length>1?'sobem':'sobe'} para a Divisão 1.`, 'info');
    }
    if(relegated.length){
      const names = relegated.map(([name])=>name).join(' e ');
      addNews(`📉 ${names} ${relegated.length>1?'são rebaixados':'é rebaixado'} para a Divisão 2.`, 'info');
    }
  }
}

function finalizeSeason(){
  const table = S.season.table;
  const sorted = Object.values(table).sort((a,b)=> b.pts-a.pts || (b.gp-b.gc)-(a.gp-a.gc) || b.gp-a.gp);
  const rank = sorted.findIndex(t=>t.isMe)+1;
  S.club.prevLeagueRank = rank;
  // Salva campeão e vice da liga para uso na Supercopa
  S.season.leagueChampion = sorted[0] ? sorted[0].name : null;
  S.season.leagueRunnerUp  = sorted[1] ? sorted[1].name : null;
  S.season.leagueChampionStr = sorted[0] ? sorted[0].str : null;
  S.season.leagueRunnerUpStr  = sorted[1] ? sorted[1].str : null;
  const leagueName = `${CLUB_COMPS[S.club.confed].league} ${S.club.division}`;
  if(rank===1) awardTrophy(leagueName);
  checkSeasonAwards();
  const tableDiv = S.club.division; // divisão original antes de qualquer mudança do jogador
  if(S.club.division===2 && rank<=2){ S.club.division=1; addNews(`⬆️ ${S.club.name} conquista o acesso à Divisão 1!`, 'trophy'); }
  else if(S.club.division===1 && rank>=sorted.length-1){ S.club.division=2; addNews(`⬇️ ${S.club.name} é rebaixado(a) para a Divisão 2.`, 'event'); }

  // Promove/rebaixa os outros times no CLUBS para dar vida ao mundo
  simulateOtherTeamsPromoRelegation(sorted, S.club.country, tableDiv);

  const stat = S.statsBySeason[S.year] || {goals:0,assists:0,apps:0};
  addNews(`📋 Fim da temporada ${S.year}: ${stat.apps} jogos, ${stat.goals} gols, ${stat.assists} assistências — ${ordinal(rank)} lugar na ${leagueName}.`, 'info');
  evolvePlayer();
  S.pendingOffers = generateOffers();
}

function checkRetirement(){
  const age = S.player.age;
  const ovr = S.player.overall;
  if(age>=45){ S.retired=true; return; }
  if(age>=23 && ovr<48){ S.retired=true; return; }
  if(age>=40){
    const chance = clamp(0.12 + (66-ovr)/110, 0.12, 0.85);
    if(Math.random()<chance){ S.retired=true; return; }
  } else if(age>=36){
    const chance = clamp((64-ovr)/160, 0, 0.5);
    if(Math.random()<chance){ S.retired=true; return; }
  } else if(age>=32){
    const chance = clamp((56-ovr)/220, 0, 0.3);
    if(Math.random()<chance){ S.retired=true; return; }
  }
}

function buildSupercup(){
  // A Supercopa é disputada entre o campeão da liga (pontos corridos) e o
  // campeão da copa nacional da temporada anterior, ambos do mesmo país.
  // Se for o mesmo clube, o vice-campeão da liga entra no lugar.

  // Recuperar dados da temporada anterior salvos em S.lastSeason
  const last = S.lastSeason;
  if(!last) return null;

  const leagueChamp    = last.leagueChampion;
  const leagueChampStr = last.leagueChampionStr;
  const leagueVice     = last.leagueRunnerUp;
  const leagueViceStr  = last.leagueRunnerUpStr;
  const cupChamp       = last.cupChampion;
  const cupChampStr    = last.cupChampionStr;

  // Precisa ter tido campeão definido nas duas competições
  if(!leagueChamp || !cupChamp) return null;

  let teamA, teamB;

  if(leagueChamp === cupChamp){
    // Mesmo campeão: liga vs. vice da liga
    if(!leagueVice) return null;
    teamA = {name: leagueChamp, str: leagueChampStr || 78, isMe: leagueChamp === S.club.name};
    teamB = {name: leagueVice,  str: leagueViceStr  || 74, isMe: leagueVice  === S.club.name};
  } else {
    // Campeões distintos: liga vs. copa
    teamA = {name: leagueChamp, str: leagueChampStr || 78, isMe: leagueChamp === S.club.name};
    teamB = {name: cupChamp,    str: cupChampStr    || 74, isMe: cupChamp    === S.club.name};
  }

  // O jogador só participa se seu clube for um dos dois finalistas
  const playerInvolved = teamA.isMe || teamB.isMe;
  if(!playerInvolved) return null;

  addNews(`🏆 ${teamA.name} x ${teamB.name} — Supercopa ${S.year}!`, 'info');
  return { roundsNames:['Final'], round:0,
    teams: [teamA, teamB],
    done:false, alive:true, champion:null, log:[] };
}

function buildClubWorldCup(){
  const wonCont = S.career.trophies.some(t=>t.year===S.year-1 && t.name===CLUB_COMPS[S.club.confed].cont);
  if(!wonCont) return null;
  const others = [];
  Object.keys(CONTINENTAL_FILLERS).forEach(cf=>{
    if(cf===S.club.confed) return;
    const p = CONTINENTAL_FILLERS[cf];
    if(p && p.length) { const [name,str] = pick(p); others.push({name, str:str+4, isMe:false}); }
  });
  const fillers = sample(others, Math.min(3, others.length));
  while(fillers.length<3) fillers.push({name:'Campeão Continental', str:74, isMe:false});
  addNews(`🌍 ${S.club.name} representa a confederação no Mundial de Clubes ${S.year}!`, 'info');
  return { roundsNames:['Semifinal','Final'], round:0,
    teams: shuffle([{name:S.club.name,str:meTeamStrength(),isMe:true}, ...fillers]),
    done:false, alive:true, champion:null, log:[] };
}

function initSeason(isFirst){
  S.season = {};
  S.season.table = buildTable();
  S.season.leagueQueue = buildLeagueQueue();
  S.season.leagueIdx = 0;
  S.season.supercup = isFirst ? null : buildSupercup();
  S.season.clubWorldCup = isFirst ? null : buildClubWorldCup();
  S.season.cup = buildCup();
  S.season.continental = buildContinental();
  S.season.national = buildNational();
  S.season.stagePointer = -2;
  S.season.summaryDone = false;
  if(!isFirst){
    const m = S.player.morale;
    S.player.morale = clamp(Math.round(m + (70-m)*0.35), 0, 100);
    S.player.trainingFocus = null;
    addNews(`📅 Início da temporada ${S.year}.`, 'info');
  }
}

function advanceSupercup(){
  if(!S.season.supercup || S.season.supercup.done) return null;
  return processKnockoutStep(S.season.supercup, 'Supercopa');
}
function advanceClubWorldCup(){
  if(!S.season.clubWorldCup || S.season.clubWorldCup.done) return null;
  return processKnockoutStep(S.season.clubWorldCup, 'Mundial de Clubes');
}

function startNextSeason(){
  // Snapshot dos dados necessários para a Supercopa da próxima temporada
  const cup = S.season.cup;
  S.lastSeason = {
    leagueChampion:    S.season.leagueChampion    || null,
    leagueChampionStr: S.season.leagueChampionStr || null,
    leagueRunnerUp:    S.season.leagueRunnerUp    || null,
    leagueRunnerUpStr: S.season.leagueRunnerUpStr || null,
    cupChampion:    cup && cup.champion ? cup.champion.name : null,
    cupChampionStr: cup && cup.champion ? (cup.champion.str || null) : null,
  };
  S.player.age++;
  S.year++;
  initSeason(false);
}

function advance(){
  let guard=0;
  while(true){
    guard++;
    if(guard>50000){ S.retired=true; return {type:'RETIRE'}; }
    const stage = S.season.stagePointer;
    if(stage===-2){
      if(!S.season.supercup || S.season.supercup.done){ S.season.stagePointer=-1; continue; }
      const r = advanceSupercup();
      if(r) return r;
      continue;
    }
    if(stage===-1){
      if(!S.season.clubWorldCup || S.season.clubWorldCup.done){ S.season.stagePointer=0; continue; }
      const r = advanceClubWorldCup();
      if(r) return r;
      continue;
    }
    if(stage===0){
      const r = advanceCup();
      if(r) return r;
      if(S.season.cup.done) S.season.stagePointer=1;
      continue;
    }
    if(stage===1){
      const r = advanceLeagueOneMatch();
      if(r) return r;
      if(S.season.leagueIdx >= S.season.leagueQueue.length) S.season.stagePointer=2;
      continue;
    }
    if(stage===2){
      if(!S.season.continental){ S.season.stagePointer=3; continue; }
      const r = advanceContinental();
      if(r) return r;
      if(S.season.continental.done) S.season.stagePointer=3;
      continue;
    }
    if(stage===3){
      if(!S.season.national){ S.season.stagePointer=4; continue; }
      const r = advanceNational();
      if(r) return r;
      if(S.season.national.done) S.season.stagePointer=4;
      continue;
    }
    if(stage===4){
      if(!S.season.summaryDone){ finalizeSeason(); S.season.summaryDone=true; }
      if(autoMode){
        if(S.pendingOffers && S.pendingOffers.length){
          const best = S.pendingOffers.reduce((p,c)=> c.str>p.str?c:p, S.pendingOffers[0]);
          const improvement = best.str - S.club.str;
          if(improvement > 1){
            acceptOffer(best);
          } else if(S.club.str >= 85 && Math.random() < 0.22){
            const lateralPool = S.pendingOffers.filter(o=>o.str - S.club.str >= -5);
            if(lateralPool.length) acceptOffer(pick(lateralPool));
          }
        }
        S.pendingOffers = null;
        checkRetirement();
        if(S.retired) return {type:'RETIRE'};
        startNextSeason();
        continue;
      }
      return {type:'SUMMARY'};
    }
  }
}

function advanceOneStep(){
  let guard=0;
  while(true){
    guard++;
    if(guard>1000) return {type:'SUMMARY'};
    const stage = S.season.stagePointer;
    if(stage===-2){
      if(!S.season.supercup || S.season.supercup.done){ S.season.stagePointer=-1; continue; }
      const r = advanceSupercup();
      if(r) return r;
      return {type:'STEP', label:'Supercopa'};
    }
    if(stage===-1){
      if(!S.season.clubWorldCup || S.season.clubWorldCup.done){ S.season.stagePointer=0; continue; }
      const r = advanceClubWorldCup();
      if(r) return r;
      return {type:'STEP', label:'Mundial de Clubes'};
    }
    if(stage===0){
      if(S.season.cup.done){ S.season.stagePointer=1; continue; }
      const r = advanceCup();
      if(r) return r;
      return {type:'STEP', label: CLUB_COMPS[S.club.confed].cup};
    }
    if(stage===1){
      if(S.season.leagueIdx >= S.season.leagueQueue.length){ S.season.stagePointer=2; continue; }
      const r = advanceLeagueOneMatch();
      if(r) return r;
      return {type:'STEP', label: CLUB_COMPS[S.club.confed].league};
    }
    if(stage===2){
      if(!S.season.continental || S.season.continental.done){ S.season.stagePointer=3; continue; }
      const r = advanceContinental();
      if(r) return r;
      return {type:'STEP', label: CLUB_COMPS[S.club.confed].cont};
    }
    if(stage===3){
      if(!S.season.national || S.season.national.done){ S.season.stagePointer=4; continue; }
      const r = advanceNational();
      if(r) return r;
      return {type:'STEP', label:'Seleção'};
    }
    if(stage===4){
      if(!S.season.summaryDone){ finalizeSeason(); S.season.summaryDone=true; }
      return {type:'SUMMARY'};
    }
  }
}

/* ==================================================================
   PARTE 6 — MOTOR DE PARTIDAS DECISIVAS (FINAIS)
   ================================================================== */

let currentMatch = null;

const SCENARIO_POOL = {
  ATT: [
    {
      minute: 88, role:'ATTACK',
      prompt: 'Cara a cara com o goleiro! O que você faz?',
      options: [
        {id:'A', label:'Chutar colocado', hint:'Finalização', probFn:a=>clamp(0.30+a.finalizacao/130,0.15,0.82),
          successText:'Bate colocado, sem chances para o goleiro! ⚽', failText:'Chuta para fora — a chance vai pro espaço!'},
        {id:'B', label:'Tentar driblar o goleiro', hint:'Drible + Fintas', probFn:a=>clamp(0.20+(a.drible + a.fintas*14)/2/130,0.08,0.80),
          successText:'Deixa o goleiro no chão e empurra pra rede vazia! ⚽', failText:'O goleiro antecipa e desarma no susto!'},
        {id:'C', label:'Tocar para o companheiro', hint:'Passe', probFn:a=>clamp(0.45+a.passe/200,0.35,0.75),
          successText:'Rola na medida e o companheiro só empurra pro gol! ⚽', failText:'O passe sai forte demais e a defesa afasta!'},
      ]
    },
    {
      minute: 87, role:'ATTACK',
      prompt: 'Cruzamento vindo da direita, você está na pequena área com o zagueiro colado!',
      options: [
        {id:'A', label:'Cabecear no canto', hint:'Físico + Finalização', probFn:a=>clamp(0.26+(a.fisico*0.5+a.finalizacao*0.5)/140,0.12,0.78),
          successText:'Sobe mais que o zagueiro e testa firme no canto! ⚽', failText:'Cabeceia por cima do travessão!'},
        {id:'B', label:'Girar e bater de primeira', hint:'Drible + Finalização', probFn:a=>clamp(0.22+(a.drible*0.4+a.finalizacao*0.6)/145,0.10,0.74),
          successText:'Gira sobre o marcador e fuzila o goleiro! ⚽', failText:'Demora no giro e a zaga afasta o perigo!'},
        {id:'C', label:'Escorar para o meio', hint:'Passe', probFn:a=>clamp(0.40+a.passe/190,0.30,0.72),
          successText:'Escora de cabeça e o companheiro completa pro gol! ⚽', failText:'A escorada sai fraca e o goleiro encaixa!'},
      ]
    },
    {
      minute: 89, role:'ATTACK', isSetPiece: true,
      prompt: '⚽ Falta perigosa na entrada da área — barreira montada, você assume a cobrança!',
      options: [
        {id:'A', label:'Bater por cima da barreira', hint:'Finalização', probFn:a=>clamp(0.16+a.finalizacao/165,0.08,0.58),
          successText:'Pega com efeito por cima da barreira — no ângulo! ⚽', failText:'A bola raspa o travessão e sai!'},
        {id:'B', label:'Chutar rasteiro no canto da barreira', hint:'Finalização + Perna Ruim', probFn:a=>clamp(0.14+(a.finalizacao + a.pernaRuim*12)/2/160,0.07,0.55),
          successText:'Rasteiro por baixo da barreira que pulou — golaço! ⚽', failText:'A barreira bloqueia o chute rasteiro!'},
        {id:'C', label:'Cobrar na área para o companheiro', hint:'Passe', probFn:a=>clamp(0.34+a.passe/190,0.24,0.68),
          successText:'Cruzamento perfeito e o zagueiro sobe pra completar! ⚽', failText:'O goleiro sai bem e soca a bola pra longe!'},
      ]
    },
  ],
  MID: [
    {
      minute: 88, role:'ATTACK',
      prompt: 'A bola sobra pra você na entrada da área!',
      options: [
        {id:'A', label:'Arriscar de primeira', hint:'Finalização', probFn:a=>clamp(0.24+a.finalizacao/140,0.1,0.7),
          successText:'Bate de primeira e balança as redes! ⚽', failText:'A bola sobe demais e passa longe do gol!'},
        {id:'B', label:'Lançamento em profundidade', hint:'Passe', probFn:a=>clamp(0.28+a.passe/150,0.12,0.72),
          successText:'Enfia a bola no espaço e o companheiro só toca pra dentro! ⚽', failText:'O lançamento é interceptado pela zaga!'},
        {id:'C', label:'Encarar o drible e infiltrar', hint:'Drible', probFn:a=>clamp(0.22+(a.drible+a.fintas*10)/2/140,0.1,0.68),
          successText:'Passa por dois marcadores e finaliza no ângulo! ⚽', failText:'É desarmado(a) na hora H!'},
      ]
    },
    {
      minute: 89, role:'ATTACK', isSetPiece: true,
      prompt: '⚽ Falta frontal a 20 metros — você é o batedor oficial do time!',
      options: [
        {id:'A', label:'Bater com efeito no ângulo', hint:'Passe + Finalização', probFn:a=>clamp(0.15+(a.passe*0.5+a.finalizacao*0.5)/160,0.08,0.58),
          successText:'Bate com efeito, a bola faz a curva e morre no ângulo! ⚽', failText:'A bola passa raspando a trave!'},
        {id:'B', label:'Chutar forte no meio da barreira', hint:'Finalização', probFn:a=>clamp(0.13+a.finalizacao/170,0.06,0.52),
          successText:'Pancada que explode no fundo das redes! ⚽', failText:'A barreira bloqueia com o corpo!'},
        {id:'C', label:'Cobrança ensaiada com o companheiro', hint:'Passe', probFn:a=>clamp(0.32+a.passe/175,0.22,0.70),
          successText:'Jogada ensaiada funciona — rola e o companheiro fuzila! ⚽', failText:'A defesa lê a jogada ensaiada e afasta!'},
      ]
    },
    {
      minute: 87, role:'ATTACK', isSetPiece: true,
      prompt: '⚽ Escanteio na última chance — você vai na bola!',
      options: [
        {id:'A', label:'Cruzar na cabeça do zagueiro', hint:'Passe', probFn:a=>clamp(0.30+a.passe/175,0.20,0.68),
          successText:'Cruzamento na medida e o zagueiro testa pro gol! ⚽', failText:'O goleiro sai de soco e afasta o perigo!'},
        {id:'B', label:'Cobrar rasteiro na entrada', hint:'Passe + Finalização', probFn:a=>clamp(0.24+(a.passe*0.5+a.finalizacao*0.5)/170,0.14,0.62),
          successText:'Toca rasteiro e o companheiro pega de primeira — golaço! ⚽', failText:'A defesa corta o cruzamento rasteiro!'},
        {id:'C', label:'Bater direto pro gol (olímpico)', hint:'Finalização (arriscado)', probFn:a=>clamp(0.06+a.finalizacao/240,0.03,0.30),
          successText:'GOL OLÍMPICO! A bola entra direto do escanteio! ⚽🤯', failText:'A bola vai direto pras mãos do goleiro!'},
      ]
    },
  ],
  DEF: [
    {
      minute: 89, role:'DEFEND',
      prompt: 'Atacante adversário está livre, cara a cara com seu goleiro — você é a última defesa!',
      options: [
        {id:'A', label:'Tentar o carrinho', hint:'Defesa (arriscado)', probFn:a=>clamp(0.30+a.defesa/150,0.15,0.78),
          successText:'Carrinho perfeito, tira a bola sem tocar no atacante! 🛡️', failText:'Chega atrasado(a) e o atacante só empurra pro gol!'},
        {id:'B', label:'Fechar o ângulo e forçar o erro', hint:'Defesa + Físico', probFn:a=>clamp(0.34+(a.defesa+a.fisico)/2/150,0.18,0.80),
          successText:'Fecha bem o ângulo e o atacante chuta em cima de você! 🛡️', failText:'O atacante encontra o canto mesmo com a marcação!'},
        {id:'C', label:'Recuar e pedir cobertura', hint:'Passe/Organização', probFn:a=>clamp(0.40+a.passe/180,0.25,0.70),
          successText:'A cobertura chega a tempo e o lance é neutralizado! 🛡️', failText:'Ninguém chega e o atacante fica livre para concluir!'},
      ]
    },
    {
      minute: 88, role:'DEFEND', isSetPiece: true,
      prompt: '🧱 Falta perigosa contra o seu time — o técnico manda você pra barreira!',
      options: [
        {id:'A', label:'Segurar firme na barreira', hint:'Físico', probFn:a=>clamp(0.34+a.fisico/150,0.20,0.80),
          successText:'A bola bate no seu corpo e a barreira segura! 🧱', failText:'A bola passa por cima da barreira e entra!'},
        {id:'B', label:'Pular na hora do chute', hint:'Físico + Defesa (arriscado)', probFn:a=>clamp(0.28+(a.fisico*0.5+a.defesa*0.5)/150,0.14,0.74),
          successText:'Timing perfeito no pulo — bloqueia de cabeça! 🧱', failText:'Pula cedo demais e a bola passa por baixo!'},
        {id:'C', label:'Sair da barreira e marcar na área', hint:'Defesa', probFn:a=>clamp(0.32+a.defesa/155,0.18,0.76),
          successText:'Antecipa na área e afasta o perigo de cabeça! 🛡️', failText:'Perde a marcação e o atacante cabeceia livre!'},
      ]
    },
    {
      minute: 90, role:'DEFEND', isSetPiece: true,
      prompt: '🛡️ Escanteio adversário nos acréscimos — você marca o artilheiro deles!',
      options: [
        {id:'A', label:'Marcar colado no atacante', hint:'Defesa + Físico', probFn:a=>clamp(0.33+(a.defesa*0.6+a.fisico*0.4)/150,0.18,0.80),
          successText:'Não dá espaço nenhum e o atacante nem alcança a bola! 🛡️', failText:'O atacante se solta da marcação e cabeceia pro gol!'},
        {id:'B', label:'Subir para afastar de cabeça', hint:'Físico', probFn:a=>clamp(0.30+a.fisico/150,0.16,0.78),
          successText:'Sobe mais que todo mundo e manda a bola pra longe! 🛡️', failText:'Não alcança e a bola sobra limpa na área!'},
        {id:'C', label:'Ficar em cima da linha do gol', hint:'Defesa (posicionamento)', probFn:a=>clamp(0.36+a.defesa/170,0.22,0.74),
          successText:'Tira em cima da linha o que seria o gol do título! 🛡️', failText:'A bola entra num canto que você não cobria!'},
      ]
    },
  ],
  GK: [
    {
      minute: 90, role:'DEFEND',
      prompt: 'Pênalti nos acréscimos da decisão! Sua defesa pode salvar o título.',
      options: [
        {id:'A', label:'Pular para o canto mais provável', hint:'Elasticidade (arriscado)', probFn:a=>clamp(0.28+a.elasticidade/140,0.14,0.80),
          successText:'Adivinha o canto e faz a defesa da temporada! 🧤', failText:'Vai pro canto errado — gol do adversário!'},
        {id:'B', label:'Ficar no meio esperando', hint:'Colocação', probFn:a=>clamp(0.26+a.colocacao/160,0.12,0.68),
          successText:'Fica plantado(a) no meio e encaixa a bola no peito! 🧤', failText:'O batedor bate no canto e não há chance de defesa!'},
        {id:'C', label:'Estudar o batedor antes', hint:'Reflexos + Agarrar', probFn:a=>clamp(0.30+(a.reflexos*0.5+a.agarrar*0.5)/150 + S.player.reputation/300,0.16,0.80),
          successText:'A leitura estava certa — defesa espetacular! 🧤', failText:'Mesmo estudando, o batedor engana e marca!'},
      ]
    },
    {
      minute: 89, role:'DEFEND', isSetPiece: true,
      prompt: '🧤 Falta perigosa na entrada da área — você monta a barreira e se posiciona!',
      options: [
        {id:'A', label:'Barreira fechada e ficar no canto aberto', hint:'Colocação + Reflexos', probFn:a=>clamp(0.32+(a.colocacao*0.6+a.reflexos*0.4)/150,0.18,0.80),
          successText:'A barreira fecha o canto e você defende o outro lado! 🧤', failText:'O batedor acha o buraco na barreira — gol!'},
        {id:'B', label:'Adiantar e apostar na saída', hint:'Elasticidade (arriscado)', probFn:a=>clamp(0.24+a.elasticidade/155,0.12,0.70),
          successText:'Sai bem do gol e agarra a bola no alto! 🧤', failText:'Sai mal e a bola entra por cima de você!'},
        {id:'C', label:'Ficar na linha e reagir ao chute', hint:'Reflexos', probFn:a=>clamp(0.30+a.reflexos/150,0.16,0.78),
          successText:'Reflexo felino — espalma o que já era gol! 🧤', failText:'A bola vai forte demais pro canto!'},
      ]
    },
    {
      minute: 88, role:'DEFEND', isSetPiece: true,
      prompt: '🧤 Escanteio adversário na reta final — área lotada!',
      options: [
        {id:'A', label:'Sair de soco', hint:'Jogo Aéreo (arriscado)', probFn:a=>clamp(0.26+a.jogoAereo/150,0.13,0.74),
          successText:'Sai de soco na multidão e afasta o perigo! 🧤', failText:'Soca mal e a bola sobra pro atacante marcar!'},
        {id:'B', label:'Tentar agarrar no alto', hint:'Agarrar + Jogo Aéreo', probFn:a=>clamp(0.28+(a.agarrar*0.5+a.jogoAereo*0.5)/145,0.15,0.78),
          successText:'Sobe firme e agarra a bola com segurança! 🧤', failText:'A bola escapa das suas mãos e sobra na área!'},
        {id:'C', label:'Ficar no gol e reagir', hint:'Colocação + Reflexos', probFn:a=>clamp(0.32+(a.colocacao*0.5+a.reflexos*0.5)/155,0.18,0.76),
          successText:'Bem posicionado(a), defende o cabeceio à queima-roupa! 🧤', failText:'O cabeceio vai no canto e você não alcança!'},
      ]
    },
  ],
};

function pickScenario(scenarioKey){
  const pool = SCENARIO_POOL[scenarioKey];
  return pick(pool);
}

function simulateFinalCore(meObj, oppObj){
  let [gm,go] = simScoreline(meObj.str, oppObj.str, 0);
  gm = clamp(gm,0,3); go = clamp(go,0,3);
  if(Math.abs(gm-go)>1){ if(gm>go) gm=go+1; else go=gm+1; }
  const pos = posById(S.player.position);
  const scenario = pickScenario(pos.scenario);
  const attrs = S.player.attrs;
  const options = scenario.options.map(opt=>({...opt, prob:opt.probFn(attrs)}));
  return { gm, go, scenario, options };
}

function scheduleMatchTimeline(core){
  const events=[];
  for(let i=0;i<core.gm;i++) events.push({minute:rnd(4,85), team:'me'});
  for(let i=0;i<core.go;i++) events.push({minute:rnd(4,85), team:'opp'});
  events.sort((a,b)=>a.minute-b.minute);
  return events;
}

function teamNameFor(who){ return who==='me' ? currentMatch.meObj.name : currentMatch.oppObj.name; }

function addMatchLog(minute, text){
  const wrap = document.getElementById('mLog');
  const div = document.createElement('div');
  div.innerHTML = `<span>${minute}'</span> ${text}`;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}

function updateScoreDisplay(){
  const m = currentMatch;
  const aScore = m.ctx.teamA.isMe ? m.score.me : m.score.opp;
  const bScore = m.ctx.teamB.isMe ? m.score.me : m.score.opp;
  document.getElementById('mScore').textContent = `${aScore} – ${bScore}`;
}

function renderMatchHeader(){
  const ctx = currentMatch.ctx;
  document.getElementById('mCompName').textContent = `${ctx.compName} — ${ctx.roundName}`;
  document.getElementById('mTeamA').textContent = ctx.teamA.name + (ctx.teamA.isMe?' (Você)':'');
  document.getElementById('mTeamB').textContent = ctx.teamB.name + (ctx.teamB.isMe?' (Você)':'');
  document.getElementById('mScore').textContent = '0 – 0';
  const minuteEl = document.getElementById('mMinute');
  minuteEl.textContent = "0'";
  minuteEl.classList.add('live');
  document.getElementById('mLog').innerHTML='';
  document.getElementById('mDecisionBox').innerHTML='';
  document.getElementById('mPenaltyBox').innerHTML='';
  document.getElementById('mResultBox').innerHTML='';
}

function playMatch(ctx){
  const meObj = ctx.teamA.isMe ? ctx.teamA : ctx.teamB;
  const oppObj = ctx.teamA.isMe ? ctx.teamB : ctx.teamA;
  const core = simulateFinalCore(meObj, oppObj);
  currentMatch = { ctx, core, meObj, oppObj, minute:0, score:{me:0,opp:0}, timeline:scheduleMatchTimeline(core), timelineIdx:0, decisionSuccess:null, decisionMade:false, finished:false };
  showScreen('screen-match');
  renderMatchHeader();
  document.getElementById('mSkipRow').style.display = '';
  addMatchLog(0, '🏟️ Bola rolando! A decisão começa agora.');
  setTimeout(tickMatch, 500);
}

function tickMatch(){
  const m = currentMatch;
  if(m.finished) return;
  if(m.minute >= m.core.scenario.minute){ showDecisionBox(); return; }
  m.minute = Math.min(m.minute + rnd(1,3), m.core.scenario.minute);
  while(m.timelineIdx < m.timeline.length && m.timeline[m.timelineIdx].minute <= m.minute){
    const ev = m.timeline[m.timelineIdx]; m.timelineIdx++;
    if(ev.team==='me'){ m.score.me++; addMatchLog(ev.minute, `⚽ Gol de ${teamNameFor('me')}!`); }
    else { m.score.opp++; addMatchLog(ev.minute, `⚽ Gol de ${teamNameFor('opp')}.`); }
    updateScoreDisplay();
  }
  document.getElementById('mMinute').textContent = `${m.minute}'`;
  setTimeout(tickMatch, 380);
}

function showDecisionBox(){
  if(currentMatch.finished) return;
  const core = currentMatch.core;
  const sc = core.scenario;
  document.getElementById('mMinute').textContent = `${sc.minute}' ⏸`;
  document.getElementById('mDecisionBox').innerHTML = `
    <div class="decision-box">
      <p class="decision-prompt">⏱ ${sc.minute}' — ${sc.prompt}</p>
      <div class="decision-options">
        ${core.options.map(o=>`<button class="decision-opt" data-id="${o.id}"><span>${o.label}</span><small>${o.hint}</small></button>`).join('')}
      </div>
    </div>`;
  document.querySelectorAll('.decision-opt').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const opt = core.options.find(o=>o.id===btn.dataset.id);
      resolveDecision(opt);
    });
  });
}

function resolveDecision(opt){
  const m = currentMatch;
  if(m.finished) return;
  const success = Math.random() < opt.prob;
  m.decisionSuccess = success;
  m.decisionMade = true;
  if(m.core.scenario.role==='ATTACK'){
    if(success){ m.score.me++; addMatchLog(m.core.scenario.minute, `⭐ ${opt.successText}`); }
    else addMatchLog(m.core.scenario.minute, opt.failText);
  } else {
    if(success){ addMatchLog(m.core.scenario.minute, `⭐ ${opt.successText}`); }
    else { m.score.opp++; addMatchLog(m.core.scenario.minute, opt.failText); }
  }
  updateScoreDisplay();
  document.getElementById('mDecisionBox').innerHTML='';
  setTimeout(finishMatchClock, 700);
}

function skipToResult(){
  const m = currentMatch;
  if(!m || m.finished) return;
  while(m.timelineIdx < m.timeline.length){
    const ev = m.timeline[m.timelineIdx]; m.timelineIdx++;
    if(ev.team==='me') m.score.me++; else m.score.opp++;
  }
  if(!m.decisionMade){
    const best = m.core.options.reduce((p,c)=> c.prob>p.prob?c:p, m.core.options[0]);
    const success = Math.random() < best.prob;
    m.decisionSuccess = success;
    m.decisionMade = true;
    if(m.core.scenario.role==='ATTACK'){
      if(success) m.score.me++;
      addMatchLog(m.core.scenario.minute, success ? `⭐ ${best.successText}` : best.failText);
    } else {
      if(!success) m.score.opp++;
      addMatchLog(m.core.scenario.minute, success ? `⭐ ${best.successText}` : best.failText);
    }
  }
  document.getElementById('mDecisionBox').innerHTML='';
  updateScoreDisplay();
  finishMatchClock();
}

function creditFinalGoals(core, decisionSuccess){
  if(S.player.bannedGames>0){ S.player.bannedGames--; return; }
  if(S.player.outForGames>0){ S.player.outForGames--; return; }
  applyPersonalMatchStats(core.gm);
  if(core.scenario.role==='ATTACK' && decisionSuccess) addMatchStat(1,0);
}

const PK_ZONES = [
  {id:0, label:'↖'}, {id:1, label:'↑'}, {id:2, label:'↗'},
  {id:3, label:'↙'}, {id:4, label:'↓'}, {id:5, label:'↘'},
];
let pkState = null;

function pkPlayerSkill(){
  const a = S.player.attrs;
  if(S.player.position==='GOL') return clamp((a.reflexos*0.5 + a.elasticidade*0.3 + a.colocacao*0.2)/100, 0.25, 0.95);
  return clamp((a.finalizacao*0.7 + (a.pernaRuim*20)*0.3)/100, 0.25, 0.95);
}

function startPenaltyShootout(){
  const m = currentMatch;
  const isKeeper = S.player.position==='GOL';
  pkState = {
    round: 0, maxRounds: 5,
    me: [], opp: [],
    meScore: 0, oppScore: 0,
    isKeeper,
    awaitingChoice: true,
    finished: false,
  };
  document.getElementById('mDecisionBox').innerHTML = '';
  renderPenaltyUI('Escolha onde ' + (isKeeper ? 'mergulhar' : 'chutar') + '.');
}

function renderPenaltyUI(feedbackText, feedbackClass, keeperZone, chosenZone){
  const pk = pkState;
  const m = currentMatch;
  const myName = m.ctx.teamA.isMe ? m.ctx.teamA.name : m.ctx.teamB.name;
  const oppName = m.ctx.teamA.isMe ? m.ctx.teamB.name : m.ctx.teamA.name;

  const dots = (arr)=> arr.map(v=>`<span class="pk-dot ${v?'goal':'miss'}">${v?'●':'✕'}</span>`).join('') || '';
  const zoneClass = (id)=>{
    if(keeperZone===id && chosenZone===id) return 'both';
    if(chosenZone===id) return 'chosen';
    if(keeperZone===id) return 'keeper';
    return '';
  };

  const html = `
    <div class="pk-wrap">
      <p class="pk-title">⚽ DISPUTA DE PÊNALTIS</p>
      <p class="pk-sub">${pk.isKeeper ? 'Você defende — escolha o canto para mergulhar' : 'Você bate — escolha o canto para chutar'} · Cobrança ${Math.min(pk.round+1, pk.maxRounds)}${pk.round>=pk.maxRounds?' (morte súbita)':` de ${pk.maxRounds}`}</p>
      <div class="pk-tally">
        <div class="pk-side">
          <div class="pk-side-name">${myName}</div>
          <div class="pk-dots">${dots(pk.me)}</div>
        </div>
        <div class="pk-score">${pk.meScore} – ${pk.oppScore}</div>
        <div class="pk-side">
          <div class="pk-side-name">${oppName}</div>
          <div class="pk-dots">${dots(pk.opp)}</div>
        </div>
      </div>
      <div class="pk-feedback ${feedbackClass||''}">${feedbackText||''}</div>
      <div class="pk-goal-frame" id="pkFrame">
        ${PK_ZONES.map(z=>`<div class="pk-zone ${zoneClass(z.id)}" data-zone="${z.id}">${z.label}</div>`).join('')}
      </div>
      ${pk.awaitingChoice ? '' : `<div class="btn-row" style="justify-content:center;margin-top:4px;"><button class="btn btn-primary btn-sm" id="pkNext">Próxima cobrança →</button></div>`}
    </div>`;
  document.getElementById('mPenaltyBox').innerHTML = html;

  if(pk.awaitingChoice){
    document.querySelectorAll('#pkFrame .pk-zone').forEach(el=>{
      el.addEventListener('click', ()=>handlePenaltyChoice(parseInt(el.dataset.zone,10)));
    });
  } else {
    const nextBtn = document.getElementById('pkNext');
    if(nextBtn) nextBtn.addEventListener('click', ()=>advancePenaltyRound());
  }
}

function handlePenaltyChoice(zoneId){
  const pk = pkState;
  if(!pk || !pk.awaitingChoice || pk.finished) return;
  pk.awaitingChoice = false;
  const skill = pkPlayerSkill();

  if(pk.isKeeper){
    const shooterZone = rnd(0,5);
    const guessedRight = shooterZone===zoneId;
    const saved = guessedRight && Math.random() < skill;
    pk.opp.push(!saved);
    if(!saved) pk.oppScore++;
    const myConverted = Math.random() < 0.75;
    pk.me.push(myConverted);
    if(myConverted) pk.meScore++;
    const txt = saved ? '🧤 DEFENDEU! Que defesaça!' : (guessedRight ? 'Foi no canto certo, mas a bola passou!' : 'Bola no outro canto — gol adversário.');
    renderPenaltyUI(txt + (myConverted ? ' Seu time converteu a dele.' : ' E seu time desperdiçou a cobrança!'), saved?'scored':'missed', shooterZone, zoneId);
  } else {
    const keeperZone = rnd(0,5);
    const keeperGuessed = keeperZone===zoneId;
    const scored = keeperGuessed ? (Math.random() < skill*0.45) : (Math.random() < 0.80 + skill*0.15);
    pk.me.push(scored);
    if(scored) pk.meScore++;
    const oppConverted = Math.random() < 0.75;
    pk.opp.push(oppConverted);
    if(oppConverted) pk.oppScore++;
    const txt = scored ? '⚽ GOL! Na gaveta!' : (keeperGuessed ? '🧤 O goleiro defendeu!' : 'Isolou! A bola foi pra fora!');
    renderPenaltyUI(txt + (oppConverted ? ' O adversário também converteu.' : ' Mas o adversário perdeu a dele!'), scored?'scored':'missed', keeperZone, zoneId);
  }
  pk.round++;
}

function advancePenaltyRound(){
  const pk = pkState;
  const remaining = pk.maxRounds - pk.round;
  if(pk.round >= pk.maxRounds){
    if(pk.meScore !== pk.oppScore){ finishPenaltyShootout(); return; }
  } else if(Math.abs(pk.meScore - pk.oppScore) > remaining){
    finishPenaltyShootout(); return;
  }
  pk.awaitingChoice = true;
  renderPenaltyUI('Escolha onde ' + (pk.isKeeper ? 'mergulhar' : 'chutar') + '.');
}

function finishPenaltyShootout(){
  const pk = pkState;
  pk.finished = true;
  const winnerIsMe = pk.meScore > pk.oppScore;
  document.getElementById('mPenaltyBox').innerHTML = '';
  addMatchLog(120, `🥅 Nos pênaltis: ${pk.meScore}-${pk.oppScore} — ${winnerIsMe?teamNameFor('me'):teamNameFor('opp')} leva a melhor!`);
  concludeMatch(winnerIsMe);
}

function finishMatchClock(){
  const m = currentMatch;
  if(m.finished) return;
  m.finished = true;
  creditFinalGoals(m.core, m.decisionSuccess);
  document.getElementById('mSkipRow').style.display = 'none';
  m.minute = 90 + rnd(1,4);
  document.getElementById('mMinute').textContent = `Encerrado (${m.minute}')`;
  document.getElementById('mMinute').classList.remove('live');
  if(m.score.me===m.score.opp){
    if(autoMode){
      const bonus = m.decisionSuccess ? 0.08 : -0.04;
      const prob = clamp(0.5+bonus+(m.meObj.str-m.oppObj.str)/300, 0.25, 0.78);
      const winnerIsMe = Math.random()<prob;
      addMatchLog(120, `🥅 Nos pênaltis, ${winnerIsMe?teamNameFor('me'):teamNameFor('opp')} leva a melhor!`);
      concludeMatch(winnerIsMe);
    } else {
      addMatchLog(120, '🥅 Empate no tempo normal — vamos para os pênaltis!');
      startPenaltyShootout();
    }
    return;
  }
  concludeMatch(m.score.me > m.score.opp);
}

function concludeMatch(winnerIsMe){
  const m = currentMatch;
  if(m.core.scenario.role==='ATTACK' && m.decisionSuccess && winnerIsMe){
    checkCraqueDaFinal(m.ctx.compName, true);
  }
  showMatchResult(winnerIsMe);
}

function showMatchResult(winnerIsMe){
  const m = currentMatch;
  const winnerSide = winnerIsMe ? (m.ctx.teamA.isMe?'A':'B') : (m.ctx.teamA.isMe?'B':'A');
  const html = winnerIsMe ? `
    <div class="decision-box" style="border-color:var(--turf-light);text-align:center;">
      <div style="font-size:40px;">🏆</div>
      <p class="decision-prompt" style="color:var(--turf-light);">CAMPEÃO — ${m.ctx.compName}!</p>
      <p style="color:var(--chalk-dim);margin-bottom:16px;">Você ergue a taça em ${S.year}!</p>
      <button class="btn btn-primary" id="btnMatchContinue">Continuar</button>
    </div>` : `
    <div class="decision-box" style="text-align:center;">
      <div style="font-size:40px;">😔</div>
      <p class="decision-prompt">Vice-campeão</p>
      <p style="color:var(--chalk-dim);margin-bottom:16px;">Não foi dessa vez — a decisão ficou com o adversário.</p>
      <button class="btn btn-primary" id="btnMatchContinue">Continuar</button>
    </div>`;
  document.getElementById('mResultBox').innerHTML = html;
  document.getElementById('btnMatchContinue').addEventListener('click', ()=>{
    m.ctx.onResolve(winnerSide, {scoreMe:m.score.me, scoreOpp:m.score.opp});
    showScreen('screen-career');
    renderCareer();
    continueAfterPause();
  });
}

function simulateFinalAuto(a, b, compNameOverride, isNational){
  const meObj = a.isMe ? a : b, oppObj = a.isMe ? b : a;
  const core = simulateFinalCore(meObj, oppObj);
  const best = core.options.reduce((p,c)=> c.prob>p.prob?c:p, core.options[0]);
  const success = Math.random() < best.prob;
  creditFinalGoals(core, success);
  let meScore = core.gm, oppScore = core.go;
  if(core.scenario.role==='ATTACK'){ if(success) meScore++; }
  else { if(!success) oppScore++; }
  let winnerIsMe;
  if(meScore===oppScore) winnerIsMe = Math.random() < clamp(0.5+(meObj.str-oppObj.str)/300+(success?0.05:-0.03),0.25,0.78);
  else winnerIsMe = meScore>oppScore;
  const winnerTeam = winnerIsMe ? meObj : oppObj;
  const winnerSide = a.isMe ? (winnerIsMe?'A':'B') : (winnerIsMe?'B':'A');
  if(isNational){
    if(winnerIsMe) awardTrophy(compNameOverride, true);
    else addNews(`${meObj.name} perde a decisão da ${compNameOverride}.`, 'event');
  }
  if(core.scenario.role==='ATTACK' && success && winnerIsMe){
    checkCraqueDaFinal(compNameOverride, true);
  }
  return { winnerTeam, winnerSide, winnerIsMe, meScore, oppScore };
}

/* ==================================================================
   PARTE 7 — RENDERIZAÇÃO DA CARREIRA, MERCADO, EVENTOS E FIM DE CARREIRA
   ================================================================== */

let activeCareerTab = 'liga';

function renderPlayerMini(){
  const pos = posById(S.player.position);
  const rarity = rarityOf(S.player.overall);
  const html = `
    <div class="mini-badge rarity-${rarity}">
      <div class="mini-ovr-row">
        <div><div class="mini-ovr">${S.player.overall}</div><div class="mini-pos">${pos.icon} ${pos.name}</div></div>
        <span class="card-flag">${flagEmoji(S.player.nationality)}</span>
      </div>
      <div class="mini-name">${S.player.name}</div>
      <div class="mini-club">${crestTag(S.club.name, S.club.country)} ${S.club.name} · Divisão ${S.club.division}</div>
    </div>
    <div class="stat-bars">
      ${attrOrderFor(S.player.position).filter(k=>k!=='fintas'&&k!=='pernaRuim').map(k=>`
        <div class="stat-bar-row"><span>${ATTR_LABEL[k]}</span><div class="stat-bar-track"><div class="stat-bar-fill" style="width:${S.player.attrs[k]}%;"></div></div><b>${S.player.attrs[k]}</b></div>
      `).join('')}
    </div>
    ${S.player.position!=='GOL' ? `
    <div class="morale-row">
      <div class="flex-between" style="margin-bottom:5px;">
        <span style="font-size:12px;color:var(--ink-muted);">Moral</span>
        <span style="font-size:12px;color:var(--chalk);">${moraleLabel(S.player.morale).icon} ${moraleLabel(S.player.morale).text}</span>
      </div>
      <div class="stat-bar-track"><div class="morale-fill morale-${moraleLabel(S.player.morale).cls}" style="width:${S.player.morale}%;"></div></div>
    </div>
    <div class="flex-between" style="margin-top:12px;">
      <span style="font-size:12px;color:var(--ink-muted);">Fintas</span><span class="stars">${starStr(S.player.attrs.fintas)}</span>
    </div>
    <div class="flex-between">
      <span style="font-size:12px;color:var(--ink-muted);">Perna Ruim</span><span class="stars">${starStr(S.player.attrs.pernaRuim)}</span>
    </div>
    ` : ''}
    <ul class="info-list">
      <li>Idade <b>${S.player.age} anos</b></li>
      <li>Altura / Peso <b>${S.player.height}cm / ${S.player.weight}kg</b></li>
      <li>Potencial <b>${S.player.potential}</b></li>
      <li>Reputação <b>${S.player.reputation}/20</b></li>
      <li>Gols na carreira <b>${S.career.goals}</b></li>
      <li>Assistências <b>${S.career.assists}</b></li>
      <li>Jogos <b>${S.career.apps}</b></li>
      <li>Títulos <b>${S.career.trophies.length}</b></li>
      <li>Convocações <b>${S.nt.caps}</b></li>
      ${S.player.outForGames>0?`<li>🩹 Fora de combate <b>${S.player.outForGames} jogo(s)</b></li>`:''}
      ${S.player.bannedGames>0?`<li>⛓️ Suspenso <b>${S.player.bannedGames} jogo(s)</b></li>`:''}
      ${S.player.isCaptain?`<li>🎗️ <b>Capitão do time</b></li>`:''}
    </ul>`;
  document.getElementById('playerMiniWrap').innerHTML = html;
}

function renderCareerTabs(){
  const tabs = [{id:'liga', label:'📊 Tabela'}, {id:'copa', label:'🏆 '+CLUB_COMPS[S.club.confed].cup}];
  if(S.season.continental) tabs.push({id:'cont', label:'🌎 '+CLUB_COMPS[S.club.confed].cont});
  if(S.season.supercup) tabs.push({id:'super', label:'🥇 Supercopa'});
  if(S.season.clubWorldCup) tabs.push({id:'mundial', label:'🌐 Mundial'});
  tabs.push({id:'selecao', label:'🌍 Seleção'});
  if(!tabs.find(t=>t.id===activeCareerTab)) activeCareerTab='liga';
  document.getElementById('careerTabs').innerHTML = tabs.map(t=>`<div class="tab ${t.id===activeCareerTab?'active':''}" data-tab="${t.id}">${t.label}</div>`).join('');
  document.querySelectorAll('#careerTabs .tab').forEach(el=>{
    el.addEventListener('click', ()=>{ activeCareerTab = el.dataset.tab; renderCareerTabs(); });
  });
  renderCareerTabContent();
}

function renderCareerTabContent(){
  const wrap = document.getElementById('careerTabContent');
  if(activeCareerTab==='liga') wrap.innerHTML = renderLeagueTableHTML();
  else if(activeCareerTab==='copa') wrap.innerHTML = renderBracketHTML(S.season.cup, CLUB_COMPS[S.club.confed].cup);
  else if(activeCareerTab==='cont') wrap.innerHTML = S.season.continental ? renderBracketHTML(S.season.continental, CLUB_COMPS[S.club.confed].cont) : `<p class="empty-note">Não classificado para a competição continental nesta temporada.</p>`;
  else if(activeCareerTab==='super') wrap.innerHTML = S.season.supercup ? renderBracketHTML(S.season.supercup, 'Supercopa') : '<p class="empty-note">Não disputa a Supercopa nesta temporada.</p>';
  else if(activeCareerTab==='mundial') wrap.innerHTML = S.season.clubWorldCup ? renderBracketHTML(S.season.clubWorldCup, 'Mundial de Clubes') : '<p class="empty-note">Não disputa o Mundial de Clubes nesta temporada.</p>';
  else if(activeCareerTab==='selecao') wrap.innerHTML = renderNationalHTML();
}

function renderLeagueTableHTML(){
  const table = S.season.table;
  const sorted = Object.values(table).sort((a,b)=> b.pts-a.pts || (b.gp-b.gc)-(a.gp-a.gc) || b.gp-a.gp);
  const rows = sorted.map((t,i)=>`
    <tr class="${t.isMe?'me':''}">
      <td class="pos">${i+1}</td>
      <td><div class="club-cell">${crestTag(t.name)}<span>${t.name}</span></div></td>
      <td>${t.pj}</td><td>${t.v}</td><td>${t.e}</td><td>${t.d}</td>
      <td>${t.gp}</td><td>${t.gc}</td><td>${t.gp-t.gc}</td>
      <td class="pts">${t.pts}</td>
    </tr>`).join('');
  return `
    <p class="section-label">${CLUB_COMPS[S.club.confed].league} ${S.club.division} — ${S.year}</p>
    <div style="overflow-x:auto;">
    <table class="league-table">
      <thead><tr><th></th><th>Clube</th><th>PJ</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th><th>PTS</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    </div>`;
}

function renderBracketHTML(bracket, compName){
  if(!bracket) return `<p class="empty-note">Sem dados desta competição.</p>`;
  let html = `<p class="section-label">${compName}</p><div class="bracket">`;
  bracket.roundsNames.forEach((rname,idx)=>{
    const matchesThisRound = bracket.log.filter(l=>l.round===rname);
    html += `<div class="bracket-round"><div class="bracket-round-title">${rname}</div>`;
    if(matchesThisRound.length){
      matchesThisRound.forEach(mt=>{
        const hasScore = mt.scoreA!==undefined && mt.scoreB!==undefined;
        const pensTag = mt.wentToPenalties ? ' <small style="opacity:.7;">(pên.)</small>' : '';
        html += `<div class="bracket-match">
          <div class="bm-team ${mt.winner===mt.a?'win':''} ${mt.a===S.club.name?'me':''}">${mt.a}${hasScore?` <b>${mt.scoreA}</b>`:''}</div>
          <div class="bm-team ${mt.winner===mt.b?'win':''} ${mt.b===S.club.name?'me':''}">${mt.b}${hasScore?` <b>${mt.scoreB}</b>`:''}${pensTag}</div>
        </div>`;
      });
    } else if(idx===bracket.round && !bracket.done){
      html += `<div class="bracket-match" style="opacity:.6;">Aguardando...</div>`;
    } else if(idx > bracket.round){
      html += `<div class="bracket-match" style="opacity:.4;">—</div>`;
    }
    html += `</div>`;
  });
  html += `</div>`;
  if(bracket.done && bracket.champion){
    html += `<p style="margin-top:10px;font-size:13px;color:var(--ink-muted);">Campeão: <b style="color:var(--gold-light);">${bracket.champion.name}</b></p>`;
  } else if(!bracket.alive){
    html += `<p style="margin-top:10px;font-size:13px;color:var(--ink-muted);">${S.club.name} eliminado(a) nesta edição.</p>`;
  }
  return html;
}

function renderNationalHTML(){
  const nat = S.season.national || S.nt.lastCampaignBracket;
  if(!nat){
    return `<p class="section-label">Seleção ${S.player.nationality}</p>
      <p class="empty-note">Nenhuma convocação ainda nesta carreira.<br>Total de convocações: <b>${S.nt.caps}</b>.</p>`;
  }
  const compName = `Seleção ${S.player.nationality} — ${nat.label} ${nat.year}`;
  let html = `<p class="section-label">${compName}</p><div class="bracket">`;
  nat.roundsNames.forEach((rname, idx)=>{
    const entry = nat.log[idx];
    html += `<div class="bracket-round"><div class="bracket-round-title">${rname}</div>`;
    if(entry){
      const won = entry.result==='venceu';
      const scoreTag = entry.score ? ` (${entry.score})` : '';
      html += `<div class="bracket-match">
        <div class="bm-team me ${won?'win':''}">${S.player.nationality}${scoreTag}</div>
        <div class="bm-team ${!won?'win':''}">${entry.opponent}</div>
      </div>`;
    } else if(idx===nat.round && !nat.done){
      html += `<div class="bracket-match" style="opacity:.6;">Aguardando...</div>`;
    } else if(idx > nat.round){
      html += `<div class="bracket-match" style="opacity:.4;">—</div>`;
    }
    html += `</div>`;
  });
  html += `</div>`;
  if(nat.champion===S.player.nationality){
    html += `<p style="margin-top:10px;font-size:13px;color:var(--gold-light);">🏆 Campeão!</p>`;
  } else if(nat.champion){
    html += `<p style="margin-top:10px;font-size:13px;color:var(--ink-muted);">Vice-campeão — perdeu a final para <b>${nat.champion}</b>.</p>`;
  } else if(nat.done && !nat.alive){
    html += `<p style="margin-top:10px;font-size:13px;color:var(--ink-muted);">Eliminado(a) nesta edição.</p>`;
  }
  html += `<p style="font-size:13px;color:var(--ink-muted);margin-top:10px;">Total de convocações na carreira: <b>${S.nt.caps}</b></p>`;
  return html;
}

function renderNews(){
  const wrap = document.getElementById('newsFeed');
  if(!S.news.length){ wrap.innerHTML = `<p class="empty-note">Nenhuma notícia ainda.</p>`; return; }
  wrap.innerHTML = S.news.slice(0,25).map(n=>`<div class="news-item ${n.type}"><time>${n.year}</time>${n.text}</div>`).join('');
}

function renderCareer(){
  updateTopbar();
  renderPlayerMini();
  renderCareerTabs();
  renderNews();
  updateActionButtons();
}

function updateActionButtons(){
  const pending = S.pendingOffers !== null;
  document.getElementById('marketPendingBanner').classList.toggle('hidden', !pending);
  document.getElementById('actionsNormal').classList.toggle('hidden', pending);
  document.getElementById('actionsMarketPending').classList.toggle('hidden', !pending);
}

function showEventModal(ev){
  const root = document.getElementById('modalRoot');
  const buttons = ev.choice
    ? `<button class="btn btn-danger btn-block" id="btnEventAccept" style="margin-bottom:8px;">💰 Aceitar o dinheiro</button>
       <button class="btn btn-primary btn-block" id="btnEventRefuse">🛡️ Recusar e denunciar</button>`
    : `<button class="btn btn-primary btn-block" id="btnEventContinue">Continuar</button>`;
  root.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-box event">
        <div class="modal-icon">${ev.icon}</div>
        <p class="modal-title">${ev.title}</p>
        <p class="modal-body">${ev.text}</p>
        ${ev.choice ? '<p class="modal-body" style="font-size:12.5px;color:var(--ink-muted);margin-top:-8px;">Aceitar rende dinheiro rápido, mas há risco real de ser pego e pegar uma suspensão longa.</p>' : ''}
        ${buttons}
      </div>
    </div>`;
  const finish = (choiceId)=>{
    applyEventEffect(ev, choiceId);
    root.innerHTML='';
    renderCareer();
    continueAfterPause();
  };
  if(ev.choice){
    document.getElementById('btnEventAccept').addEventListener('click', ()=>finish('accept'));
    document.getElementById('btnEventRefuse').addEventListener('click', ()=>finish('refuse'));
  } else {
    document.getElementById('btnEventContinue').addEventListener('click', ()=>finish());
  }
}

function showTrainingModal(onDone){
  const root = document.getElementById('modalRoot');
  const isGK = S.player.position==='GOL';
  const opts = isGK
    ? [['reflexos','🧤 Reflexos'],['elasticidade','🤸 Elasticidade'],['colocacao','🧭 Colocação'],['fisico','💪 Físico']]
    : [['finalizacao','🥅 Finalização'],['drible','⚡ Drible'],['passe','🎯 Passe'],['velocidade','💨 Velocidade'],['defesa','🛡️ Defesa'],['fisico','💪 Físico']];
  root.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-box">
        <div class="modal-icon">🏋️</div>
        <p class="modal-title">Pré-temporada</p>
        <p class="modal-body">Escolha o foco de treino para ${S.year}. O atributo escolhido evolui mais rápido nesta temporada.</p>
        <div class="decision-options">
          ${opts.map(([k,label])=>`<button class="decision-opt" data-focus="${k}"><span>${label}</span><small>${S.player.attrs[k]||0}</small></button>`).join('')}
        </div>
      </div>
    </div>`;
  document.querySelectorAll('[data-focus]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      S.player.trainingFocus = btn.dataset.focus;
      addNews(`🏋️ Foco de treino para ${S.year}: ${ATTR_LABEL[btn.dataset.focus]}.`, 'info');
      root.innerHTML='';
      renderCareer();
      if(onDone) onDone();
    });
  });
}

function renderMarket(){
  const wrap = document.getElementById('marketOffers');
  const offers = S.pendingOffers || [];
  if(!offers.length){
    wrap.innerHTML = `<p class="empty-note">Nenhuma proposta chegou nesta janela. O ${S.club.name} segue confiando no seu trabalho.</p>`;
  } else {
    wrap.innerHTML = offers.map((o,i)=>`
      <div class="offer-card">
        <div class="offer-club">
          ${crestTag(o.club, o.country)}
          <div><div class="offer-name">${o.club}</div><div class="offer-league">${o.country} · Divisão ${o.division}${ELITE_CLUB_NAMES.includes(o.club)?' · Clube de elite':''}</div></div>
        </div>
        <div style="text-align:right;">
          <div class="offer-value">${fmtMoney(o.value)}</div>
          <button class="btn btn-gold btn-sm" data-idx="${i}" style="margin-top:8px;">Aceitar</button>
        </div>
      </div>`).join('');
    wrap.querySelectorAll('button[data-idx]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const offer = offers[parseInt(btn.dataset.idx,10)];
        acceptOffer(offer);
        proceedAfterMarket();
      });
    });
  }
  showScreen('screen-market');
}

function proceedAfterMarket(){
  S.pendingOffers = null;
  checkRetirement();
  if(S.retired){ renderRetired(); return; }
  startNextSeason();
  showScreen('screen-career');
  renderCareer();
  showTrainingModal();
}

function getBestSeason(){
  let best = null, bestScore = -1;
  for(const yearStr in S.statsBySeason){
    const year = parseInt(yearStr, 10);
    const stat = S.statsBySeason[year];
    const trophiesThatYear = S.career.trophies.filter(t=>t.year===year);
    const score = stat.goals + stat.assists*0.5 + trophiesThatYear.length*20;
    if(score > bestScore){
      bestScore = score;
      best = { year, club: stat.club, goals: stat.goals, assists: stat.assists, apps: stat.apps, trophies: trophiesThatYear };
    }
  }
  return best;
}

function renderRetired(){
  const lastEntry = S.career.clubHistory[S.career.clubHistory.length-1];
  if(lastEntry && lastEntry.endYear===undefined) lastEntry.endYear = S.year;
  const bestSeason = getBestSeason();
  const bestSeasonHtml = bestSeason ? `
    <div class="divider"></div>
    <p class="section-label" style="justify-content:center;">⭐ Melhor Temporada da Carreira</p>
    <div class="panel" style="background:var(--panel-3);border-color:var(--gold);max-width:420px;margin:0 auto;text-align:center;">
      <div style="font-family:var(--display);font-size:32px;color:var(--gold-light);letter-spacing:.03em;">${bestSeason.year}</div>
      <div style="font-size:14px;color:var(--chalk-dim);margin-bottom:12px;">${crestTag(bestSeason.club)} ${bestSeason.club}</div>
      <div style="display:flex;justify-content:center;gap:22px;font-size:13.5px;color:var(--chalk-dim);margin-bottom:10px;">
        <span>⚽ <b style="color:var(--chalk);">${bestSeason.goals}</b> gols</span>
        <span>🎯 <b style="color:var(--chalk);">${bestSeason.assists}</b> assist.</span>
        <span>👕 <b style="color:var(--chalk);">${bestSeason.apps}</b> jogos</span>
      </div>
      ${bestSeason.trophies.length
        ? `<div style="font-size:12.5px;color:var(--gold-light);">${bestSeason.trophies.map(t=>`🏆 ${t.name}`).join('<br>')}</div>`
        : `<div style="font-size:12.5px;color:var(--ink-muted);">Nenhum título nessa temporada.</div>`}
    </div>` : '';

  const awardCounts = {};
  S.career.awards.forEach(a=>{
    if(!awardCounts[a.name]) awardCounts[a.name] = {count:0, years:[]};
    awardCounts[a.name].count++;
    awardCounts[a.name].years.push(a.year);
  });
  const AWARD_ICON = {'Bola de Ouro':'🥇','Chuteira de Ouro':'👟','Craque da Final':'⭐','Revelação do Ano':'🌟','Luva de Ouro':'🧤'};
  const awardsHtml = `
    <div class="divider"></div>
    <p class="section-label" style="justify-content:center;">🏅 Prêmios Individuais (${S.career.awards.length})</p>
    <div class="draft-taken-list" style="justify-content:center;">
      ${S.career.awards.length
        ? Object.keys(awardCounts).map(name=>{
            const info = awardCounts[name];
            const icon = AWARD_ICON[name] || '🏅';
            return `<span class="taken-tag">${icon} ${name} <b>×${info.count}</b> <span style="opacity:.6;">(${info.years.join(', ')})</span></span>`;
          }).join('')
        : '<span class="empty-note">Nenhum prêmio individual na carreira.</span>'}
    </div>`;

  const ms = (S.career.milestones||[]);
  const milestonesHtml = ms.length ? `
    <div class="divider"></div>
    <p class="section-label" style="justify-content:center;">📜 Marcos da Carreira</p>
    <div class="draft-taken-list" style="justify-content:center;">
      ${ms.map(m=>`<span class="taken-tag">${m.text} <span style="opacity:.6;">(${m.year})</span></span>`).join('')}
    </div>` : '';

  const html = `
    <div class="modal-icon" style="font-size:50px;">🏟️</div>
    <h2 class="screen-title">Fim de carreira</h2>
    <p class="screen-sub">${S.player.name} pendura as chuteiras aos ${S.player.age} anos.</p>
    <div class="trophyRow">${S.career.trophies.length? '🏆'.repeat(Math.min(S.career.trophies.length,14)) : '—'}</div>
    <ul class="info-list" style="max-width:420px;margin:0 auto;text-align:left;">
      <li>Último clube <b>${S.club.name}</b></li>
      <li>Overall final <b>${S.player.overall}</b></li>
      <li>Pico de overall <b>${S.player.peakOverall || S.player.overall}</b></li>
      <li>Jogos <b>${S.career.apps}</b></li>
      <li>Gols <b>${S.career.goals}</b></li>
      <li>Assistências <b>${S.career.assists}</b></li>
      <li>Títulos conquistados <b>${S.career.trophies.length}</b></li>
      <li>Convocações pela seleção <b>${S.nt.caps}</b></li>
      ${S.career.redCards ? `<li>Cartões vermelhos <b>${S.career.redCards}</b></li>` : ''}
      ${S.career.suspensions ? `<li>Suspensões na carreira <b>${S.career.suspensions}</b></li>` : ''}
    </ul>
    ${bestSeasonHtml}
    ${awardsHtml}
    ${milestonesHtml}
    <div class="divider"></div>
    <p class="section-label" style="justify-content:center;">Clubes da carreira</p>
    <div class="draft-taken-list" style="justify-content:center;">
      ${S.career.clubHistory.map(c=>`<span class="taken-tag">${crestTag(c.club, c.country)} ${c.club} (${c.startYear}–${c.endYear})</span>`).join('')}
    </div>
    <div class="divider"></div>
    <p class="section-label" style="justify-content:center;">Títulos da carreira</p>
    <div class="draft-taken-list" style="justify-content:center;">
      ${S.career.trophies.length ? S.career.trophies.map(t=>`<span class="taken-tag">🏆 ${t.name} (${t.year}) — ${t.club}</span>`).join('') : '<span class="empty-note">Nenhum título na carreira.</span>'}
    </div>
    <div class="btn-row" style="justify-content:center;">
      <button class="btn btn-primary" id="btnNewCareer">Começar Nova Carreira</button>
    </div>`;
  document.getElementById('retiredPanel').innerHTML = html;
  document.getElementById('btnNewCareer').addEventListener('click', ()=>location.reload());
  showScreen('screen-retired');
}

function handleSeasonEnd(){
  showScreen('screen-career');
  renderCareer();
}

function resumeAdvance(){
  matchContinuationIsStep = false;
  const r = advance();
  if(!r) return;
  if(r.type==='MATCH') return playMatch(r);
  if(r.type==='EVENT') return showEventModal(r.event);
  if(r.type==='SUMMARY') return handleSeasonEnd();
  if(r.type==='RETIRE') return renderRetired();
}

function resumeAdvanceStep(){
  matchContinuationIsStep = true;
  const r = advanceOneStep();
  if(!r) return;
  if(r.type==='MATCH') return playMatch(r);
  if(r.type==='EVENT') return showEventModal(r.event);
  if(r.type==='SUMMARY') return handleSeasonEnd();
  if(r.type==='STEP'){ renderCareer(); return; }
}

function continueAfterPause(){
  if(matchContinuationIsStep) resumeAdvanceStep();
  else resumeAdvance();
}

document.getElementById('btnSkipMarket').addEventListener('click', proceedAfterMarket);
document.getElementById('btnSkipMatch').addEventListener('click', skipToResult);
document.getElementById('btnOpenMarket').addEventListener('click', renderMarket);

document.getElementById('btnNextMatch').addEventListener('click', ()=>{
  autoMode = false;
  resumeAdvanceStep();
});

document.getElementById('btnSimSeason').addEventListener('click', ()=>{
  autoMode = false;
  resumeAdvance();
});

document.getElementById('btnSimCareer').addEventListener('click', ()=>{
  autoMode = true;
  let r = null;
  try{
    r = advance();
  } catch(e){
    console.error('Erro durante "Simular até o Fim da Carreira":', e);
  } finally {
    autoMode = false;
  }
  if(r && r.type==='RETIRE') renderRetired();
  else { showScreen('screen-career'); renderCareer(); }
});

function confirmRetireFromCareer(){
  if(confirm('Tem certeza que deseja encerrar a carreira agora? Essa ação não pode ser desfeita.')){
    S.retired = true;
    renderRetired();
  }
}
document.getElementById('btnRetire').addEventListener('click', confirmRetireFromCareer);
document.getElementById('btnRetireFromSummary').addEventListener('click', confirmRetireFromCareer);

/* ==================================================================
   INIT
   ================================================================== */
initCreateScreen();
showScreen('screen-create');