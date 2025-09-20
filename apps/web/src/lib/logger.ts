/**
 * Minimal frontend logger wrapper.
 *
 * Rationale:
 * - Avoids heavyweight logging libraries in the browser per project guidance.
 * - Provides a stable interface and level-based methods for future enhancement.
 * - Can be swapped for a more advanced client logger if needed.
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug'

type Logger = {
  error: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  debug: (...args: unknown[]) => void
}

const levelToMethod: Record<LogLevel, keyof Console> = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  debug: 'debug',
}

const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'

/**
 * getLogger
 *
 * Returns a namespaced logger that prefixes messages with the module name.
 */
export function getLogger(namespace: string): Logger {
  const prefix = `[${namespace}]`
  const log = (level: LogLevel, ...args: unknown[]) => {
    // In production, silence debug logs but keep others.
    if (!isDev && level === 'debug') return
    const method = levelToMethod[level]
    // Bind to console explicitly to avoid TS confusion over callable signatures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-console
    const fn = (console as any)[method] as ((...a: unknown[]) => void) | undefined
      // eslint-disable-next-line no-console
      ; (fn ?? console.log).call(console, prefix, ...args)
  }

  return {
    error: (...args) => log('error', ...args),
    warn: (...args) => log('warn', ...args),
    info: (...args) => log('info', ...args),
    debug: (...args) => log('debug', ...args),
  }
}


