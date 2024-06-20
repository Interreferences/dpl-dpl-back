import {NestFactory} from "@nestjs/core"
import {AppModule} from "./app.module";
import {ValidationPipe} from "./pipes/validation.pipe";

async function start() {
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create(AppModule)
    app.enableCors()
    app.useGlobalPipes(new ValidationPipe())

    await app.listen(PORT, ()=> console.log(`Сервер запущен на порте = ${PORT}`))
}

start()