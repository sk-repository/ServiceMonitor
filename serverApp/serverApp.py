from flask import jsonify, render_template, request
from config import app, db
import simplejson
import api


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/api/hostsList', methods=['GET'])
def hosts_list():
    jsonStr = api.query_hosts_list()
    jsonObj = simplejson.loads(jsonStr)
    return jsonify(jsonObj)


@app.route('/api/getAllStatus', methods=['GET'])
def get_status():
    jsonStr = api.query_hosts_with_statuses_data()
    jsonObj = simplejson.loads(jsonStr)
    return jsonify(jsonObj)


@app.route('/api/statusByName', methods=['GET', 'PUT', 'DELETE'])
def host_by_name():
    request_data = request.get_json()
    print('req_body', request_data)
    if not request_data:
        return {"status": "unprocessable entity"}, 422

    if request.method == 'GET':
        status = api.get_method_status_by_name(request_data)
        return status

    if request.method == 'PUT':
        status = api.put_method_by_name(request_data)
        return status

    if request.method == 'DELETE':
        status = api.delete_method_by_name(request_data)
        return status


if __name__ == '__main__':
    db.create_all()
    app.run(host='0.0.0.0', port=3074, debug=False)
