/**
 * getData.ts
 *
 * function：get all data from urls
**/

'use strict';

// read modules
import * as fs from 'fs'; // fs
import readline from 'readline'; // readline
import readlineSync from 'readline-sync'; // readsync
import { Scrape } from './class/myScraper'; // scraper
import { Aggregate } from './class/myAggregator'; // aggregator

// scraper
const scraper = new Scrape();
// aggregator
const aggregator = new Aggregate();

// header
const sheetTitleArray: string[][] = [
  ['馬名', '生日', '生国', '毛色', '供用', '勝鞍', '父', '母', '母父', 'インブリード', '産駒勝鞍（海外）', '産駒勝鞍（国内）']
];

// read urls
const readLines = async (): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      // urls
      let urls: string[] = new Array();
      // list files
      const fileList: string[] = await listFiles();
      // select file
      const targetfileName: string = await showDialog(fileList);
      // make readstream
      const rs: fs.ReadStream = fs.createReadStream(`./txt/${targetfileName}`);
      // config ure interface
      const rl: readline.Interface = readline.createInterface({
        // stream setting
        input: rs
      });

      // read one by one
      rl.on('line', (lineString:any) => {
        // push into array
        urls.push(lineString);
      });

      // close readline
      rl.on('close', () => {
        console.log("END!");
        // resolve
        resolve(urls);
      });

    } catch (e: unknown) {
      // error
      console.log(e);
      // rejected
      reject();
    }
  });
}

// * general functions
// show diallog
const showDialog = (array: string[]): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // dialog options
      const index: number = readlineSync.keyInSelect(array, 'which file?');
      console.log(`read ${array[index]}.`);
      // return target filename
      resolve(array[index]);

    } catch (e: unknown) {
      // error
      console.log(e);
      // rejected
      reject();
    }
  });
}

// list files
const listFiles = (): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      // file list
      const fileNames: string[] = await fs.promises.readdir('./txt');
      // return filename array
      resolve(fileNames);

    } catch (e: unknown) {
      // error
      console.log(e);
      // rejected
      reject();
    }
  });
}

// write files
const writeXLSX = (filename: string, array: string[][]): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      // init
      await aggregator.init(filename);
      // push data
      await aggregator.writeData(sheetTitleArray, array, 'data');
      // make csv
      await aggregator.makeCsv(filename);
      // resolved
      resolve();

    } catch (e: unknown) {
      // error
      console.log(e);
      // rejected
      reject();
    }
  });
}

// make empty xlsx
const makeEmptyXlsx = (filePath: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
        // create empty file
        fs.writeFile(filePath, '', (err: unknown) => {
          // error
          if (err) throw err;
          console.log('File is created successfully.');
        });
        // resolved
        resolve();

    } catch (e: unknown) {
      // error
      console.log(e);
      // rejected
      reject();
    }
  });
}

// main
(async (): Promise<void> => {
  try {
    // variables
    let tmpArray: string[] = [];
    let strArray: string[][] = [];
    // target selector
    const selectorArray: string[] = ['title', 'table tr:nth-child(1) td', 'table tr:nth-child(2) td', 'table tr:nth-child(3)  td', 'table tr:nth-child(4) td', 'table tr:nth-child(8) td', 'table tr:nth-child(12) td', 'table tr:nth-child(13) td', 'table tr:nth-child(14) td', 'table tr:nth-child(15) td', 'table tr:nth-child(23) td', 'table tr:nth-child(24) td'];
    // urls
    const linkArray: string[] = await readLines();

    // initialize
    await scraper.init();

    // counter
    let counter: number = 0;
    // loop urls
    for (const url of linkArray) {
      console.log(`scraping...${counter}`);
      // goto shuboba-profile
      await scraper.doGo(url);
      // loop in selectors
      for (const sel of selectorArray) {
        // result
        const result: string = await scraper.doSingleEval(sel, 'textContent');
        // get into array
        tmpArray.push(result);
      }
      // push to tmp array
      strArray.push(tmpArray);
      // empty tmp array
      tmpArray = [];
      // increment
      counter++;
    }

    // filename
    const fileName: string = (new Date).toISOString().replace(/[^\d]/g, "").slice(0, 14);
    // filepath
    const filePath: string = `./xlsx/${fileName}.xlsx`;
    // make empty xlsx
    await makeEmptyXlsx(filePath);
    // write data
    await writeXLSX(`./xlsx/${fileName}.xlsx`, strArray);

    // close browser
    await scraper.doClose();

  } catch (e: unknown) {
    // error
    console.log(e);
  }

})();