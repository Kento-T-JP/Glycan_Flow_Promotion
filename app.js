const presets = {
  balanced: {
    name: "標準ゴルジ条件",
    nutrient: 96,
    stress: 70,
    mannosidase: 100,
    mgat: 100,
    galt: 100,
    terminal: 100,
  },
  stress: {
    name: "滞在時間が長い条件",
    nutrient: 72,
    stress: 130,
    mannosidase: 110,
    mgat: 95,
    galt: 110,
    terminal: 135,
  },
  inhibited: {
    name: "枝分かれ酵素が弱い条件",
    nutrient: 100,
    stress: 70,
    mannosidase: 95,
    mgat: 25,
    galt: 55,
    terminal: 55,
  },
  growth: {
    name: "糖供与体が多い条件",
    nutrient: 146,
    stress: 64,
    mannosidase: 110,
    mgat: 130,
    galt: 120,
    terminal: 105,
  },
};

const modules = [
  {
    id: "input",
    label: "前駆",
    name: "N型糖鎖前駆体",
    x: 88,
    y: 316,
    color: "#73a7ff",
    shape: "diamond",
    detail: "小胞体でタンパク質に付加されたN型糖鎖前駆体を表します。糖供与体プールが高いほど、下流に流れる基質量が増えます。",
  },
  {
    id: "core",
    label: "剪定",
    name: "切りそろえる反応",
    x: 258,
    y: 316,
    color: "#58d5c5",
    shape: "circle",
    enzyme: "mannosidase",
    detail: "ゴルジ体でマンノースが切り戻され、枝分かれや伸長を受けられる状態へ進む過程です。",
  },
  {
    id: "branchA",
    label: "未加工",
    name: "未加工側の経路",
    x: 438,
    y: 172,
    color: "#f4bf4f",
    shape: "circle",
    detail: "枝分かれや仕上げが進む前に残る、未加工タイプへ向かう経路です。",
  },
  {
    id: "branchB",
    label: "分岐",
    name: "枝分かれを作る反応",
    x: 438,
    y: 316,
    color: "#8ee6a8",
    shape: "rect",
    enzyme: "mgat",
    detail: "MGATなどの酵素により枝分かれが進む経路です。この反応が弱いと未加工タイプが増えやすくなります。",
  },
  {
    id: "branchC",
    label: "停滞",
    name: "処理停滞経路",
    x: 438,
    y: 460,
    color: "#ff766b",
    shape: "circle",
    detail: "ゴルジ体での処理が進みにくい、または途中構造が残る経路です。酵素を止めた条件で相対的に増えます。",
  },
  {
    id: "edit1",
    label: "伸長",
    name: "枝を伸ばす反応",
    x: 590,
    y: 236,
    color: "#ef75b8",
    shape: "hex",
    enzyme: "galt",
    detail: "分岐した糖鎖にガラクトースなどが付加され、末端修飾へ進みやすくなる過程です。",
  },
  {
    id: "edit2",
    label: "仕上げ",
    name: "仕上げる反応",
    x: 590,
    y: 398,
    color: "#b7e85f",
    shape: "hex",
    enzyme: "terminal",
    detail: "シアル酸付加やフコース付加など、糖鎖の最後の形を決める過程です。",
  },
  {
    id: "stable",
    label: "未加工",
    name: "未加工タイプ糖鎖",
    x: 790,
    y: 156,
    color: "#58d5c5",
    shape: "rect",
    detail: "マンノースが多く残った糖鎖タイプです。枝分かれや仕上げが弱い条件で相対的に増えます。",
  },
  {
    id: "adaptive",
    label: "分岐",
    name: "枝分かれタイプ糖鎖",
    x: 790,
    y: 316,
    color: "#f4bf4f",
    shape: "rect",
    detail: "GlcNAc分岐と伸長が進んだ糖鎖タイプです。糖転移酵素活性に強く依存します。",
  },
  {
    id: "stressOut",
    label: "末端",
    name: "仕上げ済みタイプ糖鎖",
    x: 790,
    y: 476,
    color: "#ff766b",
    shape: "rect",
    detail: "シアル酸やフコースなどの末端修飾が進んだ糖鎖タイプです。ゴルジ滞在時間や末端修飾活性に依存します。",
  },
];

