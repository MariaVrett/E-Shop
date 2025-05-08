import logging

from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import ObjectId
import numpy as np

app = Flask(__name__)
CORS(app)
app.config["MONGO_URI"] = "mongodb://localhost:27017/dolledupDB"
mongo = PyMongo(app)


@app.route('/search', methods=['GET'])
def search_products():
    search_text= request.args.get('name', '')
    if search_text=='':
        products=list(mongo.db.products.find().sort("likes",-1))
    else:
        products = list(mongo.db.products.find(
            {"$text": {"$search": search_text}},
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"}), ("likes", -1)]))
    for product in products:
        product['_id'] = str(product['_id'])
    return jsonify(products)


@app.route('/like', methods=['POST'])
def like_product():
    product_id=request.json.get('product_id')
    if not product_id:
        return jsonify({"error": "Missing product_id"}), 400
    result= mongo.db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$inc": {"likes": 1}}
    )
    if result.modified_count==1:
        return jsonify({"message": "Like added successfully"}), 200
    else:
        return jsonify({"error": "Product not found"}), 404



@app.route('/popular-products', methods=['GET'])
def popular_products():
    products = list(mongo.db.products.find().sort("likes", -1).limit(5))
    for product in products:
        product['_id'] = str(product['_id'])
    return jsonify(products), 200

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)