<script setup lang="ts">
import { computed } from 'vue'
import { countCompleted, getStageProgress, type Stage } from '../missions'
import UiIcon from './UiIcon.vue'

const props = defineProps<{ stages: Stage[]; activeId: string; completed: ReadonlySet<string> }>()
defineEmits<{ select: [id: string] }>()

const entries = computed(() =>
  props.stages.map((stage) => ({
    stage,
    progress: getStageProgress(stage, props.completed),
  })),
)
</script>

<template>
  <nav class="stage-nav" aria-label="Этапы сезона">
    <div class="column-heading">
      <span>Этапы операции</span><span class="small-code">01—04</span>
    </div>
    <div class="stage-buttons">
      <button
        v-for="({ stage, progress }, index) in entries"
        :key="stage.id"
        class="stage-button"
        :class="{
          'is-active': activeId === stage.id,
          'is-contract': stage.id === 'destinyContract',
        }"
        :aria-label="`Открыть этап: ${stage.title}`"
        :aria-current="activeId === stage.id ? 'step' : undefined"
        @click="$emit('select', stage.id)"
      >
        <span class="stage-number"
          ><UiIcon v-if="stage.id === 'destinyContract'" name="shield" :size="23" /><template
            v-else
            >{{ String(index + 1).padStart(2, '0') }}</template
          ></span
        >
        <span class="stage-info">
          <span class="stage-title">{{ stage.title.replace(/^[^:]+: /, '') }}</span>
          <span v-if="progress.mainTotal" class="stage-advance">
            <span
              class="stage-main"
              :aria-label="`Сюжетные миссии: ${progress.mainCompleted} из ${progress.mainTotal}`"
              title="Сюжетные миссии"
              ><UiIcon name="target" :size="16" />
              <strong>{{ progress.mainCompleted }} / {{ progress.mainTotal }}</strong></span
            >
            <span
              v-if="stage.starsToAdvance !== null"
              class="stage-stars"
              :class="{ 'is-ready': progress.stars >= stage.starsToAdvance }"
              :aria-label="`Звёзды для перехода: ${progress.stars} из ${stage.starsToAdvance}`"
            >
              <UiIcon name="star" :size="16" /><strong
                >{{ progress.stars }} / {{ stage.starsToAdvance }}</strong
              >
            </span>
          </span>
          <span class="stage-count"
            >Всего:
            {{
              countCompleted(
                stage.groups.flatMap((group) => group.tasks),
                completed,
              )
            }}
            / {{ stage.groups.flatMap((group) => group.tasks).length }}
          </span>
        </span>
        <UiIcon name="chevron" class="stage-chevron" :size="14" />
      </button>
    </div>
    <div class="nav-note">
      <UiIcon name="database" :size="16" />
      <p>Личный прогресс<br /><span>Хранится в этом браузере</span></p>
    </div>
  </nav>
</template>
