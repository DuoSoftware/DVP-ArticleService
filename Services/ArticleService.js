const logger = require('dvp-common-lite/LogHandler/CommonLogHandler').logger;
const messageFormatter = require('dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter');

const Article = require('dvp-mongomodels/model/Articles/Article').Article;
const ArticleCategory = require('dvp-mongomodels/model/Articles/Category').ArticleCategory;
const ArticleFolder = require('dvp-mongomodels/model/Articles/Folder').ArticleFolder;
const ArticleComment = require('dvp-mongomodels/model/Articles/Comment').ArticleComment;
const ArticleTag = require('dvp-mongomodels/model/Articles/Tag').ArticleTag;
const ArticleVote = require('dvp-mongomodels/model/Articles/Vote').ArticleVote;
const UserAccount = require('dvp-mongomodels/model/UserAccount');
const UserGroup = require('dvp-mongomodels/model/UserGroup');
const BusinessUnit = require('dvp-mongomodels/model/BusinessUnit').BusinessUnit;


module.exports.ArticleService = class ArticleService {

    async CreateArticle(req, res) {

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {
            const userAccount = await UserAccount.findOne({user: req.user.iss, company: company, tenant: tenant});

            let tagArray = [];
            if(req.body.tags && Array.isArray(req.body.tags)){

                for(let _tagVal of req.body.tags) {
                    let _tag = await ArticleTag.findOne({tag: _tagVal, company: company, tenant: tenant});

                    if (!_tag) {
                        let tag = ArticleTag({
                            created_at: Date.now(),
                            company: company,
                            tenant: tenant,
                            tag: _tagVal,
                        });

                        _tag = await tag.save();
                        logger.log(`Tag saved and setting tag to article ${req.params.articleid}`);
                    } else {

                        logger.log(`Tag found in database`);
                    }

                    tagArray.push(_tag);
                }


            }

            let article = Article({
                created_at: Date.now(),
                updated_at: Date.now(),
                businessUnit: req.body.businessUnit,
                company: company,
                tenant: tenant,
                title: req.body.title,
                description: req.body.description,
                document: req.body.document,
                tags: tagArray,
                published: false,
                author: userAccount.userref

            });

            const _article = await article.save();

            logger.log(`Article saved and setting article to category ${req.body.folder}`);

            if(req.body.folder){

                let _folder = await ArticleFolder.findOneAndUpdate({
                    company: company,
                    tenant: tenant,
                    _id: req.body.folder
                },{$addToSet:{articles: _article._id}})
            }

            jsonString = messageFormatter.FormatMessage(undefined, "Article saved successfully", true, _article);
            res.end(jsonString);

        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Create Article Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async CreateCategory(req, res) {

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {
            const userAccount = await UserAccount.findOne({user: req.user.iss, company: company, tenant: tenant});

            let category = ArticleCategory({
                created_at: Date.now(),
                updated_at: Date.now(),
                businessUnit: req.body.businessUnit,
                company: company,
                tenant: tenant,
                title: req.body.title,
                description: req.body.description,
                allow_business_units: req.body.allow_business_units,
                author: userAccount.userref,
                folders: []

            });

            const _category = await category.save();

            jsonString = messageFormatter.FormatMessage(undefined, "Folder saved successfully", true, _category);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Create Category Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async CreateFolder(req, res) {

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {
            const userAccount = await UserAccount.findOne({user: req.user.iss, company: company, tenant: tenant});


            let folder = ArticleFolder({
                created_at: Date.now(),
                updated_at: Date.now(),
                businessUnit: req.body.businessUnit,
                company: company,
                tenant: tenant,
                title: req.body.title,
                description: req.body.description,
                author: userAccount.userref,
                allow_groups: req.body.allow_groups,
                articles:[]

            });

            const _folder = await folder.save();
            logger.log(`Folder saved and setting folder to category ${req.body.category}`);

            if(req.body.category){

                let _cat = await ArticleCategory.findOneAndUpdate({
                    company: company,
                    tenant: tenant,
                    _id: req.body.category
                },{$addToSet:{folders: _folder._id}})
            }


            jsonString = messageFormatter.FormatMessage(undefined, "Folder saved successfully", true, _folder);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Create Folder Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async AddFolderToCategory(req,res){


        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {

            const _folder = await ArticleFolder.findOne({_id: req.params.folderid, company: company, tenant: tenant});


            if(_folder && req.params.catid){

                logger.log(`Folder found and setting folder to category ${req.params.folderid}`);
                let _cat = await ArticleCategory.findOneAndUpdate({
                    company: company,
                    tenant: tenant,
                    _id: req.params.catid
                },{$addToSet:{folders: _folder.id}})

                jsonString = messageFormatter.FormatMessage(undefined, "Folder set to category successfully", true, _cat);
            }else{
                logger.error(`Folder not found and setting folder to category ${req.params.folderid}`);
            }



            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Folder set to category Failed", false, undefined);
            res.end(jsonString);
        }


    }

    async AddArticleToFolder(req,res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {

            const _article = await Article.findOne({_id: req.params.articleid, company: company, tenant: tenant});


            if(_article && req.params.folderid){

                logger.log(`Article found and setting article to folder ${req.params.folderid}`);
                let _folder = await ArticleFolder.findOneAndUpdate({
                    company: company,
                    tenant: tenant,
                    _id: req.params.folderid
                },{$addToSet:{articles: _article.id}})
                jsonString = messageFormatter.FormatMessage(undefined, "Article set to Folder successfully", true, _folder);
            }else{
                logger.error(`Folder not found and setting folder to category ${req.params.folderid}`);
            }



            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Article set to Folder Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async AddBuToCategory(req,res){


        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {

            logger.log(`BU's found and setting bu to category ${req.params.allow_business_units}`);
            let buList = [];

            if(req.params && req.params.allow_business_units) {
                if (Array.isArray(req.params.allow_business_units)) {
                    buList = req.params.allow_business_units;
                } else {
                    buList.push(req.params.allow_business_units);
                }
            }

            let _cat = await ArticleCategory.findOneAndUpdate({
                company: company,
                tenant: tenant,
                _id: req.params.catid
            }, {
                $addToSet:
                    {
                        allow_business_units: {
                            $each: buList
                        }
                    }
            });

            jsonString = messageFormatter.FormatMessage(undefined, "BUs set to category successfully", true, _cat);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "BUs set to category Failed", false, undefined);
            res.end(jsonString);
        }


    }

    async AddGroupToFolder(req,res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {

            let groupList = [];

            if(req.params.allow_groups) {
                if (Array.isArray(req.params.allow_groups)) {
                    groupList = req.params.allow_groups;
                } else {
                    groupList = [req.params.allow_groups];
                }
            }

            logger.log(`Groups found and setting group to folder ${req.params.allow_groups}`);
            let _folder = await ArticleFolder.findOneAndUpdate({
                company: company,
                tenant: tenant,
                _id: req.params.folderid
            }, {
                $addToSet: {
                    allow_groups: {
                        $each :groupList
                    }
                }
            });
            jsonString = messageFormatter.FormatMessage(undefined, "Group set to Folder successfully", true, _folder);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Group set to Folder Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async RemoveGroupFromFolder(req,res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {

            let groupList = [];

            if(req.params.allow_groups) {
                if (Array.isArray(req.params.allow_groups)) {
                    groupList = req.params.allow_groups;
                } else {
                    groupList = [req.params.allow_groups];
                }
            }

            logger.log(`Groups found and setting group to folder ${req.params.allow_groups}`);
            let _folder = await ArticleFolder.findOneAndUpdate({
                company: company,
                tenant: tenant,
                _id: req.params.folderid
            }, {
                $pull: {
                    allow_groups: {
                        $in :groupList
                    }
                }
            });
            jsonString = messageFormatter.FormatMessage(undefined, "Group set to Folder successfully", true, _folder);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Group set to Folder Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async RemoveBuFromCategory(req,res){


        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {

            logger.log(`BU's found and setting bu to category ${req.params.allow_business_units}`);
            let buList = [];

            if(req.params && req.params.allow_business_units) {
                if (Array.isArray(req.params.allow_business_units)) {
                    buList = req.params.allow_business_units;
                } else {
                    buList.push(req.params.allow_business_units);
                }
            }

            let _cat = await ArticleCategory.findOneAndUpdate({
                company: company,
                tenant: tenant,
                _id: req.params.catid
            }, {
                $pull:
                    {
                        allow_business_units: {
                            $in: buList
                        }
                    }
            });

            jsonString = messageFormatter.FormatMessage(undefined, "BUs set to category successfully", true, _cat);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "BUs set to category Failed", false, undefined);
            res.end(jsonString);
        }


    }

    async AddCommentToArticle(req,res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {
            const userAccount = await UserAccount.findOne({user: req.user.iss, company: company, tenant: tenant});


            let comment = ArticleComment({
                created_at: Date.now(),
                updated_at: Date.now(),
                company: company,
                tenant: tenant,
                comment: req.body.comment,
                author: userAccount.userref,

            });

            const _comment = await comment.save();
            logger.log(`Comment saved and setting comment to article ${req.params.articleid}`);

            if(req.params.articleid){

                let _cat = await Article.findOneAndUpdate({
                    company: company,
                    tenant: tenant,
                    _id: req.params.articleid
                },{$addToSet:{comments: _comment._id}})
            }


            jsonString = messageFormatter.FormatMessage(undefined, "Comment saved successfully", true, _comment);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Comment Folder Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async AddVoteToArticle(req,res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {
            const userAccount = await UserAccount.findOne({user: req.user.iss, company: company, tenant: tenant});


            let vote = ArticleVote({
                created_at: Date.now(),
                company: company,
                tenant: tenant,
                vote: req.body.vote,
                author: userAccount.userref,

            });

            const _vote = await vote.save();
            logger.log(`Comment saved and setting vote to article ${req.params.articleid}`);

            if(req.params.articleid){

                let _cat = await Article.findOneAndUpdate({
                    company: company,
                    tenant: tenant,
                    _id: req.params.articleid
                },{$addToSet:{votes: _vote._id}})
            }


            jsonString = messageFormatter.FormatMessage(undefined, "Vote saved successfully", true, _vote);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Vote save Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async UpdateVoteOfTheArticle(req,res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {

            const articleVote = await ArticleVote.findOne({_id: req.params.vid, company: company, tenant: tenant})
                .populate('author', 'firstname lastname username avatar');;


            if(articleVote && articleVote.author.username === req.user.iss && req.body.vote != undefined){

                articleVote.vote = req.body.vote;
                const _vote = await articleVote.save();
                logger.log(`Comment saved and setting vote to article ${req.params.articleid}`);
                jsonString = messageFormatter.FormatMessage(undefined, "Vote updated successfully", true, _vote);
                res.end(jsonString);

            }else{

                jsonString = messageFormatter.FormatMessage(new Error("Not update criteria met"), "Vote updated faled", true, undefined);
                res.end(jsonString);
            }


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Vote updated Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async AddTagToArticle(req,res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {


            let _tag = await ArticleTag.findOne({tag:  req.body.tag, company: company, tenant: tenant});

            if(!_tag) {
                let tag = ArticleTag({
                    created_at: Date.now(),
                    company: company,
                    tenant: tenant,
                    tag: req.body.tag,
                });

                _tag = await tag.save();
                logger.log(`Tag saved and setting tag to article ${req.params.articleid}`);
            }else{

                logger.log(`Tag found in database`);
            }

            if(req.params.articleid){

                let _cat = await Article.findOneAndUpdate({
                    company: company,
                    tenant: tenant,
                    _id: req.params.articleid
                },{$addToSet:{tags: _tag}})
            }


            jsonString = messageFormatter.FormatMessage(undefined, "Tag saved successfully", true, _tag);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Tag save Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async RemoveTagsFromArticle(req,res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const _tag = req.body.tag;
        try {


            if(req.params.articleid){

                let _cat = await Article.findOneAndUpdate({
                    company: company,
                    tenant: tenant,
                    _id: req.params.articleid
                },{
                    $pull:{
                        tags: {
                            tag: _tag
                        }
                    }
                });
            }


            jsonString = messageFormatter.FormatMessage(undefined, "Tag removed successfully", true, _tag);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Tag remove Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async AddSearchTagToArticle(req,res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {

            let _tag = [];

            if(req.body && req.body.tags){
                if(Array.isArray(req.body.tags)){

                    _tag = req.body.tags;
                }else{

                    _tag.push(req.body.tags);
                }
            }


            if(req.params.articleid) {

                let _cat = await Article.findOneAndUpdate({
                    company: company,
                    tenant: tenant,
                    _id: req.params.articleid
                }, {
                    $addToSet: {
                        'search.keywords': {'$each' :_tag}
                    }
                })
            }

            jsonString = messageFormatter.FormatMessage(undefined, "Tag saved successfully", true, _tag);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Tag save Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async AddSearchMetaToArticle(req,res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body.meta;
        try {

            if(req.params.articleid  && req.body.meta) {

                let _cat = await Article.findOneAndUpdate({
                    company: company,
                    tenant: tenant,
                    _id: req.params.articleid
                }, {

                        'search.meta': req.body.meta

                })
            }

            jsonString = messageFormatter.FormatMessage(undefined, "Tag saved successfully", true, msg);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Tag save Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async RemoveSearchTagFromArticle(req,res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {

            let _tag = [];

            if(req.body && req.body.tags){
                if(Array.isArray(req.body.tags)){

                    _tag = req.body.tags;
                }else{

                    _tag.push(req.body.tags);
                }
            }


            if(req.params.articleid) {

                let _cat = await Article.findOneAndUpdate({
                    company: company,
                    tenant: tenant,
                    _id: req.params.articleid
                }, {
                    $pull: {
                        'search.keywords': {'$in' :_tag}
                    }
                })
            }

            jsonString = messageFormatter.FormatMessage(undefined, "Tag saved successfully", true, _tag);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Tag save Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async UpdateArticle(req, res) {

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {

            let articleInstance = {

                updated_at: Date.now()
            };

            if(req.body.title) {

                articleInstance.title = req.body.title;
            }
            if(req.body.description){

                articleInstance.description = req.body.description;
            }
            if(req.body.document){

                articleInstance.document = req.body.document;
            }

            let article = await Article.findOneAndUpdate({
                _id: req.params.id,
                company: company,
                tenant: tenant
            },articleInstance,{new: true});

            jsonString = messageFormatter.FormatMessage(undefined, "Article saved successfully", true, article);
            res.end(jsonString);

        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Create Article Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async UpdateCategory(req, res) {

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {

            let categoryInstance = {
                updated_at: Date.now()
            }

            if(req.body.title){
                categoryInstance.title = req.body.title;
            }

            if(req.body.description){
                categoryInstance.description = req.body.description;
            }

            let category = await ArticleCategory.findOneAndUpdate({
                _id: req.params.id,
                company: company,
                tenant: tenant
            }, categoryInstance,{new: true} );


            jsonString = messageFormatter.FormatMessage(undefined, "Category saved successfully", true, category);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Create Category Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async UpdateFolder(req, res) {

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {
            let folderInstance = {
                updated_at: Date.now()
            };

            if(req.body.title){
                folderInstance.title = req.body.title;
            }

            if(req.body.description){
                folderInstance.description = req.body.description;
            }

            let folder = await ArticleFolder.findOneAndUpdate({
                    _id: req.params.id,
                    company: company,
                    tenant: tenant
                }, folderInstance,{new: true});


            jsonString = messageFormatter.FormatMessage(undefined, "Folder saved successfully", true, folder);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Create Folder Failed", false, undefined);
            res.end(jsonString);
        }

    }

    //////////////////////////////////////get methods//////////////////////////////////////////////////////////////////////

    async GetCategories(req, res){


        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;

        const userAccount = await UserAccount.findOne({
            user: req.user.iss,
            company: company,
            tenant: tenant
        }).select('use group').populate('group', 'name businessUnit');


        let query = {
            company: company,
            tenant: tenant
        };

        let orQuery = {$or: [ {
            allow_business_units: {
                $size: 0
            }}]};

        let andQuery;

        if(userAccount && userAccount.group){
            orQuery.$or.push({allow_business_units : userAccount.group.businessUnit});
            andQuery =
                {
                    $and: [query,orQuery]
                };
        }else{

            query.allow_business_units = {
                $size: 0
            }

            andQuery = query;
        }


        try {
            const articleCategory = await ArticleCategory.find(andQuery).populate('author', 'firstname lastname username avatar');
            jsonString = messageFormatter.FormatMessage(undefined, "Categories retrieved successfully", true, articleCategory);
            res.end(jsonString);

        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Categories retrieve Failed", false, undefined);
            res.end(jsonString);
        }


    };

    async GetTags(req, res){


        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {
            const articleCategory = await ArticleTag.find({company: company, tenant: tenant})
                .populate('author', 'firstname lastname username avatar');
            jsonString = messageFormatter.FormatMessage(undefined, "Categories retrieved successfully", true, articleCategory);
            res.end(jsonString);

        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Categories retrieve Failed", false, undefined);
            res.end(jsonString);
        }

    };

    async GetCategory(req, res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let id = req.params.id;
        let jsonString;

        const msg = req.body;
        try {

            const userAccount = await UserAccount.findOne({
                user: req.user.iss,
                company: company,
                tenant: tenant
            }).select('use group').populate('group', 'name businessUnit').lean();


            const articleCategory = await ArticleCategory.findOne({_id: id, company: company, tenant: tenant})
                .populate('allow_business_units', 'unitName').lean();

            //userAccount.group.businessUnit
            if(articleCategory && userAccount && userAccount.group.businessUnit){
                if(articleCategory.allow_business_units.length == 0 ||(articleCategory.allow_business_units.filter(
                    unit => unit.unitName === userAccount.group.businessUnit).length > 0)){
                    jsonString = messageFormatter.FormatMessage(undefined, "Category retrieved successfully", true, articleCategory);
                    res.end(jsonString);
                }else{
                    jsonString = messageFormatter.FormatMessage(new Error('Permission denied '), "Category retrieve Failed", false, undefined);
                    res.end(jsonString);
                }
            }else{
                if(articleCategory && articleCategory.allow_business_units.length == 0){
                    jsonString = messageFormatter.FormatMessage(undefined, "Category retrieved successfully", true, articleCategory);
                    res.end(jsonString);
                }else{
                    jsonString = messageFormatter.FormatMessage(new Error('Permission denied '), "Category retrieve Failed", false, undefined);
                    res.end(jsonString);
                }
            }


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Category retrieve Failed", false, undefined);
            res.end(jsonString);
        }
    };

    async GetFullCategory(req, res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let id = req.params.id;
        let jsonString;

        const msg = req.body;
        try {

            const userAccount = await UserAccount.findOne({
                user: req.user.iss,
                company: company,
                tenant: tenant
            }).select('use group').populate('group', 'name businessUnit').lean();


            let folderMatchQuery = {
                $or : [{allow_groups : {$size: 0}}]
            }

            if(userAccount&& userAccount.group){
                folderMatchQuery.$or.push({
                    allow_groups: userAccount.group._id.toString()
                });
            }

            const articleCategory = await ArticleCategory.findOne({_id: id, company: company, tenant: tenant})
                .populate({
                    path: 'folders',
                    model: ArticleFolder,
                    match: folderMatchQuery,
                    populate: {
                        path: 'author',
                        model: 'User',
                        select: 'firstname lastname username avatar'
                    }
                })
                .populate('author', 'firstname lastname username avatar')
                .populate('allow_business_units', 'unitName').lean();

            if(articleCategory && userAccount && userAccount.group.businessUnit){
                if(articleCategory.allow_business_units.length == 0 ||(articleCategory.allow_business_units.filter(
                        unit => unit.unitName === userAccount.group.businessUnit).length > 0)){
                    jsonString = messageFormatter.FormatMessage(undefined, "Category retrieved successfully", true, articleCategory);
                    res.end(jsonString);
                }else{
                    jsonString = messageFormatter.FormatMessage(new Error('Permission denied '), "Category retrieve Failed", false, undefined);
                    res.end(jsonString);
                }
            }else{
                if(articleCategory && articleCategory.allow_business_units.length == 0){
                    jsonString = messageFormatter.FormatMessage(undefined, "Category retrieved successfully", true, articleCategory);
                    res.end(jsonString);
                }else{
                    jsonString = messageFormatter.FormatMessage(new Error('Permission denied '), "Category retrieve Failed", false, undefined);
                    res.end(jsonString);
                }
            }

            //jsonString = messageFormatter.FormatMessage(undefined, "Category retrieved successfully", true, articleCategory);
            //res.end(jsonString);

        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Category retrieve Failed", false, undefined);
            res.end(jsonString);
        }
    };

    async GetFullCategoryWithArticles(req, res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let id = req.params.id;
        let jsonString;

        const msg = req.body;
        try {



            const userAccount = await UserAccount.findOne({
                user: req.user.iss,
                company: company,
                tenant: tenant
            }).select('use group').populate('group', 'name businessUnit').lean();


            let folderMatchQuery = {
                $or : [{allow_groups : {$size: 0}}]
            }

            if(userAccount&& userAccount.group){
                folderMatchQuery.$or.push({
                    allow_groups: userAccount.group._id.toString()
                });
            }


            const articleCategory = await ArticleCategory.findOne({_id: id, company: company, tenant: tenant})
                .populate({
                    path: 'folders',
                    model: ArticleFolder,
                    match: folderMatchQuery,
                    select: 'title description author articles',
                    populate: [{
                        path: 'author',
                        model: 'User',
                        select: 'firstname lastname username avatar'
                    },{
                        path : 'articles',
                        model: Article,
                        select: 'title description author votes',
                        populate: [{
                            path: 'author',
                            model: 'User',
                            select: 'title lastname username avatar'
                        },
                            {
                                path: 'votes',
                                model: 'ArticleVote'
                            }
                        ]
                    }]
                })
                .populate('author', 'firstname lastname username avatar')
                .populate('allow_business_units', 'unitName').lean();

            if(articleCategory && userAccount && userAccount.group.businessUnit){
                if(articleCategory.allow_business_units.length == 0 ||(articleCategory.allow_business_units.filter(
                        unit => unit.unitName === userAccount.group.businessUnit).length > 0)){
                    jsonString = messageFormatter.FormatMessage(undefined, "Category retrieved successfully", true, articleCategory);
                    res.end(jsonString);
                }else{
                    jsonString = messageFormatter.FormatMessage(new Error('Permission denied '), "Category retrieve Failed", false, undefined);
                    res.end(jsonString);
                }
            }else{
                if(articleCategory && articleCategory.allow_business_units.length == 0){
                    jsonString = messageFormatter.FormatMessage(undefined, "Category retrieved successfully", true, articleCategory);
                    res.end(jsonString);
                }else{
                    jsonString = messageFormatter.FormatMessage(new Error('Permission denied '), "Category retrieve Failed", false, undefined);
                    res.end(jsonString);
                }
            }


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Category retrieve Failed", false, undefined);
            res.end(jsonString);
        }
    };

    async GetFolders(req, res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {
            const userAccount = await UserAccount.findOne({
                user: req.user.iss,
                company: company,
                tenant: tenant
            }).select('use group').populate('group', 'name businessUnit').lean();

            let query = {
                company: company,
                tenant: tenant
            };

            let orQuery = {$or: [ {
                allow_groups: {
                    $size: 0
                }}]};

            let andQuery;

            if(userAccount && userAccount.group){
                orQuery.$or.push({allow_groups : userAccount.group._id.toString()});
                andQuery =
                    {
                        $and: [query,orQuery]
                    };
            }else{

                query.allow_groups = {
                    $size: 0
                }

                andQuery = query;
            }



            const articleFolder = await ArticleFolder.find(andQuery)
                .populate('author', 'firstname lastname username avatar').lean();


            jsonString = messageFormatter.FormatMessage(undefined, "Folders retrieved successfully", true, articleFolder);
            res.end(jsonString);

        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Folders retrieve Failed", false, undefined);
            res.end(jsonString);
        }
    };

    async GetFolder(req, res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let id = req.params.id;
        let jsonString;

        const msg = req.body;
        try {
            const userAccount = await UserAccount.findOne({
                user: req.user.iss,
                company: company,
                tenant: tenant
            }).select('use group').populate('group', 'name businessUnit').lean();

            const articleFolder = await ArticleFolder.findOne({_id: id, company: company, tenant: tenant});


            if(userAccount && articleFolder && userAccount.group){
                if(articleFolder.allow_groups.length == 0 || (articleFolder.allow_groups.indexOf(userAccount._id) > -1)){
                    jsonString = messageFormatter.FormatMessage(undefined, "Folder retrieved successfully", true, articleFolder);
                    res.end(jsonString);
                }else{
                    jsonString = messageFormatter.FormatMessage(new Error('Permission denied'), "Folder retrieve Failed", false, undefined);
                    res.end(jsonString);
                }
            }else{
                if(articleFolder && articleFolder.allow_groups.length == 0){

                    jsonString = messageFormatter.FormatMessage(undefined, "Folder retrieved successfully", true, articleFolder);
                    res.end(jsonString);
                }else{
                    jsonString = messageFormatter.FormatMessage(new Error('Permission denied'), "Folder retrieve Failed", false, undefined);
                    res.end(jsonString);
                }
            }




        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Folder retrieve Failed", false, undefined);
            res.end(jsonString);
        }

    };

    async GetFullFolder(req, res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let id = req.params.id;
        let jsonString;

        const msg = req.body;
        try {

            const userAccount = await UserAccount.findOne({
                user: req.user.iss,
                company: company,
                tenant: tenant
            }).select('use group').populate('group', 'name businessUnit').lean();

            const articleFolder = await ArticleFolder.findOne({_id: id, company: company, tenant: tenant})
                .populate({
                    path : 'articles',
                    model: Article,
                    select: '-document',
                    populate: [{
                        path: 'author',
                        model: 'User',
                        select: 'title lastname username avatar'
                    },
                        {
                            path: 'votes',
                            model: 'ArticleVote'
                        }
                    ]

                })
                .populate('author', 'firstname lastname username avatar')
                .populate('allow_groups','name').lean();


            if(userAccount && articleFolder && userAccount.group) {
                if (articleFolder.allow_groups.length == 0 || (articleFolder.allow_groups.filter(
                    grp => grp._id.toString() == userAccount.group._id.toString()
                    ).length > 0)) {
                    jsonString = messageFormatter.FormatMessage(undefined, "Folder retrieved successfully", true, articleFolder);
                    res.end(jsonString);
                } else {
                    jsonString = messageFormatter.FormatMessage(new Error('Permission denied'), "Folder retrieve Failed", false, undefined);
                    res.end(jsonString);
                }
            }else{
                if(articleFolder && articleFolder.allow_groups.length == 0){

                    jsonString = messageFormatter.FormatMessage(undefined, "Folder retrieved successfully", true, articleFolder);
                    res.end(jsonString);
                }else{
                    jsonString = messageFormatter.FormatMessage(new Error('Permission denied'), "Folder retrieve Failed", false, undefined);
                    res.end(jsonString);
                }
            }

            jsonString = messageFormatter.FormatMessage(undefined, "Folder retrieved successfully", true, articleFolder);
            res.end(jsonString);

        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Folder retrieve Failed", false, undefined);
            res.end(jsonString);
        }

    };

    async GetArticles(req, res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const page = parseInt(req.params.page);
        const   size = parseInt(req.params.size);
        const   skip = page > 0 ? ((page - 1) * size) : 0;


        const msg = req.body;
        try {
            const article = await Article.find({company: company, tenant: tenant}, '-search -company -tenant -businessUnit')
                .populate('author', 'firstname lastname username avatar')
                .populate('votes')
                .skip(skip)
                .limit(size)
                .sort({created_at: -1});
            jsonString = messageFormatter.FormatMessage(undefined, "Articles retrieved successfully", true, article);
            res.end(jsonString);

        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Articles retrieve Failed", false, undefined);
            res.end(jsonString);
        }
    };

    async GetArticlesByTags(req, res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.params;
        try {

            let _tag = [];

            if(req.params && req.params.tags){
                if(Array.isArray(req.params.tags)){

                    _tag = req.params.tags;
                }else{

                    _tag.push(req.params.tags);
                }
            }

            const article = await Article.find({
                company: company,
                tenant: tenant,
                'tags.tag': {
                    $in: _tag
                }
            }, '-tags -search -company -tenant -businessUnit').populate('author', 'firstname lastname username avatar');
            jsonString = messageFormatter.FormatMessage(undefined, "Articles retrieved successfully", true, article);
            res.end(jsonString);

        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Articles retrieve Failed", false, undefined);
            res.end(jsonString);
        }
    };

    async GetArticle(req, res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let id = req.params.id;
        let jsonString;

        const msg = req.body;
        try {

            const article = await Article.findOne({_id: id, company: company, tenant: tenant});
            jsonString = messageFormatter.FormatMessage(undefined, "Article retrieved successfully", true, article);
            res.end(jsonString);

        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Article retrieve Failed", false, undefined);
            res.end(jsonString);
        }

    };

    async SearchArticle(req, res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {

            const article = await Article.find(
                {
                    $text: {$search: req.params.text},
                    company: company,
                    tenant: tenant
                }
            ).limit(10);

            jsonString = messageFormatter.FormatMessage(undefined, "Article retrieved successfully", true, article);
            res.end(jsonString);

        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Article retrieve Failed", false, undefined);
            res.end(jsonString);
        }

    };

    async GetFullArticle(req, res){

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let id = req.params.id;
        let jsonString;

        const msg = req.body;
        try {

            const article = await Article.findOne({_id: id, company: company, tenant: tenant})
                .populate('author', 'firstname lastname username avatar')
                .populate({
                    path : 'comments',
                    model: ArticleComment,
                    populate: {
                        path: 'author',
                        model: 'User',
                        select: 'firstname lastname username avatar'
                    }
                })
                .populate({
                    path : 'votes',
                    model: ArticleVote,
                    populate: {
                        path: 'author',
                        model: 'User',
                        select: 'firstname lastname username avatar'
                    }
                });
            jsonString = messageFormatter.FormatMessage(undefined, "Article retrieved successfully", true, article);
            res.end(jsonString);

        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Article retrieve Failed", false, undefined);
            res.end(jsonString);
        }
    };


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async DisableArticle(req, res) {

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {

            let articleInstance = {

                updated_at: Date.now(),
                enabled: req.params.enabled
            };



            let article = await Article.findOneAndUpdate({
                _id: req.params.id,
                company: company,
                tenant: tenant
            },articleInstance,{new: true});

            jsonString = messageFormatter.FormatMessage(undefined, "Article saved successfully", true, article);
            res.end(jsonString);

        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Create Article Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async DisableCategory(req, res) {

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {

            let categoryInstance = {
                updated_at: Date.now(),
                enabled: req.params.enabled
            }

            let category = await ArticleCategory.findOneAndUpdate({
                _id: req.params.id,
                company: company,
                tenant: tenant
            }, categoryInstance,{new: true} );


            jsonString = messageFormatter.FormatMessage(undefined, "Category saved successfully", true, category);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Create Category Failed", false, undefined);
            res.end(jsonString);
        }

    }

    async DisableFolder(req, res) {

        let company = parseInt(req.user.company);
        let tenant = parseInt(req.user.tenant);
        let jsonString;

        const msg = req.body;
        try {
            let folderInstance = {
                updated_at: Date.now(),
                enabled: req.params.enabled
            };



            let folder = await ArticleFolder.findOneAndUpdate({
                _id: req.params.id,
                company: company,
                tenant: tenant
            }, folderInstance,{new: true});


            jsonString = messageFormatter.FormatMessage(undefined, "Folder saved successfully", true, folder);
            res.end(jsonString);


        }catch(ex){

            jsonString = messageFormatter.FormatMessage(ex, "Create Folder Failed", false, undefined);
            res.end(jsonString);
        }

    }

}