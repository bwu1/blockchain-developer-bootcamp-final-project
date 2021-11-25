import React, { Component } from 'react'
import dai from '../dai.png'

class Main extends Component {

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
  var charity_logo="./logos/char_"+this.props.this_charity.id+".jpg";
  this.props.parent.donate_pressed(this.props.this_charity.id, this.props.this_charity.name, this.props.this_charity.ein, charity_logo, this.props.this_charity.wallet_address);
}


  render() {

      var charity_id=this.props.this_charity.id;
      var charity_name=this.props.this_charity.name;
      var charity_ein_pre_sanitzed=this.props.this_charity.ein;
      var charity_ein=charity_ein_pre_sanitzed.substring(0, 2) + "-" + charity_ein_pre_sanitzed.substring(2);
      var charity_description=this.props.this_charity.description;
      var charity_details=this.props.this_charity.details;
      var condensed_details;
      if(charity_details.length>103){
          condensed_details=charity_details.substring(0,103) + "...";
      }
      else{
          condensed_details=charity_details;
      }
      var charity_logo="./logos/char_"+charity_id+".jpg";
      var charity_url=this.props.this_charity.url;

      var buttons_div=<div class="stake_donate_buttons">
                            <div class="mvp_hidden">
                                <button scale="md" class="sc-dkPtyc blMRzM stake_sub" onClick={this.sub_stake_pressed}>-</button>
                                <button class="sc-dkPtyc blMRzM stake_add" scale="md" onClick={this.add_stake_pressed}>+</button>
                            </div>
                            <button class="sc-dkPtyc blMRzM donate_button" scale="md" onClick={this.donate_pressed}>Donate</button>
                        </div>;
      if(this.props.this_charity.is_deleted==true){
          buttons_div=<div class="stake_donate_buttons">
                            <div class="mvp_hidden">
                                <button scale="md" class="sc-dkPtyc blMRzM stake_sub" onClick={this.sub_stake_pressed}>-</button>
                                <button class="sc-dkPtyc blMRzM stake_add" scale="md" disabled>+</button>
                            </div>
                            <button class="sc-dkPtyc blMRzM donate_button" scale="md" disabled>Inactive</button>
                        </div>;
      }

      return (
            <div class="sc-hBURRC bCUoAf sc-eFehXo jnBiej">
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

                        <div font-size="16px" color="text" class="sc-gsDJrp hnXWDG">{condensed_details}</div>

                    <div class="mvp_hidden">
                        <div class="sc-eCImvq sc-jRQAMF hsMMVe imyHkc">
                            <div font-size="16px" color="text" class="sc-gsDJrp hnXWDG">Your Stake:</div>
                            <div class="sc-eCImvq sc-jRQAMF hsMMVe hghLuY">
                                <div color="text" font-size="16px" class="sc-gsDJrp fONxaw"><span class="stake_allocation" charity_id={charity_id}>0</span><img src="gold_coin2.png" class="gold_coin" draggable="false"></img></div>
                            </div>
                        </div>
                    </div>
                    <div class="sc-eCImvq sc-jRQAMF eBEmJR fevSJA">
                        <div class="mvp_hidden">
                            <div font-size="12px" color="textSubtle" class="sc-gsDJrp kTGmuy stake">Stake to Earn</div>
                            <div font-size="12px" color="textSubtle" class="sc-gsDJrp kTGmuy donate">Direct Donation</div>
                        </div>
                        {buttons_div}
                    </div>
                </div>
                <div class="sc-bkkfTU bFzjZD">
                    <div class="sc-eCImvq sc-jRQAMF sc-lkgURy hsMMVe bpzXao bppiDU">
                        <button class="sc-dkPtyc dPcdZs" aria-label="Hide or show expandable content" scale="md" onClick={this.details_pressed} charity_detail_btn={charity_id}>
                          Details
                          <svg viewBox="0 0 24 24" color="primary" width="20px" xmlns="http://www.w3.org/2000/svg" class="sc-bdvvaa jqrBqL">
                              <path d="M8.11997 9.29006L12 13.1701L15.88 9.29006C16.27 8.90006 16.9 8.90006 17.29 9.29006C17.68 9.68006 17.68 10.3101 17.29 10.7001L12.7 15.2901C12.31 15.6801 11.68 15.6801 11.29 15.2901L6.69997 10.7001C6.30997 10.3101 6.30997 9.68006 6.69997 9.29006C7.08997 8.91006 7.72997 8.90006 8.11997 9.29006Z"></path>
                          </svg>
                        </button>

                    </div>
                     <div class="charity_detail_container"  charity_detail_id={charity_id}>
                          <p class="charity_detail">{charity_details}</p>
                          <div class="charity_url_container">
                            <a class="charity_url" target="_blank" href={charity_url}>Organization Website</a>
                          </div>
                      </div>
                </div>                      

              </div>
      );

  }
}

export default Main;


      //<div font-size="16px" color="text" class="sc-gsDJrp hnXWDG">EIN: {charity_ein}</div>


     /* <div id="content" className="mt-3">
        <table className="table table-borderless text-muted text-center">
          <thead>
            <tr>
              <th scope="col">Staking Balance</th>
              <th scope="col">Reward Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{window.web3.utils.fromWei(this.props.stakingBalance, 'Ether')} mDAI</td>
              <td>{window.web3.utils.fromWei(this.props.dappTokenBalance, 'Ether')} DAPP</td>
            </tr>
          </tbody>
        </table>

        <div className="card mb-4" >

          <div className="card-body">

            <form className="mb-3" onSubmit={(event) => {
                event.preventDefault()
                let amount
                amount = this.input.value.toString()
                amount = window.web3.utils.toWei(amount, 'Ether')
                this.props.stakeTokens(amount)
              }}>
              <div>
                <label className="float-left"><b>Stake Tokens</b></label>
                <span className="float-right text-muted">
                  Balance: {window.web3.utils.fromWei(this.props.daiTokenBalance, 'Ether')}
                </span>
              </div>
              <div className="input-group mb-4">
                <input
                  type="text"
                  ref={(input) => { this.input = input }}
                  className="form-control form-control-lg"
                  placeholder="0"
                  required />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <img src={dai} height='32' alt=""/>
                    &nbsp;&nbsp;&nbsp; mDAI
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg">STAKE!</button>
            </form>
            <button
              type="submit"
              className="btn btn-link btn-block btn-sm"
              onClick={(event) => {
                event.preventDefault()
                this.props.unstakeTokens()
              }}>
                UN-STAKE...
              </button>

          </div>
        </div> 


      </div>*/
