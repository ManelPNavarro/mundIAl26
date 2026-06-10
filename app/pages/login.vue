<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function signIn() {
  if (!email.value.trim() || !password.value) return

  loading.value = true
  error.value = ''

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value,
  })

  loading.value = false

  if (authError) {
    error.value = 'Correo o contraseña incorrectos.'
  } else {
    await navigateTo('/predictions')
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
          </div>
        </template>

        <form class="space-y-4" @submit.prevent="signIn">
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
              autocomplete="email"
            />
          </UFormField>

          <UFormField label="Contraseña">
            <UInput
              v-model="password"
              type="password"
              placeholder="••••••••"
              size="lg"
              class="w-full"
              :disabled="loading"
              autocomplete="current-password"
            />
          </UFormField>

          <UButton
            type="submit"
            block
            size="lg"
            :loading="loading"
            :disabled="!email.trim() || !password"
          >
            Entrar
          </UButton>
        </form>
      </UCard>
    </div>
  </div>
</template>
