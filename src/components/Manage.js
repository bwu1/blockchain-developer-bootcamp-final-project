import React, { Component } from 'react'
import { CountUp } from 'countup.js';
import dai from '../dai.png'
import Transaction from './Transaction'

class Manage extends Component {

add_charity_pressed = () =>{
  this.props.parent.add_charity_pressed();
}
add_stake_pressed = () =>{
  this.props.parent.add_stake_pressed(this.props.this_charity.id,this.props.this_charity.name);
}
sub_stake_pressed = () =>{
  this.props.parent.sub_stake_pressed(this.props.this_charity.id,this.props.this_charity.name);
}
details_pressed = () =>{
  this.props.parent.details_pressed(this.props.this_charity.id);
}
donate_pressed = () =>{
  this.props.parent.donate_pressed();
}
charity_rewards_help_pressed = () =>{
  this.props.parent.charity_rewards_help_pressed();
}
widget_button_help_pressed = () =>{

  var plug_in_widget_html='<a href="'+this.props.donate_button_url+'"><button style="align-items:center;border:0px;border-radius:16px;cursor:pointer;font-size:16px;font-weight:600;justify-content:center;letter-spacing:0.03em;line-height:1;height:48px;padding:0px 24px;background-color:rgb(31, 199, 212);color:white;">Donate</button></a>';
  this.props.parent.widget_button_help_pressed(plug_in_widget_html);

}
withdraw_help_pressed = () =>{

  this.props.parent.withdraw_help_pressed();

}
withdraw_to_bank_pressed = () =>{
  this.props.parent.withdraw_to_bank_pressed();
}
charity_claim_pressed = () =>{
  this.props.parent.set_charity_claim_global_variable(this.props.this_charity.uncollected_rewards);
  this.props.parent.charity_claim_pressed();
}
edit_charity_info_pressed = () =>{
  this.props.parent.edit_charity_info_pressed();
}
list_your_organization_pressed = () =>{
  this.props.parent.list_your_organization_pressed();
  }
click_donation_transaction = () =>{
  this.props.parent.click_donation_transaction();
}

