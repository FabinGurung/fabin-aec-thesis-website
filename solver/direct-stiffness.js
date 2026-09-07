import { matMul, matVec, solveLinear, transpose, zeros } from "./matrix.js";

export const DOF_PER_NODE = 3;

export function localStiffness(E, A, I, L) {
  [E, A, I, L].forEach((value) => {
    if (!(Number(value) > 0)) throw new Error("E, A, I and L must all be positive");
  });
  const eaL = E * A / L;
  const ei = E * I;
  return [
    [eaL, 0, 0, -eaL, 0, 0],
    [0, 12 * ei / L ** 3, 6 * ei / L ** 2, 0, -12 * ei / L ** 3, 6 * ei / L ** 2],
    [0, 6 * ei / L ** 2, 4 * ei / L, 0, -6 * ei / L ** 2, 2 * ei / L],
    [-eaL, 0, 0, eaL, 0, 0],
    [0, -12 * ei / L ** 3, -6 * ei / L ** 2, 0, 12 * ei / L ** 3, -6 * ei / L ** 2],
    [0, 6 * ei / L ** 2, 2 * ei / L, 0, -6 * ei / L ** 2, 4 * ei / L],
  ];
}

export function transform(c, s) {
  return [
    [c, s, 0, 0, 0, 0],
    [-s, c, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0],
    [0, 0, 0, c, s, 0],
    [0, 0, 0, -s, c, 0],
    [0, 0, 0, 0, 0, 1],
  ];
}

export function elementMatrices(xi, yi, xj, yj, E, A, I) {
  const dx = xj - xi;
  const dy = yj - yi;
  const L = Math.hypot(dx, dy);
  if (!(L > 0)) throw new Error("zero-length frame member");
  const c = dx / L;
  const s = dy / L;
  const kLocal = localStiffness(Number(E), Number(A), Number(I), L);
  const T = transform(c, s);
  const kGlobal = matMul(matMul(transpose(T), kLocal), T);
  return { L, c, s, kLocal, T, kGlobal };
}

export function solveFrame(nodes, members, nodalLoads) {
  const nodeIds = Object.keys(nodes);
  const index = Object.fromEntries(nodeIds.map((id, i) => [id, i]));
  const ndof = DOF_PER_NODE * nodeIds.length;
  const K = zeros(ndof, ndof);
  const F = Array(ndof).fill(0);
  const cache = {};

  for (const member of members) {
    const ni = String(member.i);
    const nj = String(member.j);
    if (!(ni in nodes) || !(nj in nodes)) throw new Error(`member ${member.id} references an unknown node`);
    const { L, c, s, kLocal, T, kGlobal } = elementMatrices(
      Number(nodes[ni].x), Number(nodes[ni].y), Number(nodes[nj].x), Number(nodes[nj].y),
      Number(member.E), Number(member.A), Number(member.I),
    );
    const dofs = [
      3 * index[ni], 3 * index[ni] + 1, 3 * index[ni] + 2,
      3 * index[nj], 3 * index[nj] + 1, 3 * index[nj] + 2,
    ];
    for (let a = 0; a < 6; a += 1) for (let b = 0; b < 6; b += 1) K[dofs[a]][dofs[b]] += kGlobal[a][b];
    cache[String(member.id)] = { L, c, s, kLocal, T, kGlobal, dofs };
  }

  for (const load of nodalLoads) {
    const node = String(load.node);
    if (!(node in index)) throw new Error(`load references an unknown node: ${node}`);
    const base = 3 * index[node];
    F[base] += Number(load.Fx ?? 0);
    F[base + 1] += Number(load.Fy ?? 0);
    F[base + 2] += Number(load.Mz ?? 0);
  }

  const restrained = [];
  for (const [nid, node] of Object.entries(nodes)) {
    const base = 3 * index[nid];
    const r = node.restraints ?? {};
    ["ux", "uy", "rz"].forEach((key, offset) => { if (Boolean(r[key])) restrained.push(base + offset); });
  }
  restrained.sort((a, b) => a - b);
  const restrainedSet = new Set(restrained);
  const free = Array.from({ length: ndof }, (_, i) => i).filter((i) => !restrainedSet.has(i));
  if (free.length === 0) throw new Error("model has no free degrees of freedom");

  const Kff = free.map((i) => free.map((j) => K[i][j]));
  const Ff = free.map((i) => F[i]);
  const uf = solveLinear(Kff, Ff);
  const U = Array(ndof).fill(0);
  free.forEach((dof, i) => { U[dof] = uf[i]; });
  const KU = matVec(K, U);
  const R = KU.map((v, i) => v - F[i]);

  const elements = {};
  for (const [memberId, data] of Object.entries(cache)) {
    const globalD = data.dofs.map((i) => U[i]);
    const localD = matVec(data.T, globalD);
    const localF = matVec(data.kLocal, localD);
    elements[memberId] = { L: data.L, c: data.c, s: data.s, globalD, localD, localF };
  }
  return { nodeIds, K, F, U, R, free, restrained, elements, Kff };
}
