<script setup lang="ts">
import { GROUP_STAGE } from '~/data/group-stage'
import { KNOCKOUT_ROUNDS } from '~/data/knockout'

definePageMeta({ middleware: 'auth' })

type Prediction = { home: number | null, away: number | null, homeAdvances?: boolean | null }
type Predictions = Record<number, Prediction>

const predictions = ref<Predictions>({})
const currentStep = ref(0)

const DEADLINE = new Date('2026-06-11T00:00:00')

const now = ref(new Date())
const isLocked = computed(() => now.value >= DEADLINE)

const timeLeft = computed(() => {
  const diff = DEADLINE.getTime() - now.value.getTime()
  if (diff <= 0) return null
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds }
})

let timer: ReturnType<typeof setInterval>
onMounted(() => { timer = setInterval(() => { now.value = new Date() }, 1000) })
onUnmounted(() => clearInterval(timer))

const GROUP_TOTAL = GROUP_STAGE.reduce((acc, g) => acc + g.matches.length, 0)

function countFilled(matchIds: number[]) {
  return matchIds.filter((id) => {
    const p = predictions.value[id]
    return p?.home !== null && p?.away !== null && p?.home !== undefined && p?.away !== undefined
  }).length
}

const groupMatchIds = GROUP_STAGE.flatMap(g => g.matches.map(m => m.id))
const groupFilled = computed(() => countFilled(groupMatchIds))
const groupComplete = computed(() => groupFilled.value === GROUP_TOTAL)

const steps = computed(() => [
  {
    key: 'groups',
    title: 'Fase de grupos',
    description: `${groupFilled.value}/${GROUP_TOTAL} partidos`,
    complete: groupComplete.value,
  },
  ...KNOCKOUT_ROUNDS.map((round) => {
    const ids = round.matches.map(m => m.id)
    const filled = countFilled(ids)
    return {
      key: round.key,
      title: round.label,
      description: `${filled}/${round.matches.length} partidos`,
      complete: filled === round.matches.length,
    }
  }),
])

function canAdvance() {
  return steps.value[currentStep.value]?.complete
}

function advance() {
  if (canAdvance() && currentStep.value < steps.value.length - 1) {
    currentStep.value++
  }
}

const currentRound = computed(() =>
  currentStep.value > 0 ? KNOCKOUT_ROUNDS[currentStep.value - 1] : null
)

function randomScore() {
  const weights = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 4]
  return weights[Math.floor(Math.random() * weights.length)]!
}

function randomize() {
  const allIds = [
    ...GROUP_STAGE.flatMap(g => g.matches.map(m => m.id)),
    ...KNOCKOUT_ROUNDS.flatMap(r => r.matches.map(m => m.id)),
  ]
  for (const id of allIds) {
    const home = randomScore()
    const away = randomScore()
    predictions.value[id] = {
      home,
      away,
      homeAdvances: home === away ? Math.random() > 0.5 : null,
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Predicciones</h1>
        <p class="text-sm text-muted mt-1">Introduce tus resultados para cada fase del torneo.</p>
      </div>
      <UButton
        v-if="!isLocked"
        variant="outline"
        color="neutral"
        icon="i-lucide-shuffle"
        size="sm"
        @click="randomize"
      >
        Aleatorio
      </UButton>
    </div>

    <!-- Stepper -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="(step, idx) in steps"
        :key="step.key"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
        :class="[
          idx === currentStep
            ? 'bg-primary border-primary text-white'
            : step.complete
              ? 'bg-success/10 border-success/30 text-success hover:bg-success/20 cursor-pointer'
              : idx < currentStep
                ? 'bg-muted/50 border-border text-muted hover:bg-muted cursor-pointer'
                : 'bg-muted/20 border-border text-muted/50 cursor-not-allowed',
        ]"
        :disabled="idx > currentStep && !steps[idx - 1]?.complete"
        @click="idx <= currentStep || steps[idx - 1]?.complete ? currentStep = idx : null"
      >
        <UIcon v-if="step.complete && idx !== currentStep" name="i-lucide-check" class="size-3" />
        <span v-else class="font-bold">{{ idx + 1 }}</span>
        {{ step.title }}
      </button>
    </div>

    <!-- Locked banner -->
    <UAlert
      v-if="isLocked"
      color="error"
      variant="soft"
      icon="i-lucide-lock"
      title="Predicciones cerradas"
      description="El plazo para introducir predicciones finalizó el 10 de junio. ¡Que empiece el Mundial!"
    />

    <!-- Countdown banner -->
    <div v-else-if="timeLeft" class="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
      <div class="flex items-center gap-2 text-sm text-muted">
        <UIcon name="i-lucide-clock" class="size-4 shrink-0" />
        <span>Tiempo para cerrar predicciones</span>
      </div>
      <div class="flex items-center gap-3 font-mono text-sm font-semibold text-foreground shrink-0">
        <span><span class="text-primary">{{ timeLeft.days }}</span>d</span>
        <span><span class="text-primary">{{ String(timeLeft.hours).padStart(2, '0') }}</span>h</span>
        <span><span class="text-primary">{{ String(timeLeft.minutes).padStart(2, '0') }}</span>m</span>
        <span><span class="text-primary">{{ String(timeLeft.seconds).padStart(2, '0') }}</span>s</span>
      </div>
    </div>

    <!-- Completed banner -->
    <UAlert
      v-if="steps.every(s => s.complete) && !isLocked"
      color="success"
      variant="soft"
      icon="i-lucide-party-popper"
      title="¡Predicción finalizada!"
      description="Has completado todas las fases. Puedes volver atrás para modificar cualquier resultado."
    />

    <!-- Step content -->
    <div>
      <!-- Group stage -->
      <div v-if="currentStep === 0">
        <PredictionsGroupStage v-model="predictions" :locked="isLocked" />
      </div>

      <!-- Knockout rounds -->
      <div v-else-if="currentRound">
        <p class="text-sm text-muted mb-4">
          Los equipos se confirmarán una vez finalice la fase anterior.
        </p>
        <PredictionsKnockoutRound
          v-model="predictions"
          :matches="currentRound.matches"
          :locked="isLocked"
        />
      </div>
    </div>

    <!-- Footer action -->
    <div class="flex items-center justify-between pt-2 border-t border-border">
      <UButton
        v-if="currentStep > 0"
        variant="ghost"
        color="neutral"
        icon="i-lucide-arrow-left"
        @click="currentStep--"
      >
        Anterior
      </UButton>
      <div v-else />

      <div class="flex items-center gap-3">
        <span class="text-xs text-muted">
          {{ steps[currentStep]?.description }}
        </span>
        <UButton
          v-if="currentStep < steps.length - 1"
          :disabled="!canAdvance()"
          trailing-icon="i-lucide-arrow-right"
          @click="advance"
        >
          Confirmar y continuar
        </UButton>
        <UButton
          v-else
          :disabled="!canAdvance()"
          icon="i-lucide-check"
          color="success"
        >
          Guardar predicciones
        </UButton>
      </div>
    </div>
  </div>
</template>
