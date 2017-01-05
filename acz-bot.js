module['exports'] = function echoBot (hook) {
   
    function logger(message) {
    	//sendToClient(message);
    }
    function isBlank(str) {
	    return (!str || /^\s*$/.test(str));
	}
    function memorise(inputText,store)
	{
		inputText=inputText.trim();
		inputText = inputText.toLowerCase();
		var splitCommand = inputText.split(" ")	;
		if(store.get(splitCommand[0])==null)
		{
			store.set(splitCommand[0],splitCommand[1],function(err,result){if(err) {
			logger("Saving payload error " + err.message);
			return;
		} });
		}
		else
		{
			sendToClient("this number is already memorised " + splitCommand[0]+" :");
		}
	}
	function getNumber(key,store)
	{
		a= store.get(key,function(err,result){
							if(result==null)
							{	sendToClient("old number");
								sendToClient(oldNumbers(key));
							}
							else
							{
								sendToClient(result);
							}
							
							});
		
	}

	function oldNumbers(inputText)
	{
		if(commonNumbers[inputText.toLowerCase()]!=undefined)  	
		{
			return "Intercom for " + inputText + " is " + commonNumbers[inputText.toLowerCase()];
		}
		modText=inputText.replace(/\s+/g,"");
		var flatregex = /([a-zA-Z]+)([\-]|\s+)*([g1-9][0-9][0-9])$/g;
		var match = flatregex.exec(modText);
		if(match==null)
		{
			var a = " ";
			for (var k in commonNumbers)
			{
				a+=k;
				a+=", ";
			}
			return "i know the numbers for these : "+a+" and can also tell you intercom for each flat";
		}
		if(match!=null) {

			var blockName = match[1].toUpperCase();
			var flatNumber = match[3];
			var originalFlatNumber = flatNumber;
			logger("Querying for Block - " + blockName + " Flat Number - " + flatNumber);

			var intercomNumber = blockToNumberCache[blockName];
			if (intercomNumber == undefined)
			return "is this  ("+blockName+") really a block in cyberzon ?";

			logger("Checking Flat floor for flat number " + flatNumber + " " + typeof(flatNumber));
			// Identify ground floor flats. 
			if(flatNumber.trim().toUpperCase() =="SECURITY")
			{
				intercomNumber+="00";
			return "Intercom for " + inputText + " is " + intercomNumber;	
			}


			var floor = flatNumber.charAt(0)
			if(flatNumber.substring(0, 1).toUpperCase() === "G") {
				logger("Ground floor flat found");
				intercomNumber = intercomNumber + "0";
			} else {
				var floornum = parseInt(floor);
				if (floornum!=floornum)
				return " that is not a real flat - "+originalFlatNumber;
				if(floornum<1)
				return "Ground floor in cyberzon starts with a G";
				if (blockName =="R"&&floornum>4)
				return "Have you looked at R block? that has only 5 floors!!"
		logger("Flat floor - " + flatNumber);
				intercomNumber = intercomNumber + flatNumber.charAt(0); // for other floors just use the string as-is 
				logger ("partial intercom number "+intercomNumber)
			}

			// Extract the rest of the string 
			flatNumber = flatNumber.substring(1);
			logger("Flat Number - " + flatNumber);
			var intFlat = parseInt(flatNumber);

			if (intFlat!=intFlat)
			return "Are you sure that this ("+originalFlatNumber+") is a flat Number? You should perhaps talk to RaviKiran";
			if(flatNumber.length>2)
				return "Are you sure that this ("+originalFlatNumber+") is a flat Number? You should perhaps talk to RaviKiran";
			if(intFlat>blockToflatsCache[blockName])
			return "you should be looking for a flat in cyberZon .. not elsewhere";
			if(intFlat<1)
			return "flat Numbers start from 1";
			intercomNumber = intercomNumber + intFlat;
			return "Intercom for " + inputText + " is " + intercomNumber;
		}
		else

			return "usage: /intercom <flatnumber> Example : /intercom AB-G01 or /intercom D-103";
	}
    function intercomFlats(inputText,store)
    {
    	inputText=inputText.trim();	
    	inputText = inputText.toLowerCase();
    	inputText = inputText.replace("for ","");
    	inputText = inputText.trim();
    	if(isBlank(inputText))
    	return "Please read the message and type the commands. Do not click on the links in the message. \n\n"+
    	"You can get the intercom for a flat by typing in  \"/intercom <flatnumber>\" Example : \n\n\"/intercom D-103\" \n"+
    	"\n The bot will respond with the flat number for the flat.\n\n\"Intercom for D-103 is 3113\" \n\n You can also get the flat number for facilities by typing in the name of the facility. example : \"/intercom sampoorna\" will get you the intercom for sampoorna.";
    	if(inputText.toUpperCase()=="DIL")
    	return "mere paas dil hei ...";
	    var phoneNo = getNumber(inputText,store);
	   
	
    }
	
	
  
  	function sendToClient(message) {
      request
          .post('https://api.telegram.org/bot' + hook.env.CyberZon_bot_key + '/sendMessage')
          .form({
              "chat_id": hook.params.message.chat.id,
              "text": message
          });
    }
    
    function help()
    {
    		return "Please read the message and type the commands. Do not click on the links in the message. \n\n"+
    	"You can get the intercom for a flat by typing in  \"/intercom <flatnumber>\" Example : \n\n\"/intercom D-103\" \n"+
    	"\n The bot will respond with the flat number for the flat.\n\n\"Intercom for D-103 is 3113\" \n\n You can also get the flat number for facilities by typing in the name of the facility. example : \"/intercom sampoorna\" will get you the intercom for sampoorna.";
    }

var commonNumbers = {
	"apms" : "444# & 333#",
	"nextel":"999# & 901#",
	"beam" : "533#",
	"maingate" : "101# & 502#",
	
	"foodcourt" : "552# & 553#",
	"restaurant" : "552# & 553# , 040-67485666 , 8498812449",
	"servicegate" : "517#",
	"clubhouse":"555#",
	"gym":"341#",
	"mph":"550#",
	"sampoorna":"350#",
	"spa":"2366#",
	"ourkidz":"513#"
	
};
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
	
	var blockToflatsCache = {
		  "AB" : 10,
		  "C" : 4,
		  "D" : 3,
		  "E" : 10,
		  "F" : 8,
		  "G" : 10,
		  "H" : 10,
		  "I" : 10,
		  "J" : 10,
		  "K" : 10,
		  "L" : 10,
		  "M" : 10,
		  "N" : 10,
		  "O" : 10,
		  "P" : 10,
		  "Q" : 10,
		  "R" : 4,
		  "S" : 10,
		  "T" : 10,
		  "U" : 10
	};
  
	try {
		var request = require('request');
		var inputText = hook.params.message.text;
		var store = hook.datastore;
		var ret;
		
	        if(inputText.substring(0,1)=="/")
	        {
	                var splitCommand = inputText.split(" ")	;
			var command = splitCommand[0].toLowerCase();	        
			splitCommand.shift();
			switch(command)
			{
				case "/intercom" : 
						ret = intercomFlats(splitCommand.join(" "),store);
						break;
				case "/toby" : 
						ret = intercomFlats(splitCommand.join(" "));
						break;
				case "/remember" :
						ret = memorise(splitCommand.join(" "),store);
						break;
				case "/help" :ret = help();
					sendToClient(ret);
						break;
				default : ret=help();
			}
			//sendToClient(ret);
			return;
		} else {
			logger("Unable to understand what you sent. Please send Block-FlatNumber (ex: AB-101) \n (" + hook.params.message.text + ")");
		}
		
	} catch(ex) {
		logger("Error " + ex.message);
    }  	
};