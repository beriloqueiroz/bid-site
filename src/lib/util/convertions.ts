import fs from 'fs';
type Obj = { [key: string]: string[] | string }

export async function csvToJsonVirgulas(csvParh: string): Promise<any[]> {

  const csv = await fs.promises.readFile(csvParh)

  var array = csv.toString().split("\n");

  if (csv.toString().includes("\r")) {
    array = csv.toString().replaceAll("\r", "").split("\n");
  }

  let result = [];

  let headers = array[0].split(",")

  for (let i = 1; i < array.length; i++) {
    let obj: Obj = {}

    let str = array[i]
    let s = ''

    let flag = 0
    for (let ch of str) {
      if (ch === '"' && flag === 0) {
        flag = 1
      }
      else if (ch === '"' && flag == 1) flag = 0
      if (ch === ',' && flag === 0) ch = '='
      if (ch !== '"') s += ch
    }
    let properties = s.split("=")
    for (let j in headers) {
      obj[headers[j].replaceAll('"', '')] = properties[j]
    }
    result.push(obj)
  }
  return result;
}

export async function csvToJson(csvParh: string, separator: string): Promise<any[]> {

  if (separator == ",") return await csvToJsonVirgulas(csvParh);

  const csv = await fs.promises.readFile(csvParh)

  var array = csv.toString().split("\n");

  if (csv.toString().includes("\r")) {
    array = csv.toString().replaceAll("\r", "").split("\n");
  }

  let result = [];

  let headers = array[0].split(";")
  console.log("🚀 ~ file: convertions.ts:51 ~ csvToJson ~ headers:", headers)

  for (let i = 1; i < array.length; i++) {
    let obj: Obj = {}

    let properties = array[i].split(separator)

    // if (properties.length != headers.length) {
    //   throw new Error("headers length is not equal to properties length")
    // }

    if (!properties[0] || properties[0] == '') {
      break;
    }

    for (let j in headers) {
      obj[headers[j]] = properties[j]
    }
    result.push(obj)
  }
  console.log("🚀 ~ file: convertions.ts:70 ~ csvToJson ~ result:", result)
  return result;
}

