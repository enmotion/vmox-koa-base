'use strict';
import * as R from "ramda";
import * as colors from "colors";
import { QdrantClient } from '@qdrant/js-client-rest'; // 引入向量数据建库

/**
 * qdrant 数据库连接配置
 */
// 免费服务方案
const qdrantClient = new QdrantClient({
    url: 'https://97aa742f-0c02-40f7-9705-2061f9bd3045.us-east4-0.gcp.cloud.qdrant.io:6333',
    apiKey: process.env.APP_QDRANT_API_KEY,
});
// 免费服务方案
// const qdrantClient = new QdrantClient({
//   host:"localhost",
//   port:6333
// });

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
        await qdrantClient.createPayloadIndex(collectionName, { field_name:"status", field_schema:'bool'});
        await qdrantClient.createPayloadIndex(collectionName, { field_name:"genre", field_schema:'keyword'});
        await qdrantClient.createPayloadIndex(collectionName, { field_name:"writingMethods", field_schema:'keyword'});
        await qdrantClient.createPayloadIndex(collectionName, { field_name:"sync", field_schema:'keyword'});
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

export default qdrantClient