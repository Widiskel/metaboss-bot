import { account } from "./account.js";

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
  if (attack) {
    bossInfo.currentHp = data.hpBoss;
  } else {
    bossInfo = data;
  }
}

function getUserInfo() {
  const jsonData = {
    code: 1,
    type: 2,
    data: {
      id: account.id,
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
