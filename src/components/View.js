import React, { Component } from 'react'
import Transaction from './Transaction'
import dai from '../dai.png'

class View extends Component {

click_individual_transaction = (transaction_id) =>{
  var this_transaction=this.props.transaction_history;
  console.log(this_transaction);
  this.props.parent.click_individual_transaction();
}


  render() {

      var transaction_history=this.props.transaction_history;

      let content = [];
  
      for(var i = transaction_history.length-1; i >= 0 ; i--){


          let this_donation=
              <Transaction 
                  this_transaction={transaction_history[i]}
                  parent = {this.props.parent}
                  display_type="0"
              />
          content.push(this_donation);
      }

      return (
        <div>
            <div id="transaction_history_container_outer">
                <div class="sc-hBURRC bCUoAf sc-eFehXo jnBiej" id="transaction_history_container">
                    <div class="sc-fFehDp sc-jlRMkV bLYZdl iPWJYN">
                        <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc">
                              <div  id="your_contributions_heading_container">
                                  <h2 color="body" class="sc-gsDJrp sc-fKVsgm ihSMbW nUOwN">Your Contributions</h2>
                              </div>
                        </div>
                    </div>
                    <div class="sc-fotPbf lhuUPw" id="received_donations_container">
                            {content}
                    </div> 
                </div>
            </div>
          </div>


      );

  }
}

export default View;