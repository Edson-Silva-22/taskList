require('dotenv').config();
import { DataSource, DataSourceOptions } from "typeorm"

export const dataSourceOptions: DataSourceOptions = {
    type: "mysql",
    host: process.env.MYDB_HOST,
    port: 3306,
    username: process.env.MYDB_USERNAME,
    password: process.env.MYDB_PASSWORD,
    database: process.env.MYDB_NAME,
    entities: ['dist/entities/*.entity.{js,ts}'],
    migrations: ['dist/migrations/*.js']
}

const dataSource = new DataSource(dataSourceOptions)
dataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })

export default dataSource