const links = [
  { from: "input", to: "core", base: 120, mode: "supply", label: "前駆体", color: "#73a7ff" },
  { from: "core", to: "branchA", base: 46, mode: "mannoseEscape", label: "未加工へ", color: "#f4bf4f" },
  { from: "core", to: "branchB", base: 74, mode: "enzyme", enzyme: "mgat", label: "枝分かれ", color: "#8ee6a8" },
  { from: "core", to: "branchC", base: 34, mode: "stall", label: "未処理", color: "#ff766b" },
  { from: "branchA", to: "edit1", base: 44, mode: "enzyme", enzyme: "mgat", label: "分岐へ", color: "#ef75b8" },
  { from: "branchA", to: "stable", base: 42, mode: "mannoseEscape", label: "未加工", color: "#58d5c5" },
  { from: "branchB", to: "edit1", base: 58, mode: "enzyme", enzyme: "galt", label: "伸ばす", color: "#ef75b8" },
  { from: "branchB", to: "edit2", base: 38, mode: "enzyme", enzyme: "terminal", label: "末端へ", color: "#b7e85f" },
  { from: "branchC", to: "edit2", base: 40, mode: "transit", label: "滞在延長", color: "#b7e85f" },
  { from: "edit1", to: "stable", base: 26, mode: "mannoseEscape", label: "未修飾", color: "#58d5c5" },
  { from: "edit1", to: "adaptive", base: 60, mode: "enzyme", enzyme: "galt", label: "枝分かれ", color: "#f4bf4f" },
  { from: "edit2", to: "adaptive", base: 36, mode: "enzyme", enzyme: "terminal", label: "部分修飾", color: "#f4bf4f" },
  { from: "edit2", to: "stressOut", base: 58, mode: "enzyme", enzyme: "terminal", label: "末端修飾", color: "#ff766b" },
];

const phenotypeLabels = {
  stable: {
    label: "未加工タイプ",
    scientific: "枝分かれ前に残った糖鎖",
    color: "#58d5c5",
    help: "切りそろえや枝分かれが弱いと増えやすいタイプです。",
  },
  adaptive: {
    label: "枝分かれタイプ",
    scientific: "枝が増えた糖鎖",
    color: "#f4bf4f",
    help: "枝分かれを作る酵素が働くと増えやすいタイプです。",
  },
  stress: {
    label: "仕上げ済みタイプ",
    scientific: "最後まで仕上がった糖鎖",
    color: "#ff766b",
    help: "伸ばす酵素と仕上げる酵素が働くと増えやすいタイプです。",
  },
};

const enzymeNames = {
  mannosidase: "切りそろえる酵素",
  mgat: "枝分かれを作る酵素",
  galt: "枝を伸ばす酵素",
  terminal: "仕上げる酵素",
};

const enzymeShortNames = {
  mannosidase: "マンノシダーゼ",
  mgat: "MGAT",
  galt: "GalT",
  terminal: "ST/FUT",
};

const state = {
  preset: "balanced",
  selected: "core",
  interventions: {},
  history: [],
  pulse: 0,
  frame: 0,
  feedback: "",
};

const dom = {
  presetButtons: [...document.querySelectorAll(".preset")],
  inputs: {
    nutrient: document.querySelector("#nutrientInput"),
    stress: document.querySelector("#stressInput"),
    mannosidase: document.querySelector("#mannosidaseInput"),
    mgat: document.querySelector("#mgatInput"),
    galt: document.querySelector("#galtInput"),
    terminal: document.querySelector("#terminalInput"),
  },
  outputs: {
    nutrient: document.querySelector("#nutrientOutput"),
    stress: document.querySelector("#stressOutput"),
    mannosidase: document.querySelector("#mannosidaseOutput"),
    mgat: document.querySelector("#mgatOutput"),
    galt: document.querySelector("#galtOutput"),
    terminal: document.querySelector("#terminalOutput"),
  },
  koButtons: [...document.querySelectorAll("[data-ko]")],
  networkSvg: document.querySelector("#networkSvg"),
  networkLoading: document.querySelector("#networkLoading"),
  nodeReadout: document.querySelector("#nodeReadout"),
  phenotypeChart: document.querySelector("#phenotypeChart"),
  totalFlux: document.querySelector("#totalFlux"),
  diversityScore: document.querySelector("#diversityScore"),
  efficiencyScore: document.querySelector("#efficiencyScore"),
  systemState: document.querySelector("#systemState"),
  insightText: document.querySelector("#insightText"),
  pulseButton: document.querySelector("#pulseButton"),
  resetButton: document.querySelector("#resetButton"),
  undoButton: document.querySelector("#undoButton"),
  feedbackToast: document.querySelector("#feedbackToast"),
};

