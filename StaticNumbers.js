const https = require('https');
const config = require('./config');

class StaticNumbers {    

    constructor() {
        this.isCacheInitialized = false;
        this.lastCachedInitializedAt = null;
 
        console.log('Static Numbers is being initialized');
        this.queryForStaticRecords();
    };

    queryForStaticRecords() {
        // debugLog("Caching for static records " );
        var url = config.staticContentURL;
        // debugLog("URL for querying is " + url);
        var self = this;
        
        https
        .get(url, res => {
            var body = "";
            var isError = false;
            if (!res.statusCode == 200) {
                isError = true;
                console.log("Error fetching static numbers " + res.statusCode);
            }
            
            res.on("data", d => {
                body += d;
            });
            
            res.on('end', function() {
                if(!isError) {
                    var response = self.prepareResponse(body);
                }
                isError = false;
            });
        })
        .on("error", e => {
            // debugLog("Error " + e);
        });
    };
    
    prepareResponse(body) {
        var self = this;
        self.data = {};

        var allEntries = JSON.parse(body);

        if(allEntries.length <= 0) {
            console.log('No static content found - Check the source');
            return;
        }

        // Top level array 
        allEntries.forEach(function(entry) {
            var searchableEntry = {};
            Object.entries(entry).forEach(([key, value], index) => {
                // Ignore data if the key or value are blank 
                if(value == '' || key == '') {
                    return;
                }

                searchableEntry[key] = value;

                if(index === 0) {
                    self.data[value] = searchableEntry;
                } 
            });
        });

        self.isCacheInitialized = true;
        self.lastCachedInitializedAt = new Date();
        console.log(`Cache Initialized with ${Object.keys(self.data).length} entries at ${self.lastCachedInitializedAt}`);

        // TODO: Change this to be at an odd time in the night to avoid recaching during the day. 
        console.log('Schedule to query after 5 mins');
        setTimeout(this.queryForStaticRecords.bind(this), 5 * 60 * 1000);  
    };

    search(queryString) {
        var self = this;
        console.log(`query=${queryString}`);
        if(!queryString) {
            // send everything in case the query is blank 
            console.log('Blank query, return everything');
            return Object.values(self.data);
        }

        var searchResults = new Array();
        try {
            var regexCaseInsensitiveSearch = new RegExp(queryString, "i");

            Object.keys(self.data).forEach(function(k){
                // console.log(`Searching for ${queryString} - Curreny Key ${k}`);
                var lookupElement = k.match(regexCaseInsensitiveSearch) ? self.data[k] : null;
                if(lookupElement) {
                    // console.log(self.data[k]);
                    searchResults.push(lookupElement);
                }
            });
        } catch(ex) {
            // TODO: Instead of exception handling, add validations on input string 
            console.log(ex);
        }

        // console.log(searchResults);
        // console.log(searchResults.length);
        return searchResults;
    }
}

module.exports = StaticNumbers;