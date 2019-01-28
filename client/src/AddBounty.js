import React, { Component } from "react";
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';

class AddBounty extends Component {
    state = { desc: "", reward: 0, error: null };

    handleDescChange = e => {
        this.setState({ desc: e.target.value })
    };

    handleRewardChange = e => {
        this.setState({ reward: e.target.value })
    };

    handleSubmit = e => {
        e.preventDefault();
        
        if (!this.state.desc || !this.state.reward) {
            this.setState({ error: 'Please type desc. and reward' })
            return;
        }

        this.props.onAdd(this.state.desc, this.state.reward);
        this.setState({ desc: "", reward: 0 });
    };

    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <fieldset>
                    <legend>New Bounty</legend>
                    <Container>
                        <Row>
                            <Col xs="9">
                                <FormGroup>
                                    <Label for="description">Description</Label>
                                    <Input type="textarea" id="description" value={this.state.desc} onChange={this.handleDescChange} />
                                </FormGroup>
                            </Col>
                            <Col>
                                <FormGroup>
                                    <Label for="reward">Reward</Label>
                                    <Input type="numeric" id="reward" value={this.state.reward} onChange={this.handleRewardChange} />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                {
                                    !this.state.error ? null :
                                    (
                                        <Alert color="danger">
                                            { this.state.error }
                                        </Alert>
                                    )        
                                }                              
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Button size="lg">Add</Button>
                            </Col>
                        </Row>
                    </Container>
                </fieldset>
            </Form>
        );
    }
}

export default AddBounty;