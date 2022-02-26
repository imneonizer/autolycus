import {uri} from "../../../uri";
import {ValidateAuth} from "../../../services/LoginService";
import axios from 'axios';

function getAuthToken(){
    let auth = localStorage.getItem('autolycus-auth');
    if (auth !== "undefined"){
        auth = JSON.parse(auth)
    }
    return auth;
}

async function FetchStorageData(){
    let auth = getAuthToken();
    
    const headers = { Authorization: `Bearer ${auth.access_token}` };
    let stats = {usedBytes: 0, totalBytes: 0};

    await axios.get(uri()+"/storage-status", { headers })
    .then(function (response) {
        stats = response.data;
    }).catch(function (error) {
        console.log(error);
    });
    
    return stats;
}

export default FetchStorageData;