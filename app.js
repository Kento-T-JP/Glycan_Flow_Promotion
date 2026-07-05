const modules = [
  { id: "input", label: "Start", name: "前駆糖鎖", x: 90, y: 325, color: "#79a7ff", shape: "diamond" },
  { id: "core", label: "Trim", name: "切りそろえ後", x: 260, y: 325, color: "#59d7c5", shape: "circle" },
  { id: "high", label: "Raw", name: "未加工側", x: 445, y: 175, color: "#f3c34d", shape: "circle" },
  { id: "branch", label: "Branch", name: "枝分かれ側", x: 445, y: 325, color: "#8de6a6", shape: "rect" },
  { id: "stall", label: "Slow", name: "停滞側", x: 445, y: 475, color: "#ff7a71", shape: "circle" },
  { id: "extend", label: "Extend", name: "伸長中", x: 635, y: 245, color: "#ee78bd", shape: "hex" },
  { id: "finish", label: "Finish", name: "仕上げ中", x: 635, y: 405, color: "#bae75f", shape: "hex" },
  { id: "stable", label: "未加工", name: "未加工タイプ", x: 865, y: 160, color: "#59d7c5", shape: "rect", terminal: "stable" },
  { id: "adaptive", label: "枝分かれ", name: "枝分かれタイプ", x: 865, y: 325, color: "#f3c34d", shape: "rect", terminal: "adaptive" },
  { id: "stressOut", label: "仕上げ", name: "仕上げ済みタイプ", x: 865, y: 490, color: "#ff7a71", shape: "rect", terminal: "stress" },
];

const links = [
  { id: "input_core", from: "input", to: "core", base: 120, mode: "supply", enzyme: "mannosidase", enzymeLabel: "MAN1/2", label: "切りそろえ", color: "#79a7ff" },
  { id: "core_high", from: "core", to: "high", base: 46, mode: "escape", enzymeLabel: "MAN1/2", label: "未加工へ", color: "#f3c34d" },
  { id: "core_branch", from: "core", to: "branch", base: 74, mode: "enzyme", enzyme: "mgat", enzymeLabel: "MGAT", label: "枝分かれ", color: "#8de6a6" },
  { id: "core_stall", from: "core", to: "stall", base: 34, mode: "stall", enzymeLabel: "MAN1/2", label: "停滞", color: "#ff7a71" },
  { id: "high_branch", from: "high", to: "branch", base: 44, mode: "enzyme", enzyme: "mgat", enzymeLabel: "MGAT", label: "分岐へ戻す", color: "#8de6a6" },
  { id: "high_stable", from: "high", to: "stable", base: 42, mode: "escape", enzymeLabel: "MAN1/2", label: "未加工", color: "#59d7c5" },
  { id: "branch_extend", from: "branch", to: "extend", base: 58, mode: "enzyme", enzyme: "galt", enzymeLabel: "GalT", label: "伸ばす", color: "#ee78bd" },
  { id: "branch_finish", from: "branch", to: "finish", base: 38, mode: "enzyme", enzyme: "terminal", enzymeLabel: "ST/FUT", label: "仕上げへ", color: "#bae75f" },
  { id: "stall_finish", from: "stall", to: "finish", base: 40, mode: "transit", enzymeLabel: "ST/FUT", label: "滞在", color: "#bae75f" },
  { id: "extend_stable", from: "extend", to: "stable", base: 26, mode: "escape", enzymeLabel: "GalT", label: "未仕上げ", color: "#59d7c5" },
  { id: "extend_adaptive", from: "extend", to: "adaptive", base: 60, mode: "enzyme", enzyme: "galt", enzymeLabel: "GalT", label: "枝分かれ", color: "#f3c34d" },
  { id: "finish_adaptive", from: "finish", to: "adaptive", base: 36, mode: "enzyme", enzyme: "terminal", enzymeLabel: "ST/FUT", label: "途中型", color: "#f3c34d" },
  { id: "finish_stress", from: "finish", to: "stressOut", base: 58, mode: "enzyme", enzyme: "terminal", enzymeLabel: "ST/FUT", label: "仕上げ済み", color: "#ff7a71" },
];

