import React, { Component } from 'react';

class FileCard extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.tFetcher(false);
    }

    componentWillUnmount() {
        this.props.tFetcher(true);
    }

    render(){
        return(
            <div>
                <p>{this.props.card.name}</p>
                <p>{JSON.stringify(this.props.card, null, 4)}</p>
            </div>

        )
    }
}

export default FileCard;