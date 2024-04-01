import c2mAPIBatch from "../class_c2mAPI_batch.js";
import * as convert from "xml2js";
var c2m = new c2mAPIBatch("myUserName", "Test12345", "Stage"); //Credentials for C2M

var file = `../flattened.pdf`;

var address = {};
address.name = "John Smith";
address.organization = "";
address.address1 = "2001 Butterfield Rd";
address.address2 = "STE 168";
address.address3 = "";
address.city = "Downers Grove";
address.state = "IL";
address.postalCode = "60515";
address.country = "US";
address.c2m_uniqueid = "12345";

var address2 = {};
address2.name = "John Smith2";
address2.organization = "";
address2.address1 = "2002 Butterfield Rd";
address2.address2 = "STE 169";
address2.address3 = "";
address2.city = "Downers Grove";
address2.state = "IL";
address2.postalCode = "60515";
address2.country = "US";
address2.c2m_uniqueid = "12346";

var docOptions = {};
docOptions.documentClass = "Letter 8.5 x 11";
docOptions.layout = "Address on First Page";
docOptions.productionTime = "Next Day";
docOptions.envelope = "Flat Envelope";
docOptions.color = "Black and White";
docOptions.paperType = "White 24#";
docOptions.mailClass = "First Class";
docOptions.printOptions = "Printing One side";

console.log(
  "adding single address.  Pages 1-2 will be going to the same address as page 3"
);
await c2m.addToBatchListSingleMerge(
  file,
  docOptions.documentClass,
  docOptions.layout,
  docOptions.productionTime,
  docOptions.envelope,
  docOptions.color,
  docOptions.paperType,
  docOptions.printOptions,
  docOptions.mailClass,
  docOptions.c2m_uniqueid, //UniqueID for single address
  null, //optional keys such as confirmationOfMailing,ancialaryEndorsement, pass as object such as {confirmationalOfMailing:true,ancillaryEndorsement:true}
  address.name,
  address.organization,
  address.address1,
  address.address2,
  address.address3,
  address.city,
  address.state,
  address.postalCode,
  address.country,
  null, //Return Address Name
  null, //Return Address organization
  null, //Return Address Address1
  null, //Return Address Address2
  null, //Return Address City
  null, //Return Address State
  null //Return Address ZIP
);

await c2m.addToBatchListSingleMerge(
  file,
  docOptions.documentClass,
  docOptions.layout,
  docOptions.productionTime,
  docOptions.envelope,
  docOptions.color,
  docOptions.paperType,
  docOptions.printOptions,
  docOptions.mailClass,
  docOptions.c2m_uniqueid, //UniqueID for single address
  null, //optional keys such as confirmationOfMailing,ancialaryEndorsement, pass as object such as {confirmationalOfMailing:true,ancillaryEndorsement:true}
  address2.name,
  address2.organization,
  address2.address1,
  address2.address2,
  address2.address3,
  address2.city,
  address2.state,
  address2.postalCode,
  address2.country,
  null, //Return Address Name
  null, //Return Address organization
  null, //Return Address Address1
  null, //Return Address Address2
  null, //Return Address City
  null, //Return Address State
  null //Return Address ZIP
);

async function startProcessingBatch(file) {
  return new Promise((resolve, reject) => {
    c2m.createBatchMailing(file, function (id, body) {
      //console.log("IN BATCH RETURNED");
      if (id == 0) {
        //  console.log("IN BATCH RETURNED rejected");
        reject(body);
        return;
      }
      var obj = {};
      obj.id = id;
      obj.body = body;
      resolve(obj.body);
    });
  });
}

const formatXML = async (xml) => {
  return await new Promise((resolve, reject) =>
    convert.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    })
  );
};

var results = await formatXML(await startProcessingBatch());

console.log(results);
