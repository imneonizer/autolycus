import React, { Component } from 'react';
import AddMagnet from "./AddMagnet";
import TorrentCard from "./TorrentCard";
import FileCard from "./FileCard";
import "../styles/Home.css";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {card: null}
        this.cardHandler = this.cardHandler.bind(this);
        this.goHome = this.goHome.bind(this);
    }

    componentDidMount() {
        this.props.tFetcher(true);
    }
      
    componentWillUnmount() {
        this.props.tFetcher(false);
    }

    cardHandler(data){
        this.setState({card: data})
    }

    goHome(){
        this.setState({card: null})
    }

    render(){
        if (this.state.card){
            return (
                <div>
                    <AddMagnet/>
                    <button onClick={this.goHome}>Back</button>
                    <FileCard card={this.state.card} tFetcher={this.props.tFetcher}/>
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