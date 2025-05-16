import logging
import json
import os

from flask import Flask, request, jsonify
from flask import render_template
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
from bson import ObjectId
from bson.errors import InvalidId

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # αυτός είναι ο φάκελος src
TEMPLATE_DIR = os.path.join(BASE_DIR, '..', 'web', 'templates')  # ένα επίπεδο πάνω, μετά web/templates
STATIC_DIR = os.path.join(BASE_DIR, '..', 'web', 'static')

app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)

CORS(app)
app.config["MONGO_URI"] = "mongodb://localhost:27017/e_shopDB"
mongo = PyMongo(app)

# Init swagger
SWAGGER_URL = '/docs'
API_URL = '/swagger.json'

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={ 'app_name': "E-Shop API" }
)

app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

@app.route('/')
def home_page():
    return render_template('homepage.html')

@app.route('/products')
def products_page():
    return render_template('products.html')


@app.route('/swagger.json')
def swagger_json():
    with open('swagger.json', encoding='utf-8') as f:
        data = json.load(f)
    return jsonify(data)


# Product search
@app.route("/search", methods=["GET"])
def search_products():
    name = request.args.get("name", "").strip()

    query = {}
    if name:
        if " " in name:
            query = {"name": name}
        else:
            query = {"$text": {"$search": name}}

    products = mongo.db.products.find(query).sort("price", -1)
    
    result = []
    for product in products:
        product["_id"] = str(product["_id"])  # μετατροπή ObjectId σε string

        result.append(product)

    return jsonify(result)


# Like a product
@app.route('/like', methods=['POST'])
def like_product():
    product_id = request.json.get('product_id')
    if not product_id:
        return jsonify({"error": "Missing product_id"}), 400

    try:
        _id = ObjectId(product_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid product_id"}), 400

    result = mongo.db.products.update_one(
        {"_id": _id},
        {"$inc": {"likes": 1}}
    )

    if result.modified_count == 1:
        return jsonify({"message": "Like added successfully"}), 200
    else:
        return jsonify({"error": "Product not found"}), 404
    
# Top 5 products
@app.route('/popular-products', methods=['GET'])
def popular_products():
    products = list(mongo.db.products.find().sort("likes", -1).limit(5))
    for product in products:
        product['_id'] = str(product['_id'])
    return jsonify(products), 200


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)