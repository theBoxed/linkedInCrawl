'use strict';

//Authenticate for Google Sheets => setAuth
//Get worksheet info => getWorksheetInfo
//pull profiles from worksheet => getProfileUrls
// ScrapLinkedIn
// Store leads in original worksheet

const GoogleSpreadsheet = require('google-spreadsheet');
const async = require('async');
const creds = require('../client_secret.json');
const configFile = require('../config.json');
const scrapedin = require('scrapedin');
const crawl = require('./crawler');

const config = {
  email: process.env.SCRAPEDIN_EMAIL || configFile.email,
  password: process.env.SCRAPEDIN_PASSWORD || configFile.password,
  relatedProfilesKeywords: configFile.relatedProfilesKeywords,
  maxConcurrentCrawlers: configFile.maxConcurrentCrawlers,
  hasToLog: configFile.hasToLog,
  rootProfiles:  null,
  isHeadless: false
};


const doc = new GoogleSpreadsheet('1ndpKEkHGehM-cZEMpoqXDYgutCzYqR2wdmf6NnKoQ6M');
let profileList;
let leadList;
let rootProfiles;

const isCrawled = (row) => row.crawled === 'N';

async.series([
  function setAuth(step){
    doc.useServiceAccountAuth(creds, step);
  },

  function getWorksheetInfo(step){
    doc.getInfo((err,info) => {
      //Sheet with profiles to crawl
      profileList = info.worksheets[0];
      //Sheets where leads are stored after being crawled
      leadList = info.worksheets[1];
      step();
    });
  },
  
  function getProfileUrls(step){
    profileList.getRows({
      offset: 1,
      limit: 20,
    }, (err, rows)=>{
      rootProfiles = rows.filter(isCrawled);
      step();
    });
  },
  function scrapLinkedIn(step){
    config.rootProfiles = rootProfiles.map(row => row.url);
    console.log('root', config.rootProfiles);
    scrapedin(config).then((profileScraper) => crawl(profileScraper, config.rootProfiles, leadList));
    step();
  }
  
] , function (err) {
  if (err) {
    console.log('Error: ' + err);
  }
});


