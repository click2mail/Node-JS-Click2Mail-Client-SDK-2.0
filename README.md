# Node-JS-Click2Mail-Client-SDK-2.0
Batch API SDK 2.0 written for node.js

Batch API has a constructor class which will have to be initiated before each use:

import c2mAPIBatch from "../class_c2mAPI_batch.js";
var user= "testUser";
var pw="testPW";
var mode = "Stage"  

#Change to blank or "Production" for live.
var c2m = new c2mAPIBatch(user, pw, mode); 





