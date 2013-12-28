var ImageMeta = function (meta) {
	this.type = meta.type;
	this.caption = meta.cation;
	this.validate = function () {
		if (this.type)
			return true;
		else 
			return false;
	}
}

module.exports = ImageMeta;