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
        this.state = {card: null, data:null, parent_items: [], videoUrl: null, videoMeta: {}}
        this.cardHandler = this.cardHandler.bind(this);
        this.goBack = this.goBack.bind(this);
        this.updateCard = this.updateCard.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.addItem = this.addItem.bind(this);
        this.renameItem = this.renameItem.bind(this);
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
            let b64 = btoa(unescape(encodeURIComponent(data.path)));
            let url = uri()+"/public/"+b64+"?token="+getAuthToken().access_token;
            if ([".mkv", ".mp4", ".avi"].includes(data.ext)){    
                this.setState({videoUrl: url, videoMeta: data});
            } else if (data.ext === ".m3u8"){
                let url = uri()+"/hls/"+getAuthToken().access_token+"/"+btoa(unescape(encodeURIComponent(data.path)))+"/"+data.info.key+".m3u8";
                this.setState({videoUrl: url, videoMeta: data});
            }
            else if ([".txt", ".srt", ".jpg", ".mp3", ".wav"].includes(data.ext)) {
                let win = window.open(url, '_blank');
                win.focus();
            }
        }
    }

    removeItem(e){
        let children = this.state.data.children.filter(function(item) {
            return item.path !== e.path
        });
        
        let data = this.state.data
        data.children = children;
        this.setState({data: data})
    }
    
    addItem(parent, child, data='none'){
        if (data === 'none'){
            data = this.state.data;
        }

        if (data['children']){
            for (var i = 0; i < data.children.length; i++) {
                let item = data.children[i];                
                if (item.type === 'directory'){
                    this.addItem(parent, child, item)
                }

                if (parent.path === item.path){
                    var filename = parent.path;
                    var s = filename.split("/");
                    var newpath = s.slice(0, s.length).join("/") + "/" +child.name;
                    child.path = newpath;
                    for (var j=0; j< parent.children.length; j++){
                        let subchild = parent.children[j];
                        if (subchild.name !== child.name){
                            parent.children.push(child);
                        }
                    }
                    
                }
            }
        }
    }

    renameItem(item, newname){
        var filename = item.path;
        var s = filename.split("/");
        var newpath = s.slice(0, s.length-1).join("/") + "/" +newname;
        item.name = newname;
        item.path = newpath;
    }

    render(){
        if (this.state.data){
            return (
                <div style={{scrollBehavior: "smooth"}}>
                    <AddMagnet videoUrl={this.state.videoUrl} videoMeta={this.state.videoMeta} />
                    <FileCard data={this.state.data} updateActiveItemHover={this.props.updateActiveItemHover} removeItem={this.removeItem} addItem={this.addItem} renameItem={this.renameItem} key={this.state.data} tFetcher={this.props.tFetcher} goBack={this.goBack} updateCard={this.updateCard}/>
                </div>
            )
        } else {
            return(
                <div>
                    <AddMagnet videoUrl={this.state.videoUrl} videoMeta={this.state.videoMeta}/>
                    {this.props.torrents && this.props.torrents.map((data) => {return <TorrentCard data={data} key={data.name} updateActiveItemHover={this.props.updateActiveItemHover} cardHandler={this.cardHandler}/>})}
                </div>
            )
        }
    }

}

export default Home;