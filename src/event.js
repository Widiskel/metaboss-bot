import { Helper } from "./utils/helper.js";

var missions = [];

var bossInfo = {
  maxHp: 100,
  currentHp: 0,
  remain: 0,
  type: 0,
};

var userData = {
  name: undefined,
  id: undefined,
  coin: 0,
  ton: 0,
  notCoin: 0,
  mission: [],
  resource: [],
};

var miningData = {
  timeConst: undefined,
  timeEndMining: undefined,
  mineType: 3, //GOLD MINING
  timeRemaining: undefined,
};

function setMission(data) {
  missions = data;
}

function setUserData(data) {
  userData = data;
}

function setMiningData(data) {
  miningData = data;
}

function setBossInfo(data, code) {
  if (code == 8) {
    bossInfo = data;
  } else if (code == 10) {
    bossInfo.currentHp = data.hpBoss;
    userData.coin = data.coin;
  } else if (code == 11) {
    bossInfo.remain = data.remain;
  }
}
function getUserInfo(userData) {
  // console.log(userData);
  if (userData.code) {
    return JSON.stringify(userData);
  } else {
    const data = Helper.teleQueryConvert(userData);
    // console.log(data);
    const sendData = {
      code: 1,
      type: 2,
      data: {
        id: data.user.id,
        username: data.user.first_name + " " + data.user.last_name,
        hash: data.hash,
        timeAuth: data.auth_date,
        data: userData,
      },
    };
    // console.log(sendData);
    return JSON.stringify(sendData);
  }
}

function claimBossChest() {
  return JSON.stringify({
    code: 1,
    type: 11,
    data: { type: 10 },
  });
}
function claimChest(id) {
  return JSON.stringify({
    code: 1,
    type: 11,
    data: { type: id },
  });
}

function getBossInfo() {
  return JSON.stringify({ code: 1, type: 7, data: {} });
}
function startMining(type) {
  return JSON.stringify({
    code: 1,
    type: 45,
    data: { mineType: type },
  });
}

function claimMission(id) {
  return JSON.stringify({ code: 1, type: 15, data: { type: id } });
}

function completeMissions(id) {
  return JSON.stringify({ code: 1, type: 50, data: { type: id } });
}

function attackBoss() {
  return JSON.stringify({ code: 1, type: 3, data: {} });
}

export {
  missions,
  bossInfo,
  userData,
  miningData,
  setUserData,
  setMission,
  claimBossChest,
  getUserInfo,
  getBossInfo,
  startMining,
  setBossInfo,
  attackBoss,
  setMiningData,
  completeMissions,
  claimMission,
  claimChest,
};
