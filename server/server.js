const http = require('http');
const cors = require('cors');
const app = require('express')();
const bitcoincore = require('bitcoin-core');

const client = new bitcoincore({
    host: 'blockchain.oss.unist.hr',
    port: 8332,
    username: 'student',
    password: '',
});

app.use(cors());

app.get('/', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*:*');
    res.send("Hello World");
});
const server = http.createServer(app);
const io = require('socket.io')(server);

server.listen(3000);

io.on('connection', (socket) => {
    console.log("Klijent spojen na server");

    socket.on('visina', (visina, callback) => {
        //console.log(`Primljena "visina": ${visina}`);
    
        // Slanje odgovora klijentu
        client.getBlockHash(visina).then((hash) => {
          client.getBlock(hash).then((block) => {
            callback(block);
          });
        }); 
      });

    socket.on('transaction', (transaction, callback) => {
        //console.log(`Primljena "transaction" poruka: ${transaction}`);

        // Slanje odgovora klijentu
        outsValue(transaction).then((block) => { //izracunaj vrijednost izlaza
          getFee(transaction).then((fee) => {   //izracunaj vrijednost naknade
            callback(block.decoded, fee, block.value);
          })          
        });
      });
});

async function getFee(txid){
    var help = await client.getRawTransaction(txid);
    var decoded = await client.decodeRawTransaction(help)
    var vinVouts = [];
    for (let i = 0; i < decoded.vin.length; i++){
      vinVouts.push(decoded.vin[i].vout);
    }
    var vouts = 0;
    var temp = await client.getRawTransaction(decoded.vin[0].txid)
    var decoded2 = await client.decodeRawTransaction(temp)
    for (let i = 0; i < vinVouts.length; i++){
      //console.log(decoded2.vout[vinVouts[i]].value);
      vouts += decoded2.vout[vinVouts[i]].value; //outputi ove transakcije su input u pocetnoj transakciji -> inputs u pocetnoj - vouts u pocetnoj = naknada
    }
    var voutPocetna = 0;
    for (let i = 0; i < decoded.vout.length; i++){
      //console.log(decoded.vout[i].value);
      voutPocetna += decoded.vout[i].value;
    } 
    console.log("Razlika: ", vouts - voutPocetna);
    return vouts - voutPocetna;
  }
  
async function outsValue(txid){
    tx = await client.getRawTransaction(txid);
    decoded = await client.decodeRawTransaction(tx);
    var value = 0;
    console.log(decoded);
    for (let i = 0; i < decoded.vout.length; i++){
        value += decoded.vout[i].value;
    }
    
    //console.log("Ukupna vrijednost izlaza: ",value);
    
    return {decoded, value};
}