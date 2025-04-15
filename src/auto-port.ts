import detect from 'detect-port'

interface PortConfig {
  defaultPort: number
  maxAttempts?: number
}

export async function getAvailablePort(
  config: PortConfig
): Promise<number> {
  let { defaultPort, maxAttempts = 5 } = config
  let currentAttempt = 0

  while (currentAttempt < maxAttempts) {
    try {
      const port = await detect(defaultPort)
      if (port === defaultPort) return port
      defaultPort++
      currentAttempt++
    } catch (err) {
      throw new Error(`Port detection failed: ${err}`)
    }
  }

  throw new Error(
    `No available ports found after ${maxAttempts} attempts`
  )
}