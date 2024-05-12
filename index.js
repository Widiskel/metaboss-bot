import WebSocket from "ws";
import * as event from "./src/event.js";
import { account } from "./src/account.js";
import { Twisters } from "twisters";

const socketUrl = "wss://api.metaboss.xyz:2000/game";
var client = new WebSocket(socketUrl);
const twisters = new Twisters();

client.setMaxListeners(0);

async function initWebSocket() {
  return new Promise((resolve, reject) => {
    client = new WebSocket(socketUrl);

    client.on("open", () => {
      console.log("");
      twisters.put(1, {
        text: `
Status : Connecting to metaboss web socket

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
`,
      });

      client.ping();
    });

    client.on("close", () => {
      reject(new Error("WebSocket connection closed unexpectedly"));
    });

    client.on("ping", () => {
      twisters.put(1, {
        text: `
Status : Received ping from server

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
`,
      });

      client.pong();
    });

    client.on("pong", () => {
      twisters.put(1, {
        text: `
Status : Received pong from server

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
`,
      });

      resolve();
    });
  });
}

async function closeWebSocket() {
  if (client.readyState === WebSocket.OPEN) {
    twisters.put(1, {
      text: `
Status : Web Socket Closed

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
`,
    });
  }
}

async function getUserInfo(accountID) {
  twisters.put(1, {
    text: `
Status : Getting User Info Event

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
`,
  });

  return new Promise((resolve, reject) => {
    client.send(event.getUserInfo(accountID));
    client.once("message", (wsMsg) => {
      const messages = JSON.parse(wsMsg.toString("utf8"));
      const rc = messages.code;
      const data = messages.data;

      if (rc == 2) {
        twisters.put(1, {
          text: `
Status : Running on - Account ${accountID}

USER DATA 
Username       : ${data.name}
Id             : ${data.id}
Total Misison  : ${data.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
      `,
        });

        event.setUserData(data);
        event.setMission(data.mission);

        resolve();
      } else {
        reject(new Error("Received unexpected response" + data));
      }
    });
  });
}

async function getBossInfo(attack = false, userData, msg = "") {
  return new Promise((resolve) => {
    if (attack) {
      twisters.put(1, {
        text: `
Status : Attacking ${msg}

USER DATA 
Username       : ${userData.name}
Id             : ${userData.id}
Total Misison  : ${userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
    `,
      });
      client.send(event.attackBoss());
    } else {
      client.send(event.getBossInfo());
      twisters.put(1, {
        text: `
Status : Getting Boss Info Event

Username       : ${userData.name}
Id             : ${userData.id}
Total Misison  : ${userData.mission.length}
    `,
      });
    }

    client.once("message", (wsMsg) => {
      const messages = JSON.parse(wsMsg.toString("utf8"));
      const rc = messages.code;
      const data = messages.data;
      // console.log(messages);

      if (rc == 404) {
        resolve();
      }
      event.setBossInfo(data, attack);
      twisters.put(1, {
        text: `
Status : ${attack ? `Attacking ${msg}` : "Getting Boss Info Event"}

USER DATA 
Username       : ${userData.name}
Id             : ${userData.id}
Total Misison  : ${userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}

${JSON.stringify(messages)}
    `,
      });

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
  twisters.put(1, {
    text: `
Status : Running Bot for Account : ${idx + 1}

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
`,
  });
  try {
    var accountID = accountList[idx][0];
    await initWebSocket();

    twisters.put(1, {
      text: `
Status : WebSocket initialized for account ${idx + 1} (${accountID})

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
  `,
    });

    if (client.readyState == WebSocket.OPEN) {
      await getUserInfo(accountID);
      if (event.userData != undefined) {
        await getBossInfo(false, event.userData);
        if (event.bossInfo != undefined) {
          if (event.bossInfo.remain != 0) {
            console.log(
              "Account " +
                accountID +
                " In cooldown for " +
                millisecondsToHoursAndMinutes(event.bossInfo.remain)
            );
            twisters.put(1, {
              text: `
Status : Boss now in cooldown, Waiting for ${millisecondsToHoursAndMinutes(
                event.bossInfo.remain
              )}
USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
          `,
            });

            // Update account status to true
            accountList[idx][1] = true;
            var nextIdx = accountList.findIndex(
              (account) => account[1] === false
            );
            await closeWebSocket();
            if (nextIdx == -1) {
              twisters.put(1, {
                text: `
Status : All accounts are in cooldown waiting for 5 Minutes
            `,
              });
              await delay(300000); // Wait for 5 minutes
              twisters.put(1, {
                text: `
Status : Restarting with the first account

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
            `,
              });

              await startBot(0);
            } else {
              twisters.put(1, {
                text: `
Status : Restarting with the next account - ${nextIdx}

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
            `,
              });

              await startBot(nextIdx);
            }
          } else {
            accountList[idx][1] = false;
            twisters.put(1, {
              text: `
Status : Boss Currently have ${event.bossInfo.currentHp} HP

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}

Attacking for ${event.bossInfo.currentHp} Times
          `,
            });
            while (event.bossInfo.currentHp != 0) {
              twisters.put(1, {
                text: `
  Status : Attacking Bos - (${event.bossInfo.currentHp - 1} Left)
  
  USER DATA 
  Username       : ${event.userData.name}
  Id             : ${event.userData.id}
  Total Misison  : ${event.userData.mission.length}
  
  Boss Max HP    : ${event.bossInfo.maxHp}
  Current HP     : ${event.bossInfo.currentHp}
  Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
            `,
              });
              await getBossInfo(
                true,
                event.userData,
                `-  (${event.bossInfo.currentHp - 1} Left)`
              );
            }

            twisters.put(1, {
              text: `
Status : Boss HP now ${event.bossInfo.currentHp} HP

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}

Restarting with the same account
          `,
            });
            await startBot(idx); // Restart with the same account
          }
        }
      } else {
        console.log("ERROR - Undefined User");
        twisters.put(1, {
          text: `
Status : Restarting with the same account - Undefined User Info

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
      `,
        });
        await startBot(idx);
      }
    } else {
      console.log("ERROR - Socket Not Ready");
      twisters.put(1, {
        text: `
Status : Restarting with the same account - Socket Not Ready

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
    `,
      });
      await startBot(idx);
    }
  } catch (error) {
    console.log("ERROR " + error);
    twisters.put(1, {
      text: `
  Status : Restarting with the same account - error occurred ${error}

  USER DATA
  Username       : ${event.userData.name}
  Id             : ${event.userData.id}
  Total Misison  : ${event.userData.mission.length}

  Boss Max HP    : ${event.bossInfo.maxHp}
  Current HP     : ${event.bossInfo.currentHp}
  Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
    `,
    });
    await startBot(idx);
  }
}

var accountList = account.map((item) => [item, false]);
startBot(0);
