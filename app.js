const presets = {
  pancreas: {
    label: "膵臓",
    source: 100,
    branch: 78,
    terminal: 64,
    bias: { T1: 1.12, T2: 0.92, T3: 1.04, T4: 0.82, T5: 1.18 },
  },
  liver: {
    label: "肝臓",
    source: 112,
    branch: 68,
    terminal: 88,
    bias: { T1: 0.88, T2: 1.16, T3: 0.96, T4: 1.18, T5: 0.82 },
  },
  immune: {
    label: "免疫",
    source: 84,
    branch: 104,
    terminal: 78,
    bias: { T1: 0.78, T2: 0.92, T3: 1.2, T4: 0.98, T5: 1.14 },
  },
};

const nodes = [
  { id: "S", label: "S", x: 70, y: 260, kind: "source", color: "#2563eb", detail: "初期基質の供給源。モデルではSourceとして扱います。" },
  { id: "G0", label: "G0", x: 210, y: 260, kind: "glycan", color: "#16a34a", detail: "初期糖鎖。ここから複数の酵素反応に分岐します。" },
  { id: "G1", label: "G1", x: 360, y: 145, kind: "glycan", color: "#d99a12", detail: "分岐反応で生成される中間糖鎖です。" },
  { id: "G2", label: "G2", x: 360, y: 260, kind: "glycan", color: "#dc2626", detail: "中心的な中間糖鎖。複数の終点糖鎖へ流れます。" },
  { id: "G3", label: "G3", x: 360, y: 375, kind: "glycan", color: "#7c3aed", detail: "別経路で生成される中間糖鎖です。" },
  { id: "G4", label: "G4", x: 530, y: 120, kind: "glycan", color: "#0891b2", detail: "末端修飾前の糖鎖候補です。" },
  { id: "G5", label: "G5", x: 530, y: 260, kind: "glycan", color: "#65a30d", detail: "反応容量の影響を受けやすい中間糖鎖です。" },
  { id: "G6", label: "G6", x: 530, y: 400, kind: "glycan", color: "#ea580c", detail: "下流の終点糖鎖に接続する中間糖鎖です。" },
  { id: "T1", label: "T1", x: 735, y: 70, kind: "sink", color: "#0f766e", detail: "終点糖鎖。予測分布の1つとして集計されます。" },
  { id: "T2", label: "T2", x: 735, y: 165, kind: "sink", color: "#0f766e", detail: "終点糖鎖。組織プリセットで流量が変わります。" },
  { id: "T3", label: "T3", x: 735, y: 260, kind: "sink", color: "#0f766e", detail: "終点糖鎖。中心経路から多く流れる候補です。" },
  { id: "T4", label: "T4", x: 735, y: 355, kind: "sink", color: "#0f766e", detail: "終点糖鎖。末端修飾の強さに反応します。" },
  { id: "T5", label: "T5", x: 735, y: 450, kind: "sink", color: "#0f766e", detail: "終点糖鎖。別経路由来の生成量を示します。" },
];

const edgeTemplates = [
  { from: "S", to: "G0", base: 120, type: "source", label: "供給" },
  { from: "G0", to: "G1", base: 52, type: "branch", label: "E1" },
  { from: "G0", to: "G2", base: 74, type: "branch", label: "E2" },
  { from: "G0", to: "G3", base: 46, type: "branch", label: "E3" },
  { from: "G1", to: "G4", base: 42, type: "branch", label: "E4" },
  { from: "G1", to: "G5", base: 34, type: "branch", label: "E5" },
  { from: "G2", to: "G5", base: 68, type: "branch", label: "E6" },
  { from: "G3", to: "G5", base: 28, type: "branch", label: "E7" },
  { from: "G3", to: "G6", base: 44, type: "branch", label: "E8" },
  { from: "G4", to: "T1", base: 32, type: "terminal", label: "M1" },
  { from: "G4", to: "T2", base: 48, type: "terminal", label: "M2" },
  { from: "G5", to: "T2", base: 34, type: "terminal", label: "M3" },
  { from: "G5", to: "T3", base: 58, type: "terminal", label: "M4" },
  { from: "G5", to: "T4", base: 36, type: "terminal", label: "M5" },
  { from: "G6", to: "T4", base: 42, type: "terminal", label: "M6" },
  { from: "G6", to: "T5", base: 52, type: "terminal", label: "M7" },
];

