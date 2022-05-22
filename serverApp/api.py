from config import db
from flask import jsonify
from dbModel import Hosts
from maSchema import HostsSchema, HostsListSchema
import simplejson


def query_hosts_list():
    hosts = Hosts.query.order_by(Hosts.id).all()
    host_schema = HostsListSchema(many=True)
    result = host_schema.dumps(hosts)
    return result


def query_host_status_by_name(name):
    hosts = Hosts.query.filter_by(host_name=name).first()
    host_schema = HostsSchema(many=False)
    result = host_schema.dumps(hosts)
    return result


def query_hosts_with_statuses_data():
    hosts = Hosts.query.order_by(Hosts.host_name).all()
    host_schema = HostsSchema(many=True)
    result = host_schema.dumps(hosts)
    return result


def delete_query_by_host_name(name):
    item = Hosts.find_by_name(name)
    if item:
        item.delete_from_db()
        return True
    return False


def get_method_status_by_name(data):
    jsonStr = query_host_status_by_name(data.get('host_name'))
    jsonObj = simplejson.loads(jsonStr)

    if not jsonObj:
        return {"host_name": data.get('host_name'), "status": "not found"}, 404
    else:
        return jsonify(jsonObj)


def delete_method_by_name(data):
    status = delete_query_by_host_name(data.get('host_name'))
    if status:
        return {"host_name": data.get('host_name'), "status": "deleted"}, 200
    else:
        return {"host_name": data.get('host_name'), "status": 'not found'}, 404


def put_method_by_name(data):
    delete_query_by_host_name(data.get('host_name'))
    try:
        newObj = HostsSchema().load(data)
        db.session.add(newObj)
        db.session.commit()
    except Exception as err:
        return {"error": err}, 500

    return {"host_name": data.get('host_name'), "status": 'created'}, 201

