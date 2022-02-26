import {uri} from "../../../uri";
import axios from 'axios';

function getAuthToken(){
    let auth = localStorage.getItem('autolycus-auth');
    if (auth !== "undefined"){
        auth = JSON.parse(auth)
    }
    return auth;
}

function getAuthHeader(method="POST"){
    let auth = getAuthToken();
    return { 
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + auth.access_token}
        }
}

function apiTorrentSearch(element_id, query){
    let auth = getAuthToken();
    if (auth){
        return fetch(uri()+"/torrents/search?query="+query, getAuthHeader("GET"))
    }
}


async function getMagnetFromSearch(item){
    let auth = getAuthToken();
    let magnet = null;

    await axios.post(uri()+"/torrents/search", {
        item: item
    }, {
    headers: {
        'Authorization': `Bearer ${auth.access_token}` 
    }
    }).then(function (response) {
        magnet = response.data.magnet;
    }).catch(function (error) {
        console.log(error);
    });
    
    return magnet;
}


function addMagnet(magnet){
    let auth = getAuthToken();
    return axios.get(uri()+"/torrents/add?magnet="+magnet,{
        headers: {
            'Authorization': `Bearer ${auth.access_token}` 
        }
    })
    .then(function (response) {
        // console.log("Magnet added to download queue!")
        return true;
    }).catch(function (error) {
        console.log(error)
        return false;
    });
}


export {
    apiTorrentSearch,
    getMagnetFromSearch,
    addMagnet
};