const presets = {
  balanced: {
    label: "標準",
    nutrient: 96,
    stress: 70,
    capacities: {},
  },
  stress: {
    label: "滞在長め",
    nutrient: 78,
    stress: 130,
    capacities: {
      branch_finish: 130,
      stall_finish: 155,
      finish_stress: 150,
    },
  },
  inhibited: {
    label: "枝分かれ弱め",
    nutrient: 100,
    stress: 70,
    capacities: {
      core_branch: 25,
      high_branch: 25,
      branch_extend: 55,
      extend_adaptive: 50,
      branch_finish: 60,
    },
  },
  growth: {
    label: "材料多め",
    nutrient: 146,
    stress: 64,
    capacities: {
      input_core: 145,
      core_branch: 135,
      high_branch: 130,
      branch_extend: 120,
      finish_stress: 110,
    },
  },
};

const phenotypeLabels = {
  stable: { label: "未加工", sub: "枝分かれ前に残る", color: "#59d7c5" },
  adaptive: { label: "枝分かれ", sub: "枝が増えた糖鎖", color: "#f3c34d" },
  stress: { label: "仕上げ済み", sub: "最後まで進んだ糖鎖", color: "#ff7a71" },
};

const enzymeNames = {
  mannosidase: "Mannosidase",
  mgat: "MGAT",
  galt: "GalT",
  terminal: "ST/FUT",
};

const targetPlans = {
  stable: [
    { label: "枝分かれへ流す", changes: { core_branch: 165, high_branch: 155 } },
    { label: "未加工出口を絞る", changes: { high_stable: 35, extend_stable: 45 } },
  ],
  adaptive: [
    { label: "枝分かれ出口を絞る", changes: { extend_adaptive: 35, finish_adaptive: 45 } },
    { label: "仕上げ側へ送る", changes: { branch_finish: 155, finish_stress: 155 } },
  ],
  stress: [
    { label: "仕上げ出口を止める", changes: { finish_stress: 0 } },
    { label: "仕上げへ入る流れを絞る", changes: { branch_finish: 45, stall_finish: 45 } },
  ],
};

const nodeOrder = ["input", "core", "high", "branch", "stall", "extend", "finish"];
const terminalOrder = ["stable", "adaptive", "stress"];

const state = {
  preset: "balanced",
  selectedEdge: "core_branch",
  target: "stable",
  edgeCapacities: {},
  history: [],
  pulse: 0,
  frame: 0,
  feedback: "",
};

const dom = {
  presetButtons: [...document.querySelectorAll(".preset")],
  targetButtons: [...document.querySelectorAll(".target-button")],
  inputs: {
    nutrient: document.querySelector("#nutrientInput"),
    stress: document.querySelector("#stressInput"),
  },
  outputs: {
    nutrient: document.querySelector("#nutrientOutput"),
    stress: document.querySelector("#stressOutput"),
  },
  edgeCapacityInput: document.querySelector("#edgeCapacityInput"),
  edgeCapacityOutput: document.querySelector("#edgeCapacityOutput"),
  capacityFill: document.querySelector("#capacityFill"),
  edgeStatus: document.querySelector("#edgeStatus"),
  edgeTitle: document.querySelector("#edge-editor-title"),
  edgeMeta: document.querySelector("#edgeMeta"),
  edgeKoButton: document.querySelector("#edgeKoButton"),
  edgeMinusButton: document.querySelector("#edgeMinusButton"),
  edgePlusButton: document.querySelector("#edgePlusButton"),
  edgeResetButton: document.querySelector("#edgeResetButton"),
  selectedEdgeFlow: document.querySelector("#selectedEdgeFlow"),
  selectedEdgeDelta: document.querySelector("#selectedEdgeDelta"),
  networkSvg: document.querySelector("#networkSvg"),
  networkLoading: document.querySelector("#networkLoading"),
  phenotypeChart: document.querySelector("#phenotypeChart"),
  recommendationList: document.querySelector("#recommendationList"),
  totalFlux: document.querySelector("#totalFlux"),
  systemState: document.querySelector("#systemState"),
  insightText: document.querySelector("#insightText"),
  pulseButton: document.querySelector("#pulseButton"),
  resetButton: document.querySelector("#resetButton"),
  undoButton: document.querySelector("#undoButton"),
  feedbackToast: document.querySelector("#feedbackToast"),
};

