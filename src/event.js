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
  mission: [],
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

function setBossInfo(data, attack = false) {
  if (attack) {
    if (data.remain == 0 || data.remain == undefined) {
      bossInfo.currentHp = data.hpBoss;
    } else {
      bossInfo.currentHp = 0;
    }
  } else {
    if (data.remain == 0) {
      bossInfo = data;
    } else {
      bossInfo = { maxHp: 100, currentHp: 0, remain: data.remain, type: 0 };
    }
  }
}
function getUserInfo(userData) {
  // console.log(userData);
  return JSON.stringify(userData);
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
