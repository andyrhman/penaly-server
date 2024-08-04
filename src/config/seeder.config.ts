require('dotenv').config();
import { DataSource } from "typeorm";

const seederSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [
        "src/entity/*.ts"
    ],
    logging: false,
    synchronize: process.env.NODE_ENV === 'development'
    // ssl: true,
});

export default seederSource;