  render() {

      var charity_id=this.props.this_charity.id;
      var charity_name=this.props.this_charity.name;
      var charity_ein=this.props.this_charity.ein;
      var charity_email=this.props.this_charity.email;
      var charity_description=this.props.this_charity.description;
      var charity_details=this.props.this_charity.details;
      var charity_logo="/logos/char_"+charity_id+".jpg";;
      var charity_url=this.props.this_charity.url;
      var charity_uncollected_rewards=this.props.this_charity.uncollected_rewards;
      var charity_vote_allocation=this.props.this_charity.vote_allocation;
      var us_tax_deduction=this.props.this_charity.us_tax_deduction;
      var received_donations=this.props.donation_records;
      var options = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'}; 
      let charity_button;
      let content = [];
      let widget_button_element;
      let withdraw_element;
      var donate_button_url;
      if(charity_id!=9999){
        /*widget_button_element=                
              <div height="fit-content" class="charity_widget_container" id="charity_widget_container_plug_in">
                   <div class="sc-hBURRC bCUoAf sc-eXlDFz eQxXJL">
                      <div class="sc-fotPbf lhuUPw">
                         <div class="sc-eCImvq sc-jRQAMF hsMMVe fevSJA">
                            <div class="sc-eCImvq sc-jRQAMF dcBPfY hghLuY" id="plug_in_widget_outer_container">
                               <div font-size="16px" color="textSubtle" class="sc-gsDJrp denOWz" id="plug_in_widget_container">Plug-In Button for Your Organization's Website</div>
                               <div class="sc-eCImvq hsMMVe" id="rewards_question">
                                  <svg viewBox="0 0 24 24" color="textSubtle" width="20px" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa clWehF" onClick={this.widget_button_help_pressed}>
                                     <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 16H13V18H11V16ZM12.61 6.04C10.55 5.74 8.73 7.01 8.18 8.83C8 9.41 8.44 10 9.05 10H9.25C9.66 10 9.99 9.71 10.13 9.33C10.45 8.44 11.4 7.83 12.43 8.05C13.38 8.25 14.08 9.18 14 10.15C13.9 11.49 12.38 11.78 11.55 13.03C11.55 13.04 11.54 13.04 11.54 13.05C11.53 13.07 11.52 13.08 11.51 13.1C11.42 13.25 11.33 13.42 11.26 13.6C11.25 13.63 11.23 13.65 11.22 13.68C11.21 13.7 11.21 13.72 11.2 13.75C11.08 14.09 11 14.5 11 15H13C13 14.58 13.11 14.23 13.28 13.93C13.3 13.9 13.31 13.87 13.33 13.84C13.41 13.7 13.51 13.57 13.61 13.45C13.62 13.44 13.63 13.42 13.64 13.41C13.74 13.29 13.85 13.18 13.97 13.07C14.93 12.16 16.23 11.42 15.96 9.51C15.72 7.77 14.35 6.3 12.61 6.04Z"></path>
                                  </svg>
                               </div>
                            </div>
                         </div>
                         <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc" id="widget_button_container">
                            <a href={this.props.donate_button_url} id="sample_widget_button_a"><button id="sample_widget_button">Pay</button></a>
                         </div>
                      </div>
                   </div>
                </div>
          */
          withdraw_element=  
              <div height="fit-content" class="sc-eCImvq sc-jRQAMF kNdXMN gNAkWY" class="charity_widget_container" id="charity_widget_container_withdraw">
                  <div class="sc-hBURRC bCUoAf sc-eXlDFz eQxXJL">
                      <div class="sc-fotPbf lhuUPw">
                          <div class="sc-eCImvq sc-jRQAMF hsMMVe fevSJA">
                              <div class="sc-eCImvq sc-jRQAMF dcBPfY hghLuY">
                                  <div font-size="16px" color="textSubtle" class="sc-gsDJrp denOWz">Available To Withdraw</div>
                                    <div class="sc-eCImvq hsMMVe" id="rewards_question">
                                      <svg viewBox="0 0 24 24" color="textSubtle" width="20px" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa clWehF" onClick={this.withdraw_help_pressed}>
                                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 16H13V18H11V16ZM12.61 6.04C10.55 5.74 8.73 7.01 8.18 8.83C8 9.41 8.44 10 9.05 10H9.25C9.66 10 9.99 9.71 10.13 9.33C10.45 8.44 11.4 7.83 12.43 8.05C13.38 8.25 14.08 9.18 14 10.15C13.9 11.49 12.38 11.78 11.55 13.03C11.55 13.04 11.54 13.04 11.54 13.05C11.53 13.07 11.52 13.08 11.51 13.1C11.42 13.25 11.33 13.42 11.26 13.6C11.25 13.63 11.23 13.65 11.22 13.68C11.21 13.7 11.21 13.72 11.2 13.75C11.08 14.09 11 14.5 11 15H13C13 14.58 13.11 14.23 13.28 13.93C13.3 13.9 13.31 13.87 13.33 13.84C13.41 13.7 13.51 13.57 13.61 13.45C13.62 13.44 13.63 13.42 13.64 13.41C13.74 13.29 13.85 13.18 13.97 13.07C14.93 12.16 16.23 11.42 15.96 9.51C15.72 7.77 14.35 6.3 12.61 6.04Z"></path>
                                      </svg>
                                    </div>
                              </div>
                          </div>
                          <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc">
                              <div class="sc-eCImvq sc-jRQAMF eRmSqP fevSJA">
                                  <h2 color="text" class="sc-gsDJrp sc-fKVsgm dzNkWZ jGwvJZ"><span>$</span><span id="withdraw_donation_num">0.00</span></h2>
                              </div>
                              <button class="sc-dkPtyc gXugwo" scale="sm"  id="withdraw_button" onClick={this.withdraw_to_bank_pressed}>Withdraw</button>
                            </div>
                        </div>
                    </div>
                </div>
      }
  
      for(var i = received_donations.length-1; i >= 0 ; i--){
          let sanitized_date = new Date(received_donations[i].date);
          sanitized_date=sanitized_date.toLocaleDateString("en-US", options);
          let sanitize_amount=this.props.parent.from_wei(received_donations[i].amount);



              let this_donation=
                <Transaction 
                    this_transaction={received_donations[i]}
                    parent = {this.props.parent}
                    display_type="1"
                />


           /* let this_donation=
              <div class="individual_donation" onClick={this.click_donation_transaction}>
                <p font-size="12px;" class="donor_name">{received_donations[i].first_name} {received_donations[i].last_name}</p>
                <p font-size="12px;" class="donation_time">{sanitized_date}</p><br></br>
                <p font-size="12px;" class="donation_amount">{sanitize_amount} {received_donations[i].currency}</p>
              </div>*/
            content.push(this_donation);
      }

      if(this.props.sample){
          return (
            <div id="add_charity_container_outer">
                <div class="sc-hBURRC bCUoAf sc-eFehXo jnBiej" id="add_charity_container">
                    <div class="sc-fFehDp sc-jlRMkV bLYZdl iPWJYN">
                        <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc">
                              <div  id="your_contributions_heading_container">
                                  <h2 color="body" class="sc-gsDJrp sc-fKVsgm ihSMbW nUOwN">List Your Business</h2>
                              </div>
                        </div>
                    </div>
                      <input class="sc-dkPtyc blMRzM add_charity" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Organization name" id="org_name"></input>
                       <input class="sc-dkPtyc blMRzM add_charity" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Category (Non-Profit, Consulting, Software Development)" id="org_industry"></input>
                        <textarea class="sc-dkPtyc blMRzM add_charity" type="text" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Details (Describe what your organization does in 300 characters or less)" id="org_details"></textarea>
                        <input class="sc-dkPtyc blMRzM add_charity" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Website (include: http://www)" id="org_website"></input>
                        <input class="sc-dkPtyc blMRzM add_charity" scale="md" inputmode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="Contact Email Address" id="org_email"></input>
                        <div id="tax_exemption_radio_div">
                           <input type="radio" id="org_tax_status_yes" name="org_tax_status" value="yes"></input><label for="male">501(c)(3)</label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <input type="radio" id="org_tax_status_no" name="org_tax_status" value="no"></input><label for="female">NOT 501(c)(3)</label>
                        </div>

                        <button class="sc-dkPtyc blMRzM" scale="md" id="add_charity_button" onClick={this.add_charity_pressed}>Create Merchant Page</button>
                        <p class="small_notice">*Each ETH wallet address can only have 1 associated business profile</p>

                </div>
            </div>
          );

        //charity_button=<button scale="md" class="sc-dkPtyc blMRzM stake_sub" onClick={this.list_your_organization_pressed}>List Your Campaign</button>;
        //us_tax_deduction="";
      }
      else{
        charity_button=<button scale="md" class="sc-dkPtyc blMRzM stake_sub" onClick={this.edit_charity_info_pressed}>Edit Info</button>;

        if(us_tax_deduction==1){
            us_tax_deduction="Tax Deductible 501(c)(3) Organization";
        }
        else{
            us_tax_deduction="";
        }


        return (
          <div>
              <div id="charity_left_side_panel">
                  <div class="sc-hBURRC bCUoAf sc-eFehXo jnBiej" id="your_charity_container">
                      <div class="sc-fFehDp sc-jlRMkV bLYZdl iPWJYN">
                          <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc">
                                <div class="sc-eCImvq sc-jRQAMF hsMMVe fevSJA">
                                    <h2 color="body" class="sc-gsDJrp sc-fKVsgm ihSMbW nUOwN">{charity_name}</h2>
                                    <div color="textSubtle" class="sc-gsDJrp eiLgCW">{charity_description}</div>
                                </div>
                                <div width="64" height="64" class="sc-bBHwJV gAlMva">
                                  <img draggable="false" src={charity_logo} class="sc-iwjezw fEQOki"></img>
                                </div>
                          </div>
                      </div>
                      <div class="sc-fotPbf lhuUPw">
                          <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc" id="charity_stake_container">
                              <div font-size="16px" color="text" class="sc-gsDJrp hnXWDG">Total Stake Received</div>
                              <div class="sc-eCImvq sc-jRQAMF hsMMVe hghLuY">
                                  <div color="text" font-size="16px" class="sc-gsDJrp fONxaw"><span class="stake_allocation" id="stake_allocation_manage_charity">0</span><img src="gold_coin2.png" class="gold_coin" draggable="false"></img></div>
                              </div>
                          </div>

                          <div class="sc-eCImvq sc-jRQAMF eBEmJR fevSJA">
                              <div class="charity_info_instructions_wrapper">
                                <div font-size="16px" color="text" class="sc-gsDJrp hnXWDG">Business Info</div>
                              </div>
                              <div>
                                <br></br><br></br>
                                <p>Contact Email: {charity_email}</p><br></br>
                                <p>Website: {charity_url}</p><br></br>
                                <p>{charity_details}</p><br></br>
                                <p>{us_tax_deduction}</p>
                                <br></br><br></br>
                              </div>
                              <div class="edit_charity">
                                  {charity_button}
                              </div>
                          </div>
                      </div>
                  </div>
                  {widget_button_element}
              </div>  
              <div id="charity_right_side_panel">
                  <div class="sc-hBURRC bCUoAf sc-eFehXo jnBiej" id="charity_transactions_container">
                      <div class="sc-fFehDp sc-jlRMkV bLYZdl iPWJYN">
                          <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc">
                                <div class="sc-eCImvq sc-jRQAMF hsMMVe fevSJA">
                                    <h2 color="body" class="sc-gsDJrp sc-fKVsgm ihSMbW nUOwN">Received Contributions</h2>
                                </div>
                          </div>
                      </div>
                      <div class="sc-fotPbf lhuUPw" id="received_donations_container">
                              {content}
                      </div> 
                  </div>
                  {withdraw_element}
                  <div height="fit-content" id="charity_rewards_container">
                     <div class="sc-hBURRC bCUoAf sc-eXlDFz eQxXJL">
                        <div class="sc-fotPbf lhuUPw">
                           <div class="sc-eCImvq sc-jRQAMF hsMMVe fevSJA">
                              <div class="sc-eCImvq sc-jRQAMF dcBPfY hghLuY">
                                 <div font-size="16px" color="textSubtle" class="sc-gsDJrp denOWz">Rewards</div>
                                 <div class="sc-eCImvq hsMMVe" id="rewards_question">
                                    <svg viewBox="0 0 24 24" color="textSubtle" width="20px" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa clWehF" onClick={this.charity_rewards_help_pressed}>
                                       <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 16H13V18H11V16ZM12.61 6.04C10.55 5.74 8.73 7.01 8.18 8.83C8 9.41 8.44 10 9.05 10H9.25C9.66 10 9.99 9.71 10.13 9.33C10.45 8.44 11.4 7.83 12.43 8.05C13.38 8.25 14.08 9.18 14 10.15C13.9 11.49 12.38 11.78 11.55 13.03C11.55 13.04 11.54 13.04 11.54 13.05C11.53 13.07 11.52 13.08 11.51 13.1C11.42 13.25 11.33 13.42 11.26 13.6C11.25 13.63 11.23 13.65 11.22 13.68C11.21 13.7 11.21 13.72 11.2 13.75C11.08 14.09 11 14.5 11 15H13C13 14.58 13.11 14.23 13.28 13.93C13.3 13.9 13.31 13.87 13.33 13.84C13.41 13.7 13.51 13.57 13.61 13.45C13.62 13.44 13.63 13.42 13.64 13.41C13.74 13.29 13.85 13.18 13.97 13.07C14.93 12.16 16.23 11.42 15.96 9.51C15.72 7.77 14.35 6.3 12.61 6.04Z"></path>
                                    </svg>
                                 </div>
                              </div>
                           </div>
                           <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc">
                              <div class="sc-eCImvq sc-jRQAMF eRmSqP fevSJA">
                                 <h2 color="text" class="sc-gsDJrp sc-fKVsgm dzNkWZ jGwvJZ" id="display_charity_reward_num">0</h2>
                                 <img src="gold_coin2.png" class="gold_coin" draggable="false"></img>
                                 
                              </div>
                              <button class="sc-dkPtyc gXugwo" scale="sm" onClick={this.charity_claim_pressed}>Claim</button>
                           </div>
                        </div>
                     </div>
                  </div>
              </div>




            </div>
        );
      }
  }
}

export default Manage;