const requiredElements = [
  dom.edgeCapacityInput,
  dom.edgeCapacityOutput,
  dom.capacityFill,
  dom.edgeStatus,
  dom.edgeTitle,
  dom.edgeMeta,
  dom.edgeKoButton,
  dom.edgeMinusButton,
  dom.edgePlusButton,
  dom.edgeResetButton,
  dom.selectedEdgeFlow,
  dom.selectedEdgeDelta,
  dom.networkSvg,
  dom.phenotypeChart,
  dom.recommendationList,
  dom.totalFlux,
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
let sliderPrimed = false;

function defaultCapacities() {
  return Object.fromEntries(links.map((link) => [link.id, 100]));
}

function assertReady() {
  if (requiredElements.some((element) => !element)) {
    throw new Error("必要なUI要素が見つかりません。");
  }
}

function linkById(id) {
  return links.find((link) => link.id === id);
}

function nodeById(id) {
  return modules.find((module) => module.id === id);
}

function value(key) {
  return Number(dom.inputs[key].value);
}

function getCurrentModel() {
  return {
    nutrient: value("nutrient"),
    stress: value("stress"),
    edgeCapacities: { ...state.edgeCapacities },
    pulse: 1 + state.pulse * 0.28,
  };
}

function getBaselineModel() {
  return {
    nutrient: presets.balanced.nutrient,
    stress: presets.balanced.stress,
    edgeCapacities: defaultCapacities(),
    pulse: 1,
  };
}

function edgeCapacity(id, model = getCurrentModel()) {
  return Number(model.edgeCapacities[id] ?? 100);
}

function averageCapacity(enzyme, model) {
  const enzymeLinks = links.filter((link) => link.enzyme === enzyme);
  if (!enzymeLinks.length) return 1;
  return enzymeLinks.reduce((sum, link) => sum + edgeCapacity(link.id, model), 0) / enzymeLinks.length / 100;
}

function factorFor(link, model) {
  const edgeLevel = edgeCapacity(link.id, model) / 100;
  const donorPool = model.nutrient / 100;
  const golgiTransit = model.stress / 100;
  const pulse = model.pulse ?? 1;
  const branchLevel = averageCapacity("mgat", model);
  const trimLevel = averageCapacity("mannosidase", model);

  const modes = {
    supply: edgeLevel * donorPool * pulse,
    enzyme: edgeLevel * (0.74 + donorPool * 0.26),
    escape: edgeLevel * Math.max(0.08, 1.26 - branchLevel * 0.34 - trimLevel * 0.18),
    stall: edgeLevel * Math.max(0.08, 1.0 - branchLevel * 0.18 - trimLevel * 0.2 + (1 - golgiTransit) * 0.22),
    transit: edgeLevel * (0.34 + golgiTransit * 0.66),
  };

  return modes[link.mode] ?? edgeLevel;
}

function calculateModel(inputModel = getCurrentModel()) {
  const model = { pulse: 1, ...inputModel };
  const outgoing = new Map();
  const incoming = new Map([["input", model.nutrient]]);
  const flows = new Map();
  const capacities = new Map();
  const averageEdgeLevel = links.reduce((sum, link) => sum + edgeCapacity(link.id, model), 0) / links.length / 100;

  links.forEach((link, index) => {
    const capacity = link.base * factorFor(link, model);
    capacities.set(link.id, capacity);
    if (!outgoing.has(link.from)) outgoing.set(link.from, []);
    outgoing.get(link.from).push({ ...link, index, capacity });
  });

  nodeOrder.forEach((id) => {
    const rawAvailable = incoming.get(id) ?? 0;
    const isLateRoute = id === "extend" || id === "finish";
    const isStalledRoute = id === "stall";
    const capacityLoss = isStalledRoute ? 0.04 : 0.18 * (1 - Math.min(1, averageEdgeLevel));
    const transitLoss = isLateRoute ? 0.03 : 0.08 * Math.max(0, model.stress / 100 - 1);
    const available = rawAvailable * Math.max(0.22, 1 - capacityLoss - transitLoss);
    const edges = outgoing.get(id) ?? [];
    const totalCapacity = edges.reduce((sum, edge) => sum + edge.capacity, 0);
    if (!available || totalCapacity <= 0) return;

    edges.forEach((edge) => {
      const flow = available * (edge.capacity / totalCapacity);
      flows.set(edge.id, flow);
      incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + flow);
    });
  });

  const phenotypes = {
    stable: incoming.get("stable") ?? 0,
    adaptive: incoming.get("adaptive") ?? 0,
    stress: incoming.get("stressOut") ?? 0,
  };
  const total = Object.values(phenotypes).reduce((sum, amount) => sum + amount, 0);
  const proportions = Object.fromEntries(terminalOrder.map((key) => [key, phenotypes[key] / Math.max(total, 1)]));
  return { flows, capacities, phenotypes, total, proportions };
}

