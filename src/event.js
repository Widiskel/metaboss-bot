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
  // console.log();
  // console.log(data);
  // console.log(bossInfo);
  // console.log(" ATTACKING : " + attack);
  if (attack) {
    // console.log("ATTACKING");
    if (data.remain == 0 || data.remain == undefined) {
      bossInfo.currentHp = data.hpBoss;
    } else {
      bossInfo.currentHp = 0;
    }
  } else {
    // console.log("NOT ATTACKING");
    if (data.remain == 0) {
      // console.log("NOT ATTACKING - NOT REMAINING");
      bossInfo = data;
    } else {
      // console.log("NOT ATTACKING - REMAINING");
      bossInfo = { maxHp: 100, currentHp: 0, remain: data.remain, type: 0 };
    }
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
