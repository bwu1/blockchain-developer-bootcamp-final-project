import React, { Component } from 'react'
import dai from '../dai.png'

class Transaction extends Component {

click_individual_transaction = (transaction_id) =>{
  if(this.props.display_type=="0"){
    this.props.parent.click_individual_transaction(this.props.this_transaction);
  }
  else{
    this.props.parent.click_donation_transaction(this.props.this_transaction);
  }

}


  render() {

      //console.log(this.props.this_transaction);
      var options = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'}; 
      let sanitized_date = new Date(this.props.this_transaction.date*1000);
      sanitized_date=sanitized_date.toLocaleDateString("en-US", options);

      let sanitize_amount=this.props.parent.from_wei_dynamic(this.props.this_transaction.amount,this.props.this_transaction.input_decimals);
      let org_name=this.props.this_transaction.org_name;
      let sanitized_currency=this.props.this_transaction.currency;
      if(sanitized_currency=="ETH"){
        sanitized_currency="ETH"//BNB
      }
      if(this.props.display_type=="0"){///view_transactions
        return (
          <div class="individual_donation" onClick={this.click_individual_transaction}>
            <p font-size="12px;" class="donation_time">{sanitized_date}</p><br></br>
            <p font-size="12px;" class="donor_recipient">{org_name}</p>
            <p font-size="12px;" class="donation_amount_donor">{sanitize_amount} {sanitized_currency}</p>
          </div>


        );
      }
      else{///manage_charity

        let sanitized_donor_address=this.props.this_transaction.donor_address.substring(0,4)+"..."+this.props.this_transaction.donor_address.substring(this.props.this_transaction.donor_address.length - 4);
        return (
          <div class="individual_donation" onClick={this.click_individual_transaction}>
            <p font-size="12px;" class="donation_time">{sanitized_date}</p><br></br>
            <p font-size="12px;" class="donor_recipient">{sanitized_donor_address}</p>
            <p font-size="12px;" class="donation_amount_donor">{sanitize_amount} {sanitized_currency}</p>
          </div>


        );
      }


  }
}

export default Transaction;