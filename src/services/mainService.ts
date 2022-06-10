import { Request, Response, NextFunction } from 'express'
import AlbumService from "./albumService.js";

export default {
    injectServices: async (req: Request, res: Response, next: NextFunction) => {
        if (!req.app.locals.albumService) {
            req.app.locals.albumService = new AlbumService(req.app.locals.db);
        };
        
        next();
    }
}