function nodeBoundaryOffset(module) {
  if (module.shape === "diamond") return 50;
  if (module.shape === "rect") return 54;
  if (module.shape === "hex") return 52;
  return 48;
}

function pathFor(link) {
  const from = nodeById(link.from);
  const to = nodeById(link.to);
  const rawDx = to.x - from.x;
  const rawDy = to.y - from.y;
  const length = Math.hypot(rawDx, rawDy) || 1;
  const ux = rawDx / length;
  const uy = rawDy / length;
  const startX = from.x + ux * nodeBoundaryOffset(from);
  const startY = from.y + uy * nodeBoundaryOffset(from);
  const endX = to.x - ux * nodeBoundaryOffset(to);
  const endY = to.y - uy * nodeBoundaryOffset(to);
  const dx = Math.abs(endX - startX);
  const dy = endY - startY;
  const curve = Math.max(70, dx * 0.44);
  return `M ${startX} ${startY} C ${startX + curve} ${startY + dy * 0.08}, ${endX - curve} ${endY - dy * 0.08}, ${endX} ${endY}`;
}

function createShape(module, scale = 1) {
  if (module.shape === "rect") {
    const width = 78 * scale;
    const height = 56 * scale;
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", module.x - width / 2);
    rect.setAttribute("y", module.y - height / 2);
    rect.setAttribute("width", width);
    rect.setAttribute("height", height);
    rect.setAttribute("rx", "8");
    return rect;
  }
  if (module.shape === "diamond") {
    const radius = 38 * scale;
    const diamond = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    diamond.setAttribute("points", `${module.x},${module.y - radius} ${module.x + radius},${module.y} ${module.x},${module.y + radius} ${module.x - radius},${module.y}`);
    return diamond;
  }
  if (module.shape === "hex") {
    const rx = 36 * scale;
    const ry = 39 * scale;
    const hex = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    hex.setAttribute("points", `${module.x - rx},${module.y - ry * 0.5} ${module.x},${module.y - ry} ${module.x + rx},${module.y - ry * 0.5} ${module.x + rx},${module.y + ry * 0.5} ${module.x},${module.y + ry} ${module.x - rx},${module.y + ry * 0.5}`);
    return hex;
  }
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", module.x);
  circle.setAttribute("cy", module.y);
  circle.setAttribute("r", 38 * scale);
  return circle;
}

function terminalScale(module, result) {
  if (!module.terminal) return 1;
  const proportion = result.proportions[module.terminal] ?? 0;
  return 0.92 + proportion * 0.72;
}

