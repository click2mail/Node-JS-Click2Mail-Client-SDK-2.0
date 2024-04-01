/**
 * class_class_c2mAPI_batch_batch.js
 */
const PDFMerger = require("pdf-merger-js");
const os = require("os");
//const PDFMerger = require("pdf-merger-js");
var merger = new PDFMerger();
//var merger;
function class_c2mAPI_batch(username, passw, mode) {
  // console.log("IN C2m Constructor");

  this.username = username;
  this.passw = passw;
  this.autoProcess = true;
  this.addressMappingId = 2;
  this.pagesBeforeAdding = 0;
  if (typeof mode === "undefined" || mode == null) {
    this.mode = "stage";
  } else {
    this.mode = mode;
  }
}
var pagesBeforeAdding = 0;
var autoProcess;
var restCallBack;
var batchCallBack;
var mode = "";
var addressMappingId = "";
var request = require("request");
const crypto = require("crypto");

var parseString = require("xml2js").parseString;
var batchXMLFile = "";
var batchPDFFile = "";
var fs = require("fs");
var username = "";
var passw = "";
var batchID = "0";
var documentID = "0";
var addressListID = "0";
var jobID = "0";
var stageBatchURL = "https://stage-batch.click2mail.com";
var batchURL = "https://batch.click2mail.com";

var addressListBatch = new Array();

var batchList = new Array();

var docOptions = {
  pdfFile: "",
  docName: "",
  docFormat: "",
  contentType: "",
  docClass: "",
  layout: "",
  prodTime: "",
  envelope: "",
  color: "",
  paperType: "",
  printOption: "",
};

class_c2mAPI_batch.prototype.getRestURL = function () {
  if (this.mode == "Live") {
    return restURL;
  } else {
    return stageRestURL;
  }
};
class_c2mAPI_batch.prototype.guid = function () {
  return crypto.randomUUID({ disableEntropyCache: true });
};

class_c2mAPI_batch.prototype.getRandomFileName = function () {
  var timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  var random = ("" + Math.random()).substring(2, 8);
  var random_number = timestamp + random;
  return random_number;
};
class_c2mAPI_batch.prototype.createBatchMailing = async function (
  pdfFile,
  callBack
) {
  this.batchCallBack = callBack;

  if (merger.doc) {
    //console.log("merger doc exists");
    if (merger.doc.pageCount > 0) {
      if (pdfFile) {
        merger.add(pdfFile);
      }

      pdfFile = `${os.tmpdir()}/${this.getRandomFileName()}.pdf`;
      console.log(pdfFile);
      await merger.save(pdfFile);
      merger = new PDFMerger();
      this.pagesBeforeAdding = 0;
    }
  }
  this.batchPDFFile = pdfFile;
  this.createBatch();
};

