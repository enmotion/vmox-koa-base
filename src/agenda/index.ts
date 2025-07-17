'use strict';
import Agenda from "agenda";
import colors from "colors";
import * as R from "ramda";
import type { Job } from "agenda";
import { mongoose } from "src/database";
import { CozeClient, config } from "src/sdk/coze";
import { mongoDB_URL } from "src/database/mongoDB";
import { modelEssayService } from "@modules/model-essay";

const { client } = new CozeClient(config)
// 创建
export function startAgendaTask(delay?:number){  
  setTimeout(async ()=>{
    await mongoose.connection.dropCollection('agenda')
    const agendaInstance = new Agenda({db:{address:`${mongoDB_URL}`, collection:'agenda'}})
    agendaInstance.define('modelEssayReview',async (job,done)=>{
      try{
        console.log(colors.blue("modelEssayReview workflow baseURL:"), colors.green(process.env?.APP_API_BASE_URL??'' as string))
        const modelEssays = await modelEssayService.find({processingStatus:1},null,{updatedAt:'asc'})
        if(modelEssays.items.length>0){
          const item = modelEssays.items[0];
          const parameters  = {
            composition:R.pick(['title','content'],item),
            uuid:item.uuid,
            apiBaseURL:process.env.APP_API_BASE_URL,
            is_test:0,
          }
          client.workflows.runs.create({
            workflow_id:'7527255614256267316',
            parameters:parameters,
            is_async:true
          }).then(async (res:any)=>{
            if(res.code==0){
              await modelEssayService.updateOne({uuid:parameters.uuid},{processingStatus:2, debugURL:res.debug_url})
              console.log(res)
            }
          }).catch(err=>{
            console.log(err);            
          })
        }
        done()
      }catch(err){
        console.log(err);
      }
    })
    await agendaInstance.start();
    await agendaInstance.every('3 seconds','modelEssayReview')
    console.log('agenda start')
  },delay??1000)
}
