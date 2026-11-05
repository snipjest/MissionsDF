<script setup lang="ts">
import { countCompleted, type Stage } from '../missions'
import UiIcon from './UiIcon.vue'

defineProps<{
  stage: Stage
  expandedId: string | null
  selectedId: string
  completed: ReadonlySet<string>
}>()
defineEmits<{ toggle: [id: string]; select: [id: string] }>()
</script>

<template>
  <section class="mission-list" aria-label="Группы и задания">
    <div class="column-heading">
      <span>Группы заданий</span
      ><span class="small-code">{{ String(stage.groups.length).padStart(2, '0') }}</span>
    </div>
    <div class="group-scroll">
      <div v-if="stage.conditions.length" class="stage-conditions">
        <UiIcon name="warning" :size="16" />
        <div>
          <p v-for="(line, index) in stage.conditions" :key="index">
            {{ line.replace(/^\*/, '') }}
          </p>
          <span>Все задания доступны для просмотра</span>
        </div>
      </div>
      <section
        v-for="(group, index) in stage.groups"
        :key="group.id"
        class="mission-group"
        :class="{ 'is-expanded': expandedId === group.id }"
      >
        <button
          class="group-toggle"
          :aria-label="`Открыть группу: ${group.title}`"
          :aria-expanded="expandedId === group.id"
          :aria-controls="`group-${group.id}`"
          @click="$emit('toggle', group.id)"
        >
          <span class="group-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="group-info"
            ><span class="group-kind">{{ group.type.replace(' сезона', '') }}</span
            ><span class="group-title">{{ group.title }}</span
            ><span class="group-progress">
              <span class="group-completed"
                >Выполнено {{ countCompleted(group.tasks, completed) }}/{{
                  group.tasks.length
                }}</span
              >
              <span
                v-if="group.stars"
                class="group-reward"
                :class="{
                  'is-earned': countCompleted(group.tasks, completed) === group.tasks.length,
                }"
                :aria-label="`Звёзды за группу: ${group.stars}`"
              >
                <UiIcon name="star" :size="16" /><strong>{{ group.stars }}</strong>
              </span>
            </span></span
          >
          <UiIcon name="chevron" class="group-chevron" :size="15" />
        </button>
        <div v-show="expandedId === group.id" :id="`group-${group.id}`" class="group-tasks">
          <button
            v-for="(task, taskIndex) in group.tasks"
            :key="task.id"
            class="mission-button"
            :class="{
              'is-selected': selectedId === task.id,
              'is-complete': completed.has(task.id),
            }"
            :aria-current="selectedId === task.id ? 'true' : undefined"
            @click="$emit('select', task.id)"
          >
            <span class="task-node"
              ><UiIcon v-if="completed.has(task.id)" name="check" :size="13" /><span v-else>{{
                String(taskIndex + 1).padStart(2, '0')
              }}</span></span
            >
            <span class="task-label"
              >{{ task.taskName
              }}<span
                v-if="task.taskReward.some(({ reward }) => reward.includes('Подсумок 3×3 на 1 день'))"
                class="task-pouch-label"
                ><UiIcon name="box" :size="13" />Подсумок 3×3 · 1 день</span
              ><span v-if="completed.has(task.id)" class="task-done-label">Выполнено</span></span
            >
            <UiIcon v-if="selectedId === task.id" name="chevron" :size="13" />
          </button>
        </div>
      </section>
    </div>
  </section>
</template>