class_c2mAPI_batch.prototype.createBatchListXML = function () {
  var xml =
    '<?xml version="1.0" encoding="UTF-8"?><batch xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"> \
    <filename>' +
    escapeXML(this.batchPDFFile) +
    "</filename> \
    <appSignature>c2m NodeJS SDK</appSignature>";

  for (let index = 0; index < batchList.length; ++index) {
    xml += "<job>";
    xml +=
      "<startingPage>" +
      escapeXML(batchList[index]["startingPage"]) +
      "</startingPage>";
    xml +=
      "<endingPage>" +
      escapeXML(batchList[index]["endingPage"]) +
      "</endingPage>";
    xml += "<printProductionOptions>";
    xml +=
      "<documentClass>" +
      escapeXML(batchList[index]["docClass"]) +
      "</documentClass>";
    xml += "<layout>" + batchList[index]["layout"] + "</layout>";
    xml +=
      "<productionTime>" +
      escapeXML(batchList[index]["prodTime"]) +
      "</productionTime>";
    xml +=
      "<envelope>" + escapeXML(batchList[index]["envelope"]) + "</envelope>";
    xml += "<color>" + escapeXML(batchList[index]["color"]) + "</color>";
    xml +=
      "<paperType>" + escapeXML(batchList[index]["paperType"]) + "</paperType>";
    xml +=
      "<printOption>" +
      escapeXML(batchList[index]["printOption"]) +
      "</printOption>";
    xml +=
      "<mailClass>" + escapeXML(batchList[index]["mailClass"]) + "</mailClass>";
    xml += "</printProductionOptions>";

    if (batchList[index]["optionalKeys"]) {
      let count = 0;
      Object.entries(batchList[index]["optionalKeys"]).forEach(
        ([key, value]) => {
          // some sync code to run for each user
          xml += "<" + key + ">" + escapeXML(value) + "</" + key + ">";
          count++;
        }
      );
    }

    if (
      (batchList[index]["raName"] || batchList[index]["raOrganization"]) &&
      batchList[index]["raAddress1"]
    ) {
      xml += "<returnAddress>";
      xml += "<name>" + escapeXML(batchList[index]["raName"]) + "</name>";
      xml +=
        "<organization>" +
        escapeXML(batchList[index]["raOrganization"]) +
        "</organization>";
      xml +=
        "<address1>" +
        escapeXML(batchList[index]["raAddress1"]) +
        "</address1>";
      xml +=
        "<address2>" +
        escapeXML(batchList[index]["raAddress2"]) +
        "</address2>";
      xml += "<city>" + escapeXML(batchList[index]["raCity"]) + "</city>";
      xml += "<state>" + escapeXML(batchList[index]["raState"]) + "</state>";
      xml +=
        "<postalCode>" +
        escapeXML(batchList[index]["raPostalCode"]) +
        "</postalCode>";

      xml += "</returnAddress>";
    }

    xml += "<recipients>";
    if (
      batchList[index]["addressListBatch"] == undefined ||
      batchList[index]["addressListBatch"] == null
    ) {
      xml += "<address>";
      xml += "<name>" + escapeXML(batchList[index]["name"]) + "</name>";
      xml +=
        "<organization>" +
        escapeXML(batchList[index]["organization"]) +
        "</organization>";
      xml +=
        "<address1>" + escapeXML(batchList[index]["address1"]) + "</address1>";
      xml +=
        "<address2>" + escapeXML(batchList[index]["address2"]) + "</address2>";
      xml +=
        "<address3>" + escapeXML(batchList[index]["address3"]) + "</address3>";
      xml += "<city>" + escapeXML(batchList[index]["city"]) + "</city>";
      xml += "<state>" + escapeXML(batchList[index]["state"]) + "</state>";
      xml +=
        "<postalCode>" +
        escapeXML(batchList[index]["postalCode"]) +
        "</postalCode>";
      xml +=
        "<country>" + escapeXML(batchList[index]["country"]) + "</country>";
      if (batchList[index]["c2m_uniqueid"]) {
        xml +=
          "<c2m_uniqueid>" +
          escapeXML(batchList[index]["c2m_uniqueid"]) +
          "</c2m_uniqueid>";
      }

      xml += "</address>";
    } else {
      for (
        let indexd = 0;
        indexd < batchList[index]["addressListBatch"].length;
        ++indexd
      ) {
        xml += "<address>";
        xml +=
          "<name>" +
          escapeXML(batchList[index]["addressListBatch"][indexd]["name"]) +
          "</name>";
        xml +=
          "<organization>" +
          escapeXML(
            batchList[index]["addressListBatch"][indexd]["organization"]
          ) +
          "</organization>";
        xml +=
          "<address1>" +
          escapeXML(batchList[index]["addressListBatch"][indexd]["address1"]) +
          "</address1>";
        xml +=
          "<address2>" +
          escapeXML(batchList[index]["addressListBatch"][indexd]["address2"]) +
          "</address2>";
        xml +=
          "<address3>" +
          escapeXML(batchList[index]["addressListBatch"][indexd]["address3"]) +
          "</address3>";
        xml +=
          "<city>" +
          escapeXML(batchList[index]["addressListBatch"][indexd]["city"]) +
          "</city>";
        xml +=
          "<state>" +
          escapeXML(batchList[index]["addressListBatch"][indexd]["state"]) +
          "</state>";
        xml +=
          "<postalCode>" +
          escapeXML(
            batchList[index]["addressListBatch"][indexd]["postalCode"]
          ) +
          "</postalCode>";
        xml +=
          "<country>" +
          escapeXML(batchList[index]["addressListBatch"][indexd]["country"]) +
          "</country>";
        if (batchList[index]["addressListBatch"][indexd]["c2m_uniqueid"]) {
          xml +=
            "<c2m_uniqueid>" +
            escapeXML(batchList[index]["c2m_uniqueid"]) +
            "</c2m_uniqueid>";
        }

        xml += "</address>";
      }
    }
    xml += "</recipients>";
    xml += "</job>";
  }
  xml += "</batch>";

  return xml;
};

