export function loadProgress(knownIds: ReadonlySet<string>, seasonId: string): {
  completed: Set<string>
  error: string | null
} {
  try {
    const stored = window.localStorage.getItem(`missionsdf:${seasonId}:completed`)
    if (stored === null) return { completed: new Set(), error: null }
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed) || !parsed.every((id) => typeof id === 'string')) {
      return {
        completed: new Set(),
        error: 'Сохранённый прогресс повреждён. Начинаем с пустых отметок.',
      }
    }
    return { completed: new Set(parsed.filter((id) => knownIds.has(id))), error: null }
  } catch {
    return {
      completed: new Set(),
      error: 'Не удалось загрузить прогресс из браузера. Отметки доступны в текущей сессии.',
    }
  }
}

export function saveProgress(completed: ReadonlySet<string>, seasonId: string): string | null {
  try {
    window.localStorage.setItem(`missionsdf:${seasonId}:completed`, JSON.stringify([...completed]))
    return null
  } catch {
    return 'Не удалось сохранить прогресс. Отметки останутся только до закрытия страницы.'
  }
}
