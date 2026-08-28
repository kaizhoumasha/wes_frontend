import { getCurrentScope, onScopeDispose, ref } from 'vue'
import {
  consumeTransportEvidenceStream,
  type TransportEvidenceStreamEvent,
  type TransportEvidenceStreamOptions
} from '@/api/streaming/transportEvidenceStream'
import {
  createAuthenticatedSseConnection,
  type AuthenticatedSseConnectionState
} from '@/api/streaming/authenticatedSseStream'

interface UseTransportEvidenceStreamOptions {
  connector?: (options: TransportEvidenceStreamOptions) => Promise<void>
  onEvent: (event: TransportEvidenceStreamEvent) => void
  onReconnect?: () => void
}

export function useTransportEvidenceStream(options: UseTransportEvidenceStreamOptions) {
  const connector = options.connector ?? consumeTransportEvidenceStream
  const connectionState = ref<AuthenticatedSseConnectionState>('DISCONNECTED')
  const lastError = ref<Error | null>(null)
  const hasGap = ref(false)
  const connection = createAuthenticatedSseConnection({
    connector: ({ signal, onOpen }) => connector({ signal, onOpen, onEvent: options.onEvent }),
    onStateChange: state => {
      connectionState.value = state
      if (state === 'RECONNECTED') options.onReconnect?.()
    },
    onError: error => {
      lastError.value = error
    },
    onGap: () => {
      hasGap.value = true
    }
  })

  if (getCurrentScope()) onScopeDispose(connection.disconnect)

  return {
    connectionState,
    lastError,
    hasGap,
    connect: connection.connect,
    reconnect: connection.reconnect,
    disconnect: connection.disconnect
  }
}