class_c2mAPI_batch.prototype.addToBatchListSingle = function (
  startingPage,
  endingPage,
  docClass,
  lay,
  prodTime,
  env,
  col,
  papType,
  printOpt,
  mClass,
  c2m_uniqueid,
  optionalKeys,
  name,
  organization,
  address1,
  address2,
  address3,
  city,
  state,
  postalCode,
  country,
  raName,
  raOrganization,
  raAddress1,
  raAddress2,
  raCity,
  raState,
  raPostalCode,

  callBack
) {
  var ra = {};
  if (raName || raOrganization) {
    ra.raName = raName;
    ra.raOrganization = raOrganization;
    ra.raAddress1 = raAddress1;
    ra.raAddress2 = raAddress2;
    ra.raCity = raCity;
    ra.raState = raState;
    ra.raPostalCode = raPostalCode;
  }
  var batchItem = {
    name: name,
    organization: organization,
    address1: address1,
    address2: address2,
    address2: address3,
    city: city,
    state: state,
    postalCode: postalCode,
    country: country,
    docClass: docClass,
    layout: lay,
    prodTime: prodTime,
    envelope: env,
    color: col,
    paperType: papType,
    printOption: printOpt,
    startingPage: startingPage,
    endingPage: endingPage,
    mailClass: mClass,
    c2m_uniqueid: c2m_uniqueid,
    ...ra,
  };
  //console.log(c2m_uniqueid);
  if (optionalKeys != null && typeof optionalKeys == "object") {
    batchItem.optionalKeys = optionalKeys;
  }
  batchList.push(batchItem);
  if (typeof callBack === "function") {
    callBack();
  }
};

class_c2mAPI_batch.prototype.addToBatchListSingleMerge = async function (
  pdfFile,
  docClass,
  lay,
  prodTime,
  env,
  col,
  papType,
  printOpt,
  mClass,
  c2m_uniqueid,
  optionalKeys,
  name,
  organization,
  address1,
  address2,
  address3,
  city,
  state,
  postalCode,
  country,
  raName,
  raOrganization,
  raAddress1,
  raAddress2,
  raCity,
  raState,
  raPostalCode,

  callBack
) {
  if (merger.doc) {
    this.pagesBeforeAdding = merger.doc.pageCount;
  }

  await merger.add(pdfFile);
  let pagesAfterAdding = merger.doc.pageCount;

  this.addToBatchListSingle(
    this.pagesBeforeAdding + 1,
    pagesAfterAdding,
    docClass,
    lay,
    prodTime,
    env,
    col,
    papType,
    printOpt,
    mClass,
    c2m_uniqueid,
    optionalKeys,
    name,
    organization,
    address1,
    address2,
    address3,
    city,
    state,
    postalCode,
    country,
    raName,
    raOrganization,
    raAddress1,
    raAddress2,
    raCity,
    raState,
    raPostalCode,

    callBack
  );
};
class_c2mAPI_batch.prototype.addToBatchListMulti = function (
  startingPage,
  endingPage,
  docClass,
  lay,
  prodTime,
  env,
  col,
  papType,
  printOpt,
  mClass,
  optionalKeys,
  addressList,
  raName,
  raOrganization,
  raAddress1,
  raAddress2,
  raCity,
  raState,
  raPostalCode,

  callBack
) {
  var ra = {};
  if (raName || raOrganization) {
    ra.raName = raName;
    ra.raOrganization = raOrganization;
    ra.raAddress1 = raAddress1;
    ra.raAddress2 = raAddress2;
    ra.raCity = raCity;
    ra.raState = raState;
    ra.raPostalCode = raPostalCode;
  }
  var batchItem = {
    addressListBatch: addressList,
    docClass: docClass,
    layout: lay,
    prodTime: prodTime,
    envelope: env,
    color: col,
    paperType: papType,
    printOption: printOpt,
    startingPage: startingPage,
    endingPage: endingPage,
    mailClass: mClass,
    ...ra,
  };
  if (optionalKeys != null && typeof optionalKeys == "object") {
    batchItem.optionalKeys = optionalKeys;
  }
  batchList.push(batchItem);
  if (typeof callBack === "function") {
    console.log(callBack);
    callBack();
  }
};

