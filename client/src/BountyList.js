import React, { Component } from "react";

class BountyList extends Component {
    render() {
        return (
            <div className="Bounty-List">
            {
                this.props.list.map(bounty => (
                    <div key={ bounty.id } className="bounty-container">
                        <div className="bounty-display">
                            <span>{ bounty.desc }</span> 
                        </div>
                        <div className="bounty-reward">
                            <span className={ bounty.state === "1" ? "bounty-open" : "bounty-closed" }>{ bounty.reward }</span>
                        </div>                            
                    </div>
                ))
            }
            </div>          
        );
      }    
}

export default BountyList;