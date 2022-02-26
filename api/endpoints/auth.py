from flask_restful import Resource, reqparse
from flask import request, make_response
from werkzeug.security import generate_password_hash, check_password_hash

from shared.factories import db
from shared.utils import json_utils as JU
from models.users import User
from models.revoked_tokens import RevokedToken

from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt, get_jti
)

import os

class UserExists(Resource):
    def get(self):
        username = request.args.get('username', None)
        if not username: return JU.make_response(f"parameter '?username=' required", 400)
        if User.find_by_username(username):
            return JU.make_response(f"username '{username}' exists", 200)
        return JU.make_response(f"username '{username}' doesn't exists", 404)

class EmailExists(Resource):
    def get(self):
        email = request.args.get('email', None)
        if not email: return JU.make_response(f"parameter '?email=' required", 400)
        if User.find_by_email(email):
            return JU.make_response(f"email '{email}' exists", 200)
        return JU.make_response(f"email '{email}' doesn't exists", 404)

class Signup(Resource):
    def post(self):
        if os.environ.get('DISABLE_SIGNUP', "false").lower() == "true":
            return JU.make_response("signup is disabled by admin", 403)
        
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
            access_token = create_access_token(identity=username, fresh=True)
            refresh_token = create_refresh_token(identity=username)
            return make_response({
                "message": f"user {username} created",
                "access_token": access_token,
                "refresh_token": refresh_token
                }, 200)
        except Exception as e:
            print(e)
            return JU.make_response("something went wrong", 500)

class UserDetails(Resource):
    @jwt_required()
    def get(self):
        username = get_jwt_identity()
        user = User.find_by_username(username)
        if not user:
            return JU.make_response(f"user '{username}' doesn't exists", 404)
        return user.JSON
        
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
        
        access_token = create_access_token(identity=username, fresh=True)
        refresh_token = create_refresh_token(identity=username)
        return make_response({
                "message": f"logged in as {username}",
                "access_token": access_token,
                "refresh_token": refresh_token
            }, 200)

class Logout(Resource):
    @jwt_required()
    def post(self):
        access_jti = get_jwt()['jti']
        refresh_token = JU.extract_keys(request.get_json(), "refresh_token")
        if not refresh_token: return JU.make_response("refresh token is required", 400)
        try:
            refresh_jti = get_jti(refresh_token)
            RevokedToken(jti=access_jti).add()
            RevokedToken(jti=refresh_jti).add()
            return {'message': 'logged out successfully'}
        except Exception as e:
            print(e)
            return {'message': 'something went wrong'}, 500

class DeleteAccount(Resource):
    @jwt_required()
    def post(self):
        username = get_jwt_identity()
        password,  refresh_token = JU.extract_keys(request.get_json(), "password", "refresh_token")
        if JU.null_values(username, password, refresh_token):
            return JU.make_response("invalid data", 400)
        
        access_jti = get_jwt()['jti']
        refresh_jti = get_jti(refresh_token)
        user = User.find_by_username(username)

        if not user:
            return JU.make_response(f"user '{username}' doesn't exists", 404)
        if not User.verify(user.password, password):
            return JU.make_response(f"wrong password", 401)

        user.delete_from_db()
        RevokedToken(jti=access_jti).add()
        RevokedToken(jti=refresh_jti).add()
        return JU.make_response(f"user '{username}' deleted", 200)

class TokenRefresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        username = get_jwt_identity()
        access_token = create_access_token(identity=username, fresh=False)
        return make_response({'access_token': access_token}, 200)

class RevokeRefreshToken(Resource):
    @jwt_required(refresh=True)
    def post(self):
        jti = get_jwt()['jti']
        try:
            revoked_token = RevokedToken(jti = jti)
            revoked_token.add()
            return {'message': 'refresh token has been revoked'}
        except:
            return {'message': 'something went wrong'}, 500

class RevokeAccessToken(Resource):
    @jwt_required()
    def post(self):
        jti = get_jwt()['jti']
        try:
            revoked_token = RevokedToken(jti = jti)
            revoked_token.add()
            return {'message': 'access token has been revoked'}
        except:
            return {'message': 'something went wrong'}, 500