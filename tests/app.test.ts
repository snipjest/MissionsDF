import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '../src/App.vue'

let wrapper: VueWrapper
beforeEach(() => localStorage.clear())
afterEach(() => wrapper?.unmount())

describe('mission navigation', () => {
  it('opens the first playable mission and retains selection when completed', async () => {
    wrapper = mount(App)
    expect(wrapper.get('.mission-details h2').text()).toBe('Возвращение в строй')
    await wrapper.get('button[aria-label="Отметить задание выполненным"]').trigger('click')
    expect(wrapper.get('.mission-details h2').text()).toBe('Возвращение в строй')
    expect(
      wrapper.get('button[aria-label="Отменить выполнение задания"]').attributes('aria-pressed'),
    ).toBe('true')
    expect(wrapper.get('.stage-nav button[aria-current="step"]').text()).toContain('1 / 27')
  })

  it('opens the first incomplete mission after reloading and reopening a stage or group', async () => {
    wrapper = mount(App)
    await wrapper.get('button[aria-label="Отметить задание выполненным"]').trigger('click')
    wrapper.unmount()
    wrapper = mount(App)
    expect(wrapper.get('.mission-details h2').text()).toBe('Первые успехи')

    await wrapper.get('button[aria-label="Открыть группу: Трудно прощаться"]').trigger('click')
    await wrapper.get('.group-toggle').trigger('click')
    expect(wrapper.get('.mission-details h2').text()).toBe('Первые успехи')

    await wrapper.get('button[aria-label="Открыть этап: Контракты"]').trigger('click')
    await wrapper.get('.stage-button').trigger('click')
    expect(wrapper.get('.mission-details h2').text()).toBe('Первые успехи')
  })

  it('skips completed groups and stages, but still allows opening them', async () => {
    wrapper = mount(App)
    const tasks = wrapper.findAll('.mission-button')
    for (const task of tasks.slice(0, 7)) {
      await task.trigger('click')
      await wrapper.get('button[aria-label="Отметить задание выполненным"]').trigger('click')
    }
    await wrapper.get('.stage-button').trigger('click')
    expect(wrapper.get('.mission-details h2').text()).toBe('Тонкая настройка — 1')
    expect(wrapper.get('.group-toggle[aria-expanded="true"]').text()).toContain('Операция по распределению ресурсов')

    await wrapper.get('.group-toggle').trigger('click')
    expect(wrapper.get('.mission-details h2').text()).toBe('Возвращение в строй')

    for (const task of tasks.slice(7)) {
      await task.trigger('click')
      await wrapper.get('button[aria-label="Отметить задание выполненным"]').trigger('click')
    }
    wrapper.unmount()
    wrapper = mount(App)
    expect(wrapper.get('.mission-details h2').text()).toBe('В поисках врача')

    await wrapper.get('.stage-button').trigger('click')
    expect(wrapper.get('.mission-details h2').text()).toBe('Возвращение в строй')
    await wrapper.get('.section-nav button').trigger('click')
    expect(wrapper.get('.mission-details h2').text()).toBe('В поисках врача')
  })

  it('selects the first group and mission when changing stages', async () => {
    wrapper = mount(App)
    await wrapper
      .get('button[aria-label="Открыть этап: Второй этап: Пламя на ветру"]')
      .trigger('click')
    expect(wrapper.get('.mission-details h2').text()).toBe('В поисках врача')
    expect(wrapper.findAll('.group-toggle[aria-expanded="true"]')).toHaveLength(1)
  })

  it('keeps only one group expanded and opens its first mission', async () => {
    wrapper = mount(App)
    await wrapper.get('button[aria-label="Открыть группу: Трудно прощаться"]').trigger('click')
    expect(wrapper.findAll('.group-toggle[aria-expanded="true"]')).toHaveLength(1)
    expect(wrapper.get('.mission-details h2').text()).toBe('Трудно прощаться — 1')
  })

  it('loads the completion mark on a fresh mount and allows undo', async () => {
    wrapper = mount(App)
    await wrapper.get('button[aria-label="Отметить задание выполненным"]').trigger('click')
    wrapper.unmount()
    wrapper = mount(App)
    expect(wrapper.get('.mission-button[aria-current="true"]').classes()).not.toContain('is-complete')
    await wrapper.findAll('.mission-button')[0]!.trigger('click')
    await wrapper.get('button[aria-label="Отменить выполнение задания"]').trigger('click')
    expect(wrapper.get('.stage-nav button[aria-current="step"]').text()).toContain('0 / 27')
  })

  it('opens a fate contract without treating its first task as a stage header', async () => {
    wrapper = mount(App)
    await wrapper.get('button[aria-label="Открыть этап: Контракты"]').trigger('click')
    expect(wrapper.get('.mission-details h2').text()).toBe(
      'Абсолютный ноль: Покорение ключевых операций',
    )
    expect(wrapper.findAll('.mission-button')).toHaveLength(7)
    expect(wrapper.findAll('.section-nav button')).toHaveLength(1)
    expect(wrapper.get('.section-nav').attributes('aria-label')).toBe('Сезоны')
    expect(wrapper.get('.section-nav button[aria-current="page"]').text()).toBe(
      'Сезон 12: Аврора',
    )
    await wrapper.get('button[aria-label="Отметить задание выполненным"]').trigger('click')
    await wrapper.get('.section-nav button[aria-label="Сезон 12: Аврора"]').trigger('click')
    expect(wrapper.get('.mission-details h2').text()).toBe('Возвращение в строй')
    expect(wrapper.findAll('.stage-stars')).toHaveLength(3)
    await wrapper.get('button[aria-label="Открыть этап: Контракты"]').trigger('click')
    expect(wrapper.get('.mission-button[aria-current="true"]').classes()).not.toContain('is-complete')
    expect(wrapper.findAll('.mission-button')[0]!.classes()).toContain('is-complete')
  })
  it.each(['Открыть этап: Второй этап: Пламя на ветру', 'Открыть группу: Трудно прощаться'])(
    'starts new mission details at the top: %s',
    async (label) => {
      wrapper = mount(App)
      const scrollArea = wrapper.get('.detail-scroll').element
      scrollArea.scrollTop = 300
      await wrapper.get(`button[aria-label="${label}"]`).trigger('click')
      expect(scrollArea.scrollTop).toBe(0)
    },
  )

  it('returns keyboard focus to the selected mission after leaving details', async () => {
    wrapper = mount(App, { attachTo: document.body })
    const task = wrapper.findAll('.mission-button')[1]!
    await task.trigger('click')
    const back = wrapper.get<HTMLButtonElement>('.back-button')
    back.element.focus()
    await back.trigger('click')
    expect(document.activeElement).toBe(task.element)
  })
  it('shows advancement targets and distinguishes stars from mandatory main missions', () => {
    localStorage.setItem(
      'missionsdf:s12:completed',
      JSON.stringify(
        [11, 12, 13, 14, 15, 17, 18, 19, 20, 21].map((key) => `actionPlanPart_01:${key}`),
      ),
    )
    wrapper = mount(App)
    const selectedStage = wrapper.get('.stage-button[aria-current="step"]')
    expect(selectedStage.get('.stage-stars').text()).toContain('6 / 6')
    expect(selectedStage.get('.stage-main').text()).toContain('0 / 7')
    expect(wrapper.findAll('.stage-stars').map((item) => item.text())).toEqual([
      '6 / 6',
      '0 / 12',
      '0 / 14',
    ])
    expect(wrapper.get('.group-completed').text()).toBe('Выполнено 0/7')
    expect(wrapper.findAll('.group-reward.is-earned')).toHaveLength(2)
  })
})
