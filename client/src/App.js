import React, {useState, useEffect} from 'react';
import './App.css';
import socketIOClient from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [inputTransaction, setInputTransation] = useState('');
  const [block, setBlock] = useState(null);
  const [transaction, setTransation] = useState(null);
  const [transactionFee, setTransationFee] = useState(null);
  const [transactionOuts, setTransationOuts] = useState(null);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const socket = socketIOClient('http://localhost:3000', {transports: ['websocket', 'polling', 'flashsocket']});
    socket.on('connect', () => {
      console.log('Spajanje na server uspješno!');
      socket.emit('visina', parseInt(inputValue), (podaci) => {
        //console.log('Primljena poruka s servera:', podaci);
        setBlock(podaci);
      });
    });
    socket.on('error', (error) => {
      console.error(`Došlo je do greške pri spajanju na server: ${error}`);
    });
    socket.connect();
    setSocket(socket);
  };

  const handleChangeTransaction = (event) => {
    setInputTransation(event.target.value);
  };

  const handleSubmitTransaction = (event) => {
    event.preventDefault();
    const socket = socketIOClient('http://localhost:3000', {transports: ['websocket', 'polling', 'flashsocket']});
    socket.on('connect', () => {
      console.log('Spajanje na server uspješno!');
      socket.emit('transaction', inputTransaction, (podaci, fee, outs) => {
        //console.log('Primljena poruka s servera:', podaci, "fee: ", fee, "outs: ", outs);
        setTransation(podaci);
        setTransationFee(fee);
        setTransationOuts(outs);
      });
    });
    socket.on('error', (error) => {
      console.error(`Došlo je do greške pri spajanju na server: ${error}`);
    });
    socket.connect();
    setSocket(socket);
  };

  useEffect(() => {
    return () => {
      // Odspajanje socketa kada se komponenta uništi
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);
  

  return (
    <div className="App">
      <div className='navbar'> <span>BLOCKEXPLORER</span> </div>
      <div className='details'>
        <form onSubmit={handleSubmit}>
          <b>Pretrazivanje po visini bloka: </b>
          <input type="text" value={inputValue} onChange={handleChange} className='input'/>
          <button type="submit" className='btn'>Pretrazi</button>
        </form>
        {block ? (
          <div>
          <p>Visina bloka: <em>{block.height}</em></p>
          <p>Hash bloka: <em>{block.hash}</em></p>
          <p>Hash prethodnog bloka: <em>{block.previousblockhash}</em></p>
          <p>Broj transakcija bloka: <em>{block.nTx}</em></p> 
          <p>Velicina bloka: <em>{block.size} bajtova</em></p>
          <p>Tezina bloka: <em>{block.weight}</em></p> 
          <p>Verzija bloka: <em>{block.version}</em></p> 
          <p>Broj potvrda bloka: <em>{block.confirmations}</em></p>
          </div>
        ) : null}
      </div>
      <div className='details'>
      <form onSubmit={handleSubmitTransaction}>
        <b>Pretrazivanje po transakciji: </b>
        <input type="text" value={inputTransaction} onChange={handleChangeTransaction} className='input' />
        <button type="submit" className='btn'>Pretrazi</button>
      </form>
      {transaction ? 
        <div>
        <p>Velicina: <em>{transaction.size}</em> bajtova</p>
          <span>Ulazne transakcije:</span>
          {transaction.vin.map((item, index) => (
            <p key={index}>ID: <em>{item.txid}</em></p>
          ))}
          {transactionOuts ? <p>Vrijednost izlaznih transakcija: <em>{transactionOuts}</em></p> : null}
          {transactionFee ? <p>Naknada transakcije: <em>{transactionFee}</em></p> : null}
        </div>
      : null}
      </div>
    </div>
  );
}

export default App;
