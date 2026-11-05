import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadProgress, saveProgress } from '../src/progress'

const STORAGE_KEY = 'missionsdf:s12:completed'
const knownIds = new Set(['actionPlanPart_01:3', 'actionPlanPart_02:3'])

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('browser progress', () => {
  it('keeps completion separate for each season', () => {
    saveProgress(new Set(['actionPlanPart_01:3']), 's12')
    expect(loadProgress(knownIds, 's13').completed.size).toBe(0)
    saveProgress(new Set(['actionPlanPart_02:3']), 's13')
    expect(loadProgress(knownIds, 's12').completed).toEqual(new Set(['actionPlanPart_01:3']))
    expect(loadProgress(knownIds, 's13').completed).toEqual(new Set(['actionPlanPart_02:3']))
  })

  it('starts with no completed missions', () => {
    expect(loadProgress(knownIds, 's12')).toEqual({ completed: new Set(), error: null })
  })

  it('persists completion and its reversal after a new load', () => {
    expect(saveProgress(new Set(['actionPlanPart_01:3']), 's12')).toBeNull()
    expect(loadProgress(knownIds, 's12').completed).toEqual(new Set(['actionPlanPart_01:3']))
    saveProgress(new Set(), 's12')
    expect(loadProgress(knownIds, 's12').completed.size).toBe(0)
  })

  it('ignores identifiers that are no longer in the current data', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['actionPlanPart_01:3', 'unknown:1']))
    expect(loadProgress(knownIds, 's12').completed).toEqual(new Set(['actionPlanPart_01:3']))
  })

  it.each(['broken JSON', '{}', '[1, null]'])('reports corrupted stored data: %s', (value) => {
    localStorage.setItem(STORAGE_KEY, value)
    expect(loadProgress(knownIds, 's12').completed.size).toBe(0)
    expect(loadProgress(knownIds, 's12').error).toBeTruthy()
  })

  it('reports an unavailable storage getter without crashing', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('Denied')
    })
    expect(loadProgress(knownIds, 's12').error).toBeTruthy()
    expect(saveProgress(new Set(), 's12')).toBeTruthy()
  })

  it('reports storage quota exhaustion', () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('Quota')
    })
    expect(saveProgress(new Set(['actionPlanPart_01:3']), 's12')).toBeTruthy()
  })
})