const requiredElements = [
  dom.networkSvg,
  dom.phenotypeChart,
  dom.totalFlux,
  dom.diversityScore,
  dom.efficiencyScore,
  dom.systemState,
  dom.insightText,
  dom.pulseButton,
  dom.resetButton,
  dom.undoButton,
  dom.feedbackToast,
  ...Object.values(dom.inputs),
  ...Object.values(dom.outputs),
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let toastTimer = 0;

function assertReady() {
  if (requiredElements.some((element) => !element)) {
    throw new Error("必要なUI要素が見つかりません。");
  }
  if (!modules.length || !links.length) {
    throw new Error("表示する反応モデルがありません。");
  }
}

function value(key) {
  return Number(dom.inputs[key].value);
}

function enzymeCapacity(key) {
  return value(key) / 100;
}

function enzymeStatus(key) {
  const amount = value(key);
  if (amount === 0) return "停止";
  if (amount < 75) return "低下";
  if (amount > 125) return "増強";
  return "標準";
}

function factorFor(link) {
  const donorPool = value("nutrient") / 100;
  const golgiTransit = value("stress") / 100;
  const pulse = 1 + state.pulse * 0.28;
  const mannosidase = enzymeCapacity("mannosidase");
  const mgat = enzymeCapacity("mgat");
  const enzyme = link.enzyme ? enzymeCapacity(link.enzyme) : 1;

  const modes = {
    supply: donorPool,
    enzyme: enzyme * (0.78 + donorPool * 0.22),
    mannoseEscape: Math.max(0.08, 1.28 - mannosidase * 0.46 - mgat * 0.18),
    stall: Math.max(0.08, 1.05 - mannosidase * 0.32 - mgat * 0.2 + (1 - golgiTransit) * 0.22),
    transit: 0.34 + golgiTransit * 0.66,
  };

  return Math.max(0.02, modes[link.mode] * pulse);
}

function calculateModel() {
  const outgoing = new Map();
  const incoming = new Map([["input", value("nutrient")]]);
  const flows = new Map();
  const transitTime = value("stress") / 100;
  const averageCapacity = (value("mannosidase") + value("mgat") + value("galt") + value("terminal")) / 400;

  links.forEach((link, index) => {
    const capacity = link.base * factorFor(link);
    if (!outgoing.has(link.from)) outgoing.set(link.from, []);
    outgoing.get(link.from).push({ ...link, index, capacity });
  });

  ["input", "core", "branchA", "branchB", "branchC", "edit1", "edit2"].forEach((id) => {
    const rawAvailable = incoming.get(id) ?? 0;
    const isTerminalRoute = id === "edit1" || id === "edit2";
    const isStalledRoute = id === "branchC";
    const capacityLoss = isStalledRoute ? 0.04 : 0.2 * (1 - Math.min(1, averageCapacity));
    const transitLoss = isTerminalRoute ? 0.03 : 0.1 * Math.max(0, transitTime - 1);
    const retention = Math.max(0.24, 1 - capacityLoss - transitLoss);
    const available = rawAvailable * retention;
    const edges = outgoing.get(id) ?? [];
    const totalCapacity = edges.reduce((sum, edge) => sum + edge.capacity, 0);
    if (!available || !totalCapacity) return;

    edges.forEach((edge) => {
      const share = edge.capacity / totalCapacity;
      const flow = Math.min(edge.capacity, available * share);
      flows.set(edge.index, flow);
      incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + flow);
    });
  });

  const phenotypes = {
    stable: incoming.get("stable") ?? 0,
    adaptive: incoming.get("adaptive") ?? 0,
    stress: incoming.get("stressOut") ?? 0,
  };
  const total = Object.values(phenotypes).reduce((sum, next) => sum + next, 0);
  const proportions = Object.values(phenotypes).map((item) => item / Math.max(total, 1));
  const diversity = 1 - proportions.reduce((sum, item) => sum + item * item, 0);
  const efficiency = total / Math.max(value("nutrient"), 1);

  return { flows, phenotypes, total, diversity, efficiency };
}

