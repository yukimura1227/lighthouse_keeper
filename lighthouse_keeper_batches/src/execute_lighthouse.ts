const fs = require('fs');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
// import lighthouse_target_list from './lighthouse_target_list.json';

const lighthouse_target_list = 
{
  "protocol": "https",
  "domain": "github.com",
  "target_list": [
    { "url": "/"    },
    { "url": "/team"},
  ]
};

(async () => {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless']
  });
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance'],
    port: chrome.port
  };

  const protocol = lighthouse_target_list.protocol;
  const domain = lighthouse_target_list.domain;

  for (let i = 0; i < lighthouse_target_list.target_list.length; i++) {
    let target = lighthouse_target_list.target_list[i];
    console.log(target);

    const runnerResult = await lighthouse(`${protocol}://${domain}/${target.url}`, options);

    // `.report` is the HTML report as a string
    const reportHtml = runnerResult.report;
    fs.writeFileSync('output/lhreport.html', reportHtml);

    // `.lhr` is the Lighthouse Result as a JS object
    console.log('Report is done for', runnerResult.lhr.finalUrl);
    console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100);
  }

  await chrome.kill();
})();