class_c2mAPI_batch.prototype.addToBatchListMultiMerge = async function (
  pdfFile,
  docClass,
  lay,
  prodTime,
  env,
  col,
  papType,
  printOpt,
  mClass,
  optionalKeys,
  addressList,
  raName,
  raOrganization,
  raAddress1,
  raAddress2,
  raCity,
  raState,
  raPostalCode,

  callBack
) {
  if (merger.doc) {
    this.pagesBeforeAdding = merger.doc.pageCount;
  }
  await merger.add(pdfFile);
  let pagesAfterAdding = merger.doc.pageCount;

  this.addToBatchListMulti(
    this.pagesBeforeAdding + 1,
    pagesAfterAdding,
    docClass,
    lay,
    prodTime,
    env,
    col,
    papType,
    printOpt,
    mClass,
    optionalKeys,
    addressList,
    raName,
    raOrganization,
    raAddress1,
    raAddress2,
    raCity,
    raState,
    raPostalCode,

    callBack
  );
};

class_c2mAPI_batch.prototype.getBatchURL = function () {
  if (this.mode == "Live") {
    return batchURL;
  } else {
    return stageBatchURL;
  }
};

class_c2mAPI_batch.prototype.createBatch = function (callBack) {
  //console.log("creating batch", typeof callBack);

  //console.log(auth);
  self = this;
  //console.log("Trying buffer");
  var auth =
    "Basic " + Buffer.from(this.username + ":" + this.passw).toString("base64");
  //console.log(auth);

  // console.log(new Buffer(this.username + ":" + this.passw).toString("base64"));
  var options = {
    url: this.getBatchURL() + "/v1/batches",
    //port: 443,
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(this.username + ":" + this.passw).toString("base64"),
    },
  };

  request(options, function (err, res, body) {
    if (err) {
      if (typeof self.batchCallBack === "function") {
        self.batchCallBack(0, err);
        self.batchCallBack = undefined;
      }
      return;
    }
    //console.dir('headers', res.headers)
    //console.dir('status code', res.statusCode)
    //console.dir(body)
    if (res.statusCode >= 200 && res.statusCode <= 299) {
      parseString(body, function (err, result) {
        //  console.log(batchID);
        self.batchID = result.batchjob.id.toString();

        //  console.log("BatchID:" + self.batchID);
        //console.log("THIS IS THE AUTO PROCESS", self.autoProcess);
        if (self.autoProcess) {
          //console.log("IN SELF AUTO PROCESS");
          self.uploadBatchXML();
        } else {
          if (typeof callBack === "function") {
            callBack();
          }
        }
      });
    } else {
      if (typeof self.batchCallBack === "function") {
        self.batchCallBack(0, res.statusCode + ":" + res.statusMessage);
        self.batchCallBack = undefined;
      }
    }
  });
};
class_c2mAPI_batch.prototype.uploadBatchXML = function (callBack) {
  self = this;
  //  console.log("batch xml", typeof callBack);

  var fileName = os.tmpdir() + "/" + this.guid() + ".tmp";
  //console.log(self.getBatchURL());
  //console.log(this.createBatchListXML());
  //console.log("ABOUT TO TRY TO UPLOAD XML");
  fs.writeFile(fileName, this.createBatchListXML(), function (err) {
    if (err) {
      return console.log(err);
    }
    const stats = fs.statSync(fileName);
    const fileSize = stats.size;
    var file = fs.createReadStream(fileName).pipe(
      request.put(
        {
          url: self.getBatchURL() + "/v1/batches/" + self.batchID,
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(self.username + ":" + self.passw).toString("base64"),
            "Content-Type": "application/xml",
            "Content-Length": fileSize,
            "User-Agent":
              "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)",
          },
        },
        function (err, res, body) {
          if (err) {
            console.log("error", err);
            if (typeof self.batchCallBack === "function") {
              self.batchCallBack(0, err);
              self.batchCallBack = undefined;
            }
          } else {
            //   console.log("status", res.statusCode);

            if (res.statusCode >= 200 && res.statusCode <= 299) {
              //              console.log("success");
              // fs.unlinkSync(fileName);

              if (self.autoProcess) {
                self.uploadBatchPDF();
              } else {
                if (typeof callBack === "function") {
                  callBack();
                }
              }
            } else {
              console.log(
                "Error with batch XML upload, StatusCode",
                res.statusCode,
                res.statusMessage
              );
              if (typeof self.batchCallBack === "function") {
                self.batchCallBack(0, res.statusCode + ":" + res.statusMessage);
                self.batchCallBack = undefined;
              }
            }
          }
        }
      )
    );
  });
};

