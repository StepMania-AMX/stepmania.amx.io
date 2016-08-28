const metalsmith = require('metalsmith');
const config = require('./config');

//
// External Plugins
//
const assets = require('metalsmith-assets');
const branch = require('metalsmith-branch');
const collections = require('metalsmith-collections');
const concat = require('metalsmith-concat-convention');
const frontmatter = require('metalsmith-matters');
const ignore = require('metalsmith-ignore');
const inPlace = require('metalsmith-in-place');
const layout = require('metalsmith-layouts');
const markdown = require('metalsmith-markdown');
const minify = {
    html: require('metalsmith-html-minifier'),
    css: require('metalsmith-clean-css'),
    js: require('metalsmith-uglify'),
    img: require('metalsmith-imagemin/lib/node6'),
};
const multiLanguage = require('metalsmith-multi-language');

//
// Internal Plugins
//
const fixWindowsPaths = require('./plugins/fix-windows-paths');
const helpers = require('./plugins/helpers')(config);
const jsCleanup = require('./plugins/js-cleanup');
const updateContentMetadata = require('./plugins/update-content-metadata');
const updatePermalinks = require('./plugins/update-permalinks');

//
// Branches
//
const readConcatFrontmatterBranch = function () {
    return branch()
        .pattern('**/*.concat')
        .use(frontmatter());
};

//
// Build
//
metalsmith(__dirname)
    .metadata(config.metadata)
    .source(config.source)
    .destination(config.destination)
    .frontmatter(false)
    .use(helpers())
    .use(fixWindowsPaths()) // requires helpers()
    .use(ignore(config.plugins.ignore))
    .use(frontmatter())
    .use(collections(config.plugins.collections))
    .use(multiLanguage({
        'default': config.defaultLocale,
        'locales': Object.keys(config.localeInfo)
    }))
    .use(updateContentMetadata())
    .use(markdown())
    .use(inPlace(config.plugins.inPlace))
    .use(fixWindowsPaths())
    .use(updatePermalinks())
    .use(layout(config.plugins.layout))
    .use(minify.html())
    .use(assets(config.plugins.assets))
    .use(fixWindowsPaths())
    .use(minify.css(config.plugins.minify.css))
    .use(minify.js(config.plugins.minify.js))
    .use(minify.img(config.plugins.minify.img))
    .use(readConcatFrontmatterBranch())
    .use(concat())
    .use(jsCleanup())
    .build(function (err) {
        if (err) throw err;
    });
