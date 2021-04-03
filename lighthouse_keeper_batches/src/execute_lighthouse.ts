import fs from 'fs';
//@ts-ignore
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { protocol, domain } from '../lighthouse_target_list.json';
import { target_list } from '../lighthouse_target_list.json';
import { TargetListEntity } from 'lighthouse_target_list.json';

import AWS from "aws-sdk";
import { DynamoDB } from "aws-sdk";

AWS.config.update({
  credentials:  new AWS.Credentials(
    "local",
    "dummy"
  ),
  region: 'ap-northeast-1',
})
const dynamodbClient = new DynamoDB.DocumentClient({
  endpoint: 'http://localhost:8000',
});

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

  for (let target of target_list) {
    console.log(target);

    const url = await buildFullUrl(target);
    const runnerResult = await lighthouse(url, options);
    const outFileName = await generateOutputFileName(target);

    fs.writeFileSync(`output/${outFileName}.${outputFormat}`, runnerResult.report);

    // `.lhr` is the Lighthouse Result as a JS object
    console.log('Report is done for', runnerResult.lhr.finalUrl);
    console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100);

    let id =  String(Math.floor(Math.random() * Math.floor(100000000)));
    let recordData = {
      TableName: 'Test',
      Item: {
        "Id": id, // TODO: 自動的に採番する
        "DataGroupKey": outFileName,
        "performanceScore": runnerResult.lhr.categories.performance.score * 100
      }
    }

    await dynamodbClient.put(recordData, async (err, data) => {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data);
      }
    });
  }

  await chrome.kill();
})();