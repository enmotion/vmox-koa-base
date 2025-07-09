'use strict';
import * as R from "ramda";
import * as colors from "colors";
import mongoose from "mongoose";

import { QdrantClient } from '@qdrant/js-client-rest'; // 引入向量数据建库

/**
 * moongoDB 数据库连接配置
 */
const db_admin = 
!R.isNil(process.env.APP_DB_PASSWORD) && !R.isNil(process.env.APP_DB_USERNAME) && !R.isEmpty(process.env.APP_DB_PASSWORD) && !R.isEmpty(process.env.APP_DB_USERNAME) ? 
`${process.env.APP_DB_USERNAME}:${process.env.APP_DB_PASSWORD}@`:``
console.log(colors.blue('database:'),colors.green(`mongodb://${db_admin}${process.env.APP_DB_URL}/${process.env.APP_DB_NAME}`))
mongoose.connect(`mongodb://${db_admin}${process.env.APP_DB_URL}/${process.env.APP_DB_NAME}`).then(() => {
    console.log('MongoDB Connected!');
});

/**
 * qdrant 数据库连接配置
 */
const qdrantClient = new QdrantClient({
    url: 'https://97aa742f-0c02-40f7-9705-2061f9bd3045.us-east4-0.gcp.cloud.qdrant.io:6333',
    apiKey: process.env.APP_QDRANT_API_KEY,
});

const dimension = process.env.APP_VECTOR_DIMENTIONS ? parseInt(process.env.APP_VECTOR_DIMENTIONS) : 1024; // 默认向量维度为1024

const collectionNames:string[] = ['model-essay']

// qdrantClient.createCollection("dk", {
//   vectors: { size: dimension, distance: "Cosine" },
// });
async function initQdrantDataBase(){
  try {
    collectionNames.forEach(async(collectionName) => {
      const res = await qdrantClient.collectionExists(collectionName)
      if(!res.exists){
        await qdrantClient.createCollection(collectionName, {
          vectors: { size: dimension, distance: "Cosine" }}
        )
        console.log(colors.blue('qdrant create collection:'), colors.green(collectionName))
      }else{
        console.log(colors.blue('qdrant collection exists:'), colors.green(collectionName))
      }
    });
  } catch (error) {
    console.error('Error initializing Qdrant database:', error);
  }
}
initQdrantDataBase()
export { mongoose, qdrantClient} ;
