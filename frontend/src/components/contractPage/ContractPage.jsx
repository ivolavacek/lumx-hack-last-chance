import './ContractPage.css'
import ModeContext from '../switchButton/ModeContext'
import { Link } from 'react-router-dom'
import { useContext, useState } from 'react';
import { ethers } from "ethers";
import contractABI  from "./ABI.json";
import "./ContractPage.css";
import { v4 as uuidv4 } from 'uuid';

const contractAddress = "0x58FdA51449837Ac04f9543329E1EDFB66326CcBD";

function Contract() {
  const { language } = useContext(ModeContext);

  const text = language === 'en' ? {
    title: 'Contract',
    subtitle: 'Fill in the wallet addresses and percentages to be received',
    addButton: 'Add row',
    removeButton: 'Remove',
    confirmButton: 'Confirm',
    feedback: 'Register',
    wallet: 'Wallet',
    percentage: 'Percentage',
    sending: 'Sending, please wait a moment...',
    sent: 'Sent',
    error: 'Oops, an error occurred!!',
  } : { 
    title: 'Contrato',
    subtitle: 'Preencha o endereço da carteiras e percentuais a receber',
    addButton: 'Adicionar linha',
    removeButton: 'Remover',
    confirmButton: 'Confirmar',
    feedback: 'Register',
    wallet: 'Carteira',
    percentage: 'Porcentagem',
    sending: 'Enviando, aguarde um momento...',
    sent: 'Enviado',
    error: 'Ops, ocorreu algum erro !!',
  }

  // Add an input element to the array
  const addInput = () => {
    setInputs([...inputs, { id: uuidv4(), address: '', percentual: ''}]);
  };

  // Remove an input element from the array
  const removeInput = (id) => {
    setInputs(inputs => inputs.filter((input) => input.id !== id));
  };

  // Render the input elements
  const inputElements = inputs.map((input) => (
    <div key={input.id} className="input-box">
      <input
        type="text"
        placeholder={text.wallet}
        name="address"
        value={input.adress}
        onChange={(event) => handleInputChange(input.id, event)}
      />
      <input
        type="number"
        placeholder={text.percentage}
        name="percentual"
        value={input.percentual}
        onChange={(event) => handleInputChange(input.id, event)}
        step="0.01"
      />
      <button className="remove-button" onClick={() => removeInput(input.id)}>{text.removeButton}</button>
    </div>
  ));

  const handleInputChange = (id, event) => {
    const values = [...inputs];
    const index = values.findIndex((input) => input.id === id);
    values[index][event.target.name] = event.target.value;
    setInputs(values);
  
    // Update the namesArray and numbersArray arrays
    const newNamesArray = [...namesArray];
    const newNumbersArray = [...numbersArray];
    newNamesArray[index] = event.target.name === 'address' ? event.target.value : newNamesArray[index];
    newNumbersArray[index] = event.target.name === 'percentual' ? parseFloat(event.target.value) : newNumbersArray[index];
    setNamesArray(newNamesArray);
    setNumbersArray(newNumbersArray);
  };

  const isFormValid = () => {
    const sum = numbersArray.reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      return false;
    }
    return inputs.every((input) => input.address!== '' && input.percentual!== '');
  };

  const sendMembers = async (evt) => {
    evt.preventDefault();
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
        
        console.log(namesArray);
        console.log(numbersArray);

        setLoading(text.sending);
        console.log("Enviando")

        //Chamando a função no contrato e passando seus argumentos
        const sendTxn = await contract.addMembers(namesArray, numbersArray);

        await sendTxn.wait();
        setLoading(text.sent);
        console.log("Enviado"); 
      }

    } catch (error) {
      console.log(error)
      setLoading(text.error)
    }
  }

  return (
    <div className="container-contract">
      <div className="form">
        <p className="text1-contract">{text.title}</p>
        <p className="text2-contract">{text.subtitle}</p>

        {inputElements}
        <button className="add-button" onClick={addInput}>{text.addButton}</button>

        <button className="confirm-button" onClick={sendMembers} disabled={!isFormValid()}>{text.confirmButton}</button>

        <span className="loading">{loading}</span>
      </div>
    </div>
  )
}

export default Contract;