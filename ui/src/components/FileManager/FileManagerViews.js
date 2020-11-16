import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link} from "react-router-dom";
import Home from "./components/Home";

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
    return(<p>Settings</p>)
}

class FileManagerViews extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.view === "Home"){
            return (<Home torrents={this.props.torrents}/>)
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