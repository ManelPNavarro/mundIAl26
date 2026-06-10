<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
navigateTo('/predictions', { replace: true })
</script>
