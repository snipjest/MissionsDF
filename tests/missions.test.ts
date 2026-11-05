import { describe, expect, it } from 'vitest'
import data from '../data/s12.json'
import { buildStages, countCompleted, getStageProgress, textLines } from '../src/missions'

describe('season missions', () => {
  it('collects full parent chains and excludes stage and group headers', () => {
    const stages = buildStages(data.data.departmentMissionLine)
    expect(stages).toHaveLength(5)
    expect(stages.map((stage) => stage.groups.flatMap((group) => group.tasks).length)).toEqual([
      27, 43, 50, 6, 7,
    ])
    expect(stages[0]!.groups[1]!.tasks.map((task) => task.key)).toEqual([11, 12, 13, 14, 15])
    expect(stages[0]!.groups[0]!.tasks[0]!.taskName).toBe('Возвращение в строй')
  })

  it('keeps all fate contracts as standalone tasks', () => {
    const stage = buildStages(data.data.departmentMissionLine)[4]!
    expect(stage.title).toBe('Контракты')
    expect(stage.groups).toHaveLength(1)
    expect(stage.groups[0]!.tasks.map((task) => task.key)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('scopes completion identifiers to their stage', () => {
    const stages = buildStages(data.data.departmentMissionLine)
    const a = stages[0]!.groups[0]!.tasks[0]!
    const b = stages[1]!.groups[0]!.tasks[0]!
    expect(a.key).toBe(b.key)
    expect(a.id).not.toBe(b.id)
    const completed = new Set([a.id])
    expect(countCompleted(stages[0]!.groups[0]!.tasks, completed)).toBe(1)
    expect(countCompleted(stages[1]!.groups[0]!.tasks, completed)).toBe(0)
  })

  it('splits line breaks into text without executing embedded HTML', () => {
    expect(textLines('Условия<br>*Первое<br />*Второе')).toEqual(['Условия', '*Первое', '*Второе'])
    expect(textLines('')).toEqual([])
    expect(textLines('<img src=x onerror=alert(1)>')).toEqual(['<img src=x onerror=alert(1)>'])
  })
  it('groups amounts in objectives and conditions without changing equipment names', () => {
    expect(textLines('Доход ≥1000000 хафк-монет<br>Стоимость ≥400000')).toEqual([
      'Доход ≥1\u00a0000\u00a0000 хафк-монет',
      'Стоимость ≥400\u00a0000',
    ])
    expect(textLines('Уничтожьте H1000 из AN94 патронами 5.45x39')).toEqual([
      'Уничтожьте H1000 из AN94 патронами 5.45x39',
    ])
  })
  it('reads advancement star targets from the next stage conditions', () => {
    const stages = buildStages(data.data.departmentMissionLine)
    expect(stages.map((stage) => stage.starsToAdvance)).toEqual([6, 12, 14, null, null])
    expect(stages[0]!.groups.map((group) => group.stars)).toEqual([0, 3, 3, 2, 2])
  })

  it('awards stars only for complete groups and keeps main progress separate', () => {
    const stage = buildStages(data.data.departmentMissionLine)[0]!
    const completed = new Set(
      [11, 12, 13, 14, 15, 17, 18, 19, 20, 21].map((key) => `actionPlanPart_01:${key}`),
    )
    expect(getStageProgress(stage, completed)).toEqual({ mainCompleted: 0, mainTotal: 7, stars: 6 })
    completed.delete('actionPlanPart_01:21')
    expect(getStageProgress(stage, completed).stars).toBe(3)
    completed.add('actionPlanPart_01:3')
    expect(getStageProgress(stage, completed).mainCompleted).toBe(1)
  })
})
