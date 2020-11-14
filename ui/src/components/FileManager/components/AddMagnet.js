import React, { Component } from 'react';
import "../styles/AddMagnet.css"

class AddMagnet extends Component {
    constructor(props) {
        super(props);
    }

    render(){
        return(
            <div className="add-magnet-div">
                <input id="add-magnet-box" type="text" placeholder="Add Magnet Link" />
                <img className="add-magnet-icon" src="icons/bxs-file-plus.svg"/>
            </div>

        )
    }

}

export default AddMagnet;