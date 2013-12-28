var DBRequest = function  (dbRequest) {
	if (dbRequest.collectionName)
		this.collectionName = dbRequest.collectionName;
	if (dbRequest.document)
		this.document = dbRequest.document;
	if (dbRequest._id)
		this._id = dbRequest._id;
	if (dbRequest.numberOfRecordsPerPage)
		this.numberOfRecordsPerPage = dbRequest.numberOfRecordsPerPage;
	if (dbRequest.page)
		this.page = dbRequest.page;
	if (dbRequest.dbQuery) {
		if (dbRequest.dbQuery.validate())
			this.dbQuery = dbRequest.dbQuery;
		else
			throw new Error('dbQuery is not a valid query, as its attribute values are not defined.')
	}
	if (dbRequest.updateValue)
		this.updateValue = dbRequest.updateValue;
	if (dbRequest.img)
		this.img = dbRequest.img;
	if (dbRequest.imgMeta)
		this.imgMeta = dbRequest.imgMeta;
	if (dbRequest.img_id)
		this.img_id = dbRequest.img_id
};
module.exports = DBRequest;