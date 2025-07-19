# MongoDB数据备份指南：mongodump命令详解

mongodump是MongoDB官方提供的备份工具，它能够将数据库内容以BSON格式导出到本地文件，适用于数据备份和迁移场景。以下是使用mongodump进行数据备份的全面指南：

---

## mongodump基础命令

mongodump的基本语法结构如下：
```
mongodump --uri "mongodb://username:password@hostname:port/database" --out ./backup
// 复制线上的地址 指定集合备份到本地位置 mac
mongodump --uri="mongodb://username:password@hostname:port/mymongo" --collection="problem-collections" --out=./Desktop/zuowen2
// 迁移数据到指定集合
mongorestore --uri="mongodb://mymongo:aZMRHDpphPL5YiJZ@47.243.138.111:27017/mymongo" ~/Desktop/zuowen
mongorestore --uri="mongodb://127.0.0.1:27017/cms-copy" --collection="problem-collections2" ~/Desktop/zuowen2

```
##### 主要参数说明：

--host：MongoDB服务器地址(默认为localhost)
--port：MongoDB服务器端口(默认为27017)
--db：要备份的数据库名称
--out：备份文件输出目录‌1
简单示例：备份名为"mydatabase"的数据库到当前目录下的backup文件夹

```
mongodump --uri "mongodb://localhost:27017/{databasename}" --out ./backup
```
## mongorestore基础命令

mongorestore的基本语法结构如下：
```
mongorestore --uri "mongodb://user:pwd@dbserver:27017" --db mydb ./dump/mydb<output_directory>
```
##### 主要参数说明：

--host：MongoDB服务器地址(默认为localhost)
--port：MongoDB服务器端口(默认为27017)
--db：要备份的数据库名称
--out：备份文件输出目录‌1
简单示例：备份名为"mydatabase"的数据库到当前目录下的backup文件夹

```
mongorestore --uri "mongodb://localhost:27017" --db mydb ./dump/mydb
```