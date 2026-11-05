import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import source from '../data/s12.json'
import MissionDetails from '../src/components/MissionDetails.vue'
import { buildStages } from '../src/missions'

it('lists rewards with formatted quantities for both separators used in mission data', () => {
  const task = buildStages(source.data.departmentMissionLine)[0]!.groups[0]!.tasks[0]!
  const wrapper = mount(MissionDetails, {
    props: {
      mission: {
        ...task,
        taskReward: [
          { reward: 'Опыт операций x1250' },
          { reward: 'Подсумок 3×3 на 1 день × 1' },
          { reward: 'Хафк-монеты x200000' },
        ],
      },
      complete: false,
      number: '01.01',
    },
  })
  expect(wrapper.findAll('.reward-list .reward-name').map((item) => item.text())).toEqual([
    'Опыт операций',
    'Подсумок 3×3 на 1 день',
    'Хафк-монеты',
  ])
  expect(wrapper.findAll('.reward-quantity').map((item) => item.text())).toEqual([
    '×1\u00a0250',
    '×1',
    '×200\u00a0000',
  ])
  wrapper.unmount()
})