function nodeById(id) {
  return modules.find((module) => module.id === id);
}

function pathFor(link) {
  const from = nodeById(link.from);
  const to = nodeById(link.to);
  const dx = Math.abs(to.x - from.x);
  const dy = to.y - from.y;
  const curve = Math.max(84, dx * 0.42);
  return `M ${from.x} ${from.y} C ${from.x + curve} ${from.y + dy * 0.08}, ${to.x - curve} ${to.y - dy * 0.08}, ${to.x} ${to.y}`;
}

function createShape(module) {
  if (module.shape === "rect") {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", module.x - 36);
    rect.setAttribute("y", module.y - 27);
    rect.setAttribute("width", "72");
    rect.setAttribute("height", "54");
    rect.setAttribute("rx", "8");
    return rect;
  }
  if (module.shape === "diamond") {
    const diamond = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    diamond.setAttribute("points", `${module.x},${module.y - 36} ${module.x + 36},${module.y} ${module.x},${module.y + 36} ${module.x - 36},${module.y}`);
    return diamond;
  }
  if (module.shape === "hex") {
    const hex = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    hex.setAttribute("points", `${module.x - 34},${module.y - 19} ${module.x},${module.y - 38} ${module.x + 34},${module.y - 19} ${module.x + 34},${module.y + 19} ${module.x},${module.y + 38} ${module.x - 34},${module.y + 19}`);
    return hex;
  }
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", module.x);
  circle.setAttribute("cy", module.y);
  circle.setAttribute("r", "36");
  return circle;
}

function drawNetwork(result) {
  dom.networkSvg.innerHTML = "";

  [120, 210, 300].forEach((radius) => {
    const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ring.setAttribute("cx", "490");
    ring.setAttribute("cy", "310");
    ring.setAttribute("r", String(radius));
    ring.setAttribute("class", "field-ring");
    dom.networkSvg.append(ring);
  });

  links.forEach((link, index) => {
    const amount = result.flows.get(index) ?? 0;
    const path = pathFor(link);
    const width = 2 + Math.min(18, amount / 6);
    const opacity = 0.18 + Math.min(0.82, amount / 90);

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    const shadow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const base = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const flow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const from = nodeById(link.from);
    const to = nodeById(link.to);

    title.textContent = `${from.name} から ${to.name}: 流量 ${amount.toFixed(0)}`;
    shadow.setAttribute("d", path);
    shadow.setAttribute("class", "edge-shadow");
    base.setAttribute("d", path);
    base.setAttribute("class", "edge-base");
    flow.setAttribute("d", path);
    flow.setAttribute("class", "edge-flow");
    flow.setAttribute("stroke", link.color);
    flow.setAttribute("stroke-width", width.toFixed(1));
    flow.setAttribute("opacity", opacity.toFixed(2));

    label.setAttribute("x", (from.x + to.x) / 2);
    label.setAttribute("y", (from.y + to.y) / 2 - 10);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "edge-label");
    label.textContent = `${link.label} ${amount.toFixed(0)}`;

    group.append(title, shadow, base, flow, label);

    const particleCount = reduceMotion ? 0 : amount > 70 ? 3 : amount > 32 ? 2 : amount > 8 ? 1 : 0;
    for (let i = 0; i < particleCount; i += 1) {
      const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      const animate = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
      particle.setAttribute("r", String(3.5 + Math.min(4, amount / 35)));
      particle.setAttribute("fill", link.color);
      particle.setAttribute("class", "particle");
      particle.style.color = link.color;
      animate.setAttribute("dur", `${Math.max(1.4, 4.2 - amount / 38).toFixed(2)}s`);
      animate.setAttribute("begin", `${i * 0.42}s`);
      animate.setAttribute("repeatCount", "indefinite");
      animate.setAttribute("path", path);
      particle.append(animate);
      group.append(particle);
    }

    dom.networkSvg.append(group);
  });

  modules.forEach((module) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const capacity = module.enzyme ? value(module.enzyme) : 100;
    const shape = createShape(module);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    const status = module.enzyme ? enzymeStatus(module.enzyme) : "表示のみ";

    group.setAttribute(
      "class",
      ["bio-node", state.selected === module.id ? "active" : "", capacity > 125 ? "boosted" : "", capacity === 0 ? "inhibited" : ""].join(" "),
    );
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute(
      "aria-label",
      module.enzyme
        ? `${module.name}、現在は${status}、働き具合${capacity}。クリックで標準、強める、止めるを切り替えます。${module.detail}`
        : `${module.name}。${module.detail}`,
    );
    group.dataset.node = module.id;

    title.textContent = module.enzyme ? `${module.name} - ${status} (${enzymeShortNames[module.enzyme]})` : `${module.name} - ${status}`;
    shape.setAttribute("fill", module.color);
    text.setAttribute("x", module.x);
    text.setAttribute("y", module.y + 1);
    text.textContent = module.label;

    group.append(title, shape, text);
    group.addEventListener("click", () => cycleIntervention(module.id));
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        cycleIntervention(module.id);
      }
    });
    dom.networkSvg.append(group);
  });
}

