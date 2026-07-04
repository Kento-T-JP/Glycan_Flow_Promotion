const presets = {
  balanced: { nutrient: 96, enzyme: 104, stress: 28, inhibitor: 18 },
  stress: { nutrient: 72, enzyme: 82, stress: 112, inhibitor: 36 },
  inhibited: { nutrient: 100, enzyme: 58, stress: 52, inhibitor: 112 },
  growth: { nutrient: 146, enzyme: 132, stress: 18, inhibitor: 8 },
};

const modules = [
  {
    id: "input",
    label: "IN",
    name: "Substrate Input",
    x: 88,
    y: 316,
    color: "#60a5fa",
    shape: "diamond",
    detail: "細胞に入る材料や前駆体を表す入口です。",
  },
  {
    id: "core",
    label: "CORE",
    name: "Core Biosynthesis",
    x: 258,
    y: 316,
    color: "#2dd4bf",
    shape: "circle",
    detail: "生命現象の中心となる変換過程です。ここから複数の反応経路に分岐します。",
  },
  {
    id: "branchA",
    label: "A",
    name: "Branching Route A",
    x: 438,
    y: 172,
    color: "#f6c453",
    shape: "circle",
    detail: "栄養供給に反応しやすい分岐経路です。",
  },
  {
    id: "branchB",
    label: "B",
    name: "Branching Route B",
    x: 438,
    y: 316,
    color: "#7ddf64",
    shape: "rect",
    detail: "酵素活性の変化が強く反映される経路です。",
  },
  {
    id: "branchC",
    label: "C",
    name: "Stress Response Route",
    x: 438,
    y: 460,
    color: "#ff6b5f",
    shape: "circle",
    detail: "ストレス条件で相対的に流れが増える補償経路です。",
  },
  {
    id: "edit1",
    label: "E1",
    name: "Modification Module",
    x: 590,
    y: 236,
    color: "#f472b6",
    shape: "hex",
    detail: "生成物の性質を変える修飾過程です。",
  },
  {
    id: "edit2",
    label: "E2",
    name: "Quality Control",
    x: 590,
    y: 398,
    color: "#a3e635",
    shape: "hex",
    detail: "生成物の偏りを調整する品質管理のような過程です。",
  },
  {
    id: "stable",
    label: "S",
    name: "Stable Product",
    x: 790,
    y: 156,
    color: "#2dd4bf",
    shape: "rect",
    detail: "安定的に生成される表現型です。",
  },
  {
    id: "adaptive",
    label: "AD",
    name: "Adaptive Product",
    x: 790,
    y: 316,
    color: "#f6c453",
    shape: "rect",
    detail: "環境変化に応答して増減する表現型です。",
  },
  {
    id: "stressOut",
    label: "ST",
    name: "Stress Product",
    x: 790,
    y: 476,
    color: "#ff6b5f",
    shape: "rect",
    detail: "ストレスや阻害の影響が強いと増えやすい表現型です。",
  },
];

const links = [
  { from: "input", to: "core", base: 120, mode: "supply", label: "supply", color: "#60a5fa" },
  { from: "core", to: "branchA", base: 52, mode: "nutrient", label: "route A", color: "#f6c453" },
  { from: "core", to: "branchB", base: 74, mode: "enzyme", label: "route B", color: "#7ddf64" },
  { from: "core", to: "branchC", base: 42, mode: "stress", label: "route C", color: "#ff6b5f" },
  { from: "branchA", to: "edit1", base: 58, mode: "enzyme", label: "modify", color: "#f472b6" },
  { from: "branchA", to: "stable", base: 32, mode: "nutrient", label: "direct", color: "#2dd4bf" },
  { from: "branchB", to: "edit1", base: 46, mode: "enzyme", label: "edit", color: "#f472b6" },
  { from: "branchB", to: "edit2", base: 44, mode: "quality", label: "check", color: "#a3e635" },
  { from: "branchC", to: "edit2", base: 68, mode: "stress", label: "repair", color: "#a3e635" },
  { from: "edit1", to: "stable", base: 38, mode: "terminal", label: "finish", color: "#2dd4bf" },
  { from: "edit1", to: "adaptive", base: 60, mode: "terminal", label: "adapt", color: "#f6c453" },
  { from: "edit2", to: "adaptive", base: 44, mode: "quality", label: "balance", color: "#f6c453" },
  { from: "edit2", to: "stressOut", base: 54, mode: "stress", label: "stress", color: "#ff6b5f" },
];

const state = {
  preset: "balanced",
  selected: "core",
  interventions: {},
  pulse: 0,
};

const inputs = {
  nutrient: document.querySelector("#nutrientInput"),
  enzyme: document.querySelector("#enzymeInput"),
  stress: document.querySelector("#stressInput"),
  inhibitor: document.querySelector("#inhibitorInput"),
};

const outputs = {
  nutrient: document.querySelector("#nutrientOutput"),
  enzyme: document.querySelector("#enzymeOutput"),
  stress: document.querySelector("#stressOutput"),
  inhibitor: document.querySelector("#inhibitorOutput"),
};

