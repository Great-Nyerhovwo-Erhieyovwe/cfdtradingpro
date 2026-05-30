import axios from 'axios';

(async ()=>{
  try{
    const res = await axios.post('http://localhost:4000/api/auth/login', { email: 'benjaminjmcmahan@gmail.com', password: 'Benji@101' }, { timeout: 5000 });
    console.log('status', res.status);
    console.log(res.data);
  }catch(e){
    if(e.response) console.error('status', e.response.status, e.response.data);
    else console.error('error', e.message);
  }
})();
