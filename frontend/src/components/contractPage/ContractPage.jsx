import './ContractPage.css'
import { ethers } from "ethers"
import contractABI  from "./ABI.json"
import { useContext, useState } from 'react'
import ModeContext from '../switchButton/ModeContext'
import Popup from '../popup/Popup'
import { v4 as uuidv4 } from 'uuid'
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import axios from 'axios'

const contractAddress = "0x1ce8F206D7d5c15917C8A2fC3880AF3336439F47";

function Contract() {
  const { language } = useContext(ModeContext);

  const text = language === 'en' ? {
    title: 'Contract',
    subtitle: 'Fill in the wallet addresses and percentages to be received',
    addButton: 'Add row',
    removeButton: 'Remove',
    confirmButton: 'Confirm',
    feedback: 'Register',
    input: 'User/Email',
    percentage: 'Percentage',
    sending: 'Sending, please wait a moment...',
    sent: 'Sent',
    error: 'Oops, an error occurred!!',
    popup1: 'Username',
    popup2: 'Email',
    popup3: 'Percentage',
    popupBack: 'Back',
    popupSend: 'Send contract',
  } : { 
    title: 'Contrato',
    subtitle: 'Preencha o endereço da carteiras e percentuais a receber',
    addButton: 'Adicionar linha',
    removeButton: 'Remover',
    confirmButton: 'Confirmar',
    feedback: 'Register',
    input: 'Usuário/Email',
    percentage: 'Porcentagem',
    sending: 'Enviando, aguarde um momento...',
    sent: 'Enviado',
    error: 'Ops, ocorreu algum erro !!',
    popup1: 'Nome de usuário',
    popup2: 'Email',
    popup3: 'Percentual',
    popupBack: 'Voltar',
    popupSend: 'Enviar contrato',
  }

  const [usersArray, setUsersArray] = useState([]);
  const [percentagesArray, setPercentagesArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [percentages, setPercentages] = useState([]);

  const [loading, setLoading] = useState("");
  const [inputs, setInputs] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupData, setPopupData] = useState([]);

  // Add an input element to the array
  const addInput = () => {
    setInputs([...inputs, { id: uuidv4(), user: '', percentual: '', icon: ''}]);
  };

  // Remove an input element from the array
  const removeInput = (id) => {
    setInputs(inputs => inputs.filter((input) => input.id !== id));
  };

  // Render the input elements
  const inputElements = inputs.map((input) => (
    <div key={input.id} className="input-box">
      <div className="icon">{input.icon}</div>
      <input
        type="text"
        placeholder={text.input}
        name="user"
        value={input.user}
        onChange={(event) => handleInputChange(input.id, event)}
      />
      <input
        type="number"
        placeholder={text.percentage}
        name="percentual"
        value={input.percentual}
        onChange={(event) => handleInputChange(input.id, event)}
        step="1"
      />
      <button className="remove-button" onClick={() => removeInput(input.id)}>{text.removeButton}</button>
    </div>
  ));

  const handleInputChange = async (id, event) => {
    const values = [...inputs];
    const index = values.findIndex((input) => input.id === id);
    values[index][event.target.name] = event.target.value;
    setInputs(values);

    // Update the usersArray and percentagesArray arrays
    const newUsersArray = [...usersArray];
    const newPercentagesArray = [...percentagesArray];
    newUsersArray[index] = event.target.name === 'user' ? event.target.value : newUsersArray[index];
    newPercentagesArray[index] = event.target.name === 'percentual' ? parseFloat(event.target.value) : newPercentagesArray[index];
  
    // Validate user input
    if (event.target.name === 'user') {
      const userExists = await checkUserExists(event.target.value);
      if (event.target.value === '') {
        values[index].icon = ''
      } else if (userExists) {
        values[index].icon = <FontAwesomeIcon icon={faCheck} color="green" />;
      } else {
        values[index].icon = <FontAwesomeIcon icon={faTimes} color="red" />;
      }
    }
    // Update the usersArray and percentagesArray arrays
    setInputs(values);
    setUsersArray(newUsersArray);
    setPercentagesArray(newPercentagesArray);
  };
  
  // Function to check if a user exists in the database
  const checkUserExists = async (user) => {
    try {
      // Send a request to the backend to check if the user exists
      const checkUser = await axios.post('http://localhost:3000/checkuser',
        JSON.stringify({ user }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      )
      console.log(checkUser.data)
      return checkUser.data;

    } catch (err) {
      console.log(err);
    }
  }

  const isFormValid = () => {
    const sum = inputs.reduce((a, b) => a + (parseFloat(b.percentual ?? 0) || 0), 0);
    if (isNaN(sum) || sum !== 100) {
      return false;
    } else if (inputs.some((input) => parseFloat(input.percentual ?? 0) <= 0)) {
      return false;
    }
    return inputs.every((input) => input.user !== '' && input.percentual !== '');
  };

  const showPopup = async (e) => {
    e.preventDefault();
    const users = inputs.map((input) => input.user);

    try {
      const promises = users.map((user) => {
        return axios.post('http://localhost:3000/getinfo', 
          { user }, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        });
      });

      const responses = await Promise.all(promises);
      const data = responses.map((response, index) => {
        const userInfo = response.data;
        const percentage = percentagesArray[index];
        return {
          username: userInfo.username,
          email: userInfo.email,
          percentage: percentage,
          id_lumx: userInfo.id_lumx,
          wallet_address: userInfo.wallet_address
        };
      });

      const addresses = data.map((item) => item.wallet_address);
      const percentages = data.map((item) => item.percentage);

      setPopupData(data);
      setAddresses(addresses);
      setPercentages(percentages);
      setPopupOpen(true);

    } catch (err) {
      console.log(err);
    }
  };

  const sendContract = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        );

        setLoading(text.sending);

        //Chamando a função no contrato e passando seus argumentos
        const sendTxn = await contract.addMembers(addresses, percentages);

        await sendTxn.wait();
        setLoading(text.sent);
      }

    } catch (error) {
      console.log(error)
      setLoading(text.error)
    }
  }

  return (
    <>
      <div className="container-contract">
        <div className="form">
          <p className="text1-contract">{text.title}</p>
          <p className="text2-contract">{text.subtitle}</p>

          {inputElements}
          <button className="add-button" onClick={addInput}>{text.addButton}</button>

          <button className="confirm-button" onClick={showPopup} disabled={!isFormValid()}>{text.confirmButton}</button>

          <span className="loading">{loading}</span>
        </div>
      </div>
      <Popup isOpen={popupOpen} onClose={() => setPopupOpen(false)}>
        <div>
          {popupData.map((item, index) => (
            <div key={index} className="popup-item">
              <p><b>{text.popup1}:</b> {item.username}</p>
              <p><b>{text.popup2}:</b> {item.email}</p>
              <p><b>{text.popup3}: {item.percentage}%</b></p>
              <p><b>ID Lumx:</b> {item.id_lumx}</p>
            </div>
          ))}
          <div className="lastButtons">
            <button className="back-button" onClick={() => setPopupOpen(false)}>{text.popupBack}</button>
            <button className="send-button" onClick={() => {setPopupOpen(false); sendContract();}}>{text.popupSend}</button>
          </div>
        </div>
      </Popup>
    </>
  )
}

export default Contract;