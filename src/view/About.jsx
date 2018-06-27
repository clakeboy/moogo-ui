/**
 * Created by clakeboy on 2017/12/5.
 */
import React from 'react';
import {
    Link
} from 'react-router-dom';
import {
    Container,
    Input,
    InputGroup,
    Button,
    Card,
    CCheckbox,
    Checkbox,
    Table,
    Pagination,
    Dropdown,
    Select,
    Calendar,
} from '@clake/react-bootstrap4';

import {
    StringToByte,
    ByteToString
} from '../common/common';

class About extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        console.log("about mount");
    }

    render() {
        return (
            <Container>
                <h1>介绍</h1>
                <Link to="/">加主页</Link>
                <Card>
                    {StringToByte('clake')}
                </Card>
            </Container>
        );
    }
}

export default About;