const networkSvg = document.querySelector("#networkSvg");
const nodeReadout = document.querySelector("#nodeReadout");
const phenotypeChart = document.querySelector("#phenotypeChart");
const totalFlux = document.querySelector("#totalFlux");
const diversityScore = document.querySelector("#diversityScore");
const efficiencyScore = document.querySelector("#efficiencyScore");
const systemState = document.querySelector("#systemState");
const insightText = document.querySelector("#insightText");

function value(key) {
  return Number(inputs[key].value);
}

function factorFor(link) {
  const nutrient = value("nutrient") / 100;
  const enzyme = value("enzyme") / 100;
  const stress = value("stress") / 100;
  const inhibitor = value("inhibitor") / 100;
  const targetIntervention = state.interventions[link.to] ?? 0;
  const sourceIntervention = state.interventions[link.from] ?? 0;
  const intervention = 1 + (targetIntervention + sourceIntervention) * 0.22;
  const pulse = 1 + state.pulse * 0.28;

  const modes = {
    supply: nutrient * (1 - inhibitor * 0.18),
    nutrient: nutrient * (1 - stress * 0.12),
    enzyme: enzyme * (1 - inhibitor * 0.44),
    stress: 0.45 + stress * 0.82 + inhibitor * 0.18,
    quality: enzyme * (1 - stress * 0.22) + nutrient * 0.18,
    terminal: enzyme * (1 - inhibitor * 0.26) + nutrient * 0.12,
  };

  return Math.max(0.05, modes[link.mode] * intervention * pulse);
}

function calculateModel() {
  const outgoing = new Map();
  const incoming = new Map([["input", value("nutrient")]]);
  const flows = new Map();
  const capacities = new Map();
  const stressLoss = value("stress") / 100;
  const inhibitorLoss = value("inhibitor") / 100;

  links.forEach((link, index) => {
    const capacity = link.base * factorFor(link);
    capacities.set(index, capacity);
    if (!outgoing.has(link.from)) outgoing.set(link.from, []);
    outgoing.get(link.from).push({ ...link, index, capacity });
  });

  ["input", "core", "branchA", "branchB", "branchC", "edit1", "edit2"].forEach((id) => {
    const rawAvailable = incoming.get(id) ?? 0;
    const isStressRoute = id === "branchC" || id === "edit2";
    const resilience = isStressRoute ? 0.48 : 1;
    const retention = Math.max(0.22, 1 - stressLoss * 0.16 * resilience - inhibitorLoss * 0.24 * resilience);
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
    Stable: incoming.get("stable") ?? 0,
    Adaptive: incoming.get("adaptive") ?? 0,
    Stress: incoming.get("stressOut") ?? 0,
  };
  const total = Object.values(phenotypes).reduce((sum, next) => sum + next, 0);
  const proportions = Object.values(phenotypes).map((item) => item / Math.max(total, 1));
  const diversity = 1 - proportions.reduce((sum, item) => sum + item * item, 0);
  const efficiency = total / Math.max(value("nutrient"), 1);

  return { flows, capacities, phenotypes, total, diversity, efficiency };
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
    rect.setAttribute("x", module.x - 35);
    rect.setAttribute("y", module.y - 27);
    rect.setAttribute("width", "70");
    rect.setAttribute("height", "54");
    rect.setAttribute("rx", "8");
    return rect;
  }
  if (module.shape === "diamond") {
    const diamond = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    diamond.setAttribute("points", `${module.x},${module.y - 34} ${module.x + 34},${module.y} ${module.x},${module.y + 34} ${module.x - 34},${module.y}`);
    return diamond;
  }
  if (module.shape === "hex") {
    const hex = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    hex.setAttribute("points", `${module.x - 32},${module.y - 18} ${module.x},${module.y - 36} ${module.x + 32},${module.y - 18} ${module.x + 32},${module.y + 18} ${module.x},${module.y + 36} ${module.x - 32},${module.y + 18}`);
    return hex;
  }
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", module.x);
  circle.setAttribute("cy", module.y);
  circle.setAttribute("r", "34");
  return circle;
}

