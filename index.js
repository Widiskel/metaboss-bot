import WebSocket from "ws";
import * as event from "./src/event.js";
import { account } from "./src/account.js";

const socketUrl = "wss://api.metaboss.xyz:2000/game";
var client = new WebSocket(socketUrl);
client.setMaxListeners(0);

async function initWebSocket() {
  return new Promise((resolve, reject) => {
    client = new WebSocket(socketUrl);

    client.on("open", () => {
      console.log("Connecting to metaboss web socket");
      client.ping();
    });

    client.on("close", () => {
      reject(new Error("WebSocket connection closed unexpectedly"));
    });

    client.on("ping", () => {
      console.log("Received ping from server");
      client.pong();
    });

    client.on("pong", () => {
      console.log("Received pong from server");
      resolve();
    });
  });
}

async function closeWebSocket() {
  if (client.readyState === WebSocket.OPEN) {
    console.log();
    console.log("=======================");
    client.close();
    console.log("Web Socket Closed");
    console.log("=======================");
    console.log();
  }
}

async function getUserInfo(accountID) {
  console.log("Getting User Info Event");
  return new Promise((resolve, reject) => {
    client.send(event.getUserInfo(accountID));
    client.once("message", (wsMsg) => {
      const messages = JSON.parse(wsMsg.toString("utf8"));
      const rc = messages.code;
      const data = messages.data;

      if (rc == 2) {
        console.log("Username       : " + data.name);
        console.log("Id             : " + data.id);
        console.log("Total Misison  : " + data.mission.length);

        event.setUserData(data);
        event.setMission(data.mission);
        console.log();

        resolve();
      } else {
        reject(new Error("Received unexpected response" + data));
      }
    });
  });
}

async function getBossInfo(attack = false) {
  return new Promise((resolve) => {
    if (attack) {
      console.log("Attack");
      client.send(event.attackBoss());
    } else {
      client.send(event.getBossInfo());
      console.log("Getting Boss Info Event");
    }

    client.once("message", (wsMsg) => {
      const messages = JSON.parse(wsMsg.toString("utf8"));
      const rc = messages.code;
      const data = messages.data;
      console.log(messages);

      if (rc == 404) {
        resolve();
      }
      event.setBossInfo(data, attack);
      console.log("Boss Max HP   : " + event.bossInfo.maxHp);
      console.log("Current HP    : " + event.bossInfo.currentHp);
      console.log(
        "Colldown      : " +
          millisecondsToHoursAndMinutes(event.bossInfo.remain)
      );
      console.log();

      if (attack) {
        setInterval(() => resolve(), 1500);
      } else {
        resolve();
      }
    });
  });
}

async function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function millisecondsToHoursAndMinutes(milliseconds) {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const remainingMilliseconds = milliseconds % (1000 * 60 * 60);
  const minutes = Math.round(remainingMilliseconds / (1000 * 60));

  return hours + " Hours " + minutes + " Minutes";
}

async function startBot(idx) {
  console.log();
  console.log("Running Bot for Account : " + (idx + 1));
  try {
    var accountID = accountList[idx][0];
    await initWebSocket();
    console.log("=====================================");
    console.log(
      "WebSocket initialized for account " + (idx + 1) + " (" + accountID + ")"
    );
    console.log("=====================================");
    console.log();

    if (client.readyState == WebSocket.OPEN) {
      await getUserInfo(accountID);
      if (event.userData != undefined) {
        await getBossInfo();
        if (event.bossInfo != undefined) {
          if (event.bossInfo.remain != 0) {
            console.log(
              "Boss now in cooldown, Waiting for " +
                millisecondsToHoursAndMinutes(event.bossInfo.remain)
            );
            // Update account status to true
            accountList[idx][1] = true;
            var nextIdx = accountList.findIndex(
              (account) => account[1] === false
            );
            await closeWebSocket();
            if (nextIdx == -1) {
              console.log("All accounts are in cooldown waiting for 5 Minutes");
              await delay(300000); // Wait for 5 minutes
              console.log("Restarting with the first account");
              await startBot(0);
            } else {
              console.log("Restarting with the next account " + nextIdx);
              await startBot(nextIdx);
            }
          } else {
            accountList[idx][1] = false;
            console.log(
              "Boss Currently have " + event.bossInfo.currentHp + " HP"
            );
            console.log(
              "Attacking for " + (event.bossInfo.currentHp - 3) + " Times"
            );
            let i = 0;
            while (event.bossInfo.currentHp != 0) {
              console.log(
                "Attacking Boss " +
                  (i + 1) +
                  " (" +
                  (event.bossInfo.currentHp - 1) +
                  " Left )"
              );
              await getBossInfo(true);
              i++;
            }
            console.log("Boss HP now " + event.bossInfo.currentHp + " HP");
            console.log("Restarting with the same account");
            await startBot(idx); // Restart with the same account
          }
        }
      } else {
        console.log("Restarting with the same account");
        await startBot(idx); // Restart with the same account
      }
    } else {
      console.log("Restarting with the same account");
      await startBot(idx);
    }
  } catch (error) {
    console.error("An error occurred:", error);
    await startBot(idx);
  }
}

var accountList = account.map((item) => [item, false]);
startBot(0);
