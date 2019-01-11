var modules = [];
var shared = {};

function readAll(inputStream)
{
	let len = inputStream.available();
	let buf = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, len);
	if(inputStream.read(buf) != len)
	{
		throw "Failed to read all";
	}
	return new java.lang.String(buf);
}

function loadModule(path)
{
	try
	{
		let e = "Invalid v1g module or I/O exception occurred";
		var zf = new java.util.zip.ZipFile(path);
		var module_json = zf.getEntry("module.json");
		if(module_json == null || module_json.isDirectory())
		{
			throw e;
		}
		var zis = zf.getInputStream(module_json);
		var module = JSON.stringify(readAll(zis));
		zis.close();
		zis = undefined;
		if(typeof module.name !== "v1g")
		{
			throw e;
		}
		if(typeof module.name == "string")
		{
			var name = module.name;
		}
		else
		{
			throw e;
		}
		if(typeof module.version == "string")
		{
			var version = module.version;
		}
		else
		{
			throw e;
		}
		if(typeof module.filename != "string")
		{
			throw e;
		}
		var script = zf.getEntry(module.filename);
		var func = new Function("shared", readAll(zis = script.getInputStream()));
		zis.close();
		zis = undefined;
		if(func = func(shared))
		{
			if(typeof func != "function")
			{
				throw e;
			}
			modules.push(func);
		}
		else
		{
			throw "Failed to load module";
		}
	}
	catch(e)
	{
		if(zis)
		{
			try
			{
				zis.close();
			}
			catch(e)
			{
			}
		}
		throw e;
	}
}

function response(room, msg, sender, isGroupChat, replier, imageDB)
{
	for(let i = 0; i < modules.length; i++)
	{
		if(modules[i](room, msg, sender, isGroupChat, replier, imageDB))
		{
			return;
		}
	}
}
