import yaml from 'js-yaml'
import { readFileSync } from 'fs'
import { join } from 'path'

interface BotConfig {
  token: string
}

interface GroupConfig {
  name: string
  id: string
  groups: number[]
}

interface TriggerConfig {
  askWords: string[]
  linkWords: string[]
}

interface LinksConfig {
  [a: string]: string[]
}

export const isProduction = process.env.NODE_ENV === 'production'

function loadConfig<T>(name: string) {
  const file = readFileSync(
    join(__dirname, '../config', name + '.yml')
  ).toString()
  return (yaml.load(file) as any) as T
}

export let bot: BotConfig = loadConfig(isProduction ? 'bot_prod' : 'bot_dev')
export let groups: GroupConfig[] = loadConfig('groups')
export let trigger: TriggerConfig = loadConfig('trigger')
export let links: LinksConfig = loadConfig('links')
