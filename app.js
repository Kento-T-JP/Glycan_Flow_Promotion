const presets = {
  balanced: {
    name: "標準条件",
    nutrient: 96,
    enzyme: 104,
    stress: 28,
    inhibitor: 18,
  },
  stress: {
    name: "ストレス高",
    nutrient: 72,
    enzyme: 82,
    stress: 112,
    inhibitor: 36,
  },
  inhibited: {
    name: "酵素阻害",
    nutrient: 100,
    enzyme: 58,
    stress: 52,
    inhibitor: 112,
  },
  growth: {
    name: "高供給",
    nutrient: 146,
    enzyme: 132,
    stress: 18,
    inhibitor: 8,
  },
};

const modules = [
  {
    id: "input",
    label: "供給",
    name: "材料供給",
    x: 88,
    y: 316,
    color: "#73a7ff",
    shape: "diamond",
    detail: "細胞内に入る材料や前駆体を表します。栄養供給を上げると、この入口からの流れが増えます。",
  },
  {
    id: "core",
    label: "基幹",
    name: "基幹反応",
    x: 258,
    y: 316,
    color: "#58d5c5",
    shape: "circle",
    detail: "生命現象の中心となる変換過程です。ここから複数の経路に分岐します。",
  },
  {
    id: "branchA",
    label: "伸長",
    name: "伸長経路",
    x: 438,
    y: 172,
    color: "#f4bf4f",
    shape: "circle",
    detail: "材料が十分にあると流れやすい経路です。生成物の安定型に寄与します。",
  },
  {
    id: "branchB",
    label: "修飾",
    name: "修飾経路",
    x: 438,
    y: 316,
    color: "#8ee6a8",
    shape: "rect",
    detail: "酵素活性の影響を受けやすい経路です。適応型の生成に関わります。",
  },
  {
    id: "branchC",
    label: "負荷",
    name: "ストレス応答経路",
    x: 438,
    y: 460,
    color: "#ff766b",
    shape: "circle",
    detail: "細胞ストレスが高いと相対的に強くなる経路です。負荷型の生成に関わります。",
  },
  {
    id: "edit1",
    label: "末端",
    name: "末端修飾",
    x: 590,
    y: 236,
    color: "#ef75b8",
    shape: "hex",
    detail: "生成物の性質を決める後段の修飾過程です。",
  },
  {
    id: "edit2",
    label: "調整",
    name: "品質調整",
    x: 590,
    y: 398,
    color: "#b7e85f",
    shape: "hex",
    detail: "流れの偏りを調整する過程です。ストレス条件ではこの経路の意味が大きくなります。",
  },
  {
    id: "stable",
    label: "安定",
    name: "安定型生成物",
    x: 790,
    y: 156,
    color: "#58d5c5",
    shape: "rect",
    detail: "標準条件で生成されやすい表現型です。",
  },
  {
    id: "adaptive",
    label: "適応",
    name: "適応型生成物",
    x: 790,
    y: 316,
    color: "#f4bf4f",
    shape: "rect",
    detail: "環境変化に応じて増減する表現型です。",
  },
  {
    id: "stressOut",
    label: "負荷",
    name: "負荷型生成物",
    x: 790,
    y: 476,
    color: "#ff766b",
    shape: "rect",
    detail: "ストレスや阻害の影響が強いと増えやすい表現型です。",
  },
];

const links = [
  { from: "input", to: "core", base: 120, mode: "supply", label: "供給", color: "#73a7ff" },
  { from: "core", to: "branchA", base: 52, mode: "nutrient", label: "伸長", color: "#f4bf4f" },
  { from: "core", to: "branchB", base: 74, mode: "enzyme", label: "修飾", color: "#8ee6a8" },
  { from: "core", to: "branchC", base: 42, mode: "stress", label: "応答", color: "#ff766b" },
  { from: "branchA", to: "edit1", base: 58, mode: "enzyme", label: "末端", color: "#ef75b8" },
  { from: "branchA", to: "stable", base: 32, mode: "nutrient", label: "安定", color: "#58d5c5" },
  { from: "branchB", to: "edit1", base: 46, mode: "enzyme", label: "編集", color: "#ef75b8" },
  { from: "branchB", to: "edit2", base: 44, mode: "quality", label: "調整", color: "#b7e85f" },
  { from: "branchC", to: "edit2", base: 68, mode: "stress", label: "補償", color: "#b7e85f" },
  { from: "edit1", to: "stable", base: 38, mode: "terminal", label: "完了", color: "#58d5c5" },
  { from: "edit1", to: "adaptive", base: 60, mode: "terminal", label: "適応", color: "#f4bf4f" },
  { from: "edit2", to: "adaptive", base: 44, mode: "quality", label: "均衡", color: "#f4bf4f" },
  { from: "edit2", to: "stressOut", base: 54, mode: "stress", label: "負荷", color: "#ff766b" },
];

