export function generateCreatureSpritesheet(creatureType: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 128; // 4 cols * 32
  canvas.height = 128; // 4 rows * 32
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  ctx.clearRect(0, 0, 128, 128);
  
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const x = col * 32;
      const y = row * 32;
      
      const bounce = (col === 1 || col === 3) ? 1 : 0;
      
      ctx.save();
      ctx.translate(x, y);

      drawEntity(ctx, creatureType, bounce);
      ctx.restore();
    }
  }
  return canvas.toDataURL();
}

const PALETTE: Record<string, string> = {
  'k': '#111111', 'W': '#ffffff', 'w': '#f0f0f0',
  'A': '#ecf0f1', 'a': '#bdc3c7', 'S': '#95a5a6', 's': '#7f8c8d', 'M': '#34495e', 'm': '#2c3e50',
  'R': '#ff4d4d', 'r': '#c0392b', 'v': '#7b241c',
  'Y': '#f1c40f', 'y': '#f39c12', 'O': '#e67e22', 'o': '#d35400',
  'E': '#2ecc71', 'e': '#27ae60', 'g': '#1e8449',
  'B': '#5dade2', 'b': '#2e86c1', 'V': '#1b4f72',
  'P': '#af7ac5', 'p': '#8e44ad', 'q': '#5b2c6f',
  'C': '#ca6f1e', 'c': '#873600', 'T': '#512e5f',
  'H': '#f5cba7', 'h': '#dc7633',
  'd': '#34495e', 'D': '#2c3e50'
};

