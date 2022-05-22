from config import db


# SqlAlchemy Table Models
class Hosts(db.Model):
    __tablename__ = 'host_name'

    id = db.Column(db.Integer, primary_key=True)
    host_name = db.Column(db.String(30), nullable=False)
    host_description = db.Column(db.String(50), nullable=True)
    timestamp = db.Column(db.Integer, nullable=False)
    services = db.relationship('ServiceStatus', backref='host', cascade='all, delete')
    storages = db.relationship('StorageStatus', backref='host', cascade='all, delete')

    @classmethod
    def find_by_name(cls, name):
        return cls.query.filter_by(host_name=name).first()

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()


class ServiceStatus(db.Model):
    __tablename__ = 'service_status'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), nullable=False)
    status = db.Column(db.String(10), default=None)
    uptime = db.Column(db.Integer, default=None)
    since = db.Column(db.Integer, default=None)
    host_id = db.Column(db.Integer, db.ForeignKey('host_name.id', onupdate="cascade"))

    @classmethod
    def find_by_name(cls, name):
        return cls.query.filter_by(host_name=name).first()

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()


class StorageStatus(db.Model):
    __tablename__ = 'storage_status'

    id = db.Column(db.Integer, primary_key=True)
    mnt = db.Column(db.String(50), nullable=False)
    used = db.Column(db.String(4), default=None)
    size = db.Column(db.String(10), default=None)
    host_id = db.Column(db.Integer, db.ForeignKey('host_name.id', onupdate="cascade"))

    @classmethod
    def find_by_name(cls, name):
        return cls.query.filter_by(host_name=name).first()

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