const phenotypeLabels = {
  stable: { label: "安定型", color: "#58d5c5" },
  adaptive: { label: "適応型", color: "#f4bf4f" },
  stress: { label: "負荷型", color: "#ff766b" },
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
    enzyme: document.querySelector("#enzymeInput"),
    stress: document.querySelector("#stressInput"),
    inhibitor: document.querySelector("#inhibitorInput"),
  },
  outputs: {
    nutrient: document.querySelector("#nutrientOutput"),
    enzyme: document.querySelector("#enzymeOutput"),
    stress: document.querySelector("#stressOutput"),
    inhibitor: document.querySelector("#inhibitorOutput"),
  },
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
  const stressLoss = value("stress") / 100;
  const inhibitorLoss = value("inhibitor") / 100;

  links.forEach((link, index) => {
    const capacity = link.base * factorFor(link);
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
    const intervention = state.interventions[module.id] ?? 0;
    const shape = createShape(module);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    const status = intervention > 0 ? "促進" : intervention < 0 ? "抑制" : "通常";

    group.setAttribute(
      "class",
      ["bio-node", state.selected === module.id ? "active" : "", intervention > 0 ? "boosted" : "", intervention < 0 ? "inhibited" : ""].join(" "),
    );
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", `${module.name}、現在は${status}。クリックで状態を切り替えます。${module.detail}`);
    group.dataset.node = module.id;

    title.textContent = `${module.name} - ${status}`;
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
  });
  if (state.history.length > 20) state.history.shift();
}

function cycleIntervention(id) {
  pushHistory();
  const current = state.interventions[id] ?? 0;
  const next = current === 0 ? 1 : current === 1 ? -1 : 0;
  if (next === 0) {
    delete state.interventions[id];
  } else {
    state.interventions[id] = next;
  }
  state.selected = id;
  const module = nodeById(id);
  const label = next > 0 ? "促進" : next < 0 ? "抑制" : "通常";
  queueUpdate(`${module.name}を${label}にしました。`);
}

function undoIntervention() {
  const previous = state.history.pop();
  if (!previous) return;
  state.interventions = { ...previous.interventions };
  state.selected = previous.selected;
  queueUpdate("直前の介入を戻しました。");
}

function updateReadout() {
  const module = nodeById(state.selected);
  const intervention = state.interventions[module.id] ?? 0;
  const status = intervention > 0 ? "促進" : intervention < 0 ? "抑制" : "通常";
  const nextAction = intervention === 0 ? "もう一度クリックすると促進になります。" : intervention > 0 ? "もう一度クリックすると抑制になります。" : "もう一度クリックすると通常に戻ります。";
  dom.nodeReadout.innerHTML = `
    <span>選択中の反応点</span>
    <strong>${module.name} - ${status}</strong>
    <p>${module.detail} ${nextAction}</p>
  `;
}

function updateChart(result) {
  const entries = Object.entries(result.phenotypes);
  const max = Math.max(...entries.map(([, amount]) => amount), 1);
  if (result.total < 1) {
    dom.phenotypeChart.innerHTML = `<div class="empty-state">生成量がほぼありません。供給量や酵素活性を上げてください。</div>`;
    return;
  }

  dom.phenotypeChart.innerHTML = "";
  entries.forEach(([key, amount]) => {
    const meta = phenotypeLabels[key];
    const row = document.createElement("div");
    row.className = "phenotype-row";
    row.innerHTML = `
      <strong>${meta.label}</strong>
      <span class="track" aria-hidden="true"><span class="fill" style="width: ${(amount / max) * 100}%; background: ${meta.color}"></span></span>
      <span>${amount.toFixed(0)}</span>
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
  const dominantLabel = phenotypeLabels[dominantKey].label;
  const stressRatio = result.phenotypes.stress / Math.max(result.total, 1);
  const adaptiveRatio = result.phenotypes.adaptive / Math.max(result.total, 1);
  const stateLabel = stressRatio > 0.42 ? "負荷型優位" : adaptiveRatio > 0.42 ? "適応型優位" : result.efficiency > 0.78 ? "高効率" : "安定型優位";

  dom.systemState.textContent = stateLabel;
  dom.insightText.textContent =
    `${dominantLabel}が最も多い条件です。総生成量は ${result.total.toFixed(0)}、変換効率は ${Math.round(result.efficiency * 100)}% です。条件や反応点を変え、どの経路が生成物の偏りを作るか確認してください。`;
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

function runPulse() {
  state.pulse = 1;
  dom.pulseButton.disabled = true;
  queueUpdate("一時刺激を与えました。太い経路ほど強く反応します。");
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
  queueUpdate("標準条件に戻しました。");
}

function bindEvents() {
  dom.presetButtons.forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });

  Object.values(dom.inputs).forEach((input) => {
    input.addEventListener("input", markCustomCondition);
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