function pushHistory() {
  state.history.push({
    selected: state.selected,
    interventions: { ...state.interventions },
    inputs: Object.fromEntries(Object.entries(dom.inputs).map(([key, input]) => [key, input.value])),
  });
  if (state.history.length > 20) state.history.shift();
}

function cycleIntervention(id) {
  state.selected = id;
  const module = nodeById(id);
  if (!module.enzyme) {
    queueUpdate(`${module.name}を選択しました。これは反応の結果または基質で、止める操作の対象ではありません。`);
    return;
  }

  pushHistory();
  const current = value(module.enzyme);
  const next = current === 100 ? 150 : current === 0 ? 100 : 0;
  dom.inputs[module.enzyme].value = String(next);
  state.preset = "custom";
  const label = next === 0 ? "止めました" : next > 100 ? "強めました" : "標準に戻しました";
  queueUpdate(`${module.name}を${label}。働き具合は ${next} です。`);
}

function undoIntervention() {
  const previous = state.history.pop();
  if (!previous) return;
  state.interventions = { ...previous.interventions };
  state.selected = previous.selected;
  Object.entries(previous.inputs || {}).forEach(([key, inputValue]) => {
    if (dom.inputs[key]) dom.inputs[key].value = inputValue;
  });
  queueUpdate("直前の介入を戻しました。");
}

function updateReadout() {
  const module = nodeById(state.selected);
  const capacity = module.enzyme ? value(module.enzyme) : null;
  const status = module.enzyme ? enzymeStatus(module.enzyme) : "表示のみ";
  let nextAction = "この点は基質または生成物です。酵素の働き具合は左のスライダーか酵素ノードで操作します。";
  if (module.enzyme && capacity === 100) {
    nextAction = "クリックするとこの酵素を強めます。";
  } else if (module.enzyme && capacity === 0) {
    nextAction = "クリックすると標準に戻します。";
  } else if (module.enzyme) {
    nextAction = "クリックするとこの酵素を止めます。";
  }
  dom.nodeReadout.innerHTML = `
    <span>選択中の反応点</span>
    <strong>${module.name} - ${status}${module.enzyme ? ` (${capacity})` : ""}</strong>
    <p>${module.detail} ${nextAction}</p>
  `;
}

