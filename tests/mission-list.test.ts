import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import source from '../data/s12.json'
import MissionList from '../src/components/MissionList.vue'
import { buildStages } from '../src/missions'

it('marks only missions that require crafting items', () => {
  const markedIds: string[] = []
  for (const stage of buildStages(source.data.departmentMissionLine)) {
    const wrapper = mount(MissionList, {
      props: { stage, expandedId: null, selectedId: '', completed: new Set<string>() },
    })
    const tasks = stage.groups.flatMap((group) => group.tasks)
    wrapper.findAll('.mission-button').forEach((button, index) => {
      if (button.find('.task-craft-label').exists()) {
        expect(button.find('.task-craft-label').text()).toBe('Крафт')
        markedIds.push(tasks[index]!.id)
      }
    })
    wrapper.unmount()
  }
  expect(markedIds).toEqual([
    'actionPlanPart_01:29',
    'actionPlanPart_01:30',
    'actionPlanPart_01:31',
    'actionPlanPart_01:32',
    'actionPlanPart_01:33',
  ])
})

it('marks missions that require handing over items in their objectives', () => {
  const markedNames: string[] = []
  for (const stage of buildStages(source.data.departmentMissionLine)) {
    const wrapper = mount(MissionList, {
      props: { stage, expandedId: null, selectedId: '', completed: new Set<string>() },
    })
    for (const button of wrapper.findAll('.mission-button')) {
      if (button.find('.task-transfer-label').exists()) {
        markedNames.push(button.find('.task-label').text().replace('Передача предметов', '').trim())
      }
    }
    wrapper.unmount()
  }
  expect(markedNames).toEqual([
    'Фронтовая разведка',
    'Найти и уничтожить — 1',
    'Контроль и обеспечение — 1',
    'Золотой стрелок — 1',
    'Золотой стрелок — 3',
    'Золотой стрелок — 5',
  ])
})
