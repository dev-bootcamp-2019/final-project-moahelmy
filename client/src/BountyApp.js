import React, { Component } from "react";
import BountyNestContract from "./contracts/BountyNest.json";
import BountyList from "./BountyList";
import AddBounty from "./AddBounty";
import Bounty from "./Bounty";
import { Container, Row, Col, Alert } from 'reactstrap';
import getWeb3 from "./utils/getWeb3";

import "./App.css";
import { debug } from "util";

class App extends Component {
    eth = { web3: null, accounts: null, contract: null };
    state = { ready: false, accounts: null, bountyList: [], selected: null, bountiesCount: 0, error: null };

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
            this.setState({ ready: true, accounts: accounts }, this.readBounties)
        } catch (error) {
            // Catch any errors for any of the above operations.
            this.setState({
                error: `Failed to load web3, accounts, or contract. Check console for details.`
            });
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
                bounty.submissions = bounty.submissions || [];
                bounties.push(bounty);
            }

            this.setState({ bountiesCount: count, bountyList: bounties });
        }
        catch (error) {
            // Catch any errors for any of the above operations.
            this.setState({ error: `Failed to load bounties.`})
            console.error(error);
        }
    };

    handleSubmit = async e => {
        e.preventDefault();
        const desc = e.target["description"].value;
        const reward = e.target["reward"].value;

        if(!desc || !reward) return;        
        await this.addNew(desc, reward);
    };

    handleSelection = async id => {
        console.log(id);
        await this.fetchSubmissions(id - 1);
    };

    addNew = async (desc, reward) => {
        try {
            const { contract } = this.eth;
            const { accounts, bountiesCount: count } = this.state;            
            await contract.methods.add(desc, reward).send({ from: accounts[0], value: reward + 10, gas: 1000000, gasLimit: 1000000 });            
            this.setState({ bountiesCount: count + 1 }, this.readBounties);
        } 
        catch(error) {
            // Catch any errors for any of the above operations.
            this.setState({ error: `Failed to add bounty.`})
            console.error(error);
        }
    };

    fetchSubmissions = async (index) => {
        try {
            const { contract } = this.eth;
            const bounty = this.state.bountyList[index];
            if(bounty.submissionsList) {
                this.setState({ selected: bounty });
                return;
            }            
            // fetch all bounties
            bounty.submissionsList = [];
            for (let i = 0; i < bounty.submissions.length; i++) {                
                const submission = await contract.methods.fetchSubmission(bounty.submissions[i]).call();
                submission.id = bounty.submissions[i];                
                bounty.submissionsList.push(submission);
            }
            this.setState({ selected: bounty });
        }
        catch(error) {
            // Catch any errors for any of the above operations.
            this.setState({ error: `Failed to retreive submissions.`})
            console.error(error);
        }
    }

    addSubmission = async (desc) => {
        try {            
            const { contract } = this.eth;
            const { selected, accounts } = this.state;
            const response = await contract.methods.submit(selected.id, desc).send({ from: accounts[0], gas: 1000000, gasLimit: 1000000 });
            console.log(response);            
            const id = response.events.SubmissionAdded.returnValues.submissionId;
            selected.submissions.push(id);
            const submission = await contract.methods.fetchSubmission(id).call();
            submission.id = id;
            selected.submissionsList.push(submission);            
            this.setState({ selected: selected });
        } 
        catch(error) {
            // Catch any errors for any of the above operations.
            this.setState({ error: `Failed to add submission.`})
            console.error(error);
        }
    }

    accept = async (index) => {
        try {            
            const { contract } = this.eth;
            const { selected, accounts } = this.state;
            const response = await contract.methods.accept(selected.submissions[index]).send({ from: accounts[0], gas: 1000000, gasLimit: 1000000 });
            console.log(response);
            selected.submissionsList[index].state = 2;
            this.setState({ selected: selected });
        } 
        catch(error) {
            // Catch any errors for any of the above operations.
            this.setState({ error: `Failed to accept submission.`})
            console.error(error);
        }
    };

    reject = async (index) => {
        try {
            const { contract } = this.eth;
            const { selected, accounts } = this.state;
            const response = await contract.methods.reject(selected.submissions[index]).send({ from: accounts[0], gas: 1000000, gasLimit: 1000000 });            
            console.log(response);
            selected.submissionsList[index].state = 3;
            this.setState({ selected: selected });
        } 
        catch(error) {
            // Catch any errors for any of the above operations.
            this.setState({ error: `Failed to accept submission.`})
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
                        <Alert color={!!this.state.error ? "danger" : "light"}>
                            { this.state.error }
                        </Alert>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <AddBounty onAdd={(d, r) => this.addNew(d, r) }></AddBounty>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {
                            !!this.state.selected ? 
                            (
                                <fieldset>
                                    <legend>Bounty {this.state.selected.id} Selected</legend>
                                    <Bounty bounty={this.state.selected} 
                                            isPoster={this.state.selected.poster === this.state.accounts[0]}
                                            onSubmissionAdd={desc => this.addSubmission(desc)}
                                            onAccept={i => this.accept(i)}
                                            onReject={i => this.reject(i)}
                                            onClose={() => this.setState({selected: null }) }>
                                    </Bounty>
                                </fieldset>
                            ) : 
                            (
                                <fieldset>
                                    <legend>List of Bounties ({this.state.bountiesCount})</legend>
                                    <BountyList list={this.state.bountyList} 
                                                onSelect={ id => this.handleSelection(id)}>
                                    </BountyList>
                                </fieldset>
                            )
                        }                        
                    </Col>
                </Row>
                <div className="avbar navbar-default navbar-fixed-bottom">
                    <div className="container account">
                        <b>Logged: </b>{ this.state.accounts[0] }
                    </div>
                </div>
            </Container>
        );
    }
}

export default App;