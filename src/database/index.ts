'use strict';
import * as R from "ramda";
import * as colors from "colors";
import mongoose from "mongoose";

import { QdrantClient } from '@qdrant/js-client-rest'; // 引入向量数据建库

const db_admin = 
!R.isNil(process.env.APP_DB_PASSWORD) && !R.isNil(process.env.APP_DB_USERNAME) && !R.isEmpty(process.env.APP_DB_PASSWORD) && !R.isEmpty(process.env.APP_DB_USERNAME) ? 
`${process.env.APP_DB_USERNAME}:${process.env.APP_DB_PASSWORD}@`:``

console.log(colors.blue('database:'),colors.green(`mongodb://${db_admin}${process.env.APP_DB_URL}/${process.env.APP_DB_NAME}`))

mongoose.connect(`mongodb://${db_admin}${process.env.APP_DB_URL}/${process.env.APP_DB_NAME}`).then(() => {
    console.log('MongoDB Connected!');
});

const qdrantClient = new QdrantClient({
    url: 'https://97aa742f-0c02-40f7-9705-2061f9bd3045.us-east4-0.gcp.cloud.qdrant.io:6333',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.cdp98qLH-4FPAJc0k5NtpL0IsNZGD7qxzfM_5jMTyyg',
});
async function teste(){
  try {
      const result = await qdrantClient.getCollections();
      console.log('List of collections:', result.collections);
  } catch (err) {
      console.error('Could not get collections:', err);
  }
}
teste()
export { mongoose, qdrantClient} ;