function explainPhenotype(key) {
  const mannosidase = value("mannosidase");
  const mgat = value("mgat");
  const galt = value("galt");
  const terminal = value("terminal");
  const transit = value("stress");
  const donor = value("nutrient");

  if (key === "stable") {
    if (mgat < 70) return "枝分かれを作る酵素が弱いため、加工前の糖鎖が残りやすい状態です。";
    if (mannosidase < 70) return "切りそろえる酵素が弱いため、次の反応へ進みにくい状態です。";
    return "一部の糖鎖が枝分かれや仕上げに進む前に残っています。";
  }
  if (key === "adaptive") {
    if (mgat > 125 && galt > 90) return "枝分かれを作る酵素が強く、枝を伸ばす反応にも進める状態です。";
    if (terminal < 70) return "仕上げる酵素が弱いため、枝分かれした途中の糖鎖が残りやすい状態です。";
    return "枝分かれを作る反応と伸ばす反応のバランスで増えています。";
  }
  if (terminal > 125 || transit > 105) return "仕上げる酵素または処理時間が十分で、最後の反応まで進みやすい状態です。";
  if (donor > 120 && terminal > 80) return "糖の材料が多く、仕上げ反応まで流れが届きやすい状態です。";
  return "伸ばす反応と仕上げる反応を通った糖鎖です。";
}

function updateChart(result) {
  const entries = Object.entries(result.phenotypes).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, amount]) => amount), 1);
  const total = Math.max(result.total, 1);
  if (result.total < 1) {
    dom.phenotypeChart.innerHTML = `<div class="empty-state">糖鎖生成量がほぼありません。糖供与体プールまたは糖転移酵素活性を上げてください。</div>`;
    return;
  }

  dom.phenotypeChart.innerHTML = "";
  entries.forEach(([key, amount]) => {
    const meta = phenotypeLabels[key];
    const percent = Math.round((amount / total) * 100);
    const row = document.createElement("div");
    row.className = "phenotype-row";
    row.style.setProperty("--type-color", meta.color);
    row.innerHTML = `
      <span class="type-chip" aria-hidden="true"></span>
      <span class="type-name"><strong>${meta.label}</strong><small>${meta.scientific}</small></span>
      <span class="track" aria-hidden="true"><span class="fill" style="width: ${(amount / max) * 100}%; background: ${meta.color}"></span></span>
      <span class="type-value">${percent}%</span>
      <p>${meta.help}<br><b>${explainPhenotype(key)}</b></p>
    `;
    dom.phenotypeChart.append(row);
  });
}

function updateScores(result) {
  dom.totalFlux.textContent = result.total.toFixed(0);
  dom.diversityScore.textContent = Math.round(result.diversity * 100);
  dom.efficiencyScore.textContent = `${Math.round(result.efficiency * 100)}%`;

  const dominant = Object.entries(result.phenotypes).reduce((best, next) => (next[1] > best[1] ? next : best));
  const dominantKey = dominant[0];
  const dominantMeta = phenotypeLabels[dominantKey];
  const terminalRatio = result.phenotypes.stress / Math.max(result.total, 1);
  const branchedRatio = result.phenotypes.adaptive / Math.max(result.total, 1);
  const stateLabel = terminalRatio > 0.42 ? "仕上げ済みが多い" : branchedRatio > 0.42 ? "枝分かれが多い" : result.efficiency > 0.78 ? "加工が進んでいる" : "未加工が多い";

  dom.systemState.textContent = stateLabel;
  dom.insightText.textContent =
    `いちばん増えたのは「${dominantMeta.label}」です。これは${dominantMeta.help} 総糖鎖量は ${result.total.toFixed(0)}、加工の進み具合は ${Math.round(result.efficiency * 100)}% です。`;
}

function syncOutputs() {
  Object.entries(dom.inputs).forEach(([key, input]) => {
    dom.outputs[key].value = input.value;
    input.setAttribute("aria-valuetext", `${input.value}`);
  });
}

