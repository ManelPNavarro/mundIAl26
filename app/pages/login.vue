<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

const origin = useRequestURL().origin

async function sendMagicLink() {
  if (!email.value.trim()) return

  loading.value = true
  error.value = ''

  const { error: authError } = await supabase.auth.signInWithOtp({
    email: email.value.trim(),
    options: {
      emailRedirectTo: `${origin}/confirm`,
    },
  })

  loading.value = false

  if (authError) {
    error.value = 'No se pudo enviar el enlace. Inténtalo de nuevo.'
  } else {
    sent.value = true
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold tracking-tight text-foreground mb-2">
          mundIAl 26
        </h1>
        <p class="text-muted text-sm">
          Porra del Mundial de Fútbol 2026
        </p>
      </div>

      <UCard>
        <template #header>
          <div class="text-center">
            <h2 class="font-semibold text-foreground">
              Acceder
            </h2>
            <p class="text-sm text-muted mt-1">
              Accede a tu cuenta con un enlace mágico
            </p>
          </div>
        </template>

        <div v-if="!sent" class="space-y-4">
          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            :description="error"
            icon="i-lucide-circle-alert"
          />

          <UFormField label="Correo electrónico">
            <UInput
              v-model="email"
              type="email"
              placeholder="tu@email.com"
              size="lg"
              class="w-full"
              :disabled="loading"
              @keyup.enter="sendMagicLink"
            />
          </UFormField>

          <UButton
            block
            size="lg"
            :loading="loading"
            :disabled="!email.trim()"
            @click="sendMagicLink"
          >
            Enviar enlace
          </UButton>
        </div>

        <div v-else class="text-center py-4 space-y-3">
          <div class="flex justify-center">
            <UIcon name="i-lucide-mail-check" class="size-12 text-primary" />
          </div>
          <p class="font-medium text-foreground">
            Revisa tu correo electrónico
          </p>
          <p class="text-sm text-muted">
            Hemos enviado un enlace de acceso a
            <span class="font-medium text-foreground">{{ email }}</span>
          </p>
          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            @click="sent = false"
          >
            Usar otro correo
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
