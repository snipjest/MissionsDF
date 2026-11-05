export interface RawMission {
  key: number
  parent?: number
  taskName: string
  taskType: string
  taskMap: string
  taskCategory: string
  taskForced: string
  taskObjective: { objective: string }[]
  taskReward: { reward: string }[]
  taskGuidance: unknown[]
  pic: string
}

export interface Mission extends RawMission {
  id: string
}

export interface MissionGroup {
  id: string
  title: string
  type: string
  stars: number
  tasks: Mission[]
}

export interface Stage {
  id: string
  title: string
  conditions: string[]
  starsToAdvance: number | null
  groups: MissionGroup[]
}

// Parent points to the previous task, not always to the group header.
export function buildStages(sections: Record<string, RawMission[]>): Stage[] {
  const stages = Object.entries(sections).map<Stage>(([id, records]) => {
    if (id === 'destinyContract') {
      return {
        id,
        title: 'Контракты',
        conditions: [],
        starsToAdvance: null,
        groups: [
          {
            id: `${id}:contracts`,
            title: 'Контракты',
            type: 'Особые задания',
            stars: 0,
            tasks: records.map((task) => ({ ...task, id: `${id}:${task.key}` })),
          },
        ],
      }
    }

    const root = records.find((task) => task.parent === undefined)!
    const headers = records.filter((task) => task.parent === root.key)
    const byKey = new Map(records.map((task) => [task.key, task]))
    const groups = new Map(
      headers.map((header) => [
        header.key,
        {
          id: `${id}:${header.key}`,
          title: header.taskName,
          type: header.taskType,
          stars: header.taskReward.reduce((total, item) => {
            const amount = item.reward.match(/★\s*x(\d+)/)?.[1]
            return total + (amount ? Number(amount) : 0)
          }, 0),
          tasks: [] as Mission[],
        },
      ]),
    )

    for (const task of records) {
      if (task.key === root.key || groups.has(task.key)) continue
      let parent = task.parent
      while (parent !== undefined && !groups.has(parent)) {
        parent = byKey.get(parent)?.parent
      }
      if (parent !== undefined) {
        groups.get(parent)!.tasks.push({ ...task, id: `${id}:${task.key}` })
      }
    }

    return {
      id,
      title: root.taskName,
      conditions: textLines(root.taskForced),
      starsToAdvance: null,
      groups: [...groups.values()],
    }
  })

  for (const [index, stage] of stages.entries()) {
    const target = stages[index + 1]?.conditions.join(' ').match(/(\d+)\s*★/)?.[1]
    stage.starsToAdvance = target ? Number(target) : null
  }
  return stages
}

export function getStageProgress(stage: Stage, completed: ReadonlySet<string>) {
  const mainTasks = stage.groups
    .filter((group) => group.type === 'Основная сюжетная линия сезона')
    .flatMap((group) => group.tasks)
  const stars = stage.groups.reduce((total, group) => {
    const finished = group.tasks.length > 0 && group.tasks.every((task) => completed.has(task.id))
    return total + (finished ? group.stars : 0)
  }, 0)
  return { mainCompleted: countCompleted(mainTasks, completed), mainTotal: mainTasks.length, stars }
}

export function countCompleted(tasks: Mission[], completed: ReadonlySet<string>): number {
  return tasks.filter((task) => completed.has(task.id)).length
}

export function formatNumbers(text: string): string {
  return text.replace(/\b\d{4,}\b/g, (value) => Number(value).toLocaleString('ru-RU'))
}

export function textLines(text: string): string[] {
  return text
    .split(/<br\s*\/?>|\n/i)
    .map((line) => formatNumbers(line.trim()))
    .filter(Boolean)
}
