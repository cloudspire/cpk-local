$(document).ready(function() {
    registerHelpers();
});

function compileTemplate(tmp, data) {
    var tmpl = Handlebars.compile(tmp);
    return tmpl(data);
}

function registerHelpers() {

    //remove special characters
    Handlebars.registerHelper("rsc", function (str) {
        return str.replace(/[^A-Za-z0-9-_!@#$%^&*():;., ]/g, "").trim();
    });

    //Non Zero Index
    Handlebars.registerHelper('nzi', function (value) {
        return value +1;
    });

    Handlebars.registerHelper('isNotEmpty', function (value, options) {
        if (value > 0) {
            return options.fn(this);
        } else {
            return "";
        }
    });

    Handlebars.registerHelper('isNull', function (value, options) {
        if (value == null) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper('isNotNull', function (value, options) {
        if (value != null) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper('isValue', function (item, value, options) {
        if (item == value) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper('gt', function (item, value, options) {
        if (item == null) {
            return options.inverse(this);
        }
        if (item > value) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper("trim", function (data) {
        return data.trim();
    });

    Handlebars.registerHelper("count", function (data) {
        return data.length;
    });

    Handlebars.registerHelper("obscure", function (data) {
        var blanked = "";
        if (data != null) {
            for (var a = 0; a < data.length; a++) {
                blanked += "*";
            }
        }
        return blanked;
    });

    Handlebars.registerHelper("convertNull", function (data) {
        return data == null ? '' : data;
    });

    Handlebars.registerHelper("format", function (data, format) {
        if (data != null) {
            return moment(data).format(format);
        }
        else {
            return moment(new Date($.now())).format('MM/DD/YYYY HH:mm');
        } 
    });

    Handlebars.registerHelper("alt-color", function (index, options) {
        if (index % 2 == 0) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    })

    Handlebars.registerHelper("nest", function (template, group, header, data) {
        data.header_text = header;
        var vw = getView(template, group);
        if (vw != null) {
            return compileTemplate(vw, data);
        } else {
            return "";
        }
    });
}