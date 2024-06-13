import WebSocket from "ws";
import * as event from "./src/event.js";
import { account } from "./src/account.js";
import { Twisters } from "twisters";

const socketUrl = "wss://api.metaboss.xyz:2000/game";
var client = new WebSocket(socketUrl);
const twisters = new Twisters();

client.setMaxListeners(0);
function random(min = 1, max = 3) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function initWebSocket() {
  console.log("-> Connecting to Websocket");
  return new Promise((resolve, reject) => {
    client = new WebSocket(socketUrl);

    client.on("open", () => {
      // console.log("");
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
      console.log("-> Connected");
      resolve();
    });
  });
}

async function getUserInfo(userData, accountID) {
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

  return new Promise(async (resolve, reject) => {
    await client.send(event.getUserInfo(userData));
    await client.once("message", async (wsMsg) => {
      const messages = JSON.parse(wsMsg.toString("utf8"));
      const rc = messages.code;
      const data = messages.data;
      // console.log(messages);

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

async function openChest(id) {
  return new Promise(async (resolve, reject) => {
    twisters.put(1, {
      text: `
Status : Opening Item on Bag

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
`,
    });
    await client.send(event.claimChest(id));
    await client.once("message", async (wsMsg) => {
      const messages = JSON.parse(wsMsg.toString("utf8"));
      const rc = messages.code;
      const data = messages.data;
      // console.log(messages);

      if (rc == 12) {
        console.log(
          `-> Successfully claimed chest for Account ${
            event.userData.id
          } got => ${data.number} ${
            data.type == 1 ? "MTB" : data.type == 2 ? "TON" : "NOT"
          }`
        );
        resolve();
      }
    });
  });
}

async function claimBossChest(accountID) {
  twisters.put(1, {
    text: `
Status : Getting Chess Info Event

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
    return new Promise(async (resolve) => {
      await client.send(event.claimBossChest());
      await client.once("message", async (wsMsg) => {
        const messages = JSON.parse(wsMsg.toString("utf8"));
        const rc = messages.code;
        const data = messages.data;
        // console.log(messages);

        if (rc == 12) {
          console.log(
            `-> Successfully claimed chest for Account ${accountID} got => ${
              data.number
            } ${data.type == 1 ? "MTB" : "TON"}`
          );
        }

        if (
          rc == 10 ||
          rc == 1000 ||
          rc == 11 ||
          data.message == "Not enough this item !"
        ) {
          console.log("-> All Boss chest claimed");
          twisters.put(1, {
            text: `
  Status : All Chest Claimed for Account ${accountID}
  
  USER DATA 
  Username       : ${event.userData.name}
  Id             : ${event.userData.id}
  Total Misison  : ${event.userData.mission.length}
  
  Boss Max HP    : ${event.bossInfo.maxHp}
  Current HP     : ${event.bossInfo.currentHp}
  Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
  
  Continue action
          `,
          });

          resolve();
        } else {
          claimBossChest(accountID).then(resolve);
        }
      });
    });
  } catch (error) {
    throw err;
  }
}

async function startMining() {
  return new Promise(async (resolve) => {
    twisters.put(1, {
      text: `
Status : Start mining

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
        `,
    });
    await client.send(event.startMining(random()));
    await client.once("message", (wsMsg) => {
      const messages = JSON.parse(wsMsg.toString("utf8"));
      const rc = messages.code;
      const data = messages.data;
      // console.log(messages);

      if (rc == 32) {
        if (data.timeRemaining != 0) {
          console.log(
            `-> Mining already started for Account ${event.userData.id}`
          );
        } else {
          console.log(
            `-> Successfully Start mining for Account ${event.userData.id}`
          );
        }
      } else if (rc == 33) {
        console.log(
          `-> Mining already started for Account ${event.userData.id}`
        );
      } else {
        console.log("-> Failed to start mining, Mining not unlocked");
      }
      event.setMiningData(data);
      resolve();
    });
  });
}

async function autoCompleteMissions() {
  return new Promise(async (resolve, reject) => {
    try {
      twisters.put(1, {
        text: `
Status : Auto Complete Mission

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
          `,
      });

      const unCompleteMissions = event.missions.filter(
        (item) => !item.completed && item.id != 6
      );
      const unCompleteMissionsIds = unCompleteMissions.map((item) => item.id);
      for (const missionId of unCompleteMissionsIds) {
        console.log(event.completeMissions(missionId));
        await client.send(event.completeMissions(missionId));
        await new Promise((resolve) => {
          client.once("message", async (wsMsg) => {
            const messages = JSON.parse(wsMsg.toString("utf8"));
            const rc = messages.code;
            const data = messages.data;
            console.log(messages);

            if (rc == 19 || rc == 28) {
              const missionDetail = unCompleteMissions.find(
                (item) => item.id === missionId
              );

              twisters.put(1, {
                text: `
Status : Missions id ${missionId} (${missionDetail.des}) Completed

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
                  `,
              });
              await client.send(event.claimMission(missionId));
              await new Promise((resolve) => {
                client.once("message", async (wsMsg) => {
                  const messages = JSON.parse(wsMsg.toString("utf8"));
                  const rc = messages.code;
                  const data = messages.data;
                  console.log(messages);

                  if (rc == 19 || rc == 3 || rc == 12) {
                    twisters.put(1, {
                      text: `
Status : Missions id ${missionId} (${missionDetail.des}) Claimed

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
                  resolve();
                });
              });
            }
            resolve();
          });
        });
      }
      console.log("-> All missions completed");
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

