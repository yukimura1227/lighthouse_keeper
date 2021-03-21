import fs from 'fs';
//@ts-ignore
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import * as lighthouse_target_list from '../lighthouse_target_list.json';

(async () => {
  let outputFormat : 'html' | 'json' | 'csv' = 'html';
  if( process.argv.length >= 3) {
    if(process.argv[2] == 'json') {
      outputFormat = 'json';
    } else if(process.argv[2] == 'csv') {
      outputFormat = 'csv';
    }
  }
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless']
  });
  const options = {
    logLevel: 'info',
    output: outputFormat,
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

    let outFileName:String;
    if( target.key ) {
      outFileName = target.key;
    } else {
      outFileName = url.replace(/[:,\/\.]/g, '_');
    }

    fs.writeFileSync(`output/${outFileName}.${outputFormat}`, runnerResult.report);

    // `.lhr` is the Lighthouse Result as a JS object
    console.log('Report is done for', runnerResult.lhr.finalUrl);
    console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100);
  }

  await chrome.kill();
})();