# METABOSS BOT

Meta boss auto attack boss bot, What is Metaboss ? Metaboss is tap tap game on telegram that run on TON chain.

## Prerequisite

- Node JS (v22.1.0)
- Metaboss Account

## Register Metaboss Account

- join metaboss on telegram [HERE](https://t.me/metaboss_2024_bot?start=ref_5703822759)
- Start bot `/start`
- play `/play`

## Set Up And Run

- clone the project `git clone https://github.com/Widiskel/metaboss-bot.git`.
- run `cd metaboss-bot`.
- run `npm install`.

Since metaboss team add more security to the app, botting is not easy like before, here i will tell you how to run the bot
- Install [Telegram Desktop](https://desktop.telegram.org/).
- Go to Settings > Advance > Experimental Settings > And enable Webview inspecting.
  ![image](https://github.com/Widiskel/metaboss-bot/blob/master/assets/image2.png)
  
  Also read how to do inspect on your Operating system.

- Now open Metaboss Webview game on your Telegram Desktop.
- On the Webview window right click > inspect (on Windows) or open Safari > Develop > Your Device > Telegram (on Mac)
- On Inspect Element or Developer Tools > go to Network tab > find the game socket
- Now refresh the Metaboss Webview on your Telegram Desktop.
- Back to Developer Tools > Network tab > game socket You will see something like this
  ![image](https://github.com/Widiskel/metaboss-bot/blob/master/assets/image3.png)
- Copy the data that contains your account data
- Now open `account.js` and fill up your data using template data provided

```js
const account = [
  {
    code: "X",
    type: "X",
    data: {
      id: "X",
      username: "X",
      hash: "X",
      timeAuth: "X",
      data: "user={"id":11111XXXXXXXX...etc",
    },
  }, //account 1
];
```

- Finnally run `npm run start`

## How To Update

- run `git pull`
- run `npm update`
- run the bot again `npm run start`

## Note

if any error happen please check [HERE](https://github.com/Widiskel/metaboss-bot)
check the commit if any new commit, then update the bot.

remember to not open telegram metaboss game while the bot running cause it may cause bot freeze.
