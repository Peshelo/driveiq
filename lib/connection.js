import PocketBase from 'pocketbase';
// Get url from env
// const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

// const pb = new PocketBase('https://driveriq.afroteqi.com'); // Production
// const pb = new PocketBase('http://localhost:8090'); // Production

const pb = new PocketBase('http://102.37.147.67:8090');

// const pb = new PocketBase('https://swiftly.pockethost.io/');

export default pb;