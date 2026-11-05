<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { buildStages, countCompleted, type RawMission } from './missions'
import { loadProgress, saveProgress } from './progress'
import StageNav from './components/StageNav.vue'
import MissionList from './components/MissionList.vue'
import MissionDetails from './components/MissionDetails.vue'
import UiIcon from './components/UiIcon.vue'

const sources = import.meta.glob<{
  data: { departmentMissionTitle: string; departmentMissionLine: Record<string, RawMission[]> }
}>('../data/s*.json', { eager: true, import: 'default' })

const seasons = ref(
  Object.entries(sources)
    .map(([path, source]) => {
      const id = path.split('/').pop()!.replace('.json', '')
      const title = source.data.departmentMissionTitle.split(' — ')[0]!
      const stages = buildStages(source.data.departmentMissionLine)
      const tasks = stages.flatMap((stage) => stage.groups.flatMap((group) => group.tasks))
      return {
        id,
        title: title.replace(/^S/, 'Сезон '),
        stages,
        tasks,
        ...loadProgress(new Set(tasks.map((task) => task.id)), id),
      }
    })
    .sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true })),
)
const activeSeasonId = ref(seasons.value[0]!.id)
const season = computed(() => seasons.value.find((item) => item.id === activeSeasonId.value)!)
const stages = computed(() => season.value.stages)
const allTasks = computed(() => season.value.tasks)
const completed = computed({
  get: () => season.value.completed,
  set: (value) => {
    season.value.completed = value
  },
})
const storageError = computed({
  get: () => season.value.error,
  set: (value) => {
    season.value.error = value
  },
})
const activeStageId = ref(stages.value[0]!.id)
const expandedGroupId = ref<string | null>(stages.value[0]!.groups[0]!.id)
const selectedTaskId = ref(stages.value[0]!.groups[0]!.tasks[0]!.id)
const mobileDetail = ref(false)
const details = ref<InstanceType<typeof MissionDetails> | null>(null)
const missionList = ref<InstanceType<typeof MissionList> | null>(null)

const stage = computed(() => stages.value.find((item) => item.id === activeStageId.value)!)
const selectedGroup = computed(
  () =>
    stage.value.groups.find((group) =>
      group.tasks.some((task) => task.id === selectedTaskId.value),
    )!,
)
const mission = computed(
  () => selectedGroup.value.tasks.find((task) => task.id === selectedTaskId.value)!,
)
const totalCompleted = computed(() => countCompleted(allTasks.value, completed.value))
const progressPercent = computed(() => Math.round((totalCompleted.value / allTasks.value.length) * 100))
const missionNumber = computed(() => {
  const groupIndex = stage.value.groups.indexOf(selectedGroup.value) + 1
  const taskIndex = selectedGroup.value.tasks.indexOf(mission.value) + 1
  return `${String(groupIndex).padStart(2, '0')}.${String(taskIndex).padStart(2, '0')}`
})

watch(
  selectedTaskId,
  () => {
    const panel = details.value?.$el as HTMLElement | undefined
    panel?.querySelector('.detail-scroll')?.scrollTo({ top: 0 })
  },
  { flush: 'post' },
)

function selectSeason(id: string) {
  activeSeasonId.value = id
  selectStage(stages.value[0]!.id)
}

function selectStage(id: string) {
  activeStageId.value = id
  expandedGroupId.value = stage.value.groups[0]!.id
  selectedTaskId.value = stage.value.groups[0]!.tasks[0]!.id
  mobileDetail.value = false
}

function toggleGroup(id: string) {
  if (expandedGroupId.value === id) {
    expandedGroupId.value = null
    return
  }
  expandedGroupId.value = id
  selectedTaskId.value = stage.value.groups.find((group) => group.id === id)!.tasks[0]!.id
}

async function selectTask(id: string) {
  selectedTaskId.value = id
  mobileDetail.value = true
  await nextTick()
  const panel = details.value?.$el as HTMLElement | undefined
  if (window.matchMedia('(max-width: 767px)').matches) panel?.focus()
}

async function showTaskList() {
  mobileDetail.value = false
  await nextTick()
  const panel = missionList.value?.$el as HTMLElement | undefined
  panel?.querySelector<HTMLButtonElement>('.mission-button[aria-current="true"]')?.focus()
}

function toggleCompleted() {
  const next = new Set(completed.value)
  if (next.has(mission.value.id)) next.delete(mission.value.id)
  else next.add(mission.value.id)
  completed.value = next
  storageError.value = saveProgress(next, activeSeasonId.value)
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="./" aria-label="Delta Force — главная"
        ><span class="brand-symbol" aria-hidden="true"><i></i><i></i><i></i></span
        ><span>DELTA FORCE<span class="brand-caption">Для Китайской версии</span></span></a
      >
      <nav class="section-nav" aria-label="Сезоны">
        <button
          v-for="item in seasons"
          :key="item.id"
          class="topbar-section"
          :class="{ 'is-active': activeSeasonId === item.id }"
          :aria-current="activeSeasonId === item.id ? 'page' : undefined"
          :aria-label="item.title"
          @click="selectSeason(item.id)"
        >
          <UiIcon name="grid" :size="16" /><span>{{ item.title }}</span>
        </button>
      </nav>
    </header>
    <main>
      <header class="page-heading">
        <div>
          <p class="eyebrow"><span class="live-dot"></span>Операции / {{ season.title }}</p>
          <h1>
            {{ activeStageId === 'destinyContract' ? 'Контракты' : 'План действий'
            }}<span class="heading-slashes" aria-hidden="true">///</span>
          </h1>
        </div>
        <div class="season-progress">
          <div>
            <span>Всего выполнено</span
            ><strong
              >{{ totalCompleted }} <span>/ {{ allTasks.length }}</span></strong
            >
          </div>
          <div
            class="progress-track"
            role="progressbar"
            aria-label="Всего выполнено заданий"
            :aria-valuenow="totalCompleted"
            :aria-valuemax="allTasks.length"
            :aria-valuemin="0"
          >
            <span :style="{ width: `${progressPercent}%` }"></span>
          </div>
        </div>
      </header>
      <p v-if="storageError" class="storage-warning" role="alert">
        <UiIcon name="warning" :size="18" />{{ storageError }}
      </p>
      <div class="workspace" :class="{ 'show-mobile-detail': mobileDetail }">
        <StageNav
          :stages="stages"
          :active-id="activeStageId"
          :completed="completed"
          @select="selectStage"
        />
        <MissionList
          ref="missionList"
          :stage="stage"
          :expanded-id="expandedGroupId"
          :selected-id="selectedTaskId"
          :completed="completed"
          @toggle="toggleGroup"
          @select="selectTask"
        />
        <MissionDetails
          ref="details"
          :mission="mission"
          :complete="completed.has(mission.id)"
          :number="missionNumber"
          @toggle="toggleCompleted"
          @back="showTaskList"
        />
      </div>
    </main>
    <footer class="app-footer">
      <span><span class="live-dot"></span>Локальный трекер</span
      ><span>Отмечай выполненное. Планируй следующую операцию.</span
      ><span class="small-code">G.T.I. / {{ season.id.toUpperCase() }}</span>
    </footer>
  </div>
</template>
