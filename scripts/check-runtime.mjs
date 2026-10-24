import { pathToFileURL } from 'node:url';

const nodeFloors = new Map([
  [24, [24, 22, 1]],
]);

function release(version) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version);
  return match ? match.slice(1).map(Number) : null;
}

function atLeast(version, floor) {
  for (let index = 0; index < floor.length; index += 1) {
    if (version[index] !== floor[index]) return version[index] > floor[index];
  }
  return true;
}

export function runtimeProblems({ node }) {
  const problems = [];
  const nodeRelease = release(node);
  const nodeFloor = nodeRelease && nodeFloors.get(nodeRelease[0]);
  if (!nodeFloor || !atLeast(nodeRelease, nodeFloor)) {
    problems.push(`Node ${node} requires a supported fixed release: 24.22.1 or newer in the supported Node 24 line.`);
  }
  return problems;
}

export function checkRuntimes() {
  const versions = { node: process.versions.node };
  const problems = runtimeProblems(versions);
  if (problems.length) throw new Error(`CVE-2026-111497 runtime check failed:\n${problems.join('\n')}`);
  process.stdout.write(`Patched Node verified: ${versions.node}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  checkRuntimes();
}
