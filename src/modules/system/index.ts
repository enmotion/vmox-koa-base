import useSystemService from "./core/service";
import useSystemController from "./core/controller";
import { mappingControllersAndRouter } from "@lib/routerTools";

export const systemService = useSystemService()
export const systemController = useSystemController(systemService)
export const systemRouter = mappingControllersAndRouter<ReturnType<typeof useSystemController>>('/system',systemController,[
  {routerPath:'/register',method:'post',handlerName:'register'},
  {routerPath:'/pub/upload',method:'post',handlerName:'upload'},
  {routerPath:'/register',method:'post',handlerName:'stream'},
  {routerPath:'/eventStream',method:'post',handlerName:'eventStream'}
])