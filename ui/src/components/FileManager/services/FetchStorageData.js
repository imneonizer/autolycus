import {uri} from "../../../uri";
import axios from 'axios';

function getAuthToken(validate=false){
    let auth = localStorage.getItem('autolycus-auth');
    if (auth === undefined || auth === null) {
        return {access_token: ''};
    }else{
        return JSON.parse(auth)
    }
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