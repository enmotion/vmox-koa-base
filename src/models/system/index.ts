import useSystemService from "./base/service";
import useSystemController from "./base/controller";
import { mappingControllersAndRouter } from "@lib/routerTools";

export const systemService = useSystemService()
export const systemController = useSystemController(systemService)
export const systemRouter = mappingControllersAndRouter<ReturnType<typeof useSystemController>>('/system',systemController,[
  {routerPath:'/register2',method:'post',handlerName:'register'},
  {routerPath:'/sse2',method:'get',handlerName:'login'}
])