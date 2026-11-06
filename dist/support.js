// Buddy — көңіл күйді қолдау (supportive listening).
// Студент көңіл күйі туралы жазса (мұң, стресс, шаршау, жалғыздық, сәтсіздік, ашу, мотивация жоқ, үлгермеу),
// Buddy алдымен сезімін мойындайды, тыныштандыратын әдіс ұсынады, студенттің НАҚТЫ кестесі мен дедлайндарына
// сүйеніп кішкентай келесі қадамдарды айтады, демалуға шақырады, мотивация береді және әңгімені жалғастырады.
// Мәтіндерді код жазады (модельдің қазақшасы әлсіз) — сапасы тұрақты. Қауіпті белгілер (суицид, өзіне зиян)
// табылса — модельге жібермей, бірден сенім телефондары мен қауіпсіздік қадамдары беріледі.
// Маңызды: Buddy — психолог емес, ол қолдау көрсетеді және қажет кезде маманға бағыттайды.
(function(){

// ---------- Тану ----------
// Ескерту: JS-тегі \b кирилицамен жұмыс істемейді, сондықтан түбірлер мұқият таңдалған.
const RX={
 homesick:/сағындым|сағынып жүрмін|үйімді сағын|ауылымды сағын|скучаю по (дому|родным|маме|семье)|тоска по дому|homesick|miss (my )?(home|family)/,
 money:/ақша(м)? жоқ|ақшам жетпей|төлей алмай|нет денег|денег не хватает|не могу (оплатить|заплатить)|can'?t (afford|pay)|no money/,
 bullying:/мазақтай|мазақ қыл|мазақ ет|буллинг|травят|издеваются|высмеивают|bull(y|ied|ying)|mock(s|ing)? me/,
 friend:/сатып кетті|досым .{0,25}(алдады|сатты|айтып қойыпты|айтып қойды)|предал(а)?|подставил(а)?|betrayed me/,
 selfdoubt:/ештеңеге жарамай|өзіме сенбей|бәрі менен жақсы|ни на что не способ|я ничтожеств|хуже всех|worthless|not good enough/,
 avoid:/сабаққа барғым келмей|сабаққа бармай|бармаймын сабаққа|не хочу (идти|ходить) на пар|перестал[аи]? ходить на пар|don'?t want to go to class/,
 shame:/ұялдым|ұят болды|ұялып қалдым|масқара|айқайлады|айқайлап|ұрсып тастады|ұрсты|кемсітт|мазақ|маған күлді|күлкі болдым|опозор|стыдно|унизил|унижен|накричал|наорал|высмеял|засмеял|humiliat|embarrass|yelled at me|shouted at me|laughed at me/,
 breakup:/ажырастық|ажырасып кетт|мені тастап кетті|айрылыстық|айрылып қалдым|қызыммен|жігітіммен|сүйгенім|расстал|бросил|бросила|разрыв|бывш|break ?up|broke up|dumped|my ex/,
 family:/ата-?анам.{0,15}(түсінбей|ұрс|ұрыс|қысым)|ата анам.{0,15}(түсінбей|ұрс|ұрыс)|үйде ұрыс|үйдегілер (түсінбей|ұрс)|әкеммен ұрыс|шешеммен ұрыс|анаммен ұрыс|отбасымда (ұрыс|қиын|жанжал)|с родителями (ссор|руга|конфликт)|родители (не понимают|давят|ругают|кричат)|ссор[аы] с (мамой|папой|родителями)|дома (скандал|ссор)|parents (don'?t|fight|yell|pressure)|fight with my (mom|dad|parents)/,
 crisis:/өзімді өлтір|өзіме қол сал|өзіме қол жұмса|қол жұмсағым|өлгім келеді|өлейінші|өмір сүргім келмей|өмірден кеткім|өмірден кетем|жоқ болғым келеді|жоқ болып кеткім|суицид|асылып өл|асылғым|тамырымды кес|өзіме зиян|өзімді жарақатта|хочу умереть|хочется умереть|не хочу жить|не хочется жить|покончить с собой|покончу с собой|убить себя|убью себя|самоубий|суицид|порезать себя|режу себя|резать себя|наложить на себя руки|лучше бы меня не было|исчезнуть навсегда|kill myself|killing myself|suicid|want to die|wanna die|end my life|don'?t want to live|hurt myself|self[- ]?harm|cut myself|better off dead/,
 sad:/депресс|мұңай|мұңды|мұңым|қайғыр|қайғы|жылағым|жыладым|жылап отыр|жылап жүр|көңіл ?күйім (жоқ|нашар|жаман|түсіп|бұзы)|көңіл-?күйім (жоқ|нашар|жаман|түсіп)|көңілсіз|ештеңе қызық емес|ештеңе қуантпа|бәрі мағынасыз|жаным ауыр|жаман сезін|өзімді жаман|ішім пыс|грус|тоск|печал|я плачу|плакать|плохо на душе|хреново|настроени[ея] (нет|плох|ужас|на нуле)|ничего не радует|плохое настроени|паршивое настроени|ужасное настроени|плохо себя чувствую|апати|пустот|depress|\bsad\b|\bcry(ing)?\b|hopeless|feel(ing)? (bad|empty|down|awful|terrible)|unhappy|heartbroken/,
 lonely:/жалғызбын|жалғыз қалдым|жалғызсыра|жалғыздық|өзімді жалғыз|ешкім түсінбей|ешкімге керек емес|ешкімге керексіз|досым жоқ|достарым жоқ|одинок|одиноч|никто не понимает|никому не нужн|нет друзей|lonely|loneliness|no friends|nobody understands|no one understands|all alone/,
 failure:/құладым|құлап қалдым|құлатты|нашар баға|жаман баға|баға(м)? нашар|f алдым|ф алдым|ретейк|retake|қайта тапсыр|оқудан шығ|шығарып жібер|стипендиядан айыр|завалил|провалил|плох(ую|ая|ие|ой) оценк|двойк|отчисл|пересда|лишат стипенд|failed|fail(ed)? (the |my |an )?(exam|test|course)|bad grade|got an f|expelled/,
 overwhelmed:/үлгермей|үлгере алмай|ештеңеге үлгер|бәрі үйіліп|бәрі бірден|тым көп|басым қатты|басым айнал|не істерімді білмей|неден бастарымды білмей|не успева|ничего не успева|завал|слишком много|голова кругом|не знаю за что взяться|не знаю с чего начать|overwhelm|too much (work|to do)|can'?t keep up|behind on everything|don'?t know where to start/,
 anxiety:/уайым|алаңда|қорқам|қорқамын|қорқып|қорқыныш|мазасыз|дүрбелең|паника|стресс|қобалж|жүйкем|тревог|тревож|волнуюсь|переживаю|боюсь|страшно|паник|нервнич|anxi|panic|stress|worried|worrying|nervous|scared|afraid/,
 tired:/шаршадым|шаршап жүр|шаршап кетт|қажыдым|қажып|күшім (жоқ|қалмады|таусыл)|әлім (жоқ|қалмады)|ұйқым (қанбай|қанбады|келмей|қашты)|ұйықтай алмай|ұйқысыз|күйіп кетт|выгор|[^а-я]устал|вымотал|нет сил|сил нет|не высып|бессон|не могу уснуть|tired|exhaust|burn ?out|burned out|no energy|can'?t sleep|insomnia/,
 angry:/ашуым|ашулымын|ашуланып|ызам|ызалан|ыза болып|ренжідім|ренжіп жүр|жыным|ұрыстым|ұрысып қалдым|бесит|злюсь|злой|разозл|раздраж|ненавижу|angry|furious|pissed|so mad|i hate/,
 unmotivated:/ерінем|еріншек|мотивация(м)? жоқ|мотивацием жоқ|оқығым келмей|ештеңе істегім келмей|құлқым жоқ|ынтам жоқ|[^а-я]лень|ленюсь|нет мотивац|не хочу учит|ничего не хочу делать|прокраст|no motivation|unmotivated|procrastinat|don'?t want to study|lazy/
};
const ORDER=['breakup','shame','family','homesick','money','bullying','friend','selfdoubt','avoid','sad','lonely','failure','overwhelmed','anxiety','tired','angry','unmotivated'];
const EXAM=/емтихан|сессия|экзамен|сессии|exam|midterm|final|тест/;
const SEVERE=/депресс|depress|апта бойы|бірнеше апта|ай бойы|ұзақ уақыт|ештеңе қуантпа|ұйықтай алмай|тамақ ішкім келмей|недел[ия]|месяц|давно|долго|ничего не радует|не могу есть|for weeks|for months|nothing makes me happy|can'?t eat/;
function detect(q){
 const s=' '+String(q||'').toLowerCase().replace(/ё/g,'е')+' ';
 if(RX.crisis.test(s))return {kind:'crisis'};
 const kind=ORDER.find(k=>RX[k].test(s));
 return kind?{kind,exam:EXAM.test(s),severe:SEVERE.test(s)}:null;
}

// ---------- Мәтіндер ----------
const TX={
kk:{
 friend:'Досым',moodChip:'💜 Көңіл күйім нашар',
 askMood:'Көңіл күйім нашар 😔',
 stepsTitle:'✅ Қазір не істеуге болады:',
 open:{
  sad:['{n}, маған жазғаның өте жақсы болды. Көңіл күйің түсіп тұрғанын түсінемін — мұндай сезім кез келген адамда болады, сен жалғыз емессің.','{n}, қазір саған ауыр екенін сезіп тұрмын. Мұңаю — әлсіздік емес, ол сенің бір нәрсеге шынымен мән беретініңді көрсетеді.'],
  lonely:['{n}, жалғыздық сезімі — ең ауыр сезімдердің бірі. Сен маған жаздың, демек байланыс іздеп жүрсің — бұл дұрыс әрі батыл қадам. Мен осындамын.','{n}, сені ешкім түсінбейтіндей сезілуі қандай ауыр екенін білемін. Бірақ бұл сезім уақытша, ал сен шынымен де біреуге керексің.'],
  failure:['{n}, бұл жағымсыз жағдай, ренжігенің әбден орынды. Бірақ бір сәтсіздік сенің кім екеніңді де, болашағыңды да анықтамайды.','{n}, ренжігеніңді түсінемін — еңбек еттің, ал нәтиже күткендей болмады. Бұл соңғы нүкте емес, тек бір баған.'],
  overwhelmed:['{n}, бәрі бірден үйіліп қалғандай сезім өте ауыр. Тоқтайық та, бірге ретке келтірейік — бәрін бірден шешу міндет емес.','{n}, міндеттер көп болғанда бас айналатыны қалыпты. Жақсы жаңалық — оларды бөліп-бөліп шешуге болады, мен көмектесемін.'],
  anxiety:['{n}, уайымдап жүргеніңді түсінемін. Бұл — ағзаңның «бұл маған маңызды» деген белгісі, қауіптің белгісі емес.','{n}, стресс кезінде бәрі үлкен әрі қорқынышты көрінеді. Келші, бірге тынышталып, ретке келтірейік.'],
  tired:['{n}, шаршағаның әбден түсінікті — сен көп жұмыс істеп жүрсің. Демалу — жалқаулық емес, ол да жұмыстың бір бөлігі.','{n}, күшің таусылған сияқты. Ағзаң «тоқта, қалпыңа кел» деп белгі беріп тұр — соны тыңдайық.'],
  angry:['{n}, ашуланғаның түсінікті — бір нәрсе шынымен көңіліңе тиген сияқты. Ашу — қалыпты сезім, бастысы — оны өзіңе зиянсыз басу.','{n}, ішіңде ыза жиналғанын сезіп тұрмын. Бұл сезімге құқығың бар — енді оны қалай жеңілдетуге болатынын қарайық.'],
  unmotivated:['{n}, мотивация жоқ күндер бәрінде болады — бұл жалқаулық емес, көбінесе шаршаудың не тым үлкен міндеттің белгісі.','{n}, ештеңе істегің келмейтін кез — қалыпты жағдай. Күшпен емес, кішкентай қадаммен бастайық.']
 },
 calm:{
  breath:'🌬 Алдымен демді түзейік: 4 секунд мұрынмен дем ал, 4 секунд ұста, 6 секунд аузыңмен баяу шығар. 5 рет қайтала — жүйке жүйесі тынышталады.',
  ground:'🌿 5-4-3-2-1 әдісі: айналаңнан 5 нәрсені көр, 4 дыбысты есті, 3 нәрсені қолыңмен ұста, 2 иісті сез, 1 дәмді байқа. Ой «осы сәтке» оралады.',
  body:'💧 Иығыңды түсір, жағыңды босат, бетіңді салқын сумен жу да, бір стақан су іш. Дене босаса, ой да жеңілдейді.',
  kind:'🤍 Өзіңе жақын досыңа айтатындай жылы сөз айт: «Маған қазір қиын, бұл қалыпты. Мен бірте-бірте жақсарамын».',
  count:'⏸ Бір минут тоқта: 10-нан 1-ге дейін баяу санап, әр санда терең дем шығар. Ашу толқын сияқты — шыңына жетеді де, басылады.'
 },
 step:{
  writeWorry:'Уайымыңды қағазға жаз: нақты неден қорқасың? Жазылған ой бастағыдан әлдеқайда кішірейеді.',
  exam:'Емтиханға: материалды 3 бөлікке бөл, әр бөліктен кейін өзіңе 3 сұрақ қой. Түнде кемінде 7 сағат ұйықта — ми ақпаратты ұйқыда бекітеді.',
  caffeine:'Кофе мен энергетикті азайт — олар жүректі жылдамдатып, уайымды күшейтеді.',
  small:'Бүгін өзіңнен көп талап етпе. Бір ғана кішкентай іс жеткілікті: су іш, жылы тамақ іш, жуын.',
  walk:'10–15 минут далаға шығып, күн жарығында жүріп кел — бұл көңіл күйге шынымен әсер етеді.',
  reach:'Сенетін бір адамға жаз: «Сөйлесейікші» деген бір сөйлем де жеткілікті.',
  sleep:'Бүгін ұйықтар алдында 1 сағат телефонсыз бол, кемінде 7–8 сағат ұйықта.',
  water:'Су ішіп, жеңіл тамақтан. Шаршаудың жартысы — ұйқы мен судың жетіспеуі.',
  firstMsg:'Бүгін бір адамға өзің бірінші жаз — топтасыңа «бірге дайындалайық па?» деп ұсыныс жаса.',
  club:'Университеттегі клубтардың біріне бір рет барып көр — ортақ қызығушылық адамдарды тез жақындатады.',
  call:'Ата-анаңа не ескі досыңа қоңырау шал — жай дауысын есту де жеңілдетеді.',
  notMeasure:'Бір баға — сенің қабілетіңнің өлшемі емес, бір күннің нәтижесі ғана.',
  teacher:'Оқытушыға барып, қай жерде қате жібергеніңді сұра — бұл келесі жолы ұпай қосады және оқытушыға жауапкершілігіңді көрсетеді.',
  retake:'Қайта тапсыру, ретейк немесе қосымша тапсырма мүмкіндігін эдвайзеріңнен біл — жол жабылған жоқ.',
  gpa:'«GPA және бағалар» бетінде келесі емтиханға қанша балл керегін есептеп ал — нақты сан уайымды азайтады.',
  wait:'Жауап беруге асықпа — ашу 20 минутта басылады. Хабарлама жазсаң, жібермей тұр.',
  move:'Ашуды денеңнен шығар: 10 минут жылдам жүр немесе баспалдақпен көтеріл.',
  talkLater:'Сабыр тапқанда «Мен ... болғанда ренжідім» деп өз сезіміңнен бастап сөйлес — бұл дауды емес, шешімді әкеледі.',
  fiveMin:'Мотивацияны күтпе — ол әрекеттен кейін келеді. Таймерді 5 минутқа қой да, жай баста.',
  phone:'Телефонды басқа бөлмеге қой — зейінге ең қатты әсер ететін қадам осы.',
  reward:'Бітірген соң өзіңе кішкентай сыйлық бер: сүйікті ас, серуен не бір серия.',
  paper:'Барлық міндетіңді қағазға жаз — бастағы тізім ауыр, ал қағаздағы тізім — жоспар.',
  pomodoro:'Әр тапсырманы 25 минуттық бөліктерге бөл. Бір уақытта — бір ғана іс.'
 },
 data:{
  dlFirst:'Ең жақын міндетің — «{t}» ({w}). Соның ең кішкентай бірінші қадамын ғана 25 минут істе, сосын 5 минут демал.',
  dlOnly:'«{t}» мерзімі — {w}. Бүгін соған тек 30 минут бөл, қалғанын ертең сергек баспен істейсің.',
  urgentList:'Ең шұғылдары:',
  urgentFocus:'Бүгін тек біріншісімен айналыс — қалғаны кезегімен.',
  noUrgent:'Шұғыл дедлайның жоқ — демек, уақытың жеткілікті. Асықпай, апталық жоспар құрып ал.',
  nextFree:'Келесі сабағың — {s}, {time}. Оған дейін {free} бар — асықпа, үлгересің.',
  nowClass:'Қазір «{s}» сабағы жүріп жатыр, {left} қалды. Сабақтан кейін 10 минут өзіңе үзіліс бер.',
  classesDone:'Бүгінгі сабақтарың бітті — кешті толық демалысқа арна, сен оған лайықсың.',
  classesLeft:'Бүгін тағы {k} сабағың бар, соңғысы {end}-де бітеді. Мінсіз болуға тырыспа — жай қатысу да жеткілікті.',
  night:'Қазір түн — түнде ой ауырырақ көрінеді. Бүгін маңызды шешім қабылдама, алдымен ұйықта; таңертең бәрі басқаша көрінеді.'
 },
 motiv:{
  any:['Сен ойлағаныңнан әлдеқайда күштісің — осыған дейін талай қиындықтан өттің ғой.','Баяу жүру — тоқтап қалу емес. Әр кішкентай қадам есептеледі.','Қиын күн — қиын өмір емес. Ертең — жаңа бет.','Бәрін бірден шешу міндет емес. Бүгін — тек бір қадам.'],
  tired:['Демалу — жалқаулық емес, ол — күш жинау. Толық батареямен бәрі оңайырақ.'],
  failure:['Сенің құндылығың бағаңмен өлшенбейді. Ең мықтылар да құлап, қайта тұрған.'],
  lonely:['Сен шынымен маңыздысың, және сені түсінетін адамдар міндетті түрде табылады.']
 },
 help:'🤝 Егер бұл күй екі аптадан асса немесе ұйқың, тәбетің, оқуың бұзылса — бұл әлсіздік емес, көмек керек деген белгі. Университеттің психологына жүгіну — батыл әрі дұрыс қадам. Тегін әрі тәулік бойы жұмыс істейтін 111 сенім телефоны да бар.',
 note:'Мен психолог емеспін, бірақ әрқашан тыңдауға дайынмын.',
 ask:['Не болғанын толығырақ айтқың келсе, жаз — тыңдаймын. 💜','Қазір өзіңді қалай сезініп тұрсың, 1-ден 10-ға дейін бағалашы?','Саған қазір не көбірек көмектеседі: жай сөйлесу ме, әлде нақты жоспар ма?'],
 crisis:'{n}, осыны маған жазғаның үшін рахмет — бұл үлкен батылдық. Сенің өмірің маңызды, және сен бұл ауыртпалықты жалғыз көтеруге міндетті емессің.\n\nҚазір ең маңыздысы — қауіпсіздігің:\n📞 112 — қауіп төнсе, дәл қазір қоңырау шал (тәулік бойы)\n📞 111 — тегін, анонимді сенім телефоны (тәулік бойы)\n📞 150 — жастарға арналған сенім телефоны · WhatsApp: +7 708 106 08 10\n\n• Жаныңдағы сенетін бір адамға — досыңа, туысыңа, кураторыңа — дәл қазір «маған қазір өте қиын, қасымда бол» деп жаз немесе қоңырау шал.\n• Өзіңе зиян келтіруі мүмкін заттарды алысқа қой, жалғыз қалма.\n• Баяу дем ал: 4 секунд дем ал, 6 секунд шығар.\n\nМен осындамын және сені тыңдаймын. Қазір қауіпсіз жердесің бе?'
},
ru:{
 friend:'Друг',moodChip:'💜 Плохое настроение',
 askMood:'У меня плохое настроение 😔',
 stepsTitle:'✅ Что можно сделать сейчас:',
 open:{
  sad:['{n}, хорошо, что ты мне написал(а). Понимаю, что настроение на нуле — такое бывает у каждого, ты не один(одна).','{n}, чувствую, что тебе сейчас тяжело. Грусть — не слабость, она показывает, что тебе действительно что-то важно.'],
  lonely:['{n}, одиночество — одно из самых тяжёлых чувств. Ты написал(а) мне, значит, ищешь связи — это правильный и смелый шаг. Я рядом.','{n}, знаю, как тяжело, когда кажется, что тебя никто не понимает. Это чувство временное, а ты правда кому-то нужен(нужна).'],
  failure:['{n}, ситуация неприятная, и расстроиться — нормально. Но одна неудача не определяет ни тебя, ни твоё будущее.','{n}, понимаю — ты старался(ась), а результат не тот. Это не конец, а всего лишь одна оценка.'],
  overwhelmed:['{n}, когда всё наваливается сразу, это очень тяжело. Давай остановимся и разложим всё по полочкам — решать всё сразу не нужно.','{n}, когда задач много, голова идёт кругом — это нормально. Хорошая новость: их можно решать по частям, я помогу.'],
  anxiety:['{n}, понимаю, что ты переживаешь. Это сигнал организма «мне это важно», а не сигнал опасности.','{n}, в стрессе всё кажется огромным и страшным. Давай вместе успокоимся и разберёмся.'],
  tired:['{n}, усталость понятна — ты много работаешь. Отдых — не лень, а часть работы.','{n}, похоже, силы закончились. Организм говорит «остановись и восстановись» — давай его послушаем.'],
  angry:['{n}, злиться — нормально: похоже, что-то тебя действительно задело. Главное — выпустить это без вреда для себя.','{n}, чувствую, что внутри накопилось раздражение. Ты имеешь право на это чувство — давай посмотрим, как его облегчить.'],
  unmotivated:['{n}, дни без мотивации бывают у всех — чаще это не лень, а усталость или слишком большая задача.','{n}, бывает, что ничего не хочется — это нормально. Начнём не силой, а маленьким шагом.']
 },
 calm:{
  breath:'🌬 Сначала выровняем дыхание: вдох носом 4 секунды, задержка 4, медленный выдох ртом 6 секунд. Повтори 5 раз — нервная система успокоится.',
  ground:'🌿 Техника 5-4-3-2-1: найди глазами 5 предметов, услышь 4 звука, потрогай 3 вещи, почувствуй 2 запаха, 1 вкус. Мысли вернутся в «здесь и сейчас».',
  body:'💧 Опусти плечи, расслабь челюсть, умойся прохладной водой и выпей стакан воды. Когда расслабляется тело, легче и голове.',
  kind:'🤍 Скажи себе то, что сказал(а) бы близкому другу: «Мне сейчас трудно, и это нормально. Мне постепенно станет лучше».',
  count:'⏸ Остановись на минуту: медленно считай от 10 до 1, на каждом счёте глубокий выдох. Злость как волна — поднимается и спадает.'
 },
 step:{
  writeWorry:'Запиши тревогу на бумаге: чего конкретно ты боишься? Записанная мысль становится намного меньше.',
  exam:'К экзамену: раздели материал на 3 части и после каждой задай себе 3 вопроса. Спи не меньше 7 часов — мозг закрепляет знания во сне.',
  caffeine:'Сократи кофе и энергетики — они ускоряют сердцебиение и усиливают тревогу.',
  small:'Сегодня не требуй от себя много. Достаточно одного маленького дела: выпей воды, поешь тёплого, прими душ.',
  walk:'Выйди на улицу на 10–15 минут, пройдись при дневном свете — это реально влияет на настроение.',
  reach:'Напиши одному человеку, которому доверяешь: даже «давай поговорим» — уже достаточно.',
  sleep:'Сегодня за час до сна — без телефона, и спи хотя бы 7–8 часов.',
  water:'Попей воды и перекуси. Половина усталости — нехватка сна и воды.',
  firstMsg:'Напиши сегодня кому-нибудь первым — предложи одногруппнику «давай готовиться вместе?».',
  club:'Сходи один раз в какой-нибудь студенческий клуб — общие интересы быстро сближают.',
  call:'Позвони родителям или старому другу — даже просто услышать голос становится легче.',
  notMeasure:'Одна оценка — не мера твоих способностей, а результат одного дня.',
  teacher:'Подойди к преподавателю и спроси, где были ошибки — это добавит баллов в следующий раз и покажет твою ответственность.',
  retake:'Узнай у эдвайзера про пересдачу, ретейк или дополнительное задание — путь не закрыт.',
  gpa:'На странице «GPA и оценки» посчитай, сколько баллов нужно на следующем экзамене — конкретная цифра снижает тревогу.',
  wait:'Не спеши отвечать — злость проходит за 20 минут. Если пишешь сообщение, не отправляй его сразу.',
  move:'Выпусти злость через тело: 10 минут быстрой ходьбы или подъём по лестнице.',
  talkLater:'Когда успокоишься, начни с себя: «Мне было обидно, когда…» — так приходит решение, а не ссора.',
  fiveMin:'Не жди мотивации — она приходит после действия. Поставь таймер на 5 минут и просто начни.',
  phone:'Убери телефон в другую комнату — это сильнее всего влияет на концентрацию.',
  reward:'После — порадуй себя: любимая еда, прогулка или серия.',
  paper:'Выпиши все задачи на бумагу — список в голове давит, а список на бумаге — это план.',
  pomodoro:'Дели каждую задачу на отрезки по 25 минут. Одно дело за раз.'
 },
 data:{
  dlFirst:'Ближайшее — «{t}» ({w}). Сделай только самый маленький первый шаг, 25 минут, потом 5 минут отдыха.',
  dlOnly:'Срок «{t}» — {w}. Сегодня удели ему только 30 минут, остальное — завтра на свежую голову.',
  urgentList:'Самое срочное:',
  urgentFocus:'Сегодня займись только первым — остальное по очереди.',
  noUrgent:'Срочных дедлайнов нет — значит, время есть. Спокойно составь план на неделю.',
  nextFree:'Следующая пара — {s}, {time}. До неё {free} — не спеши, успеешь.',
  nowClass:'Сейчас идёт «{s}», осталось {left}. После пары дай себе 10 минут перерыва.',
  classesDone:'Пары на сегодня закончились — посвяти вечер отдыху, ты это заслужил(а).',
  classesLeft:'Сегодня ещё {k} пар(ы), последняя заканчивается в {end}. Не старайся быть идеальным — просто присутствовать уже достаточно.',
  night:'Сейчас ночь, а ночью мысли кажутся тяжелее. Не принимай сегодня важных решений — сначала поспи, утром всё будет выглядеть иначе.'
 },
 motiv:{
  any:['Ты сильнее, чем думаешь — ты уже прошёл(а) через многое.','Идти медленно — не значит стоять. Каждый маленький шаг считается.','Тяжёлый день — не тяжёлая жизнь. Завтра — новая страница.','Не нужно решать всё сразу. Сегодня — только один шаг.'],
  tired:['Отдых — не лень, а зарядка. С полной батареей всё легче.'],
  failure:['Твоя ценность не измеряется оценкой. Даже самые сильные падали и вставали.'],
  lonely:['Ты действительно важен(важна), и люди, которые тебя поймут, обязательно найдутся.']
 },
 help:'🤝 Если это состояние длится больше двух недель или мешает сну, аппетиту, учёбе — это не слабость, а сигнал, что нужна помощь. Обратиться к психологу университета — смелый и правильный шаг. Есть и бесплатный круглосуточный телефон доверия 111.',
 note:'Я не психолог, но всегда готов выслушать.',
 ask:['Если хочешь рассказать подробнее, что случилось, — пиши, я слушаю. 💜','Как ты себя сейчас чувствуешь по шкале от 1 до 10?','Что тебе сейчас поможет больше: просто поговорить или составить конкретный план?'],
 crisis:'{n}, спасибо, что написал(а) мне это — это большая смелость. Твоя жизнь важна, и ты не обязан(а) нести это в одиночку.\n\nСейчас самое главное — твоя безопасность:\n📞 112 — если есть опасность, позвони прямо сейчас (круглосуточно)\n📞 111 — бесплатный анонимный телефон доверия (круглосуточно)\n📞 150 — телефон доверия для молодёжи · WhatsApp: +7 708 106 08 10\n\n• Прямо сейчас напиши или позвони человеку, которому доверяешь — другу, родным, куратору: «мне сейчас очень тяжело, побудь со мной».\n• Убери подальше всё, чем можно себе навредить, не оставайся один(одна).\n• Дыши медленно: вдох 4 секунды, выдох 6.\n\nЯ здесь и слушаю тебя. Ты сейчас в безопасном месте?'
},
en:{
 friend:'Friend',moodChip:'💜 I feel down',
 askMood:'I feel down 😔',
 stepsTitle:'✅ What you can do right now:',
 open:{
  sad:['{n}, I’m really glad you wrote to me. I understand your mood is low — everyone goes through this, and you’re not alone.','{n}, I can feel it’s hard for you right now. Sadness isn’t weakness — it shows that something truly matters to you.'],
  lonely:['{n}, loneliness is one of the heaviest feelings. You reached out to me, which means you’re looking for connection — that’s a brave step. I’m here.','{n}, I know how hard it is when it feels like nobody understands you. This feeling is temporary, and you really do matter to people.'],
  failure:['{n}, that’s rough, and it’s okay to be upset. But one setback doesn’t define who you are or your future.','{n}, I get it — you worked hard and the result wasn’t what you hoped. This isn’t the end, it’s just one grade.'],
  overwhelmed:['{n}, when everything piles up at once it feels crushing. Let’s pause and sort it out together — you don’t have to solve it all at once.','{n}, feeling dizzy with too many tasks is normal. The good news: they can be handled piece by piece, and I’ll help.'],
  anxiety:['{n}, I understand you’re worried. That’s your body saying “this matters to me”, not a sign of danger.','{n}, under stress everything looks huge and scary. Let’s calm down and sort it out together.'],
  tired:['{n}, it makes sense you’re tired — you’ve been working a lot. Rest isn’t laziness, it’s part of the work.','{n}, it sounds like your energy is gone. Your body is saying “stop and recharge” — let’s listen to it.'],
  angry:['{n}, it’s okay to be angry — something clearly hurt you. What matters is letting it out without hurting yourself.','{n}, I can feel the frustration building up. You have every right to this feeling — let’s find a way to ease it.'],
  unmotivated:['{n}, everyone has days without motivation — usually it’s not laziness but tiredness or a task that feels too big.','{n}, it’s normal to not feel like doing anything sometimes. Let’s start with a tiny step, not force.']
 },
 calm:{
  breath:'🌬 First, let’s steady your breath: in through the nose for 4 seconds, hold for 4, out slowly for 6. Repeat 5 times — your nervous system will calm down.',
  ground:'🌿 The 5-4-3-2-1 technique: notice 5 things you see, 4 sounds, 3 things you can touch, 2 smells, 1 taste. Your mind comes back to the present.',
  body:'💧 Drop your shoulders, relax your jaw, splash cool water on your face and drink a glass of water. When the body relaxes, the mind follows.',
  kind:'🤍 Tell yourself what you’d tell a close friend: “This is hard right now, and that’s okay. I’ll get better step by step.”',
  count:'⏸ Pause for a minute: count slowly from 10 to 1, breathing out deeply on each number. Anger is a wave — it peaks and fades.'
 },
 step:{
  writeWorry:'Write your worry down: what exactly are you afraid of? A thought on paper shrinks a lot.',
  exam:'For the exam: split the material into 3 parts and quiz yourself with 3 questions after each. Sleep at least 7 hours — your brain locks in knowledge while you sleep.',
  caffeine:'Cut down on coffee and energy drinks — they speed up your heart and amplify anxiety.',
  small:'Don’t demand much from yourself today. One small thing is enough: drink water, eat something warm, take a shower.',
  walk:'Go outside for 10–15 minutes and walk in daylight — it genuinely lifts your mood.',
  reach:'Message one person you trust: even “can we talk?” is enough.',
  sleep:'Tonight, no phone for an hour before bed, and sleep at least 7–8 hours.',
  water:'Drink some water and have a snack. Half of tiredness is lack of sleep and water.',
  firstMsg:'Message someone first today — ask a classmate “want to study together?”.',
  club:'Try one student club meeting, just once — shared interests bring people together fast.',
  call:'Call your parents or an old friend — just hearing their voice helps.',
  notMeasure:'One grade isn’t a measure of your ability, just the result of one day.',
  teacher:'Ask your teacher where you went wrong — it earns points next time and shows responsibility.',
  retake:'Ask your advisor about a retake or extra assignment — the door isn’t closed.',
  gpa:'On the “GPA & grades” page, calculate the score you need on the next exam — a concrete number reduces anxiety.',
  wait:'Don’t rush to reply — anger fades in about 20 minutes. If you write a message, don’t send it yet.',
  move:'Let the anger out through your body: 10 minutes of fast walking or taking the stairs.',
  talkLater:'When you’re calm, start with your feelings: “I felt hurt when…” — that leads to a solution, not a fight.',
  fiveMin:'Don’t wait for motivation — it comes after action. Set a 5-minute timer and just start.',
  phone:'Put your phone in another room — it’s the biggest boost to focus.',
  reward:'Afterwards, treat yourself: favourite food, a walk or an episode.',
  paper:'Write every task on paper — a list in your head feels heavy, a list on paper is a plan.',
  pomodoro:'Split each task into 25-minute blocks. One thing at a time.'
 },
 data:{
  dlFirst:'Your nearest task is “{t}” ({w}). Do only the tiniest first step for 25 minutes, then rest for 5.',
  dlOnly:'“{t}” is due {w}. Give it just 30 minutes today and do the rest tomorrow with a fresh head.',
  urgentList:'Most urgent:',
  urgentFocus:'Today, focus only on the first one — the rest in turn.',
  noUrgent:'No urgent deadlines — so you do have time. Calmly make a plan for the week.',
  nextFree:'Your next class is {s} at {time}. You have {free} until then — no rush, you’ll make it.',
  nowClass:'“{s}” is on right now, {left} left. After class, give yourself a 10-minute break.',
  classesDone:'Your classes are over for today — spend the evening resting, you’ve earned it.',
  classesLeft:'You have {k} more class(es) today, the last one ends at {end}. Don’t try to be perfect — just showing up is enough.',
  night:'It’s night, and thoughts feel heavier at night. Don’t make big decisions now — sleep first; things will look different in the morning.'
 },
 motiv:{
  any:['You’re stronger than you think — you’ve already been through a lot.','Going slowly isn’t standing still. Every small step counts.','A hard day isn’t a hard life. Tomorrow is a new page.','You don’t have to fix everything at once. Today — just one step.'],
  tired:['Rest isn’t laziness, it’s recharging. Everything is easier with a full battery.'],
  failure:['Your worth isn’t measured by a grade. Even the strongest fell and got back up.'],
  lonely:['You truly matter, and the people who get you are out there.']
 },
 help:'🤝 If this lasts more than two weeks or affects your sleep, appetite or studies, it’s not weakness — it’s a sign you deserve support. Talking to the university psychologist is a brave, right step. There’s also the free 24/7 helpline 111.',
 note:'I’m not a psychologist, but I’m always here to listen.',
 ask:['If you want to tell me more about what happened, I’m listening. 💜','How do you feel right now on a scale from 1 to 10?','What would help more right now: just talking, or a concrete plan?'],
 crisis:'{n}, thank you for telling me this — it takes real courage. Your life matters, and you don’t have to carry this alone.\n\nRight now, your safety comes first:\n📞 112 — if you’re in danger, call now (24/7)\n📞 111 — free, anonymous helpline (24/7)\n📞 150 — youth helpline · WhatsApp: +7 708 106 08 10\n\n• Message or call someone you trust right now — a friend, family, your curator: “I’m having a really hard time, please be with me.”\n• Put away anything you could hurt yourself with, and don’t stay alone.\n• Breathe slowly: in for 4 seconds, out for 6.\n\nI’m here and I’m listening. Are you somewhere safe right now?'
}};
// Студенттерде жиі болатын нақты жағдайлар: жұрт алдында ұялу, ажырасу, үйдегі ұрыс.
const EXTRA={
kk:{
 open:{
  shame:['{n}, жұрттың алдында ұялу — өте ауыр сезім, ренжігенің әбден түсінікті. Бірақ біреудің айқайлауы сенің құныңды түсірмейді — ол көбінесе сол адамның өз шаршауы мен ашуы туралы.','{n}, бұл жағдай саған қатты батқанын сезіп тұрмын. Ұят сезімі қазір күшті, бірақ ол тез әлсірейді — ертең бұл сен ойлағандай ешкімнің есінде болмайды.'],
  breakup:['{n}, ажырасу — шынымен ауыр. Жүрегің ауырып тұрғаны қалыпты: сен біреуді шын жақсы көрдің. Бұл сезімге уақыт керек — өзіңе соны бер.','{n}, жақын адамнан айрылу үлкен жоғалту сияқты сезіледі. Қазір қанша ауыр болса да, бұл ауырсыну бірте-бірте басылады.'],
  family:['{n}, үйдегі ұрыс-керіс ерекше ауыр тиеді, себебі бұл — ең жақын адамдарың. Ренжігенің де, шаршағаның да түсінікті.','{n}, отбасымен түсініспеушілік қандай ауыр екенін білемін. Олар сені жақсы көреді, бірақ кейде мұны дұрыс жеткізе алмайды.']
 },
 step:{
  replay:'Болған жағдайды басыңда қайта-қайта айналдырма: оны қағазға бір рет жаз да, жабып қой.',
  othersForget:'Есіңде болсын: адамдар өзгелердің ыңғайсыз сәтін біз ойлағаннан әлдеқайда тез ұмытады.',
  talkTeacher:'Сабыр тапқан соң оқытушымен жеке, сабырлы сөйлесуге болады: «Сабақта маған көтеріңкі дауыспен айтылды, маған ауыр тиді — қай жерім дұрыс емес болғанын түсінгім келеді».',
  advisor:'Мұндай жағдай қайталанса, эдвайзеріңе немесе кураторыңа айт. Сыйластықпен сөйлесу — сенің құқығың.',
  feel:'Жылағың келсе — жыла. Сезімді басу емес, оны сыртқа шығару жеңілдетеді.',
  noContact:'Әзірге оның парақшаларын ақтарып, ескі хаттарды қайта оқыма — бұл жараны қайта ашады.',
  friends:'Бүгін досыңмен кездес не қоңырау шал — жалғыз отырма.',
  routine:'Ұйқы, тамақ, сабақ — күн тәртібін сақта. Ауыр кезде тәртіп тірек болады.',
  pause:'Қызған сәтте дауды жалғастырма: «Қазір сөйлесе алмаймын, кейінірек айтайық» деп үзіліс жаса.',
  iMessage:'Сабыр тапқанда «Сен әрқашан...» деп емес, «Мен ... болғанда қиналамын» деп өз сезіміңнен баста.',
  space:'Өзіңе тыныш кеңістік тап: кітапхана, серуен, құлаққап пен сүйікті музыка.',
  trusted:'Отбасыңнан сенетін бір адаммен (апаңмен, ағаңмен, туысыңмен) сөйлес — ол араағайын бола алады.'
 },
 motiv:{shame:['Бір ыңғайсыз сәт сенің кім екеніңді анықтамайды. Сен одан әлдеқайда көпсің.'],breakup:['Қазір ауыр, бірақ сен бұдан да күшті болып шығасың. Жүрек жазылады — уақыт пен мейірім керек.'],family:['Отбасындағы дау уақытша, ал сенің оларға деген махаббатың — тұрақты. Бәрі реттеледі.']}
},
ru:{
 open:{
  shame:['{n}, стыд на глазах у всех — очень тяжёлое чувство, и обида понятна. Но то, что на тебя накричали, не уменьшает твою ценность — чаще это говорит об усталости и злости самого человека.','{n}, чувствую, как сильно тебя это задело. Стыд сейчас острый, но он быстро слабеет — завтра это не будет так важно для других, как кажется сейчас.'],
  breakup:['{n}, расставание — это правда больно. Нормально, что болит сердце: ты по-настоящему любил(а). Этому чувству нужно время — дай его себе.','{n}, потеря близкого человека ощущается как большая утрата. Как бы тяжело ни было сейчас, эта боль постепенно утихнет.'],
  family:['{n}, ссоры дома ранят особенно сильно, потому что это самые близкие люди. И обида, и усталость понятны.','{n}, знаю, как тяжело, когда с семьёй нет понимания. Они тебя любят, но иногда не умеют это правильно показать.']
 },
 step:{
  replay:'Не прокручивай ситуацию в голове снова и снова: запиши её один раз на бумаге и закрой.',
  othersForget:'Помни: люди забывают чужие неловкие моменты гораздо быстрее, чем нам кажется.',
  talkTeacher:'Когда успокоишься, можно спокойно поговорить с преподавателем наедине: «На паре на меня повысили голос, мне было неприятно — хочу понять, что было не так».',
  advisor:'Если такое повторяется — скажи эдвайзеру или куратору. Уважительное общение — твоё право.',
  feel:'Хочется плакать — плачь. Легче становится не когда чувство подавляешь, а когда его выпускаешь.',
  noContact:'Пока не листай его/её страницы и не перечитывай старые переписки — это снова открывает рану.',
  friends:'Сегодня встреться с другом или позвони — не оставайся один(одна).',
  routine:'Сон, еда, пары — держи режим. В тяжёлое время он становится опорой.',
  pause:'Не продолжай спор на эмоциях: «Сейчас не могу говорить, давай позже» — и сделай паузу.',
  iMessage:'Когда успокоишься, начни не с «Ты всегда…», а с «Мне тяжело, когда…».',
  space:'Найди себе тихое место: библиотека, прогулка, наушники и любимая музыка.',
  trusted:'Поговори с тем, кому доверяешь в семье (тётя, старший брат, родственник) — он(а) может стать посредником.'
 },
 motiv:{shame:['Один неловкий момент не определяет, кто ты. Ты намного больше этого.'],breakup:['Сейчас больно, но ты выйдешь из этого сильнее. Сердце заживает — нужны время и бережность к себе.'],family:['Ссора в семье временная, а ваша любовь — постоянная. Всё наладится.']}
},
en:{
 open:{
  shame:['{n}, being embarrassed in front of everyone is a really heavy feeling, and it makes sense you’re hurt. But someone yelling at you doesn’t lower your worth — it’s usually about their own stress and anger.','{n}, I can feel how much this stung. The shame is sharp right now, but it fades fast — tomorrow others won’t remember it the way you fear.'],
  breakup:['{n}, a breakup really hurts. It’s normal that your heart aches: you truly cared. This feeling needs time — give yourself that.','{n}, losing someone close feels like a big loss. However hard it is now, this pain will ease little by little.'],
  family:['{n}, fights at home hurt in a special way, because these are your closest people. Being upset and tired makes sense.','{n}, I know how hard it is when your family doesn’t understand you. They love you, but sometimes don’t show it well.']
 },
 step:{
  replay:'Don’t replay it in your head over and over: write it down once and close the notebook.',
  othersForget:'Remember: people forget others’ awkward moments much faster than we think.',
  talkTeacher:'Once you’re calm, you can talk to the teacher privately: “I felt hurt when you raised your voice in class — I want to understand what went wrong.”',
  advisor:'If it keeps happening, tell your advisor or curator. Being treated with respect is your right.',
  feel:'If you want to cry, cry. Letting feelings out helps more than holding them in.',
  noContact:'For now, don’t scroll their profile or reread old messages — it reopens the wound.',
  friends:'Meet or call a friend today — don’t stay alone.',
  routine:'Sleep, food, classes — keep your routine. It becomes support in hard times.',
  pause:'Don’t continue the argument in the heat of the moment: “I can’t talk right now, let’s talk later.”',
  iMessage:'When you’re calm, start with “I struggle when…” instead of “You always…”.',
  space:'Find yourself a quiet space: the library, a walk, headphones and your favourite music.',
  trusted:'Talk to someone in the family you trust (an aunt, older sibling, relative) — they can help mediate.'
 },
 motiv:{shame:['One awkward moment doesn’t define you. You’re so much more than that.'],breakup:['It hurts now, but you’ll come out of this stronger. Hearts heal — with time and kindness to yourself.'],family:['A family argument is temporary; your love for each other is lasting. Things will settle.']}
}};
Object.keys(EXTRA).forEach(l=>{Object.assign(TX[l].open,EXTRA[l].open);Object.assign(TX[l].step,EXTRA[l].step);Object.assign(TX[l].motiv,EXTRA[l].motiv)});
Object.keys(TX).forEach(l=>Object.assign(dictionary[l],{askMood:TX[l].askMood,moodChip:TX[l].moodChip}));

// ---------- Жауап құрастыру ----------
const pick=a=>a[Math.floor(Math.random()*a.length)];
const nick=()=>{const u=window.BUDDY_USER||{};return String(u.nickname||'').trim()||String(u.name||'').split(' ')[0]||''};
const fill=(s,v)=>Object.entries(v).reduce((r,[k,x])=>r.replaceAll('{'+k+'}',x),s);
function snapshot(){
 const now=new Date(),today=S.localDate(now),hm=timeWithoutSeconds(now),st=S.state(now,repeat);
 const left=S.events(today,repeat).filter(l=>l.end>hm&&!(st.current&&st.current.id===l.id));
 const open=P.sortTasks(tasks).filter(x=>!x.done);
 return {hour:+hm.slice(0,2),current:st.current,remaining:st.remaining,next:st.next&&st.next.date===today?st.next:null,wait:st.wait,left,open,
  urgent:open.filter(x=>['red','overdue'].includes(P.urgency(x)))};
}
const when=x=>dt(x.date,{weekday:'short'})+', '+(x.time||'23:59');
// Студенттің нақты кестесі мен дедлайндарына сүйенген қадамдар.
function dataSteps(kind,d,T){
 const D=T.data,out=[],first=d.urgent[0]||d.open[0];
 const classLine=()=>{
  if(d.current)return fill(D.nowClass,{s:title(d.current),left:duration(d.remaining)});
  if(d.next&&d.wait<=360)return fill(D.nextFree,{s:title(d.next),time:d.next.start,free:duration(d.wait)});
  return '';
 };
 if(kind==='overwhelmed'){
  if(d.urgent.length){out.push(D.urgentList+'\n'+d.urgent.slice(0,3).map((x,i)=>`   ${i+1}) ${x.title} — ${when(x)}`).join('\n')+'\n   '+D.urgentFocus)}
  else out.push(D.noUrgent);
 }else if(['anxiety','unmotivated'].includes(kind)){
  if(first)out.push(fill(D.dlFirst,{t:first.title,w:when(first)}));
  const c=classLine();if(c)out.push(c);
 }else if(kind==='tired'){
  out.push(d.left.length?fill(D.classesLeft,{k:d.left.length+(d.current?1:0),end:d.left[d.left.length-1].end}):d.current?fill(D.nowClass,{s:title(d.current),left:duration(d.remaining)}):D.classesDone);
  if(d.urgent[0])out.push(fill(D.dlOnly,{t:d.urgent[0].title,w:when(d.urgent[0])}));
 }else if(kind==='sad'||kind==='lonely'){
  if(!d.left.length&&!d.current&&d.hour>=12)out.push(D.classesDone);
 }
 return out;
}
const PLAN={
 sad:{calm:['kind','breath'],steps:['small','walk','reach']},
 lonely:{calm:['kind'],steps:['firstMsg','call','club']},
 failure:{calm:['breath'],steps:['notMeasure','teacher','retake','gpa']},
 overwhelmed:{calm:['breath'],steps:['paper','pomodoro']},
 anxiety:{calm:['breath','ground'],steps:['writeWorry','caffeine']},
 tired:{calm:['body'],steps:['sleep','water']},
 angry:{calm:['count'],steps:['wait','move','talkLater']},
 unmotivated:{calm:[],steps:['fiveMin','phone','reward']},
 shame:{calm:['kind','breath'],steps:['replay','othersForget','talkTeacher','advisor']},
 breakup:{calm:['kind'],steps:['feel','noContact','friends','routine']},
 family:{calm:['breath'],steps:['pause','iMessage','space','trusted']}
};
const FALLBACK_KIND={homesick:'lonely',money:'anxiety',bullying:'shame',friend:'angry',selfdoubt:'sad',avoid:'shame'};
function reply(mood){
 const T=TX[lang]||TX.kk,n=nick()||T.friend;
 if(mood.kind==='crisis')return fill(T.crisis,{n});
 if(FALLBACK_KIND[mood.kind])mood={...mood,kind:FALLBACK_KIND[mood.kind]};
 const d=snapshot(),plan=PLAN[mood.kind];
 const steps=[...(mood.exam&&mood.kind==='anxiety'?['exam']:[]),...plan.steps].map(k=>T.step[k]);
 const all=[...dataSteps(mood.kind,d,T),...steps].slice(0,4);
 const parts=[fill(pick(T.open[mood.kind]),{n})];
 if((d.hour>=23||d.hour<5)&&mood.kind!=='unmotivated')parts.push('🌙 '+T.data.night);
 if(plan.calm.length)parts.push(T.calm[pick(plan.calm)]);
 parts.push(T.stepsTitle+'\n'+all.map(s=>'• '+s).join('\n'));
 parts.push('💜 '+pick([...(T.motiv[mood.kind]||[]),...T.motiv.any]));
 if(mood.severe)parts.push(T.help);
 parts.push(pick(T.ask));
 return parts.join('\n\n');
}

// ---------- Әңгіменің жалғасы ----------
// Студент Buddy-дің сұрағына жауап береді: «4», «жоспар керек», «сөйлескім келеді», «сабаққа барғым келмейді», «рахмет»…
// Бұл жауаптарды код дәл құрастырады. Қазақшада модель сапасыз жазатындықтан, басқа жалғасқа да тыңдау-жауап береміз;
// орыс/ағылшын тілінде жалпы жалғасты ЖИ (server.js → supportPrompt) жалғастырады.
const FU={
kk:{
 rateLow:'{n}, {x}/10 — бұл қазір шынымен ауыр екенін білдіреді. Ашық айтқаның үшін рахмет.\n\nДәл қазір жалғыз қалмағаның маңызды: сенетін бір адамға жаз не қоңырау шал. Өте ауыр болса, тегін әрі тәулік бойы жұмыс істейтін 111 сенім телефоны бар — онда тыңдауға дайын адамдар отыр.\n\nҚазір не болса, сәл жеңілірек болар еді? Мен осындамын. 💜',
 rateMid:'{n}, {x}/10 — орташа, бірақ жақсартуға болады. Келші, оны тағы 1–2 баллға көтерейік: 10 минут серуенде, су іш, сүйікті әніңді қос.\n\nСосын айтшы: қазір көбірек не мазалайды — оқу ма, адамдар ма, әлде шаршау ма?',
 rateHigh:'{n}, {x}/10 — қуанып қалдым! 😊 Осы күйді сақтау үшін бүгін ертерек ұйықта және ертеңгі ең маңызды бір ісіңді таңдап қой.\n\nТағы бір нәрсе айтқың келсе — мен осындамын. 💜',
 talk:'{n}, жақсы, мен тыңдап отырмын. Асықпа — не болғанын басынан бастап жаз. Мұнда сені ешкім бағаламайды, ұялатын ештеңе жоқ. 💜',
 thanks:'{n}, оқасы жоқ! Сенімен сөйлескеніме қуаныштымын. Қиын кезде маған кез келген уақытта жаза аласың. Өзіңе мейірімді бол — сен оған лайықсың. 💜',
 unsure:'{n}, білмеу — қалыпты, кейде сезімді сөзбен айту қиын. Онда жай бастайық: бүгін бір жақсы нәрсе болды ма, тіпті кішкентай болса да?',
 avoid:'{n}, ыңғайсыз жағдайдан кейін барғың келмеуі — табиғи қорғаныс реакциясы. Бірақ бармай қойсаң, бұл сезім күшейе түседі, ал барған сайын әлсірей береді.',
 avoidSteps:['Ертең тек бір сабаққа барып көр — қалғанын кейін шешесің.','Топтасыңмен бірге кір, өзіңе таныс орынға отыр.','Ешкімге ештеңе дәлелдеуге міндетті емессің — жай қатыс, жаз, тыңда.','Есіңде болсын: бәрі өз уайымымен жүр, сол сәтті сен сияқты ешкім есінде сақтамайды.'],
 avoidNext:'Келесі сабағың — {s}, {d} {time}. Соған бірге дайындалайық па?',
 avoidAsk:'Саған барудың ең қиын жері қайсы — оқытушы ма, топтастар ма?',
 planTitle:'{n}, келістік, нақты жоспар құрайық 👇',
 today:'📅 Бүгін:',tomorrow:'📅 Ертең ({d}):',
 classesDone:'Сабақтар бітті — кешті демалысқа арна.',
 classesLeftLine:'{k} сабақ қалды: {list}',
 dlStep:'25 минут: «{t}» бойынша тек бірінші қадам ({w}).',
 noDl:'Шұғыл дедлайн жоқ — бос уақытыңды өзіңе арна.',
 sleep:'🌙 23:00-ге дейін ұйқыға жат, ұйықтар алдында 1 сағат телефонсыз.',
 firstClass:'Бірінші сабақ — {time}, {s} ({place}). {k} сабақ.',
 noClass:'Сабақ жоқ — демалыс пен дайындыққа уақыт.',
 planEnd:'Жоспар — бағыт, қатаң заң емес. Үлгермесең де ештеңе етпейді, ертең жалғастырамыз. Қалай, бұл жоспар саған келе ме?',
 listen:['{n}, мұны маған айтқаның жақсы болды. Сенің сезімің орынды — кез келген адам осындай жағдайда қиналар еді.\n\nЕң ауыр тиген сәті қайсы болды? Асықпай жаза бер, мен тыңдаймын. 💜','{n}, түсінемін. Бұл сен үшін шынымен маңызды екені көрініп тұр.\n\nҚазір ішіңде не сезіліп тұр — шаршау ма, ауырлық па, әлде ашу ма? Сезімнің атын атау оны жеңілдетеді.','{n}, сені тыңдап отырмын. Мұндай кезде өзіңе қатал болма — сен қолыңнан келгенін істеп жүрсің.\n\nОсы жағдайда саған кім қолдау көрсете алар еді: досың ба, туысың ба, әлде куратор ма?','{n}, мұның бәрін ішіңде ұстап жүру оңай емес. Айтқаның — үлкен қадам.\n\nЕгер досың дәл осындай жағдайда болса, сен оған не айтар едің? Кейде сол сөз өзімізге де керек болады.']
},
ru:{
 rateLow:'{n}, {x}/10 — значит, сейчас правда очень тяжело. Спасибо, что сказал(а) честно.\n\nСейчас важно не оставаться одному(одной): напиши или позвони человеку, которому доверяешь. Если совсем тяжело — есть бесплатный круглосуточный телефон доверия 111, там готовы выслушать.\n\nЧто могло бы сейчас хоть немного облегчить? Я рядом. 💜',
 rateMid:'{n}, {x}/10 — средне, но можно лучше. Давай поднимем на 1–2 балла: 10 минут прогулки, вода, любимая песня.\n\nА потом расскажи: что сейчас беспокоит больше — учёба, люди или усталость?',
 rateHigh:'{n}, {x}/10 — я рад(а)! 😊 Чтобы сохранить это состояние, ляг сегодня пораньше и выбери одно главное дело на завтра.\n\nЕсли захочешь что-то рассказать — я рядом. 💜',
 talk:'{n}, хорошо, я слушаю. Не спеши — расскажи, что случилось, с самого начала. Здесь тебя никто не оценивает, стыдиться нечего. 💜',
 thanks:'{n}, не за что! Рад(а), что мы поговорили. В трудную минуту можешь написать мне в любое время. Будь к себе добрее — ты этого заслуживаешь. 💜',
 unsure:'{n}, не знать — нормально, иногда чувства сложно выразить словами. Тогда начнём с простого: было сегодня что-то хорошее, пусть даже совсем маленькое?',
 avoid:'{n}, не хотеть идти после неловкой ситуации — естественная защитная реакция. Но если избегать, это чувство усиливается, а каждый раз, когда идёшь, — слабеет.',
 avoidSteps:['Завтра сходи только на одну пару — остальное решишь потом.','Зайди вместе с одногруппником и сядь на привычное место.','Ты никому ничего не должен(на) доказывать — просто присутствуй, записывай, слушай.','Помни: все заняты своими переживаниями, и никто не запомнил тот момент так, как ты.'],
 avoidNext:'Следующая пара — {s}, {d} {time}. Подготовимся к ней вместе?',
 avoidAsk:'Что для тебя самое трудное — преподаватель или одногруппники?',
 planTitle:'{n}, договорились, составим конкретный план 👇',
 today:'📅 Сегодня:',tomorrow:'📅 Завтра ({d}):',
 classesDone:'Пары закончились — вечер на отдых.',
 classesLeftLine:'Осталось пар: {k} — {list}',
 dlStep:'25 минут: только первый шаг по «{t}» ({w}).',
 noDl:'Срочных дедлайнов нет — свободное время посвяти себе.',
 sleep:'🌙 Ложись до 23:00, за час до сна — без телефона.',
 firstClass:'Первая пара — {time}, {s} ({place}). Всего пар: {k}.',
 noClass:'Пар нет — время для отдыха и подготовки.',
 planEnd:'План — это ориентир, а не строгий закон. Не успеешь — ничего страшного, продолжим завтра. Как тебе такой план?',
 listen:null
},
en:{
 rateLow:'{n}, {x}/10 — that means it’s really hard right now. Thank you for being honest.\n\nIt’s important not to stay alone right now: message or call someone you trust. If it feels too heavy, there’s the free 24/7 helpline 111 — people there are ready to listen.\n\nWhat could make things even a little lighter right now? I’m here. 💜',
 rateMid:'{n}, {x}/10 — okay, but we can do better. Let’s raise it by 1–2 points: a 10-minute walk, some water, your favourite song.\n\nThen tell me: what bothers you more right now — studies, people or tiredness?',
 rateHigh:'{n}, {x}/10 — I’m glad! 😊 To keep it that way, go to bed a bit earlier tonight and pick one main thing for tomorrow.\n\nIf you want to share anything else — I’m here. 💜',
 talk:'{n}, okay, I’m listening. No rush — tell me what happened from the beginning. Nobody is judging you here. 💜',
 thanks:'{n}, anytime! I’m glad we talked. You can write to me whenever things get hard. Be kind to yourself — you deserve it. 💜',
 unsure:'{n}, not knowing is okay — sometimes feelings are hard to put into words. Let’s start simple: did anything good happen today, even something small?',
 avoid:'{n}, not wanting to go after an awkward moment is a natural protective reaction. But avoiding makes the feeling stronger, while each time you go, it gets weaker.',
 avoidSteps:['Tomorrow, go to just one class — decide about the rest later.','Walk in with a classmate and sit in your usual spot.','You don’t have to prove anything to anyone — just attend, take notes, listen.','Remember: everyone is busy with their own worries; nobody remembers that moment the way you do.'],
 avoidNext:'Your next class is {s}, {d} {time}. Shall we prepare for it together?',
 avoidAsk:'What’s the hardest part about going — the teacher or classmates?',
 planTitle:'{n}, deal — let’s make a concrete plan 👇',
 today:'📅 Today:',tomorrow:'📅 Tomorrow ({d}):',
 classesDone:'Classes are over — the evening is for rest.',
 classesLeftLine:'{k} class(es) left: {list}',
 dlStep:'25 minutes: just the first step on “{t}” ({w}).',
 noDl:'No urgent deadlines — spend your free time on yourself.',
 sleep:'🌙 Go to bed before 23:00, no phone for an hour before sleep.',
 firstClass:'First class — {time}, {s} ({place}). {k} class(es) in total.',
 noClass:'No classes — time to rest and prepare.',
 planEnd:'A plan is a direction, not a strict rule. If you don’t finish, that’s fine — we’ll continue tomorrow. Does this plan work for you?',
 listen:null
}};
const FRX={
 rate:/^\D{0,25}?\b(10|[1-9])\b(\s*\/\s*10)?\D{0,25}$/,
 plan:/жоспар|план|plan/,
 talk:/^(иә|ия|иа|да|ага|yes|yeah)[.!) ]*$|сөйлес|айтайын|тыңда|поговор|выговор|расскаж|talk|listen/,
 thanks:/рахмет|рақмет|сағ бол|жеңілдеп|жеңілдеді|жақсырақ|спасибо|благодар|полегчало|легче|thank|better now/,
 unsure:/^(жоқ|білмеймін|білмим|нет|не знаю|хз|no|nope|idk|i don'?t know)[.!) ]*$/,
 avoid:/барғым келмей|бармаймын|бармай қой|бармаймын|қалғым келеді|не хочу (идти|ходить)|не пойду|прогул|don'?t want to go|skip (class|classes|uni)/
};
let listenTurn=0;
function lessonPlace(l){return locationText(l)}
function followUp(q,lastText){
 const L=FU[lang]||FU.kk,n=nick()||(TX[lang]||TX.kk).friend,s=String(q||'').toLowerCase().trim();
 const m=FRX.rate.exec(s);
 if(m&&s.length<=40&&/1-ден 10|1 до 10|1 to 10/.test(String(lastText||''))){const x=+m[1];return fill(x<=3?L.rateLow:x<=6?L.rateMid:L.rateHigh,{n,x})}
 if(FRX.plan.test(s))return plan(L,n);
 if(FRX.thanks.test(s)&&s.length<=60)return fill(L.thanks,{n});
 if(FRX.unsure.test(s))return fill(L.unsure,{n});
 if(FRX.talk.test(s)&&s.length<=40)return fill(L.talk,{n});
 return null;   // қалғанын модель түсініп, жауап береді
}
// Модель қолжетімсіз болғанда ғана (желі/Ollama өшкен): дайын жалғас-жауаптар.
function offlineFollow(q){
 const L=FU[lang]||FU.kk,n=nick()||(TX[lang]||TX.kk).friend,s=String(q||'').toLowerCase();
 if(FRX.avoid.test(s)){
  const st=S.state(new Date(),repeat),nx=st.next,steps=L.avoidSteps.map(x=>'• '+x).join('\n');
  const end=nx?fill(L.avoidNext,{s:title(nx),d:dt(nx.date,{weekday:'long'}),time:nx.start}):L.avoidAsk;
  return fill(L.avoid,{n})+'\n\n'+(TX[lang]||TX.kk).stepsTitle+'\n'+steps+'\n\n'+end;
 }
 return L.listen?fill(L.listen[listenTurn++%L.listen.length],{n}):null;
}
function plan(L,n){
 const d=snapshot(),today=S.localDate(),tmr=S.shift(today,1),tEv=S.events(tmr,repeat),out=[fill(L.planTitle,{n}),''];
 const left=[...(d.current?[d.current]:[]),...d.left];
 out.push(L.today);
 out.push('• '+(left.length?fill(L.classesLeftLine,{k:left.length,list:left.slice(0,3).map(l=>l.start+' '+title(l)).join(', ')+(left.length>3?'…':'')}):L.classesDone));
 const first=d.urgent[0]||d.open[0];
 out.push('• '+(first?fill(L.dlStep,{t:first.title,w:when(first)}):L.noDl));
 out.push('• '+L.sleep,'');
 out.push(fill(L.tomorrow,{d:dt(tmr,{weekday:'long'})}));
 out.push('• '+(tEv.length?fill(L.firstClass,{time:tEv[0].start,s:title(tEv[0]),place:lessonPlace(tEv[0]),k:tEv.length}):L.noClass));
 const tDl=d.open.filter(x=>x.date===tmr);
 tDl.slice(0,2).forEach(x=>out.push('• ⏰ '+x.title+' — '+(x.time||'23:59')));
 out.push('',L.planEnd);
 return out.join('\n');
}
// Әңгіме ішінде қайта көңіл күй айтылса — қысқа нұсқа (дем алу жаттығуы мен мотивацияны қайталамаймыз).
function replyShort(mood){
 const T=TX[lang]||TX.kk,n=nick()||T.friend;
 if(mood.kind==='crisis')return fill(T.crisis,{n});
 if(FALLBACK_KIND[mood.kind])mood={...mood,kind:FALLBACK_KIND[mood.kind]};
 const d=snapshot(),plan=PLAN[mood.kind];
 const steps=[...dataSteps(mood.kind,d,T),...plan.steps.map(k=>T.step[k])].slice(0,2);
 return [fill(pick(T.open[mood.kind]),{n}),T.stepsTitle+'\n'+steps.map(s=>'• '+s).join('\n'),...(mood.severe?[T.help]:[]),pick(T.ask)].join('\n\n');
}

window.BuddySupport={detect,reply,replyShort,followUp,offlineFollow,TX,
 _:{nick,snapshot,dataSteps,T:()=>TX[lang]||TX.kk}};   // support-kb.js (қазақша құрастырушы) пайдаланады
})();
