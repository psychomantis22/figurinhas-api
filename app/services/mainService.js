import AlbumService from "./albumService.js";

export default {
    injectServices: async (req, res, next) => {
        if (!req.app.albumService) {
            req.app.albumService = new AlbumService(req.app.db);
        };
        
        next();
    }
}