function drawNetwork(result, baseline) {
  dom.networkSvg.innerHTML = "";

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
  marker.setAttribute("id", "flowArrow");
  marker.setAttribute("viewBox", "0 0 8 8");
  marker.setAttribute("refX", "6.4");
  marker.setAttribute("refY", "4");
  marker.setAttribute("markerWidth", "8");
  marker.setAttribute("markerHeight", "8");
  marker.setAttribute("markerUnits", "userSpaceOnUse");
  marker.setAttribute("orient", "auto-start-reverse");
  arrow.setAttribute("d", "M 1.3 1.1 L 6.7 4 L 1.3 6.9");
  arrow.setAttribute("fill", "none");
  arrow.setAttribute("stroke", "#e6f0eb");
  arrow.setAttribute("stroke-linecap", "round");
  arrow.setAttribute("stroke-linejoin", "round");
  arrow.setAttribute("stroke-width", "1.6");
  marker.append(arrow);
  defs.append(marker);
  dom.networkSvg.append(defs);

  [130, 230, 330].forEach((radius) => {
    const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ring.setAttribute("cx", "515");
    ring.setAttribute("cy", "325");
    ring.setAttribute("r", String(radius));
    ring.setAttribute("class", "field-ring");
    dom.networkSvg.append(ring);
  });

  links.forEach((link) => {
    const amount = result.flows.get(link.id) ?? 0;
    const baselineAmount = baseline.flows.get(link.id) ?? 0;
    const delta = amount - baselineAmount;
    const selected = link.id === state.selectedEdge;
    const stopped = edgeCapacity(link.id) === 0 || amount < 0.2;
    const path = pathFor(link);
    const width = stopped ? 1.5 : 2 + Math.min(16, amount / 6);
    const opacity = stopped ? 0.22 : 0.28 + Math.min(0.72, amount / 82);
    const from = nodeById(link.from);
    const to = nodeById(link.to);
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    const shadow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const base = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const flow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const cap = document.createElementNS("http://www.w3.org/2000/svg", "text");

    group.setAttribute("class", ["bio-edge", selected ? "selected" : "", stopped ? "stopped" : "", delta > 4 ? "increased" : "", delta < -4 ? "decreased" : ""].join(" "));
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", `${link.label}。${link.enzymeLabel}のCapacity ${edgeCapacity(link.id)}。Flow ${amount.toFixed(0)}。クリックで選択。`);
    group.dataset.edge = link.id;
    title.textContent = `${link.label}: ${link.enzymeLabel} Capacity ${edgeCapacity(link.id)} / Flow ${amount.toFixed(1)}`;

    shadow.setAttribute("d", path);
    shadow.setAttribute("class", "edge-shadow");
    base.setAttribute("d", path);
    base.setAttribute("class", "edge-base");
    flow.setAttribute("d", path);
    flow.setAttribute("class", "edge-flow");
    flow.setAttribute("stroke", link.color);
    flow.setAttribute("stroke-width", width.toFixed(1));
    flow.setAttribute("opacity", opacity.toFixed(2));
    flow.setAttribute("marker-end", stopped ? "" : "url(#flowArrow)");
    hit.setAttribute("d", path);
    hit.setAttribute("class", "edge-hit");

    label.setAttribute("x", midX);
    label.setAttribute("y", midY - 16);
    label.setAttribute("class", "edge-label");
    label.textContent = link.label;
    cap.setAttribute("x", midX);
    cap.setAttribute("y", midY + 3);
    cap.setAttribute("class", "edge-capacity");
    cap.textContent = `${link.enzymeLabel} · ${edgeCapacity(link.id)}`;

    group.append(title, shadow, base, flow, hit, label, cap);

    const particleCount = reduceMotion || stopped ? 0 : amount > 70 ? 4 : amount > 34 ? 3 : amount > 10 ? 2 : 1;
    for (let i = 0; i < particleCount; i += 1) {
      const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      const animate = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
      particle.setAttribute("r", String(3.2 + Math.min(4, amount / 34)));
      particle.setAttribute("fill", link.color);
      particle.setAttribute("class", "particle");
      particle.style.color = link.color;
      animate.setAttribute("dur", `${Math.max(1.2, 4.4 - amount / 36).toFixed(2)}s`);
      animate.setAttribute("begin", `${i * 0.34}s`);
      animate.setAttribute("repeatCount", "indefinite");
      animate.setAttribute("path", path);
      particle.append(animate);
      group.append(particle);
    }

    group.addEventListener("click", () => selectEdge(link.id));
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectEdge(link.id);
      }
    });
    dom.networkSvg.append(group);
  });

  modules.forEach((module) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const shape = createShape(module, terminalScale(module, result));
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    const amount = module.terminal ? result.phenotypes[module.terminal] ?? 0 : 0;

    group.setAttribute("class", ["bio-node", module.terminal ? "terminal-node" : ""].join(" "));
    title.textContent = module.terminal ? `${module.name}: ${amount.toFixed(1)}` : module.name;
    shape.setAttribute("fill", module.color);
    text.setAttribute("x", module.x);
    text.setAttribute("y", module.y + 1);
    text.textContent = module.label;
    group.append(title, shape, text);
    dom.networkSvg.append(group);
  });
}

