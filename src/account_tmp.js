const account = [
  jsonTransformer(), //account 1
  jsonTransformer(), //account 2
];


function jsonTransformer(inputJson) {
  // Definisikan variabel yang mewakili kunci
  const code = "code";
  const type = "type";
  const dataKey = "data";
  const id = "id";
  const username = "username";
  const hash = "hash";
  const timeAuth = "timeAuth";
  const data = "data";

  // Buat objek baru dengan kunci variabel
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
