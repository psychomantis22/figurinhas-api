import { Request, Response, NextFunction } from 'express'
import AlbumService from "./albumService.js";
import TokenService from "./tokenService.js";
import FigurinhaService from './figurinhaService.js';

export default {
    injectServices: async (req: Request, res: Response, next: NextFunction) => {
        if (!req.app.locals.albumService) {
            req.app.locals.albumService = new AlbumService(req.app.locals.db);
        };

        if (!req.app.locals.tokenService) {
            req.app.locals.tokenService = new TokenService(req.app.locals.db);
        };

        if (!req.app.locals.figurinhaService) {
            req.app.locals.figurinhaService = new FigurinhaService(req.app.locals.db, req.app.locals.albumService);
        };
        
        next();
    }
}