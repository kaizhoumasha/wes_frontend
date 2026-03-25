/**
 * CRUD Detail Panel Module
 *
 * @module crud-page/detail
 *
 * Provides a configurable detail panel for CRUD entities.
 * Supports drawer/dialog modes, sections, and custom actions.
 */

// Main component
export { default as CrudDetailPanel } from './CrudDetailPanel.vue'

// Sub-components
export { default as CrudDetailSection } from './CrudDetailSection.vue'
export { default as CrudDetailField } from './CrudDetailField.vue'
export { default as CrudDetailActions } from './CrudDetailActions.vue'

// Composables
export { useDetailState } from './composables/useDetailState'

export { useDetailResponsive } from './composables/useDetailResponsive'
export type { DetailResponsiveMode } from './composables/useDetailResponsive'

// Types
export {
  // Main types
  type CrudPageDetailConfig,
  type CrudPageDetailSection,
  type CrudPageDetailField,
  type CrudPageDetailAction,
  type CrudDetailState,
  type FormatterFunction,

  // Constants
  DEFAULT_EMPTY_VALUE,
  DEFAULT_RESPONSIVE,
  DETAIL_WIDTH
} from './types'
