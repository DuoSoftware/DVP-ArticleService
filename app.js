const { plugins, createServer } = require('restify');
const authorization = require('dvp-common-lite/Authentication/Authorization.js');
var secret = require('dvp-common-lite/Authentication/Secret.js');
const config = require('config');
const mongomodel = require('dvp-mongomodels');
const {ArticleService} = require('./Services/ArticleService');
const corsMiddleware = require('restify-cors-middleware');
const logger = require('dvp-common-lite/LogHandler/CommonLogHandler').logger;
const jwt = require('restify-jwt');

const articleService = new ArticleService();

const port = config.Host.port || 3000;
const host = config.Host.vdomain || 'localhost';

const server = createServer({
    name: 'ArticleService',
    version: ['1.0.0']
});

const cors = corsMiddleware({
    allowHeaders: ['authorization']
});



server.pre(cors.preflight);
server.use(cors.actual);
server.use(jwt({secret: secret.Secret}));

server.use(plugins.queryParser({
    mapParams: true
}));

server.use(plugins.bodyParser({
    mapParams: true
}));

//////////////////////////////////////////create methods////////////////////////////////////////////////////////////////////
server.post('/DVP/API/:version/Category',authorization({resource:"article", action:"write"}), articleService.CreateCategory);
server.post('/DVP/API/:version/Folder',authorization({resource:"article", action:"write"}), articleService.CreateFolder);
server.post('/DVP/API/:version/Article',authorization({resource:"article", action:"write"}), articleService.CreateArticle);

/////////////////////////////////////////append methods/////////////////////////////////////////////////////////////////////

server.put('/DVP/API/:version/Category/:catid/Folder/:folderid',authorization({resource:"article", action:"write"}), articleService.AddFolderToCategory);
server.put('/DVP/API/:version/Category/:catid/BU',authorization({resource:"article", action:"write"}), articleService.AddBuToCategory);
server.put('/DVP/API/:version/Folder/:folderid/Article/:articleid',authorization({resource:"article", action:"write"}), articleService.AddArticleToFolder);
server.put('/DVP/API/:version/Folder/:folderid/Group',authorization({resource:"article", action:"write"}), articleService.AddGroupToFolder);
server.put('/DVP/API/:version/Article/:articleid/Comment',authorization({resource:"article", action:"write"}), articleService.AddCommentToArticle);
server.put('/DVP/API/:version/Article/:articleid/Vote',authorization({resource:"article", action:"write"}), articleService.AddVoteToArticle);
server.put('/DVP/API/:version/Article/:articleid/Tag',authorization({resource:"article", action:"write"}), articleService.AddTagToArticle);
server.put('/DVP/API/:version/Article/:articleid/SearchTag',authorization({resource:"article", action:"write"}), articleService.AddSearchTagToArticle);

server.put('/DVP/API/:version/Category/:id',authorization({resource:"article", action:"write"}), articleService.UpdateCategory);
server.put('/DVP/API/:version/Folder/:id',authorization({resource:"article", action:"write"}), articleService.UpdateFolder);
server.put('/DVP/API/:version/Article/:id',authorization({resource:"article", action:"write"}), articleService.UpdateArticle);

server.put('/DVP/API/:version/Category/:id/Enable/:enabled',authorization({resource:"article", action:"write"}), articleService.DisableCategory);
server.put('/DVP/API/:version/Folder/:id/Enable/:enabled',authorization({resource:"article", action:"write"}), articleService.DisableFolder);
server.put('/DVP/API/:version/Article/:id/Enable/:enabled',authorization({resource:"article", action:"write"}), articleService.DisableArticle);

//////////////////////////////////////////get methods/////////////////////////////////////////////////////////////////////////////

server.get('/DVP/API/:version/Categories',authorization({resource:"article", action:"write"}), articleService.GetCategories);
server.get('/DVP/API/:version/Category/:id',authorization({resource:"article", action:"write"}), articleService.GetCategory);
server.get('/DVP/API/:version/FullCategory/:id',authorization({resource:"article", action:"write"}), articleService.GetFullCategory);
server.get('/DVP/API/:version/Folders',authorization({resource:"article", action:"write"}), articleService.GetFolders);
server.get('/DVP/API/:version/Folder/:id',authorization({resource:"article", action:"write"}), articleService.GetFolder);
server.get('/DVP/API/:version/FullFolder/:id',authorization({resource:"article", action:"write"}), articleService.GetFullFolder);
server.get('/DVP/API/:version/Articles',authorization({resource:"article", action:"write"}), articleService.GetArticles);
server.get('/DVP/API/:version/Article/:id',authorization({resource:"article", action:"write"}), articleService.GetArticle);
server.get('/DVP/API/:version/FullArticle/:id',authorization({resource:"article", action:"write"}), articleService.GetFullArticle);



server.listen(port, function () {

    logger.info(`DVP-ArticleService.main Server ${server.name} listening at ${server.url}`);
});