import React, { Component } from 'react'
import { CountUp } from 'countup.js';
import dai from '../dai.png'

class Manage extends Component {

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


  render() {

      var charity_id=this.props.this_charity.id;
      var charity_name=this.props.this_charity.name;
      var charity_description=this.props.this_charity.description;
      var charity_details=this.props.this_charity.details;
      var charity_logo=this.props.this_charity.logo;
      var charity_url=this.props.this_charity.url;
      var charity_uncollected_rewards=this.props.this_charity.uncollected_rewards;
      var charity_vote_allocation=this.props.this_charity.vote_allocation;
      var us_tax_deduction=this.props.this_charity.us_tax_deduction;
      var received_donations=this.props.donation_records;
      var options = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'}; 



      let content = [];
  
      for(var i = 0; i < received_donations.length; i++){
          let sanitized_date = new Date(received_donations[i].date);
          sanitized_date=sanitized_date.toLocaleDateString("en-US", options);
          let sanitize_amount=this.props.parent.from_wei(received_donations[i].amount);

            let this_donation=
              <div class="individual_donation">
                <p font-size="12px;" class="donor_name">{received_donations[i].first_name} {received_donations[i].last_name}</p>
                <p font-size="12px;" class="donation_time">{sanitized_date}</p><br></br>
                <p font-size="12px;" class="donation_amount">{sanitize_amount} {received_donations[i].currency}</p>
              </div>
            content.push(this_donation);
      }



      if(us_tax_deduction){
          us_tax_deduction="Tax Deductible"
      }
      else{
          us_tax_deduction="Not Tax Deductible";

      }


      return (
        <div>
            <div class="sc-hBURRC bCUoAf sc-eFehXo jnBiej" id="your_charity_container">
                <div class="sc-fFehDp sc-jlRMkV bLYZdl iPWJYN">
                    <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc">
                          <div class="sc-eCImvq sc-jRQAMF hsMMVe fevSJA">
                              <h2 color="body" class="sc-gsDJrp sc-fKVsgm ihSMbW nUOwN">{charity_name}</h2>
                              <div color="textSubtle" class="sc-gsDJrp eiLgCW">{charity_description}</div>
                          </div>
                          <div width="64" height="64" class="sc-bBHwJV gAlMva">
                            <img draggable="false" src={charity_logo} alt="CAKE" class="sc-iwjezw fEQOki"></img>
                          </div>
                    </div>
                </div>
                <div class="sc-fotPbf lhuUPw">
                    <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc">
                        <div font-size="16px" color="text" class="sc-gsDJrp hnXWDG">Total Stake Received</div>
                        <div class="sc-eCImvq sc-jRQAMF hsMMVe hghLuY">
                            <div color="text" font-size="16px" class="sc-gsDJrp fONxaw"><span class="stake_allocation" id="stake_allocation_manage_charity">0</span><img src="gold_coin2.png" class="gold_coin" draggable="false"></img></div>
                        </div>
                    </div>
                    <div class="sc-eCImvq sc-jRQAMF eBEmJR fevSJA">
                        <br></br><br></br>
                        <div class="charity_info_instructions_wrapper">
                          <div font-size="16px" color="text" class="sc-gsDJrp hnXWDG">Organization Info</div>
                        </div>
                        <div>
                          <br></br><br></br>
                          <p>{charity_url}</p><br></br>
                          <p>{charity_details}</p><br></br>
                          <p>{us_tax_deduction}</p>
                          <br></br><br></br>
                        </div>
                        <div class="edit_charity">
                            <button scale="md" class="sc-dkPtyc blMRzM stake_sub" onClick={this.sub_stake_pressed}>Edit Info</button>
                        </div>
                    </div>
                </div>                     

            </div>
            <div class="sc-hBURRC bCUoAf sc-eFehXo jnBiej" id="charity_transactions_container">
                <div class="sc-fFehDp sc-jlRMkV bLYZdl iPWJYN">
                    <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc">
                          <div class="sc-eCImvq sc-jRQAMF hsMMVe fevSJA">
                              <h2 color="body" class="sc-gsDJrp sc-fKVsgm ihSMbW nUOwN">Received Donations</h2>
                          </div>
                    </div>
                </div>
                <div class="sc-fotPbf lhuUPw" id="received_donations_container">
                        {content}
                </div>                     

            </div>
          </div>


      );

  }
}

export default Manage;