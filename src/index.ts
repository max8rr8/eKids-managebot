import { Telegraf, Markup, Context } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/telegram-types'
import * as config from './config'

type UrlButton = InlineKeyboardButton.UrlButton & { hide: boolean }

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

function createLinksButtons(links: string[]): UrlButton[] {
  return links.map((e, i) => Markup.button.url('Группа ' + (i + 1), e))
}

function createAllButtons() {
  const buttons: UrlButton[][] = []
  for (const group of config.groups) {
    buttons.push([
      Markup.button.url('~~~~~ ' + group.name + ' ~~~~~', group.link)
    ])
    buttons.push(createLinksButtons(config.links[group.id]))
  }
  return buttons
}

function findGroupById(
  groupId: number
): { isMeta: boolean; found: boolean; group: config.GroupConfig | null } {
  if (config.metaGroup.groups.includes(groupId)) {
    return {
      isMeta: true,
      found: true,
      group: null
    }
  }

  for (const possibleGroup of config.groups) {
    if (possibleGroup.groups.includes(groupId))
      return {
        isMeta: false,
        found: true,
        group: possibleGroup
      }
  }
  return {
    isMeta: false,
    found: false,
    group: null
  }
}

function createLinksText(time: number[]) {
  return time
    .map((e, i) => {
      const startHour = Math.floor(e / 100)
      const startMinute = Math.floor(e % 100)

      let endHour = startHour + 1
      let endMinute = startMinute + 20

      endHour += Math.floor(endMinute / 60)
      endMinute = endMinute % 60

      return `Группа ${i + 1}: ${startHour}:${startMinute
        .toString()
        .padStart(2, '0')} - ${endHour}:${endMinute
        .toString()
        .padStart(2, '0')}`
    })
    .join('\n')
}

bot.command('debug', (ctx) => {
  ctx.replyWithMarkdown(
    `*CHAT*\n\`\`\`\n${JSON.stringify(ctx.chat, null, 2)}\n\`\`\``
  )
})

function giveLinks(ctx: Context) {
  const chatId = ctx.chat?.id ?? 0
  const { group, found, isMeta } = findGroupById(chatId)
  if (!found) return ctx.reply('Я не знаю')
  if (isMeta) {
    ctx.reply('Вот ссылки на всё', Markup.inlineKeyboard(createAllButtons()))
  } else {
    if (group !== null)
      ctx.reply(
        `Вот ссылки на ${group.name}\n` + createLinksText(group.time),
        Markup.inlineKeyboard(createLinksButtons(config.links[group.id]))
      )
  }
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
