import c2mAPIBatch from "../class_c2mAPI_batch.js";
import * as convert from "xml2js";
var c2m = new c2mAPIBatch("myUserName", "Test12345", "Stage"); //Credentials for C2M

const checkBatch = async (batchID) => {
  //console.log(batchID);
  c2m.batchID = batchID;
  //await handler({});
  return await new Promise((resolve, reject) => {
    c2m.getBatchStatus(function (id, body) {
      c2m.batchID = "0";
      //console.log(id, body);
      resolve(body);
    });
  });
};
const checkBatchDetails = async (batchID) => {
  //console.log(batchID);
  c2m.batchID = batchID;
  //await handler({});
  return await new Promise((resolve, reject) => {
    c2m.getBatchStatusDetails(function (id, body) {
      c2m.batchID = "0";
      //console.log(id, body);
      resolve(body);
    });
  });
};

const formatXML = async (xml) => {
  return await new Promise((resolve, reject) =>
    convert.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    })
  );
};

const jobs = await formatXML(await checkBatch(96072));
console.log(jobs.batchjob.jobs);
console.log("GET Batch", await formatXML(await checkBatch(96072)));
console.log("Get Details", await formatXML(await checkBatchDetails(96072)));
