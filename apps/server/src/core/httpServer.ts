import express from 'express'
import http from 'http'

export class HttpServer {
   public static create() {
      const app = express()

      const server = http.createServer(app);

       const port = Number(process.env.PORT ?? 3001);
      server.listen(port, () => console.log(`🚀 Server has launched`));

      return { app }
   }
}
