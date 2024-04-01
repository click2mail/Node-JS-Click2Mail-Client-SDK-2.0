import c2mAPIBatch from "../class_c2mAPI_batch.js";
import * as convert from "xml2js";
var c2m = new c2mAPIBatch("myUserName", "Test12345", "Stage"); //Credentials for C2M
var addressList = [];
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
addressList.push(address);

var address2 = {};
address.name = "John Smith2";
address.organization = "";
address.address1 = "2001 Butterfield Rd";
address.address2 = "STE 169";
address.address3 = "";
address.city = "Downers Grove";
address.state = "IL";
address.postalCode = "60515";
address.country = "US";
address.c2m_uniqueid = "12346";
addressList.push(address2);

var docOptions = {};
docOptions.documentClass = "Letter 8.5 x 11";
docOptions.layout = "Address on First Page";
docOptions.productionTime = "Next Day";
docOptions.envelope = "Flat Envelope";
docOptions.color = "Black and White";
docOptions.paperType = "White 24#";
docOptions.mailClass = "First Class";
docOptions.printOptions = "Printing One side";

console.log("Pages 1 and 2 will be going to entire Address List");
c2m.addToBatchListMulti(
  1, // start Page
  2, // End Page
  docOptions.documentClass,
  docOptions.layout,
  docOptions.productionTime,
  docOptions.envelope,
  docOptions.color,
  docOptions.paperType,
  docOptions.printOptions,
  docOptions.mailClass,
  null, //optional keys such as confirmationOfMailing,ancialaryEndorsement, pass as object such as {confirmationalOfMailing:true,ancillaryEndorsement:true}
  docOptions.addressList,
  "MY Return Address", //Return Address Name
  "Company XYZ", //Return Address organization
  "1234 Smith Street", //Return Address Address1
  "", //Return Address Address2
  "Oak Brook", //Return Address City
  "IL", //Return Address State
  "60523" //Return Address ZIP
);
console.log(
  "Pages 3 will be going to single Address 1 with default return address"
);
c2m.addToBatchListSingle(
  3,
  3,
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
var file = `../flattened.pdf`;
var results = await formatXML(await startProcessingBatch(file));

console.log(results);