const state = {
  preset: "pancreas",
  selectedNode: "G0",
};

const sourceInput = document.querySelector("#sourceInput");
const branchInput = document.querySelector("#branchInput");
const terminalInput = document.querySelector("#terminalInput");
const sourceOutput = document.querySelector("#sourceOutput");
const branchOutput = document.querySelector("#branchOutput");
const terminalOutput = document.querySelector("#terminalOutput");
const networkSvg = document.querySelector("#networkSvg");
const totalFlowEl = document.querySelector("#totalFlow");
const nodeDetail = document.querySelector("#nodeDetail");
const barChart = document.querySelector("#barChart");
const insightText = document.querySelector("#insightText");

function capacity(edge) {
  const source = Number(sourceInput.value) / 100;
  const branch = Number(branchInput.value) / 100;
  const terminal = Number(terminalInput.value) / 100;
  const bias = presets[state.preset].bias[edge.to] ?? 1;
  if (edge.type === "source") return edge.base * source;
  if (edge.type === "branch") return edge.base * branch;
  return edge.base * terminal * bias;
}

function calculateFlow() {
  const outgoing = new Map();
  const incoming = new Map([["S", Number(sourceInput.value)]]);
  const edgeFlows = new Map();

  edgeTemplates.forEach((edge, index) => {
    const enriched = { ...edge, index, cap: capacity(edge) };
    if (!outgoing.has(edge.from)) outgoing.set(edge.from, []);
    outgoing.get(edge.from).push(enriched);
  });

  ["S", "G0", "G1", "G2", "G3", "G4", "G5", "G6"].forEach((nodeId) => {
    const available = incoming.get(nodeId) ?? 0;
    const edges = outgoing.get(nodeId) ?? [];
    const totalCapacity = edges.reduce((sum, edge) => sum + edge.cap, 0);
    if (!available || !totalCapacity) return;

    edges.forEach((edge) => {
      const proposed = available * (edge.cap / totalCapacity);
      const flow = Math.min(edge.cap, proposed);
      edgeFlows.set(edge.index, flow);
      incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + flow);
    });
  });

  const sinks = Object.fromEntries(["T1", "T2", "T3", "T4", "T5"].map((sink) => [sink, incoming.get(sink) ?? 0]));
  const total = Object.values(sinks).reduce((sum, value) => sum + value, 0);
  return { total, edgeFlows, sinks };
}

function pathForEdge(edge) {
  const from = nodes.find((node) => node.id === edge.from);
  const to = nodes.find((node) => node.id === edge.to);
  const dx = Math.abs(to.x - from.x);
  const curve = dx * 0.42;
  return `M ${from.x} ${from.y} C ${from.x + curve} ${from.y}, ${to.x - curve} ${to.y}, ${to.x} ${to.y}`;
}

