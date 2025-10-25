import * as Server from './server.js';

Server.init()
let stadiums = await Server.getStadiums()
stadiums.forEach(p => console.log(p))