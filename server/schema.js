[
    {
	"class": "Source",
	"table": "source",
	"backend": "db/source.js",
	"frontend": "../d0/sjs/db/source.js",
	"reaptime": 240,
	"fromdb": "finishConvertFromDB",
	"fields": 
	[
	    {
		"type": "?@Source",
		"name": "parent"
	    },
	    {
		"type": "!string",
		"name": "type"
	    },
	    {
		"type": "!string",
		"name": "name"
	    },
	    {
		"type": "number",
		"name": "number"
	    },
	    {
		"type": "?Source",
		"fetype": "?@Source",
		"name": "next",
		"notindb": true,
		"initial": null
	    },
	    {
		"type": "?Source",
		"fetype": "?@Source",
		"name": "prev",
		"notindb": true,
		"initial": null
	    },
	    {
		"type": "?Source",
		"fetype": "?@Source",
		"name": "child",
		"notindb": true,
		"initial": null
	    }
	]
    },
    {
	"class": "Page",
	"table": "page",
	"backend": "db/page.js",
	"frontend": "../d0/sjs/db/page.js",
	"fromdb": "finishConvertFromDB",
	"reaptime": 240,
	"fields": 
	[
	    {
		"type": "!@Source",
		"name": "name",
		"key": "unique"
	    },
	    {
		"type": "!string",
		"name": "imgpath"
	    },
	    {
		"type": "Array.<!Annotation>",
		"fetype": "Array.<!@Annotation>",
		"name": "annotations",
		"notindb": true,
		"initial": "[]"
	    }
	]
    },
    {
	"class": "Annotation",
	"table": "annote",
	"backend": "db/annote.js",
	"frontend": "../d0/sjs/db/annote.js",
	"reaptime": 240,
	"fields": 
	[
	    {
		"type": "!Page.ID",
		"name": "page",
		"key": "multi"
	    },
	    {
		"type": "!Shape",
		"name": "container"
	    },
	    {
		"type": "Array.<!Annotation.ID>",
		"name": "targets"
	    },
	    {
		"type": "Date",
		"name": "deleted"
	    },
	    {
		"type": "Array.<!Annotation.ID>",
		"name": "children"
	    },
	    {
		"type": "?@Annotation",
		"name": "parent"
	    },
	    {
		"type": "number",
		"name": "lineHeight"
	    }
	]
    }
]

