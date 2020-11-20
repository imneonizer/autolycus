import React, { Component } from 'react';
import AddMagnet from "./AddMagnet";
import TorrentCard from "./TorrentCard";
import FileCard from "./FileCard";
import "../styles/Home.css";
import {getFileDetails} from "../services/FileService";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {card: null, data:null}
        this.cardHandler = this.cardHandler.bind(this);
        this.goHome = this.goHome.bind(this);
    }

    componentDidMount() {
        this.props.tFetcher(true);
    }
      
    componentWillUnmount() {
        this.props.tFetcher(false);
    }

    cardHandler(card){
        getFileDetails(card.hash)
        .then( response => {
            if (response.ok){
                response.json().then(json => {
                    this.setState({card:card, data:json})
                })
            }
        }).catch( err => {
            console.log("[ERROR] from getFileDetails:", err)
        })
    }

    goHome(){
        this.setState({card: null, data: null})
    }

    render(){
        if (this.state.card){
            return (
                <div>
                    <AddMagnet/>
                    <FileCard card={this.state.card} data={this.state.data} tFetcher={this.props.tFetcher} goBack={this.goHome}/>
                </div>
            )
        } else {
            return(
                <div>
                    <AddMagnet/>
                    {this.props.torrents.map((data) => {return <TorrentCard data={data} cardHandler={this.cardHandler}/>})}
                </div>
            )
        }
    }

}

export default Home;