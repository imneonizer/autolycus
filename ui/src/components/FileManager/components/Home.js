import React, { Component } from 'react';
import AddMagnet from "./AddMagnet";
import TorrentCard from "./TorrentCard";
import "../styles/Home.css"

class Home extends Component {
    constructor(props) {
        super(props);
    }

    render(){
        return(
            <div>
                <AddMagnet/>
                {this.props.torrents.map((data) => {return <TorrentCard data={data}/>})}
            </div>
        )
    }

}

export default Home;