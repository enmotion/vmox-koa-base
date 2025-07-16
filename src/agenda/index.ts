'use strict';
import Agenda from "agenda";
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
        // console.log("modelEssayReview")
        // const modelEssays = await modelEssayService.find({processingStatus:1},null,{updatedAt:'asc'})
        // if(modelEssays.items.length>0){
        //   const item = modelEssays.items[0];
        //   const parameters  = {
        //     compostion:R.pick(['title','content'],item),
        //     uuid:item.uuid,
        //     isTest:true,
        //   }
        //   client.workflows.runs.create({
        //     workflow_id:'7527255614256267316',
        //     parameters:parameters,
        //     is_async:true
        //   }).then(async (res)=>{
        //     await modelEssayService.updateOne({uuid:parameters.uuid},{processingStatus:2})
        //     console.log(res)
        //   }).catch(err=>{
        //     console.log(err);            
        //   }).finally(()=>{
        //     done()
        //   })
        // }
      }catch(err){
        console.log(err);
      }
    })
    await agendaInstance.start();
    await agendaInstance.every('3 seconds','modelEssayReview')
    console.log('agenda start')
  },delay??1000)
}
