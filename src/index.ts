import { Telegraf, Markup, Context } from 'telegraf'
import * as config from './config'

let bot = new Telegraf(config.bot.token)

function containsAtLeastOneWord(str: string, words: string[]): boolean {
  for (let word of words) {
    if (str.includes(word)) return true
  }
  return false
}

function containsQuestion(str: string) {
  return (
    containsAtLeastOneWord(str, config.trigger.linkWords) &&
    containsAtLeastOneWord(str, config.trigger.askWords)
  )
}

function createLinksKeyboard(links: string[]) {
  const buttons = links.map((e, i) => Markup.button.url('Группа ' + (i + 1), e))
  return Markup.inlineKeyboard(buttons)
}

function findGroupById(groupId: number) {
  for (const possibleGroup of config.groups) {
    if (possibleGroup.groups.indexOf(groupId) != -1) return possibleGroup
  }
  return null
}

bot.command('debug', (ctx) => {
  ctx.replyWithMarkdown(
    `*CHAT*\n\`\`\`\n${JSON.stringify(ctx.chat, null, 2)}\n\`\`\``
  )
})

function giveLinks(ctx: Context) {
  const chatId = ctx.chat?.id ?? 0
  const group = findGroupById(chatId)
  if (group == null) return ctx.reply('Я не знаю')
  console.log(chatId, group)
  ctx.reply(
    `Вот ссылки на ${group.name}`,
    createLinksKeyboard(config.links[group.id])
  )
}

bot.command('links', (ctx) => {
  giveLinks(ctx)
})

bot.on('text', (ctx) => {
  const msg = ctx.message.text.toLocaleLowerCase()
  console.log(msg)
  if (containsQuestion(msg)) {
    giveLinks(ctx)
  }
})

bot.launch()
