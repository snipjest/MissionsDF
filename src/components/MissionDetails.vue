<script setup lang="ts">
import { computed } from 'vue'
import { formatNumbers, textLines, type Mission } from '../missions'
import UiIcon from './UiIcon.vue'

const props = defineProps<{ mission: Mission; complete: boolean; number: string }>()
defineEmits<{ toggle: []; back: [] }>()

const rewards = computed(() =>
  props.mission.taskReward.map(({ reward }) => {
    const amount = reward.match(/\s*[x×]\s*(\d+)$/)
    return {
      name: formatNumbers(amount ? reward.slice(0, amount.index) : reward),
      quantity: amount ? formatNumbers(amount[1]!) : null,
    }
  }),
)
</script>

<template>
  <section class="mission-details" aria-label="Подробности задания" tabindex="-1">
    <div class="detail-scroll">
      <button class="back-button" @click="$emit('back')">
        <UiIcon name="arrow" :size="16" /> К заданиям
      </button>
      <div class="detail-meta">
        <span class="eyebrow"
          >Досье задания <span class="detail-code">/ {{ number }}</span></span
        ><span class="mission-status" :class="{ 'is-complete': complete }"
          ><UiIcon :name="complete ? 'check' : 'target'" :size="14" />{{
            complete ? 'Выполнено' : 'Не выполнено'
          }}</span
        >
      </div>
      <h2 class="sr-only">{{ mission.taskName }}</h2>
      <div v-if="mission.taskForced" class="mission-conditions">
        <UiIcon name="warning" :size="18" />
        <div>
          <h3>Особые условия</h3>
          <p v-for="(line, index) in textLines(mission.taskForced)" :key="index">
            {{ line.replace(/^\*/, '') }}
          </p>
        </div>
      </div>
      <div class="section-label">
        <h3>Цели задания</h3>
        <span
          >{{ String(mission.taskObjective.length).padStart(2, '0') }}
          {{
            mission.taskObjective.length === 1
              ? 'цель'
              : mission.taskObjective.length < 5
                ? 'цели'
                : 'целей'
          }}</span
        >
      </div>
      <ol class="objective-list">
        <li v-for="(objective, index) in mission.taskObjective" :key="index" class="objective-item">
          <span class="objective-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <div>
            <p v-for="(line, lineIndex) in textLines(objective.objective)" :key="lineIndex">
              {{ line }}
            </p>
          </div>
        </li>
      </ol>
      <section v-if="mission.taskReward.length" class="rewards-section" aria-label="Награды">
        <div class="section-label">
          <h3>Награды за выполнение</h3>
          <UiIcon name="box" :size="16" />
        </div>
        <ul class="reward-list">
          <li v-for="(item, index) in rewards" :key="index" class="reward-row">
            <span class="reward-name">{{ item.name }}</span>
            <span v-if="item.quantity" class="reward-quantity">×{{ item.quantity }}</span>
          </li>
        </ul>
      </section>
      <div class="detail-footer">
        <span class="category-text">{{ mission.taskCategory }}</span
        ><span class="small-code">GTI / S12</span>
      </div>
    </div>
    <div class="detail-action">
      <div class="completion-note">
        <UiIcon name="database" :size="16" /><span>Отметка сохраняется<br />в этом браузере</span>
      </div>
      <button
        class="complete-button"
        :class="{ 'is-complete': complete }"
        :aria-label="complete ? 'Отменить выполнение задания' : 'Отметить задание выполненным'"
        :aria-pressed="complete"
        @click="$emit('toggle')"
      >
        <UiIcon name="check" :size="20" />{{ complete ? 'Выполнено' : 'Отметить выполненным'
        }}<span v-if="complete" class="undo-label">Отменить</span>
      </button>
    </div>
  </section>
</template>
