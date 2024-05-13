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

- clone the project `git clone https://github.com/Widiskel/metaboss-bot.git`
- run `cd metaboss-bot`
- run `npm install`
- open `/src/account.js` and change account id and username with your account id and username/display name that showed in game, it support multiple account. example

```json
const account = [
  [123123123, "USERNAME"], //account 1
  [123123123, "USERNAME"], //account 2
  [123123123, ""], //account 3 NO USERNAME
  [123123123, ""], //account 4 NO USERNAME
];
```

- run `npm run start`

## How To Update

- run `git pull`
- run `npm update`
- run the bot again `npm run start`

## Note

if any error happen please do `npm update`.
remember to not open telegram metaboss game while the bot running cause it may cause bot freeze.