function pushHistory() {
  state.history.push({
    selectedEdge: state.selectedEdge,
    target: state.target,
    edgeCapacities: { ...state.edgeCapacities },
    inputs: Object.fromEntries(Object.entries(dom.inputs).map(([key, input]) => [key, input.value])),
  });
  if (state.history.length > 30) state.history.shift();
}

function selectEdge(id, feedback = "") {
  if (!linkById(id)) return;
  state.selectedEdge = id;
  queueUpdate(feedback || `${linkById(id).label}を選択`);
}

function setEdgeCapacity(id, nextValue, options = {}) {
  if (!linkById(id)) return;
  if (!options.skipHistory) pushHistory();
  state.edgeCapacities[id] = Math.max(0, Math.min(200, Math.round(nextValue)));
  state.preset = "custom";
  queueUpdate(options.feedback || "");
}

function adjustSelectedEdge(delta) {
  const current = edgeCapacity(state.selectedEdge);
  setEdgeCapacity(state.selectedEdge, current + delta, { feedback: delta > 0 ? "Capacityを上げました" : "Capacityを下げました" });
}

function knockoutSelectedEdge() {
  const link = linkById(state.selectedEdge);
  setEdgeCapacity(state.selectedEdge, 0, { feedback: `${link.label}を止めました` });
}

function resetSelectedEdge() {
  const link = linkById(state.selectedEdge);
  setEdgeCapacity(state.selectedEdge, 100, { feedback: `${link.label}を標準に戻しました` });
}

function undoIntervention() {
  const previous = state.history.pop();
  if (!previous) return;
  state.selectedEdge = previous.selectedEdge;
  state.target = previous.target;
  state.edgeCapacities = { ...previous.edgeCapacities };
  Object.entries(previous.inputs).forEach(([key, inputValue]) => {
    if (dom.inputs[key]) dom.inputs[key].value = inputValue;
  });
  queueUpdate("Undo");
}

function updateOutputs() {
  Object.entries(dom.inputs).forEach(([key, input]) => {
    dom.outputs[key].value = input.value;
    dom.outputs[key].textContent = input.value;
    input.setAttribute("aria-valuetext", input.value);
  });
  dom.edgeCapacityInput.value = String(edgeCapacity(state.selectedEdge));
  dom.edgeCapacityOutput.value = String(edgeCapacity(state.selectedEdge));
  dom.edgeCapacityOutput.textContent = String(edgeCapacity(state.selectedEdge));
  dom.capacityFill.style.width = `${Math.min(100, edgeCapacity(state.selectedEdge) / 2)}%`;
}

