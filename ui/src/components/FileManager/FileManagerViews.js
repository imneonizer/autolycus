import React, { Component } from 'react';
import Home from "./components/Home";
import {AuthLogout} from "../../services/LoginService";

function Starred(){
    return(<p>Starred</p>)
}

function RecycleBin(){
    return(<p>RecycleBin</p>)
}

function Help(){
    return(<p>Help</p>)
}

function Settings(){
    return(
        <div>
            <p>Settings</p>
            <button onClick={AuthLogout}>Logout</button>
        </div>
    )
}

class FileManagerViews extends Component {
    constructor(props){
        super(props);
    }

    render() {
        if (this.props.view === "Home"){
            return (<Home torrents={this.props.torrents} tFetcher={this.props.tFetcher}/>)
        } else if  (this.props.view === "Starred"){
            return (<Starred/>)
        } else if (this.props.view === "RecycleBin"){
            return (<RecycleBin/>)
        } else if (this.props.view === "Help"){
            return (<Help/>)
        } else if (this.props.view === "Settings"){
            return (<Settings/>)
        }
    }
}

export default FileManagerViews;