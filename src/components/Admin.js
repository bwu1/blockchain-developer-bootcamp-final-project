import React, { Component } from 'react'
import AdminCharity from './AdminCharity'
import dai from '../dai.png'

class Admin extends Component {

add_charity_pressed = () =>{
  this.props.parent.add_charity_pressed();
}
setTransferTaxPercent =() =>{
  let num=document.getElementById("setTransferTaxPercent_input").value;
  this.props.parent.setTransferTaxPercent(num);

}
setLPTaxPercent = () =>{
  let num=document.getElementById("setLPTaxPercent_input").value;
  this.props.parent.setLPTaxPercent(num);
}
setMaxTxPercent = () =>{
  let num=document.getElementById("setMaxTxPercent_input").value;
  this.props.parent.setMaxTxPercent(num);
}
setDonationFee = () =>{
  let num=document.getElementById("setDonationFee_input").value;
  this.props.parent.setDonationFee(num);
}
set_final_currency = () =>{///testnet BUSD - 0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47
  let final_currency=document.getElementById("final_currency_input").value;
  this.props.parent.set_final_currency(final_currency);
}
set_router_address = () =>{
  let router_address=document.getElementById("router_address_input").value;
  this.props.parent.set_router_address(router_address);
}
set_staking_reward_distribution_increment = () =>{
  let distribution_increment=document.getElementById("reward_distribution_increment_input").value;
  this.props.parent.set_staking_reward_distribution_increment(distribution_increment);
}
set_minimum_distribution_threshold = () =>{
  let min_distribution=document.getElementById("minimum_distribution_increment_input").value;
  this.props.parent.set_minimum_distribution_threshold(min_distribution);
}
set_reward_interval = () =>{
  let block_interval=document.getElementById("block_interval_input").value;
  this.props.parent.set_reward_interval(block_interval);
}

