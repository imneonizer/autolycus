import React, { Component } from 'react';
import AddMagnet from "./AddMagnet";
import TorrentCard from "./TorrentCard";
import FileCard from "./FileCard";
import "../styles/Home.css";
import {getFileDetails} from "../services/FileService";
import cogoToast from 'cogo-toast';
import {getAuthToken} from "../services/FileService";
import {uri} from "../../../uri";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {card: null, data:null, parent_items: []}
        this.cardHandler = this.cardHandler.bind(this);
        this.goBack = this.goBack.bind(this);
        this.updateCard = this.updateCard.bind(this);
    }

    componentDidMount() {
        this.props.tFetcher(true);

        window.history.pushState({name: "browserBack"}, "on browser back click", window.location.href);
        window.history.pushState({name: "browserBack"}, "on browser back click", window.location.href);
        
        // switch to previous directory when user presses back button in browser
        window.addEventListener('popstate', () => {
            // pass when on Home screen
        }, false)
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
            }else {
                cogoToast.error("file not found", {position: "top-center", hideAfter: 1});
            }
        }).catch( err => {
            console.log("[ERROR] from getFileDetails:", err)
        })
    }

    goBack(){
        let previous_item = this.state.parent_items.slice(-1)[0];
        this.setState({data: previous_item, parent_items: this.state.parent_items.filter(i => i !== previous_item)});
    }

    updateCard(data, previous_item){
        if (data.type === "directory"){
            this.setState({ data: data, parent_items: this.state.parent_items.concat([previous_item]) })
        }else {
            if ([".mkv", ".mp4", ".avi", ".txt", ".srt", ".jpg", ".mp3", ".wav"].includes(data.ext)){
                let b64 = btoa(unescape(encodeURIComponent(data.path)));
                let url = uri()+"/public/"+b64+"?token="+getAuthToken().access_token
                var win = window.open(url, '_blank');
                win.focus();
            }
        }
    }

    render(){
        if (this.state.data){
            return (
                <div style={{scrollBehavior: "smooth"}}>
                    <AddMagnet/>
                    <FileCard data={this.state.data} key={this.state.data} tFetcher={this.props.tFetcher} goBack={this.goBack} updateCard={this.updateCard}/>
                </div>
            )
        } else {
            return(
                <div>
                    <AddMagnet/>
                    {this.props.torrents.map((data) => {return <TorrentCard data={data} key={data.name} cardHandler={this.cardHandler}/>})}
                </div>
            )
        }
    }

}

export default Home;