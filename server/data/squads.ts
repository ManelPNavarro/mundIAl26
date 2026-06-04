interface Squad {
  gk: string[]
  def: string[]
  mid: string[]
  fwd: string[]
}

const squads: Record<string, Squad> = {
  'Corea del Sur': {
    gk: ['Kim Seung-gyu', 'Jo Hyeon-woo', 'Song Bum-keun'],
    def: ['Kim Min-jae', 'Kim Moon-hwan', 'Seol Young-woo', 'Cho Yu-min', 'Lee Tae-seok', 'Park Jin-seob', 'Kim Tae-hyeon', 'Lee Han-beom', 'Jens Castrop', 'Lee Ki-hyuk'],
    mid: ['Lee Jae-sung', 'Hwang Hee-chan', 'Hwang In-beom', 'Lee Kang-in', 'Paik Seung-ho', 'Kim Jin-gyu', 'Lee Dong-gyeong', 'Bae Jun-ho', 'Eom Ji-sung', 'Yang Hyun-jun'],
    fwd: ['Son Heung-min', 'Cho Gue-sung', 'Oh Hyeon-gyu'],
  },
  'México': {
    gk: ['Guillermo Ochoa', 'Raúl Rangel', 'Carlos Acevedo', 'Alex Padilla'],
    def: ['Antonio Rodríguez', 'Carlos Moreno', 'César Montes', 'Edson Álvarez', 'Israel Reyes', 'Jesús Gallardo', 'Johan Vásquez', 'Jorge Sánchez', 'Julián Araujo', 'Mateo Chávez', 'Víctor Guzmán', 'Richard Ledezma'],
    mid: ['Álvaro Fidalgo', 'Brian Gutiérrez', 'Carlos Rodríguez', 'Diego Lainez', 'Efraín Álvarez', 'Érick Sánchez', 'Luis Chávez', 'Luis Romo', 'Marcel Ruiz', 'Obed Vargas', 'Orbelín Pineda', 'Roberto Alvarado'],
    fwd: ['Raúl Jiménez', 'Alexis Vega', 'Santiago Giménez', 'César Huerta', 'Julián Quiñones', 'Germán Berterame'],
  },
  'República Checa': {
    gk: ['Matěj Kovář', 'Jindřich Staněk', 'Lukáš Horníček'],
    def: ['Vladimír Coufal', 'Tomáš Holeš', 'Ladislav Krejčí', 'David Zima', 'Jaroslav Zelený', 'David Jurásek', 'David Douděra', 'Robin Hranáč', 'Štěpán Chaloupek'],
    mid: ['Tomáš Souček', 'Vladimír Darida', 'Lukáš Provod', 'Michal Sadílek', 'Pavel Šulc', 'Lukáš Červ', 'Pavel Bucha', 'Hugo Sochůrek'],
    fwd: ['Patrik Schick', 'Adam Hložek', 'Jan Kuchta', 'Tomáš Chorý', 'Mojmír Chytil', 'Christophe Kabongo'],
  },
  'Sudáfrica': {
    gk: ['Ronwen Williams', 'Ricardo Goss', 'Sipho Chaine'],
    def: ['Aubrey Modiba', 'Khuliso Mudau', 'Nkosinathi Sibisi', 'Mbekezeli Mbokazi', 'Ime Okon', 'Samukele Kabini', 'Khulumani Ndamane', 'Thabang Matuludi', 'Kamogelo Sebelebele', 'Bradley Cross', 'Olwethu Makhanya'],
    mid: ['Teboho Mokoena', 'Sphephelo Sithole', 'Thalente Mbatha', 'Jayden Adams'],
    fwd: ['Themba Zwane', 'Lyle Foster', 'Evidence Makgopa', 'Oswin Appollis', 'Iqraam Rayners', 'Relebohile Mofokeng', 'Thapelo Maseko', 'Tshepang Moremi'],
  },
  'Bosnia y Herzegovina': {
    gk: ['Nikola Vasilj', 'Martin Zlomislić', 'Osman Hadžikić'],
    def: ['Sead Kolašinac', 'Amar Dedić', 'Nikola Katić', 'Tarik Muharemović', 'Nihad Mujakić', 'Stjepan Radeljić', 'Dennis Hadžikadunić', 'Nidal Čelik'],
    mid: ['Amir Hadžiahmetović', 'Benjamin Tahirović', 'Armin Gigović', 'Dženis Burnić', 'Ivan Bašić', 'Esmir Bajraktarević', 'Ivan Šunjić'],
    fwd: ['Edin Džeko', 'Ermedin Demirović', 'Samed Baždar', 'Haris Tabaković', 'Jovo Lukić'],
  },
  'Canadá': {
    gk: ['Maxime Crépeau', 'Dayne St. Clair', 'Owen Goodman'],
    def: ['Richie Laryea', 'Alphonso Davies', 'Alistair Johnston', 'Derek Cornelius', 'Moïse Bombito', 'Niko Sigur', 'Joel Waterman', 'Zorhan Bassong', 'Jamie Knight-Lebel', 'Ralph Priso'],
    mid: ['Jonathan Osorio', 'Tajon Buchanan', 'Stephen Eustáquio', 'Liam Millar', 'Ismaël Koné', 'Jacob Shaffelburg', 'Ali Ahmed', 'Mathieu Choinière', 'Marcelo Flores'],
    fwd: ['Cyle Larin', 'Jonathan David', 'Tani Oluwaseyi', 'Promise David', 'Daniel Jebbison'],
  },
  'Catar': {
    gk: ['Shehab Elleithy', 'Salah Zakaria', 'Meshaal Barsham', 'Mahmoud Abunada'],
    def: ['Boualem Khoukhi', 'Pedro Miguel', 'Sultan Al Brake', 'Tarek Salman', 'Bassam Al-Rawi', 'Rayyan Al-Ali', 'Issa Laye', 'Lucas Mendes', 'Niall Mason'],
    mid: ['Ahmed Fathi', 'Jassim Gaber', 'Assim Madibo', 'Abdulaziz Hatem', 'Karim Boudiaf', 'Mohammed Mannai', 'Homam Al-Amin'],
    fwd: ['Almoez Ali', 'Akram Afif', 'Tahsin Mohammed', 'Edmílson Junior', 'Hassan Al-Haydos', 'Mohammed Muntari'],
  },
  'Suiza': {
    gk: ['Gregor Kobel', 'Yvon Mvogo', 'Marvin Keller'],
    def: ['Manuel Akanji', 'Nico Elvedi', 'Ricardo Rodriguez', 'Silvan Widmer', 'Miro Muheim', 'Aurèle Amenda', 'Eray Cömert', 'Luca Jaquez'],
    mid: ['Granit Xhaka', 'Johan Manzambi', 'Remo Freuler', 'Denis Zakaria', 'Ardon Jashari', 'Djibril Sow', 'Christian Fassnacht', 'Michel Aebischer', 'Fabian Rieder'],
    fwd: ['Rubén Vargas', 'Breel Embolo', 'Noah Okafor', 'Dan Ndoye', 'Zeki Amdouni', 'Cedric Itten'],
  },
  'Brasil': {
    gk: ['Alisson', 'Éderson', 'Weverton'],
    def: ['Alex Sandro', 'Bremer', 'Danilo', 'Douglas Santos', 'Gabriel Magalhães', 'Léo Pereira', 'Marquinhos', 'Roger Ibañez', 'Wesley'],
    mid: ['Bruno Guimarães', 'Casemiro', 'Fabinho', 'Lucas Paquetá'],
    fwd: ['Endrick', 'Gabriel Martinelli', 'Igor Thiago', 'Luiz Henrique', 'Matheus Cunha', 'Neymar', 'Raphinha', 'Vinícius Júnior'],
  },
  'Escocia': {
    gk: ['Craig Gordon', 'Angus Gunn', 'Liam Kelly'],
    def: ['Grant Hanley', 'Jack Hendry', 'Aaron Hickey', 'Dom Hyam', 'Scott McKenna', 'Nathan Patterson', 'Anthony Ralston', 'Andy Robertson', 'John Souttar', 'Kieran Tierney'],
    mid: ['Ryan Christie', 'Finlay Curtis', 'Lewis Ferguson', 'Billy Gilmour', 'John McGinn', 'Kenny McLean', 'Scott McTominay'],
    fwd: ['Ché Adams', 'Lyndon Dykes', 'George Hirst', 'Lawrence Shankland', 'Ross Stewart'],
  },
  'Haití': {
    gk: ['Johny Placide', 'Alexandre Pierre', 'Josue Duverger'],
    def: ['Carlens Arcus', 'Wilguens Paugain', 'Duke Lacroix', 'Martin Expérience', 'Jean-Kévin Duverne', 'Ricardo Adé', 'Hannes Delcroix', 'Keeto Thermoncy'],
    mid: ['Carl Fred Sainté', 'Leverton Pierre', 'Danley Jean Jacques', 'Jean-Ricner Bellegarde', 'Woodensky Pierre', 'Dominique Simon'],
    fwd: ['Don Deedson Louicius', 'Josué Casimir', 'Derrick Etienne', 'Ruben Providence', 'Duckens Nazon', 'Frantzdy Pierrot', 'Wilson Isidor', 'Yassin Fortuné', 'Lenny Joseph'],
  },
  'Marruecos': {
    gk: ['Yassine Bounou', 'Munir El Kajoui', 'Reda Tagnaouti'],
    def: ['Noussair Mazraoui', 'Anass Salah-Eddine', 'Achraf Hakimi', 'Zakaria El Ouahdi', 'Chadi Riad', 'Nayef Aguerd', 'Redouane Halhal', 'Issa Diop', 'Samir El Mourabet'],
    mid: ['Ayyoub Bouaddi', 'Neil El Aynaoui', 'Sofyan Amrabat', 'Azzedine Ounahi', 'Bilal El Khannouss', 'Ismael Saibari'],
    fwd: ['Abde Ezzalzouli', 'Chemsdine Talbi', 'Soufiane Rahimi', 'Ayoub El Kaabi', 'Brahim Díaz', 'Ayoube Amaimouni'],
  },
  'Australia': {
    gk: ['Mathew Ryan', 'Paul Izzo', 'Patrick Beach'],
    def: ['Milos Degenek', 'Jacob Italiano', 'Jordan Bos', 'Aziz Behich', 'Jason Geria', 'Cameron Burgess', 'Alessandro Circati', 'Kye Rowles'],
    mid: ['Connor Metcalfe', 'Ajdin Hrustic', 'Aiden O\'Neill', 'Riley McGree', 'Patrick Yazbek', 'Alex Robertson'],
    fwd: ['Martin Boyle', 'Nestory Irankunda', 'Nishan Velupillay', 'Awer Mabil', 'Deni Juric', 'Ante Suto', 'Jackson Irvine', 'Mitch Duke', 'Mathew Leckie'],
  },
  'Estados Unidos': {
    gk: ['Chris Brady', 'Matt Freese', 'Matt Turner'],
    def: ['Max Arfsten', 'Sergiño Dest', 'Alex Freeman', 'Mark McKenzie', 'Tim Ream', 'Chris Richards', 'Antonee Robinson', 'Miles Robinson', 'Joe Scally', 'Auston Trusty'],
    mid: ['Tyler Adams', 'Sebastian Berhalter', 'Weston McKennie', 'Cristian Roldan', 'Gio Reyna'],
    fwd: ['Brenden Aaronson', 'Malik Tillman', 'Tim Weah', 'Alejandro Zendejas', 'Christian Pulisic', 'Folarin Balogun', 'Ricardo Pepi', 'Haji Wright'],
  },
  'Paraguay': {
    gk: ['Roberto Fernández', 'Orlando Gill', 'Gastón Olveira'],
    def: ['Gustavo Gómez', 'Júnior Alonso', 'Fabián Balbuena', 'Omar Alderete', 'Juan Caceres', 'Blas Riveros', 'Agustín Sandez', 'Alan Benitez', 'Saúl Salcedo'],
    mid: ['Miguel Almirón', 'Alejandro Romero Gamarra', 'Andrés Cubas', 'Ramón Sosa', 'Diego Gómez', 'Damián Bobadilla', 'Mathías Villasanti', 'Braian Ojeda', 'Matías Galarza'],
    fwd: ['Antonio Sanabria', 'Julio Enciso', 'Gabriel Avalos', 'Ángel Romero', 'Isidro Pitta', 'Rodney Redes'],
  },
  'Turquía': {
    gk: ['Uğurcan Çakır', 'Mert Günok', 'Altay Bayındır', 'Ersin Destanoğlu'],
    def: ['Merih Demiral', 'Zeki Çelik', 'Çağlar Söyüncü', 'Mert Müldür', 'Ferdi Kadıoğlu', 'Ozan Kabak', 'Abdülkerim Bardakcı', 'Eren Elmalı', 'Samet Akaydın', 'Ahmetcan Kaplan'],
    mid: ['Hakan Çalhanoğlu', 'Kaan Ayhan', 'Orkun Kökçü', 'İsmail Yüksek', 'Salih Özcan', 'Atakan Karazor'],
    fwd: ['Kerem Aktürkoğlu', 'İrfan Can Kahveci', 'Barış Alper Yılmaz', 'Arda Güler', 'Kenan Yıldız', 'Yunus Akgün', 'Can Uzun'],
  },
  'Alemania': {
    gk: ['Oliver Baumann', 'Manuel Neuer', 'Alexander Nübel'],
    def: ['Waldemar Anton', 'Nathaniel Brown', 'David Raum', 'Antonio Rüdiger', 'Nico Schlotterbeck', 'Jonathan Tah', 'Malick Thiaw'],
    mid: ['Pascal Gross', 'Joshua Kimmich', 'Felix Nmecha', 'Aleksandar Pavlovic', 'Angelo Stiller', 'Leon Goretzka', 'Florian Wirtz', 'Jamie Leweling', 'Jamal Musiala', 'Leroy Sané'],
    fwd: ['Maximilian Beier', 'Kai Havertz', 'Deniz Undav', 'Nick Woltemade'],
  },
  'Costa de Marfil': {
    gk: ['Yahia Fofana', 'Mohamed Koné', 'Alban Lafont'],
    def: ['Emmanuel Agbadou', 'Clément Akpa', 'Ousmane Diomande', 'Guela Doué', 'Ghislain Konan', 'Odilon Kossounou', 'Evan Ndicka', 'Wilfried Singo'],
    mid: ['Seko Fofana', 'Franck Kessié', 'Ibrahim Sangaré', 'Jean Michaël Seri'],
    fwd: ['Simon Adingra', 'Ange-Yoan Bonny', 'Amad Diallo', 'Oumar Diakité', 'Evann Guessand', 'Nicolas Pépé', 'Elye Wahi'],
  },
  'Curazao': {
    gk: ['Eloy Room', 'Tyrick Bodak', 'Trevor Doornbusch'],
    def: ['Riechedly Bazoer', 'Joshua Brenet', 'Roshon van Eijma', 'Sherel Floranus', 'Deveron Fonville', 'Jurien Gaari', 'Armando Obispo', 'Shurandy Sambo'],
    mid: ['Juninho Bacuna', 'Leandro Bacuna', 'Livano Comenencia', 'Kevin Felida', 'Ar\'jany Martha', 'Tyrese Noslin', 'Godfried Roemeratoe'],
    fwd: ['Tahith Chong', 'Kenji Gorre', 'Gervane Kastaneer', 'Brandley Kuwas', 'Jurgen Locadia', 'Jearl Margaritha', 'Sontje Hansen'],
  },
  'Ecuador': {
    gk: ['Alexander Domínguez', 'Hernán Galíndez', 'Moisés Ramírez'],
    def: ['Piero Hincapié', 'Willian Pacho', 'Félix Torres', 'Pervis Estupiñán', 'Angelo Preciado', 'Joel Ordóñez', 'Jackson Porozo', 'José Hurtado'],
    mid: ['Moisés Caicedo', 'Kendry Páez', 'Carlos Gruezo', 'Alan Franco', 'Jeremy Sarmiento', 'John Yeboah', 'Angel Mena'],
    fwd: ['Enner Valencia', 'Kevin Rodríguez', 'Jordy Caicedo', 'Leonardo Campana', 'Nilson Angulo', 'Allen Obando'],
  },
  'Japón': {
    gk: ['Zion Suzuki', 'Keisuke Osako', 'Tomoki Hayakawa'],
    def: ['Yūto Nagatomo', 'Shogo Taniguchi', 'Ko Itakura', 'Tsuyoshi Watanabe', 'Takehiro Tomiyasu', 'Hiroki Ito', 'Yukinari Sugawara', 'Junnosuke Suzuki'],
    mid: ['Wataru Endo', 'Junya Ito', 'Daichi Kamada', 'Ritsu Doan', 'Ao Tanaka', 'Keito Nakamura', 'Takefusa Kubo'],
    fwd: ['Yuito Suzuki', 'Koki Ogawa', 'Daizen Maeda', 'Ayase Ueda', 'Kento Shiogai'],
  },
  'Países Bajos': {
    gk: ['Mark Flekken', 'Robin Roefs', 'Bart Verbruggen'],
    def: ['Nathan Aké', 'Denzel Dumfries', 'Jorrel Hato', 'Jurriën Timber', 'Jan Paul van Hecke', 'Micky van de Ven', 'Virgil van Dijk', 'Mats Wieffer'],
    mid: ['Frenkie de Jong', 'Marten de Roon', 'Ryan Gravenberch', 'Teun Koopmeiners', 'Tijjani Reijnders', 'Guus Til', 'Quinten Timber'],
    fwd: ['Brian Brobbey', 'Memphis Depay', 'Cody Gakpo', 'Justin Kluivert', 'Noa Lang', 'Donyell Malen', 'Crysencio Summerville', 'Wout Weghorst'],
  },
  'Suecia': {
    gk: ['Viktor Johansson', 'Kristoffer Nordfeldt', 'Jacob Widell Zetterstrom'],
    def: ['Hjalmar Ekdal', 'Gabriel Gudmundsson', 'Isak Hien', 'Emil Holm', 'Gustaf Lagerbielke', 'Victor Lindelöf', 'Erik Smith', 'Carl Starfelt', 'Daniel Svensson'],
    mid: ['Taha Ali', 'Yasin Ayari', 'Lucas Bergvall', 'Jesper Karlström', 'Ken Sema', 'Mattias Svanberg', 'Besfort Zeneli'],
    fwd: ['Alexander Bernhardsson', 'Anthony Elanga', 'Viktor Gyökeres', 'Alexander Isak', 'Gustaf Nilsson', 'Benjamin Nygren'],
  },
  'Túnez': {
    gk: ['Aymen Dahmen', 'Sabri Ben Hessen', 'Abdelmouhib Chamakh'],
    def: ['Montassar Talbi', 'Dylan Bronn', 'Omar Rekik', 'Yan Valery', 'Ali Abdi', 'Moutaz Neffati', 'Adam Arous', 'Mohamed Amine Ben Hamida'],
    mid: ['Ellyes Skhiri', 'Hannibal Mejbri', 'Anis Ben Slimane', 'Hadj Mahmoud', 'Rani Khedira', 'Mortadha Ben Ouanes', 'Ismaël Gharbi'],
    fwd: ['Elias Achouri', 'Sebastian Tounekti', 'Firas Chaouat', 'Khalil Ayari', 'Hazem Mastouri', 'Rayan Elloumi'],
  },
  'Bélgica': {
    gk: ['Thibaut Courtois', 'Senne Lammens', 'Mike Penders'],
    def: ['Timothy Castagne', 'Zeno Debast', 'Maxim De Cuyper', 'Koni De Winter', 'Brandon Mechele', 'Thomas Meunier', 'Nathan Ngoy', 'Arthur Theate'],
    mid: ['Kevin De Bruyne', 'Amadou Onana', 'Nicolas Raskin', 'Youri Tielemans', 'Hans Vanaken', 'Axel Witsel'],
    fwd: ['Charles De Ketelaere', 'Jérémy Doku', 'Romelu Lukaku', 'Dodi Lukebakio', 'Diego Moreira', 'Alexis Saelemaekers', 'Leandro Trossard'],
  },
  'Egipto': {
    gk: ['Mohamed El Shenawy', 'Mostafa Shobeir', 'Mohamed Alaa'],
    def: ['Mohamed Hany', 'Tarek Alaa', 'Hamdy Fathy', 'Rami Rabia', 'Yasser Ibrahim', 'Hossam Abdelmaguid', 'Mohamed Abdelmonem', 'Ahmed Fatouh', 'Karim Hafez'],
    mid: ['Marwan Ateya', 'Mohanad Lasheen', 'Nabil Emad', 'Mahmoud Saber', 'Ahmed Zizo', 'Emam Ashour', 'Mostafa Ziko'],
    fwd: ['Mahmoud Trezeguet', 'Ibrahim Adel', 'Haissem Hassan', 'Omar Marmoush', 'Mohamed Salah', 'Hamza Abdelkarim'],
  },
  'Irán': {
    gk: ['Alireza Beiranvand', 'Hossein Hosseini', 'Payam Niazmand'],
    def: ['Danial Eiri', 'Ehsan Hajsafi', 'Saleh Hardani', 'Hossein Kanaani', 'Shojae Khalilzadeh', 'Milad Mohammadi', 'Ali Nemati', 'Omid Noorafkan', 'Ramin Rezaeian', 'Rouzbeh Cheshmi'],
    mid: ['Saeid Ezatolahi', 'Mehdi Ghaedi', 'Saman Ghoddos', 'Alireza Jahanbakhsh', 'Mohammad Mohebi', 'Mehdi Torabi'],
    fwd: ['Ali Alipour', 'Dennis Eckert Farsi', 'Amirhossein Hosseinzadeh', 'Kasra Taheri', 'Mehdi Taremi'],
  },
  'Nueva Zelanda': {
    gk: ['Max Crocombe', 'Alex Paulsen', 'Michael Woud'],
    def: ['Tim Payne', 'Francis De Vries', 'Tyler Bindon', 'Michael Boxall', 'Liberato Cacace', 'Nando Pijnaker', 'Callan Elliot', 'Tommy Smith'],
    mid: ['Joe Bell', 'Matt Garbett', 'Marko Stamenic', 'Sarpreet Singh', 'Alex Rufer', 'Ryan Thomas', 'Ben Old'],
    fwd: ['Chris Wood', 'Eli Just', 'Kosta Barbarouses', 'Ben Waine', 'Callum McCowatt', 'Jesse Randall'],
  },
  'Arabia Saudita': {
    gk: ['Mohammed Al-Owais', 'Nawaf Al-Aqidi', 'Ahmed Al-Kassar'],
    def: ['Saud Abdulhamid', 'Hassan Al-Tambakti', 'Nawaf Boushal', 'Ali Majrashi', 'Ali Lajami', 'Hassan Kadesh', 'Moteb Al-Harbi', 'Jehad Thakri', 'Zakaria Hawsawi'],
    mid: ['Salem Al-Dawsari', 'Mohamed Kanno', 'Nasser Al-Dawsari', 'Abdullah Al-Khaibari', 'Musab Al-Juwayr', 'Alaa Al-Hajji', 'Ziyad Al-Johani', 'Ayman Yahya', 'Sultan Mandash'],
    fwd: ['Firas Al-Buraikan', 'Saleh Al-Shehri', 'Abdullah Al-Hamdan', 'Khalid Al-Ghannam', 'Abdullah Al-Salem'],
  },
  'Cabo Verde': {
    gk: ['Vozinha', 'Marcio Rosa', 'CJ dos Santos'],
    def: ['Steven Moreira', 'Wagner Pina', 'Joao Paulo', 'Logan Costa', 'Pico', 'Kelvin Pires', 'Stopira', 'Diney', 'Roberto Lopes'],
    mid: ['Jamiro Monteiro', 'Telmo Arcanjo', 'Yannick Semedo', 'Laros Duarte', 'Deroy Duarte', 'Kevin Pina'],
    fwd: ['Ryan Mendes', 'Willy Semedo', 'Garry Rodrigues', 'Jovane Cabral', 'Nuno da Costa', 'Dailon Livramento', 'Helio Varela'],
  },
  'España': {
    gk: ['Unai Simón', 'David Raya', 'Joan García'],
    def: ['Marc Cucurella', 'Pau Cubarsí', 'Aymeric Laporte', 'Álex Grimaldo', 'Pedro Porro', 'Eric García', 'Marcos Llorente', 'Marc Pubill'],
    mid: ['Gavi', 'Rodri', 'Pedri', 'Martín Zubimendi', 'Fabián Ruiz', 'Álex Baena', 'Mikel Merino', 'Dani Olmo'],
    fwd: ['Lamine Yamal', 'Nico Williams', 'Ferran Torres', 'Mikel Oyarzabal', 'Yéremy Pino', 'Borja Iglesias', 'Víctor Muñoz'],
  },
  'Uruguay': {
    gk: ['Sergio Rochet', 'Santiago Mele', 'Fernando Muslera'],
    def: ['Jose Maria Gimenez', 'Sebastian Caceres', 'Ronald Araujo', 'Guillermo Varela', 'Mathias Olivera', 'Matias Vina', 'Santiago Bueno', 'Jose Luis Rodriguez', 'Joaquin Piquerez'],
    mid: ['Manuel Ugarte', 'Nicolas de la Cruz', 'Emiliano Martinez', 'Giorgian de Arrascaeta', 'Federico Valverde', 'Maximiliano Araujo', 'Nicolas Fonseca'],
    fwd: ['Darwin Nunez', 'Facundo Pellistri', 'Agustin Canobbio', 'Brian Rodriguez', 'Facundo Torres'],
  },
  'Francia': {
    gk: ['Mike Maignan', 'Robin Risser', 'Brice Samba'],
    def: ['Lucas Digne', 'Malo Gusto', 'Lucas Hernández', 'Theo Hernández', 'Ibrahima Konaté', 'Jules Koundé', 'Maxence Lacroix', 'William Saliba', 'Dayot Upamecano'],
    mid: ['N\'Golo Kanté', 'Manu Koné', 'Adrien Rabiot', 'Aurélien Tchouaméni', 'Warren Zaïre-Emery'],
    fwd: ['Maghnes Akliouche', 'Bradley Barcola', 'Rayan Cherki', 'Ousmane Dembélé', 'Désiré Doué', 'Jean-Philippe Mateta', 'Kylian Mbappé', 'Michael Olise', 'Marcus Thuram'],
  },
  'Irak': {
    gk: ['Fahad Talib', 'Ahmed Basil', 'Kamel Al-Rekabe'],
    def: ['Rebin Sulaka', 'Manaf Younis', 'Merchas Doski', 'Zaid Tahseen', 'Akam Hashem', 'Ali Adnan', 'Frans Putros', 'Mustafa Saadun'],
    mid: ['Ibrahim Bayesh', 'Hasan Abdulkareem', 'Zidane Iqbal', 'Kevin Yakob', 'Amir Al-Ammari', 'Peter Gwargis', 'Marko Farji'],
    fwd: ['Aymen Hussein', 'Mohannad Ali', 'Ali Al-Hamadi', 'Ali Jasim', 'Ali Yousif'],
  },
  'Noruega': {
    gk: ['Ørjan Nyland', 'Egil Selvik', 'Sander Tangvik'],
    def: ['Julian Ryerson', 'Kristoffer Ajer', 'Leo Østigård', 'David Møller Wolfe', 'Marcus Holmgren Pedersen', 'Torbjørn Heggem', 'Fredrik André Bjørkan', 'Sondre Langås'],
    mid: ['Martin Ødegaard', 'Sander Berge', 'Patrick Berg', 'Kristian Thorstvedt', 'Morten Thorsby', 'Andreas Schjelderup', 'Jens Petter Hauge', 'Fredrik Aursnes', 'Oscar Bobb', 'Antonio Nusa'],
    fwd: ['Erling Haaland', 'Alexander Sørloth', 'Jørgen Strand Larsen'],
  },
  'Senegal': {
    gk: ['Édouard Mendy', 'Mory Diaw', 'Yehvann Diouf'],
    def: ['Krépin Diatta', 'Antoine Mendy', 'Kalidou Koulibaly', 'El Hadji Malick Diouf', 'Mamadou Sarr', 'Moussa Niakhaté', 'Moustapha Mbow', 'Abdoulaye Seck', 'Ismail Jakobs'],
    mid: ['Idrissa Gana Gueye', 'Pape Gueye', 'Lamine Camara', 'Habib Diarra', 'Pathé Ciss', 'Pape Matar Sarr'],
    fwd: ['Sadio Mané', 'Ismaïla Sarr', 'Iliman Ndiaye', 'Assane Diao', 'Nicolas Jackson', 'Bamba Dieng', 'Cherif Ndiaye'],
  },
  'Argelia': {
    gk: ['Luca Zidane', 'Melvin Mastil', 'Anthony Mandrea'],
    def: ['Aissa Mandi', 'Ramy Bensebaini', 'Rayan Ait-Nouri', 'Rafik Belghali', 'Zineddine Belaid', 'Jaouen Hadjam', 'Samir Chergui', 'Mehdi Dorval'],
    mid: ['Nabil Bentaleb', 'Houssem Aouar', 'Yacine Titraoui', 'Hicham Boudaoui', 'Ibrahim Maza', 'Farès Chaïbi', 'Ramiz Zerrouki', 'Adil Aouchiche'],
    fwd: ['Riyad Mahrez', 'Mohamed Amoura', 'Amine Gouiri', 'Anis Hadj-Moussa', 'Nadhir Benbouali'],
  },
  'Argentina': {
    gk: ['Emiliano Martínez', 'Gerónimo Rulli', 'Juan Musso'],
    def: ['Agustín Giay', 'Gonzalo Montiel', 'Nahuel Molina', 'Lucas Martínez Quarta', 'Marcos Senesi', 'Lisandro Martínez', 'Nicolás Otamendi', 'Germán Pezzella', 'Cristian Romero', 'Facundo Medina', 'Marcos Acuña', 'Nicolás Tagliafico'],
    mid: ['Leandro Paredes', 'Rodrigo De Paul', 'Exequiel Palacios', 'Enzo Fernández', 'Alexis Mac Allister', 'Giovani Lo Celso', 'Valentín Barco'],
    fwd: ['Lionel Messi', 'Alejandro Garnacho', 'Giuliano Simeone', 'Matías Soulé', 'Claudio Echeverri', 'Franco Mastantuono', 'Lautaro Martínez', 'Julián Álvarez', 'Santiago Castro'],
  },
  'Austria': {
    gk: ['Alexander Schlager', 'Florian Wiegele', 'Patrick Pentz'],
    def: ['David Affengruber', 'Kevin Danso', 'Stefan Posch', 'David Alaba', 'Philipp Lienhart', 'Philipp Mwene', 'Alexander Prass', 'Marco Friedl', 'Michael Svoboda'],
    mid: ['Xaver Schlager', 'Nicolas Seiwald', 'Marcel Sabitzer', 'Romano Schmid', 'Christoph Baumgartner', 'Konrad Laimer', 'Patrick Wimmer', 'Paul Wanner'],
    fwd: ['Marko Arnautovic', 'Michael Gregoritsch', 'Sasa Kalajdzic'],
  },
  'Jordania': {
    gk: ['Yazid Abulaila', 'Abdallah Al-Fakhouri', 'Nour Bani Attiah'],
    def: ['Ihsan Haddad', 'Yazan Al-Arab', 'Abdallah Nasib', 'Saed Al-Rosan', 'Husam Abu Dahab', 'Mohammad Abualnadi', 'Yousef Abu Al-Jazar', 'Salim Obaid', 'Ahmad Assaf', 'Anas Badawi'],
    mid: ['Rajaei Ayed', 'Noor Al-Rawabdeh', 'Ibrahim Sadeh', 'Nizar Al-Rashdan', 'Mohannad Abu Taha', 'Amer Jamous', 'Mohammad Al-Dawoud', 'Yousef Qashi'],
    fwd: ['Musa Al-Taamari', 'Ali Olwan', 'Mohammad Abu Zrayq', 'Ali Azaizeh', 'Odeh Al-Fakhouri'],
  },
  'Colombia': {
    gk: ['David Ospina', 'Camilo Vargas', 'Álvaro Montero'],
    def: ['Davinson Sánchez', 'Santiago Arias', 'Yerry Mina', 'Daniel Muñoz', 'Johan Mojica', 'Jhon Lucumí', 'Deiver Machado', 'Willer Ditta'],
    mid: ['James Rodríguez', 'Jefferson Lerma', 'Juan Fernando Quintero', 'Jhon Arias', 'Richard Ríos', 'Kevin Castaño', 'Jorge Carrascal', 'Gustavo Puerta'],
    fwd: ['Luis Díaz', 'Jhon Córdoba', 'Cucho Hernández', 'Carlos Andrés Gómez'],
  },
  'Portugal': {
    gk: ['Diogo Costa', 'José Sá', 'Rui Silva'],
    def: ['Rúben Dias', 'João Cancelo', 'Diogo Dalot', 'Nuno Mendes', 'Nélson Semedo', 'Gonçalo Inácio', 'Renato Veiga', 'Tomás Araújo'],
    mid: ['Bruno Fernandes', 'Bernardo Silva', 'Vitinha', 'João Neves', 'Rúben Neves', 'Samú Costa'],
    fwd: ['Cristiano Ronaldo', 'Rafael Leão', 'João Félix', 'Gonçalo Ramos', 'Pedro Neto', 'Francisco Conceição', 'Francisco Trincão'],
  },
  'RD Congo': {
    gk: ['Lionel Mpasi', 'Timothy Fayulu', 'Matthieu Epolo'],
    def: ['Chancel Mbemba', 'Axel Tuanzebe', 'Arthur Masuaku', 'Gédéon Kalulu', 'Joris Kayembe', 'Aaron Wan-Bissaka', 'Steve Kapuadi', 'Dylan Batubinsika', 'Noah Sadiki'],
    mid: ['Charles Pickel', 'Edo Kayembe', 'Samuel Moutoussamy', 'Ngal\'ayel Mukau', 'Nathanaël Mbuku', 'Meschak Elia', 'Gaël Kakuta', 'Théo Bongonda'],
    fwd: ['Simon Banza', 'Yoane Wissa', 'Fiston Mayele', 'Cédric Bakambu'],
  },
  'Uzbekistán': {
    gk: ['Utkir Yusupov', 'Botirali Ergashev', 'Abduvohid Nematov'],
    def: ['Rustam Ashurmatov', 'Farrukh Sayfiev', 'Khojiakbar Alijonov', 'Sherzod Nasrullaev', 'Umar Eshmurodov', 'Abdukodir Khusanov', 'Abdulla Abdullaev', 'Bekhruz Karimov', 'Jakhongir Urozov'],
    mid: ['Otabek Shukurov', 'Odiljon Khamrobekov', 'Jamshid Iskanderov', 'Akmal Mozgovoy', 'Jasurbek Jaloliddinov'],
    fwd: ['Eldor Shomurodov', 'Igor Sergeev', 'Jaloliddin Masharipov', 'Oston Urunov', 'Dostonbek Khamdamov', 'Abbosbek Fayzullaev', 'Azizbek Amonov'],
  },
  'Croacia': {
    gk: ['Dominik Livaković', 'Dominik Kotarski', 'Ivor Pandur'],
    def: ['Joško Gvardiol', 'Duje Ćaleta-Car', 'Josip Šutalo', 'Josip Stanišić', 'Marin Pongračić', 'Martin Erlić', 'Luka Vušković'],
    mid: ['Luka Modrić', 'Mateo Kovačić', 'Mario Pašalić', 'Nikola Vlašić', 'Luka Sučić', 'Martin Baturina', 'Kristijan Jakić', 'Nikola Moro'],
    fwd: ['Ivan Perišić', 'Andrej Kramarić', 'Ante Budimir', 'Petar Musa', 'Igor Matanović'],
  },
  'Ghana': {
    gk: ['Lawrence Ati-Zigi', 'Benjamin Asare', 'Solomon Agbasi'],
    def: ['Abdul Rahman Baba', 'Gideon Mensah', 'Alexander Djiku', 'Alidu Seidu', 'Jerome Opoku', 'Jonas Adjetey', 'Abdul Mumin', 'Marvin Senaya'],
    mid: ['Thomas Partey', 'Abdul Fatawu', 'Kamaldeen Sulemana', 'Elisha Owusu', 'Caleb Yirenkyi', 'Augustine Boakye'],
    fwd: ['Jordan Ayew', 'Antoine Semenyo', 'Inaki Williams', 'Ernest Nuamah', 'Christopher Bonsu Baah', 'Brandon Thomas-Asante', 'Prince Kwabena Adu'],
  },
  'Inglaterra': {
    gk: ['Jordan Pickford', 'Dean Henderson', 'James Trafford'],
    def: ['Dan Burn', 'Marc Guehi', 'Reece James', 'Ezri Konsa', 'Tino Livramento', 'Nico O\'Reilly', 'Jarell Quansah', 'Djed Spence', 'John Stones'],
    mid: ['Elliot Anderson', 'Jude Bellingham', 'Eberechi Eze', 'Jordan Henderson', 'Kobbie Mainoo', 'Declan Rice', 'Morgan Rogers'],
    fwd: ['Anthony Gordon', 'Harry Kane', 'Noni Madueke', 'Marcus Rashford', 'Bukayo Saka', 'Ivan Toney', 'Ollie Watkins'],
  },
  'Panamá': {
    gk: ['Orlando Mosquera', 'Luis Mejía', 'César Samudio'],
    def: ['César Blackman', 'Jorge Gutiérrez', 'Amir Murillo', 'Fidel Escobar', 'Andrés Andrade', 'Edgardo Fariña', 'José Córdoba', 'Eric Davis', 'Roderick Miller'],
    mid: ['Aníbal Godoy', 'Adalberto Carrasquilla', 'Carlos Harvey', 'Cristian Martínez', 'César Yanis', 'Yoel Bárcenas', 'Alberto Quintero', 'Azarías Londoño'],
    fwd: ['Ismael Díaz', 'Cecilio Waterman', 'José Fajardo', 'Tomás Rodríguez'],
  },
}

export default squads
