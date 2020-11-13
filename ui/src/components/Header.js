import React from 'react'
import '../styles/Header.css'
import logo from '../assets/images/logo.png';
import { Avatar as AvatarLogo } from "@material-ui/core";
import { Link } from "react-router-dom";

function Avatar() {
    if (true){
        return (
            <Link to="/login">
            <p class="nav_login_link">Login</p>
            </Link>
            // <AvatarLogo />
        )
    } else{
        return (
            <AvatarLogo />
        )
    }
}

function Header() {
    return (
        <div className='header'>
            <Link to='/'>
                <img
                    className="header__icon"
                    src={logo}
                    alt=""
                />
            </Link>
            <div className='header__right'>
                <Avatar />
            </div>
        </div>
    )
}

export default Header