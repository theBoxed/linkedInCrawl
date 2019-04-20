const logger = require('./logger')
const dependencies = {
  config: require('../config.json'),
  scrapProfile: require('./scrapProfile')
}

const WORKER_INTERVAL_MS = 1000

module.exports = async (profileScraper, rootProfiles, leadList, injection) => new Promise((resolve) => {
  console.log('PROFILESCRAPPER => ', profileScraper);
  console.log('ROOTPROFILES => ', rootProfiles);
  console.log('INJECTION => ', injection);
  console.log('LEADLIST => ', leadList);
  const {
    config,
    scrapProfile
  } = Object.assign({}, dependencies, injection)

  let currentProfilesToCrawl = rootProfiles
  let nextProfilesToCrawl = []

  let parallelCrawlers = 0
  //Crawl the individual profile url.
  //Adds relatedProfiles to nextProfilesToCrawl
  const crawl = async (profileUrl) => {
    parallelCrawlers++
    logger.info(`starting scraping: ${profileUrl}`)

    const relatedProfiles = await scrapProfile(profileScraper, profileUrl, leadList);
    nextProfilesToCrawl = nextProfilesToCrawl.concat(relatedProfiles)

    // logger.info(`finished scraping: ${profileUrl} , ${relatedProfiles.length} profile(s) found!`)
    parallelCrawlers--
  }

  const interval = setInterval(() => {
    //Resolve promise if current and relatedProfiles have all been crawled.
    if (currentProfilesToCrawl.length === 0 && nextProfilesToCrawl.length === 0) {
      logger.info('crawler finished: there are no more profiles found with specified keywords')
      clearInterval(interval)
      resolve()
    } 
    //Check if all current profiles have been crawled. If yes update currentProfiles to be nextProfiles. 
    else if (currentProfilesToCrawl.length === 0) {
      logger.info(`a depth of crawling was finished, starting a new depth with ${nextProfilesToCrawl.length} profile(s)`)
      currentProfilesToCrawl = nextProfilesToCrawl
      nextProfilesToCrawl = []
    } 
    //if there is room to crawl then continue.
    else if (parallelCrawlers < config.maxConcurrentCrawlers) {
      const profileUrl = currentProfilesToCrawl.shift()
      crawl(profileUrl)
    }
  }, WORKER_INTERVAL_MS)
})
