import fs from "fs";
import path from "path";
import colors from "colors";
import { dirname, join } from 'node:path';
import { cozeConfig } from "./config/coze_oauth_config";
import { getJWTToken, CozeAPI, COZE_CN_BASE_URL } from "@coze/api";

// 获取配置数据 coze_oauth_config.json 来自授权应用的范例代码
export const config:ConfigData = cozeConfig as any

export type OauthToken = {
  access_token : string,
  expires_in : number,
  token_type? : 'Bearer'
}

export type ConfigData = {
  client_type:"jwt"
  client_id:string
  coze_www_base:string
  coze_api_base:string
  public_key_id:string
  private_key:string
}
export class CozeClient{
  private config:Partial<ConfigData>
  private oauthToken : OauthToken | null = null
  public client:CozeAPI
  constructor(config:Partial<ConfigData>){
    this.config = config;
    this.client = new CozeAPI({
      baseURL : this.config.coze_api_base,
      token: async () => {
       this.oauthToken = await this._getToken();
       console.log(colors.blue('coze_access_token:'),colors.green(this.oauthToken.access_token))
       return this.oauthToken.access_token;
      },
    })
  };
  private async _getToken(){
    try{
      if(this.oauthToken?.expires_in && this.oauthToken.expires_in * 1000 > Date.now() + 5000){
        return this.oauthToken
      }else{
        const request = {
          baseURL : config.coze_api_base,
          appId : config.client_id,
          aud : new URL(config.coze_api_base).host,
          keyid : config.public_key_id,
          privateKey : config.private_key,
        }
        return await getJWTToken(request)
      }
    }catch(err){
      throw err
    }
  }
}