function drawNetwork(result) {
  networkSvg.innerHTML = "";

  [120, 210, 300].forEach((radius) => {
    const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ring.setAttribute("cx", "490");
    ring.setAttribute("cy", "310");
    ring.setAttribute("r", String(radius));
    ring.setAttribute("class", "field-ring");
    networkSvg.append(ring);
  });

  links.forEach((link, index) => {
    const amount = result.flows.get(index) ?? 0;
    const path = pathFor(link);
    const width = 2 + Math.min(18, amount / 6);
    const opacity = 0.18 + Math.min(0.82, amount / 90);

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const shadow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const base = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const flow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");

    shadow.setAttribute("d", path);
    shadow.setAttribute("class", "edge-shadow");
    base.setAttribute("d", path);
    base.setAttribute("class", "edge-base");
    flow.setAttribute("d", path);
    flow.setAttribute("class", "edge-flow");
    flow.setAttribute("stroke", link.color);
    flow.setAttribute("stroke-width", width.toFixed(1));
    flow.setAttribute("opacity", opacity.toFixed(2));

    const from = nodeById(link.from);
    const to = nodeById(link.to);
    label.setAttribute("x", (from.x + to.x) / 2);
    label.setAttribute("y", (from.y + to.y) / 2 - 10);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "edge-label");
    label.textContent = `${link.label} ${amount.toFixed(0)}`;

    group.append(shadow, base, flow, label);

    const particleCount = amount > 70 ? 3 : amount > 32 ? 2 : amount > 8 ? 1 : 0;
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

    networkSvg.append(group);
  });

  modules.forEach((module) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const intervention = state.interventions[module.id] ?? 0;
    const shape = createShape(module);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

    group.setAttribute("class", [
      "bio-node",
      state.selected === module.id ? "active" : "",
      intervention > 0 ? "boosted" : "",
      intervention < 0 ? "inhibited" : "",
    ].join(" "));
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", `${module.name}: ${module.detail}`);
    group.dataset.node = module.id;

    shape.setAttribute("fill", module.color);
    text.setAttribute("x", module.x);
    text.setAttribute("y", module.y + 1);
    text.textContent = module.label;

    group.append(shape, text);
    group.addEventListener("click", () => cycleIntervention(module.id));
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") cycleIntervention(module.id);
    });
    networkSvg.append(group);
  });
}

function cycleIntervention(id) {
  const current = state.interventions[id] ?? 0;
  const next = current === 0 ? 1 : current === 1 ? -1 : 0;
  if (next === 0) {
    delete state.interventions[id];
  } else {
    state.interventions[id] = next;
  }
  state.selected = id;
  update();
}

function updateReadout() {
  const module = nodeById(state.selected);
  const intervention = state.interventions[module.id] ?? 0;
  const status = intervention > 0 ? "Boosted" : intervention < 0 ? "Inhibited" : "Normal";
  nodeReadout.innerHTML = `
    <span>selected module</span>
    <strong>${module.name} - ${status}</strong>
    <p>${module.detail}</p>
  `;
}

function updateChart(result) {
  const entries = Object.entries(result.phenotypes);
  const max = Math.max(...entries.map(([, amount]) => amount), 1);
  const colors = {
    Stable: "#2dd4bf",
    Adaptive: "#f6c453",
    Stress: "#ff6b5f",
  };
  phenotypeChart.innerHTML = "";
  entries.forEach(([label, amount]) => {
    const row = document.createElement("div");
    row.className = "phenotype-row";
    row.innerHTML = `
      <strong>${label}</strong>
      <span class="track"><span class="fill" style="width: ${(amount / max) * 100}%; background: ${colors[label]}"></span></span>
      <span>${amount.toFixed(0)}</span>
    `;
    phenotypeChart.append(row);
  });
}

function updateScores(result) {
  totalFlux.textContent = result.total.toFixed(0);
  diversityScore.textContent = Math.round(result.diversity * 100);
  efficiencyScore.textContent = `${Math.round(result.efficiency * 100)}%`;

  const stressRatio = result.phenotypes.Stress / Math.max(result.total, 1);
  const adaptiveRatio = result.phenotypes.Adaptive / Math.max(result.total, 1);
  const stateLabel = stressRatio > 0.42 ? "Stressed" : adaptiveRatio > 0.42 ? "Adaptive" : result.efficiency > 0.86 ? "Efficient" : "Stable";
  systemState.textContent = stateLabel;

  const topPhenotype = Object.entries(result.phenotypes).reduce((best, next) => (next[1] > best[1] ? next : best))[0];
  insightText.textContent =
    `${topPhenotype} が優勢です。栄養・酵素・ストレス・阻害の条件を動かすと、同じ生命現象モデルでも流れの太さと生成物の偏りが変わります。`;
}

function syncOutputs() {
  Object.entries(inputs).forEach(([key, input]) => {
    outputs[key].value = input.value;
  });
}

function update() {
  if (state.pulse > 0) state.pulse = Math.max(0, state.pulse - 0.08);
  syncOutputs();
  const result = calculateModel();
  drawNetwork(result);
  updateReadout();
  updateChart(result);
  updateScores(result);
}

function applyPreset(name) {
  state.preset = name;
  const preset = presets[name];
  Object.entries(preset).forEach(([key, next]) => {
    inputs[key].value = next;
  });
  document.querySelectorAll(".preset").forEach((button) => {
    button.classList.toggle("active", button.dataset.preset === name);
  });
  update();
}

document.querySelectorAll(".preset").forEach((button) => {
  button.addEventListener("click", () => applyPreset(button.dataset.preset));
});

Object.values(inputs).forEach((input) => {
  input.addEventListener("input", update);
});

document.querySelector("#pulseButton").addEventListener("click", () => {
  state.pulse = 1;
  update();
  window.setTimeout(update, 260);
  window.setTimeout(update, 520);
  window.setTimeout(update, 780);
});

document.querySelector("#resetButton").addEventListener("click", () => {
  state.interventions = {};
  state.selected = "core";
  state.pulse = 0;
  applyPreset(state.preset);
});

applyPreset("balanced");
