//Populate a google sheet
'use strict';
const async = require('async');

module.exports = (profileId, content, leadList, injection) => {
  console.log('POSITIONS => ', content.positions[0].title);

  const {name, headline, location, summary, connections} = content.profile;
  const title = content.positions[0].title; 
  const company = content.positions[0].companyName;
  const {positions, education, skills, accomplishments, peopleAlsoViewed} = content;
  const recommendationsGiven = content.recommendations.given;
  const recommendationsReceived = content.recommendations.received;

  const userProfile = {
    date: Date.now(),
    name,
    headline,
    location,
    summary,
    connections,
    title, 
    company,
    positions,
    education,
    skills,
    accomplishments,
    related: peopleAlsoViewed,
    recommendationsgiven: recommendationsGiven,
    recommendationsreceived: recommendationsReceived
  };

  async.series([
    function addProfiles(step){
      leadList.addRow(userProfile, (err, rows)=>{
        console.log(rows);
        step();
      });
    }], function (err) {
    if (err) {
      console.log('Error: ' + err);
    }
  });
};
