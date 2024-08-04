require("dotenv").config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import myDataSource from "./config/db.config";
import { routes } from "./routes";
import { ValidationMiddleware } from "./middleware/validation.middleware";
import { AppError } from "./utility/apperror.utility";
import { globalErrorHandler } from "./middleware/error.middleware";

// export const eventEmitter = new EventEmitter();

// import "./event/auth.listener"
// import "./event/order.listener"

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Continuing...');
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }
});

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(ValidationMiddleware);
app.use(
  cors({
    credentials: true,
    origin: [`${process.env.ORIGIN_1}`, `${process.env.ORIGIN_2}`],
  })
);

myDataSource
  .initialize()
  .then(async () => {
    routes(app);

    // Handle undefined routes
    app.all('*', (req, res, next) => {
      next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    });

    // Global error handling middleware
    app.use(globalErrorHandler);

    console.log("Database has been initialized!");
    const server = app.listen(process.env.PORT, () => {
      console.log("Server listening on port 8000");
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: any) => {
      console.error('UNHANDLED REJECTION! Continuing...');
      if (process.env.NODE_ENV === 'development') {
        console.error(err);
      }
      // Manually trigger the global error handler
      app.use((req, res, next) => {
        next(err);
      });
    });
  })
  .catch((err) => {
    console.error(err);
  });

export default app;