import express from 'express';
import httpProxy from 'http-proxy';
import createError from 'http-errors';

const app = express();
const proxy = httpProxy.createProxyServer({
    secure: false,
    changeOrigin: true,
    target: 'http://engage.videoapuntes.upv.es'
    // target: 'http://legacy.opencast.org'
    // target: 'http://stable.opencast.org'
    // target: 'http://develop.opencast.org'
});

app.use('/paella/ui', express.static('dist/'));
app.use('/paella/config', express.static('dist/config'));
app.use((req,res,next) => {
    proxy.web(req, res, (err) => {
        next(createError(502, err));
    });
});

app.listen(4000, () => {
    console.log("Example app listening on port 4000");
});