function updatePresetButtons() {
  dom.presetButtons.forEach((button) => {
    const active = button.dataset.preset === state.preset;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function updateButtons() {
  dom.undoButton.disabled = state.history.length === 0;
  dom.koButtons.forEach((button) => {
    const enzyme = button.dataset.ko;
    const active = enzyme && value(enzyme) === 0;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function showFeedback(message) {
  if (!message) return;
  window.clearTimeout(toastTimer);
  dom.feedbackToast.textContent = message;
  dom.feedbackToast.hidden = false;
  toastTimer = window.setTimeout(() => {
    dom.feedbackToast.hidden = true;
  }, 2600);
}

function update(feedback) {
  if (state.pulse > 0) state.pulse = Math.max(0, state.pulse - 0.12);
  syncOutputs();
  updatePresetButtons();
  const result = calculateModel();
  drawNetwork(result);
  updateReadout();
  updateChart(result);
  updateScores(result);
  updateButtons();
  dom.networkLoading?.classList.add("hidden");
  showFeedback(feedback);
}

function renderError(error) {
  const message = error instanceof Error ? error.message : "原因不明のエラーが発生しました。";
  dom.networkLoading?.classList.add("hidden");
  if (dom.networkSvg) dom.networkSvg.innerHTML = "";
  if (dom.phenotypeChart) {
    dom.phenotypeChart.innerHTML = `
      <div class="error-state">
        <div>
          <strong>計算を続行できません</strong>
          <p>${message}</p>
          <button class="secondary-action" type="button" id="retryButton">再読み込み</button>
        </div>
      </div>
    `;
    document.querySelector("#retryButton")?.addEventListener("click", () => window.location.reload());
  }
  if (dom.systemState) dom.systemState.textContent = "エラー";
}

function safeUpdate(feedback) {
  try {
    update(feedback);
  } catch (error) {
    renderError(error);
  }
}

function queueUpdate(feedback) {
  state.feedback = feedback || state.feedback;
  if (state.frame) return;
  state.frame = window.requestAnimationFrame(() => {
    const nextFeedback = state.feedback;
    state.frame = 0;
    state.feedback = "";
    safeUpdate(nextFeedback);
  });
}

function applyPreset(name, options = {}) {
  const preset = presets[name];
  if (!preset) return;
  state.preset = name;
  Object.entries(dom.inputs).forEach(([key, input]) => {
    input.value = preset[key];
  });
  queueUpdate(options.silent ? "" : `${preset.name}に切り替えました。`);
}

function markCustomCondition() {
  state.preset = "custom";
  queueUpdate();
}

function toggleKnockout(enzyme) {
  if (!dom.inputs[enzyme]) return;
  pushHistory();
  const next = value(enzyme) === 0 ? 100 : 0;
  dom.inputs[enzyme].value = String(next);
  state.preset = "custom";
  const label = next === 0 ? "止めました" : "標準に戻しました";
  queueUpdate(`${enzymeNames[enzyme] || enzyme}を${label}。働き具合は ${next} です。`);
}

function runPulse() {
  state.pulse = 1;
  dom.pulseButton.disabled = true;
  queueUpdate("糖供与体を一時的に増やしました。材料供給に依存する経路の流れが増えます。");
  [220, 440, 660, 880].forEach((delay) => {
    window.setTimeout(() => queueUpdate(), delay);
  });
  window.setTimeout(() => {
    dom.pulseButton.disabled = false;
  }, 960);
}

function resetAll() {
  state.history = [];
  state.interventions = {};
  state.selected = "core";
  state.pulse = 0;
  applyPreset("balanced", { silent: true });
  queueUpdate("標準ゴルジ条件に戻しました。");
}

function bindEvents() {
  dom.presetButtons.forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });

  Object.values(dom.inputs).forEach((input) => {
    input.addEventListener("input", markCustomCondition);
  });

  dom.koButtons.forEach((button) => {
    button.addEventListener("click", () => toggleKnockout(button.dataset.ko));
  });

  dom.pulseButton.addEventListener("click", runPulse);
  dom.resetButton.addEventListener("click", resetAll);
  dom.undoButton.addEventListener("click", undoIntervention);
}

function init() {
  assertReady();
  bindEvents();
  applyPreset("balanced", { silent: true });
}

window.addEventListener("error", (event) => {
  renderError(event.error || event.message);
});

try {
  init();
} catch (error) {
  renderError(error);
}
