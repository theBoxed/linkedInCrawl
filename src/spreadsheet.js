'use strict';

// const GoogleSpreadsheet = require('google-spreadsheet');
// const creds = require('../client_secret.json');
// const async = require('async');
// const scrapedin = require('scrapedin');
// const configFile = require('../config.json');
// const crawl = require('./crawler');

// // Create a document object using the ID of the spreadsheet - obtained from its URL.
// const doc = new GoogleSpreadsheet('1ndpKEkHGehM-cZEMpoqXDYgutCzYqR2wdmf6NnKoQ6M');
// let profileList;
// let leadList;
// let rootProfiles;

// const isCrawled = (row) => row.crawled === 'N';

// const config = {
//   email: process.env.SCRAPEDIN_EMAIL || configFile.email,
//   password: process.env.SCRAPEDIN_PASSWORD || configFile.password,
//   relatedProfilesKeywords: configFile.relatedProfilesKeywords,
//   maxConcurrentCrawlers: configFile.maxConcurrentCrawlers,
//   hasToLog: configFile.hasToLog,
//   rootProfiles:  null,
//   isHeadless: false
// };


async.series([
  function setAuth(step){
    // const creds_json = {
    //   client_email: 'emailaddressfor service account',
    //   private_key: 'long private key'
    // };
    doc.useServiceAccountAuth(creds, step);
  },

  function getInfoAndWorksheets(step){
    doc.getInfo((err, info) => {
      console.log('Loaded doc: '+ info.title+' by '+info.author.email);
      profileList = info.worksheets[0];
      leadList = info.worksheets[1];
      console.log('sheet 1: ' + profileList.title + ' ' + profileList.rowCount + 'x' + profileList.colCount);
      step();
    });
  },

  function workingWithRows(step){
    profileList.getRows({
      offset: 1,
      limit: 20,
    }, (err, rows)=> {
      console.log('Read '+rows.length+ ' rows');
      rootProfiles = rows.filter(isCrawled);
      step();
    });
  },
  function scrapLinkedIn(step){
    config.rootProfiles = rootProfiles.map(row => row.url);
    scrapedin(config).then((profileScraper) => crawl(profileScraper, config.rootProfiles));
    step();
  },
  function createLeadsSheet(step){
    //Update profile sheet so N says Y

  }


], function(err) {
  if(err) {
    console.log('Error: ' + err);
  }
}
);

