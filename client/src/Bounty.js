import React, { Component } from "react";
import { Container, Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';

class Bounty extends Component {

    state = { resolution: "", error: null };

    handleChange = e => {
        this.setState({ resolution: e.target.value })
    };

    handleSubmit = e => {
        e.preventDefault();
        
        if (!this.state.resolution) {
            this.setState({ error: 'Please type description' })
            return;
        }

        this.props.onSubmissionAdd(this.state.resolution);
        this.setState({ resolution: "" });
    };

    render() {
        return (
            <Container>
                <Row>
                    <Col>
                        { this.props.bounty.desc }
                    </Col>
                </Row>
                <Row>
                    <Col>
                    <div className="bounty-reward">
                            <span className={ this.props.bounty.state === "1" ? "bounty-open" : "bounty-closed" }>
                                { this.props.bounty.reward }
                            </span>
                        </div>
                    </Col>
                </Row>
                {
                    this.props.bounty.submissionsList.map(x => (
                        <Container key={ x.id }>
                            <Row>
                                <Col>                                
                                    <p>{ x.resolution }</p>
                                </Col>
                            </Row>
                            <Row className={this.props.isPoster ? "show" : "hide"}>
                                <Col>
                                    <Button color="primary">Accept</Button>
                                    <Button color="danger">Reject</Button>
                                </Col>
                            </Row>
                        </Container>
                    ))
                }
                {
                    this.props.bounty.state != 1 ? null : (
                        <Form onSubmit={this.handleSubmit}>
                        <fieldset>
                            <legend>New Submission</legend>
                            <Container>
                                <Row>
                                    <Col>
                                        <FormGroup>
                                            <Label for="description">Description</Label>
                                            <Input type="textarea" id="description" value={this.state.resolution} onChange={this.handleChange} />
                                        </FormGroup>
                                    </Col>                                    
                                </Row>
                                <Row>
                                    <Col>
                                        <div className="alert alert-error">
                                            {this.state.error}
                                        </div>
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
                    )
                }
                <Row>
                    <Col>
                        <Button onClick={() => this.props.onClose() }>Back</Button>
                    </Col>
                </Row>
            </Container>      
        );
      }    
}

export default Bounty;