from sqlalchemy.exc import SQLAlchemyError
from flask import make_response

def check_db(db):
    """Checks if DB Connection is successful"""
    from flask import current_app
    try:
        db.session.execute("SELECT 1")
        db.session.commit()
        db.session.remove()
    except SQLAlchemyError as se:
        current_app.logger.error(str(se))
        return False
    return True

class json_utils:
    @staticmethod
    def extract_keys(JSON, *args):
        if not JSON:
            if len(args) == 1: return
            return [None for i in range(len(args))]

        if len(args) == 1: return JSON.get(args[0], None)
        return [JSON.get(key, None) for key in args]

    @staticmethod
    def null_values(*args):
        if None in args: return True

    @staticmethod
    def make_response(message, code):
        return make_response({"message": message}, code)