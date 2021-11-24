import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import Web3 from 'web3';
import BigNumber from "bignumber.js";
import { CountUp } from 'countup.js';
import DappToken from '../abis/DappToken.json'
import Donation_Processor from '../abis/Donation_Processor.json'


import Navbar from './Navbar'
import Main from './Main'
import Manage from './Manage'
import View from './View'
import Admin from './Admin'
import './App.css'


//const http_provider_url="HTTP://127.0.0.1:8545";//Ganache-CLI Fork
//const networkId_global = 3;//Ganache-CLI Fork
//const http_provider_url="HTTP://127.0.0.1:7545";//Ganache
//const networkId_global = 5777;//Ganache
const http_provider_url="https://ropsten.infura.io/v3/bd3a71030ffd4e66af578f2b09777c14";//Ropsten
const networkId_global = 3;//Ropsten


const global_gasPrice=10000000000;//10 gwei
const admin_gas=800000;//add charity - 250,000; activate/deactive - 50,000; admin variable changes - 50,000
const claim_rewards_gas=80000;//claiming rewards gas is around 40,000
const withdraw_donation_gas=300000;
const staking_gas=800000;//staking_unstaking gas ranges from 300,000-450,000 (120,00 actual staking and remainder is distributing rewards)
const donation_gas=1000000;//donation gas is around 570,000 (630,000 if including donor rewards)
var current_charity_for_staking;
var already_claimed_charity_rewards=false;
var global_charity_reward_balance=0;
var global_currently_on_home=true;
var global_currently_on_manage_charity=false;
var global_currently_on_view_transactions=false;
var global_donation_info={};
var global_donation_currency_value=0;
var global_donation_available_amount=0;
var global_donation_currency;
var global_donation_currency_address;
var global_donation_decimals;
var is_donate_page=false;
var global_withdraw_amount=0;
var initialize_recursion_id;
var recursive_iteration=1;

class App extends Component {

  async componentWillMount(){

    await this.loadWeb3()
    await this.loadBlockchainData()

  }

  async loadBlockchainData() {

    if(window.web3 || window.ethereum){

        const web3 = window.web3;
       
        let networkId;//const networkId = await web3.eth.net.getId();///
        if(window.ethereum){

            networkId = window.ethereum.networkVersion;
            if(networkId == null){///networkVersion can sometimes be null depending on how fast the page loads on metamask, or due to trust wallet
                var isTrust=window.ethereum.isTrust;
                if(isTrust != null){//trust wallet triggered here
                    networkId = await web3.eth.net.getId();
                }
                else{
                    var that_yo=this;
                    initialize_recursion_id = setInterval(function() {
                    that_yo.loadBlockchainData();
                    }, 1000);
                    return;
                }

            }

        }
        else{
            networkId = await web3.eth.net.getId();
        } 
        clearInterval(initialize_recursion_id);
      

///////////////////////////////////////////////////////////////////////Donation Processor/////////////////////////////////////
        let check_web3_network= await this.return_current_web3_network();

        if(check_web3_network==networkId_global){
            const Donation_ProcessorData = Donation_Processor.networks[networkId];
            const donationProcessor = new web3.eth.Contract(Donation_Processor.abi, Donation_ProcessorData.address);

            this.setState({ donationProcessor });
        }
        else{
            this.create_popup("error","Please connect to the Ropsten network in your Web3 browser");

        }
        
///////////////////////////////////////////////////////////////////////////////////////////////////////

          var that=this;

          setInterval(function() {
          that.fetch_reward_balance();
          }, 10000);


          window.ethereum.on('networkChanged', function(networkId){
            that.meta_mask_network_changed();///when user changed to proper network, page will reload
          });
          window.ethereum.on('accountsChanged', function (accounts) {
            that.meta_mask_logedout();

          })
          this.setState({ loading: false })

          if(check_web3_network==networkId_global && is_donate_page==false){///auto-log in
            //this.connect_wallet_pressed();
          }
    }
    else{////metamask not installed
        const web3= new Web3(new Web3.providers.HttpProvider(http_provider_url));
        const networkId =networkId_global;
        this.setState({ loading: false })
    }
    let all_merchants=await this.fetch_all_merchants();

  }