class_c2mAPI_batch.prototype.uploadBatchPDF = function (callBack) {
  console.log("UPLOADING BATCH PDF");
  self = this;
  var fileName = this.batchPDFFile;
  const stats = fs.statSync(fileName);
  const fileSize = stats.size;
  var file = fs.createReadStream(fileName).pipe(
    request.put(
      {
        url: this.getBatchURL() + "/v1/batches/" + this.batchID,
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(this.username + ":" + this.passw).toString("base64"),
          "Content-Type": "application/pdf",
          "Content-Length": fileSize,
        },
      },
      function (err, res, body) {
        if (err) {
          //console.log("error", err);
          // throw "ERROR IN PDF Upload";
          if (typeof self.batchCallBack === "function") {
            self.batchCallBack(0, err);
            self.batchCallBack = undefined;
          }
        } else {
          //console.log('status', res.statusCode);
          if (res.statusCode >= 200 && res.statusCode <= 299) {
            console.log("successful Upload of PDF");
            if (self.autoProcess) {
              self.submitBatch();
            } else {
              if (typeof callBack === "function") {
                callBack();
              }
            }
          } else {
            if (typeof self.batchCallBack === "function") {
              self.batchCallBack(0, res.statusCode + ":" + res.statusMessage);
              self.batchCallBack = undefined;
            }
          }
        }
      }
    )
  );
};
class_c2mAPI_batch.prototype.submitBatch = function (callBack) {
  console.log("SUBMITTING BATCH");
  self = this;
  var options = {
    url: this.getBatchURL() + "/v1/batches/" + this.batchID,
    //port: 443,
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(this.username + ":" + this.passw).toString("base64"),
    },
  };

  request(options, function (err, res, body) {
    if (err) {
      if (typeof self.batchCallBack === "function") {
        self.batchCallBack(0, err);
        self.batchCallBack = undefined;
      }
      return;
    }
    if (res.statusCode >= 200 && res.statusCode <= 299) {
      //console.dir('headers', res.headers)
      //console.dir('status code', res.statusCode)
      //console.dir(body)
      parseString(body, function (err, result) {
        //console.log(body);
        if (self.autoProcess) {
          self.getBatchStatus();
        } else {
          if (typeof callBack === "function") {
            callBack();
          }
        }
      });
    } else {
      if (typeof self.batchCallBack === "function") {
        self.batchCallBack(0, res.statusCode + ":" + res.statusMessage);
        self.batchCallBack = undefined;
      }
    }
  });
};
class_c2mAPI_batch.prototype.getBatchStatus = function (callback) {
  //console.log(auth);

  self = this;
  var options = {
    url: this.getBatchURL() + "/v1/batches/" + this.batchID,
    //port: 443,
    method: "GET",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(this.username + ":" + this.passw).toString("base64"),
    },
  };

  request(options, function (err, res, body) {
    if (err) {
      console.dir(err);
      return;
    }
    //console.dir('headers', res.headers)
    //console.dir('status code', res.statusCode)
    //console.dir(body)
    parseString(body, function (err, result) {
      //	console.log(body);
      //  console.log("CALLBACK TYPE", typeof self.batchCallBack);
      if (typeof self.batchCallBack === "function") {
        self.batchCallBack(self.batchID, body);
        self.batchCallBack = undefined;
      }
      if (typeof callback === "function") {
        callback(self.batchID, body);
      }
    });
  });
};
class_c2mAPI_batch.prototype.getBatchStatusDetails = function (callback) {
  //console.log(auth);

  self = this;
  var options = {
    url: this.getBatchURL() + "/v1/batches/" + this.batchID + "/details",
    //port: 443,
    method: "GET",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(this.username + ":" + this.passw).toString("base64"),
    },
  };

  request(options, function (err, res, body) {
    if (err) {
      console.dir(err);
      return;
    }
    //console.dir('headers', res.headers)
    //console.dir('status code', res.statusCode)
    //console.dir(body)
    parseString(body, function (err, result) {
      //	console.log(body);
      if (typeof self.batchCallBack === "function") {
        self.batchCallBack(self.batchID, body);
        self.batchCallBack = undefined;
      }
      if (typeof callback === "function") {
        callback(self.batchID, body);
      }
    });
  });
};

function escapeXML(unsafe) {
  //console.log(unsafe);
  if (!unsafe) return "";
  return unsafe.toString().replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
    }
  });
}
module.exports = class_c2mAPI_batch;
