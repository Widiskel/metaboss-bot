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

function setMission(data) {
  missions = data;
}

function setUserData(data) {
  userData = data;
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
function getUserInfo(accountID, userName) {
  const jsonData = {
    code: 1,
    type: 2,
    data: {
      id: accountID,
      username: userName,
      hash: "xxx",
      timeAuth: Math.floor(Date.now() / 1000),
    },
  };
  return JSON.stringify(jsonData);
}

function claimBossChest() {
  return JSON.stringify({
    code: 1,
    type: 11,
    data: { type: 10 },
  });
}

function getBossInfo() {
  return JSON.stringify({ code: 1, type: 7, data: {} });
}

function attackBoss() {
  return JSON.stringify({ code: 1, type: 3, data: {} });
}

export {
  missions,
  bossInfo,
  userData,
  setUserData,
  setMission,
  claimBossChest,
  getUserInfo,
  getBossInfo,
  setBossInfo,
  attackBoss,
};
