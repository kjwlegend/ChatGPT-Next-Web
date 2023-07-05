# Details

Date : 2023-07-05 02:56:18

Directory d:\\codes\\ChatGPT-Next-Web\\app

Total : 136 files,  15322 codes, 159 comments, 1640 blanks, all 17121 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [app/api/auth.ts](/app/api/auth.ts) | TypeScript | 51 | 2 | 13 | 66 |
| [app/api/common.ts](/app/api/common.ts) | TypeScript | 74 | 4 | 16 | 94 |
| [app/api/config/route.ts](/app/api/config/route.ts) | TypeScript | 18 | 2 | 8 | 28 |
| [app/api/openai/[...path]/route.ts](/app/api/openai/%5B...path%5D/route.ts) | TypeScript | 43 | 0 | 10 | 53 |
| [app/client/api.ts](/app/client/api.ts) | TypeScript | 117 | 3 | 26 | 146 |
| [app/client/controller.ts](/app/client/controller.ts) | TypeScript | 30 | 1 | 7 | 38 |
| [app/client/platforms/openai.ts](/app/client/platforms/openai.ts) | TypeScript | 205 | 1 | 31 | 237 |
| [app/command.ts](/app/command.ts) | TypeScript | 59 | 0 | 13 | 72 |
| [app/components/auth.module.scss](/app/components/auth.module.scss) | SCSS | 29 | 0 | 9 | 38 |
| [app/components/auth.tsx](/app/components/auth.tsx) | TypeScript React | 49 | 0 | 8 | 57 |
| [app/components/button.module.scss](/app/components/button.module.scss) | SCSS | 69 | 0 | 15 | 84 |
| [app/components/button.tsx](/app/components/button.tsx) | TypeScript React | 47 | 0 | 5 | 52 |
| [app/components/chat-list.tsx](/app/components/chat-list.tsx) | TypeScript React | 151 | 0 | 11 | 162 |
| [app/components/chat.module.scss](/app/components/chat.module.scss) | SCSS | 403 | 0 | 77 | 480 |
| [app/components/chat.tsx](/app/components/chat.tsx) | TypeScript React | 940 | 28 | 96 | 1,064 |
| [app/components/code-login.tsx](/app/components/code-login.tsx) | TypeScript React | 51 | 0 | 7 | 58 |
| [app/components/emoji.tsx](/app/components/emoji.tsx) | TypeScript React | 52 | 0 | 8 | 60 |
| [app/components/error.tsx](/app/components/error.tsx) | TypeScript React | 66 | 3 | 7 | 76 |
| [app/components/exporter.module.scss](/app/components/exporter.module.scss) | SCSS | 182 | 0 | 36 | 218 |
| [app/components/exporter.tsx](/app/components/exporter.tsx) | TypeScript React | 489 | 0 | 40 | 529 |
| [app/components/footer.module.scss](/app/components/footer.module.scss) | SCSS | 14 | 0 | 3 | 17 |
| [app/components/footer.tsx](/app/components/footer.tsx) | TypeScript React | 19 | 0 | 6 | 25 |
| [app/components/header.module.scss](/app/components/header.module.scss) | SCSS | 106 | 4 | 12 | 122 |
| [app/components/header.tsx](/app/components/header.tsx) | TypeScript React | 113 | 4 | 14 | 131 |
| [app/components/home.module.scss](/app/components/home.module.scss) | SCSS | 279 | 2 | 51 | 332 |
| [app/components/home.tsx](/app/components/home.tsx) | TypeScript React | 149 | 0 | 30 | 179 |
| [app/components/input-range.module.scss](/app/components/input-range.module.scss) | SCSS | 12 | 0 | 2 | 14 |
| [app/components/input-range.tsx](/app/components/input-range.tsx) | TypeScript React | 35 | 0 | 3 | 38 |
| [app/components/intro.module.scss](/app/components/intro.module.scss) | SCSS | 164 | 0 | 32 | 196 |
| [app/components/intro.tsx](/app/components/intro.tsx) | TypeScript React | 489 | 20 | 25 | 534 |
| [app/components/login.tsx](/app/components/login.tsx) | TypeScript React | 52 | 0 | 4 | 56 |
| [app/components/markdown.tsx](/app/components/markdown.tsx) | TypeScript React | 191 | 4 | 18 | 213 |
| [app/components/mask.module.scss](/app/components/mask.module.scss) | SCSS | 91 | 0 | 18 | 109 |
| [app/components/mask.tsx](/app/components/mask.tsx) | TypeScript React | 472 | 5 | 36 | 513 |
| [app/components/message-selector.module.scss](/app/components/message-selector.module.scss) | SCSS | 61 | 0 | 16 | 77 |
| [app/components/message-selector.tsx](/app/components/message-selector.tsx) | TypeScript React | 192 | 3 | 21 | 216 |
| [app/components/model-config.tsx](/app/components/model-config.tsx) | TypeScript React | 189 | 0 | 7 | 196 |
| [app/components/new-chat.module.scss](/app/components/new-chat.module.scss) | SCSS | 152 | 2 | 24 | 178 |
| [app/components/new-chat.tsx](/app/components/new-chat.tsx) | TypeScript React | 155 | 1 | 28 | 184 |
| [app/components/register.tsx](/app/components/register.tsx) | TypeScript React | 163 | 0 | 13 | 176 |
| [app/components/settings.module.scss](/app/components/settings.module.scss) | SCSS | 59 | 1 | 13 | 73 |
| [app/components/settings.tsx](/app/components/settings.tsx) | TypeScript React | 636 | 5 | 51 | 692 |
| [app/components/sidebar.tsx](/app/components/sidebar.tsx) | TypeScript React | 169 | 12 | 26 | 207 |
| [app/components/ui-lib.module.scss](/app/components/ui-lib.module.scss) | SCSS | 215 | 0 | 36 | 251 |
| [app/components/ui-lib.tsx](/app/components/ui-lib.tsx) | TypeScript React | 352 | 1 | 41 | 394 |
| [app/config/build.ts](/app/config/build.ts) | TypeScript | 38 | 0 | 7 | 45 |
| [app/config/client.ts](/app/config/client.ts) | TypeScript | 21 | 2 | 5 | 28 |
| [app/config/server.ts](/app/config/server.ts) | TypeScript | 47 | 0 | 6 | 53 |
| [app/constant.ts](/app/constant.ts) | TypeScript | 54 | 0 | 13 | 67 |
| [app/global.d.ts](/app/global.d.ts) | TypeScript | 15 | 0 | 3 | 18 |
| [app/icons/add.svg](/app/icons/add.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/auto.svg](/app/icons/auto.svg) | XML | 1 | 0 | 1 | 2 |
| [app/icons/black-bot.svg](/app/icons/black-bot.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/bot.svg](/app/icons/bot.svg) | XML | 9 | 0 | 1 | 10 |
| [app/icons/bottom.svg](/app/icons/bottom.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/brain.svg](/app/icons/brain.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/break.svg](/app/icons/break.svg) | XML | 1 | 0 | 1 | 2 |
| [app/icons/cancel.svg](/app/icons/cancel.svg) | XML | 1 | 0 | 1 | 2 |
| [app/icons/chat-settings.svg](/app/icons/chat-settings.svg) | XML | 1 | 0 | 1 | 2 |
| [app/icons/chat.svg](/app/icons/chat.svg) | XML | 27 | 0 | 0 | 27 |
| [app/icons/chatgpt.svg](/app/icons/chatgpt.svg) | XML | 16 | 0 | 0 | 16 |
| [app/icons/clear.svg](/app/icons/clear.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/close.svg](/app/icons/close.svg) | XML | 21 | 0 | 0 | 21 |
| [app/icons/confirm.svg](/app/icons/confirm.svg) | XML | 1 | 0 | 1 | 2 |
| [app/icons/copy.svg](/app/icons/copy.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/dark.svg](/app/icons/dark.svg) | XML | 1 | 0 | 1 | 2 |
| [app/icons/delete.svg](/app/icons/delete.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/down.svg](/app/icons/down.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/download.svg](/app/icons/download.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/edit.svg](/app/icons/edit.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/export.svg](/app/icons/export.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/eye-off.svg](/app/icons/eye-off.svg) | XML | 4 | 0 | 0 | 4 |
| [app/icons/eye.svg](/app/icons/eye.svg) | XML | 4 | 0 | 0 | 4 |
| [app/icons/github.svg](/app/icons/github.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/left.svg](/app/icons/left.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/light.svg](/app/icons/light.svg) | XML | 1 | 0 | 1 | 2 |
| [app/icons/lightning.svg](/app/icons/lightning.svg) | XML | 1 | 0 | 1 | 2 |
| [app/icons/mask.svg](/app/icons/mask.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/max.svg](/app/icons/max.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/menu.svg](/app/icons/menu.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/min.svg](/app/icons/min.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/pause.svg](/app/icons/pause.svg) | XML | 1 | 0 | 1 | 2 |
| [app/icons/pin.svg](/app/icons/pin.svg) | XML | 1 | 0 | 1 | 2 |
| [app/icons/plugin.svg](/app/icons/plugin.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/prompt.svg](/app/icons/prompt.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/reload.svg](/app/icons/reload.svg) | XML | 24 | 0 | 0 | 24 |
| [app/icons/rename.svg](/app/icons/rename.svg) | XML | 1 | 0 | 1 | 2 |
| [app/icons/return.svg](/app/icons/return.svg) | XML | 21 | 0 | 0 | 21 |
| [app/icons/robot.svg](/app/icons/robot.svg) | XML | 1 | 0 | 1 | 2 |
| [app/icons/send-white.svg](/app/icons/send-white.svg) | XML | 21 | 0 | 0 | 21 |
| [app/icons/settings.svg](/app/icons/settings.svg) | XML | 21 | 0 | 0 | 21 |
| [app/icons/share.svg](/app/icons/share.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/three-dots.svg](/app/icons/three-dots.svg) | XML | 1 | 0 | 0 | 1 |
| [app/icons/upload.svg](/app/icons/upload.svg) | XML | 1 | 0 | 1 | 2 |
| [app/layout.tsx](/app/layout.tsx) | TypeScript React | 42 | 1 | 3 | 46 |
| [app/locales/ar.ts](/app/locales/ar.ts) | TypeScript | 286 | 0 | 5 | 291 |
| [app/locales/cn.ts](/app/locales/cn.ts) | TypeScript | 321 | 0 | 10 | 331 |
| [app/locales/cs.ts](/app/locales/cs.ts) | TypeScript | 232 | 0 | 5 | 237 |
| [app/locales/de.ts](/app/locales/de.ts) | TypeScript | 236 | 0 | 5 | 241 |
| [app/locales/en.ts](/app/locales/en.ts) | TypeScript | 320 | 0 | 6 | 326 |
| [app/locales/es.ts](/app/locales/es.ts) | TypeScript | 234 | 0 | 5 | 239 |
| [app/locales/fr.ts](/app/locales/fr.ts) | TypeScript | 236 | 0 | 6 | 242 |
| [app/locales/index.ts](/app/locales/index.ts) | TypeScript | 96 | 1 | 19 | 116 |
| [app/locales/it.ts](/app/locales/it.ts) | TypeScript | 235 | 0 | 5 | 240 |
| [app/locales/jp.ts](/app/locales/jp.ts) | TypeScript | 259 | 0 | 4 | 263 |
| [app/locales/ko.ts](/app/locales/ko.ts) | TypeScript | 229 | 0 | 6 | 235 |
| [app/locales/no.ts](/app/locales/no.ts) | TypeScript | 161 | 0 | 4 | 165 |
| [app/locales/ru.ts](/app/locales/ru.ts) | TypeScript | 238 | 0 | 5 | 243 |
| [app/locales/tr.ts](/app/locales/tr.ts) | TypeScript | 235 | 0 | 5 | 240 |
| [app/locales/tw.ts](/app/locales/tw.ts) | TypeScript | 225 | 0 | 4 | 229 |
| [app/locales/vi.ts](/app/locales/vi.ts) | TypeScript | 230 | 0 | 5 | 235 |
| [app/masks/cn.ts](/app/masks/cn.ts) | TypeScript | 470 | 0 | 2 | 472 |
| [app/masks/en.ts](/app/masks/en.ts) | TypeScript | 121 | 0 | 2 | 123 |
| [app/masks/index.ts](/app/masks/index.ts) | TypeScript | 22 | 0 | 5 | 27 |
| [app/masks/typing.ts](/app/masks/typing.ts) | TypeScript | 6 | 0 | 2 | 8 |
| [app/page.tsx](/app/page.tsx) | TypeScript React | 23 | 0 | 3 | 26 |
| [app/polyfill.ts](/app/polyfill.ts) | TypeScript | 18 | 4 | 6 | 28 |
| [app/store/access.ts](/app/store/access.ts) | TypeScript | 92 | 1 | 12 | 105 |
| [app/store/chat.ts](/app/store/chat.ts) | TypeScript | 517 | 26 | 83 | 626 |
| [app/store/config.ts](/app/store/config.ts) | TypeScript | 180 | 0 | 22 | 202 |
| [app/store/index.ts](/app/store/index.ts) | TypeScript | 4 | 0 | 1 | 5 |
| [app/store/mask.ts](/app/store/mask.ts) | TypeScript | 105 | 0 | 10 | 115 |
| [app/store/prompt.ts](/app/store/prompt.ts) | TypeScript | 148 | 1 | 27 | 176 |
| [app/store/sync.ts](/app/store/sync.ts) | TypeScript | 72 | 0 | 16 | 88 |
| [app/store/update.ts](/app/store/update.ts) | TypeScript | 109 | 0 | 21 | 130 |
| [app/styles/animation.scss](/app/styles/animation.scss) | SCSS | 20 | 0 | 4 | 24 |
| [app/styles/globals.scss](/app/styles/globals.scss) | SCSS | 299 | 4 | 61 | 364 |
| [app/styles/highlight.scss](/app/styles/highlight.scss) | SCSS | 91 | 8 | 17 | 116 |
| [app/styles/layout.scss](/app/styles/layout.scss) | SCSS | 10 | 0 | 0 | 10 |
| [app/styles/markdown.scss](/app/styles/markdown.scss) | SCSS | 957 | 0 | 176 | 1,133 |
| [app/styles/window.scss](/app/styles/window.scss) | SCSS | 30 | 0 | 7 | 37 |
| [app/typing.ts](/app/typing.ts) | TypeScript | 1 | 0 | 1 | 2 |
| [app/utils.ts](/app/utils.ts) | TypeScript | 143 | 0 | 33 | 176 |
| [app/utils/format.ts](/app/utils/format.ts) | TypeScript | 13 | 0 | 1 | 14 |
| [app/utils/merge.ts](/app/utils/merge.ts) | TypeScript | 9 | 0 | 1 | 10 |
| [app/utils/token.ts](/app/utils/token.ts) | TypeScript | 16 | 3 | 4 | 23 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)