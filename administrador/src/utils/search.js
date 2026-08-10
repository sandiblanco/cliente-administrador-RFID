export function filterRunners(runners, query) {
  const q = query.trim().toLowerCase()
  if (!q) {
    return runners
  }
  return runners.filter((runner) => {
    if (String(runner.id).toLowerCase() === q) {
      return true
    }
    return runner.name.toLowerCase().includes(q)
  })
}
