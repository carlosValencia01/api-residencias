const jsreport = require('jsreport-core')({});
jsreport.use(require('jsreport-assets')({
    extensions: {
        assets: {
            allowedFiles: "**/*.*",
            searchOnDiskIfNotFoundInStore: true,
            rootUrlForLinks: "http://localhost:3003",
            publicAccessEnabled: true,
        }
    }
}));
jsreport.use(require('jsreport-phantom-pdf')());
jsreport.use(require('jsreport-jsrender')());
jsreport.init();

const generatePDFReport = ({content, header = null, footer = null, config = {
    format: 'letter',
    orientation: 'portrait',
    margin:  {"top": "5px", "left": "10px", "right": "10px", "bottom": "5px"},
    headerHeight: '1cm',
    footerHeight: '1cm'
}}) => {
    return new Promise((resolve, reject) => {
         jsreport.render({
            template: {
                content: content,
                engine: 'jsrender',
                recipe: 'phantom-pdf',
                phantom: {
                    allowLocalFilesAccess: true,
                    customPhantomJS: true,
                    format: config.format,
                    orientation: config.orientation,
                    margin: config.margin,
                    headerHeight: config.headerHeight,
                    header: header,
                    footerHeight: config.footerHeight,
                    footer: footer
                }
            }
        }).then(out => {
            resolve(out);
        }).catch(err => {
            reject(err);
        });
    });
};

module.exports = generatePDFReport;
