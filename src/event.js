var missions = [];

var bossInfo;

var userData;

function setMission(data) {
  missions = data;
}

function setUserData(data) {
  userData = data;
}
function setBossInfo(data, attack = false) {
  if (data.remain != 0) {
    if (attack) {
      bossInfo.currentHp = data.hpBoss;
    } else {
      bossInfo = data;
    }
  } else {
    bossInfo = { maxHp: 100, currentHp: 0, remain: data.remain, type: 0 };
  }
}

function getUserInfo(accountID) {
  const jsonData = {
    code: 1,
    type: 2,
    data: {
      id: accountID,
      timeAuth: Math.floor(Date.now() / 1000),
    },
  };
  return JSON.stringify(jsonData);
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
  getUserInfo,
  getBossInfo,
  setBossInfo,
  attackBoss,
};
