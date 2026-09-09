export function zeros(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

export function matMul(A, B) {
  const rows = A.length;
  const cols = B[0].length;
  const inner = B.length;
  const out = zeros(rows, cols);
  for (let i = 0; i < rows; i += 1) {
    for (let k = 0; k < inner; k += 1) {
      const aik = A[i][k];
      if (aik === 0) continue;
      for (let j = 0; j < cols; j += 1) out[i][j] += aik * B[k][j];
    }
  }
  return out;
}

export function transpose(A) {
  return A[0].map((_, j) => A.map((row) => row[j]));
}

export function matVec(A, x) {
  return A.map((row) => row.reduce((sum, value, j) => sum + value * x[j], 0));
}

export function solveLinear(Ain, bin) {
  const A = Ain.map((row) => row.slice());
  const b = bin.slice();
  const n = A.length;
  if (n === 0 || A.some((row) => row.length !== n) || b.length !== n) throw new Error("linear system must be square");

  for (let k = 0; k < n; k += 1) {
    let pivot = k;
    for (let i = k + 1; i < n; i += 1) if (Math.abs(A[i][k]) > Math.abs(A[pivot][k])) pivot = i;
    if (Math.abs(A[pivot][k]) < 1e-14) throw new Error("free stiffness matrix is singular or ill-conditioned");
    [A[k], A[pivot]] = [A[pivot], A[k]];
    [b[k], b[pivot]] = [b[pivot], b[k]];

    for (let i = k + 1; i < n; i += 1) {
      const factor = A[i][k] / A[k][k];
      A[i][k] = 0;
      for (let j = k + 1; j < n; j += 1) A[i][j] -= factor * A[k][j];
      b[i] -= factor * b[k];
    }
  }

  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i -= 1) {
    let rhs = b[i];
    for (let j = i + 1; j < n; j += 1) rhs -= A[i][j] * x[j];
    x[i] = rhs / A[i][i];
  }
  return x;
}
