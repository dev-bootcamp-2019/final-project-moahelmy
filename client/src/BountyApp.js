import React, { Component } from "react";
import BountyNestContract from "./contracts/BountyNest.json";
import BountyList from "./BountyList";
import { Container, Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import getWeb3 from "./utils/getWeb3";

import "./App.css";

class App extends Component {
    eth = { web3: null, accounts: null, contract: null };
    state = { ready: false, loggedAccount: null, bountyList: [], bountiesCount: 0 };

    componentDidMount = async () => {
        try {
            // Get network provider and web3 instance.
            const web3 = await getWeb3();

            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();

            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = BountyNestContract.networks[networkId];
            const instance = new web3.eth.Contract(
                BountyNestContract.abi,
                deployedNetwork && deployedNetwork.address,
            );

            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            this.eth = { web3, accounts, contract: instance };
            this.setState({ ready: true, loggedAccount: accounts[0] }, this.readBounties)
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    readBounties = async () => {
        try {
            const { contract } = this.eth;

            const count = await contract.methods.bountiesCount().call();

            // fetch all bounties
            let bounties = [];
            for (let i = 1; i <= count; i++) {
                const bounty = await contract.methods.fetchBounty(i).call();                
                bounty.id = i;
                bounties.push(bounty);
            }

            this.setState({ bountiesCount: count, bountyList: bounties });
        }
        catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load bounties.`,
            );
            console.error(error);
        }
    };

    handleSubmit = async e => {
        e.preventDefault();
        const desc = e.target["description"].value;
        const reward = e.target["reward"].value;

        await this.addNew(desc, reward);
    };

    addNew = async (desc, reward) => {
        try {
            const { contract, accounts } = this.eth;            
            const { count } = this.state;
            const response = await contract.methods.add(desc, reward).send({ from: accounts[0], value: reward + 10, gas: 1000000, gasLimit: 1000000 });
            console.log(response);
            this.setState({ bountiesCount: count + 1 }, this.readBounties);
        } 
        catch(error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to add bounty.`,
            );
            console.error(error);
        }
    };

    render() {
        if (!this.state.ready) {
            return <div>Loading Web3, accounts, and contract...</div>;
        }
        return (
            <Container>                
                <div className="App-header">
                    <h1>Bounties Nest</h1>
                </div>
                <Row>
                    <Col>
                        <Form onSubmit={this.handleSubmit}>
                            <fieldset>
                                <legend>New Bounty</legend>
                                <Row>
                                    <Col xs="9">
                                        <FormGroup>
                                            <Label for="description">Description</Label>
                                            <Input type="textarea" id="description"></Input>
                                        </FormGroup>
                                    </Col>
                                    <Col>
                                        <FormGroup>
                                            <Label for="reward">Reward</Label>
                                            <Input type="numeric" id="reward" ></Input>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Button size="lg">Add</Button>
                                    </Col>
                                </Row>
                            </fieldset>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <fieldset>
                            <legend>List of Bounties ({this.state.bountiesCount})</legend>
                            <BountyList list={this.state.bountyList}></BountyList>
                        </fieldset>
                    </Col>                    
                </Row>
                <div className="avbar navbar-default navbar-fixed-bottom">
                    <div className="container account">
                        <b>Logged: </b>{ this.state.loggedAccount }
                    </div>
                </div>
            </Container>
        );
    }
}

export default App;