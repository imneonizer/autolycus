import React, { Component } from 'react';

class FileCard extends Component {
    constructor(props) {
        super(props);
        this.state = {data: null};
        this.humanFileSize = this.humanFileSize.bind(this);
    }

    componentDidMount() {
        this.props.tFetcher(false);
    }

    componentWillUnmount() {
        this.props.tFetcher(true);
    }

    cardHandler(data){
        this.setState({data: data})
    }

    goBack(){
        this.setState({data: null})
    }

    humanFileSize(size) {
        if (!size){return "0 Bytes"}

        var i = Math.floor( Math.log(size) / Math.log(1024) );
        return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    };

    render(){
            return(
                <div>
                    <p>{this.props.data.name}</p>
                    {this.props.data.children.map((item) => {
                        return (
                            <div>
                            <p>{item.name}</p>
                            <p>{this.humanFileSize(item.size)}</p>
                            <br />
                        </div>
                        
                        )
                    })}
                </div>
            )
        }
}

export default FileCard;