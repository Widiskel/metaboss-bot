import WebSocket from "ws";
import * as event from "./src/event.js";
import { account } from "./src/account.js";
import { Twisters } from "twisters";
import { Config } from "./config.js";

const socketUrl = "wss://api.metaboss.xyz:2000/game";
var client = new WebSocket(socketUrl);
const twisters = new Twisters();

client.setMaxListeners(0);

async function initWebSocket() {
  console.log("-> Connecting to Websocket");
  return new Promise((resolve, reject) => {
    client = new WebSocket(socketUrl);

    client.on("open", () => {
      // console.log("");
      twisters.put(1, {
        text: `
Status : Connecting to metaboss web socket
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
`,
      });

      client.pong();
    });

    client.on("pong", () => {
      twisters.put(1, {
        text: `
Status : Received pong from server
`,
      });
      console.log("-> Connected");
      twisters.remove(1);
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

BALANCE
MTB            : ${event.userData.coin}
TON            : ${event.userData.ton}
NOT            : ${event.userData.notCoin}

BOSS INFO
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

BALANCE
MTB            : ${event.userData.coin}
TON            : ${event.userData.ton}
NOT            : ${event.userData.notCoin}

BOSS INFO
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
Status : Opening Item id ${id} from Bag

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}


BALANCE
MTB            : ${event.userData.coin}
TON            : ${event.userData.ton}
NOT            : ${event.userData.notCoin}

BOSS INFO
Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
`,
    });

    try {
      const handleRes = async (wsMsg) => {
        const messages = JSON.parse(wsMsg.toString("utf8"));
        const rc = messages.code;
        const data = messages.data;
        // console.log(messages);

        if (rc == 12) {
          console.log(
            `-> Successfully Opening chest for Account ${
              event.userData.id
            } got => ${data.number} ${
              data.type == 1 ? "MTB" : data.type == 2 ? "TON" : "NOT"
            }`
          );
          await client.off("message", handleRes);
          resolve();
        }
      };
      await client.send(event.claimChest(id));
      await client.on("message", handleRes);
    } catch (error) {
      reject(error);
    }
  });
}

async function claimBossChest() {
  return new Promise(async (resolve, reject) => {
    twisters.put(1, {
      text: `
Status : Getting Chess Info Event

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

BALANCE
MTB            : ${event.userData.coin}
TON            : ${event.userData.ton}
NOT            : ${event.userData.notCoin}

BOSS INFO
Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
    `,
    });

    try {
      const handleRes = async (wsMsg) => {
        const messages = JSON.parse(wsMsg.toString("utf8"));
        const rc = messages.code;
        const data = messages.data;
        // console.log(messages);

        if (rc == 12) {
          console.log(
            `-> Successfully claimed chest for Account ${
              event.userData.id
            } got => ${data.number} ${data.type == 1 ? "MTB" : "TON"}`
          );
          await client.off("message", handleRes);
          resolve();
        }

        if (rc == 1000) {
          console.log("-> All Boss chest claimed");
          twisters.put(1, {
            text: `
Status : All Chest Claimed for Account ${event.userData.id}

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

BALANCE
MTB            : ${event.userData.coin}
TON            : ${event.userData.ton}
NOT            : ${event.userData.notCoin}

BOSS INFO
Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}

Continue action
          `,
          });

          await client.off("message", handleRes);
          resolve();
        }
      };
      await client.send(event.claimBossChest());
      await client.on("message", handleRes);
    } catch (error) {
      reject(error);
    }
  });
}

async function startMining() {
  return new Promise(async (resolve, reject) => {
    twisters.put(1, {
      text: `
Status : Start mining

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

BALANCE
MTB            : ${event.userData.coin}
TON            : ${event.userData.ton}
NOT            : ${event.userData.notCoin}

BOSS INFO
Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
        `,
    });

    try {
      const handleRes = async (wsMsg) => {
        const messages = JSON.parse(wsMsg.toString("utf8"));
        const rc = messages.code;
        const data = messages.data;
        // console.log(messages);

        if (rc == 32) {
          if (data.timeRemaining != 0) {
            console.log(
              `-> Mining already started for Account ${
                event.userData.id
              }, Remaining ${millisecondsToHoursAndMinutes(data.timeRemaining)}`
            );
          } else {
            console.log(
              `-> Successfully Start mining for Account ${event.userData.id}`
            );
          }
          event.setMiningData(data);
          await client.off("message", handleRes);

          resolve();
        } else if (rc == 1000) {
          console.log("-> Failed to start mining, Mining not unlocked");
          event.setMiningData(data);
          await client.off("message", handleRes);

          resolve();
        }
      };
      await client.send(event.startMining(Config.miningType));
      await client.on("message", handleRes);
    } catch (error) {
      reject(error);
    }
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

BALANCE
MTB            : ${event.userData.coin}
TON            : ${event.userData.ton}
NOT            : ${event.userData.notCoin}

BOSS INFO
Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
          `,
      });

      const unCompleteMissions = event.missions.filter(
        (item) => !item.completed && item.id != 6 && item.id != 4
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
            // console.log(messages);

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

BALANCE
MTB            : ${event.userData.coin}
TON            : ${event.userData.ton}
NOT            : ${event.userData.notCoin}

BOSS INFO
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
                  // console.log(messages);

                  if (rc == 19 || rc == 3 || rc == 12) {
                    twisters.put(1, {
                      text: `
Status : Missions id ${missionId} (${missionDetail.des}) Claimed

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

BALANCE
MTB            : ${event.userData.coin}
TON            : ${event.userData.ton}
NOT            : ${event.userData.notCoin}

BOSS INFO
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
  return new Promise(async (resolve, reject) => {
    try {
      const handleRes = async (wsMsg) => {
        const messages = JSON.parse(wsMsg.toString("utf8"));
        const rc = messages.code;
        const data = messages.data;
        // console.log(messages);

        if (rc == 10 || rc == 8 || rc == 11) {
          event.setBossInfo(data, rc);
          twisters.put(1, {
            text: `
Status : ${attack ? `Attacking ${msg}` : "Getting Boss Info Event"}

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

BALANCE
MTB            : ${event.userData.coin}
TON            : ${event.userData.ton}
NOT            : ${event.userData.notCoin}

BOSS INFO
Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${await millisecondsToHoursAndMinutes(event.bossInfo.remain)}
    
        `,
          });

          client.off("message", handleRes);
          if (attack) {
            setTimeout(() => resolve(), 1000);
          } else {
            resolve();
          }
        } else if (rc == 1000) {
          client.off("message", handleRes);
          resolve();
        }
      };
      if (attack) {
        twisters.put(1, {
          text: `
Status : Attacking ${msg}

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

BALANCE
MTB            : ${event.userData.coin}
TON            : ${event.userData.ton}
NOT            : ${event.userData.notCoin}

BOSS INFO
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

BALANCE
MTB            : ${event.userData.coin}
TON            : ${event.userData.ton}
NOT            : ${event.userData.notCoin}

BOSS INFO
Boss Max HP    : ${event.bossInfo.maxHp}
Current HP     : ${event.bossInfo.currentHp}
Colldown       : ${millisecondsToHoursAndMinutes(event.bossInfo.remain)}
      `,
        });
      }
      await client.on("message", handleRes);
    } catch (error) {
      reject(error);
    }
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
  return new Promise(async (resolve, reject) => {
    const idx = accountList.indexOf(acc);

    twisters.put(1, {
      text: `
Status : Running Bot for Account : ${idx + 1}

USER DATA 
Username       : ${event.userData.name}
Id             : ${event.userData.id}
Total Misison  : ${event.userData.mission.length}

BALANCE
MTB            : ${event.userData.coin}
TON            : ${event.userData.ton}
NOT            : ${event.userData.notCoin}

BOSS INFO
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
                await autoCompleteMissions()
                  .then(async () => {
                    const availableResources = [];
                    for (const [id, value] of Object.entries(
                      event.userData.resource
                    )) {
                      if (value !== 0) {
                        availableResources.push({ id, value });
                      }
                    }
                    for (const res of availableResources) {
                      for (let i = 0; i < res.value; i++) {
                        try {
                          await openChest(res.id);
                        } catch (err) {
                          throw err;
                        }
                      }
                    }
                    console.log(`-> All chest claimed`);
                    await startMining()
                      .then(async (_) => {
                        await getBossInfo(false)
                          .then(async () => {
                            if (event.bossInfo.remain != 0) {
                              twisters.remove(1);
                              console.log(
                                "-> Account " +
                                  event.userData.id +
                                  " In cooldown for " +
                                  millisecondsToHoursAndMinutes(
                                    event.bossInfo.remain
                                  )
                              );
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
                    Colldown       : ${millisecondsToHoursAndMinutes(
                      event.bossInfo.remain
                    )}
                    Attacking for ${event.bossInfo.currentHp} Times
                                                            `,
                              });
                              while (event.bossInfo.currentHp != 0) {
                                twisters.put(1, {
                                  text: `
                    Status : Attacking Bos - (${
                      event.bossInfo.currentHp - 1
                    } Left)

                    USER DATA
                    Username       : ${event.userData.name}
                    Id             : ${event.userData.id}
                    Total Misison  : ${event.userData.mission.length}

                    Boss Max HP    : ${event.bossInfo.maxHp}
                    Current HP     : ${event.bossInfo.currentHp}
                    Colldown       : ${millisecondsToHoursAndMinutes(
                      event.bossInfo.remain
                    )}
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
                    Colldown       : ${millisecondsToHoursAndMinutes(
                      event.bossInfo.remain
                    )}

                    Claiming Chest
                                                            `,
                              });
                              twisters.remove(1);
                              console.log("-> Claiming boss chest");
                              await claimBossChest().then(async () => {
                                twisters.remove(1);
                                await startBot(acc)
                                  .then(resolve)
                                  .catch((err) => reject(err));
                              });
                            }
                          })
                          .catch((err) => {
                            throw err;
                          });
                      })
                      .catch((err) => {
                        throw err;
                      });
                  })
                  .catch(async (err) => {
                    throw err;
                  });
              })
              .catch((err) => {
                throw err;
              });
          } else {
            throw err;
          }
        })
        .catch(async (err) => {
          throw err;
        });
    } catch (error) {
      twisters.remove(1);
      console.log("ERROR " + error + " , Retrying");
      await startBot(acc)
        .then(resolve)
        .catch((err) => reject(err));
    }
  });
}

async function initBot() {
  twisters.remove(1);
  accountList = account.map((item) => [item, false]);
  for (const acc of accountList) {
    console.log();
    console.log("Using Account " + acc[0].data.id);
    await startBot(acc);
    client.close();
    console.log();
    await delay(1000);
  }
  twisters.remove(1);
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
