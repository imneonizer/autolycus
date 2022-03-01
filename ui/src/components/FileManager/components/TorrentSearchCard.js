import React, { Component } from 'react';
import "../styles/AddMagnet.css"
import "../styles/TorrentSearchCard.css"
import ThreeDotLoader from "../../../components/ThreeDotLoader";
import { apiTorrentSearch, getMagnetFromSearch, addMagnet } from "../services/TorrentSearchService";
import cogoToast from 'cogo-toast';

class SearchTorrent extends Component {
    constructor(props) {
        super(props);
        this.state = {data: [], isLoading: false, threeDotMenuVisible: false};
        this.handleTorrentSearch = this.handleTorrentSearch.bind(this);
        this.trimString = this.trimString.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.copyToClipboard = this.copyToClipboard.bind(this);
    }

    handleTorrentSearch(e){
        let inputBox = document.getElementById("search-magnet-box");
        if (inputBox.value){
            this.setState({isLoading: true});
            this.props.updateSearchResults([]);

            apiTorrentSearch(inputBox.id, inputBox.value)
            .then(response => {
                response.json().then(json => {
                    if (response.status === 200){
                        this.setState({isLoading: false});
                        this.props.updateSearchResults(json);
                    } else {
                        console.log("error in handleTorrentSearch");
                    }
                })
            })
        }
    }

    handleClick(item){
        let { hide } = cogoToast.loading(
            <div className="toast-confirmation">
                <p>Choose one option</p>
                <button style={{backgroundColor: "rgb(42, 154, 245)"}} onClick={() => copyMagnet(item)}>Copy</button>
                <button style={{backgroundColor: "#4CAF50"}} onClick={() => addToDownload(item)}>Download</button>
            </div>, {
            hideAfter: 3
        });

        var addToDownload = (item) => {
            hide();
            if (item.magnet){
                // if magnet is preent in json
                addMagnet(item.magnet).then(res =>{
                    if (res){
                        cogoToast.success("Magnet Added!")
                    }else{
                        cogoToast.error("Unable to Added Magnet")
                    }
                })
            } else {
                // query magnet from API first
                getMagnetFromSearch(item).then(response => {
                    addMagnet(response).then(res =>{
                        if (res){
                            cogoToast.success("Magnet Added!");
                        }else{
                            cogoToast.error("Unable to Added Magnet");
                        }
                    })
                })
            } 
        }

        var copyMagnet = (item) => {
            hide();
            if (item.magnet){
                // if magnet is preent in json
                this.copyToClipboard(item.magnet);
            } else {
                // query magnet from API first
                getMagnetFromSearch(item).then(response => {
                    this.copyToClipboard(response);
                })
            }
            
        }

    }

    copyToClipboard(magnet){
        if (magnet){
            // copy magnet to clipboard
            const el = document.createElement('textarea');
            el.value = magnet;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
    }

    trimString(string, length){
        let w = window.innerWidth;
        
        if ( w >= 800){
            return string;
        }else {
            let postfix = "";
            if (string.length > length){
                postfix = "...";
            }
            return string.slice(0, length).trim()+postfix;
        }
    }

    render(){
        return(
            <div>
                <div className="add-magnet-div">
                    <input id="search-magnet-box" type="text" placeholder="Search Torrent" autoComplete="off" onKeyPress={event => {if (event.key === 'Enter') {this.handleTorrentSearch()}}} />
                    <img alt='' className="add-magnet-icon" src="/autolycus/icons/bx-search.svg" onClick={this.handleTorrentSearch}/>
                </div>

                {this.state.isLoading && <ThreeDotLoader/>}
                {this.props.searchResults && this.props.searchResults.map((item, idx) => {
                    return (
                        <div className="torrent-search-result-card" key={idx}>
                            <div style={{display: 'flex'}}>
                                <img alt='' className="search-result-magnet-icon svg-black" style={{paddingRight: '15px', width: '25px'}} src="/autolycus/icons/bx-magnet.svg"/>
                                <div>
                                    <p className="torrent-search-result-card-name" onClick={() => this.handleClick(item)}>{this.trimString(item.name, 30)}</p>
                                    <div className="torrent-search-result-card-details">
                                        <p>{item.size}</p>
                                        <p>↓ {item.seed}</p>
                                        <p>{item.created}</p>
                                        <p>{item.type}</p>
                                        <p>{item.source.toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                )}
            </div>
        )
    }

}

export default SearchTorrent;