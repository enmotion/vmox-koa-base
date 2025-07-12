'use strict';
import * as R from "ramda";
import * as colors from "colors";
import mongoose from "mongoose";
/**
 * moongoDB 数据库连接配置
 */
const db_admin = 
!R.isNil(process.env.APP_DB_PASSWORD) && !R.isNil(process.env.APP_DB_USERNAME) && !R.isEmpty(process.env.APP_DB_PASSWORD) && !R.isEmpty(process.env.APP_DB_USERNAME) ? 
`${process.env.APP_DB_USERNAME}:${process.env.APP_DB_PASSWORD}@`:``

console.log(colors.blue('database:'),colors.green(`mongodb://${db_admin}${process.env.APP_DB_URL}/${process.env.APP_DB_NAME}`))

mongoose.connect(`mongodb://${db_admin}${process.env.APP_DB_URL}/${process.env.APP_DB_NAME}`).then(() => {
    console.log(colors.green('MongoDB Connected!'));
});

export default mongoose ;
