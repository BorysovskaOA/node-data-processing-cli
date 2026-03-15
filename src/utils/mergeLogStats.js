export const INITIAL_LOG_STATS = {
  total: 0,
  levels: { INFO: 0, WARN: 0, ERROR: 0 },
  status: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
  paths: {},
  avgResponseTimeMs: 0
};

export const mergeStats = (stat1, stat2) => {
  const combinesStats = structuredClone(INITIAL_LOG_STATS);

  combinesStats.total = stat1.total + stat2.total;
  combinesStats.avgResponseTimeMs = (stat1.avgResponseTimeMs + stat2.avgResponseTimeMs) / 2

  Object.keys(combinesStats.levels).forEach((l) => {
    combinesStats.levels[l] = stat1.levels[l] + stat2.levels[l]
  })

  Object.keys(combinesStats.status).forEach((s) => {
    combinesStats.status[s] = stat1.status[s] + stat2.status[s]
  });

  const pathsSet = new Set([...Object.keys(stat1.paths), ...Object.keys(stat2.paths)]);

  Array.from(pathsSet).forEach((p) => {
    combinesStats.paths[p] = (stat1.paths[p] || 0) + (stat2.paths[p] || 0)
  });

  return combinesStats;
}