const ART: Record<string, string[]> = {
  hero: [
    "      kkkk      ",
    "     kWWWWk     ",
    "    kWwaaaWk    ",
    "    kWaHHaaWk   ",
    "    kaHkkHHa    ",
    "    kaHHHHa     ",
    "    ksEEEEsk    ",
    "   kasEEEEsak   ",
    "  aasEEeeEEsaa  ",
    "  a kEeeeeEk a  ",
    "  Y kEeeeeEk Y  ",
    "  s kEEkkEEk s  ",
    "    kcskkscs    ",
    "   kcckkkcck    ",
    "   kkkk kkkk    ",
    "                "
  ],
  wizard: [
    "      kkkk      ",
    "     kPppPk     ",
    "    kPpTTpPk    ",
    "   kPppppppPk   ",
    "  kkkkkkkkkkkk  ",
    "   kkHkkkkHkk   ",
    "  kwwWwwwwWwwk  ",
    "  kwwWwwwwWwwk  ",
    "  kwwWwwwwWwwk  ",
    "   kWWWWWWWWk   ",
    " v  kPPppPPk  b ",
    "vvv kPppppPk bBb",
    " v kPppppppPk b ",
    "   kPpPkkpPpk   ",
    "   kPpk  kPpk   ",
    "   kkk    kkk   "
  ],
  skeleton: [
    "      kkkk      ",
    "     kWkkWk     ",
    "    kWWWWWWk    ",
    "    kWkkkkWk    ",
    "    kWWWWWWk    ",
    "     kkWWkk     ",
    "      kWWk      ",
    "    kkkWWkkk    ",
    "   kWkkWWkkWk   ",
    "   kWkWWWWkWk   ",
    "   kk kWkk kk   ",
    "      kWWk      ",
    "     kWWWWk     ",
    "     kWkkWk     ",
    "    kWWkkWWk    ",
    "    kkk  kkk    "
  ],
  bat: [
    "                ",
    "  kk        kk  ",
    " kMMk      kMMk ",
    "kMMMMk kk kMMMMk",
    "kMkkMkkmkkmkMkkM",
    "kMk kmmmmmmk kMk",
    " k  kmmrrmmk  k ",
    "    kmmmmmmk    ",
    "     kmmmmk     ",
    "      kmmk      ",
    "       kk       ",
    "                ",
    "                ",
    "                ",
    "                ",
    "                "
  ],
  ghost: [
    "                ",
    "      kkkk      ",
    "    kkAAAAkk    ",
    "   kAAAAAAAAk   ",
    "  kAkAkkAkAkkA  ",
    "  kAAaakAaaakA  ",
    "  kAAAAAAAAAAk  ",
    "  kAAAAAAAAAAk  ",
    "  kAAAAAAAAAAk  ",
    "  kAAAAAAAAAAk  ",
    "   kAAAAAAAAk   ",
    "   kAAkAAkAAk   ",
    "    kAk  kAk    ",
    "     k    k     ",
    "                ",
    "                "
  ],
  spider: [
    "                ",
    "                ",
    "  k          k  ",
    "  kk        kk  ",
    "   kk      kk   ",
    " k  kkkkkkkk  k ",
    " kk kMMMMMMk kk ",
    "  kkkMRMMRMkkk  ",
    "  kMkMMMMMMkMk  ",
    "   kMMMMMMMMk   ",
    " kkkMMMMMMMMkkk ",
    " k kMMMMMMMMk k ",
    "    kkkkkkkk    ",
    "                ",
    "                ",
    "                "
  ],
  knight: [
    "      kkkk      ",
    "    kkBBBBkk    ",
    "   kBBaaSSBBk   ",
    "   kBaSSYYSSak  ",
    "   kBaSSYYSSak  ",
    "    kkaaaakk    ",
    "  s kAARRaAk s  ",
    " sssAAAAAAAAsss ",
    "  ssssRAARssss  ",
    "   kAsRRRRsAk   ",
    "    kasrrsak    ",
    "    kaaaaAak    ",
    "    ksakksak    ",
    "   kssskksssk   ",
    "   kkkk  kkkk   ",
    "                "
  ],
  slime: [
    "                ",
    "                ",
    "      kkkk      ",
    "    kkPPPPkk    ",
    "   kPPPPPPPPk   ",
    "  kPWkPPPPkWPk  ",
    " kPkkkPPPPkkkkP ",
    " kPPPPPPPPPPPPk ",
    " kPPPPpPpPPPPPk ",
    " kPPPppppPPPPPk ",
    " kPPpPppppPpPPk ",
    "  kPPPPPPPPPPk  ",
    "   kkkkkkkkkk   ",
    "                ",
    "                ",
    "                "
  ],
  dragon: [
    "    kk    kk    ",
    "   kEek  kEek   ",
    "  kEWEkkkkEWEk  ",
    "  keWkkEEkkWek  ",
    "  kkkkEEEEkkkk  ",
    "    keEeeEekR   ",
    " kRkEEeeeeEEkR  ",
    " kkkEEEEEEEEkkk ",
    "kREkEErRRrEEkERk",
    " kk EErRRrEE kk ",
    "   kEErrrrEEk   ",
    "   kEErEErEEk   ",
    "   keeEkkEeek   ",
    "   kek    kek   ",
    "   kkk    kkk   ",
    "                "
  ],
  wolf: [
    "  kkk      kkk  ",
    "  Aak      kaA  ",
    " kAAkkkkkkkkAAk ",
    " kaAkaAAAAakAak ",
    " kkkAkBkkBkAkkk ",
    "   kaAAAAAAak   ",
    "   kAaAAAAaAk   ",
    "    kAassAak    ",
    "  kkAssssaAkk   ",
    " ksAAssssAAask  ",
    " ksaaaAaaaAask  ",
    " kkAAssssAAakk  ",
    "  kAaskkksAak   ",
    "  kasakkkasak   ",
    "  kkkk  kkkk    ",
    "                "
  ],
  robot: [
    "      kkkk      ",
    "     kSssSk     ",
    "    kaAkkAak    ",
    "   kaAEEEeAak   ",
    "   kaEeeEEEak   ",
    "    kasAAsak    ",
    "  kkkskkkkkskkk ",
    " k RRksRRRskRR k",
    " k RRksRRRskRR k",
    "  kkkskkkkkskkk ",
    "   k  kssk  k   ",
    "      ksak      ",
    "     ksAAsk     ",
    "    kssaassk    ",
    "    kkkkkkkk    ",
    "                "
  ],
  demon: [
    "   kk      kk   ",
    "  kvvk    kvvk  ",
    " kAAvkkkkkkvAAk ",
    " kAAvkrrvvkAAvk ",
    " kkkvrRvvRrskkk ",
    "    krrvvrrk    ",
    " kvkrVvrrvVskvk ",
    " kArvRvvvvRrAak ",
    " kvvrvrRRrvrvvk ",
    " kk vvrRRrvv kk ",
    "  k vRvvvRv k   ",
    "   kvvrvvrrk    ",
    "   kvrk  krvA   ",
    "   kkRk  kRkk   ",
    "   kkkk  kkkk   ",
    "                "
  ],
  phoenix: [
    "      kkk       ",
    "     koOOk      ",
    "  R kkOYOkk R   ",
    " OROkYYWYYkORO  ",
    " ORYkkYYYkkYRO  ",
    " OOkRYYYYRoOOO  ",
    " kO RYYYYR Ok   ",
    " kR ROYyYOR Rk  ",
    " kY RROyORR Rk  ",
    " kO OOyOyOo Ok  ",
    " kkkOoooooOkkk  ",
    "   kOOkkkOOk    ",
    "    kRORROk     ",
    "    kRk kRk     ",
    "    kOk kOk     ",
    "    kk  kk      "
  ],
  fairy: [
    "       kk       ",
    "      kHPk      ",
    "    kkkhpkkk    ",
    "   P kBPBBk P   ",
    " PPPPBBHHBPPPP  ",
    " PWWPHPHHHPWWP  ",
    "  PWWphhhhpWWP  ",
    "   PPPppppPPP   ",
    "     PphhhpP    ",
    "    kPkkkkPk    ",
    "    kppkkppk    ",
    "    kp    pk    ",
    "    kk    kk    ",
    "                ",
    "                ",
    "                "
  ],
  golem: [
    "     kkkkkk     ",
    "    kSssSssk    ",
    "   ksSmSsmSsk   ",
    "  kkSSSssSSSkk  ",
    " ksSksSSSssksSk ",
    " ksSmMsSSMmssSk ",
    " kssmsSsssmssk  ",
    "  kmsSSSSSSsmk  ",
    " kmmmsSssSsmmmk ",
    " ksSsSSSSssSsSk ",
    " ksSSsSSSSsSSsk ",
    " kkSSSSssSSSSkk ",
    "   kkSSssSSkk   ",
    "    kSmkkSmk    ",
    "   kkSmkkSmkk   ",
    "   kkkkkkkkkk   "
  ]
};

function drawEntity(ctx: CanvasRenderingContext2D, type: string, bounce: number) {
  let layer = ART[type] || ART['slime'];
  
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(16, 28, 12, 3, 0, 0, Math.PI * 2); ctx.fill();

  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
      let char = layer[r][c];
      if (char !== ' ') {
        ctx.fillStyle = PALETTE[char] || '#fff';
        let y = r * 2 + bounce; 
        ctx.fillRect(c * 2, y, 2, 2);
      }
    }
  }
}
