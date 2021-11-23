import React, { Component } from 'react'
import dai from '../dai.png'

class AdminCharity extends Component {


deactivate_charity = () =>{

  var confirm=window.confirm("Are you sure you want to deactivate this charity?");
  
  if(confirm===true){
    this.props.parent.activate_deactivate_charity(this.props.this_charity.wallet_address,0);
  }
}
reactivate_charity = () =>{
  var confirm=window.confirm("Reactivate this charity?");
  if(confirm===true){
    this.props.parent.activate_deactivate_charity(this.props.this_charity.wallet_address,1);
  }
}

  render() {


          if(this.props.this_charity.is_deleted==true){
            return (
                <div class="admin_individual_charity">
                    <p font-size="12px;" class="admin_charity_address">{this.props.this_charity.wallet_address}</p>
                    <button class="deactivate_charity" onClick={this.reactivate_charity}>Reactivate</button><br></br>
                    <p font-size="12px;" class="admin_charity_name">{this.props.this_charity.name}</p>
                    <p font-size="12px;" class="admin_charity_deactivated">Deactivated</p>
                </div>
            );
          }
          else{
            return (
                <div class="admin_individual_charity">
                    <p font-size="12px;" class="admin_charity_address">{this.props.this_charity.wallet_address}</p>
                    <button class="deactivate_charity" onClick={this.deactivate_charity}>Deactivate</button><br></br>
                    <p font-size="12px;" class="admin_charity_name">{this.props.this_charity.name}</p>
                    <p font-size="12px;" class="admin_charity_activated">Active</p>
                </div>
              );

          }






  }
}

export default AdminCharity;