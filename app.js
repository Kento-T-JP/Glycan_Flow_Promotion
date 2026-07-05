const modules = [
  { id: "input", label: "出発点", name: "出発点", x: 90, y: 325, color: "#79a7ff", shape: "diamond" },
  { id: "core", label: "分岐前", name: "分岐前", x: 260, y: 325, color: "#59d7c5", shape: "circle" },
  { id: "high", label: "上側", name: "上側", x: 445, y: 175, color: "#f3c34d", shape: "circle" },
  { id: "branch", label: "中央", name: "中央", x: 445, y: 325, color: "#8de6a6", shape: "rect" },
  { id: "stall", label: "下側", name: "下側", x: 445, y: 475, color: "#ff7a71", shape: "circle" },
  { id: "extend", label: "上の中間", name: "上の中間", x: 635, y: 245, color: "#ee78bd", shape: "hex" },
  { id: "finish", label: "下の中間", name: "下の中間", x: 635, y: 405, color: "#bae75f", shape: "hex" },
  { id: "stable", label: "糖鎖A", name: "糖鎖A", x: 865, y: 160, color: "#59d7c5", shape: "terminal", terminal: "stable" },
  { id: "adaptive", label: "糖鎖B", name: "糖鎖B", x: 865, y: 325, color: "#f3c34d", shape: "terminal", terminal: "adaptive" },
  { id: "stressOut", label: "糖鎖C", name: "糖鎖C", x: 865, y: 490, color: "#ff7a71", shape: "terminal", terminal: "stress" },
];

const modelDefaults = {
  nutrient: 96,
  stress: 70,
};

const links = [
  { id: "input_core", from: "input", to: "core", base: 120, mode: "supply", label: "E1", action: "出発点から流す", color: "#79a7ff" },
  { id: "core_high", from: "core", to: "high", base: 46, mode: "escape", label: "E2", action: "上側へ分ける", color: "#f3c34d" },
  { id: "core_branch", from: "core", to: "branch", base: 74, mode: "enzyme", enzyme: "mgat", label: "E3", action: "中央へ分ける", color: "#8de6a6" },
  { id: "core_stall", from: "core", to: "stall", base: 34, mode: "stall", label: "E4", action: "下側へ分ける", color: "#ff7a71" },
  { id: "high_branch", from: "high", to: "branch", base: 44, mode: "enzyme", enzyme: "mgat", label: "E5", action: "上側から中央へ戻す", color: "#8de6a6" },
  { id: "high_stable", from: "high", to: "stable", base: 42, mode: "escape", label: "E6", action: "上側から糖鎖Aを作る", color: "#59d7c5" },
  { id: "branch_extend", from: "branch", to: "extend", base: 58, mode: "enzyme", enzyme: "galt", label: "E7", action: "上の中間へ進める", color: "#ee78bd" },
  { id: "branch_finish", from: "branch", to: "finish", base: 38, mode: "enzyme", enzyme: "terminal", label: "E8", action: "下の中間へ進める", color: "#bae75f" },
  { id: "stall_finish", from: "stall", to: "finish", base: 40, mode: "transit", label: "E9", action: "下側から下の中間へ進める", color: "#bae75f" },
  { id: "extend_stable", from: "extend", to: "stable", base: 26, mode: "escape", label: "E10", action: "上の中間から糖鎖Aを作る", color: "#59d7c5" },
  { id: "extend_adaptive", from: "extend", to: "adaptive", base: 60, mode: "enzyme", enzyme: "galt", label: "E11", action: "上の中間から糖鎖Bを作る", color: "#f3c34d" },
  { id: "finish_adaptive", from: "finish", to: "adaptive", base: 36, mode: "enzyme", enzyme: "terminal", label: "E12", action: "下の中間から糖鎖Bを作る", color: "#f3c34d" },
  { id: "finish_stress", from: "finish", to: "stressOut", base: 58, mode: "enzyme", enzyme: "terminal", label: "E13", action: "糖鎖Cを作る", color: "#ff7a71" },
];

const phenotypeLabels = {
  stable: { label: "糖鎖A", gameLabel: "A", sub: "最終生成物", color: "#59d7c5" },
  adaptive: { label: "糖鎖B", gameLabel: "B", sub: "最終生成物", color: "#f3c34d" },
  stress: { label: "糖鎖C", gameLabel: "C", sub: "最終生成物", color: "#ff7a71" },
};

const nodeOrder = ["input", "core", "high", "branch", "stall", "extend", "finish"];
const terminalOrder = ["stable", "adaptive", "stress"];
const gameDurationMs = 30000;
const countdownStepMs = 1400;
const defaultGameTarget = { stable: 0.5, adaptive: 0.3, stress: 0.2 };
const defaultEdgeCapacities = Object.freeze(Object.fromEntries(links.map((link) => [link.id, 100])));
const moduleById = new Map(modules.map((module) => [module.id, module]));
const linkByIdMap = new Map(links.map((link) => [link.id, link]));
const outgoingLinks = new Map();
const linksByEnzyme = new Map();
const terminalNodeIdByKey = new Map();

