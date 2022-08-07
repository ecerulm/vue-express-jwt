
import {ref} from 'vue';

export const isLoggedIn = ref(false); 

export function updateLoggedInStatus() {
    // TODO instead of just checkin that authToken exists in the Web Storage API
    //      use the authToken towards /api/userinfo, that will tell you if 
    //      you are still logged in or not
    
    // requirements
    // * the api request must have Content-type json an a X-* header 
    console.log('updateLoggedInStatus');
    const authToken = localStorage.getItem('authToken'); 
    
    //isLoggedIn.value = localStorage.getItem('authToken') !== null;

    fetch('http://localhost:5001/api/userinfo', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    })
    .then(res => res.json())
    .then(res => {
        console.log('updating login status with', res)
        isLoggedIn.value = Boolean(res.loggedIn);
    });
};

export function login(username, password) {
    console.log("login()", username);

    fetch('http://localhost:5001/api/login', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({
            username, password  
        }),
        credentials: "omit", 
        cache: 'no-store', 
    }).then(res => {
        console.log('res', res);
        return res.json();
    })
    .then(res => {
        console.log('login response', res);
        localStorage.setItem('authToken', res.token);
    })
    .catch(err => { 
        console.log(err);
    });
}