function drawNetwork(result) {
  networkSvg.innerHTML = `
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#8ba0a3"></path>
      </marker>
    </defs>
  `;

  edgeTemplates.forEach((edge, index) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const base = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const flow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const from = nodes.find((node) => node.id === edge.from);
    const to = nodes.find((node) => node.id === edge.to);
    const amount = result.edgeFlows.get(index) ?? 0;
    const width = 2 + Math.min(18, amount / 4.8);
    const path = pathForEdge(edge);

    base.setAttribute("d", path);
    base.setAttribute("class", "edge-base");
    base.setAttribute("stroke-width", "18");
    base.setAttribute("fill", "none");
    base.setAttribute("marker-end", "url(#arrow)");

    flow.setAttribute("d", path);
    flow.setAttribute("class", "edge-flow");
    flow.setAttribute("stroke-width", width.toFixed(1));
    flow.setAttribute("fill", "none");
    flow.setAttribute("opacity", amount > 0.1 ? "0.86" : "0.12");

    label.setAttribute("x", String((from.x + to.x) / 2));
    label.setAttribute("y", String((from.y + to.y) / 2 - 8));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "edge-label");
    label.textContent = `${edge.label} ${amount.toFixed(0)}`;

    group.append(base, flow, label);
    networkSvg.append(group);
  });

  nodes.forEach((node) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", `node ${state.selectedNode === node.id ? "active" : ""}`);
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", `${node.label} ${node.detail}`);
    group.dataset.node = node.id;

    let shape;
    if (node.kind === "source") {
      shape = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      shape.setAttribute("points", `${node.x},${node.y - 28} ${node.x + 28},${node.y} ${node.x},${node.y + 28} ${node.x - 28},${node.y}`);
    } else if (node.kind === "sink") {
      shape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      shape.setAttribute("x", String(node.x - 26));
      shape.setAttribute("y", String(node.y - 26));
      shape.setAttribute("width", "52");
      shape.setAttribute("height", "52");
      shape.setAttribute("rx", "9");
    } else {
      shape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      shape.setAttribute("cx", String(node.x));
      shape.setAttribute("cy", String(node.y));
      shape.setAttribute("r", "27");
    }
    shape.setAttribute("fill", node.color);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", String(node.x));
    text.setAttribute("y", String(node.y + 5));
    text.setAttribute("text-anchor", "middle");
    text.textContent = node.label;

    group.append(shape, text);
    group.addEventListener("click", () => selectNode(node.id));
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") selectNode(node.id);
    });
    networkSvg.append(group);
  });
}

function selectNode(id) {
  state.selectedNode = id;
  const node = nodes.find((item) => item.id === id);
  nodeDetail.innerHTML = `
    <span class="detail-label">selected node</span>
    <strong>${node.label}</strong>
    <p>${node.detail}</p>
  `;
  update();
}

function updateChart(result) {
  const entries = Object.entries(result.sinks);
  const max = Math.max(...entries.map(([, value]) => value), 1);
  barChart.innerHTML = "";
  entries.forEach(([sink, value]) => {
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span class="bar-label">${sink}</span>
      <span class="bar-track"><span class="bar-fill" style="width: ${(value / max) * 100}%"></span></span>
      <span class="bar-value">${value.toFixed(0)}</span>
    `;
    barChart.append(row);
  });

  const [dominant] = entries.reduce((best, current) => (current[1] > best[1] ? current : best), entries[0]);
  insightText.textContent = `${presets[state.preset].label}プリセットでは ${dominant} に流量が集まりやすい条件です。スライダーを動かすと、分岐反応と末端修飾のバランスが分布に反映されます。`;
}

function updateOutputs() {
  sourceOutput.value = sourceInput.value;
  branchOutput.value = branchInput.value;
  terminalOutput.value = terminalInput.value;
}

function update() {
  updateOutputs();
  const result = calculateFlow();
  totalFlowEl.textContent = result.total.toFixed(1);
  drawNetwork(result);
  updateChart(result);
}

function applyPreset(name) {
  state.preset = name;
  const preset = presets[name];
  sourceInput.value = preset.source;
  branchInput.value = preset.branch;
  terminalInput.value = preset.terminal;
  document.querySelectorAll(".segment").forEach((button) => {
    button.classList.toggle("active", button.dataset.preset === name);
  });
  update();
}

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => applyPreset(button.dataset.preset));
});

[sourceInput, branchInput, terminalInput].forEach((input) => {
  input.addEventListener("input", update);
});

document.querySelector("#resetButton").addEventListener("click", () => applyPreset(state.preset));

applyPreset("pancreas");