  render() {
    var charities_list=this.props.charities_list;

    let content = [];
    let gift_settings=[];
    let gift_settings_current=[];
    let donation_settings=[];
    let donation_settings_current=[];
    let staking_settings=[];
    let staking_settings_current=[];

    for(var i = charities_list.length-1; i >= 0 ; i--){
          let this_charity=
              <AdminCharity 
                  this_charity={charities_list[i]}
                  parent = {this.props.parent}
              />
          content.push(this_charity);
    }
//////////////////////////////////////////////////////////////////////////////////////////////////owner back-end setter functions
    let setTransferTaxPercent = <div class="owner_function_container">
      <p class="owner_function_label">Transfer Tax %: </p>
      <div class="owner_function_set">
          <input id="setTransferTaxPercent_input" placeholder="Enter Integer"></input>
          <button onClick={this.setTransferTaxPercent}>Set</button> 
      </div>
    </div>
    let setTransferTaxPercent_curr = <div class="owner_function_container">
      <p class="owner_function_label">Current Transfer Tax %: </p>
      <div class="owner_function_set">
          <p class="curr_settings" id="curr_transfer_tax"></p> 
      </div>
    </div>
    let setLPTaxPercent = <div class="owner_function_container">
      <p class="owner_function_label">LP Tax %: </p>
      <div class="owner_function_set">
          <input id="setLPTaxPercent_input" placeholder="Enter Integer"></input>
          <button onClick={this.setLPTaxPercent}>Set</button> 
      </div>
    </div>
    let setLPTaxPercent_curr = <div class="owner_function_container">
      <p class="owner_function_label">Current LP Tax %: </p>
      <div class="owner_function_set">
          <p class="curr_settings" id="curr_lp_tax"></p> 
      </div>
    </div>
    let setMaxTxPercent = <div class="owner_function_container">
      <p class="owner_function_label">Max Transaction %: </p>
      <div class="owner_function_set">
          <input id="setMaxTxPercent_input" placeholder="Enter Basis Points"></input>
          <button onClick={this.setMaxTxPercent}>Set</button> 
      </div>
    </div>
    let setMaxTxPercent_curr = <div class="owner_function_container">
      <p class="owner_function_label">Current Max Transaction %: </p>
      <div class="owner_function_set">
          <p class="curr_settings" id="curr_max_txn"></p> 
      </div>
    </div>
    gift_settings.push(setTransferTaxPercent);
    gift_settings.push(setLPTaxPercent);
    gift_settings.push(setMaxTxPercent);
    gift_settings_current.push(setTransferTaxPercent_curr);
    gift_settings_current.push(setLPTaxPercent_curr);
    gift_settings_current.push(setMaxTxPercent_curr);


    let setDonationFee = <div class="owner_function_container">
      <p class="owner_function_label">Donation Txn Fee %: </p>
      <div class="owner_function_set">
          <input id="setDonationFee_input" placeholder="Enter Basis Points"></input>
          <button onClick={this.setDonationFee}>Set</button> 
      </div>
    </div>
    let setDonationFee_curr = <div class="owner_function_container">
      <p class="owner_function_label">Current Donation Txn Fee %: </p>
      <div class="owner_function_set">
          <p class="curr_settings" id="curr_donation_fee"></p>  
      </div>
    </div>
    let set_final_currency = <div class="owner_function_container">
      <p class="owner_function_label">Final Conversion Currency: </p>
      <div class="owner_function_set">
          <input id="final_currency_input" placeholder="Enter Contract Address"></input>
          <button onClick={this.set_final_currency}>Set</button> 
      </div>
    </div>
    let set_final_currency_curr = <div class="owner_function_container">
      <p class="owner_function_label">Current Final Currency: </p>
      <div class="owner_function_set">
          <p class="curr_settings" id="curr_final_currency"></p>  
      </div>
    </div>
    let set_dex_router = <div class="owner_function_container">
      <p class="owner_function_label">Router Address: </p>
      <div class="owner_function_set">
          <input id="router_address_input" placeholder="Enter Contract Address"></input>
          <button onClick={this.set_router_address}>Set</button> 
      </div>
    </div>
    let set_dex_router_curr = <div class="owner_function_container">
      <p class="owner_function_label">Current Router Address: </p>
      <div class="owner_function_set">
          <p class="curr_settings" id="curr_router_address"></p>  
      </div>
    </div>



    donation_settings.push(setDonationFee);
    donation_settings.push(set_final_currency);
    donation_settings.push(set_dex_router);
    donation_settings_current.push(setDonationFee_curr);
    donation_settings_current.push(set_final_currency_curr);
    donation_settings_current.push(set_dex_router_curr);


    let set_staking_reward_distribution_increment = <div class="owner_function_container">
      <p class="owner_function_label">Reward Distribution Increment: </p>
      <div class="owner_function_set">
          <input id="reward_distribution_increment_input" placeholder="Enter Integer"></input>
          <button onClick={this.set_staking_reward_distribution_increment}>Set</button> 
      </div>
    </div>
    let set_staking_reward_distribution_increment_current = <div class="owner_function_container">
      <p class="owner_function_label">Current Reward Distribution Increment: </p>
      <div class="owner_function_set">
          <p class="curr_settings" id="curr_staking_reward_distribution_increment"></p>
      </div>
    </div>
    let set_minimum_distribution_threshold = <div class="owner_function_container">
      <p class="owner_function_label">Min. Reward To Distribute: </p>
      <div class="owner_function_set">
          <input id="minimum_distribution_increment_input" placeholder="Enter Integer"></input>
          <button onClick={this.set_minimum_distribution_threshold}>Set</button> 
      </div>
    </div>
    let set_minimum_distribution_threshold_current = <div class="owner_function_container">
      <p class="owner_function_label">Current Min. Reward To Distribute: </p>
      <div class="owner_function_set">
          <p class="curr_settings" id="curr_minimum_distribution_threshold"></p>
      </div>
    </div>
    let set_reward_interval = <div class="owner_function_container">
      <p class="owner_function_label">Reward Distribution Interval: </p>
      <div class="owner_function_set">
          <input id="block_interval_input" placeholder="Enter Seconds Interval"></input>
          <button onClick={this.set_reward_interval}>Set</button> 
      </div>
    </div>
    let set_reward_interval_current = <div class="owner_function_container">
      <p class="owner_function_label">Current Reward Distribution Interval: </p>
      <div class="owner_function_set">
          <p class="curr_settings" id="curr_reward_interval_current"></p>
      </div>
    </div>

    staking_settings.push(set_staking_reward_distribution_increment);
    staking_settings.push(set_minimum_distribution_threshold);
    staking_settings.push(set_reward_interval);
    staking_settings_current.push(set_staking_reward_distribution_increment_current);
    staking_settings_current.push(set_minimum_distribution_threshold_current);
    staking_settings_current.push(set_reward_interval_current);



    let owner_only_functions=[];
    if(this.props.is_owner){
        owner_only_functions=            
        <div id="owner_only_functions_outer">
            <div class="sc-hBURRC bCUoAf sc-eFehXo jnBiej" id="owner_only_functions">
                <div class="sc-fFehDp sc-jlRMkV bLYZdl iPWJYN">
                    <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc">
                          <div  id="your_contributions_heading_container">
                              <h2 color="body" class="sc-gsDJrp sc-fKVsgm ihSMbW nUOwN">Update Settings</h2>
                          </div>
                    </div>
                </div>
                <br></br>
                <h4 class="owner_function_heading">GIFT Token Settings</h4>
                {gift_settings}
                <h4 class="owner_function_heading">Donation Script Settings</h4>
                {donation_settings}
                <h4 class="owner_function_heading">Staking Script Settings</h4>
                {staking_settings}
            </div>
        </div>
    }


      return (
        <div>
            <div id="add_charity_container_outer">
                <div class="sc-hBURRC bCUoAf sc-eFehXo jnBiej" id="add_charity_container">
                    <div class="sc-fFehDp sc-jlRMkV bLYZdl iPWJYN">
                        <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc">
                              <div  id="your_contributions_heading_container">
                                  <h2 color="body" class="sc-gsDJrp sc-fKVsgm ihSMbW nUOwN">List Your Business</h2>
                              </div>
                        </div>
                    </div>
                    <br></br>
                      <input class="sc-dkPtyc blMRzM add_charity" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Organization name" id="org_name"></input><br></br>
                       <input class="sc-dkPtyc blMRzM add_charity" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Category (Non-Profit, Consulting, Software Development)" id="org_industry"></input><br></br>
                        <textarea class="sc-dkPtyc blMRzM add_charity" type="text" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Details (Describe what your organization does in 300 characters or less)" id="org_details"></textarea><br></br>
                        <input class="sc-dkPtyc blMRzM add_charity" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Website (include: http://www)" id="org_website"></input><br></br>
                        <input class="sc-dkPtyc blMRzM add_charity" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Contact Email Address" id="org_email"></input><br></br>
                        <div id="tax_exemption_radio_div">
                           <input type="radio" id="org_tax_status_yes" name="org_tax_status" value="yes"></input><label for="male">501(c)(3)</label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <input type="radio" id="org_tax_status_no" name="org_tax_status" value="no"></input><label for="female">NOT 501(c)(3)</label>
                        </div>

                        <button class="sc-dkPtyc blMRzM" scale="md" id="add_charity_button" onClick={this.add_charity_pressed}>Create Merchant Page</button>
                        <p class="small_notice">*Each ETH wallet address can only have 1 associated business profile</p>

                </div>
            </div>
            <div id="charities_overview_outer">
                <div class="sc-hBURRC bCUoAf sc-eFehXo jnBiej" id="charities_overview">
                    <div class="sc-fFehDp sc-jlRMkV bLYZdl iPWJYN">
                        <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc">
                              <div  id="your_contributions_heading_container">
                                  <h2 color="body" class="sc-gsDJrp sc-fKVsgm ihSMbW nUOwN">Existing Charities</h2>
                              </div>
                        </div>
                    </div>
                    <br></br>
                    {content}
                </div>
            </div>
            {owner_only_functions}
            <div id="current_owner_settings_outer">
                <div class="sc-hBURRC bCUoAf sc-eFehXo jnBiej" id="current_owner_settings">
                    <div class="sc-fFehDp sc-jlRMkV bLYZdl iPWJYN">
                        <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc">
                              <div  id="your_contributions_heading_container">
                                  <h2 color="body" class="sc-gsDJrp sc-fKVsgm ihSMbW nUOwN">Current Settings</h2>
                              </div>
                        </div>
                    </div>
                    <br></br>
                    <h4 class="owner_function_heading">GIFT Token Settings</h4>
                    {gift_settings_current}
                    <h4 class="owner_function_heading">Donation Script Settings</h4>
                    {donation_settings_current}
                    <h4 class="owner_function_heading">Staking Script Settings</h4>
                    {staking_settings_current}
                </div>
            </div>
          </div>



      );

  }
}

export default Admin;
/*

  <input class="sc-dkPtyc blMRzM add_charity" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Organization EIN" id="org_ein"></input><br></br>
  <input class="sc-dkPtyc blMRzM add_charity" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Wallet Address" id="org_wallet"></input><br></br>
*/