import PocketBase from 'pocketbase';
// Get url from env
// const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

const pb = new PocketBase('http://127.0.0.1:8090');
// const pb = new PocketBase('http://192.168.0.204:8090');

// const pb = new PocketBase('https://swiftly.pockethost.io/');

export default pb;