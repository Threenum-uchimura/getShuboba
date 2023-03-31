/**
 * getLinks.ts
 *
 * function：get all links form shuboba-profile
**/

'use strict';

const DEF_SHUBOBA_URL: string = 'http://keiba.no.coocan.jp/data/_index_a-z.html'; // target url

// read modules
import * as fs from 'fs'; // fs
import { Scrape } from './class/myScraper'; // scraper

// scraper
const scraper = new Scrape();

// main
(async(): Promise<void> => {
  try {
    // urls
    let urlArray: string[] = [];
    // filename
    const fileName: string = (new Date).toISOString().replace(/[^\d]/g,"").slice(0, 14);
    // initialize
    await scraper.init();
    // goto shuboba-profile
    await scraper.doGo(DEF_SHUBOBA_URL);
    // wait
    await scraper.doWaitFor(1000);
    // get data
    urlArray = await scraper.doMultiEval('a', 'href');
    // combined data
    const str: string = urlArray.join("\n");
    // write file
    await fs.promises.writeFile(`./txt/${fileName}.txt`, str);
    // close browser
    await scraper.doClose();

  } catch(e) {
    console.log(e);
  }
  
})();