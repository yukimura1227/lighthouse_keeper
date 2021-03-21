import fs from 'fs';
//@ts-ignore
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import * as lighthouse_target_list from '../lighthouse_target_list.json';

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
  const domain   = lighthouse_target_list.domain;

  for (let i = 0; i < lighthouse_target_list.target_list.length; i++) {
    let target = lighthouse_target_list.target_list[i];
    console.log(target);

    const url = `${protocol}://${domain}/${target.url}`;

    const runnerResult = await lighthouse(url, options);

    // `.report` is the HTML report as a string
    const reportHtml = runnerResult.report;
    let outFileName:String;
    if( target.key ) {
      outFileName = target.key;
    } else {
      outFileName = url.replace(/[:,\/\.]/g, '_');
    }
    fs.writeFileSync(`output/${outFileName}.html`, reportHtml);

    // `.lhr` is the Lighthouse Result as a JS object
    console.log('Report is done for', runnerResult.lhr.finalUrl);
    console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100);
  }

  await chrome.kill();
})();