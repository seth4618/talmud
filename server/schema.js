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
	    "type": "Source?",
	    "name": "parent",
	    "backend": "resolve"
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
	    "type": "Source?",
	    "name": "next",
	    "notindb": true,
	    "initial": null
	},
	{
	    "type": "Source?",
	    "name": "prev",
	    "notindb": true,
	    "initial": null
	},
	{
	    "type": "Source?",
	    "name": "child",
	    "notindb": true,
	    "initial": null
	}
    ]
}

