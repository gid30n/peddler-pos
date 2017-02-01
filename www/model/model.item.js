(function(){
	'use strict';

	angular.module('app.model')
	.factory('Item',Item);

	Item.$inject = ['$q'];
	function Item($q) {
		return {
			initDB:initDB,
			addCategory:addCategory,
			getCategories:getCategories,
			addItem:addItem,
			getItem:getItem,
			getItemsByCategory:getItemsByCategory,
			removeItem:removeItem
		};

		function initDB() {
			// _db = new PouchDB('peddlerpos',{adapter:'websql'});
			checkDdocs();
		}

		function addCategory(category) {
			return $q.when(_db.put(category).catch(function(error){
				return error;
			}));
		}

		function getCategories(key) {
			return $q.when(_db.query('itemDdocs/category',{key:key})
				.then(function(docs){
					return docs.rows;
				}).catch(function(error){
					return error;
				}));
		}

		function addItem(item) {
			return $q.when(_db.put(item).then(function(result){
				return result;
			}).catch(function(error){
				return error;
			}));
		}

		function getItem(id) {
			return $q.when(_db.get(id).then(function(doc){
				return doc;
			}).catch(function(error){
				return error;
			}));
		}

		function getItemsByCategory(category) {
			return $q.when(_db.query('itemDdocs/item_in_category',{key:category,include_docs:true})
				.then(function(docs){
					return docs.rows.map(function(row){
						return row.doc;
					});
				}).catch(function(error){
					return error;
				}));
		}

		function removeItem(id) {
			return $q.when(_db.get(id).then(function(doc){
				return _db.remove(doc);
			}).catch(function(error){
				return error;
			}));
		}

		// function updateItem(id) {
		// 	return $q.when(_db.get(id).then(function(doc){
		// 		return _db.put()
		// 	}).catch(function(error){
		// 		return error;
		// 	}));
		// }

		function checkDdocs(update) {
			if(update){
				createDdocs(update);
				return 0;
			}

			$q.when(_db.get('_design/itemDdocs').then(function(docs){
				return docs;
			}).catch(function(error){
				if(error.message == 'missing'){
					createDdocs();
				}
			}));
		}

		function createDdocs(update) {
			var ddocs = {
				_id:'_design/itemDdocs',
				views:{
					'category':{
						map:function(doc){
							if(doc.type == 'category'){
								emit(doc.parent_category,doc.category);
							}
						}.toString()
					},
					'item_in_category':{
						map:function(doc){
							if(doc.type == 'item'){
								emit(doc.category);
							}
						}.toString()
					}
				}
			};

			if(update){
				$q.when(_db.get('_design/itemDdocs').then(function(docs){
					ddocs._rev = docs._rev;

					_db.put(ddocs).then(function(result){
						// console.log('updated');
						// console.log(result);
						
					});
				}));

				return 0;
			}
			
			$q.when(_db.put(ddocs));
		}
	}
})();