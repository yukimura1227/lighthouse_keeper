import fs from 'fs';
//@ts-ignore
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import * as lighthouse_target_list from '../lighthouse_target_list.json';
import { protocol, domain } from '../lighthouse_target_list.json';
import { TargetListEntity } from 'lighthouse_target_list.json';

const launchChrome = async () => {
  return await chromeLauncher.launch({
    chromeFlags: ['--headless']
  });
};

const detectOutputFormat = async (argv : string[]) => {
  let outputFormat : 'html' | 'json' | 'csv' = 'html';
  if( argv.length >= 3) {
    if(argv[2] == 'json') {
      outputFormat = 'json';
    } else if(argv[2] == 'csv') {
      outputFormat = 'csv';
    }
  }
  return outputFormat;
}

const buildFullUrl = async (targetInfo: TargetListEntity) => {
  return `${protocol}://${domain}/${targetInfo.url}`
}

const generateOutputFileName = async (targetInfo: TargetListEntity) => {
  let outFileName:String;
  if( targetInfo.key ) {
    outFileName = targetInfo.key;
  } else {
    outFileName = (await buildFullUrl(targetInfo)).replace(/[:,\/\.]/g, '_');
  }
  return outFileName;
}

(async () => {
  const outputFormat = await detectOutputFormat(process.argv);
  const chrome = await launchChrome();
  const options = {
    logLevel: 'info',
    output: outputFormat,
    onlyCategories: ['performance'],
    port: chrome.port
  };

  for (let target of lighthouse_target_list.target_list) {
    console.log(target);

    const url = await buildFullUrl(target);
    const runnerResult = await lighthouse(url, options);
    const outFileName = await generateOutputFileName(target);

    fs.writeFileSync(`output/${outFileName}.${outputFormat}`, runnerResult.report);

    // `.lhr` is the Lighthouse Result as a JS object
    console.log('Report is done for', runnerResult.lhr.finalUrl);
    console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100);
  }

  await chrome.kill();
})();