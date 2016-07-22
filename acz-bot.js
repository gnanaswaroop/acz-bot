 module['exports'] = function echoBot (hook) {
   
    function logger(message) {
    	// sendToClient(message);
    }
  
  	function sendToClient(message) {
      request
          .post('https://api.telegram.org/bot' + hook.env.CyberZon_bot_key + '/sendMessage')
          .form({
              "chat_id": hook.params.message.chat.id,
              "text": message
          });
    }
	
	var blockToNumberCache = {
		  "AB" : "22",
		  "C" : "23",
		  "D" : "31",
		  "E" : "32",
		  "F" : "33",
		  "G" : "41",
		  "H" : "42",
		  "I" : "43",
		  "J" : "51",
		  "K" : "52",
		  "L" : "53",
		  "M" : "61",
		  "N" : "62",
		  "O" : "63",
		  "P" : "71",
		  "Q" : "72",
		  "R" : "73",
		  "S" : "74",
		  "T" : "81",
		  "U" : "82"
	};
  
	try {
		var request = require('request');
		var inputText = hook.params.message.text;
	  
		var splitArr = inputText.split('-');
		
		if(splitArr != null && splitArr.length == 2) {
			var blockName = splitArr[0];
			var flatNumber = splitArr[1];
		  
			logger("Querying for Block - " + blockName + " Flat Number - " + flatNumber);
			
			var intercomNumber = blockToNumberCache[blockName];
			
			logger("Checking Flat floor for flat number " + flatNumber + " " + typeof(flatNumber));
			// Identify ground floor flats. 
			if(flatNumber.substring(0, 1) === "G") {
            	logger("Ground floor flat found");
				intercomNumber = intercomNumber + "0";
			} else {
              	logger("Flat floor - " + flatNumber);
				intercomNumber = intercomNumber + flatNumber.charAt(0); // for other floors just use the string as-is 
			}
			
			// Extract the rest of the string 
			flatNumber = flatNumber.substring(1);
			logger("Flat Number - " + flatNumber);
			
			intercomNumber = intercomNumber + parseInt(flatNumber);
			sendToClient("Intercom for " + inputText + " is " + intercomNumber);
			return;
		} else {
			logger("Unable to understand what you sent. Please send Block-FlatNumber (ex: AB-101) \n (" + hook.params.message.text + ")");
		}
	} catch(ex) {
		logger("Error " + ex.message);
    }  	
};