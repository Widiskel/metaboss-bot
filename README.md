# METABOSS BOT

Meta boss auto attack boss bot, What is Metaboss ? Metaboss is tap tap game on telegram that run on TON chain.

## Prerequisite

- Node JS (v22.1.0)
- Git
- Metaboss Account

## BOT Feature

- Auto attack bos
- Auto claim boss reward
- Auto complete missions
- Auto claim misisons reward
- Auto Start Mining (if unlocked)
- Auto open item on bag (Boss Chest, Mission Reward Chest, Mining Reward)

## Register Metaboss Account

- join metaboss on telegram [HERE](https://t.me/metaboss_2024_bot?start=ref_5703822759)
- Start bot `/start`
- play `/play`

## Set Up And Run

- clone the project `git clone https://github.com/Widiskel/metaboss-bot.git`, or download from [RELEASE](https://github.com/Widiskel/metaboss-bot/releases)
- run `cd metaboss-bot`.
- run `npm install`.
- run `cp src/account_tmp.js src/account.js`

Since metaboss team add more security to the app, botting is not easy like before, here i will tell you how to run the bot

1. Install [Telegram Desktop](https://desktop.telegram.org/).
2. Go to Settings > Advance > Experimental Settings > And enable Webview inspecting.
   ![image](https://github.com/Widiskel/metaboss-bot/blob/master/assets/image2.png)

Also read how to do inspect on your Operating system.

3. Now open Metaboss Webview game on your Telegram Desktop.
4. On the Webview window right click > inspect (on Windows) or open Safari > Develop > Your Device > Telegram (on Mac)
5. On Inspect Element or Developer Tools > go to Network tab > find the game socket
6. Now refresh the Metaboss Webview on your Telegram Desktop.
7. Back to Developer Tools > Network tab > game socket You will see something like this
   ![image](https://github.com/Widiskel/metaboss-bot/blob/master/assets/gamesocket.png)
8. Copy the request that contains your account data, the data is seems like this

```js
{
  code: 1,
  type: 2,
  data: {
    id: 0,
    username: "X",
    hash: "X",
    timeAuth: 0,
    data: 'query=xx', //copy value inside data
  },
},
```

you can copy all of it, or just copy the data `query=xxx`. if you copy only the data `query=xxx` or `user=xxx` remember to wrap it with single quotes `'`.

9. Now open `account.js` and fill up or paste your data using template data provided

```js
const account = [
  "query_id=xxx",
  {
    code: 1,
    type: 2,
    data: {
      id: 0,
      username: "X",
      hash: "X",
      timeAuth: 0,
      data: "query_id=xxx",
    },
  },
  "user=xxx",
];

export { account };
```

10. Finnally run `npm run start`

## Configure Mining

to configure or decide what mining you want to focused, look at `config.js` , change the mine type with type you want, i'm already add description about mining priority on that file. If you not configure it, it will be use the Black Mine as default

## How To Update

- run `git pull`
- run `npm update`
- run the bot again `npm run start`

## Note

The account data can be expired (query data livetime around 1-2 day), because it have `hash` and `timeAuth`, so if your run the bot and your username and id is undefined or it stuck on some process (get user info, get boss info etc), you need to get new account data. follow the ## Set Up And Run from no 3

if any error happen please check [HERE](https://github.com/Widiskel/metaboss-bot)
check the commit if any new commit, then update the bot.

remember to not open telegram metaboss game while the bot running cause it may cause bot freeze.

## CONTRIBUTE

Feel free to fork and contribute adding more feature thanks.

## SUPPORT

want to support me for creating another bot ?
buy me a coffee on

EVM : `0x0fd08d2d42ff086bf8c6d057d02d802bf217559a`

SOLANA : `3tE3Hs7P2wuRyVxyMD7JSf8JTAmEekdNsQWqAnayE1CN`
