'use strict';

const dependencies = {
  extractRelatedProfiles: require('./extractRelatedProfiles'),
  saveProfile: require('./saveProfile'),
  logger: require('./logger'),
  getProfileIdFromUrl: require('./getIdFromProfileUrl')
}

module.exports = async (profileScraper, profileUrl, leadList, injection) => {
  const {
    extractRelatedProfiles,
    saveProfile,
    logger,
    getProfileIdFromUrl
  } = Object.assign({}, dependencies, injection)

  try {
    const profileId = getProfileIdFromUrl(profileUrl)
    const profile = await profileScraper('https://www.linkedin.com/in/' + profileId, 5000)

    await saveProfile(profileId, profile, leadList);

    const related = await extractRelatedProfiles(profile, profileId)
    return related
  } catch (e) {
    logger.error(`error on crawling profile: ${profileUrl} \n ${e}`)
  }
}