function updatePresetButtons() {
  dom.presetButtons.forEach((button) => {
    const active = button.dataset.preset === state.preset;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  dom.targetButtons.forEach((button) => {
    const active = button.dataset.target === state.target;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function updateEdgeEditor(result, baseline) {
  const link = linkById(state.selectedEdge);
  const flow = result.flows.get(link.id) ?? 0;
  const baselineFlow = baseline.flows.get(link.id) ?? 0;
  const delta = flow - baselineFlow;
  const cap = edgeCapacity(link.id);
  const reaction = link.enzyme ? enzymeNames[link.enzyme] : link.enzymeLabel;

  dom.edgeTitle.textContent = link.label;
  dom.edgeMeta.textContent = `${reaction} Capacity / ${nodeById(link.from).name} → ${nodeById(link.to).name}`;
  dom.edgeStatus.textContent = `Capacity ${cap}`;
  dom.edgeStatus.className = cap === 0 ? "is-ko" : cap > 125 ? "is-high" : cap < 75 ? "is-low" : "";
  dom.selectedEdgeFlow.textContent = flow.toFixed(0);
  dom.selectedEdgeDelta.textContent = `${delta >= 0 ? "+" : ""}${delta.toFixed(0)}`;
  dom.selectedEdgeDelta.className = delta > 3 ? "positive" : delta < -3 ? "negative" : "";
}

function updateChart(result, baseline) {
  if (result.total < 1) {
    dom.phenotypeChart.innerHTML = `<div class="empty-state">Flow = 0</div>`;
    return;
  }

  dom.phenotypeChart.innerHTML = "";
  terminalOrder.forEach((key) => {
    const meta = phenotypeLabels[key];
    const currentPercent = Math.round((result.phenotypes[key] / Math.max(result.total, 1)) * 100);
    const baselinePercent = Math.round((baseline.phenotypes[key] / Math.max(baseline.total, 1)) * 100);
    const delta = currentPercent - baselinePercent;
    const row = document.createElement("div");
    row.className = "phenotype-row";
    row.style.setProperty("--type-color", meta.color);
    row.innerHTML = `
      <span class="result-bubble" style="--bubble-scale:${0.68 + currentPercent / 72}"></span>
      <span class="type-name"><strong>${meta.label}</strong><small>${meta.sub}</small></span>
      <span class="type-value">${currentPercent}%</span>
      <span class="delta ${delta > 0 ? "positive" : delta < 0 ? "negative" : ""}">${delta >= 0 ? "+" : ""}${delta}</span>
      <span class="distribution-track" aria-hidden="true">
        <span class="baseline-fill" style="width:${baselinePercent}%"></span>
        <span class="current-fill" style="width:${currentPercent}%; background:${meta.color}"></span>
      </span>
    `;
    dom.phenotypeChart.append(row);
  });
}

function updateScores(result) {
  const dominant = terminalOrder.reduce((best, key) => (result.phenotypes[key] > result.phenotypes[best] ? key : best), terminalOrder[0]);
  dom.totalFlux.textContent = `Total ${result.total.toFixed(0)}`;
  dom.systemState.textContent = phenotypeLabels[dominant].label;
  dom.insightText.textContent = `${phenotypeLabels[dominant].label}が最大。Edge Capacityを変えるとFlowが再配分されます。`;
}

function applyChangesToModel(changes, model) {
  return {
    ...model,
    edgeCapacities: {
      ...model.edgeCapacities,
      ...changes,
    },
  };
}

function updateRecommendations(result) {
  const plans = targetPlans[state.target] ?? [];
  const currentModel = getCurrentModel();
  const currentPercent = Math.round((result.phenotypes[state.target] / Math.max(result.total, 1)) * 100);
  dom.recommendationList.innerHTML = "";

  plans.forEach((plan, index) => {
    const predicted = calculateModel(applyChangesToModel(plan.changes, currentModel));
    const nextPercent = Math.round((predicted.phenotypes[state.target] / Math.max(predicted.total, 1)) * 100);
    const delta = nextPercent - currentPercent;
    const button = document.createElement("button");
    button.className = "recommendation-card";
    button.type = "button";
    button.dataset.recommendation = String(index);
    button.innerHTML = `
      <span>${plan.label}</span>
      <strong>${phenotypeLabels[state.target].label} ${delta >= 0 ? "+" : ""}${delta}%</strong>
    `;
    dom.recommendationList.append(button);
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
  }, 1700);
}

function update(feedback) {
  if (state.pulse > 0) state.pulse = Math.max(0, state.pulse - 0.12);
  const baseline = calculateModel(getBaselineModel());
  const result = calculateModel(getCurrentModel());
  updateOutputs();
  updatePresetButtons();
  drawNetwork(result, baseline);
  updateEdgeEditor(result, baseline);
  updateChart(result, baseline);
  updateScores(result);
  updateRecommendations(result);
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
        <strong>計算を続行できません</strong>
        <button class="secondary-action" type="button" id="retryButton">Reload</button>
        <small>${message}</small>
      </div>
    `;
    document.querySelector("#retryButton")?.addEventListener("click", () => window.location.reload());
  }
  if (dom.systemState) dom.systemState.textContent = "Error";
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
  if (!options.skipHistory) pushHistory();
  state.preset = name;
  state.edgeCapacities = { ...defaultCapacities(), ...preset.capacities };
  dom.inputs.nutrient.value = String(preset.nutrient);
  dom.inputs.stress.value = String(preset.stress);
  queueUpdate(options.silent ? "" : preset.label);
}

function markCustomCondition() {
  state.preset = "custom";
  queueUpdate();
}

function runPulse() {
  pushHistory();
  state.pulse = 1;
  dom.pulseButton.disabled = true;
  queueUpdate("Sugar pulse");
  [180, 360, 540, 720].forEach((delay) => {
    window.setTimeout(() => queueUpdate(), delay);
  });
  window.setTimeout(() => {
    dom.pulseButton.disabled = false;
  }, 820);
}

function resetAll() {
  pushHistory();
  state.selectedEdge = "core_branch";
  state.target = "stable";
  state.pulse = 0;
  state.history = [];
  applyPreset("balanced", { silent: true, skipHistory: true });
  queueUpdate("Reset");
}

function applyRecommendation(index) {
  const plan = targetPlans[state.target]?.[index];
  if (!plan) return;
  pushHistory();
  Object.assign(state.edgeCapacities, plan.changes);
  state.selectedEdge = Object.keys(plan.changes)[0] || state.selectedEdge;
  state.preset = "custom";
  queueUpdate(plan.label);
}

function bindEvents() {
  dom.presetButtons.forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });

  dom.targetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.target = button.dataset.target;
      queueUpdate();
    });
  });

  Object.values(dom.inputs).forEach((input) => {
    input.addEventListener("pointerdown", () => pushHistory());
    input.addEventListener("input", markCustomCondition);
  });

  dom.edgeCapacityInput.addEventListener("pointerdown", () => {
    if (!sliderPrimed) {
      pushHistory();
      sliderPrimed = true;
    }
  });
  dom.edgeCapacityInput.addEventListener("input", () => {
    setEdgeCapacity(state.selectedEdge, Number(dom.edgeCapacityInput.value), { skipHistory: true });
  });
  dom.edgeCapacityInput.addEventListener("change", () => {
    sliderPrimed = false;
  });

  dom.edgeKoButton.addEventListener("click", knockoutSelectedEdge);
  dom.edgeMinusButton.addEventListener("click", () => adjustSelectedEdge(-25));
  dom.edgePlusButton.addEventListener("click", () => adjustSelectedEdge(25));
  dom.edgeResetButton.addEventListener("click", resetSelectedEdge);
  dom.pulseButton.addEventListener("click", runPulse);
  dom.resetButton.addEventListener("click", resetAll);
  dom.undoButton.addEventListener("click", undoIntervention);

  dom.recommendationList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-recommendation]");
    if (!button) return;
    applyRecommendation(Number(button.dataset.recommendation));
  });
}

function init() {
  assertReady();
  state.edgeCapacities = defaultCapacities();
  bindEvents();
  applyPreset("balanced", { silent: true, skipHistory: true });
}

window.addEventListener("error", (event) => {
  renderError(event.error || event.message);
});

try {
  init();
} catch (error) {
  renderError(error);
}
