const fs = require('fs')
const path = require('path')
const metrics = require('./metrics')

async function refreshMetrics (urlList) {
  const metricsList = []
  for (const [index, url] of urlList.entries()) {
    console.log('Fetching URL', (index + 1), 'of', urlList.length)
    let urlMetrics
    try {
      urlMetrics = await metrics.fetchURL(url)
    } catch (e) {
      console.log('Error while fetching:', e)
      console.log('Ignoring', url, 'due to error\n')
      continue
    }
    if (urlMetrics.totalSize > 10240) {
      console.log('Ignoring', url, 'because totalSize is too large\n')
      continue
    }
    metricsList.push(urlMetrics)
  }
  return metricsList.sort((a, b) => a.totalSize - b.totalSize)
}

function writeMetrics (metricsList) {
  const urlMetrics = {
    metricsTime: new Date().toUTCString(),
    metricsList: metricsList
  }
  const jsonString = JSON.stringify(urlMetrics, null, 2) + '\n'
  const metricsPath = path.join(__dirname, '..', 'metrics.json')
  fs.writeFileSync(metricsPath, jsonString, 'utf8')
  console.log('Updated metrics.json with latest data')
}

async function main () {
  const urlPath = path.join(__dirname, 'urls.json')
  const urlData = JSON.parse(fs.readFileSync(urlPath, 'utf8'))
  const urlList = urlData.map(item => item.url)
  const metricsList = await refreshMetrics(urlList)
  writeMetrics(metricsList)
}

main()
