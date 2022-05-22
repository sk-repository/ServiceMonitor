from config import ma
from dbModel import Hosts, ServiceStatus, StorageStatus
from marshmallow import fields


class HostsSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Hosts
        load_instance = True    # Optional: deserialize to model instances

    services = fields.Nested("ServiceStatusSchema", many=True)
    storages = fields.Nested("StorageStatusSchema", many=True)


class HostsListSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Hosts
        load_instance = True    # Optional: deserialize to model instances


class ServiceStatusSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ServiceStatus
        include_relationships = True
        load_instance = True    # Optional: deserialize to model instances


class StorageStatusSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = StorageStatus
        include_relationships = True
        load_instance = True    # Optional: deserialize to model instances
