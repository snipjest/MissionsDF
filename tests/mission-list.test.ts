import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import source from '../data/s12.json'
import MissionList from '../src/components/MissionList.vue'
import { buildStages } from '../src/missions'

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