links.forEach((link) => {
  if (!outgoingLinks.has(link.from)) outgoingLinks.set(link.from, []);
  outgoingLinks.get(link.from).push(link);
  if (link.enzyme) {
    if (!linksByEnzyme.has(link.enzyme)) linksByEnzyme.set(link.enzyme, []);
    linksByEnzyme.get(link.enzyme).push(link);
  }
});

modules.forEach((module) => {
  if (module.terminal) terminalNodeIdByKey.set(module.terminal, module.id);
});

const state = {
  selectedEdge: "core_branch",
  edgeCapacities: {},
  history: [],
  frame: 0,
  feedback: "",
  game: {
    phase: "idle",
    target: { ...defaultGameTarget },
    startedAt: 0,
    endsAt: 0,
    score: 0,
    countdown: 3,
    verdict: "Ready",
    lastRemaining: null,
  },
};

const dom = {
  edgeCapacityInput: document.querySelector("#edgeCapacityInput"),
  edgeCapacityOutput: document.querySelector("#edgeCapacityOutput"),
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
  totalFlux: document.querySelector("#totalFlux"),
  insightText: document.querySelector("#insightText"),
  resetButton: document.querySelector("#resetButton"),
  undoButton: document.querySelector("#undoButton"),
  feedbackToast: document.querySelector("#feedbackToast"),
  gamePanel: document.querySelector(".game-panel"),
  gameTimer: document.querySelector("#gameTimer"),
  gameReveal: document.querySelector("#gameReveal"),
  gameCountdown: document.querySelector("#gameCountdown"),
  gameCountdownNumber: document.querySelector("#gameCountdown strong"),
  gameResultFlash: document.querySelector("#gameResultFlash"),
  gameResultTitle: document.querySelector("#gameResultTitle"),
  gameResultScore: document.querySelector("#gameResultScore"),
  gameTargets: document.querySelector("#gameTargets"),
  gameScoreFill: document.querySelector("#gameScoreFill"),
  gameScore: document.querySelector("#gameScore"),
  gamePrompt: document.querySelector("#gamePrompt"),
  gameStartButton: document.querySelector("#gameStartButton"),
  gameRetryButton: document.querySelector("#gameRetryButton"),
  gameQuitButton: document.querySelector("#gameQuitButton"),
};

