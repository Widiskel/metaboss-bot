const account = [
  //node js 18
  jsonTransformer(
    {"code":"X","type":"X","data":{"id":"X","username":"X","hash":"X","timeAuth":"X","data":"query_id=...etc"}},
  ), //account 1

  //node js 22
  {"code":"X","type":"X","data":{"id":"X","username":"X","hash":"X","timeAuth":"X","data":"query_id=...etc"}},
  
  //if you use vscode and have prettier extension and enable format on save the json will automatically become like this
  {
    code: "X",
    type: "X",
    data: {
      id: "X",
      username: "X",
      hash: "X",
      timeAuth: "X",
      data: "query_id=...etc",
    },
  }
];


function jsonTransformer(inputJson) {
  const code = "code";
  const type = "type";
  const dataKey = "data";
  const id = "id";
  const username = "username";
  const hash = "hash";
  const timeAuth = "timeAuth";
  const data = "data";

  const transformedJson = {
    [code]: inputJson[code],
    [type]: inputJson[type],
    [dataKey]: {
      [id]: inputJson[dataKey][id],
      [username]: inputJson[dataKey][username],
      [hash]: inputJson[dataKey][hash],
      [timeAuth]: inputJson[dataKey][timeAuth],
      [data]: inputJson[dataKey][data]
    }
  };

  return transformedJson;
}

export { account };
