// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config(); // first import
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

const CLIENT_HOST = process.env.CLIENT_HOST;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
      cors: {
        origin: CLIENT_HOST,
        credentials: true
      }
    }
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(5000);
}

bootstrap();
