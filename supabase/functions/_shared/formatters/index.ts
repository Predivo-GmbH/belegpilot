import type { Formatter } from './types.ts'
export type { ExportDocument, FormatResult, Formatter } from './types.ts'

import { formatCsv } from './csv.ts'
import { formatBexio } from './bexio.ts'
import { formatAbacus } from './abacus.ts'
import { formatSage } from './sage.ts'
import { formatBanana } from './banana.ts'

/** Registry of all supported ERP formatters */
export const formatters: Record<string, Formatter> = {
  csv: formatCsv,
  bexio: formatBexio,
  abacus: formatAbacus,
  sage: formatSage,
  banana: formatBanana,
}

export const SUPPORTED_FORMATS = Object.keys(formatters)
