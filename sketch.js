let data = [];
let righe;
let fiume = null;

const margin = 24;
const topBand = 184;
const rowH = 26;
const labelH = 34;
const seaReserve = 150;
const barH = 16;

const parametri = [
  { key: 'length',      label: 'Lunghezza',       unit: 'km',   gruppo: 'length' },
  { key: 'area',        label: 'Area del bacino', unit: 'km²',  gruppo: 'area' },
  { key: 'discharge',   label: 'Portata',         unit: 'm³/s', gruppo: 'discharge' },
  { key: 'tributaries', label: 'Affluenti',       unit: '',     gruppo: 'tributaries' },
  { key: 'min_temp',    label: 'Temp. minima',    unit: '°C',   gruppo: 'temp' },
  { key: 'max_temp',    label: 'Temp. massima',   unit: '°C',   gruppo: 'temp' },
  { key: 'avg_temp',    label: 'Temp. media',     unit: '°C',   gruppo: 'temp' }
];
let scale = {};   // gruppo -> { lo, hi }

function parseCSV(lines) {
  const campiNumerici = ["length", "area", "discharge", "tributaries", "min_temp", "max_temp", "avg_temp"];
  let pulite = lines
    .map(l => l.replace(/^\uFEFF/, "").trim())
    .filter(l => l.length > 0);
  let header = pulite[0].split(";");
  let out = [];
  for (let r = 1; r < pulite.length; r++) {
    let celle = pulite[r].split(";");
    let obj = {};
    header.forEach((h, k) => obj[h] = celle[k]);
    campiNumerici.forEach(c => obj[c] = Number(obj[c]));
    out.push(obj);
  }
  return out;
}

function preload() {
  righe = loadStrings("assets/Cartel1.csv");
}

function setup() {
  data = parseCSV(righe);

  let id = new URLSearchParams(window.location.search).get('id');
  fiume = data.find(r => r.id === id) || null;
  document.title = fiume ? fiume.name : "Fiume non trovato";

  for (let p of parametri) {
    let g = p.gruppo;
    if (!scale[g]) scale[g] = { lo: 0, hi: 0 };
    for (let r of data) {
      scale[g].lo = min(scale[g].lo, r[p.key]);
      scale[g].hi = max(scale[g].hi, r[p.key]);
    }
  }

  createCanvas(windowWidth, altezza());
  textFont("Helvetica");
}

function altezza() {
  return topBand + parametri.length * (labelH + rowH) + margin;
}

function windowResized() {
  resizeCanvas(windowWidth, altezza());
}

function draw() {
  background('#1b4332');
  noStroke();
  textAlign(LEFT, TOP);

  if (!fiume) {
    fill(255);
    textStyle(BOLD);
    textSize(40);
    text("Fiume non trovato", margin, 14);
    return;
  }

  fill(255);
  textStyle(BOLD);
  textSize(40);
  text(fiume.name, margin, 14);

  textStyle(NORMAL);
  textSize(12.5);
  fill(185);
  text("Continente: " + fiume.continent + "   ·   Sfocia in: " + fiume.outflow, margin, 66);

  let y = topBand;
  let chartX0 = margin;
  let chartX1 = max(chartX0 + 100, width - margin - seaReserve);

  for (let i = 0; i < parametri.length; i++) {
    let p = parametri[i];
    let s = scale[p.gruppo];
    let v = fiume[p.key];

    y += labelH;
    fill(255);
    noStroke();
    textStyle(BOLD);
    textSize(17);
    textAlign(LEFT, TOP);
    text(p.label, margin, y - labelH * 0.45);
    textStyle(NORMAL);


    let cy = y + rowH / 2;

    fill(255, 18);
    rect(chartX0, cy - barH / 2, chartX1 - chartX0, barH, 4);

    let xZero = map(0, s.lo, s.hi, chartX0, chartX1);
    let xVal  = map(v, s.lo, s.hi, chartX0, chartX1);
    let barLeft = min(xZero, xVal);
    let barWidth = max(abs(xVal - xZero), 2);

    fill(v < 0 ? '#1a5296' : '#64dfdf');
    rect(barLeft, cy - barH / 2, barWidth, barH, 4);

    if (s.lo < 0) {
      stroke(255, 120);
      strokeWeight(1);
      line(xZero, cy - barH / 2 - 4, xZero, cy + barH / 2 + 4);
      noStroke();
    }

    fill(185);
    textAlign(LEFT, CENTER);
    textSize(min(12, rowH * 0.5));
    text(v.toLocaleString('it-IT') + (p.unit ? " " + p.unit : ""), barLeft + barWidth + 8, cy);

    y += rowH;
  }
}