  async loadWeb3() {

    if(window.ethereum){// may be other crypto wallets besides metamask
      window.web3 = new Web3(window.ethereum);
      this.setState({ metamask_installed: true })
    }
    else if (window.web3) {// may be other crypto wallets besides metamask
      window.web3 = new Web3(window.web3.currentProvider);

      this.setState({ metamask_installed: true })
    }
  }

fetch_all_merchants = async() =>{

    var that=this;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://givecrypto.finance/cron_jobs/fetch_wire_requests.php", true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');//application/json
    xhr.onreadystatechange = function() {//Call a function when the state changes.

        if(xhr.readyState == 4 && xhr.status == 200) {
            var merchants_array=JSON.parse(xhr.responseText);
            that.setState({ charities_list: merchants_array })


        }
        
    }
    xhr.send("type=" + "fetch_all_merchants");




}
animateValue(obj, start, end, duration) {
    if (start === end) return;
    var range = end - start;
    var current = start;
    var increment = end > start? 1 : -1;
    var stepTime = Math.abs(Math.floor(duration / range));
    var timer = setInterval(function() {
        current += increment;
        obj.innerHTML = current;
        if (current == end) {
            clearInterval(timer);
        }
    }, stepTime);
}

formatted_wallet_balance(unformatted_number){//////accepts the number in WEI
  let stringify = this.from_wei(unformatted_number);//function returns a string value to prevent rounding issues
  if(stringify.includes(".")){///check if decimal
    let split_num=stringify.split(".");
    let decimal_value=split_num[1].substring(0, 3);
    let final_output=split_num[0] + "." + decimal_value
    return final_output;
  }
  else{

     return stringify;
  }
}
formatted_balance_dynamic(unformatted_number, decimals){
  let stringify = this.from_wei_dynamic(unformatted_number, decimals);//function returns a string value to prevent rounding issues
  if(stringify.includes(".")){///check if decimal
    let split_num=stringify.split(".");
    let decimal_value=split_num[1].substring(0, 3);
    let final_output=split_num[0] + "." + decimal_value
    return final_output;
  }
  else{

     return stringify;
  }
}
formatted_dollars_no_wei =(num_string) =>{
    var stringify=num_string;

    if(stringify.includes(".")){///check if decimal
      let split_num=stringify.split(".");
      let decimal_value=split_num[1].substring(0, 2);
      let final_output=split_num[0] + "." + decimal_value
      return final_output;
    }
    else{

       return stringify;
    }
}
formatted_dollars(unformatted_number){

  let stringify = this.from_wei_dynamic(unformatted_number,6);//function returns a string value to prevent rounding issues|||| USDC decimals is 6
  if(stringify.includes(".")){///check if decimal
    let split_num=stringify.split(".");
    let decimal_value=split_num[1].substring(0, 2);
    let final_output=split_num[0] + "." + decimal_value
    return final_output;
  }
  else{

     return stringify;
  }

}  
fetch_reward_balance = async() =>{


  if(this.state.account==='0x0'){
    return;
  }
  else{

    var check_network= await this.check_if_correct_network();
    if(check_network == false){
      return;
    }
  }

}

update_wallet_balance (num){


  this.setState({ daiTokenBalance: num.toString() }, () => {
    var check_rounding_errors=new BigNumber(this.state.daiTokenBalance.toString());///check for rounding errors


    let wallet_token_balance=this.formatted_wallet_balance(this.state.daiTokenBalance);
    let demo = new CountUp('display_balance_num', wallet_token_balance, { decimalPlaces: 3,duration: 0.5, separator: ',',
    });
    demo.start();
  })
  

}
update_total_staked_balance(num){
  this.setState({ stakingBalance: num.toString() }, () => {
    let stake_token_balance=this.formatted_wallet_balance(this.state.stakingBalance);
    let demo = new CountUp('display_stake_num', stake_token_balance, { decimalPlaces: 3,duration: 0.5, separator: ',',
    });
    demo.start();
  })



}
update_withdraw_donation_balance(num){

    let formatted_withdraw_amount=this.formatted_dollars(global_withdraw_amount);
    let demo = new CountUp('withdraw_donation_num', formatted_withdraw_amount, { decimalPlaces: 2,duration: 0.5, separator: ',',
    });
    demo.start();

}

update_reward_balance(num){

  this.setState({ uncollected_rewards: num.toString() }, () => {
    let reward_token_balance=this.formatted_wallet_balance(this.state.uncollected_rewards);
    const reward_balance = document.querySelector('#display_reward_num') ;

    let demo = new CountUp('display_reward_num', reward_token_balance, { decimalPlaces: 3,duration: 0.5, separator: ',',
    });
    demo.start();
  })
}
update_charity_reward_balance(num){

   /* var newArray = [];


    for(var i = 0; i < this.state.charities_list.length; i++){ //code to modify state- code is unfinished due to improper clone, current using global variable workaround
      if(this.state.charities_list[i].wallet_address==this.state.account){
          var original=this.state.charities_list[i];
          var replacement={};
          for (var key in original) {
            if (original.hasOwnProperty(key)) {
              replacement[key]=original[key];
            }
          }
          replacement.uncollected_rewards=num;
          newArray.push(replacement);
      }
      else{
          newArray.push(this.state.charities_list[i]);
      }
    }*/

    let charity_reward_token_balance=this.formatted_wallet_balance(num);
    let demo = new CountUp('display_charity_reward_num', charity_reward_token_balance, { decimalPlaces: 3,duration: 0.5, separator: ',',
    });
    demo.start();
    
}
update_individual_charity(stake,id){
  var query_string='[charity_id="'+id+'"]';
  let stake_allocation=this.formatted_wallet_balance(stake);
  let charity_element = document.querySelectorAll(query_string)[0];
  if(stake==0){
    charity_element.innerHTML="0";
  }
  else{
    charity_element.innerHTML=stake_allocation;
  }
  

}
update_supported_charities(charity_array){
    this.setState({ supported_charities: charity_array }, () => {
      for(var i = 0; i < charity_array.length; i++){
        var this_charity=charity_array[i];
        var charity_id=this_charity[1];
        var charity_stake=this_charity[0];
        this.update_individual_charity(charity_stake,charity_id);

      }
    })
}


meta_load_wallet_data = async() =>{
  var fetch_num_donations=await this.state.donationProcessor.methods.donation_count(this.state.account).call();
  let demo = new CountUp('display_balance_num', fetch_num_donations, { decimalPlaces: 0,duration: 0.5, separator: ',',
  });
  demo.start();
}
 meta_mask_approved = (result) =>{
      var formatted_address=window.web3.utils.toChecksumAddress(result[0]);
      this.setState({account:formatted_address})
      this.disable_connect_wallet();
      if(is_donate_page==true){
          document.getElementById('donate_page_overlay').style.display="none";
          this.donation_change_currency();
          this.set_input_num_restriction();
      }
      else{
        this.meta_load_wallet_data();
      }
      this.state.meta_mask_logged_in=true;

 }
 meta_mask_network_changed = async() =>{/// can do something here if network changes - not implemented right now
      
      this.reset_state();
      window.location.reload();

     /* let check_metamask_network = await this.check_if_correct_network();
      if(check_metamask_network==true){//reload page if user switched from incorrect network to correct network, prior to logging in
        this.reset_state();
        window.location.reload();
      }
      */
 }
 meta_mask_logedout = async() =>{
  let check_logged_in = await window.web3.eth.getAccounts();

  if(check_logged_in.length==0){
      this.reset_state();
      window.location.reload();
  }
  else{
    if(check_logged_in[0].toLowerCase()!==this.state.account.toLowerCase()){
      this.reset_state();
      window.location.reload();
    }
    else{
      console.log("Just logged in - no need to refresh page");
    }
    
  }
 }
 reenable_wallet_button = () =>{
    const button = document.querySelector('#connect_wallet_button') ;
    button.disabled = false;
    button.style.backgroundColor = "rgb(31, 199, 212)";
    button.style.color = "white";
    button.innerHTML="Connect Wallet";
 }
 disable_connect_wallet = () =>{
    const button = document.querySelector('#connect_wallet_button') ;
    button.disabled = true;
    button.style.backgroundColor = "rgb(239, 244, 245)";
    button.style.color = "rgb(31, 199, 212)";
    button.innerHTML=this.state.account.substring(0,4)+"..."+this.state.account.substring(this.state.account.length - 4);
 }
  connect_wallet_pressed = async() =>{

    if(this.state.loading){//still loading...do nothing
      return;
    }
    if(this.state.meta_mask_logged_in==true){
        this.create_popup("error","You are already logged in");
        return;
    }


    if(window.web3){
      const web3 = window.web3;
      


      let check_metamask_network = await this.check_if_correct_network();///not connected to proper network
      if(check_metamask_network==false){
        this.create_popup("error","Please connect to the Ropsten network in your Web3 browser");
        return;
      }


      var that=this;
    /*  let check_logged_in = await window.web3.eth.getAccounts();////////////////////different account info from the current account in Metamask is loaded
       console.log("-----------------");
       console.log(check_logged_in);

    */
      const user_connected_account = window.ethereum.enable();///logs in to wallet account, so proper network does not matter at this point
      user_connected_account.then(function(result) { that.meta_mask_approved(result) })



    }
    else{
      this.create_popup("error","Please use a Web3 enabled browser to access this app. MetaMask and Coinbase Wallet are currently supported.");
    }



  }
return_current_web3_network = async() =>{
    let check_metamask_network;
    if(window.ethereum){
        var isTrust=window.ethereum.isTrust;
        if(isTrust != null){//trust wallet triggered here
            check_metamask_network = await window.web3.eth.net.getId();
        }
        else{
            check_metamask_network = await window.ethereum.networkVersion;
        }
    }
    else{
        check_metamask_network = await window.web3.eth.net.getId();

    } 
    return check_metamask_network;
}
check_if_correct_network = async() =>{
    let check_metamask_network;
    if(window.ethereum){
        var isTrust=window.ethereum.isTrust;
        if(isTrust != null){//trust wallet triggered here
            check_metamask_network = await window.web3.eth.net.getId();
        }
        else{
            check_metamask_network = await window.ethereum.networkVersion;
        }
    }
    else{
        check_metamask_network = await window.web3.eth.net.getId();
    } 

    if(check_metamask_network!=networkId_global){
        return false;
    }
    else{
        return true;
    }
}
claim_reward_update_frontend = () =>{
  var updated_wallet_balance=this.doDecimalSafeMath(this.state.daiTokenBalance,"+", this.state.uncollected_rewards);
  this.update_wallet_balance(updated_wallet_balance);
  this.update_reward_balance(0);
}
claim_charity_reward_update_frontend = (uncollected_rewards) =>{
  var updated_wallet_balance=this.doDecimalSafeMath(this.state.daiTokenBalance,"+", uncollected_rewards);
  this.update_wallet_balance(updated_wallet_balance);
  this.update_charity_reward_balance(0);
  already_claimed_charity_rewards=true;
  global_charity_reward_balance=0;


}
stake_update_frontend = (amount, charity_id, add_or_subtract) =>{

  if(add_or_subtract=="sub"){
      var updated_wallet_balance=this.doDecimalSafeMath(this.state.daiTokenBalance,"+", amount);
      this.update_wallet_balance(updated_wallet_balance);
      var updated_stake_balance=this.doDecimalSafeMath(this.state.stakingBalance,"-", amount);
      this.update_total_staked_balance(updated_stake_balance);

      var updated_charity_array=this.state.supported_charities;
      var newArray = [];


      for(var i = 0; i < updated_charity_array.length; i++){///loop through each charity

          var stake_num=updated_charity_array[i][0];
          if(charity_id==updated_charity_array[i][1]){/////matching charity
              

              stake_num=this.doDecimalSafeMath(stake_num,"-", amount);
              if(stake_num>0){//only add to new array if user is still staked in the charity
                var new_stake=stake_num.toString();
                newArray.push([new_stake,charity_id]);
              }
              else{
                  var query_string='[charity_id="'+charity_id+'"]';
                  let charity_element = document.querySelectorAll(query_string)[0];
                  charity_element.innerHTML="0";
              }
          }
          else{////other charities
              newArray.push([stake_num,updated_charity_array[i][1]]);
          }
      }
      //console.log("subtract");
      //console.log(newArray);
      this.update_supported_charities(newArray);
  }
  else{
      var updated_wallet_balance=this.doDecimalSafeMath(this.state.daiTokenBalance,"-", amount);
      this.update_wallet_balance(updated_wallet_balance);
      var updated_stake_balance=this.doDecimalSafeMath(this.state.stakingBalance,"+", amount);
      this.update_total_staked_balance(updated_stake_balance);


      var updated_charity_array=this.state.supported_charities;
      var newArray = [];
      var has_staked_for_this_charity=false;

      for(var i = 0; i < updated_charity_array.length; i++){///loop through each charity
          var stake_num=updated_charity_array[i][0];
          if(charity_id==updated_charity_array[i][1]){/////matching charity
              has_staked_for_this_charity=true;
              stake_num=this.doDecimalSafeMath(stake_num,"+", amount);
            //  console.log(stake_num);
              var new_stake=stake_num.toString();
              newArray.push([new_stake,charity_id]);
          }
          else{////other charities
              newArray.push([stake_num,updated_charity_array[i][1]]);
          }
      }
      if(has_staked_for_this_charity==false){/////staking for this charity for the first time
          newArray.push([amount, charity_id]);
      }
      //console.log("add");
      //console.log(newArray);
      this.update_supported_charities(newArray);
  }
}


doDecimalSafeMath(a, operation, b, precision) {
  let x = new BigNumber(a.toString());//big num takes input as string to avoid rounding errors
  let y = new BigNumber(b.toString());//big num takes input as string to avoid rounding errors

  if(operation==="+"){
    let formatted_amount=x.plus(y);
    let formatted_amount_toString=formatted_amount.toString();//convert to string and then Int - cannot directly convert to number or else will lose precision
    return parseInt(formatted_amount_toString);
  }
  else if(operation==="-"){
    let formatted_amount=x.minus(y);
    let formatted_amount_toString=formatted_amount.toString();
    return parseInt(formatted_amount_toString);
  }
  else if(operation==="*"){
    let formatted_amount=x.times(y);
    let formatted_amount_toString=formatted_amount.toString();
    return parseInt(formatted_amount_toString);
  }
  else{
    let formatted_amount=x.div(y);
    let formatted_amount_toString=formatted_amount.toString();
    return formatted_amount_toString;// return string value to prevent rounding issues
  }
  /*  function decimalLength(numStr) {
        var pieces = numStr.toString().split(".");
        if(!pieces[1]) return 0;
        return pieces[1].length;
    }

    // Figure out what we need to multiply by to make everything a whole number
    precision = precision || Math.pow(10, Math.max(decimalLength(a), decimalLength(b)));

    a = a*precision;
    b = b*precision;

    // Figure out which operation to perform.
    var operator;
    switch(operation.toLowerCase()) {
        case '-':
            operator = function(a,b) { return a - b; }
        break;
        case '+':
            operator = function(a,b) { return a + b; }
        break;
        case '*':
        case 'x':
            precision = precision*precision;
            operator = function(a,b) { return a * b; }
        break;
        case '÷':
        case '/':
            precision = 1;
            operator = function(a,b) { return a / b; }
        break;

        // Let us pass in a function to perform other operations.
        default:
            operator = operation;
    }

    var result = operator(a,b);

    // Remove our multiplier to put the decimal back.
    return result/precision;*/
}













sub_stake_pressed = async (charity_id, charity_name) =>{



    if(this.state.meta_mask_logged_in==false){
        this.create_popup("error","Please connect your wallet first"); 
        return;

    }
    if(this.state.stakingBalance==0 || this.state.supported_charities.length==0){
        this.create_popup("error","You don't have any tokens staked");
        return;
    }

    var found_this_charity=false;
    for(var i = 0; i < this.state.supported_charities.length; i++){
        if(this.state.supported_charities[i][1]==charity_id){
          found_this_charity=true;
        }
    }
    if(found_this_charity==false){//check if user has staked in this specific charity, even though their stakingBalance may be >0
      this.create_popup("error","You have not staked for this charity"); 
      return;
    }
    this.create_popup("input","unstake",charity_name,charity_id);

}
confirm_withdraw_donation = async () =>{

    const input_amount = document.querySelector('#withdraw_amount') ;
    var withdraw_amount=input_amount.value;

    if(withdraw_amount==""){
      return;
    }
    if(withdraw_amount<=0){
      return;
    }
    if(isNaN(parseFloat(withdraw_amount))==true){
      return;
    }
    if(parseFloat(withdraw_amount)<=25){
      //alert("Withdraw amount has to be greater than $25");
     // return;
    }
    if(parseFloat(this.formatted_dollars(global_withdraw_amount))<parseFloat(withdraw_amount)){
      alert("You don't have that much to withdraw!");
      return;
    }
////////////////////////////////////////////pass number pre-check verifications
    var output_decimals= await this.state.donationProcessor.methods.final_currency_decimal().call();
    var save_amount_for_subtraction_later=this.tokens_dynamic(withdraw_amount,output_decimals);
    var amount=this.tokens_dynamic(withdraw_amount,output_decimals);
    amount=amount.toLocaleString('fullwide', {useGrouping:false});

    var check_network= await this.check_if_correct_network();
    if(check_network == false){
      alert("Please connect to the proper blockchain network");
      return;
    }

    document.querySelector('#withdraw_input_button').disabled=true;
    this.show_loader();

    var that=this;
    var withdraw_address="0x71a4f0ef4a78bb07d70982de908a51e0c4c808a1"; //Circle Ropsten Deposit Address




    this.state.donationProcessor.methods.withdraw_donation(this.state.account, withdraw_address, amount).send({ from: this.state.account, gas: withdraw_donation_gas})
    .once('receipt', function(receipt){
        global_withdraw_amount=that.doDecimalSafeMath(global_withdraw_amount,"-", save_amount_for_subtraction_later);;//precision error here with subtraction
        that.update_withdraw_donation_balance();
        that.close_dialog();
    })
    .catch(function(e){that.hide_loader(); if(e.code!==4001){alert("Transaction Error - Check your Web3 browser/crypto wallet and then try again");}}) 
/*
    .on('receipt', (hash) => {
        //global_withdraw_amount=that.doDecimalSafeMath(global_withdraw_amount,"-", save_amount_for_subtraction_later);;//precision error here with subtraction
        //that.update_withdraw_donation_balance();
        //that.close_dialog();

    })
    */

}
add_stake_pressed = async (charity_id, charity_name) =>{



    if(this.state.meta_mask_logged_in==false){
        this.create_popup("error","Please connect your wallet"); 
        return;

    }

    this.create_popup("input","stake",charity_name, charity_id);
  }

set_charity_claim_global_variable =(uncollected_rewards) =>{
  if(already_claimed_charity_rewards===true){
    global_charity_reward_balance=0;
  }
  else{
    global_charity_reward_balance=uncollected_rewards;
  }
  
}
charity_claim_pressed = async () =>{

    const input_amount = document.querySelector('#input_amount') ;
    input_amount.style.display="none";
    this.create_popup("input","claim_charity",global_charity_reward_balance);

}

claim_pressed = async (charity_id, charity_name) =>{

    if(this.state.meta_mask_logged_in==false){
        this.create_popup("error","Please connect your wallet"); 
        return;

    }
    const input_amount = document.querySelector('#input_amount') ;
    input_amount.style.display="none";
    this.create_popup("input","claim",charity_name);

    return;
}

edit_charity_info_pressed = () =>{
   window.open("https://docs.google.com/forms/d/e/1FAIpQLSd3jV9uBk9WjT9TqnIBW8U5mW6etRk9gmxXjqH8eGeryuHekw/viewform?usp=sf_link", '_blank').focus();
}
list_your_organization_pressed = () =>{
  window.open("https://docs.google.com/forms/d/e/1FAIpQLSfVVCzxiWK9cSEuWuZbFqJb5N1Tu3zFeN8MTOcVMD5psK0zJw/viewform?usp=sf_link", '_blank').focus();
}
details_pressed = (charity_id) =>{

    var query_string='[charity_detail_id="'+charity_id+'"]';
    let charity_detail_element = document.querySelectorAll(query_string)[0];
    let btn_query_string='[charity_detail_btn="'+charity_id+'"]';
    let charity_detail_btn = document.querySelectorAll(btn_query_string)[0];
    if(charity_detail_element.style.display==="block"){
        charity_detail_element.style.display="none";
        charity_detail_btn.innerHTML='Details<svg viewBox="0 0 24 24" color="primary" width="20px" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa jqrBqL"><path d="M8.11997 9.29006L12 13.1701L15.88 9.29006C16.27 8.90006 16.9 8.90006 17.29 9.29006C17.68 9.68006 17.68 10.3101 17.29 10.7001L12.7 15.2901C12.31 15.6801 11.68 15.6801 11.29 15.2901L6.69997 10.7001C6.30997 10.3101 6.30997 9.68006 6.69997 9.29006C7.08997 8.91006 7.72997 8.90006 8.11997 9.29006Z"></path></svg>';
                          
    }
    else{
      charity_detail_element.style.display="block"; 
      charity_detail_btn.innerHTML=
'Hide<svg viewBox="0 0 24 24" color="primary" width="20px" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa jqrBqL"><path d="M8.11997 14.7101L12 10.8301L15.88 14.7101C16.27 15.1001 16.9 15.1001 17.29 14.7101C17.68 14.3201 17.68 13.6901 17.29 13.3001L12.7 8.7101C12.31 8.3201 11.68 8.3201 11.29 8.7101L6.69997 13.3001C6.30997 13.6901 6.30997 14.3201 6.69997 14.7101C7.08997 15.0901 7.72997 15.1001 8.11997 14.7101Z"></path></svg>';  
    }
                          


}
admin_page_pressed = async () =>{

  if(this.state.meta_mask_logged_in==false){
      this.create_popup("error","Please connect your wallet"); 
      return;
  }

  let is_admin = await this.state.donationProcessor.methods.check_if_admin(this.state.account).call();
  if(is_admin==false){
      this.create_popup("error","You do not have access to the admin page"); 
      return;
  }

  this.setState({ loading: true });
  global_currently_on_home=false;
  global_currently_on_manage_charity=false;
  global_currently_on_view_transactions=false;

  let header_heading=document.getElementById('header_heading').innerHTML="Admin Page";
  let header_subtext=document.getElementById('header_subtext').innerHTML="";
  let header_subtext2=document.getElementById('header_subtext2').innerHTML="";
  let token_holder_rewards_container=document.getElementById('token_holder_rewards_container').style.display="none";
  var get_owner= await this.state.donationProcessor.methods.owner().call();//owner of all 3 contracts should be the same
  var _is_owner=false;
  if(get_owner==this.state.account){
    _is_owner=true;
  }

  var that=this;
  let admin= <Admin 
                parent = {that}
                charities_list = {that.state.charities_list}
                is_owner={_is_owner}
              />

  ReactDOM.render(admin,document.getElementById('charity_data_container'));

  this.setState({ loading: false });


  let current_transfer_tax= "N/A"; //await this.state.daiToken.methods._taxFee().call();
  let current_lp_tax= "N/A"; // await this.state.daiToken.methods._liquidityFee().call();
  let max_txn_amt= "N/A"; // await this.state.daiToken.methods._maxTxAmount().call();
  let max_txn_percent= "N/A"; //Math.round(max_txn_amt*10000/(100000000*10**18));

  let donation_txn_fee= await this.state.donationProcessor.methods.donation_transaction_fee().call();
  let final_currency= await this.state.donationProcessor.methods.final_currency().call();
  let router_address= await this.state.donationProcessor.methods.uniswapV2Router().call();



  document.getElementById('curr_transfer_tax').innerHTML=current_transfer_tax+"%";
  document.getElementById('curr_lp_tax').innerHTML=current_lp_tax+"%";
  document.getElementById('curr_max_txn').innerHTML=max_txn_percent+" Basis Points";
  document.getElementById('curr_donation_fee').innerHTML=donation_txn_fee+" Basis Points";
  document.getElementById('curr_final_currency').innerHTML=final_currency;
  document.getElementById('curr_final_currency').style.fontSize="12px";
  document.getElementById('curr_router_address').innerHTML=router_address;
  document.getElementById('curr_router_address').style.fontSize="12px";

  /*
  document.getElementById('curr_staking_reward_distribution_increment').innerHTML=reward_distribution_increment +" GIFT";
  document.getElementById('curr_minimum_distribution_threshold').innerHTML=min_reward_to_distribute +" GIFT";
  document.getElementById('curr_reward_interval_current').innerHTML=reward_interval +" Seconds";
  */


}
add_charity_pressed = async () =>{
  let org_name=document.getElementById('org_name').value.trim();
  //let org_ein=document.getElementById('org_ein').value.trim();
  //org_ein=org_ein.replace(/\D/g,'');
  let org_industry=document.getElementById('org_industry').value.trim();
  let org_details=document.getElementById('org_details').value.trim();
  let org_website=document.getElementById('org_website').value.trim();
  //let org_wallet=document.getElementById('org_wallet').value.trim();
  let org_wallet=this.state.account;
  let org_email=document.getElementById('org_email').value.trim();
  let org_tax_status_button=document.querySelector('input[name="org_tax_status"]:checked');

  if(!org_tax_status_button || org_name=="" || org_industry=="" || org_details=="" || org_website=="" || org_email==""){//org_wallet
    this.create_popup("error", "All fields are required" );
    return;
  }
  let tax_status_bool=false;
  if(org_tax_status_button.value=="yes"){
    tax_status_bool=true;
  }

  if(!window.web3.utils.isAddress(org_wallet)){
    this.create_popup("error", "Invalid wallet address");
    return;
  }
  if((!org_website.includes("http://www")) && (!org_website.includes("https://www"))){
    this.create_popup("error", "Include 'http://www' or 'https://www' in the website URL");
    return;
  }
  
  let new_org={
        name:org_name,
        ein:'0',
        description:org_industry,
        details:org_details,
        url:org_website,
        wallet_address:org_wallet,
        email:org_email,
        us_tax_deduction:tax_status_bool
  }

  document.getElementById('add_charity_button').disabled=true;  
  var that=this;



    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://givecrypto.finance/cron_jobs/fetch_wire_requests.php", true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');//application/json

    xhr.onreadystatechange = function() {//Call a function when the state changes.

        if(xhr.readyState == 4 && xhr.status == 200) {

          if(xhr.responseText=="added_merchant"){

              document.getElementById('add_charity_container').innerHTML="";
              document.getElementById('add_charity_container').innerHTML="<p style='font-size: 24px; color:rgb(31, 199, 212); margin-top:50%; text-align:center;'>Organization was successfully added. Please refresh the page</p><div style='text-align:center;'><img style='height:75px;' src='green_check.png'></img></div>";
              /*that.create_popup("notice", "Complete", "Organization was successfully added. Refresh the page to see the change");
              document.getElementById('org_name').value="";
              document.getElementById('org_ein').value="";
              document.getElementById('org_industry').value="";
              document.getElementById('org_details').value="";
              document.getElementById('org_website').value="";
              document.getElementById('org_wallet').value="";
              document.querySelector('input[id="org_tax_status_yes"]').checked=false;
              document.querySelector('input[id="org_tax_status_no"]').checked=false;
              document.getElementById('add_charity_button').disabled=false;
              */
          }
          else{
            document.getElementById('add_charity_button').disabled=false;
            alert("Something went wrong, please try again");
          }

        }
        
    }
    xhr.send("type=" + "add_merchant" + "&value=" + JSON.stringify(new_org));
}

click_logo = async () =>{
  this.reset_state();
  window.location.reload();
}
home_pressed = async () =>{

  if(global_currently_on_home===true){
      return;
  }
  this.reset_state();
  window.location.reload();// just reload the page for now
 /*
  if(this.state.meta_mask_logged_in==false){
      this.create_popup("error","Please connect your wallet"); 
      return;
  }
  global_currently_on_manage_charity=false;
  global_currently_on_view_transactions=false;
  global_currently_on_home=true;*/
}
manage_charity_pressed = async () =>{


  if(this.state.meta_mask_logged_in==false){
      this.create_popup("error","Please connect your wallet"); 
      return;
  }
  if(global_currently_on_manage_charity===true){
      return;
  }
  global_currently_on_view_transactions=false;
  global_currently_on_home=false;

  let header_heading=document.getElementById('header_heading').innerHTML="Dashboard";
  let header_subtext=document.getElementById('header_subtext').innerHTML="Manage your campaign and view payments";
  let header_subtext2=document.getElementById('header_subtext2').innerHTML="";
  let token_holder_rewards_container=document.getElementById('token_holder_rewards_container').style.display="none";

  this.setState({ loading: true });


  let current_address=this.state.account;
  //let fetch_donation_records= await this.state.donationProcessor.methods.get_donation_transactions(current_address,"0").call();
  if(this.state.charities_list.length==0){
      this.no_business_created();
      return;
  }
  else{

      for(var i = 0; i < this.state.charities_list.length; i++){

        if(this.state.charities_list[i].wallet_address==current_address){
            var that=this;

            let fetch_donation_events= await this.state.donationProcessor.getPastEvents(
              "Transaction", 
              {filter: {receiver: this.state.account}, fromBlock: 0, toBlock: "latest"}, 
              async (err, events)=>{

                var fetch_donation_records=[];
                if(!err){
                  for(var j = 0; j < events.length; j++){
                      var this_transaction=events[j]["returnValues"];
                      fetch_donation_records.push(this_transaction);
                  }
                }
                else{
                    this.create_popup("error",err); 
                }

                let manage= <Manage 
                      this_charity={that.state.charities_list[i]}
                      parent = {that}
                      donation_records={fetch_donation_records}
                      donate_button_url={"https://www.givecrypto.finance/bsc/?donate_char_id="+that.state.charities_list[i].id}
                  />

                ReactDOM.render(manage,document.getElementById('charity_data_container'));
                let charity_vote_allocation=this.state.charities_list[i].vote_allocation;
                let stake_token_balance=this.formatted_wallet_balance(charity_vote_allocation);
                let demo = new CountUp('stake_allocation_manage_charity', stake_token_balance, { decimalPlaces: 3,duration: 0.5, separator: ',',
                });
                demo.start();

                let charity_uncollected_rewards;
                if(already_claimed_charity_rewards==true){///claiming rewards does not update array list in state
                    charity_uncollected_rewards=0;//need to add this check, in case user switches tabs
                }
                else{
                    charity_uncollected_rewards=this.state.charities_list[i].uncollected_rewards;
                }
                
                let charity_reward_balance=this.formatted_wallet_balance(charity_uncollected_rewards);
                let demo1 = new CountUp('display_charity_reward_num', charity_reward_balance, { decimalPlaces: 3,duration: 0.5, separator: ',',
                });
                demo1.start();


                let get_available_withdraw_amount= await this.state.donationProcessor.methods.get_available_withdraw_amount(current_address).call();
                global_withdraw_amount=get_available_withdraw_amount;
                let formatted_withdraw_amount=this.formatted_dollars(get_available_withdraw_amount);

                this.update_withdraw_donation_balance();
                
                global_currently_on_manage_charity=true;
                this.setState({ loading: false });
                
              })
              return;
        }
        else if(i==this.state.charities_list.length-1){//Will only reach here if user does not yet own an organization
            this.no_business_created();
            return;
        }
      }
  }

}
no_business_created=() =>{
    var sample_charity={
    id:"9999",
    name:"Your Campaign",
    description: "",
    details: "To get listed, fill out some brief information regarding your campaign. Start accepting donations right away.",
    url: "N/A",
    ein: "N/A",
    wallet_address: "",
    deposit_address: "",
    uncollected_rewards: "0",
    vote_allocation: "0",
    us_tax_deduction: true,
    is_deleted: false,
    genesis: "0"
  }
  var sample_donations=[];
  var sample=true;

  var that=this;
  let manage= <Manage 
        this_charity={sample_charity}
        parent = {that}
        donation_records={sample_donations}
        sample={sample}
    />

  ReactDOM.render(manage,document.getElementById('charity_data_container'));
  global_currently_on_manage_charity=true;
  this.setState({ loading: false });
}
view_transactions_pressed = async () =>{
  if(this.state.meta_mask_logged_in==false){
      this.create_popup("error","Please connect your wallet"); 
      return;
  }
  if(global_currently_on_view_transactions===true){
      return;
  }
  global_currently_on_manage_charity=false;
  global_currently_on_home=false;

  let header_heading=document.getElementById('header_heading').innerHTML="Transaction History";
  let header_subtext=document.getElementById('header_subtext').innerHTML="";
  let header_subtext2=document.getElementById('header_subtext2').innerHTML="";
  let token_holder_rewards_container=document.getElementById('token_holder_rewards_container').style.display="none";
  
  this.setState({ loading: true });
  //let fetch_individual_transaction_records= await this.state.donationProcessor.methods.get_donation_transactions(this.state.account, "1").call();

  
  let fetch_transaction_events= await this.state.donationProcessor.getPastEvents(
    "Transaction", 
    {filter: {donor_address: this.state.account}, fromBlock: 0, toBlock: "latest"}, 
    (err, events)=>{
      var fetch_individual_transaction_records=[];
      if(!err){
        for(var i = 0; i < events.length; i++){
            var this_transaction=events[i]["returnValues"];
            fetch_individual_transaction_records.push(this_transaction);
        }
      }
      else{
          this.create_popup("error",err); 
      }

      var that=this;
      let view= <View 
          parent = {that}
          transaction_history={fetch_individual_transaction_records}
      />
      ReactDOM.render(view,document.getElementById('charity_data_container'));
      global_currently_on_view_transactions=true;
      this.setState({ loading: false });

    })

}
donate_pressed = (charity_id, charity_name, charity_ein, logo, charity_wallet) =>{

    if(this.state.meta_mask_logged_in==false){
        this.create_popup("error","Please connect your wallet first"); 
        return;

    }

    var currency_selector=document.getElementById("donation_currency_selector");
    currency_selector.value="ETH";//switch to default donate option of ETH

    global_donation_info["charity_name"]=charity_name;
    global_donation_info["charity_ein"]=charity_ein;
    global_donation_info["charity_id"]=charity_id;
    global_donation_info["logo"]=logo;
    global_donation_info["charity_wallet"]=charity_wallet;

    window.web3.eth.getBalance(this.state.account, (err, balance) => {
      this.create_popup("input","donate",charity_name, charity_id);
      global_donation_available_amount=balance;
      global_donation_currency="ETH";
      global_donation_currency_address="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
      global_donation_decimals=18;
      this.donation_change_currency();
      
    });

}
set_donation_currency_and_availability(){
    if(global_donation_currency=="ETH"){
        document.getElementById("donation_currency").innerHTML="ETH";//BNB
    }
    else{
        document.getElementById("donation_currency").innerHTML=global_donation_currency;
    }
    let demo1 = new CountUp('available_donation_amount_num', this.formatted_balance_dynamic(global_donation_available_amount, global_donation_decimals), { decimalPlaces: 3,duration: 0.5, separator: ',',
    });
    demo1.start();
}
rewards_help = () =>{
    this.create_popup("rewards",""); 
}
charity_rewards_help_pressed = () =>{
    this.create_popup("charity_rewards",""); 
}
widget_button_help_pressed = (widget_button_html) =>{
    this.create_popup("widget_help",widget_button_html); 
}
withdraw_help_pressed = () =>{
    this.create_popup("notice","Bank Withdrawal","Your funds will be wired directly to your bank account. A wire fee of $25 will be deducted from your withdrawal amount"); 
}
withdraw_to_bank_pressed = () =>{
    //this.create_popup("notice","Coming Soon","This button will enable you to:<br><br>1. Send your USDC to our API integration with Circle (circle.com), our fiat off-ramp provider<br>2. Automatically receive a USD wire for an equivalent amount delivered to your bank account"); 

    this.create_popup("input","withdraw_donation",global_withdraw_amount);

}
anonymous_checked = () =>{
  var is_checked=document.getElementById("anonymous_donation_input").checked;

  var first_name_input=document.getElementById("donation_first_name");
  var last_name_input=document.getElementById("donation_last_name");

  if(is_checked===true){
    first_name_input.disabled=true;
    last_name_input.disabled=true;
    first_name_input.value="Anonymous";
    last_name_input.value="Anonymous";
    first_name_input.style.opacity="0.5";
    last_name_input.style.opacity="0.5";
  }
  else{
    first_name_input.disabled=false;
    last_name_input.disabled=false;
    first_name_input.value="";
    last_name_input.value="";
    first_name_input.style.opacity="1";
    last_name_input.style.opacity="1";
  }
}
successful_donation_animation = () =>{
  document.querySelector('#donate_confirm_button').style.display="none";
  var donation_identity_notice=document.querySelector('#donation_identity_notice');
  donation_identity_notice.style.color="rgb(31, 199, 212)";
  donation_identity_notice.style.fontSize="20px";
  this.hide_loader();
  donation_identity_notice.innerHTML="Donation Success!";
}
confirm_donation_pressed = async() =>{
 

   

    var check_network= await this.check_if_correct_network();
    if(check_network == false){
      alert("Please connect to the proper blockchain network");
      return;
    }



    document.querySelector('#donate_confirm_button').disabled=true;
    var back_btn=document.getElementById("donate_page_back_button");
    if(back_btn){back_btn.style.display="none";}
    this.show_loader();
    var that=this;

    var first_name=global_donation_info["first_name"];
    var last_name=global_donation_info["last_name"];
    var amount=global_donation_info["amount"];

    amount=this.tokens_dynamic(amount, global_donation_decimals);///account for rounding errors
    amount=amount.toLocaleString('fullwide', {useGrouping:false});




    var currency=global_donation_currency;
    var currency_address=global_donation_currency_address;
    var decimals=global_donation_decimals;

    var charity_name=global_donation_info["charity_name"];
    var charity_ein=global_donation_info["charity_ein"];
    var charity_wallet=global_donation_info["charity_wallet"].toString();

    if(currency==="ETH"){

        this.state.donationProcessor.methods.process_donation(amount,currency,charity_name,charity_ein,charity_wallet,currency_address,decimals).send({ from: this.state.account, gas: donation_gas, value: amount})
        .on('receipt', (hash) => {
            this.successful_donation_animation();
            this.meta_load_wallet_data();

        }).catch(function(e){that.hide_loader(); document.querySelector('#donate_confirm_button').disabled=false; if(back_btn){back_btn.style.display="block";} if(e.code!==4001){console.log(e); alert("Transaction Error - Check your Web3 browser/crypto wallet and then try again");}}) 
   

    }
    else{
      const this_coin = new window.web3.eth.Contract(DappToken.abi, global_donation_currency_address);//load standard ERC-20 ABI to access functions
      let donation_token_allowance=await this_coin.methods.allowance(this.state.account,this.state.donationProcessor._address).call();


      if(parseInt(donation_token_allowance)<parseInt(amount)){///need to approve first
        var ammout_to_approve = "100000000000000000000000000";
        this_coin.methods.approve(this.state.donationProcessor._address, ammout_to_approve).send({ from: this.state.account }).on('transactionHash', (hash) => {//transactionHash
            this.state.donationProcessor.methods.process_donation(amount,currency,charity_name,charity_ein,charity_wallet,currency_address,decimals).send({ from: this.state.account, gas: donation_gas}).on('receipt', (hash) => {
            this.successful_donation_animation();
            this.meta_load_wallet_data();

            }).catch(function(e){that.hide_loader(); document.querySelector('#donate_confirm_button').disabled=false; if(back_btn){back_btn.style.display="block";}  if(e.code!==4001){console.log(e); alert("Transaction Error - Check your Web3 browser/crypto wallet and then try again");}}) 
        }).catch(function(e){that.hide_loader(); document.querySelector('#donate_confirm_button').disabled=false; if(back_btn){back_btn.style.display="block";} if(e.code!==4001){alert("Transaction Error - Check your Web3 browser/crypto wallet and then try again");}}) 
      }
      else{

          this.state.donationProcessor.methods.process_donation(amount,currency,charity_name,charity_ein,charity_wallet,currency_address,decimals).send({ from: this.state.account, gas: donation_gas})
          .on('receipt', (hash) => {
              this.successful_donation_animation();
              this.meta_load_wallet_data();

          }).catch(function(e){that.hide_loader(); document.querySelector('#donate_confirm_button').disabled=false; if(back_btn){back_btn.style.display="block";} if(e.code!==4001){console.log(e); alert("Transaction Error - Check your Web3 browser/crypto wallet and then try again");}}) 


      }
    }
}
donate_page_back_pressed = () =>{
  document.getElementById("confirm_donation_container").style.display="none";
  var initialize_donation_container=document.getElementById("initialize_donation_container");
  initialize_donation_container.style.display="flex";
  document.getElementById("donate_page_back_button").style.display="none";

}

donate_continue_pressed = async() =>{

  var first_name_input="Anonymous";///set all payments to anonymous
  var last_name_input="";///set all payments to anonymous
  global_donation_info["anonymous"]=true;///set all payments to anonymous

  let input_amount;
  if(is_donate_page){
    input_amount= document.querySelector('#input_donate_amount_donate_page') ;
  }
  else{
    input_amount= document.querySelector('#input_donate_amount') ;
  }
   
  var donate_amount=input_amount.value;
  if(donate_amount==""){
    return;
  }
  if(donate_amount<=0){
    return;
  }
  if(isNaN(parseFloat(donate_amount))==true){
    return;
  }

  var amount=this.tokens_dynamic(donate_amount, global_donation_decimals);///account for rounding errors

  var check_wallet_balance= global_donation_available_amount;

  var current_charity_for_staking=global_donation_info["charity_id"];
  if(amount>check_wallet_balance){
    alert("You don't have enough in your wallet!");
    return;
  }

  /*if(!current_charity_for_staking || isNaN(parseFloat(current_charity_for_staking))==true){
    alert("Something went wrong. Please try again");
    return;
  }*/
/////////////////////////////////////////////////////////////////////////////Pass Verification
  document.getElementById("confirm_donation_container").style.display="block";
  var initialize_donation_container=document.getElementById("initialize_donation_container");
  initialize_donation_container.style.display="none";
  if(is_donate_page==true){
    document.getElementById("donate_page_back_button").style.display="block";
    
  }

  global_donation_info["first_name"]=this.capitalizeFirstLetter(first_name_input);
  global_donation_info["last_name"]=this.capitalizeFirstLetter(last_name_input);
  global_donation_info["amount"]=donate_amount;

  document.querySelector('#receiving_organization_confirm').innerHTML=global_donation_info["charity_name"]; 

  document.querySelector('#donor_confirm').innerHTML=this.state.account.substring(0,6)+"..."+this.state.account.substring(this.state.account.length - 4);
  //document.querySelector('#donor_confirm').innerHTML=global_donation_info["first_name"] + " " + global_donation_info["last_name"];

  var dollar_value=" (~$" + this.formatted_dollars_no_wei((global_donation_currency_value*global_donation_info["amount"]).toString()) + ")";

  if(global_donation_currency=="ETH"){
      document.querySelector('#amount_confirm').innerHTML=global_donation_info["amount"] + " " + "ETH" + dollar_value;//BNB
  }
  else{
      document.querySelector('#amount_confirm').innerHTML=global_donation_info["amount"] + " " + global_donation_currency + dollar_value;
  }


  var donation_identity_notice=document.querySelector('#donation_identity_notice');
  donation_identity_notice.style.color="";
  donation_identity_notice.style.fontSize="";

  
  if(is_donate_page==true){
    donation_identity_notice.innerHTML="*You can view your transaction receipts at any time at <a class='donate_page_home_link' href='/bsc/' target='_blank'>givecrypto.finance</a> under 'Your Transactions'";
  }
  else{
    donation_identity_notice.innerHTML="*You can view your transaction receipts at any time under the 'Your Transactions' tab";
  }
  /*if(global_donation_info["anonymous"]==true){
      donation_identity_notice.innerHTML="*You have chosen to remain anonymous. <span style='color:red;'>You will not get a personalized receipt for tax and accounting purposes</span>";
  }
  else{
      donation_identity_notice.innerHTML="*You will receive a personalized receipt for tax and accounting purposes";
  }*/




}
click_individual_transaction = async(this_transaction) =>{



  var donor_info="<span>Payer Wallet Address: </span>"+ "<span class='receipt_info'>"+this_transaction.donor_address+"</span><br><br>";
  var recipient_info="<span>Recipient: </span>"+ "<span class='receipt_info'>"+this_transaction.org_name+"</span><br><br>";
  //var recipient_ein="<span>Recipient EIN: </span>"+ "<span class='receipt_info'>"+this_transaction.org_ein+"</span><br><br>";
  var sanitized_currency=this_transaction.currency;
  var input_decimals=this_transaction.input_decimals;
  var output_decimals=this_transaction.output_decimals;
  if(sanitized_currency=="ETH"){
    sanitized_currency="ETH";//BNB
  }


  var donation_amount="<span>Payment: </span>"+ "<span class='receipt_info'>"+this.from_wei_dynamic(this_transaction.amount,input_decimals)+" "+sanitized_currency+"</span><br><br>";
  var converted_amount="<span>Payment USD Value: </span>"+ "<span class='receipt_info'>$"+parseFloat(this.from_wei_dynamic(this_transaction.converted_amount,output_decimals)).toFixed(2)+"</span><br><br>";

  var options = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'}; 
  let sanitized_date = new Date(this_transaction.date*1000);
  sanitized_date=sanitized_date.toLocaleDateString("en-US", options);
  var time="<span>Time: </span>"+ "<span class='receipt_info'>"+sanitized_date+"</span><br><br><br><br>";
  var donation_confirmation_text="Thank you for your payment! Please keep this receipt for recordkeeping/tax purposes.<br><br>"
  var logo="<div style='text-align:center;'><img draggable='false' src='ourplanet_logo.png' style='width:60px;'></img><div>";

  this.create_popup("transaction_receipt", "Transaction Receipt",donor_info + recipient_info + donation_amount + converted_amount + time + donation_confirmation_text + logo );
}
click_donation_transaction = (this_transaction) =>{
  var donor_info="<span>Payer Wallet Address: </span>"+ "<span class='receipt_info'>"+this_transaction.donor_address+"</span><br><br>";
  var recipient_info="<span>Recipient: </span>"+ "<span class='receipt_info'>"+this_transaction.org_name+"</span><br><br>";
  var sanitized_currency=this_transaction.currency;
  var input_decimals=this_transaction.input_decimals;
  var output_decimals=this_transaction.output_decimals;
  if(sanitized_currency=="ETH"){
    sanitized_currency="ETH";//BNB
  }



  var donation_amount="<span>Payment: </span>"+ "<span class='receipt_info'>"+this.from_wei_dynamic(this_transaction.amount,input_decimals)+" "+sanitized_currency+"</span><br><br>";
  var received_amount="<span>Payment USD Value: </span>"+ "<span class='receipt_info'>$"+parseFloat(this.from_wei_dynamic(this_transaction.received_amount,output_decimals)).toFixed(2)+"*</span><br><br>";
  var options = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'}; 
  let sanitized_date = new Date(this_transaction.date*1000);
  sanitized_date=sanitized_date.toLocaleDateString("en-US", options);
  var time="<span>Time: </span>"+ "<span class='receipt_info'>"+sanitized_date+"</span><br><br><br><br>";
  var donation_confirmation_text="*Payments are automatically converted into stablecoins (USD equivalents), which can easily be exchanged 1:1 for dollars using our 'Withdraw' feature<br><br>"
  var logo="<div style='text-align:center;'><img draggable='false' src='ourplanet_logo.png' style='width:60px;'></img><div>";

  this.create_popup("transaction_receipt", "Transaction Receipt",donor_info + recipient_info + donation_amount + received_amount + time + donation_confirmation_text + logo );
}
create_popup = (type, message, secondary_message , tierary_message) =>{

  const overlay = document.querySelector('#presentation_overlay2') ;
  overlay.style.display = "block";


  if(type=="input"){
      document.querySelector('#stake_input_button').disabled=false;
      document.querySelector('#unstake_input_button').disabled=false;
      document.querySelector('#claim_input_button').disabled=false;
      document.querySelector('#claim_charity_input_button').disabled=false;
      document.querySelector('#withdraw_input_button').disabled=false;
      document.querySelector('#donate_input_button').disabled=false;
      document.querySelector('#donate_confirm_button').disabled=false;
      this.set_input_num_restriction();

    if(message=="donate"){
        var popup_input_presentation = document.querySelector('#popup_donate_presentation');
        popup_input_presentation.style.display = "block";
        const popup_title = document.querySelector('#popup_donate_input_title');
        popup_title.innerHTML=secondary_message;
        const donate_charity_logo = document.querySelector('#donate_charity_logo');
        donate_charity_logo.src=global_donation_info["logo"];
    }
    else{

        var popup_input_presentation = document.querySelector('#popup_input_presentation') ;
        popup_input_presentation.style.display = "block";
        var displayed_input = document.querySelector('#input_amount');
        var hidden_input = document.querySelector('#withdraw_amount');
        var charity_name=secondary_message;
        var displayed_button;

        var available_amount=0;
        var is_withdraw_donation=false;
        const popup_title = document.querySelector('#popup_input_title') ;
        if(message=="stake"){
          displayed_button = document.querySelector('#stake_input_button') ;
          available_amount=this.state.daiTokenBalance;
          popup_title.innerHTML=secondary_message;
          current_charity_for_staking=tierary_message;

        }
        else if(message=="unstake"){
            displayed_button = document.querySelector('#unstake_input_button') ;
            var this_charity_id=tierary_message;
            current_charity_for_staking=tierary_message;

            for(var i = 0; i < this.state.supported_charities.length; i++){
              var check_each_charity=this.state.supported_charities[i];
              if(check_each_charity[1]==this_charity_id){
                  available_amount=check_each_charity[0];
              }
            }
            popup_title.innerHTML=secondary_message;
        }
        else if(message=="claim"){
            displayed_button = document.querySelector('#claim_input_button') ;
            available_amount=this.state.uncollected_rewards;
            popup_title.innerHTML="Rewards";
        }
        else if(message=="claim_charity"){
            displayed_button = document.querySelector('#claim_charity_input_button') ;
            available_amount=secondary_message;
            popup_title.innerHTML="Rewards";
        }
        else if(message=="withdraw_donation"){
            displayed_button = document.querySelector('#withdraw_input_button') ;
            available_amount=secondary_message;
            popup_title.innerHTML="Withdraw to Bank";
            displayed_input = document.querySelector('#withdraw_amount');
            hidden_input = document.querySelector('#input_amount');
            is_withdraw_donation=true;
        }

        displayed_button.style.display="block";
        displayed_input.style.display="block";
        hidden_input.style.display="none";
        var formatted_number;
        if(is_withdraw_donation==true){
            formatted_number=this.formatted_dollars(available_amount);
            formatted_number="$"+formatted_number;
        }
        else{
            formatted_number=this.formatted_wallet_balance(available_amount);
        }


        var available_amount_element = document.querySelector('#available_amount') ;
        available_amount_element.innerHTML=formatted_number;
    }
  }
  else{
      const popup_presentation = document.querySelector('#popup_presentation') ;
      popup_presentation.style.display = "block";
      const popup_title = document.querySelector('#popup_title') ;
      const popup_message = document.querySelector('#popup_message') ;

      if(type=="error"){

        popup_title.innerHTML="Error";
        popup_message.innerHTML=message;
      }
      else if(type=="transaction_receipt"){
        popup_title.innerHTML=message;
        popup_message.innerHTML=secondary_message;
      }
      else if(type=="notice"){
        popup_title.innerHTML=message;
        popup_message.innerHTML=secondary_message;
      }
      else if(type=="rewards"){
        popup_title.innerHTML="Token Rewards";
        popup_message.innerHTML="-Earn passive income by staking (voting) for your favorite organizations below<br><br>-Rewards are distributed proportionally to how much you stake<br><br>-Charities receive rewards based on how many tokens are staked in their favor<br><br>-Rewards accumulate automatically; all you have to do is claim them!";
      }
      else if(type=="charity_rewards"){
        popup_title.innerHTML="Token Rewards";
        popup_message.innerHTML="Your organization automatically receives passive income based on how many tokens are staked by users in your favor";
      }
      else if(type=="widget_help"){
        popup_title.innerHTML="Paste this HTML code on your website to insert the Donate button";
        popup_message.innerText=message;
      }
  }




}
setTransferTaxPercent = async (new_percent) =>{
  this.state.daiToken.methods.setTaxFeePercent(new_percent).send({ from: this.state.account, gas: admin_gas}).on('receipt', (hash) => {
    this.create_popup("notice", "Complete", "Action successful. Refresh the page to see the change");

  }).catch(function(e){if(e.code!==4001){console.log(e); alert("Transaction Error - Check your Web3 browser/crypto wallet and then try again");}}) 
}
setLPTaxPercent = async (new_percent) =>{
  this.state.daiToken.methods.setLiquidityFeePercent(new_percent).send({ from: this.state.account, gas: admin_gas}).on('receipt', (hash) => {
    this.create_popup("notice", "Complete", "Action successful. Refresh the page to see the change");

  }).catch(function(e){if(e.code!==4001){console.log(e); alert("Transaction Error - Check your Web3 browser/crypto wallet and then try again");}}) 
}
setMaxTxPercent = async (new_basis_point) =>{
  this.state.daiToken.methods.setMaxTxPercent(new_basis_point).send({ from: this.state.account, gas: admin_gas}).on('receipt', (hash) => {
    this.create_popup("notice", "Complete", "Action successful. Refresh the page to see the change");

  }).catch(function(e){if(e.code!==4001){console.log(e); alert("Transaction Error - Check your Web3 browser/crypto wallet and then try again");}}) 
}
setDonationFee = async (new_basis_point) =>{
  this.state.donationProcessor.methods.set_donation_transaction_fee(new_basis_point).send({ from: this.state.account, gas: admin_gas}).on('receipt', (hash) => {
    this.create_popup("notice", "Complete", "Action successful. Refresh the page to see the change");

  }).catch(function(e){if(e.code!==4001){console.log(e); alert("Transaction Error - Check your Web3 browser/crypto wallet and then try again");}}) 
}
set_final_currency = async (new_final_currency) =>{
  if(!window.web3.utils.isAddress(new_final_currency)){
    this.create_popup("error", "Invalid token address");
    return;
  }

  this.state.donationProcessor.methods.set_final_currency(new_final_currency).send({ from: this.state.account, gas: admin_gas}).on('receipt', (hash) => {
    this.create_popup("notice", "Complete", "Action successful. Refresh the page to see the change");

  }).catch(function(e){if(e.code!==4001){console.log(e); alert("Transaction Error - Check your Web3 browser/crypto wallet and then try again");}}) 
}
set_router_address = async (new_router_address) =>{
  if(!window.web3.utils.isAddress(new_router_address)){
    this.create_popup("error", "Invalid router address");
    return;
  }

  this.state.donationProcessor.methods.setRouterAddress(new_router_address).send({ from: this.state.account, gas: admin_gas}).on('receipt', (hash) => {
    this.create_popup("notice", "Complete", "Action successful. Refresh the page to see the change");

  }).catch(function(e){if(e.code!==4001){console.log(e); alert("Transaction Error - Check your Web3 browser/crypto wallet and then try again");}}) 
}

donation_update_currency_value = (token_address) =>{

    if(global_donation_currency=="N/A"){
        document.getElementById("selected_currency_for_price_calculation").innerHTML=global_donation_currency;
        global_donation_currency_value=0;
        document.getElementById("per_unit_price_num").innerHTML=global_donation_currency_value.toFixed(3);
        this.donation_update_total_value();
    }
    else{
        var get_url="https://deep-index.moralis.io/api/v2/erc20/" + token_address + "/price?chain=eth";
        var that=this;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", get_url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');//application/json
        xhr.setRequestHeader('X-API-Key', 'BVydsxHl4xAKCin3MhGBPZLojeNX7WSXwS9Pgglj5bcig3OT96QsSVdQNpM4aaSa');
        xhr.onreadystatechange = function() {//Call a function when the state changes.
            if(xhr.readyState == 4 && xhr.status == 200) {
              var response_array=JSON.parse(xhr.responseText);
              var usd_price=response_array["usdPrice"];
              document.getElementById("selected_currency_for_price_calculation").innerHTML=global_donation_currency;
              global_donation_currency_value=usd_price;
              document.getElementById("per_unit_price_num").innerHTML=global_donation_currency_value.toFixed(3);
              that.donation_update_total_value();
            }
            
        }
        xhr.send();     
    }

}

donation_update_total_value = () =>{
  let input_amount;
  if(is_donate_page){
    input_amount= document.querySelector('#input_donate_amount_donate_page') ;
  }
  else{
    input_amount= document.querySelector('#input_donate_amount') ;
  }
   
  var donate_amount=input_amount.value;

  if(donate_amount=="" || donate_amount<=0 || isNaN(parseFloat(donate_amount))==true){
    document.querySelector('#total_transaction_value_num').innerHTML='0';
    return;
  }
  else{

      var formatted_num=this.formatted_dollars_no_wei((donate_amount*global_donation_currency_value).toString());
      document.querySelector('#total_transaction_value_num').innerHTML=formatted_num;
    }

}
donation_change_currency = async (type) =>{
  var currency_selector=document.getElementById("donation_currency_selector");
  var selected_currency=currency_selector.value;
  var selected_currency_address=currency_selector.options[currency_selector.selectedIndex].getAttribute('contract_address');
  var mainnet_address=currency_selector.options[currency_selector.selectedIndex].getAttribute('mainnet_address');

  if(selected_currency=="OTHER"){
      global_donation_available_amount=0;
      global_donation_currency="N/A";
      global_donation_decimals=0;
      alert("Coming Soon - For Donors: You will be able to donate thousands of cryptos. For Charities: The app will automatically convert all donations into USD equivalents");
  }
  else{
      if(selected_currency=="ETH"){
          global_donation_available_amount=await window.web3.eth.getBalance(this.state.account);
          global_donation_currency="ETH";
          global_donation_decimals=18;
      }
      else{
        const this_coin = new window.web3.eth.Contract(DappToken.abi, selected_currency_address);//load standard ERC-20 ABI to access functions

        global_donation_available_amount=await this_coin.methods.balanceOf(this.state.account).call();
        global_donation_currency=selected_currency;
        global_donation_decimals=await this_coin.methods.decimals().call();
      }
      global_donation_currency_address=selected_currency_address;
  }

  this.set_donation_currency_and_availability();
  this.donation_update_currency_value(mainnet_address);
}
close_dialog = async (type) =>{
    const overlay = document.querySelector('#presentation_overlay2') ;
    overlay.style.display = "none";
    const popup_presentation = document.querySelector('#popup_presentation') ;
    popup_presentation.style.display = "none";


    const popup_input_presentation = document.querySelector('#popup_input_presentation') ;
    popup_input_presentation.style.display = "none";
    const input_amount = document.querySelector('#input_amount') ;
    input_amount.style.display="block";
    input_amount.value = "";

    const withdraw_amount = document.querySelector('#withdraw_amount') ;
    withdraw_amount.style.display="block";
    withdraw_amount.value = "";
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////Reset donation form///////////////////////////////
    const popup_donate_presentation = document.querySelector('#popup_donate_presentation') ;
    popup_donate_presentation.style.display = "none";


    const initialize_donation_container = document.querySelector('#initialize_donation_container') ;
    initialize_donation_container.style.display = "flex";
    const confirm_donation_container = document.querySelector('#confirm_donation_container') ;
    confirm_donation_container.style.display = "none";


    var first_name_input=document.getElementById("donation_first_name");
    var last_name_input=document.getElementById("donation_last_name");
    var input_donate_amount=document.getElementById("input_donate_amount");
    var anonymous_donation_input=document.getElementById("anonymous_donation_input");
    var donate_confirm_button=document.querySelector('#donate_confirm_button');

    first_name_input.value="";
    last_name_input.value="";
    input_donate_amount.value="";

    if(anonymous_donation_input.checked===true){
        anonymous_donation_input.checked=false;
        this.anonymous_checked();
    }
    donate_confirm_button.style.display="inline-block";
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var unstake_button = document.querySelector('#unstake_input_button') ;
    unstake_button.style.display = "none";
    var stake_button = document.querySelector('#stake_input_button') ;
    stake_button.style.display = "none";
    var claim_button = document.querySelector('#claim_input_button') ;
    claim_button.style.display = "none";
    var claim_charity_button = document.querySelector('#claim_charity_input_button') ;
    claim_charity_button.style.display = "none";
    var withdraw_button = document.querySelector('#withdraw_input_button') ;
    withdraw_button.style.display = "none";
    this.hide_loader();
    /*var donate_button = document.querySelector('#donate_input_button') ;
    donate_button.style.display = "none";*/

    var available_amount_element = document.querySelector('#available_amount') ;
    available_amount_element.innerHTML="";
}

capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
tokens(n){
  return this.doDecimalSafeMath(n , "*", 10**18);
}
tokens_dynamic(n, decimals){
  return this.doDecimalSafeMath(n , "*", 10**decimals);
}
from_wei(n){
  return this.doDecimalSafeMath(n , "/", 10**18);// return string value to prevent rounding issues
}
from_wei_dynamic(n, decimals){
  return this.doDecimalSafeMath(n , "/", 10**decimals);// return string value to prevent rounding issues
}
set_input_num_restriction(){

  if(document.getElementById("withdraw_amount")){
    this.setInputFilter(document.getElementById("withdraw_amount"), function(value) {///sets input number restrictions
    return /^-?\d*[.,]?\d{0,2}$/.test(value); });
  }
  if(document.getElementById("input_amount")){
    this.setInputFilter(document.getElementById("input_amount"), function(value) {///sets input number restrictions
    return /^-?\d*[.,]?\d{0,3}$/.test(value); });
  }
  if(document.getElementById("input_donate_amount")){
    this.setInputFilter(document.getElementById("input_donate_amount"), function(value) {///sets input number restrictions
    return /^-?\d*[.,]?\d{0,3}$/.test(value); });
  }
  if(document.getElementById("input_donate_amount_donate_page")){
    this.setInputFilter(document.getElementById("input_donate_amount_donate_page"), function(value) {///sets input number restrictions
    return /^-?\d*[.,]?\d{0,3}$/.test(value); });
  }
    
}
show_loader = () =>{
  var loading_icons = document.getElementsByClassName('loading_icon');
  for(var i = 0; i < loading_icons.length; i++){
        loading_icons[i].style.display="inline-block";
  }
  
}
hide_loader = () =>{
  var loading_icons = document.getElementsByClassName('loading_icon');
  for(var i = 0; i < loading_icons.length; i++){
        loading_icons[i].style.display="none";
  }
}
setInputFilter(textbox, inputFilter) {
  var that=this;
  ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
    textbox.addEventListener(event, function() {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        this.value = "";
      }
      if(textbox.id=="input_donate_amount_donate_page" || textbox.id=="input_donate_amount"){
        that.donation_update_total_value();
      }
      
    });
  });
}

  reset_state(){
    this.state = {
      account: '0x0',
      daiToken: {},
      donationProcessor: {},
      ethBridge:{},
      maticBridge:{},
      charities_list:[],
      daiTokenBalance: '0',
      stakingBalance: '0',
      uncollected_rewards: '0',
      supported_charities:[],
      metamask_installed: false,
      meta_mask_logged_in: false,
      daiToken_loaded: false,
      loading: true
    }

  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      donationProcessor: {},
      ethBridge:{},
      maticBridge:{},
      charities_list:[],
      daiTokenBalance: '0',
      stakingBalance: '0',
      uncollected_rewards: '0',
      supported_charities:[],
      metamask_installed: false,
      meta_mask_logged_in: false,
      daiToken_loaded: false,
      loading: true
    }
  }



  render() {


    var url_string = window.location.href; 
    var url = new URL(url_string);
    var char_id = url.searchParams.get("donate_char_id");


    if(char_id){//http://localhost:3000/?donate_char_id=1
        is_donate_page=true;//global variable for donation page
        let char_name;
        let char_logo;
        if(this.state.loading){
            char_name = "Loading..."
            char_logo="loading.gif";
        }
        else{
          
          for (var i = 0; i < this.state.charities_list.length; i++) {
              if(char_id==this.state.charities_list[i].id){
                char_name=this.state.charities_list[i].name;
                char_logo="/logos/char_"+this.state.charities_list[i].id+".jpg";

                global_donation_info["charity_name"]=char_name;
                global_donation_info["charity_ein"]=this.state.charities_list[i].ein;
                global_donation_info["charity_id"]=char_id;
                global_donation_info["logo"]=char_logo;
                global_donation_info["charity_wallet"]=this.state.charities_list[i].wallet_address;
                break;
              }
          }
        }


      return (


      <div>
        <nav class="sc-dkYRiW caTowP">
          <div class="sc-eCImvq sc-jRQAMF hsMMVe bpzXao">
             <a aria-label="Pancake home page" class="sc-hOGjNT eyszod" onClick={this.click_logo}>
                <img src="ourplanet_logo.png" class="sc-bdvvaa eomlrw mobile-gift"></img>
                <img src="ourplanet_logo.png" class="sc-bdvvaa eomlrw desktop-gift"></img>
                <svg viewBox="0 0 32 32" class="sc-bdvvaa eomlrw mobile-icon" color="text" width="20px" xmlns="http://www.w3.org/2000/svg">
                   <path fill-rule="evenodd" clip-rule="evenodd" d="M5.84199 5.00181C5.35647 2.40193 7.35138 0 9.9962 0C12.3302 0 14.2222 1.89206 14.2222 4.22603V9.43607C14.806 9.39487 15.3992 9.37374 16 9.37374C16.5772 9.37374 17.1474 9.39324 17.709 9.43131V4.22603C17.709 1.89206 19.601 0 21.935 0C24.5798 0 26.5747 2.40193 26.0892 5.00181L24.9456 11.1259C28.8705 12.8395 31.8384 15.8157 31.8384 19.5556V21.8182C31.8384 24.8936 29.8038 27.4686 26.9594 29.2068C24.0928 30.9586 20.2149 32 16 32C11.7851 32 7.90719 30.9586 5.04062 29.2068C2.19624 27.4686 0.161621 24.8936 0.161621 21.8182V19.5556C0.161621 15.8355 3.09899 12.8708 6.99084 11.1538L5.84199 5.00181ZM23.48 11.9305L24.8183 4.76446C25.1552 2.96 23.7707 1.29293 21.935 1.29293C20.3151 1.29293 19.0019 2.60612 19.0019 4.22603V10.8562C18.5774 10.8018 18.1462 10.7586 17.709 10.7274C17.1484 10.6873 16.5782 10.6667 16 10.6667C15.3982 10.6667 14.8049 10.689 14.2222 10.7324C13.785 10.765 13.3537 10.8094 12.9293 10.8651V4.22603C12.9293 2.60612 11.6161 1.29293 9.9962 1.29293C8.16055 1.29293 6.77597 2.96 7.11295 4.76446L8.45562 11.9543C4.25822 13.5135 1.45455 16.3344 1.45455 19.5556V21.8182C1.45455 26.7274 7.96677 30.7071 16 30.7071C24.0332 30.7071 30.5455 26.7274 30.5455 21.8182V19.5556C30.5455 16.318 27.7131 13.4847 23.48 11.9305Z" fill="#633001"></path>
                   <path d="M30.5455 21.8183C30.5455 26.7275 24.0333 30.7072 16 30.7072C7.96681 30.7072 1.45459 26.7275 1.45459 21.8183V19.5557H30.5455V21.8183Z" fill="#FEDC90"></path>
                   <path fill-rule="evenodd" clip-rule="evenodd" d="M7.11298 4.7645C6.77601 2.96004 8.16058 1.29297 9.99624 1.29297C11.6161 1.29297 12.9293 2.60616 12.9293 4.22607V10.8652C13.9192 10.7351 14.9466 10.6667 16 10.6667C17.0291 10.6667 18.0333 10.732 19.0019 10.8562V4.22607C19.0019 2.60616 20.3151 1.29297 21.935 1.29297C23.7707 1.29297 25.1553 2.96004 24.8183 4.7645L23.4801 11.9306C27.7131 13.4847 30.5455 16.318 30.5455 19.5556C30.5455 24.4648 24.0333 28.4445 16 28.4445C7.96681 28.4445 1.45459 24.4648 1.45459 19.5556C1.45459 16.3345 4.25826 13.5135 8.45566 11.9543L7.11298 4.7645Z" fill="#D1884F"></path>
                   <path class="left-eye" d="M11.9595 18.9091C11.9595 20.248 11.2359 21.3333 10.3433 21.3333C9.45075 21.3333 8.72717 20.248 8.72717 18.9091C8.72717 17.5702 9.45075 16.4849 10.3433 16.4849C11.2359 16.4849 11.9595 17.5702 11.9595 18.9091Z" fill="#633001"></path>
                   <path class="right-eye" d="M23.1111 18.9091C23.1111 20.248 22.3875 21.3333 21.4949 21.3333C20.6024 21.3333 19.8788 20.248 19.8788 18.9091C19.8788 17.5702 20.6024 16.4849 21.4949 16.4849C22.3875 16.4849 23.1111 17.5702 23.1111 18.9091Z" fill="#633001"></path>
                </svg>
                <svg viewBox="0 0 160 26" class="sc-bdvvaa eomlrw desktop-icon" color="text" width="20px" xmlns="http://www.w3.org/2000/svg">
                   <path fill-rule="evenodd" clip-rule="evenodd" d="M4.38998 4.50033C4.01476 2.49106 5.55649 0.634766 7.60049 0.634766C9.40427 0.634766 10.8665 2.09701 10.8665 3.90078V7.92728C11.3177 7.89544 11.7761 7.87911 12.2404 7.87911C12.6865 7.87911 13.1272 7.89418 13.5612 7.9236V3.90078C13.5612 2.09701 15.0234 0.634766 16.8272 0.634766C18.8712 0.634766 20.4129 2.49106 20.0377 4.50033L19.1539 9.23326C22.1872 10.5576 24.4809 12.8577 24.4809 15.748V17.4966C24.4809 19.8734 22.9085 21.8634 20.7102 23.2068C18.4948 24.5606 15.4978 25.3654 12.2404 25.3654C8.98304 25.3654 5.98604 24.5606 3.77065 23.2068C1.57242 21.8634 0 19.8734 0 17.4966V15.748C0 12.873 2.2701 10.5817 5.27785 9.25477L4.38998 4.50033ZM18.0212 9.85508L19.0555 4.3169C19.3159 2.92236 18.2459 1.63399 16.8272 1.63399C15.5753 1.63399 14.5604 2.64886 14.5604 3.90078V9.02479C14.2324 8.98273 13.8991 8.9494 13.5612 8.92524C13.128 8.89426 12.6873 8.87833 12.2404 8.87833C11.7753 8.87833 11.3168 8.89559 10.8665 8.92912C10.5286 8.95429 10.1953 8.98862 9.86729 9.03169V3.90078C9.86729 2.64886 8.85241 1.63399 7.60049 1.63399C6.18184 1.63399 5.11179 2.92235 5.37222 4.3169L6.40988 9.87345C3.16599 11.0784 0.999219 13.2586 0.999219 15.748V17.4966C0.999219 21.2906 6.03208 24.3662 12.2404 24.3662C18.4488 24.3662 23.4817 21.2906 23.4817 17.4966V15.748C23.4817 13.2458 21.2927 11.0562 18.0212 9.85508Z" fill="#633001"></path>
                   <path d="M23.4815 17.4967C23.4815 21.2907 18.4486 24.3663 12.2402 24.3663C6.03189 24.3663 0.999023 21.2907 0.999023 17.4967V15.748H23.4815V17.4967Z" fill="#FEDC90"></path>
                   <path fill-rule="evenodd" clip-rule="evenodd" d="M5.37202 4.31671C5.1116 2.92216 6.18164 1.63379 7.6003 1.63379C8.85222 1.63379 9.8671 2.64867 9.8671 3.90059V9.0315C10.6321 8.93102 11.4261 8.87813 12.2402 8.87813C13.0356 8.87813 13.8116 8.9286 14.5602 9.02459V3.90059C14.5602 2.64867 15.5751 1.63379 16.827 1.63379C18.2457 1.63379 19.3157 2.92216 19.0553 4.31671L18.021 9.85488C21.2925 11.056 23.4815 13.2457 23.4815 15.7478C23.4815 19.5418 18.4486 22.6174 12.2402 22.6174C6.03189 22.6174 0.999023 19.5418 0.999023 15.7478C0.999023 13.2584 3.16579 11.0782 6.40968 9.87326L5.37202 4.31671Z" fill="#D1884F"></path>
                   <path class="left-eye" d="M9.11817 15.2485C9.11817 16.2833 8.55896 17.1221 7.86914 17.1221C7.17932 17.1221 6.62012 16.2833 6.62012 15.2485C6.62012 14.2138 7.17932 13.375 7.86914 13.375C8.55896 13.375 9.11817 14.2138 9.11817 15.2485Z" fill="#633001"></path>
                   <path class="right-eye" d="M17.7363 15.2485C17.7363 16.2833 17.1771 17.1221 16.4873 17.1221C15.7975 17.1221 15.2383 16.2833 15.2383 15.2485C15.2383 14.2138 15.7975 13.375 16.4873 13.375C17.1771 13.375 17.7363 14.2138 17.7363 15.2485Z" fill="#633001"></path>
                </svg>

             </a>
          </div>
          <div class="sc-eCImvq sc-jRQAMF hsMMVe bpzXao">
             <div>
                <button class="sc-dkPtyc gXugwo" id="connect_wallet_button" scale="sm" onClick={this.connect_wallet_pressed}>Connect Wallet</button>
             </div>
          </div>
        </nav>
        <div class="sc-eCImvq sc-hmjpBu jKbcuz dLDrPl" id="popup_donate_presentation_donate_page">
             <div class="sc-jIkYaL hVETUG" id="donate_popup_heading_container">
                <div class="sc-eCImvq sc-jRQAMF sc-ZOsLE hsMMVe bpzXao HTdit">
                   <div class="popup_title_container">
                    <h2 color="text" class="sc-gsDJrp sc-fKVsgm dzNkWZ jGwvJZ" id="popup_donate_input_title">{char_name}</h2>
                   </div>
                   <div width="32" height="32" class="sc-bBHwJV gAlMva donate_popup">
                    <img draggable="false" src={char_logo} class="sc-iwjezw fEQOki" id="donate_charity_logo"></img>
                   </div>
                </div>
                <button class="sc-dkPtyc dPcdZs sc-hKwCoD cKBoHr" id="donate_page_back_button" aria-label="Close the dialog" scale="md" onClick={this.donate_page_back_pressed}>
                   <svg viewBox="0 0 24 24" color="primary" width="20px" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa dqTYWn">
                      <path d="M18.3 5.70997C17.91 5.31997 17.28 5.31997 16.89 5.70997L12 10.59L7.10997 5.69997C6.71997 5.30997 6.08997 5.30997 5.69997 5.69997C5.30997 6.08997 5.30997 6.71997 5.69997 7.10997L10.59 12L5.69997 16.89C5.30997 17.28 5.30997 17.91 5.69997 18.3C6.08997 18.69 6.71997 18.69 7.10997 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.10997C18.68 6.72997 18.68 6.08997 18.3 5.70997Z"></path>
                   </svg>
                </button>

             </div>
              <div id="donate_page_overlay">
                <button class="sc-dkPtyc gXugwo" id="connect_wallet_button_donate_page" scale="sm" onClick={this.connect_wallet_pressed}>Connect Wallet</button>
              </div>
             <div class="sc-eCImvq sc-jRQAMF sc-jOxuqd bxcnZc bpzXao cVqNCr" id="initialize_donation_container">

                <input class="sc-dkPtyc blMRzM" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="First name" id="donation_first_name"></input>
                <input class="sc-dkPtyc blMRzM" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Last name" id="donation_last_name"></input>
                <div id="anonymous_donation_container">
                    <input type="checkbox" id="anonymous_donation_input" name="anonymous_donation" onChange={this.anonymous_checked}></input>
                    <label id="anonymous_label" for="anonymous_donation">&nbsp; Anonymous Donation</label>
                </div>
                <select id="donation_currency_selector" onChange={this.donation_change_currency}>
                    <option value="ETH" contract_address="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" mainnet_address="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2">ETH</option>
                    <option value="UNI" contract_address="0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" mainnet_address="0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984">UNI</option>
                    <option value="NINE" contract_address="0x6e40dd99E83AaD1b7B6F80c24CCBB8a1dC54c24D" mainnet_address="0xfF20817765cB7f73d4bde2e66e067E58D11095C2">NINE</option>
                    <option value="USDC" contract_address="0x07865c6E87B9F70255377e024ace6630C1Eaa37F" mainnet_address="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48">USDC</option>
                    <option value="OTHER" contract_address="">OTHER</option>
                </select>
                <div>
                    <div color="textSubtle" class="sc-gsDJrp kTGmuy" id="available_donation_input">Wallet Balance:</div>
                    <div color="textSubtle" class="sc-gsDJrp kTGmuy" id="available_donation_amount"><span id="available_donation_amount_num">0</span> <span id="donation_currency"></span><img id="donate_eth_logo" src="eth-logo.png"></img></div>
                </div>
                <input class="sc-dkPtyc blMRzM" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Enter Donation Amount" id="input_donate_amount_donate_page"></input>
                <div color="textSubtle" class="sc-gsDJrp kTGmuy" id="per_unit_price">~$<span id="per_unit_price_num">0</span>/<span id="selected_currency_for_price_calculation">ETH</span></div>
                <div color="textSubtle" class="sc-gsDJrp kTGmuy" id="total_transaction_value">Total Value: ~$<span id="total_transaction_value_num">0</span></div>
                <button class="sc-dkPtyc blMRzM" scale="md" id="donate_input_button" onClick={this.donate_continue_pressed}>Continue</button>
                <p class="small_notice">*You will receive a receipt, linked to your wallet address, for tax and accounting purposes</p>
             </div>
             <div id="confirm_donation_container">
                <div color="textSubtle" class="sc-gsDJrp kTGmuy">To:</div>
                <p class="confirm_donation_info" id="receiving_organization_confirm">Receiving Organization</p>
                <div color="textSubtle" class="sc-gsDJrp kTGmuy">From: </div>
                <p class="confirm_donation_info" id="donor_confirm">Donor</p>
                <div color="textSubtle" class="sc-gsDJrp kTGmuy">Amount:</div>
                <p class="confirm_donation_info"  id="amount_confirm">Amount</p>
                <div id="donate_confirm_button_container">
                  <button class="sc-dkPtyc blMRzM input_submiti" scale="md" id="donate_confirm_button" onClick={this.confirm_donation_pressed}>Confirm Payment</button> 
                </div>
                <div class="loading_icon_container">
                  <img class="loading_icon" src="loading.gif" width="50" />
                </div>
                <p class="small_notice" id="donation_identity_notice"></p>
             </div>
              <div role="presentation" class="sc-eLwHGX sc-uoixf dVYXTr jGzOKM" id="presentation_overlay2" onClick={this.close_dialog}>  
              </div>
              <div class="sc-eCImvq sc-hmjpBu jKbcuz dLDrPl" id="popup_presentation">
                   <div class="sc-jIkYaL hVETUG" id="popup_heading_container">
                      <div class="sc-eCImvq sc-jRQAMF sc-ZOsLE hsMMVe bpzXao HTdit">
                        <div class="popup_title_container">
                          <h2 color="text" class="sc-gsDJrp sc-fKVsgm dzNkWZ jGwvJZ" id="popup_title"></h2>
                         </div>
                      </div>
                      <button class="sc-dkPtyc dPcdZs sc-hKwCoD cKBoHr" aria-label="Close the dialog" scale="md" onClick={this.close_dialog}>
                         <svg viewBox="0 0 24 24" color="primary" width="20px" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa dqTYWn">
                            <path d="M18.3 5.70997C17.91 5.31997 17.28 5.31997 16.89 5.70997L12 10.59L7.10997 5.69997C6.71997 5.30997 6.08997 5.30997 5.69997 5.69997C5.30997 6.08997 5.30997 6.71997 5.69997 7.10997L10.59 12L5.69997 16.89C5.30997 17.28 5.30997 17.91 5.69997 18.3C6.08997 18.69 6.71997 18.69 7.10997 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.10997C18.68 6.72997 18.68 6.08997 18.3 5.70997Z"></path>
                         </svg>
                      </button>
                   </div>
                   <div class="sc-eCImvq sc-jRQAMF sc-jOxuqd bxcnZc bpzXao cVqNCr" id="popup_message_container">
                      <div font-size="20px" color="text" class="sc-gsDJrp kivcLc"></div>
                      <div font-size="12px" color="text" class="sc-gsDJrp sc-fKVsgm dzNkWZ jGwvJZ" id="popup_message"></div>
                   </div>
              </div>
              <div class="sc-eCImvq sc-hmjpBu jKbcuz dLDrPl" id="popup_input_presentation">
                     <div class="sc-jIkYaL hVETUG" id="input_popup_heading_container">
                        <div class="sc-eCImvq sc-jRQAMF sc-ZOsLE hsMMVe bpzXao HTdit">
                          <div class="popup_title_container">
                            <h2 color="text" class="sc-gsDJrp sc-fKVsgm dzNkWZ jGwvJZ" id="popup_input_title"></h2>
                           </div>
                        </div>
                        <button class="sc-dkPtyc dPcdZs sc-hKwCoD cKBoHr" aria-label="Close the dialog" scale="md" onClick={this.close_dialog}>
                           <svg viewBox="0 0 24 24" color="primary" width="20px" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa dqTYWn">
                              <path d="M18.3 5.70997C17.91 5.31997 17.28 5.31997 16.89 5.70997L12 10.59L7.10997 5.69997C6.71997 5.30997 6.08997 5.30997 5.69997 5.69997C5.30997 6.08997 5.30997 6.71997 5.69997 7.10997L10.59 12L5.69997 16.89C5.30997 17.28 5.30997 17.91 5.69997 18.3C6.08997 18.69 6.71997 18.69 7.10997 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.10997C18.68 6.72997 18.68 6.08997 18.3 5.70997Z"></path>
                           </svg>
                        </button>
                     </div>
                     <div class="sc-eCImvq sc-jRQAMF sc-jOxuqd bxcnZc bpzXao cVqNCr">
                        <div class="charity_instructions_wrapper">
                            <div font-size="20px" color="textSubtle" class="sc-gsDJrp kTGmuy" id="available_input">Available:</div>
                            <div font-size="12px" color="textSubtle" class="sc-gsDJrp kTGmuy" id="available_amount"></div>
                        </div>
                        <input class="sc-dkPtyc blMRzM" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Enter Amount" id="input_amount"></input>
                        <input class="sc-dkPtyc blMRzM" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Enter Amount" id="withdraw_amount"></input>
                        <button class="sc-dkPtyc blMRzM input_submit" scale="md" id="unstake_input_button" onClick={this.confirm_unstake}>Unstake</button>
                        <button class="sc-dkPtyc blMRzM input_submit" scale="md" id="stake_input_button" onClick={this.confirm_stake}>Stake</button>
                        <button class="sc-dkPtyc blMRzM input_submit" scale="md" id="claim_input_button" onClick={this.confirm_claim}>Claim Rewards</button>
                        <button class="sc-dkPtyc blMRzM input_submit" scale="md" id="claim_charity_input_button" onClick={this.confirm_charity_claim}>Claim Rewards</button>
                        <button class="sc-dkPtyc blMRzM input_submit" scale="md" id="withdraw_input_button" onClick={this.confirm_withdraw_donation}>Confirm Withdraw</button>
                        <div class="loading_icon_container">
                          <img class="loading_icon" src="loading.gif" width="50" />
                        </div>

                     </div>
                </div>
                <div class="sc-eCImvq sc-hmjpBu jKbcuz dLDrPl" id="popup_donate_presentation">
                   <div class="sc-jIkYaL hVETUG" id="donate_popup_heading_container">
                      <div class="sc-eCImvq sc-jRQAMF sc-ZOsLE hsMMVe bpzXao HTdit">
                         <div class="popup_title_container">
                          <h2 color="text" class="sc-gsDJrp sc-fKVsgm dzNkWZ jGwvJZ" id="popup_donate_input_title"></h2>
                         </div>
                         <div width="32" height="32" class="sc-bBHwJV gAlMva donate_popup">
                          <img draggable="false" src="ourplanet_logo.png" class="sc-iwjezw fEQOki" id="donate_charity_logo"></img>
                         </div>
                      </div>
                      <button class="sc-dkPtyc dPcdZs sc-hKwCoD cKBoHr" aria-label="Close the dialog" scale="md" onClick={this.close_dialog}>
                         <svg viewBox="0 0 24 24" color="primary" width="20px" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa dqTYWn">
                            <path d="M18.3 5.70997C17.91 5.31997 17.28 5.31997 16.89 5.70997L12 10.59L7.10997 5.69997C6.71997 5.30997 6.08997 5.30997 5.69997 5.69997C5.30997 6.08997 5.30997 6.71997 5.69997 7.10997L10.59 12L5.69997 16.89C5.30997 17.28 5.30997 17.91 5.69997 18.3C6.08997 18.69 6.71997 18.69 7.10997 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.10997C18.68 6.72997 18.68 6.08997 18.3 5.70997Z"></path>
                         </svg>
                      </button>
                   </div>
                   <div class="sc-eCImvq sc-jRQAMF sc-jOxuqd bxcnZc bpzXao cVqNCr" id="initialize_donation_container">

                      <input class="sc-dkPtyc blMRzM" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="First name" id="donation_first_name"></input>
                      <input class="sc-dkPtyc blMRzM" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Last name" id="donation_last_name"></input>
                      <div id="anonymous_donation_container">
                          <input type="checkbox" id="anonymous_donation_input" name="anonymous_donation" onChange={this.anonymous_checked}></input>
                          <label id="anonymous_label" for="anonymous_donation">&nbsp; Anonymous Donation</label>
                      </div>
                      <select id="donation_currency_selector" onChange={this.donation_change_currency}>
                      </select>
                      <div>
                          <div color="textSubtle" class="sc-gsDJrp kTGmuy" id="available_donation_input">Wallet Balance:</div>
                          <div color="textSubtle" class="sc-gsDJrp kTGmuy" id="available_donation_amount"><span id="available_donation_amount_num">0</span> <span id="donation_currency"></span><img id="donate_eth_logo" src="eth-logo.png"></img></div>
                      </div>
                      
                      <input class="sc-dkPtyc blMRzM" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Enter Donation Amount" id="input_donate_amount"></input>
                      <div color="textSubtle" class="sc-gsDJrp kTGmuy" id="per_unit_price">~$<span id="per_unit_price_num">0</span>/<span id="selected_currency_for_price_calculation">ETH</span></div>
                      <div color="textSubtle" class="sc-gsDJrp kTGmuy" id="total_transaction_value">Total Value: ~$<span id="total_transaction_value_num">0</span></div>
                      <button class="sc-dkPtyc blMRzM" scale="md" id="donate_input_button" onClick={this.donate_continue_pressed}>Continue</button>
                      <p class="small_notice">*You will receive a receipt, linked to your wallet address, for tax and accounting purposes</p>
                   </div>
                   <div id="confirm_donation_container">
                      <div color="textSubtle" class="sc-gsDJrp kTGmuy">To:</div>
                      <p class="confirm_donation_info" id="receiving_organization_confirm">Receiving Organization</p>
                      <div color="textSubtle" class="sc-gsDJrp kTGmuy">From: </div>
                      <p class="confirm_donation_info" id="donor_confirm">Donor</p>
                      <div color="textSubtle" class="sc-gsDJrp kTGmuy">Amount:</div>
                      <p class="confirm_donation_info"  id="amount_confirm">Amount</p>
                      <div id="donate_confirm_button_container">
                        <button class="sc-dkPtyc blMRzM input_submiti" scale="md" id="donate_confirm_button" onClick={this.confirm_donation_pressed}>Confirm Payment</button> 
                      </div>
                      <div class="loading_icon_container">
                        <img class="loading_icon" src="loading.gif" width="50" />
                      </div>
                      <p class="small_notice" id="donation_identity_notice"></p>
                   </div>
                </div>
        </div>
        <div id="powered_by">Powered by <a href="/bsc/" target="_blank" class="donate_page_home_link">Givecrypto.finance</a></div>
      </div>
        
        );
    }
    else{
        var that=this;

        let navigation_bar=<Navbar parent = {that}/>
        let content;
        let home;

        if(this.state.loading){
            content = <p id="loader" className="text-center">Loading...</p>
        }
        else{
          if(global_currently_on_manage_charity==true || global_currently_on_view_transactions==true){
              content="";
          }
          else{
             content = [];
            for (var i = 0; i < this.state.charities_list.length; i++) {
                let content_test= <Main 
                    this_charity={this.state.charities_list[i]}
                    parent = {that}
                />
                content.push(content_test);
            }
          }

        }


      return (
            <div>
              <div class="sc-dtDOJZ epBZUF">
                  <nav class="sc-dkYRiW caTowP">
                    <div class="sc-eCImvq sc-jRQAMF hsMMVe bpzXao">
                       <a aria-label="Pancake home page" class="sc-hOGjNT eyszod" onClick={this.click_logo}>
                          <img src="ourplanet_logo.png" class="sc-bdvvaa eomlrw mobile-gift"></img>
                          <img src="ourplanet_logo.png" class="sc-bdvvaa eomlrw desktop-gift"></img>
                          <svg viewBox="0 0 32 32" class="sc-bdvvaa eomlrw mobile-icon" color="text" width="20px" xmlns="http://www.w3.org/2000/svg">
                             <path fill-rule="evenodd" clip-rule="evenodd" d="M5.84199 5.00181C5.35647 2.40193 7.35138 0 9.9962 0C12.3302 0 14.2222 1.89206 14.2222 4.22603V9.43607C14.806 9.39487 15.3992 9.37374 16 9.37374C16.5772 9.37374 17.1474 9.39324 17.709 9.43131V4.22603C17.709 1.89206 19.601 0 21.935 0C24.5798 0 26.5747 2.40193 26.0892 5.00181L24.9456 11.1259C28.8705 12.8395 31.8384 15.8157 31.8384 19.5556V21.8182C31.8384 24.8936 29.8038 27.4686 26.9594 29.2068C24.0928 30.9586 20.2149 32 16 32C11.7851 32 7.90719 30.9586 5.04062 29.2068C2.19624 27.4686 0.161621 24.8936 0.161621 21.8182V19.5556C0.161621 15.8355 3.09899 12.8708 6.99084 11.1538L5.84199 5.00181ZM23.48 11.9305L24.8183 4.76446C25.1552 2.96 23.7707 1.29293 21.935 1.29293C20.3151 1.29293 19.0019 2.60612 19.0019 4.22603V10.8562C18.5774 10.8018 18.1462 10.7586 17.709 10.7274C17.1484 10.6873 16.5782 10.6667 16 10.6667C15.3982 10.6667 14.8049 10.689 14.2222 10.7324C13.785 10.765 13.3537 10.8094 12.9293 10.8651V4.22603C12.9293 2.60612 11.6161 1.29293 9.9962 1.29293C8.16055 1.29293 6.77597 2.96 7.11295 4.76446L8.45562 11.9543C4.25822 13.5135 1.45455 16.3344 1.45455 19.5556V21.8182C1.45455 26.7274 7.96677 30.7071 16 30.7071C24.0332 30.7071 30.5455 26.7274 30.5455 21.8182V19.5556C30.5455 16.318 27.7131 13.4847 23.48 11.9305Z" fill="#633001"></path>
                             <path d="M30.5455 21.8183C30.5455 26.7275 24.0333 30.7072 16 30.7072C7.96681 30.7072 1.45459 26.7275 1.45459 21.8183V19.5557H30.5455V21.8183Z" fill="#FEDC90"></path>
                             <path fill-rule="evenodd" clip-rule="evenodd" d="M7.11298 4.7645C6.77601 2.96004 8.16058 1.29297 9.99624 1.29297C11.6161 1.29297 12.9293 2.60616 12.9293 4.22607V10.8652C13.9192 10.7351 14.9466 10.6667 16 10.6667C17.0291 10.6667 18.0333 10.732 19.0019 10.8562V4.22607C19.0019 2.60616 20.3151 1.29297 21.935 1.29297C23.7707 1.29297 25.1553 2.96004 24.8183 4.7645L23.4801 11.9306C27.7131 13.4847 30.5455 16.318 30.5455 19.5556C30.5455 24.4648 24.0333 28.4445 16 28.4445C7.96681 28.4445 1.45459 24.4648 1.45459 19.5556C1.45459 16.3345 4.25826 13.5135 8.45566 11.9543L7.11298 4.7645Z" fill="#D1884F"></path>
                             <path class="left-eye" d="M11.9595 18.9091C11.9595 20.248 11.2359 21.3333 10.3433 21.3333C9.45075 21.3333 8.72717 20.248 8.72717 18.9091C8.72717 17.5702 9.45075 16.4849 10.3433 16.4849C11.2359 16.4849 11.9595 17.5702 11.9595 18.9091Z" fill="#633001"></path>
                             <path class="right-eye" d="M23.1111 18.9091C23.1111 20.248 22.3875 21.3333 21.4949 21.3333C20.6024 21.3333 19.8788 20.248 19.8788 18.9091C19.8788 17.5702 20.6024 16.4849 21.4949 16.4849C22.3875 16.4849 23.1111 17.5702 23.1111 18.9091Z" fill="#633001"></path>
                          </svg>
                          <svg viewBox="0 0 160 26" class="sc-bdvvaa eomlrw desktop-icon" color="text" width="20px" xmlns="http://www.w3.org/2000/svg">
                             <path fill-rule="evenodd" clip-rule="evenodd" d="M4.38998 4.50033C4.01476 2.49106 5.55649 0.634766 7.60049 0.634766C9.40427 0.634766 10.8665 2.09701 10.8665 3.90078V7.92728C11.3177 7.89544 11.7761 7.87911 12.2404 7.87911C12.6865 7.87911 13.1272 7.89418 13.5612 7.9236V3.90078C13.5612 2.09701 15.0234 0.634766 16.8272 0.634766C18.8712 0.634766 20.4129 2.49106 20.0377 4.50033L19.1539 9.23326C22.1872 10.5576 24.4809 12.8577 24.4809 15.748V17.4966C24.4809 19.8734 22.9085 21.8634 20.7102 23.2068C18.4948 24.5606 15.4978 25.3654 12.2404 25.3654C8.98304 25.3654 5.98604 24.5606 3.77065 23.2068C1.57242 21.8634 0 19.8734 0 17.4966V15.748C0 12.873 2.2701 10.5817 5.27785 9.25477L4.38998 4.50033ZM18.0212 9.85508L19.0555 4.3169C19.3159 2.92236 18.2459 1.63399 16.8272 1.63399C15.5753 1.63399 14.5604 2.64886 14.5604 3.90078V9.02479C14.2324 8.98273 13.8991 8.9494 13.5612 8.92524C13.128 8.89426 12.6873 8.87833 12.2404 8.87833C11.7753 8.87833 11.3168 8.89559 10.8665 8.92912C10.5286 8.95429 10.1953 8.98862 9.86729 9.03169V3.90078C9.86729 2.64886 8.85241 1.63399 7.60049 1.63399C6.18184 1.63399 5.11179 2.92235 5.37222 4.3169L6.40988 9.87345C3.16599 11.0784 0.999219 13.2586 0.999219 15.748V17.4966C0.999219 21.2906 6.03208 24.3662 12.2404 24.3662C18.4488 24.3662 23.4817 21.2906 23.4817 17.4966V15.748C23.4817 13.2458 21.2927 11.0562 18.0212 9.85508Z" fill="#633001"></path>
                             <path d="M23.4815 17.4967C23.4815 21.2907 18.4486 24.3663 12.2402 24.3663C6.03189 24.3663 0.999023 21.2907 0.999023 17.4967V15.748H23.4815V17.4967Z" fill="#FEDC90"></path>
                             <path fill-rule="evenodd" clip-rule="evenodd" d="M5.37202 4.31671C5.1116 2.92216 6.18164 1.63379 7.6003 1.63379C8.85222 1.63379 9.8671 2.64867 9.8671 3.90059V9.0315C10.6321 8.93102 11.4261 8.87813 12.2402 8.87813C13.0356 8.87813 13.8116 8.9286 14.5602 9.02459V3.90059C14.5602 2.64867 15.5751 1.63379 16.827 1.63379C18.2457 1.63379 19.3157 2.92216 19.0553 4.31671L18.021 9.85488C21.2925 11.056 23.4815 13.2457 23.4815 15.7478C23.4815 19.5418 18.4486 22.6174 12.2402 22.6174C6.03189 22.6174 0.999023 19.5418 0.999023 15.7478C0.999023 13.2584 3.16579 11.0782 6.40968 9.87326L5.37202 4.31671Z" fill="#D1884F"></path>
                             <path class="left-eye" d="M9.11817 15.2485C9.11817 16.2833 8.55896 17.1221 7.86914 17.1221C7.17932 17.1221 6.62012 16.2833 6.62012 15.2485C6.62012 14.2138 7.17932 13.375 7.86914 13.375C8.55896 13.375 9.11817 14.2138 9.11817 15.2485Z" fill="#633001"></path>
                             <path class="right-eye" d="M17.7363 15.2485C17.7363 16.2833 17.1771 17.1221 16.4873 17.1221C15.7975 17.1221 15.2383 16.2833 15.2383 15.2485C15.2383 14.2138 15.7975 13.375 16.4873 13.375C17.1771 13.375 17.7363 14.2138 17.7363 15.2485Z" fill="#633001"></path>
                          </svg>

                       </a>
                    </div>
                    <div class="sc-eCImvq sc-jRQAMF hsMMVe bpzXao">
                       <div>

                            <div class="display_balance"><b>Your Number of Donations (Fetched From Smart Contract): </b><span id="display_balance_num">0</span></div>

                          <button class="sc-dkPtyc gXugwo" id="connect_wallet_button" scale="sm" onClick={this.connect_wallet_pressed}>Connect Wallet</button>
                       </div>
                    </div>
                  </nav>
                  <div class="sc-XxOsz lfekfM">
                    {navigation_bar}
                    <div class="sc-ilftOa lonjmS">
                       <div class="sc-eCImvq sc-jHkVfK hsMMVe cfaFwb">
                          <div class="sc-hAcGfq sc-bQtJOP fVQVLo geUbww">
                             <div class="sc-eCImvq sc-jRQAMF hsMMVe jxipBE">
                                <div class="sc-eCImvq sc-jRQAMF jBThLF fevSJA">
                                   <h1 color="secondary" class="sc-gsDJrp sc-fKVsgm eHZcSj PNVyb" id="header_heading">Browse Organizations</h1>
                                   <h2 color="text" class="sc-gsDJrp sc-fKVsgm dzNkWZ jGwvJZ" id="header_subtext">Donate with crypto in just a few clicks</h2>
                                   <h2 color="text" class="sc-gsDJrp sc-fKVsgm dzNkWZ jGwvJZ" id="header_subtext2"></h2>
                                </div>
                                <div height="fit-content" class="sc-eCImvq sc-jRQAMF kNdXMN gNAkWY" id="token_holder_rewards_container">
                                   <div class="sc-hBURRC bCUoAf sc-eXlDFz eQxXJL">
                                      <div class="sc-fotPbf lhuUPw">
                                         <div class="sc-eCImvq sc-jRQAMF hsMMVe fevSJA">
                                            <div class="sc-eCImvq sc-jRQAMF dcBPfY hghLuY">
                                               <div font-size="16px" color="textSubtle" class="sc-gsDJrp denOWz">Your Rewards</div>
                                               <div class="sc-eCImvq hsMMVe" id="rewards_question"  onClick={this.rewards_help}>
                                                  <svg viewBox="0 0 24 24" color="textSubtle" width="20px" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa clWehF">
                                                     <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 16H13V18H11V16ZM12.61 6.04C10.55 5.74 8.73 7.01 8.18 8.83C8 9.41 8.44 10 9.05 10H9.25C9.66 10 9.99 9.71 10.13 9.33C10.45 8.44 11.4 7.83 12.43 8.05C13.38 8.25 14.08 9.18 14 10.15C13.9 11.49 12.38 11.78 11.55 13.03C11.55 13.04 11.54 13.04 11.54 13.05C11.53 13.07 11.52 13.08 11.51 13.1C11.42 13.25 11.33 13.42 11.26 13.6C11.25 13.63 11.23 13.65 11.22 13.68C11.21 13.7 11.21 13.72 11.2 13.75C11.08 14.09 11 14.5 11 15H13C13 14.58 13.11 14.23 13.28 13.93C13.3 13.9 13.31 13.87 13.33 13.84C13.41 13.7 13.51 13.57 13.61 13.45C13.62 13.44 13.63 13.42 13.64 13.41C13.74 13.29 13.85 13.18 13.97 13.07C14.93 12.16 16.23 11.42 15.96 9.51C15.72 7.77 14.35 6.3 12.61 6.04Z"></path>
                                                  </svg>
                                               </div>
                                            </div>
                                         </div>
                                         <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc">
                                            <div class="sc-eCImvq sc-jRQAMF eRmSqP fevSJA">
                                               <h2 color="text" class="sc-gsDJrp sc-fKVsgm dzNkWZ jGwvJZ" id="display_reward_num">0</h2>
                                               <img src="gold_coin2.png" class="gold_coin" draggable="false"></img>
                                               
                                            </div>
                                            <button class="sc-dkPtyc gXugwo" scale="sm" onClick={this.claim_pressed}>Claim</button>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                      <div class="sc-hAcGfq sc-kYHenr fVQVLo eBeOhc" id="charity_data_container">
                          <div id="charity_list_container" class="sc-dVNiOx iLaunk">
                              {content}
                          </div>
                          <div class="sc-eCImvq sc-jRQAMF gWBwXW XNCrE">
                             <div class="sc-eCImvq sc-jRQAMF dxQJdl ebrMAK">
                                <a target="_blank" rel="noreferrer noopener" href="info.html" class="sc-gsDJrp sc-giYgFv lfncoS deECce sc-gjNGvZ dkvwiK" color="primary">
                                   <button class="sc-dkPtyc dQqHpi" scale="md">
                                      <div color="backgroundAlt" font-size="16px" class="sc-gsDJrp sc-gyEloo cUrrpg hKvrzi">Help</div>
                                      <svg viewBox="0 0 24 24" color="backgroundAlt" width="20px" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa ccByUa">
                                         <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 16H13V18H11V16ZM12.61 6.04C10.55 5.74 8.73 7.01 8.18 8.83C8 9.41 8.44 10 9.05 10H9.25C9.66 10 9.99 9.71 10.13 9.33C10.45 8.44 11.4 7.83 12.43 8.05C13.38 8.25 14.08 9.18 14 10.15C13.9 11.49 12.38 11.78 11.55 13.03C11.55 13.04 11.54 13.04 11.54 13.05C11.53 13.07 11.52 13.08 11.51 13.1C11.42 13.25 11.33 13.42 11.26 13.6C11.25 13.63 11.23 13.65 11.22 13.68C11.21 13.7 11.21 13.72 11.2 13.75C11.08 14.09 11 14.5 11 15H13C13 14.58 13.11 14.23 13.28 13.93C13.3 13.9 13.31 13.87 13.33 13.84C13.41 13.7 13.51 13.57 13.61 13.45C13.62 13.44 13.63 13.42 13.64 13.41C13.74 13.29 13.85 13.18 13.97 13.07C14.93 12.16 16.23 11.42 15.96 9.51C15.72 7.77 14.35 6.3 12.61 6.04Z"></path>
                                      </svg>
                                   </button>
                                </a>
                             </div>
                          </div>
                      </div>
                    </div>
                    <div role="presentation" class="sc-eLwHGX sc-uoixf dVYXTr jGzOKM" id="presentation_overlay2" onClick={this.close_dialog}>  
                    </div>
                    <div class="sc-eCImvq sc-hmjpBu jKbcuz dLDrPl" id="popup_presentation">
                         <div class="sc-jIkYaL hVETUG" id="popup_heading_container">
                            <div class="sc-eCImvq sc-jRQAMF sc-ZOsLE hsMMVe bpzXao HTdit">
                              <div class="popup_title_container">
                                <h2 color="text" class="sc-gsDJrp sc-fKVsgm dzNkWZ jGwvJZ" id="popup_title"></h2>
                               </div>
                            </div>
                            <button class="sc-dkPtyc dPcdZs sc-hKwCoD cKBoHr" aria-label="Close the dialog" scale="md" onClick={this.close_dialog}>
                               <svg viewBox="0 0 24 24" color="primary" width="20px" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa dqTYWn">
                                  <path d="M18.3 5.70997C17.91 5.31997 17.28 5.31997 16.89 5.70997L12 10.59L7.10997 5.69997C6.71997 5.30997 6.08997 5.30997 5.69997 5.69997C5.30997 6.08997 5.30997 6.71997 5.69997 7.10997L10.59 12L5.69997 16.89C5.30997 17.28 5.30997 17.91 5.69997 18.3C6.08997 18.69 6.71997 18.69 7.10997 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.10997C18.68 6.72997 18.68 6.08997 18.3 5.70997Z"></path>
                               </svg>
                            </button>
                         </div>
                         <div class="sc-eCImvq sc-jRQAMF sc-jOxuqd bxcnZc bpzXao cVqNCr" id="popup_message_container">
                            <div font-size="20px" color="text" class="sc-gsDJrp kivcLc"></div>
                            <div font-size="12px" color="text" class="sc-gsDJrp sc-fKVsgm dzNkWZ jGwvJZ" id="popup_message"></div>
                         </div>
                    </div>
                     <div class="sc-eCImvq sc-hmjpBu jKbcuz dLDrPl" id="popup_input_presentation">
                         <div class="sc-jIkYaL hVETUG" id="input_popup_heading_container">
                            <div class="sc-eCImvq sc-jRQAMF sc-ZOsLE hsMMVe bpzXao HTdit">
                              <div class="popup_title_container">
                                <h2 color="text" class="sc-gsDJrp sc-fKVsgm dzNkWZ jGwvJZ" id="popup_input_title"></h2>
                               </div>
                            </div>
                            <button class="sc-dkPtyc dPcdZs sc-hKwCoD cKBoHr" aria-label="Close the dialog" scale="md" onClick={this.close_dialog}>
                               <svg viewBox="0 0 24 24" color="primary" width="20px" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa dqTYWn">
                                  <path d="M18.3 5.70997C17.91 5.31997 17.28 5.31997 16.89 5.70997L12 10.59L7.10997 5.69997C6.71997 5.30997 6.08997 5.30997 5.69997 5.69997C5.30997 6.08997 5.30997 6.71997 5.69997 7.10997L10.59 12L5.69997 16.89C5.30997 17.28 5.30997 17.91 5.69997 18.3C6.08997 18.69 6.71997 18.69 7.10997 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.10997C18.68 6.72997 18.68 6.08997 18.3 5.70997Z"></path>
                               </svg>
                            </button>
                         </div>
                         <div class="sc-eCImvq sc-jRQAMF sc-jOxuqd bxcnZc bpzXao cVqNCr">
                            <div class="charity_instructions_wrapper">
                                <div font-size="20px" color="textSubtle" class="sc-gsDJrp kTGmuy" id="available_input">Available:</div>
                                <div font-size="12px" color="textSubtle" class="sc-gsDJrp kTGmuy" id="available_amount"></div>
                            </div>
                            <input class="sc-dkPtyc blMRzM" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Enter Amount" id="input_amount"></input>
                            <input class="sc-dkPtyc blMRzM" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Enter Amount" id="withdraw_amount"></input>
                            <button class="sc-dkPtyc blMRzM input_submit" scale="md" id="unstake_input_button" onClick={this.confirm_unstake}>Unstake</button>
                            <button class="sc-dkPtyc blMRzM input_submit" scale="md" id="stake_input_button" onClick={this.confirm_stake}>Stake</button>
                            <button class="sc-dkPtyc blMRzM input_submit" scale="md" id="claim_input_button" onClick={this.confirm_claim}>Claim Rewards</button>
                            <button class="sc-dkPtyc blMRzM input_submit" scale="md" id="claim_charity_input_button" onClick={this.confirm_charity_claim}>Claim Rewards</button>
                            <button class="sc-dkPtyc blMRzM input_submit" scale="md" id="withdraw_input_button" onClick={this.confirm_withdraw_donation}>Confirm Withdraw</button>
                            <div class="loading_icon_container">
                              <img class="loading_icon" src="loading.gif" width="50" />
                            </div>

                         </div>
                    </div>
                    <div class="sc-eCImvq sc-hmjpBu jKbcuz dLDrPl" id="popup_donate_presentation">
                         <div class="sc-jIkYaL hVETUG" id="donate_popup_heading_container">
                            <div class="sc-eCImvq sc-jRQAMF sc-ZOsLE hsMMVe bpzXao HTdit">
                               <div class="popup_title_container">
                                <h2 color="text" class="sc-gsDJrp sc-fKVsgm dzNkWZ jGwvJZ" id="popup_donate_input_title"></h2>
                               </div>
                               <div width="32" height="32" class="sc-bBHwJV gAlMva donate_popup">
                                <img draggable="false" src="ourplanet_logo.png" class="sc-iwjezw fEQOki" id="donate_charity_logo"></img>
                               </div>
                            </div>
                            <button class="sc-dkPtyc dPcdZs sc-hKwCoD cKBoHr" aria-label="Close the dialog" scale="md" onClick={this.close_dialog}>
                               <svg viewBox="0 0 24 24" color="primary" width="20px" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa dqTYWn">
                                  <path d="M18.3 5.70997C17.91 5.31997 17.28 5.31997 16.89 5.70997L12 10.59L7.10997 5.69997C6.71997 5.30997 6.08997 5.30997 5.69997 5.69997C5.30997 6.08997 5.30997 6.71997 5.69997 7.10997L10.59 12L5.69997 16.89C5.30997 17.28 5.30997 17.91 5.69997 18.3C6.08997 18.69 6.71997 18.69 7.10997 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.10997C18.68 6.72997 18.68 6.08997 18.3 5.70997Z"></path>
                               </svg>
                            </button>
                         </div>
                         <div class="sc-eCImvq sc-jRQAMF sc-jOxuqd bxcnZc bpzXao cVqNCr" id="initialize_donation_container">

                            <input class="sc-dkPtyc blMRzM" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="First name" id="donation_first_name"></input>
                            <input class="sc-dkPtyc blMRzM" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Last name" id="donation_last_name"></input>
                            <div id="anonymous_donation_container">
                                <input type="checkbox" id="anonymous_donation_input" name="anonymous_donation" onChange={this.anonymous_checked}></input>
                                <label id="anonymous_label" for="anonymous_donation">&nbsp; Anonymous Donation</label>
                            </div>
                                <select id="donation_currency_selector" onChange={this.donation_change_currency}>
                                    <option value="ETH" contract_address="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" mainnet_address="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2">ETH</option>
                                    <option value="UNI" contract_address="0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" mainnet_address="0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984">UNI</option>
                                    <option value="NINE" contract_address="0x6e40dd99E83AaD1b7B6F80c24CCBB8a1dC54c24D" mainnet_address="0xfF20817765cB7f73d4bde2e66e067E58D11095C2">NINE</option>
                                    <option value="USDC" contract_address="0x07865c6E87B9F70255377e024ace6630C1Eaa37F" mainnet_address="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48">USDC</option>
                                    <option value="OTHER" contract_address="">OTHER</option>
                                </select>
                            <div>
                                <div color="textSubtle" class="sc-gsDJrp kTGmuy" id="available_donation_input">Wallet Balance:</div>
                                <div color="textSubtle" class="sc-gsDJrp kTGmuy" id="available_donation_amount"><span id="available_donation_amount_num">0</span> <span id="donation_currency"></span><img id="donate_eth_logo" src="eth-logo.png"></img></div>
                            </div>
                            <input class="sc-dkPtyc blMRzM" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Enter Donation Amount" id="input_donate_amount"></input>
                            <div color="textSubtle" class="sc-gsDJrp kTGmuy" id="per_unit_price">~$<span id="per_unit_price_num">0</span>/<span id="selected_currency_for_price_calculation">ETH</span></div>
                            <div color="textSubtle" class="sc-gsDJrp kTGmuy" id="total_transaction_value">Total Value: ~$<span id="total_transaction_value_num">0</span></div>
                            <button class="sc-dkPtyc blMRzM" scale="md" id="donate_input_button" onClick={this.donate_continue_pressed}>Continue</button>
                            <p class="small_notice">*You will receive a receipt, linked to your wallet address, for tax and accounting purposes</p>
                         </div>
                         <div id="confirm_donation_container">
                            <div color="textSubtle" class="sc-gsDJrp kTGmuy">To:</div>
                            <p class="confirm_donation_info" id="receiving_organization_confirm">Receiving Organization</p>
                            <div color="textSubtle" class="sc-gsDJrp kTGmuy">From: </div>
                            <p class="confirm_donation_info" id="donor_confirm">Donor</p>
                            <div color="textSubtle" class="sc-gsDJrp kTGmuy">Amount:</div>
                            <p class="confirm_donation_info"  id="amount_confirm">Amount</p>
                            <div id="donate_confirm_button_container">
                              <button class="sc-dkPtyc blMRzM input_submiti" scale="md" id="donate_confirm_button" onClick={this.confirm_donation_pressed}>Confirm Payment</button> 
                            </div>
                            <div class="loading_icon_container">
                              <img class="loading_icon" src="loading.gif" width="50" />
                            </div>
                            <p class="small_notice" id="donation_identity_notice"></p>
                         </div>
                    </div>

                  </div>
              </div>
              <div class="sc-eGPWxh vdlOP">
                 <div></div>
              </div>
            </div>
      );
    }
  }
}

export default App;