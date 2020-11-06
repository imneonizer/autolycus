from flask_restful import Resource, reqparse
from flask import request, make_response
from werkzeug.security import generate_password_hash, check_password_hash

from shared.factories import db
from shared.utils import json_utils as JU
from models.users import User

class UserExists(Resource):
    def get(self):
        username = request.args.get('username', None)
        if not username: return JU.make_response(f"parameter '?username=' required", 400)
        if User.find_by_username(username):
            return JU.make_response(f"username '{username}' exists", 200)
        return JU.make_response(f"username '{username}' doesn't exists", 404)

class Signup(Resource):
    def post(self):
        name, username, email, password = JU.extract_keys(
            request.get_json(), "name", "username", "email", "password")

        if JU.null_values(name, username, email, password):
            return JU.make_response("invalid data", 400)
        if User.find_by_username(username):
            return JU.make_response(f"user '{username}' already exists", 409)
        if User.find_by_email(email):
            return JU.make_response(f"email '{username}' already used", 409)

        new_user = User(name=name, username=username,
            email=email, password=User.hashify(password))

        try:
            new_user.save_to_db()
            return JU.make_response(f"user {username} created", 200)
        except:
            return JU.make_response("something went wrong", 500)

class Login(Resource):
    def post(self):
        username, password = JU.extract_keys(
            request.get_json(), "username", "password")
        
        if JU.null_values(username, password):
            return JU.make_response("invalid data", 400)
        
        user = User.find_by_username(username)
        
        if not user:
            return JU.make_response(f"username '{username}' doesn't exist", 404)
        if not User.verify(user.password, password):
            return JU.make_response(f"wrong password", 401)
        return JU.make_response(f"logged in successfully", 200)

class Logout(Resource):    
    def post(self):
        username = JU.extract_keys(
            request.get_json(), "username")
        
        if JU.null_values(username):
            return JU.make_response("invalid data", 400)
        
        user = User.find_by_username(username)
        
        if not user:
            return JU.make_response(f"username '{username}' doesn't exist", 404)
        return JU.make_response(f"logged out successfully", 200)

class DeleteAccount(Resource):
    def post(self):
        username, password = JU.extract_keys(
            request.get_json(), "username", "password")
        
        if JU.null_values(username, password):
            return JU.make_response("invalid data", 400)
        
        user = User.find_by_username(username)

        if not user:
            return JU.make_response(f"username '{username}' doesn't exist", 404)
        if not User.verify(user.password, password):
            return JU.make_response(f"wrong password", 401)

        user.delete_from_db()
        return JU.make_response(f"user '{username}' deleted", 200)

class UserDetails(Resource):
    def get(self):
        username = request.args.get('username', None)
        if not username: return JU.make_response(f"parameter '?username=' required", 400)

        user = User.find_by_username(username)
        if not user:
            return JU.make_response(f"username '{username}' doesn't exist", 404)
        return user.JSON

    def post(self):
        username = JU.extract_keys(
            request.get_json(), "username")
        
        if JU.null_values(username):
            return JU.make_response("invalid data", 400)
        
        user = User.find_by_username(username)
        if not user:
            return JU.make_response(f"username '{username}' doesn't exist", 404)
        return user.JSON