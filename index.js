import WebSocket from "ws";
import * as event from "./src/event.js";

const socketUrl = "wss://api.metaboss.xyz:2000/game";
var client = new WebSocket(socketUrl);
client.setMaxListeners(0);

async function initWebSocket() {
  return new Promise((resolve, reject) => {
    client.on("open", () => {
      console.log("Connecting to metaboss web socket");
      client.ping();
    });

    client.on("close", () => {
      event.userData = undefined;
      event.bossInfo = undefined;
      reject();
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

async function getUserInfo() {
  console.log("Getting User Info Event");
  return new Promise((resolve, reject) => {
    client.send(event.getUserInfo());
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
  return new Promise((resolve, reject) => {
    if (attack) {
      client.send(event.attackBoss());
    } else {
      client.send(event.getBossInfo());
      console.log("Getting Boss Info Event");
    }

    client.once("message", (wsMsg) => {
      const messages = JSON.parse(wsMsg.toString("utf8"));
      const rc = messages.code;
      const data = messages.data;
      //   console.log(data);

      if (rc == 8 || rc == 10 || rc == 11) {
        event.setBossInfo(data, attack);
        console.log("Boss Max HP   : " + event.bossInfo.maxHp);
        console.log("Current HP    : " + event.bossInfo.currentHp);
        console.log();

        if (attack) {
          setInterval(() => resolve(), 1500);
        } else {
          resolve();
        }
      } else {
        reject(new Error("Received unexpected response" + data));
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

async function startBot() {
  await initWebSocket();
  console.log("=====================================");
  console.log("WebSocket initialized");
  console.log("=====================================");
  console.log();

  if (client.readyState == WebSocket.OPEN) {
    await getUserInfo();
    if (event.userData != undefined) {
      await getBossInfo();
      if (event.bossInfo != undefined) {
        if (event.bossInfo.remain != 0) {
          console.log(
            "Boss now in cooldown, Waiting for " +
              millisecondsToHoursAndMinutes(event.bossInfo.remain)
          );
          await delay(event.bossInfo.remain);
          startBot();
        } else {
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
        }
      }
    } else {
      await startBot();
    }
  } else {
    await startBot();
  }
}

startBot();
