import { DataSource } from "typeorm";

const myDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [
        "src/entity/*.ts"
    ],
    logging: false,
    synchronize: true
});

export default myDataSource;