async function getBossInfo(attack = false, msg = "") {
  return new Promise(async (resolve) => {
    if (attack) {
      twisters.put(1, {
        text: `
Status : Attacking ${msg}

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
    `,
      });
      await client.send(event.attackBoss());
    } else {
      await client.send(event.getBossInfo());
      twisters.put(1, {
        text: `
Status : Getting Boss Info Event

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

    await client.once("message", async (wsMsg) => {
      const messages = JSON.parse(wsMsg.toString("utf8"));
      const rc = messages.code;
      const data = messages.data;
      // console.log(messages);

      if (rc == 8 || rc == 10 || rc == 11) {
        event.setBossInfo(data, attack);

        twisters.put(1, {
          text: `
Status : ${attack ? `Attacking ${msg}` : "Getting Boss Info Event"}

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${await millisecondsToHoursAndMinutes(event.bossInfo.remain)}
  
      `,
        });

        if (attack) {
          setTimeout(() => resolve(), 1500);
        } else {
          resolve();
        }
      } else {
        getBossInfo(attack, msg).then(resolve);
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

async function startBot(acc) {
  return new Promise(async (resolve) => {
    const idx = accountList.indexOf(acc);

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
      var userData = accountList[idx][0];
      var accountID = accountList[idx][0].data.id;
      await initWebSocket()
        .then(async (_) => {
          if (client.readyState == WebSocket.OPEN) {
            await getUserInfo(userData, accountID)
              .then(async (_) => {
                if (event.userData.name == undefined) {
                  await startBot(acc);
                }
                await autoCompleteMissions()
                  .then(async () => {
                    await startMining()
                      .then(async (_) => {
                        await getBossInfo(false)
                          .then(async () => {
                            if (event.bossInfo.remain != 0) {
                              console.log(
                                "-> Account " +
                                  accountID +
                                  " In cooldown for " +
                                  millisecondsToHoursAndMinutes(
                                    event.bossInfo.remain
                                  )
                              );
                              console.log();
                              console.log();
                              // Update account status to true
                              accountList[idx][1] = true;
                              resolve();
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
                                  `- (${event.bossInfo.currentHp - 1} Left)`
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

Claiming Chest
                                          `,
                              });

                              console.log("-> Claiming boss chest");
                              await claimBossChest(accountID).then(async () => {
                                await startBot(acc).then(resolve); // Restart with the same account
                              });
                            }
                          })
                          .catch((err) => {
                            console.log("Error during Get Bos Info");
                            throw err;
                          });
                      })
                      .catch((err) => {
                        console.log("Error during Start Mining");
                        throw err;
                      });
                  })
                  .catch(async () => {
                    console.log("Error during complete missions");
                    throw err;
                  });
              })
              .catch((err) => {
                console.log("Error during Get User Info");
                throw err;
              });
          } else {
            console.log("ERROR - Socket Not Ready, Retrying");
            await startBot(acc).then(resolve);
          }
        })
        .catch(async (err) => {
          console.log("Web Socket error, retrying .. ");
          await startBot(acc).then(resolve);
        });
    } catch (error) {
      console.log("ERROR " + error + " , Retrying");
      await startBot(acc).then(resolve);
    }
  });
}

async function initBot() {
  accountList = account.map((item) => [item, false]);
  for (const acc of accountList) {
    console.log();
    console.log("Using Account " + acc[0].data.id);
    await startBot(acc);
    client.close();
    console.log();
    await delay(1000);
  }
  client.close();
  twisters.put(1, {
    text: `
  Status : All accounts are in cooldown waiting for 5 Minutes
    `,
  });
  console.log();
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
  await initBot();
}
var accountList;
(async () => {
  try {
    await initBot();
  } catch (error) {
    console.log("Error During executing bot", error);
    console.log();
    console.log("Restarting from first account...");
    console.log();
    await initBot();
  }
})();
