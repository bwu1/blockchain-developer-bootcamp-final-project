import React, { Component } from 'react'
import farmer from '../farmer.png'

class Navbar extends Component {

home_pressed = () =>{
  this.props.parent.home_pressed();
}
manage_charity_pressed = () =>{
  this.props.parent.manage_charity_pressed();
}
view_transactions_pressed = () =>{
  this.props.parent.view_transactions_pressed();
}
admin_page_pressed = () =>{
  this.props.parent.admin_page_pressed();
}


  render() {
    return (
          <div class="sc-ctqRej hHfLsz">
            <div class="sc-fbyett dyrGrG">
              <div class="sc-cZMLWB bvEUIR" role="button">
                 <a  onClick={this.home_pressed}>
                    <svg viewBox="0 0 24 24" width="24px" color="text" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa jSumoG">
                       <path d="M9.99998 19V14H14V19C14 19.55 14.45 20 15 20H18C18.55 20 19 19.55 19 19V12H20.7C21.16 12 21.38 11.43 21.03 11.13L12.67 3.59997C12.29 3.25997 11.71 3.25997 11.33 3.59997L2.96998 11.13C2.62998 11.43 2.83998 12 3.29998 12H4.99998V19C4.99998 19.55 5.44998 20 5.99998 20H8.99998C9.54998 20 9.99998 19.55 9.99998 19Z"></path>
                    </svg>
                    <div class="sc-dtMiey icCDgB">Browse</div>
                 </a>
              </div>
              <div class="sc-cZMLWB bvEUIR" role="button">
                 <a onClick={this.manage_charity_pressed}>
                    <svg viewBox="0 0 24 24" width="24px" color="text" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa jSumoG">
                      <path d="M5 7C5 6.44772 4.55228 6 4 6C3.44772 6 3 6.44772 3 7V18C3 19.1046 3.89543 20 5 20H20C20.5523 20 21 19.5523 21 19C21 18.4477 20.5523 18 20 18H5V7Z"></path>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M19 17H7C6.44772 17 6 16.5523 6 16V12C6 11.4477 6.44772 11 7 11H10V10C10 9.44772 10.4477 9 11 9H14V7C14 6.44772 14.4477 6 15 6H19C19.5523 6 20 6.44772 20 7V16C20 16.5523 19.5523 17 19 17ZM16 8H18V15H16V8ZM12 15H14V11H12V15ZM10 13H8V15H10V13Z"></path>                       
                    </svg>
                    <div class="sc-dtMiey icCDgB">Your Business</div>
                 </a>
              </div>
              <div class="sc-cZMLWB bvEUIR" role="button">
                 <a onClick={this.view_transactions_pressed}>
                    <svg viewBox="0 0 24 24" width="24px" color="text" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa jSumoG">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M18.86 4.86003L21.65 7.65003C21.84 7.84003 21.84 8.16003 21.64 8.35003L18.85 11.14C18.54 11.46 18 11.24 18 10.79V9.00003H4C3.45 9.00003 3 8.55003 3 8.00003C3 7.45003 3.45 7.00003 4 7.00003H18V5.21003C18 4.76003 18.54 4.54003 18.86 4.86003ZM5.14001 19.14L2.35001 16.35C2.16001 16.16 2.16001 15.84 2.36001 15.65L5.15001 12.86C5.46001 12.54 6.00001 12.76 6.00001 13.21V15H20C20.55 15 21 15.45 21 16C21 16.55 20.55 17 20 17H6.00001V18.79C6.00001 19.24 5.46001 19.46 5.14001 19.14Z"></path>
                    </svg>
                    <div class="sc-dtMiey icCDgB">Your Transactions</div>
                 </a>
              </div>
            </div>
          </div>
    );
  }
}

export default Navbar;