const requiredElements = [
  dom.edgeCapacityInput,
  dom.edgeCapacityOutput,
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
  dom.totalFlux,
  dom.insightText,
  dom.resetButton,
  dom.undoButton,
  dom.feedbackToast,
  dom.gamePanel,
  dom.gameTimer,
  dom.gameReveal,
  dom.gameCountdown,
  dom.gameCountdownNumber,
  dom.gameResultFlash,
  dom.gameResultTitle,
  dom.gameResultScore,
  dom.gameTargets,
  dom.gameScoreFill,
  dom.gameScore,
  dom.gamePrompt,
  dom.gameStartButton,
  dom.gameRetryButton,
  dom.gameQuitButton,
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let toastTimer = 0;
let gameResultTimer = 0;
let sliderPrimed = false;
let gameTimerId = 0;
let gameCountdownTimerId = 0;
let networkInitialized = false;
let baselineResultCache = null;
let phenotypeChartEmpty = false;
const edgeElements = new Map();
const nodeElements = new Map();
const phenotypeRows = new Map();
const gameTargetRows = new Map();

function defaultCapacities() {
  return { ...defaultEdgeCapacities };
}

function setText(element, value) {
  const next = String(value);
  if (element.textContent !== next) element.textContent = next;
}

function setAttributeIfChanged(element, name, value) {
  const next = String(value);
  if (element.getAttribute(name) !== next) element.setAttribute(name, next);
}

function setStyleProperty(element, name, value) {
  const next = String(value);
  if (element.style.getPropertyValue(name) !== next) element.style.setProperty(name, next);
}

function assertReady() {
  if (requiredElements.some((element) => !element)) {
    throw new Error("必要なUI要素が見つかりません。");
  }
}

function linkById(id) {
  return linkByIdMap.get(id);
}

function nodeById(id) {
  return moduleById.get(id);
}

function getCurrentModel() {
  return {
    nutrient: modelDefaults.nutrient,
    stress: modelDefaults.stress,
    edgeCapacities: state.edgeCapacities,
    pulse: 1,
  };
}

function getBaselineModel() {
  return {
    nutrient: modelDefaults.nutrient,
    stress: modelDefaults.stress,
    edgeCapacities: defaultEdgeCapacities,
    pulse: 1,
  };
}

function edgeCapacity(id, model) {
  const capacities = model?.edgeCapacities ?? state.edgeCapacities;
  return Number(capacities[id] ?? 100);
}

function averageCapacity(enzyme, model) {
  const enzymeLinks = linksByEnzyme.get(enzyme) ?? [];
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
  const model = inputModel;
  const incoming = new Map();
  const flows = new Map();
  const capacities = new Map();

  links.forEach((link) => {
    const capacity = link.base * factorFor(link, model);
    capacities.set(link.id, capacity);
  });

  const downstreamCapacity = new Map(terminalOrder.map((key) => [terminalNodeIdByKey.get(key), Infinity]));
  [...nodeOrder].reverse().forEach((id) => {
    const edges = outgoingLinks.get(id) ?? [];
    const nodeCapacity = edges.reduce((sum, edge) => {
      const toCapacity = downstreamCapacity.get(edge.to) ?? Infinity;
      return toCapacity > 0 ? sum + (capacities.get(edge.id) ?? 0) : sum;
    }, 0);
    downstreamCapacity.set(id, nodeCapacity);
  });

  const sourceSupply = model.nutrient * (edgeCapacity("input_core", model) / 100);
  incoming.set("input", (downstreamCapacity.get("input") ?? 0) > 0 ? sourceSupply : 0);

  nodeOrder.forEach((id) => {
    const available = incoming.get(id) ?? 0;
    const edges = outgoingLinks.get(id) ?? [];
    const effectiveEdges = edges.map((edge) => ({
      edge,
      effectiveCapacity: (downstreamCapacity.get(edge.to) ?? Infinity) > 0 ? capacities.get(edge.id) ?? 0 : 0,
    }));
    const totalCapacity = effectiveEdges.reduce((sum, edge) => sum + edge.effectiveCapacity, 0);
    if (!available || totalCapacity <= 0) return;

    effectiveEdges.forEach(({ edge, effectiveCapacity }) => {
      const flow = available * (effectiveCapacity / totalCapacity);
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

function activeGameTarget() {
  return state.game.target;
}

function randomGameTarget() {
  const raw = terminalOrder.map(() => 18 + Math.random() * 64);
  const total = raw.reduce((sum, value) => sum + value, 0);
  const rounded = raw.map((value) => Math.max(15, Math.round((value / total) * 100)));
  const correction = 100 - rounded.reduce((sum, value) => sum + value, 0);
  rounded[rounded.indexOf(Math.max(...rounded))] += correction;
  return Object.fromEntries(terminalOrder.map((key, index) => [key, rounded[index] / 100]));
}

function scoreAgainstTarget(result) {
  const target = activeGameTarget();
  const totalError = terminalOrder.reduce((sum, key) => {
    return sum + Math.abs((result.proportions[key] ?? 0) - target[key]) * 100;
  }, 0);
  return Math.max(0, Math.round(100 - totalError * 1.4));
}

function verdictFor(score) {
  if (score >= 85) return "Excellent";
  if (score >= 65) return "Good";
  return "Try Again";
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function gameHint(result) {
  const target = activeGameTarget();
  const key = terminalOrder.reduce((largest, current) => {
    const currentGap = Math.abs((result.proportions[current] ?? 0) - target[current]);
    const largestGap = Math.abs((result.proportions[largest] ?? 0) - target[largest]);
    return currentGap > largestGap ? current : largest;
  }, terminalOrder[0]);
  const direction = (result.proportions[key] ?? 0) < target[key] ? "増やす" : "減らす";
  return `${phenotypeLabels[key].gameLabel}を${direction}`;
}

function nodeBoundaryOffset(module, ux = 1, uy = 0) {
  if (module.shape === "rect") {
    const halfWidth = 39;
    const halfHeight = 28;
    const scale = Math.max(Math.abs(ux) / halfWidth, Math.abs(uy) / halfHeight) || 1;
    return 1 / scale + 4;
  }
  if (module.shape === "diamond") return 42;
  if (module.shape === "hex") return 42;
  if (module.shape === "terminal") return 60;
  return 42;
}

function pathFor(link) {
  const from = nodeById(link.from);
  const to = nodeById(link.to);
  const rawDx = to.x - from.x;
  const rawDy = to.y - from.y;
  const length = Math.hypot(rawDx, rawDy) || 1;
  const ux = rawDx / length;
  const uy = rawDy / length;
  const startX = from.x + ux * nodeBoundaryOffset(from, ux, uy);
  const startY = from.y + uy * nodeBoundaryOffset(from, ux, uy);
  const endX = to.x - ux * nodeBoundaryOffset(to, ux, uy);
  const endY = to.y - uy * nodeBoundaryOffset(to, ux, uy);
  const dx = Math.abs(endX - startX);
  const dy = endY - startY;
  const curve = Math.min(Math.max(28, dx * 0.44), Math.max(28, dx * 0.48));
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
  if (module.shape === "terminal") {
    const terminal = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    terminal.setAttribute("cx", module.x);
    terminal.setAttribute("cy", module.y);
    terminal.setAttribute("rx", 58 * scale);
    terminal.setAttribute("ry", 38 * scale);
    return terminal;
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

function svgElement(tag, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function createParticle(link, path, amount, index, shortFlowBoost) {
  const radius = String((shortFlowBoost ? 4.4 : 3.2) + Math.min(4, amount / 34));
  const duration = `${Math.max(0.9, 4.4 - amount / 36).toFixed(2)}s`;
  const particle = svgElement("circle", {
    r: radius,
    fill: link.color,
    class: "particle",
  });
  const animate = svgElement("animateMotion", {
    dur: duration,
    begin: `${index * (shortFlowBoost ? 0.22 : 0.34)}s`,
    repeatCount: "indefinite",
    path,
  });
  particle.style.color = link.color;
  particle.dataset.radius = radius;
  particle.dataset.duration = duration;
  particle.motionElement = animate;
  particle.append(animate);
  return particle;
}

function ensureNetworkElements(result) {
  if (networkInitialized) return;
  dom.networkSvg.innerHTML = "";

  [120, 220, 320, 420].forEach((radius) => {
    dom.networkSvg.append(svgElement("circle", {
      cx: "515",
      cy: "325",
      r: String(radius),
      class: "field-ring",
    }));
  });

  links.forEach((link) => {
    const path = pathFor(link);
    const from = nodeById(link.from);
    const to = nodeById(link.to);
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    const group = svgElement("g", {
      class: "bio-edge",
      tabindex: "0",
      role: "button",
    });
    group.dataset.edge = link.id;

    const title = svgElement("title");
    const shadow = svgElement("path", { d: path, class: "edge-shadow" });
    const base = svgElement("path", { d: path, class: "edge-base" });
    const flow = svgElement("path", { d: path, class: "edge-flow", stroke: link.color });
    const stream = svgElement("path", { d: path, class: "edge-stream", stroke: link.color });
    const hit = svgElement("path", { d: path, class: "edge-hit" });
    const label = svgElement("text", { x: midX, y: midY - 16, class: "edge-label" });
    const cap = svgElement("text", { x: midX, y: midY + 3, class: "edge-capacity" });
    const particleGroup = svgElement("g", { class: "particle-layer" });
    const shortFlowBoost = link.id === "input_core" || link.id === "core_branch";

    stream.style.color = link.color;
    label.textContent = link.label;

    group.append(title, shadow, base, flow, stream, particleGroup, hit, label, cap);
    group.addEventListener("click", () => selectEdge(link.id));
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectEdge(link.id);
      }
    });
    dom.networkSvg.append(group);
    edgeElements.set(link.id, { group, title, flow, stream, cap, particleGroup, path, shortFlowBoost });
  });

  modules.forEach((module) => {
    const group = svgElement("g", {
      class: ["bio-node", module.terminal ? "terminal-node" : ""].join(" "),
    });
    group.dataset.node = module.id;
    const shape = createShape(module, terminalScale(module, result));
    const text = svgElement("text", { x: module.x, y: module.y + 1 });
    const title = svgElement("title");

    shape.setAttribute("fill", module.color);
    group.style.setProperty("--node-color", module.color);
    shape.dataset.role = "shape";
    text.textContent = module.label;
    group.append(title, shape, text);
    dom.networkSvg.append(group);
    nodeElements.set(module.id, { group, title, shape });
  });

  networkInitialized = true;
}

function syncParticles(layer, link, path, amount, particleCount, shortFlowBoost) {
  const current = Number(layer.dataset.count ?? 0);
  if (current === particleCount) {
    const radius = String((shortFlowBoost ? 4.4 : 3.2) + Math.min(4, amount / 34));
    const duration = `${Math.max(0.9, 4.4 - amount / 36).toFixed(2)}s`;
    Array.from(layer.children).forEach((particle) => {
      if (particle.dataset.radius !== radius) {
        particle.dataset.radius = radius;
        particle.setAttribute("r", radius);
      }
      if (particle.dataset.duration !== duration) {
        particle.dataset.duration = duration;
        particle.motionElement?.setAttribute("dur", duration);
      }
    });
    return;
  }
  layer.replaceChildren();
  for (let i = 0; i < particleCount; i += 1) {
    layer.append(createParticle(link, path, amount, i, shortFlowBoost));
  }
  layer.dataset.count = String(particleCount);
}

function drawNetwork(result, baseline) {
  ensureNetworkElements(result);

  links.forEach((link) => {
    const amount = result.flows.get(link.id) ?? 0;
    const baselineAmount = baseline.flows.get(link.id) ?? 0;
    const delta = amount - baselineAmount;
    const selected = link.id === state.selectedEdge;
    const stopped = edgeCapacity(link.id) === 0 || amount < 0.2;
    const width = stopped ? 1.5 : 2 + Math.min(16, amount / 6);
    const opacity = stopped ? 0.22 : 0.28 + Math.min(0.72, amount / 82);
    const elements = edgeElements.get(link.id);
    const { group, title, flow, stream, cap, particleGroup, path, shortFlowBoost } = elements;
    const particleCount = reduceMotion || stopped ? 0 : shortFlowBoost ? 6 : amount > 70 ? 4 : amount > 34 ? 3 : amount > 10 ? 2 : 1;

    setAttributeIfChanged(group, "class", ["bio-edge", selected ? "selected" : "", stopped ? "stopped" : "", delta > 4 ? "increased" : "", delta < -4 ? "decreased" : ""].join(" "));
    setAttributeIfChanged(group, "aria-label", `${link.label} ${link.action}。流量 ${amount.toFixed(0)}。クリックで選択。`);
    group.dataset.flow = amount.toFixed(6);
    setText(title, `${link.label}: ${link.action} / 流量 ${amount.toFixed(1)}`);
    setAttributeIfChanged(flow, "stroke-width", width.toFixed(1));
    setAttributeIfChanged(flow, "opacity", opacity.toFixed(2));
    setAttributeIfChanged(stream, "stroke-width", Math.max(3.2, Math.min(8, width * 0.42)).toFixed(1));
    const nextDisplay = stopped ? "none" : "";
    if (stream.style.display !== nextDisplay) stream.style.display = nextDisplay;
    setStyleProperty(stream, "--stream-speed", `${Math.max(0.85, 2.2 - amount / 72).toFixed(2)}s`);
    setText(cap, amount.toFixed(0));
    syncParticles(particleGroup, link, path, amount, particleCount, shortFlowBoost);
  });

  modules.forEach((module) => {
    const elements = nodeElements.get(module.id);
    const amount = module.terminal ? result.phenotypes[module.terminal] ?? 0 : 0;
    if (module.terminal) {
      const scale = terminalScale(module, result);
      setAttributeIfChanged(elements.shape, "rx", (58 * scale).toFixed(2));
      setAttributeIfChanged(elements.shape, "ry", (38 * scale).toFixed(2));
      setAttributeIfChanged(elements.shape, "fill", module.color);
      setStyleProperty(elements.group, "--node-color", module.color);
    }
    setText(elements.title, module.terminal ? `${module.name}: ${amount.toFixed(1)}` : module.name);
  });
}

function pushHistory() {
  state.history.push({
    selectedEdge: state.selectedEdge,
    edgeCapacities: { ...state.edgeCapacities },
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
  const nextCapacity = Math.max(0, Math.min(200, Math.round(nextValue)));
  const previousCapacity = edgeCapacity(id);
  if (previousCapacity === nextCapacity) {
    if (options.feedback) queueUpdate(options.feedback);
    return;
  }
  if (!options.skipHistory) pushHistory();
  state.edgeCapacities[id] = nextCapacity;
  queueUpdate(options.feedback || "");
}

function adjustSelectedEdge(delta) {
  const current = edgeCapacity(state.selectedEdge);
  setEdgeCapacity(state.selectedEdge, current + delta, { feedback: delta > 0 ? "通しやすくしました" : "通りにくくしました" });
}

function knockoutSelectedEdge() {
  const link = linkById(state.selectedEdge);
  setEdgeCapacity(state.selectedEdge, 0, { feedback: `${link.label}を止めました` });
}

function resetSelectedEdge() {
  const link = linkById(state.selectedEdge);
  setEdgeCapacity(state.selectedEdge, 100, { feedback: `${link.label}だけ標準値へ` });
}

function undoIntervention() {
  const previous = state.history.pop();
  if (!previous) return;
  state.selectedEdge = previous.selectedEdge;
  state.edgeCapacities = { ...previous.edgeCapacities };
  queueUpdate("直前の操作を取消");
}

function updateOutputs() {
  const capacity = String(edgeCapacity(state.selectedEdge));
  if (dom.edgeCapacityInput.value !== capacity) dom.edgeCapacityInput.value = capacity;
  dom.edgeCapacityOutput.value = capacity;
  setText(dom.edgeCapacityOutput, capacity);
}

function updateEdgeEditor(result, baseline) {
  const link = linkById(state.selectedEdge);
  const flow = result.flows.get(link.id) ?? 0;
  const baselineFlow = baseline.flows.get(link.id) ?? 0;
  const delta = flow - baselineFlow;

  setText(dom.edgeTitle, `${link.label} ${link.action}`);
  setText(dom.edgeMeta, `${nodeById(link.from).name} → ${nodeById(link.to).name}`);
  setText(dom.selectedEdgeFlow, flow.toFixed(0));
  setText(dom.selectedEdgeDelta, `${delta >= 0 ? "+" : ""}${delta.toFixed(0)}`);
  dom.selectedEdgeDelta.className = delta > 3 ? "positive" : delta < -3 ? "negative" : "";
}

function updateChart(result, baseline) {
  if (result.total < 1) {
    if (!phenotypeChartEmpty) {
      dom.phenotypeChart.replaceChildren();
      phenotypeRows.clear();
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "流量 = 0";
      dom.phenotypeChart.append(empty);
      phenotypeChartEmpty = true;
    }
    return;
  }

  phenotypeChartEmpty = false;
  const target = activeGameTarget();
  const hasTarget = state.game.phase !== "idle";
  dom.phenotypeChart.classList.toggle("targeting", hasTarget);
  syncPhenotypeRows();
  terminalOrder.forEach((key) => {
    const meta = phenotypeLabels[key];
    const currentPercent = Math.round((result.phenotypes[key] / Math.max(result.total, 1)) * 100);
    const baselinePercent = Math.round((baseline.phenotypes[key] / Math.max(baseline.total, 1)) * 100);
    const targetPercent = Math.round(target[key] * 100);
    const delta = currentPercent - baselinePercent;
    const targetGap = currentPercent - targetPercent;
    const elements = phenotypeRows.get(key);
    const { row, bubble, sub, value, deltaEl, baselineFill, targetGhost, currentFill, targetFill, gap } = elements;
    row.classList.toggle("has-target", hasTarget);
    setStyleProperty(bubble, "--bubble-scale", String(0.68 + currentPercent / 72));
    setText(sub, hasTarget ? "現在" : meta.sub);
    setText(value, `${currentPercent}%`);
    deltaEl.className = `delta ${hasTarget ? "target-delta" : delta > 0 ? "positive" : delta < 0 ? "negative" : ""}`;
    setText(deltaEl, hasTarget ? `目標 ${targetPercent}%` : `${delta >= 0 ? "+" : ""}${delta}`);
    if (baselineFill.style.width !== `${baselinePercent}%`) baselineFill.style.width = `${baselinePercent}%`;
    if (targetGhost.style.width !== `${targetPercent}%`) targetGhost.style.width = `${targetPercent}%`;
    if (currentFill.style.width !== `${currentPercent}%`) currentFill.style.width = `${currentPercent}%`;
    setStyleProperty(targetFill, "--target-left", `${targetPercent}%`);
    gap.className = `fit-gap ${targetGap > 0 ? "over" : "under"}`;
    setStyleProperty(gap, "--gap-left", `${Math.min(currentPercent, targetPercent)}%`);
    setStyleProperty(gap, "--gap-width", `${Math.abs(targetGap)}%`);
  });
}

function syncPhenotypeRows() {
  if (phenotypeRows.size === terminalOrder.length && !phenotypeChartEmpty) return;

  dom.phenotypeChart.replaceChildren();
  phenotypeRows.clear();
  phenotypeChartEmpty = false;
  terminalOrder.forEach((key) => {
    const meta = phenotypeLabels[key];
    const row = document.createElement("div");
    row.className = "phenotype-row";
    row.dataset.phenotypeKey = key;
    row.style.setProperty("--type-color", meta.color);
    row.innerHTML = `
      <span class="result-bubble"></span>
      <span class="type-name"><strong>${meta.label}</strong><small>${meta.sub}</small></span>
      <span class="type-value">0%</span>
      <span class="delta">+0</span>
      <span class="distribution-track" aria-hidden="true">
        <span class="baseline-fill"></span>
        <span class="target-ghost"></span>
        <span class="current-fill" style="background:${meta.color}"></span>
        <span class="target-fill"></span>
        <span class="fit-gap"></span>
      </span>
    `;
    dom.phenotypeChart.append(row);
    phenotypeRows.set(key, {
      row,
      bubble: row.querySelector(".result-bubble"),
      sub: row.querySelector(".type-name small"),
      value: row.querySelector(".type-value"),
      deltaEl: row.querySelector(".delta"),
      baselineFill: row.querySelector(".baseline-fill"),
      targetGhost: row.querySelector(".target-ghost"),
      currentFill: row.querySelector(".current-fill"),
      targetFill: row.querySelector(".target-fill"),
      gap: row.querySelector(".fit-gap"),
    });
  });
}

function updateGame(result) {
  const target = activeGameTarget();
  const score = scoreAgainstTarget(result);
  const isPlaying = state.game.phase === "playing";
  const isCounting = state.game.phase === "countdown";
  const isFinished = state.game.phase === "finished";
  const hasTarget = state.game.phase !== "idle";
  state.game.score = score;

  const remaining = isPlaying ? Math.max(0, Math.ceil((state.game.endsAt - Date.now()) / 1000)) : null;
  state.game.lastRemaining = isPlaying ? remaining : null;
  dom.gamePanel.classList.toggle("playing", isPlaying);
  dom.gamePanel.classList.toggle("revealing", isCounting);
  dom.gamePanel.classList.toggle("counting", isCounting);
  dom.gamePanel.classList.toggle("finished", isFinished);
  setText(dom.gameTimer, isPlaying ? `${remaining}s` : "--");
  setStyleProperty(dom.gameScoreFill, "--score-width", `${score}%`);
  setText(dom.gameScore, isPlaying ? `${score}` : state.game.verdict);
  setText(dom.gamePrompt, isPlaying ? gameHint(result) : isCounting ? "A/B/Cを目標に合わせろ" : isFinished ? "もう一度遊ぶ？" : "Startで目標を表示");
  dom.gameStartButton.hidden = state.game.phase !== "idle" && !isPlaying;
  dom.gameStartButton.textContent = isPlaying ? "Finish" : "Start";
  dom.gameRetryButton.hidden = !isFinished;
  dom.gameQuitButton.hidden = !isFinished;
  dom.gameCountdown.hidden = !isCounting;
  const nextCountdown = String(state.game.countdown);
  if (dom.gameCountdownNumber.textContent !== nextCountdown) {
    setText(dom.gameCountdownNumber, nextCountdown);
    dom.gameCountdownNumber.style.animation = "none";
    void dom.gameCountdownNumber.offsetWidth;
    dom.gameCountdownNumber.style.animation = "";
  }

  dom.gameTargets.classList.toggle("is-hidden", !hasTarget);
  syncGameTargets(result, target);
}

function syncGameTargets(result, target) {
  if (gameTargetRows.size !== terminalOrder.length) {
    dom.gameTargets.replaceChildren();
    gameTargetRows.clear();
    terminalOrder.forEach((key) => {
      const meta = phenotypeLabels[key];
      const row = document.createElement("div");
      row.className = "game-target-row";
      row.dataset.targetKey = key;
      row.style.setProperty("--type-color", meta.color);
      row.innerHTML = `
        <b>${meta.gameLabel}</b>
        <span class="game-target-track" aria-hidden="true">
          <span class="game-current-fill"></span>
          <span class="game-target-mark"></span>
        </span>
        <span class="game-target-value"></span>
      `;
      dom.gameTargets.append(row);
      gameTargetRows.set(key, {
        row,
        currentFill: row.querySelector(".game-current-fill"),
        targetMark: row.querySelector(".game-target-mark"),
        value: row.querySelector(".game-target-value"),
      });
    });
  }

  terminalOrder.forEach((key) => {
    const current = result.proportions[key] ?? 0;
    const elements = gameTargetRows.get(key);
    setStyleProperty(elements.currentFill, "--current", formatPercent(current));
    setStyleProperty(elements.targetMark, "--target", formatPercent(target[key]));
    setText(elements.value, `${formatPercent(current)} / ${formatPercent(target[key])}`);
  });
}

function updateCountdownOnly() {
  setText(dom.gameCountdownNumber, String(state.game.countdown));
  dom.gameCountdownNumber.style.animation = "none";
  void dom.gameCountdownNumber.offsetWidth;
  dom.gameCountdownNumber.style.animation = "";
}

function hideGameResultFlash() {
  window.clearTimeout(gameResultTimer);
  gameResultTimer = 0;
  dom.gameResultFlash.hidden = true;
  dom.gameResultFlash.classList.remove("celebrate", "retry");
}

function showGameResultFlash(verdict, score) {
  hideGameResultFlash();
  const isGoodResult = score >= 65;
  setText(dom.gameResultTitle, verdict);
  setText(dom.gameResultScore, `Score ${score}`);
  dom.gameResultFlash.classList.toggle("celebrate", isGoodResult);
  dom.gameResultFlash.classList.toggle("retry", !isGoodResult);
  dom.gameResultFlash.hidden = false;
  gameResultTimer = window.setTimeout(() => {
    dom.gameResultFlash.hidden = true;
  }, isGoodResult ? 2400 : 1900);
}

function updateScores(result) {
  const dominant = terminalOrder.reduce((best, key) => (result.phenotypes[key] > result.phenotypes[best] ? key : best), terminalOrder[0]);
  setText(dom.totalFlux, `Total ${result.total.toFixed(0)}`);
  setText(dom.insightText, `今は${phenotypeLabels[dominant].label}が最も多く生成されています。太い線ほど結果への寄与が大きいです。`);
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
  if (!baselineResultCache) baselineResultCache = calculateModel(getBaselineModel());
  const baseline = baselineResultCache;
  const result = calculateModel(getCurrentModel());
  updateOutputs();
  drawNetwork(result, baseline);
  updateEdgeEditor(result, baseline);
  updateChart(result, baseline);
  updateGame(result);
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
    phenotypeRows.clear();
    phenotypeChartEmpty = false;
    dom.phenotypeChart.innerHTML = `
      <div class="error-state">
        <strong>計算を続行できません</strong>
        <button class="secondary-action" type="button" id="retryButton">Reload</button>
        <small>${message}</small>
      </div>
    `;
    document.querySelector("#retryButton")?.addEventListener("click", () => window.location.reload());
  }
  if (dom.insightText) dom.insightText.textContent = "Error";
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

function resetAll() {
  pushHistory();
  state.selectedEdge = "core_branch";
  state.history = [];
  state.edgeCapacities = defaultCapacities();
  queueUpdate("Reset");
}

function finishGame(result = calculateModel(getCurrentModel())) {
  window.clearInterval(gameTimerId);
  window.clearTimeout(gameCountdownTimerId);
  gameTimerId = 0;
  gameCountdownTimerId = 0;
  state.game.phase = "finished";
  state.game.lastRemaining = null;
  state.game.score = scoreAgainstTarget(result);
  state.game.verdict = verdictFor(state.game.score);
  showGameResultFlash(state.game.verdict, state.game.score);
  queueUpdate(`${state.game.verdict} ${state.game.score}`);
}

function beginGameTimer() {
  if (state.game.phase !== "countdown") return;
  state.game.phase = "playing";
  state.game.startedAt = Date.now();
  state.game.endsAt = state.game.startedAt + gameDurationMs;
  state.game.lastRemaining = null;
  window.clearInterval(gameTimerId);
  gameTimerId = window.setInterval(() => {
    if (state.game.phase !== "playing") return;
    const remaining = Math.max(0, Math.ceil((state.game.endsAt - Date.now()) / 1000));
    if (Date.now() >= state.game.endsAt) {
      finishGame();
      return;
    }
    if (remaining !== state.game.lastRemaining) {
      state.game.lastRemaining = remaining;
      const result = calculateModel(getCurrentModel());
      updateGame(result);
    }
  }, 250);
  queueUpdate("Go");
}

function runCountdown() {
  if (state.game.phase !== "countdown") return;
  if (state.game.countdown <= 1) {
    beginGameTimer();
    return;
  }
  state.game.countdown -= 1;
  updateCountdownOnly();
  gameCountdownTimerId = window.setTimeout(runCountdown, countdownStepMs);
}

function startGame() {
  state.selectedEdge = "core_branch";
  state.history = [];
  state.edgeCapacities = defaultCapacities();
  state.game.phase = "countdown";
  state.game.target = randomGameTarget();
  state.game.countdown = 3;
  state.game.startedAt = 0;
  state.game.endsAt = 0;
  state.game.lastRemaining = null;
  state.game.verdict = "Target";
  hideGameResultFlash();
  window.clearInterval(gameTimerId);
  window.clearTimeout(gameCountdownTimerId);
  gameCountdownTimerId = window.setTimeout(runCountdown, countdownStepMs);
  queueUpdate("Start");
}

function toggleGame() {
  if (state.game.phase === "playing" || state.game.phase === "countdown") {
    finishGame();
    return;
  }
  startGame();
}

function quitGame() {
  window.clearInterval(gameTimerId);
  window.clearTimeout(gameCountdownTimerId);
  gameTimerId = 0;
  gameCountdownTimerId = 0;
  state.game.phase = "idle";
  state.game.lastRemaining = null;
  state.game.verdict = "Ready";
  hideGameResultFlash();
  queueUpdate("Ready");
}

function bindEvents() {
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
  dom.resetButton.addEventListener("click", resetAll);
  dom.undoButton.addEventListener("click", undoIntervention);
  dom.gameStartButton.addEventListener("click", toggleGame);
  dom.gameRetryButton.addEventListener("click", startGame);
  dom.gameQuitButton.addEventListener("click", quitGame);
}

function init() {
  assertReady();
  state.edgeCapacities = defaultCapacities();
  bindEvents();
  queueUpdate();
}

window.addEventListener("error", (event) => {
  renderError(event.error || event.message);
});

try {
  init();
} catch (error) {
  renderError(error);
}
